/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       27 Sep 2017     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function deleteAllScheduled(type) 
{

	var dummy = deleteAll('A', 11); //H&M
	var dummy = deleteAll('A', 12); //IWT

}


//Delete modes are;
// C = Count or all records only, no delete
// c = Count transaction records only, no delete
// A = Delete all records
// T = Delete transaction records only, keeps suppliers, customers, items etc.
//
function deleteAll(mode,subsidiaryId,bespokeRecordType)
{
	var recordTypes = [];
	
	switch(mode)
	{
		case 'B':
			recordTypes = [];
			recordTypes.push(bespokeRecordType);
			
			break;
			
		case 'C':
		case 'A':
			recordTypes = ["
			               "vendor"]
	
			break;
			
		case 'c':
		case 'T':
			recordTypes = []
			break;
	}
	
	var filters = [];
	var columns = [];
	var results = {};
	
	if(subsidiaryId != null)
		{
		filters = [["subsidiary","anyof",subsidiaryId]]
		}
		
	for (var int = 0; int < recordTypes.length; int++) 
	{
		var recordType = recordTypes[int];
		var search = null;
		var searchResult = null;
		
		try
		{
			search = nlapiCreateSearch(recordType, filters, columns);
			searchResult = search.runSearch();
		}
		catch(err)
		{
			var error = err;
			search = null;
			searchResult = null;
			alert(err);
		}
		
		if (searchResult)
			{
				//Get the initial set of results
				//
				var start = 0;
				var end = 1000;
				var resultlen = 0;
				var searchResultSet = null;
				
				try
				{
					searchResultSet = searchResult.getResults(start, end);
					resultlen = searchResultSet.length;
				}
				catch(err)
				{
					var error = err;
					resultlen = 0;
					alert(err);
				}
				
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
				
				if(searchResultSet && searchResultSet.length > 0)
					{
						
						var recordCount = searchResultSet.length;
						results[recordType] = recordCount;
						
						if(mode.toUpperCase() != 'C')
							{
								for (var int2 = 0; int2 < searchResultSet.length; int2++) 
								{
									var recType = searchResultSet[int2].getRecordType();
									var recId = searchResultSet[int2].getId();
									
									var remaining = parseInt(nlapiGetContext().getRemainingUsage());
									
									if(remaining < 20)
										{
											nlapiYieldScript();
										}
									else
										{
											try
											{
												nlapiDeleteRecord(recType, recId);
											}
											catch(err)
											{
												var error = err;
												var dummy = '';
												alert(err);
											}
										}
								}
							}
					}
			}
	}

	return results;
}