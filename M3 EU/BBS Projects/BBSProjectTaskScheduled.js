/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       29 Jan 2019     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function projectTaskScheduled(type) 
{
	var projecttaskSearch = getResults(nlapiCreateSearch("projecttask",
			[
			   ["custevent3","is","T"]
			], 
			[
			   new nlobjSearchColumn("id").setSort(false), 
			   new nlobjSearchColumn("title"), 
			   new nlobjSearchColumn("company"), 
			   new nlobjSearchColumn("startdate"), 
			   new nlobjSearchColumn("enddate")
			]
			));
	
	if(projecttaskSearch != null && projecttaskSearch.length > 0)
		{
			for (var int = 0; int < projecttaskSearch.length; int++) 
				{
					var projectId = projecttaskSearch[int].getValue("company");
					var startDate = projecttaskSearch[int].getValue("enddate");
					var projectDate = null;
					
					try
						{
							projectDate = nlapiLookupField('job', projectId, 'custentity_bbs_actual_website_golive', false);
						}
					catch(err)
						{
							projectDate = null;
						}
					
					if(projectDate != null && projectDate != startDate)
						{
							try
								{
									nlapiSubmitField('job', projectId, 'custentity_bbs_actual_website_golive', startDate, true);
								}
							catch(err)
								{
									nlapiLogExecution('ERROR', 'Error updating project actual go live date', err.message);
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