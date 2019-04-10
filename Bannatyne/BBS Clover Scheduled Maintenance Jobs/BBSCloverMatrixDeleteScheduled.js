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
	//Search for matrix records that are to be deleted in clover & are now marked as processed, so we can actually delete them from the table
	//
	var customrecordbbs_item_locatin_matrixSearch = getResults(nlapiCreateSearch("customrecordbbs_item_locatin_matrix",
			[
			   ["custrecordbbs_delete_in_clover","is","T"], 
			   "AND", 
			   ["custrecordbbs_process_status","anyof","3"]
			], 
			[
			   new nlobjSearchColumn("internalid").setSort(false)
			]
			));
	
	//Process search results
	//
	if(customrecordbbs_item_locatin_matrixSearch != null && customrecordbbs_item_locatin_matrixSearch.length > 0)
		{
			for (var int = 0; int < customrecordbbs_item_locatin_matrixSearch.length; int++) 
				{
					checkResources();
					
					var recordId = customrecordbbs_item_locatin_matrixSearch[int].getId();
					
					try
						{
							nlapiDeleteRecord('customrecordbbs_item_locatin_matrix', recordId);
						}
					catch(err)
						{
							nlapiLogExecution('ERROR', 'Error Deleting Clover Item Location Matrix Record', err.message);
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