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
	
	//nlapiLogExecution('DEBUG', 'Parameters', parameters);
	
	var subsidiaryParam = parameterObject['subsidiary'];
	var locationParam = parameterObject['location'];

	
	var itemSearch = nlapiCreateSearch("item",
			[
			   ["locationaveragecost","isempty",""], 
			   "AND", 
			   ["inventorylocation","anyof",locationParam],
			   "AND",
			   ["ispreferredvendor","is","T"],
			   "AND",
			   ["vendorcost","isnotempty",""]
			], 
			[
			   new nlobjSearchColumn("itemid",null,null).setSort(false), 
			   new nlobjSearchColumn("displayname",null,null), 
			   new nlobjSearchColumn("salesdescription",null,null), 
			   new nlobjSearchColumn("type",null,null), 
			   new nlobjSearchColumn("baseprice",null,null), 
			   new nlobjSearchColumn("inventorylocation",null,null), 
			   new nlobjSearchColumn("vendor",null,null), 
			   new nlobjSearchColumn("vendorcost",null,null)
			]
			);

	//Get all the results from the search (i.e. > 1000 lines)
	//
	var itemSearchResult = getResults(itemSearch);
	
	if(itemSearchResult)
		{
			for (var int = 0; int < itemSearchResult.length; int++) 
				{
					var itemId = itemSearchResult[int].getId();
					var itemVendorCost = itemSearchResult[int].getValue('vendorcost');
					
					
					stockAdjust(itemId, 'IN', locationParam, InTranAcc, itemVendorCost);
					stockAdjust(itemId, 'OUT', locationParam, InTranAcc, itemVendorCost);
					
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
	checkResources();
	
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
	
	if(remaining < 100)
		{
			nlapiYieldScript();
		}
}

function libStockAdjustInTransit(itemId, direction, locationId, accountId, costPrice)
{
	//Create a stock adjustment for the item
	//
	var invAdjRecord = nlapiCreateRecord('inventoryadjustment', {recordmode: 'dynamic'});
										
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
							
	invAdjRecord.commitLineItem('inventory');
	var invTranId = nlapiSubmitRecord(invAdjRecord, true, true);
		


}
