/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       05 Feb 2018     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{
	nlapiLogExecution('DEBUG', 'Information', 'Started');
	
	var customerSearch = nlapiSearchRecord("customer",null,
			[
			   ["subsidiary","anyof",6]
			], 
			[
			   new nlobjSearchColumn("entityid",null,null).setSort(false), 
			   new nlobjSearchColumn("altname",null,null), 
			   new nlobjSearchColumn("subsidiary",null,null)
			]
			);	
				
	for (var int = 0; int < customerSearch.length; int++) 
		{
			var customerId = customerSearch[int].getId();
			var customerRecord = nlapiLoadRecord('customer', customerId);
			
			var lines = customerRecord.getLineItemCount('itempricing');
			
			for (var int2 = lines; int2 >= 1; int2--) 
				{
					customerRecord.removeLineItem('itempricing', int2, false);
				}
			
			nlapiSubmitRecord(customerRecord, false, true);
			
			if(int % 50 == 0)
				{
					checkResources(int);
				}
		}
	
	nlapiLogExecution('DEBUG', 'Information', 'Finished Customer Item Prices');
	nlapiYieldScript();
	
	var assemblyitemSearch = nlapiCreateSearch("assemblyitem",
			[
			   ["type","anyof","Assembly"], 
			   "AND", 
			   ["name","doesnotstartwith","TG"], 
			   "AND", 
			   ["matrixchild","is","T"]
			], 
			[
			   new nlobjSearchColumn("internalid",null,null), 
			   new nlobjSearchColumn("itemid",null,null).setSort(false)
			]
			);
	
	var searchResult = assemblyitemSearch.runSearch();
	
	//Get the initial set of results
	//
	var start = 0;
	var end = 1000;
	var searchResultSet = searchResult.getResults(start, end);
	var resultlen = (searchResultSet == null ? 0 :  searchResultSet.length);

	//If there is more than 1000 results, page through them
	//
	while (resultlen == 1000) 
		{
			start += 1000;
			end += 1000;

			var moreSearchResultSet = searchResult.getResults(start, end);
			resultlen = moreSearchResultSet.length;

			searchResultSet = searchResultSet.concat(moreSearchResultSet);
			checkResources(s);
		}

	nlapiLogExecution('DEBUG', 'Information', 'Started Matrix Child Delete ' + (searchResultSet.length).toString());
	
	if(searchResultSet)
		{
			for (var int3 = 0; int3 < searchResultSet.length; int3++) 
				{
					var itemId = searchResultSet[int3].getId();
					
					try
					{
						nlapiDeleteRecord('assemblyitem', itemId);
					}
				catch(err)
					{
						nlapiLogExecution('DEBUG', 'Delete Error', itemId.toString() + ' ' + err.message);
					}
				
				if(int3 % 50 == 0)
					{
						checkResources(int3);
					}
				}
		}
	
	nlapiLogExecution('DEBUG', 'Information', 'Finished Matrix Child Delete');
	/*
	var assemblyitemSearch = nlapiCreateSearch("assemblyitem",
			[
			   ["type","anyof","Assembly"], 
			   "AND", 
			   ["name","doesnotstartwith","TG"], 
			   "AND", 
			   ["matrix","is","T"]
			], 
			[
			   new nlobjSearchColumn("internalid",null,null), 
			   new nlobjSearchColumn("itemid",null,null).setSort(false)
			]
			);
	
	var searchResult = assemblyitemSearch.runSearch();
	
	//Get the initial set of results
	//
	var start = 0;
	var end = 1000;
	var searchResultSet = searchResult.getResults(start, end);
	var resultlen = (searchResultSet == null ? 0 :  searchResultSet.length);

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

	nlapiLogExecution('DEBUG', 'Information', 'Started Matrix Parent Delete'+ (searchResultSet.length).toString());
	
	if(searchResultSet)
		{
			for (var int3 = 0; int3 < searchResultSet.length; int3++) 
				{
					var itemId = searchResultSet[int3].getId();
					
					try
						{
							nlapiDeleteRecord('assemblyitem', itemId);
						}
					catch(err)
						{
							nlapiLogExecution('DEBUG', 'Delete Error', itemId.toString() + ' ' + err.message);
						}
					
					if(int3 % 100 == 0)
						{
							checkResources();
						}
				}
		}
	*/
	
	nlapiLogExecution('DEBUG', 'Information', 'Finished Matrix Parent Delete');
	
}

function checkResources(counter)
{
	var remaining = parseInt(nlapiGetContext().getRemainingUsage());
	nlapiLogExecution('DEBUG', 'Checking Remaining Usage counter = ' + counter.toString(), remaining.toString());
	
	if(remaining < 500)
		{
			nlapiYieldScript();
		}
}