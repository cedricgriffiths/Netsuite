/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       14 Dec 2018     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{
	var assemblyitemSearch = nlapiCreateSearch("assemblyitem",
			[
			   ["type","anyof","Assembly"], 
			   "AND", 
			   ["memberitem.custitem_bbs_item_product_type","anyof","5"], 
			   "AND", 
			   ["custitem_bbs_glass_spec","anyof","@NONE@"]
			], 
			[
			   new nlobjSearchColumn("itemid").setSort(false)
			]
			);
	
	var assemblyitemSearchResults = getResults(assemblyitemSearch);
	
	for (var int = 0; int < assemblyitemSearchResults.length; int++) 
		{
			if(nlapiGetContext().getRemainingUsage() > 100)
				{
					var itemId = assemblyitemSearchResults[int].getId();
					var itemType = assemblyitemSearchResults[int].getRecordType();
					
					var assemblyRecord = nlapiLoadRecord(itemType, itemId);
					var assemblyId = assemblyRecord.getId();
					var assemblyType = assemblyRecord.getRecordType();
					
					//Get the count of components
					//
					var members = assemblyRecord.getLineItemCount('member');
					
					//Loop through the components
					//
					for (var int2 = 1; int2 <= members; int2++) 
						{
							//Get the component id & type
							//
							var memberItem = assemblyRecord.getLineItemValue('member', 'item', int2);
							var memberItemType = assemblyRecord.getLineItemValue('member', 'sitemtype', int2);
							
							//If the component is a non inventory part then we need to see if it has a product type of glass spec
							//
							if(memberItemType == 'NonInvtPart')
								{
									var memberItemProductType = nlapiLookupField('noninventoryitem', memberItem, 'custitem_bbs_item_product_type', false);
									
									//If the component does have a product type of glass psec, then copy this up to the assembly header
									//
									if(memberItemProductType == '5')
										{
											nlapiSubmitField(assemblyType, assemblyId, 'custitem_bbs_glass_spec', memberItem, false);
											break;
										}
								}
						}
				}
			else
				{
					nlapiYieldScript();
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
