/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 Jan 2019     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{
	nlapiLogExecution('DEBUG', 'Starting', '');
	
	var assemblyitemSearch = getResults(nlapiCreateSearch("assemblyitem",
			[
			   ["type","anyof","Assembly"], 
			   "AND", 
			   ["class","anyof","@NONE@"], 
			   "AND", 
			   ["memberitem.class","noneof","13"], 
			   "AND", 
			   ["memberitem.class","noneof","@NONE@"]
			], 
			[
			   new nlobjSearchColumn("internalid").setSort(false),
			   //new nlobjSearchColumn("itemid"), 
			   //new nlobjSearchColumn("displayname"), 
			   //new nlobjSearchColumn("description"), 
			   //new nlobjSearchColumn("class"), 
			   //new nlobjSearchColumn("memberitem"), 
			   new nlobjSearchColumn("class","memberItem",null)
			]
			));
	
	nlapiLogExecution('DEBUG', 'Record count = ', assemblyitemSearch.length);
	
	if(assemblyitemSearch != null && assemblyitemSearch.length > 0)
		{
			for (var int = 0; int < assemblyitemSearch.length; int++) 
				{
					if(int%10 == 0)
						{
							checkResources();
						}
					
					var assemblyId = assemblyitemSearch[int].getId();
					var componentCategory = assemblyitemSearch[int].getValue("class","memberItem");
					
					nlapiSubmitField('assemblyitem', assemblyId, 'class', componentCategory, false);
				}
		}
	
	nlapiLogExecution('DEBUG', 'Finished', '');
}

//=====================================================================
//Functions
//=====================================================================
//
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

function checkResources()
{
	var remaining = parseInt(nlapiGetContext().getRemainingUsage());
	
	if(remaining < 500)
		{
			var yieldState = nlapiYieldScript();
			nlapiLogExecution('DEBUG', 'Yield Status', yieldState.status + ' ' + yieldState.size + ' ' +  yieldState.reason + ' ' + yieldState.information);
		}
}
