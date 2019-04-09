/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       17 Jan 2019     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function unallocatedItemScheduled(type) 
{
	//Find cash sale records that have unallocated items on them
	//
	var cashsaleSearch = getResults(nlapiCreateSearch("transaction",
			[
			   ["type","anyof","CashRfnd","CashSale"], 
			   "AND", 
			   ["mainline","is","F"], 
			   "AND", 
			   ["taxline","is","F"], 
			   "AND", 
			   ["cogs","is","F"], 
			   "AND", 
			   ["shipping","is","F"],
			   "AND", 
			   ["item.internalid","anyof","97"]
			], 
			[
			   new nlobjSearchColumn("tranid"), 
			   new nlobjSearchColumn("type"), 
			   new nlobjSearchColumn("line"), 
			   new nlobjSearchColumn("memo"),
			   new nlobjSearchColumn("custcol_bbs_item_clover_int_id")
			]
			));
	
	//Process the search results
	//
	if(cashsaleSearch != null && cashsaleSearch.length > 0)
		{
			for (var int = 0; int < cashsaleSearch.length; int++) 
				{
					if(int%10 == 0)
						{
							checkResources();
						}
					
					//Get the results data
					//
					var transactionId = cashsaleSearch[int].getId();
					var transactionLine = cashsaleSearch[int].getValue("line");
					var transactionType = cashsaleSearch[int].getValue("type");
					var transactionMemo = cashsaleSearch[int].getValue("memo");
					var transactionCloverId = cashsaleSearch[int].getValue("custcol_bbs_item_clover_int_id");
					
					transactionType = (transactionType == 'CashRfnd' ? 'cashrefund' : transactionType);
					
					var realItem = null;
					
					//See if we can find the real item by looking up the item using the external id against the memo field
					//
					realItem = findRealItem(transactionMemo);
					
					//If we couldn't find the real item by name then try to find it by clover id
					//
					if(realItem == null && transactionCloverId != null && transactionCloverId != '')
						{
							realItem = findItemInMatrix(transactionCloverId);
						}
					
					//If we found the real item we need to change the cash sale record
					//
					if(realItem != null)
						{
							var cashSaleRecord = null;
							var realItemId = realItem['id'];
							var realItemTaxSchedule = realItem['tax'];
							
							//Load in the cash sale record
							//
							try
								{
									cashSaleRecord = nlapiLoadRecord(transactionType, transactionId);
								}
							catch(err)
								{
									cashSaleRecord = null;
									nlapiLogExecution('ERROR', 'Error loading '+ transactionType + ' record id = ' + transactionId, err.message);
								}
							
							if(cashSaleRecord != null)
								{
									var lines = cashSaleRecord.getLineItemCount('item');
									var lineUpdated = false;
									
									//Loop through the lines to find the one we are to update
									//
									for (var int2 = 1; int2 <= lines; int2++) 
										{
											var itemLineNo = cashSaleRecord.getLineItemValue('item', 'line', int2);
											
											//We have found the matching line
											//
											if(itemLineNo == transactionLine)
												{
													//Get original item values
													//
													var originalAmount = Number(cashSaleRecord.getLineItemValue('item', 'amount', int2));
													var originalTax =  Number(cashSaleRecord.getLineItemValue('item', 'tax1amt', int2));
													
													//Set values for the real item
													//
													cashSaleRecord.setLineItemValue('item', 'item', int2, realItemId);
													cashSaleRecord.setLineItemValue('item', 'price', int2, '-1');
													cashSaleRecord.setLineItemValue('item', 'rate', int2, '');
													
													//Is the real item zero rated for vat?
													//If so, then the amount should be the original amount + the original vat
													//
													var newAmount = Number(0);
													
													if(realItemTaxSchedule == '3')
														{
															newAmount = originalAmount + originalTax;
														}
													else
														{
															newAmount = originalAmount;
														}
													
													cashSaleRecord.setLineItemValue('item', 'amount', int2, newAmount);
													
													lineUpdated = true;
													break;
												}
										}
									
									//If we have updated anything, then submit the record
									//
									if(lineUpdated)
										{
											try
												{
													nlapiSubmitRecord(cashSaleRecord, true, true);
												}
											catch(err)
												{
													nlapiLogExecution('ERROR', 'Error updating '+ transactionType + ' record, id = ' + transactionId, err.message);
												}
										}
								}
						}
				}
		}
}

//=====================================================================
//Functions
//=====================================================================
//
function findItemInMatrix(_cloverId)
{
	var foundItem = null;
	
	var customrecordbbs_item_locatin_matrixSearch = nlapiSearchRecord("customrecordbbs_item_locatin_matrix",null,
			[
			   ["custrecord_bbs_item_clover_id","is",_cloverId], 
			   "AND", 
			   ["custrecord_bbs_item","noneof","@NONE@"]
			], 
			[
			   new nlobjSearchColumn("custrecord_bbs_item"), 
			   new nlobjSearchColumn("taxschedule","CUSTRECORD_BBS_ITEM",null)
			]
			);
	
	if(customrecordbbs_item_locatin_matrixSearch != null && customrecordbbs_item_locatin_matrixSearch.length > 0)
		{
			var foundItemId = customrecordbbs_item_locatin_matrixSearch[0].getValue("custrecord_bbs_item");
			var foundItemTaxSchedule = customrecordbbs_item_locatin_matrixSearch[0].getValue("taxschedule","CUSTRECORD_BBS_ITEM");
			
			foundItem = {};
			foundItem['id'] = foundItemId;
			foundItem['tax'] = foundItemTaxSchedule;
		}

	return foundItem;
}

function findRealItem(_externalId)
{
	var foundItem = null;
	
	var itemSearch = nlapiSearchRecord("item",null,
			[
			   ["externalidstring","is",_externalId]
			], 
			[
			   new nlobjSearchColumn("itemid").setSort(false),
			   new nlobjSearchColumn("taxschedule")
			]
			);
	
	if(itemSearch != null && itemSearch.length == 1)
		{
			var foundItemId = itemSearch[0].getId();
			var foundItemTaxSchedule = itemSearch[0].getValue("taxschedule");
			
			foundItem = {};
			foundItem['id'] = foundItemId;
			foundItem['tax'] = foundItemTaxSchedule;
		}
	
	return foundItem;
}

function getResults(search)
{
	var searchResult = search.runSearch();
	
	//Get the initial set of results
	//
	var start = 0;
	var end = 1000;
	var searchResultSet = searchResult.getResults(start, end);
	
	if(searchResultSet != null)
		{
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
		}
	return searchResultSet;
}

function checkResources()
{
	var remaining = parseInt(nlapiGetContext().getRemainingUsage());
	
	if(remaining < 500)
		{
			var yieldState = nlapiYieldScript();
			nlapiLogExecution('DEBUG', 'Yield Status', yieldState.status + ' ' + yieldState.size + ' ' +  yieldState.reason + ' ' + yieldState.information);
		}
}
