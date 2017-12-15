/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 Dec 2017     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{

	var priceSearch = nlapiCreateSearch("pricelevel",[],[]);
	
	var searchResult = priceSearch.runSearch();
	
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
	
	for (var int = 0; int < searchResultSet.length; int++) 
		{
			var levelId = searchResultSet[int].getId();
			
			var levelRecord = nlapiLoadRecord('pricelevel', levelId);
			
			if(levelRecord)
				{
					try
					{
						nlapiDeleteRecord('pricelevel', levelId);
					}
					catch(err)
					{
						alert(levelId.toString() + ' : ' + err.message);
					}
				}
		
		}
}
