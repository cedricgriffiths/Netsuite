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

	var customerSearch = nlapiCreateSearch("customer",
			[
			   ["pricinggroup","noneof","@NONE@"]
			], 
			[
			   new nlobjSearchColumn("entityid",null,null), 
			   new nlobjSearchColumn("altname",null,null)
			]
			);
	
	var searchResult = customerSearch.runSearch();
	
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
			var customerId = searchResultSet[int].getId();
			
			var customerRecord = nlapiLoadRecord('customer', customerId);
			
			if(customerRecord)
				{
					var groupPricintCount = customerRecord.getLineItemCount('grouppricing');
					
					for (var int2 = groupPricintCount; int2 >= 1; int2--) 
					{
						customerRecord.removeLineItem('grouppricing', int2, false);
						
					}
					
					nlapiSubmitRecord(customerRecord, false, true);
				}
		
		}
}
