/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       04 Jun 2018     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{

	var salesorderSearch = nlapiCreateSearch("salesorder",
			[
			   ["type","anyof","SalesOrd"], 
			   "AND", 
			   ["mainline","is","F"], 
			   "AND", 
			   ["closed","is","T"], 
			   "AND", 
			   ["taxline","is","F"], 
			   "AND", 
			   ["shipping","is","F"], 
			   "AND", 
			   ["custcol_cbc_closed_processed","is","F"]
			], 
			[
			   new nlobjSearchColumn("internalid",null,"GROUP").setSort(false)
			]
			);
	
	var salesorderSearchResults = getResults(salesorderSearch);
	
	if(salesorderSearchResults && salesorderSearchResults.length > 0)
		{
			for (var int = 0; int < salesorderSearchResults.length; int++) 
				{
					checkResources();
					
					//Get the sales order id & then try to read the sales order record
					//
					var salesOrderId = salesorderSearchResults[int].getValue("internalid",null,"GROUP");
					var salesOrderRecord = null;
					
					try
						{
							salesOrderRecord = nlapiLoadRecord('salesorder', salesOrderId);
						}
					catch(err)
						{
							salesOrderRecord = null;
						}
					
					//Continue if we have read the sales order
					//
					if(salesOrderRecord)
						{
							//Get the sales order placed by
							//
							var orderPlacedBy = salesOrderRecord.getFieldValue('custbody_cbc_order_placed_by');
							orderPlacedBy = (orderPlacedBy == null ? '' : orderPlacedBy);
							
							//Get the sales order customer
							//
							var orderCustomer = salesOrderRecord.getFieldValue('entity');
							
							var itemLines = salesOrderRecord.getLineItemCount('item');
							
							//Loop through the sales order lines
							//
							for (var int2 = 1; int2 <= itemLines; int2++) 
								{
									checkResources();
									
									//Is the line closed
									//
									var lineIsClosed = salesOrderRecord.getLineItemValue('item', 'isclosed', int2);
									lineIsClosed = (lineIsClosed == null ? 'F' : lineIsClosed);
									
									//Have we already processed this line
									//
									var lineProcessed = salesOrderRecord.getLineItemValue('item', 'custcol_cbc_closed_processed', int2);
									lineProcessed = (lineProcessed == null ? 'F' : lineProcessed);
									
									//If the line is closed & has not been processed, then continue
									//
									if(lineIsClosed == 'T' && lineProcessed == 'F')
										{
											var lineItem = salesOrderRecord.getLineItemValue('item','item',int2);
											var lineQuantity = salesOrderRecord.getLineItemValue('item','quantity',int2);
											var lineQuantityFulfilled = salesOrderRecord.getLineItemValue('item','quantityfulfilled',int2);
											var lineAmount = salesOrderRecord.getLineItemValue('item','amount',int2);
											var lineRate = salesOrderRecord.getLineItemValue('item','rate',int2);
											var lineManpackContact = salesOrderRecord.getLineItemValue('item','custcol_cbc_manpack_contact',int2);
											
											lineManpackContact = (lineManpackContact == null ? '' : lineManpackContact);
											lineManpackContact = (lineManpackContact == '' ? orderPlacedBy : lineManpackContact);
											
											//Update the line to say we have processed it
											//
											salesOrderRecord.setLineItemValue('item', 'custcol_cbc_closed_processed', int2, 'T');
											
											//Only continue if this is a manpack line
											//
											if(lineManpackContact != '')
												{
													var outstandingQuantity = Number(lineQuantity) - Number(lineQuantityFulfilled);
													var outstandingAmount = Number(lineRate) * outstandingQuantity;
													
													//Only interested in lines that have been partially fulfilled at time of closing
													//
													if(outstandingQuantity != 0 && Number(lineQuantityFulfilled) > 0)
														{
															//Find the grade for this contact
															//
															var contactGrade = nlapiLookupField('contact', lineManpackContact, 'custentity_cbc_contact_grade', false);
														
															//Find the item record in the customers budget item table
															//
															var filters = [
															               	["custrecord_cbc_item_customer","anyof",orderCustomer],
															               	"AND",
															               	["custrecord_cbc_item_item","anyof",lineItem],
															               	"AND",
															               	["custrecord_cbc_item_grade","anyof",contactGrade]
															              ];
															
															var customrecord_cbc_item_record_recordSearch = nlapiSearchRecord("customrecord_cbc_item_record",null,
																	filters, 
																	[
																		new nlobjSearchColumn("custrecord_cbc_item_item"),
																		new nlobjSearchColumn("custrecord_cbc_item_allocation_type"),
																		new nlobjSearchColumn("custrecord_cbc_item_points"),
																		new nlobjSearchColumn("custrecord_cbc_item_grade")
																	]
																	);
															
															//See if we have found a record in the budget item table, if not found then we don't need to worry about processing it
															//
															if(customrecord_cbc_item_record_recordSearch != null && customrecord_cbc_item_record_recordSearch.length > 0)
																{
																	//Get the alloc type & points for the item 
																	//
																	var customerBudgetItemAllocType = customrecord_cbc_item_record_recordSearch[0].getValue('custrecord_cbc_item_allocation_type');
																	var customerBudgetItemPoints = customrecord_cbc_item_record_recordSearch[0].getValue('custrecord_cbc_item_points');
																	
																	//Find the budget type for this contact
																	//
																	var contactBudgetType = Number(nlapiLookupField('contact', lineManpackContact, 'custentity_cbc_contact_budget_type', false));
																
																	//Process based on budget type
																	//
																	switch(contactBudgetType)
																		{
																			case 1:	//Monetary
																				
																				//Find the contact's budget record 
																				//
																				var customrecord_cbc_contact_recordSearch = nlapiSearchRecord("customrecord_cbc_contact_record",null,
																						[["custrecord_cbc_contact_id","anyof",lineManpackContact]], 
																						[
																							new nlobjSearchColumn("custrecord_cbc_contact_id"),
																							new nlobjSearchColumn("custrecord_cbc_contact_budget_type"),
																							new nlobjSearchColumn("custrecord_cbc_contact_item_alloc_type"),
																							new nlobjSearchColumn("custrecord_cbc_contact_quantity"),
																							new nlobjSearchColumn("custrecord_cbc_contact_usage"),
																							new nlobjSearchColumn("custrecord_cbc_contact_reset_days")
																						]
																						);
																				
																				if(customrecord_cbc_contact_recordSearch && customrecord_cbc_contact_recordSearch.length > 0)
																					{
																						var budgetId = customrecord_cbc_contact_recordSearch[0].getId();
																						var budgetValue = Number(customrecord_cbc_contact_recordSearch[0].getValue('custrecord_cbc_contact_usage'));
																						
																						budgetValue = budgetValue + Math.round(outstandingAmount);
																						
																						nlapiSubmitField('customrecord_cbc_contact_record', budgetId, 'custrecord_cbc_contact_usage', budgetValue, false)
																					}
																				break;
																			
																			case 2: //Points
																				
																				//Find the contact's budget record 
																				//
																				var customrecord_cbc_contact_recordSearch = nlapiSearchRecord("customrecord_cbc_contact_record",null,
																						[["custrecord_cbc_contact_id","anyof",lineManpackContact]], 
																						[
																							new nlobjSearchColumn("custrecord_cbc_contact_id"),
																							new nlobjSearchColumn("custrecord_cbc_contact_budget_type"),
																							new nlobjSearchColumn("custrecord_cbc_contact_item_alloc_type"),
																							new nlobjSearchColumn("custrecord_cbc_contact_quantity"),
																							new nlobjSearchColumn("custrecord_cbc_contact_usage"),
																							new nlobjSearchColumn("custrecord_cbc_contact_reset_days")
																						]
																						);
																				
																				if(customrecord_cbc_contact_recordSearch && customrecord_cbc_contact_recordSearch.length > 0)
																					{
																						var budgetId = customrecord_cbc_contact_recordSearch[0].getId();
																						var budgetValue = Number(customrecord_cbc_contact_recordSearch[0].getValue('custrecord_cbc_contact_usage'));
																						
																						budgetValue = budgetValue + (customerBudgetItemPoints * outstandingQuantity);
																						
																						nlapiSubmitField('customrecord_cbc_contact_record', budgetId, 'custrecord_cbc_contact_usage', budgetValue, false)
																					}
																				
																				break;
																				
																			case 3: //Allocations
																				
																				//Find the contact's budget record 
																				//
																				var customrecord_cbc_contact_recordSearch = nlapiSearchRecord("customrecord_cbc_contact_record",null,
																						[
																						 	["custrecord_cbc_contact_id","anyof",lineManpackContact],
																						 	"AND",
																						 	["custrecord_cbc_contact_item_alloc_type","anyof",customerBudgetItemAllocType]
																						 ], 
																						[
																							new nlobjSearchColumn("custrecord_cbc_contact_id"),
																							new nlobjSearchColumn("custrecord_cbc_contact_budget_type"),
																							new nlobjSearchColumn("custrecord_cbc_contact_item_alloc_type"),
																							new nlobjSearchColumn("custrecord_cbc_contact_quantity"),
																							new nlobjSearchColumn("custrecord_cbc_contact_usage"),
																							new nlobjSearchColumn("custrecord_cbc_contact_reset_days")
																						]
																						);
																				
																				if(customrecord_cbc_contact_recordSearch && customrecord_cbc_contact_recordSearch.length > 0)
																					{
																						var budgetId = customrecord_cbc_contact_recordSearch[0].getId();
																						var budgetValue = Number(customrecord_cbc_contact_recordSearch[0].getValue('custrecord_cbc_contact_usage'));
																						
																						budgetValue = budgetValue + outstandingQuantity;
																						
																						nlapiSubmitField('customrecord_cbc_contact_record', budgetId, 'custrecord_cbc_contact_usage', budgetValue, false)
																					}
																				
																				break;
																		}
																}
														}
												}
										}
								}
							
							//Save the sales order record to show we have processed the lines
							//
							try
								{
									nlapiSubmitRecord(salesOrderRecord, false, true);
								}
							catch(err)
								{
									
								}
						}
				}
		}
}

function getResults(search)
{
	var searchResult = search.runSearch();
	
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
	
	if(remaining < 200)
		{
			nlapiYieldScript();
		}
}

//left padding s with c to a total of n chars
//
function padding_left(s, c, n) 
{
	if (! s || ! c || s.length >= n) 
	{
		return s;
	}
	
	var max = (n - s.length)/c.length;
	
	for (var i = 0; i < max; i++) 
	{
		s = c + s;
	}
	
	return s;
}
