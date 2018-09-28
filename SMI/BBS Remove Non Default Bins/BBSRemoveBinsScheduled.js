/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       28 Sep 2018     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{
	
	var inventoryitemSearch = nlapiCreateSearch("inventoryitem",
			[
			   ["type","anyof","InvtPart"]
			], 
			[
			   new nlobjSearchColumn("itemid").setSort(false), 
			   new nlobjSearchColumn("displayname")
			]
			);
	
	var inventoryitemSearchResults = getResults(inventoryitemSearch);
	
	if(inventoryitemSearchResults)
		{
			for (var int = 0; int < inventoryitemSearchResults.length; int++) 
				{
					var remaining = parseInt(nlapiGetContext().getRemainingUsage());
				
					if(remaining < 100)
						{
							nlapiYieldScript();
						}
					else
						{
							var itemId = inventoryitemSearchResults[int].getId();
							
							var itemRecord = nlapiLoadRecord('inventoryitem', itemId);
							
							if(itemRecord)
								{
									var itemName = itemRecord.getFieldValue('itemid');
									
									var binCount = itemRecord.getLineItemCount('binnumber');
									
									for (var int2 = binCount; int2 >= 1; int2--) 
										{
											var binQty = Number(itemRecord.getLineItemValue('binnumber', 'onhand', int2));
											var binPreferred = itemRecord.getLineItemValue('binnumber', 'preferredbin', int2);
											var binName = itemRecord.getLineItemText('binnumber', 'binnumber', int2);
											var binId = itemRecord.getLineItemValue('binnumber', 'binnumber', int2);
											
											var binLocation = nlapiLookupField('bin', binId, 'location', true);
											
											if(binPreferred == 'F' && binQty == 0)
												{
													itemRecord.removeLineItem('binnumber', int2, false);
													
													nlapiLogExecution('DEBUG', itemName, binName + '/' + binLocation +' Removed');
												}
										}
									
									nlapiSubmitRecord(itemRecord, false, true);
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