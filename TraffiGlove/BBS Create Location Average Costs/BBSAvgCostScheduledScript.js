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
	
	nlapiLogExecution('DEBUG', 'Parameters', parameters);
	
	var usersEmail = context.getUser();
	var parameterObject = JSON.parse(parameters);
	
	var subsidiaryParam = parameterObject['subsidiary'];
	var locationParam = parameterObject['location'];
	var accountParam = parameterObject['account'];
	var emailMessage = '';
	
	//=============================================================================================
	//Search for inventory items
	//=============================================================================================
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
			   ["matrixchild","is","T"],
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
			
			//Loop round the results
			//
			for (var int = 0; int < itemSearchResult.length; int++) 
				{
					//Check resources
					//
					if(counter % 50)
						{
							checkResources();
						}
					
					var itemId = itemSearchResult[int].getId();
					var itemVendorCost = Number(itemSearchResult[int].getValue('vendorcost'));
					var itemAverageCost = Number(itemSearchResult[int].getValue('custitem_bbs_item_ave_cost'));
					
					//Get the costs
					//
					itemAverageCost = (isNaN(itemAverageCost) ? 0 : itemAverageCost);
					itemVendorCost = (isNaN(itemVendorCost) ? 0 : itemVendorCost);
					
					//Read the inventory item
					//
					var selecedVendorCurrency = '1';
					var binId = '';
					var useBins = '';
					
					var itemRecord = nlapiLoadRecord('inventoryitem', itemId);
					
					if(itemRecord)
						{
							useBins = itemRecord.getFieldValue('usebins');
							
							//Find the preferred vendor's currency
							//
							var vendors = itemRecord.getLineItemCount('itemvendor');
							
							for (var int2 = 1; int2 <= vendors; int2++) 
								{
									var vendorPreferred = itemRecord.getLineItemValue('itemvendor', 'preferredvendor', int2);
									var vendorCurrency = itemRecord.getLineItemValue('itemvendor', 'vendorcurrencyid', int2);
									var vendorSubsidiary = itemRecord.getLineItemValue('itemvendor', 'subsidiary', int2);
									
									if(vendorPreferred == 'T' && vendorSubsidiary == subsidiaryParam)
										{
											selecedVendorCurrency= vendorCurrency;
											break;
										}
								}
							
							//Find the preferred bin for the location
							//
							binId = findBin(itemRecord, locationParam);
						}
					
					//Choose which cost to use
					//
					var selectedCost = Number(0);
					
					//Use the item average cost if available
					//
					if(itemAverageCost != 0)
						{
							selectedCost = itemAverageCost;
						}
					else
						{
							//Otherwise use the cost from the supplier & convert it from the suppliers currency to the base currency
							//
							var exchangeRate = nlapiExchangeRate(selecedVendorCurrency, '1');
							
							selectedCost = itemVendorCost * exchangeRate;
						}

					if(binId == '' && useBins == 'T')
						{
							emailMessage += "Stock adjust error - Inventory Id: " + itemId + " Location Id : " + locationParam + " Subsidiary Id : " + subsidiaryParam + " Bin Id : " + binId + " Use Bins = T, but no bin available\n";
						}
					else
						{
							//Stock adjust a quantity of one in & then out 
							//
							try
								{
									stockAdjust(itemId, 'IN', locationParam, accountParam, selectedCost, subsidiaryParam, binId);
									stockAdjust(itemId, 'OUT', locationParam, accountParam, selectedCost, subsidiaryParam, binId);
								}
							catch(err)
								{
									emailMessage += "Stock adjust unexpected error - Inventory Id: " + itemId + " Location Id : " + locationParam + " Subsidiary Id : " + subsidiaryParam + " Bin Id : " + binId + " Message : " + err.message + "\n";
								}
						}
					
					counter++;
				}
		}

	
	//=============================================================================================
	//Search for assembly items
	//=============================================================================================
	//
	var itemSearch = nlapiCreateSearch("item",
			[
			   ["locationaveragecost","isempty",""], 
			   "AND", 
			   ["inventorylocation","anyof",locationParam],
			   "AND",
			   ["type","anyof","Assembly"],
			   "AND", 
			   ["matrixchild","is","T"],
			   "AND", 
			   ["isphantom","is","F"]
			], 
			[
			   new nlobjSearchColumn("itemid",null,null).setSort(false)
			]
			);

	//Get all the results from the search (i.e. > 1000 lines)
	//
	var itemSearchResult = getResults(itemSearch);
	
	if(itemSearchResult)
		{
			var counter = Number(0);
			
			//Loop round the results
			//
			for (var int = 0; int < itemSearchResult.length; int++) 
				{
					//Check resources
					//
					if(counter % 50)
						{
							checkResources();
						}
					
					//Initialise the cost of the assembly to zero
					//
					var assemblyTotalCost = Number(0);
					
					//Get the id of the assembly
					//
					var assemblyId = itemSearchResult[int].getId();
					
					//Read the assembly record
					//
					var useBins = '';
					var binId = '';
					var assemblyRecord = nlapiLoadRecord('assemblyitem', assemblyId);
					
					if(assemblyRecord)
						{
							useBins = assemblyRecord.getFieldValue('usebins');
						
							//Loop through the components
							//
							var components = assemblyRecord.getLineItemCount('member');
							
							for (var int3 = 1; int3 <= components; int3++) 
								{
									var componentId = assemblyRecord.getLineItemValue('member', 'item', int3);
									var componentType = assemblyRecord.getLineItemValue('member', 'sitemtype', int3);
									var componentQty = assemblyRecord.getLineItemValue('member', 'quantity', int3);
									
									switch(componentType)
										{
											case 'InvtPart':
												
												var componentRecord = nlapiLoadRecord('inventoryitem', componentId);
												
												if(componentRecord)
													{
														//Get the average cost
														//
														var componentAvgCost = Number(componentRecord.getFieldValue('custitem_bbs_item_ave_cost'));
														
														//If we have an average cost then use it
														//
														if(componentAvgCost != 0)
															{
																//Multiply the cost by the component quantity
																//
																var componentCombinedCost = componentAvgCost * componentQty;
																
																//Update the combined cost
																//
																assemblyTotalCost += componentCombinedCost;
															}
														else
															{
																//If not, then we will have to get the supplier price
																//
																var suppliers = componentRecord.getLineItemCount('itemvendor');
																var supplierPrice = Number(0);
																
																for (var int4 = 1; int4 <= suppliers; int4++) 
																	{
																		var supplierPreferred = componentRecord.getLineItemValue('itemvendor', 'preferredvendor', int4);
																		var supplierCurrency = componentRecord.getLineItemValue('itemvendor', 'vendorcurrencyid', int4);
																		var supplierSubsidiary = componentRecord.getLineItemValue('itemvendor', 'subsidiary', int4);
																		supplierPrice = Number(componentRecord.getLineItemValue('itemvendor', 'purchaseprice', int4));
																		
																		if(supplierPreferred == 'T' && supplierSubsidiary == subsidiaryParam && supplierPrice != 0)
																			{
																				//Get the exchange rate to convert the suppliers price into base currency
																				//
																				var exchangeRate = nlapiExchangeRate(supplierCurrency, '1');
																			
																				//Multiply the cost by the component quantity
																				//
																				var componentCombinedCost = (supplierPrice * exchangeRate) * componentQty;
																				
																				//Update the combined cost
																				//
																				assemblyTotalCost += componentCombinedCost;
																				
																				break;
																			}
																	}
															
															}
													}
												
												break;
												
											case 'Assembly':
												
												//Read the assembly item 
												//
												var componentRecord = nlapiLoadRecord('assemblyitem', componentId);
												
												if(componentRecord)
													{	
														//Get the costs
														//
														var componentApplicationCost = Number(componentRecord.getFieldValue('custitem_bbs_item_application_cost'));
														var componentItemCost = Number(componentRecord.getFieldValue('custitem_bbs_item_cost'));
														
														//Multiply the costs by the component quantity
														//
														var componentCombinedCost = (componentApplicationCost + componentItemCost) * componentQty;
														
														//Update the combined cost
														//
														assemblyTotalCost += componentCombinedCost;
													}
												
												break;
										}
								}
						
							//Find the preferred bin for the location
							//
							binId = findBin(assemblyRecord, locationParam);
							
							//Stock adjust a quantity of one in & then out 
							//
							if(binId == '' && useBins == 'T')
							{
								emailMessage += "Stock adjust error - Assembly Id: " + assemblyId + " Location Id : " + locationParam + " Subsidiary Id : " + subsidiaryParam + " Bin Id : " + binId + " Use Bins = T, but no bin available\n";
							}
						else
							{
								try
									{
										stockAdjust(assemblyId, 'IN', locationParam, accountParam, assemblyTotalCost, subsidiaryParam, binId);
										stockAdjust(assemblyId, 'OUT', locationParam, accountParam, assemblyTotalCost, subsidiaryParam, binId);
									}
								catch(err)
									{
										emailMessage += "Stock adjust unexpected error - Assembly Id: " + assemblyId + " Location Id : " + locationParam + " Subsidiary Id : " + subsidiaryParam + " Bin Id :" + binId + " Message : " + err.message + "\n";
									}
							}
						}
					
					counter++;
				}
		}

	//=============================================================================================
	//Send the email to the user to say that we have finished
	//=============================================================================================
	//
	emailMessage += 'The average cost update has finished, please review any errors';
	
	nlapiSendEmail(usersEmail, usersEmail, 'Average Cost Update', emailMessage);
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

function findBin(itemRec, locationId)
{
	var binId = '';
	
	var binCount = itemRec.getLineItemCount('binnumber');
	
	for (var int2 = 1; int2 <= binCount; int2++) 
		{
			var binLocation = itemRec.getLineItemValue('binnumber', 'location', int2);
			var binNumber = itemRec.getLineItemValue('binnumber', 'binnumber', int2);
			var binActive = itemRec.getLineItemValue('binnumber', 'locationactive', int2);
			var binPreferred = itemRec.getLineItemValue('binnumber', 'preferredbin', int2);
			
			if(binLocation == locationId && binActive == 'Yes' && binPreferred == 'T')
				{
					binId = binNumber;
					break;
				}
		}
	
	return binId;
}