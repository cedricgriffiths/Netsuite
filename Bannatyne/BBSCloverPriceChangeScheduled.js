/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       17 Oct 2018     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{

	var customrecordbbs_effective_priceSearch = getResults(nlapiCreateSearch("customrecordbbs_effective_price",
			[
			   ["custrecordbbs_effective_date","before","today"]
			], 
			[
			   new nlobjSearchColumn("custrecord_bbs_item2").setSort(false), 
			   new nlobjSearchColumn("custrecordbbs_location2"), 
			   new nlobjSearchColumn("custrecordbbs_effective_date"), 
			   new nlobjSearchColumn("custrecordbbs_retail_price2"), 
			   new nlobjSearchColumn("custrecordbbs_default_price_change")
			]
			));
	
	//Process the search results
	//
	if(customrecordbbs_effective_priceSearch != null && customrecordbbs_effective_priceSearch.length > 0)
		{
			for (var int = 0; int < customrecordbbs_effective_priceSearch.length; int++) 
				{
					checkResources();
				
					var recordId = customrecordbbs_effective_priceSearch[int].getId();
					var itemId = customrecordbbs_effective_priceSearch[int].getValue('custrecord_bbs_item2');
					var locationId = customrecordbbs_effective_priceSearch[int].getValue('custrecordbbs_location2');
					var effectiveDate = customrecordbbs_effective_priceSearch[int].getValue('custrecordbbs_effective_date');
					var retailPrice = customrecordbbs_effective_priceSearch[int].getValue('custrecordbbs_retail_price2');
					var defaultPrice = customrecordbbs_effective_priceSearch[int].getValue('custrecordbbs_default_price_change');
					
					if(defaultPrice == 'T')
						{
							//Update the price of the item record & then update any matrix records that matched the old price, with the new price
							//
						
							//Load the item record
							//
							var itemRecord = null;
							
							try
								{
									itemRecord = nlapiLoadRecord('kititem', itemId);
								}
							catch(err)
								{
									itemRecord = null;
									nlapiLogExecution('ERROR', 'Error Loading Item Record', err.message);
								}
							
							//Procede if we have the item record
							//
							if(itemRecord)
								{
									//Get the current retail price from the item record
									//
									var currentRetailPrice = getRetailPrice(itemRecord);
									
									//Update the retail price on the item record
									//
									setRetailPrice(itemRecord, retailPrice);
								
									//Save the item record
									//
									try
										{
											nlapiSubmitRecord(itemRecord, false, true);
										}
									catch(err)
										{
											nlapiLogExecution('ERROR', 'Error Saving Item Record', err.message);
										}
									
									//Update any matrix records for this item that match on the original retail price
									//
									var customrecordbbs_item_locatin_matrixSearch = getResults(nlapiCreateSearch("customrecordbbs_item_locatin_matrix",
											[
											   ["custrecord_bbs_item","anyof",itemId], 
											   "AND", 
											   ["custrecordbbs_retail_price","equalto",currentRetailPrice]
											], 
											[
											   new nlobjSearchColumn("internalid").setSort(false)
											]
											));
									
									if(customrecordbbs_item_locatin_matrixSearch != null && customrecordbbs_item_locatin_matrixSearch.length > 0)
										{
											for (var int2 = 0; int2 < customrecordbbs_item_locatin_matrixSearch.length; int2++) 
												{
													checkResources();
													
													//Get the matrix record id & then read in the record
													//
													var matrixRecordId = customrecordbbs_item_locatin_matrixSearch[int2].getId();
													
													var matrixRecord = null;
													
													try
														{
															matrixRecord = nlapiLoadRecord('customrecordbbs_item_locatin_matrix', matrixRecordId);
														}
													catch(err)
														{
															matrixRecord = null;
														}
													
													if(matrixRecord)
														{
															//Update the retail price
															//
															matrixRecord.setFieldValue('custrecordbbs_retail_price', retailPrice);
															
															var status = matrixRecord.getFieldValue('custrecordbbs_process_status');
															
															//If the process status is not set to "New' then set it to modified
															//
															if(status != '1')
																{
																	matrixRecord.setFieldValue('custrecordbbs_process_status', '2');
																}
															
															//Update the matrix record
															//
															try
																{
																	nlapiSubmitRecord(matrixRecord, false, true);
																}
															catch(err)
																{
																	nlapiLogExecution('ERROR', 'Error Saving Clover Item Location Matrix Record', err.message);
																}
														}
												}
										}
									
									
								}
						}
					else
						{
							//If there is no update to the default price, then only update the matrix record with the matching item/location
							//Also check to make sure we do have a location
							//
							if(locationId != null && locationId != '')
								{
									var customrecordbbs_item_locatin_matrixSearch = getResults(nlapiCreateSearch("customrecordbbs_item_locatin_matrix",
											[
											   ["custrecord_bbs_item","anyof",itemId], 
											   "AND", 
											   ["custrecordbbs_merchant_location","anyof",locationId]
											], 
											[
											   new nlobjSearchColumn("internalid").setSort(false)
											]
											));
									
									//Process the search results
									//
									if(customrecordbbs_item_locatin_matrixSearch != null && customrecordbbs_item_locatin_matrixSearch.length > 0)
										{
											for (var int2 = 0; int2 < customrecordbbs_item_locatin_matrixSearch.length; int2++) 
												{
													checkResources();
													
													var matrixRecordId = customrecordbbs_item_locatin_matrixSearch[int2].getId();
													
													//Update the retail price on the matrix record
													//
													try
														{
															nlapiSubmitField('customrecordbbs_item_locatin_matrix', matrixRecordId, 'custrecordbbs_retail_price', retailPrice, false);
														}
													catch(err)
														{
															nlapiLogExecution('ERROR', 'Error Updating Matrix Record', err.message);
														}
												}
											
										}
								}
						}
					
					//Once we are finished we can delete the price change record
					//
					try
						{
							nlapiDeleteRecord('customrecordbbs_effective_price', recordId);
						}
					catch(err)
						{
							nlapiLogExecution('ERROR', 'Error Deleting Effective Price Change Record', err.message);
						}
				}
		
		}
	
}

//=============================================================================================
//=============================================================================================
//Functions
//=============================================================================================
//=============================================================================================
//
function checkResources()
{
	var remaining = parseInt(nlapiGetContext().getRemainingUsage());
	
	if(remaining < 100)
		{
			nlapiYieldScript();
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

function getRetailPrice(_itemRecord)
{
	var retailPrice = Number(0);
	
	//Read the price sublist based on the currency code
	//
	var priceSublist = 'price1';
	
	var priceLineCount = _itemRecord.getLineItemCount(priceSublist);
	var quantityLevels = _itemRecord.getMatrixCount(priceSublist, 'price');
	
	for (var int2 = 1; int2 <= priceLineCount; int2++) 
	{
		var pricePriceLevel = _itemRecord.getLineItemValue(priceSublist, 'pricelevel', int2);
		
		if (pricePriceLevel == '1')
			{
				retailPrice = Number(_itemRecord.getLineItemMatrixValue(priceSublist, 'price', int2, 1));

				break;
			}
	}

	return retailPrice;
}

function setRetailPrice(_itemRecord, _newPrice)
{
	//Read the price sublist based on the currency code
	//
	var priceSublist = 'price1';
	
	var priceLineCount = _itemRecord.getLineItemCount(priceSublist);
	var quantityLevels = _itemRecord.getMatrixCount(priceSublist, 'price');
	
	for (var int2 = 1; int2 <= priceLineCount; int2++) 
	{
		var pricePriceLevel = _itemRecord.getLineItemValue(priceSublist, 'pricelevel', int2);
		
		if (pricePriceLevel == '1')
			{
				_itemRecord.selectLineItem(priceSublist, int2);
				_itemRecord.setCurrentLineItemMatrixValue(priceSublist, 'price', 1, _newPrice);
				_itemRecord.commitLineItem(priceSublist, false);
				
				
				break;
			}
	}
}