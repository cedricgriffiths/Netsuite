/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       21 Feb 2019     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{
	var subsid = nlapiGetSubsidiary();
	nlapiLogExecution('DEBUG', 'Subsidiary = ', subsid);
	
	var context = nlapiGetContext();
	nlapiLogExecution('DEBUG', 'Running as = ', context.getName());
	
	context.getName()
	process_ytd();
	process_qtd();
}

function process_ytd()
{
	var thisYearSearch = nlapiLoadSearch(null, 'customsearch_bbs_sales_this_year');
	
	var columns = thisYearSearch.getColumns()
	var thisYearSearchResults = getResults(thisYearSearch);
	
	if(thisYearSearchResults != null && thisYearSearchResults.length > 0)
		{
			for (var int = 0; int < thisYearSearchResults.length; int++) 
				{
					checkResources();
					
					var salesRepId = thisYearSearchResults[int].getValue(columns[0]);
					var ytdValue = thisYearSearchResults[int].getValue(columns[2]);
				
					if(salesRepId != null && salesRepId != '')
						{
							try
								{
									nlapiSubmitField('employee', salesRepId, 'custentity_bbs_sales_this_year', ytdValue, false);
								}
							catch(err)
								{
									nlapiLogExecution('ERROR', 'Error updating employee with ytd sales id = ' + salesRepId, err.message);
								}
						}
				}
		}	

}

function process_qtd()
{
	var thisQuarterSearch = nlapiLoadSearch(null, 'customsearch_bbs_sales_this_quarter');
	
	var columns = thisQuarterSearch.getColumns()
	var thisQuarterSearchResults = getResults(thisQuarterSearch);
	
	if(thisQuarterSearchResults != null && thisQuarterSearchResults.length > 0)
		{
			for (var int = 0; int < thisQuarterSearchResults.length; int++) 
				{
					checkResources();
					
					var salesRepId = thisQuarterSearchResults[int].getValue(columns[0]);
					var qtdValue = thisQuarterSearchResults[int].getValue(columns[2]);
					
					if(salesRepId != null && salesRepId != '')
						{
							try
								{
									nlapiSubmitField('employee', salesRepId, 'custentity_bbs_sales_this_quarter', qtdValue, false);
								}
							catch(err)
								{
									nlapiLogExecution('ERROR', 'Error updating employee with qtd sales id = ' + salesRepId, err.message);
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
	var pageSize = 100;
	var start = 0;
	var end = pageSize;
	var searchResultSet = searchResult.getResults(start, end);
	
	if(searchResultSet != null)
		{
			var resultlen = searchResultSet.length;
		
			//If there is more than 1000 results, page through them
			//
			while (resultlen == pageSize) 
				{
						start += pageSize;
						end += pageSize;
		
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
	
	if(remaining < 100)
		{
			nlapiYieldScript();
		}
}
