/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       29 Aug 2017     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{
	//=============================================================================================
	//=============================================================================================
	//Start of main code
	//=============================================================================================
	//=============================================================================================
	//

	//Get the parameters
	//
	var context = nlapiGetContext();
	var parameters = context.getSetting('SCRIPT', 'custscript_bbs_avgcost_params');
	var usersEmail = context.getUser();
	var parameterObject = JSON.parse(parameters);
	
	var subsidiaryParam = parameterObject['subsidiary'];
	var locationParam = parameterObject['location'];
	var accountParam = parameterObject['account'];

	//Search for inventory items
	//
	var itemSearch = nlapiCreateSearch("item",
			[
			   ["locationaveragecost","isempty",""], 
			   "AND", 
			   ["inventorylocation","anyof",locationParam],
			   "AND",
			   ["ispreferredvendor","is","T"],
			   "AND",
			   ["type","anyof","InvtPart"],
			   "AND", 
   			   ["vendor.subsidiary","anyof",subsidiaryParam]
			], 
			[
			   new nlobjSearchColumn("itemid",null,null).setSort(false), 
			   new nlobjSearchColumn("displayname",null,null), 
			   new nlobjSearchColumn("salesdescription",null,null), 
			   new nlobjSearchColumn("type",null,null), 
			   new nlobjSearchColumn("baseprice",null,null), 
			   new nlobjSearchColumn("inventorylocation",null,null), 
			   new nlobjSearchColumn("vendor",null,null), 
			   new nlobjSearchColumn("vendorcost",null,null),
			   new nlobjSearchColumn("custitem_bbs_item_cost",null,null),
			   new nlobjSearchColumn("custitem_bbs_item_ave_cost",null,null),
			   new nlobjSearchColumn("custitem_bbs_item_application_cost",null,null)
			]
			);

	//Get all the results from the search (i.e. > 1000 lines)
	//
	var itemSearchResult = getResults(itemSearch);
	
	if(itemSearchResult)
		{
			var counter = Number(0);
			
			for (var int = 0; int < itemSearchResult.length; int++) 
				{
					if(counter % 50)
						{
							checkResources();
						}
					
					var itemId = itemSearchResult[int].getId();
					var itemVendorCost = Number(itemSearchResult[int].getValue('vendorcost'));
					var itemAverageCost = Number(itemSearchResult[int].getValue('custitem_bbs_item_ave_cost'));
					
					itemAverageCost = (isNaN(itemAverageCost) ? 0 : itemAverageCost);
					itemVendorCost = (isNaN(itemVendorCost) ? 0 : itemVendorCost);
					
					var selectedCost = Number(0);
					
					if(itemAverageCost != 0)
						{
							selectedCost = itemAverageCost;
						}
					else
						{
							selectedCost = itemVendorCost;
						}

					var itemRecord = nlapiLoadRecord('inventoryitem', itemId);
					
					if(itemRecord)
					{
						var binCount = itemRecord.getLineItemCount('binnumber');
						
						var binId = '';
						
						for (var int2 = 1; int2 <= binCount; int2++) 
							{
								var binLocation = itemRecord.getLineItemValue('binnumber', 'location', int2);
								var binNumber = itemRecord.getLineItemValue('binnumber', 'binnumber', int2);
								var binActive = itemRecord.getLineItemValue('binnumber', 'locationactive', int2);
								var binPreferred = itemRecord.getLineItemValue('binnumber', 'preferredbin', int2);
								
								if(binLocation == locationParam && binActive == 'Yes' && binPreferred == 'T')
									{
										binId = binNumber;
										break;
									}
							}
							
							stockAdjust(itemId, 'IN', locationParam, accountParam, selectedCost, subsidiaryParam, binId);
							stockAdjust(itemId, 'OUT', locationParam, accountParam, selectedCost, subsidiaryParam, binId);

						}
					
					counter++;
				}
		}

	//Send the email to the user to say that we have finished
	//
	nlapiSendEmail(usersEmail, usersEmail, 'Average Cost Update', 'The average cost update has completed');
}

//=============================================================================================
//=============================================================================================
//Functions
//=============================================================================================
//=============================================================================================
//
function getResults(grSearch)
{
	var searchResult = grSearch.runSearch();
	
	//Get the initial set of results
	//
	var start = 0;
	var end = 1000;
	var searchResultSet = searchResult.getResults(start, end);
	var resultlen = searchResultSet.length;

	//If there is more than 1000 results, page through them
	//
	while (resultlen == 1000) 
		{
			checkResources();
		
			start += 1000;
			end += 1000;

			var moreSearchResultSet = searchResult.getResults(start, end);
			resultlen = moreSearchResultSet.length;

			searchResultSet = searchResultSet.concat(moreSearchResultSet);
		}
	
	return searchResultSet;
}

function checkResources()
{
	var remaining = parseInt(nlapiGetContext().getRemainingUsage());
	
	if(remaining < 500)
		{
			nlapiYieldScript();
		}
}

function stockAdjust(itemId, direction, locationId, accountId, costPrice, subsidId, binNumber)
{
	//Create a stock adjustment for the item
	//
	var invAdjRecord = nlapiCreateRecord('inventoryadjustment', {recordmode: 'dynamic'});
										
	invAdjRecord.setFieldValue('subsidiary', subsidId);
	invAdjRecord.setFieldValue('account', accountId);
	invAdjRecord.setFieldValue('adjlocation', locationId);
										
	//sublist is 'inventory'
	invAdjRecord.selectNewLineItem('inventory');
	invAdjRecord.setCurrentLineItemValue('inventory', 'item', itemId);
	invAdjRecord.setCurrentLineItemValue('inventory', 'location', locationId);
	invAdjRecord.setCurrentLineItemValue('inventory', 'unitcost', costPrice);
		
	var lineAllocated = Number(0);
										
	switch (direction)
		{
			case 'IN':
				lineAllocated = 1.0;
				break;
											
			case 'OUT':
				lineAllocated = -1.0;
				break;
		}
										
	invAdjRecord.setCurrentLineItemValue('inventory', 'adjustqtyby', lineAllocated);
	
	if(binNumber != '')
		{
			var invDetail = invAdjRecord.createCurrentLineItemSubrecord('inventory', 'inventorydetail')	;
			
			invDetail.selectNewLineItem('inventoryassignment');
			invDetail.setCurrentLineItemValue('inventoryassignment', 'binnumber', binNumber);
			invDetail.setCurrentLineItemValue('inventoryassignment', 'quantity', lineAllocated);
			invDetail.commitLineItem('inventoryassignment');
			invDetail.commit();
		}
	
	invAdjRecord.commitLineItem('inventory');
	
	var invTranId = nlapiSubmitRecord(invAdjRecord, true, true);
}
