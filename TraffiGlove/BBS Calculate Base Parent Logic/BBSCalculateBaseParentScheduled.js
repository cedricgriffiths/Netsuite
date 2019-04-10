/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 Nov 2017     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduledBaseParent(type) 
{
	
	var itemSearch = nlapiCreateSearch("item",
			[
			   ["type","anyof","Assembly"], 
			   "AND", 
			   ["custitem_sw_base_parent","anyof","@NONE@"],
			   "AND", 
			   ["matrixchild","is","T"]
			], 
			[
			   new nlobjSearchColumn("itemid",null,null)
			]
			);
	
	var itemSearchResult = itemSearch.runSearch();
	
	if (itemSearchResult)
		{
			//Get the initial set of results
			//
			var start = 0;
			var end = 1000;
			var resultlen = 0;
			var itemSearchResultSet = null;
			
			try
			{
				itemSearchResultSet = itemSearchResult.getResults(start, end);
				resultlen = itemSearchResultSet.length;
			}
			catch(err)
			{
				var error = err;
				resultlen = 0;
			}
			
			//If there is more than 1000 results, page through them
			//
			while (resultlen == 1000) 
				{
						start += 1000;
						end += 1000;
	
						var moreSearchResultSet = itemSearchResult.getResults(start, end);
						resultlen = moreSearchResultSet.length;
	
						itemSearchResultSet = itemSearchResultSet.concat(moreSearchResultSet);
				}
			
			if(itemSearchResultSet && itemSearchResultSet.length > 0)
				{
					for (var int2 = 0; int2 < itemSearchResultSet.length; int2++) 
						{
							var recType = itemSearchResultSet[int2].getRecordType();
							var recId = itemSearchResultSet[int2].getId();
							
							var remaining = parseInt(nlapiGetContext().getRemainingUsage());
							
							if(remaining < 50)
								{
									nlapiYieldScript();
								}
							else
								{
									var currentRecord = nlapiLoadRecord('assemblyitem', recId);
									
									var members = currentRecord.getLineItemCount('member');
									
									for (var int = 1; int <= members; int++) 
										{
											var memberType = currentRecord.getLineItemValue('member', 'sitemtype', int);
											
											if(memberType == 'InvtPart')
												{
													var memberItemId = currentRecord.getLineItemValue('member', 'item', int);
													
													var memberItemRecord = nlapiLoadRecord('inventoryitem', memberItemId);
													
													if(memberItemRecord)
														{
															var parent = memberItemRecord.getFieldValue('parent');
															
															currentRecord.setFieldValue('custitem_sw_base_parent', parent);
															
															nlapiSubmitRecord(currentRecord, false, true);
														}
														
													break;
												}
										}
								}
						}
				}
		}
	
}
