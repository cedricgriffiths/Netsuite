/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       09 Mar 2018     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{

	var salestaxitemSearch = nlapiCreateSearch("taxgroup",
			[
			   ["country","anyof","US"], 
			   "AND", 
			   ["subsidiary","anyof","4"]
			], 
			[
			   new nlobjSearchColumn("subsidiary",null,null)
			   
			]
			);
	
	var taxSearchResult = salestaxitemSearch.runSearch();
	
	if (taxSearchResult)
		{
			//Get the initial set of results
			//
			var start = 0;
			var end = 1000;
			var resultlen = 0;
			var taxSearchResultSet = null;
			
			try
			{
				taxSearchResultSet = taxSearchResult.getResults(start, end);
				resultlen = taxSearchResultSet.length;
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
	
						var moreSearchResultSet = taxSearchResult.getResults(start, end);
						resultlen = moreSearchResultSet.length;
	
						taxSearchResultSet = taxSearchResultSet.concat(moreSearchResultSet);
				}
			
			for (var int = 0; int < taxSearchResultSet.length; int++) 
			{
				if(int%10 == 0)
					{
						if(Number(nlapiGetContext().getRemainingUsage()) <= 500)
							{
							nlapiYieldScript();
							}
					}
				var taxId = taxSearchResultSet[int].getId();
				
				var taxRecord = nlapiLoadRecord('taxgroup', taxId);
				taxRecord.setFieldValue('subsidiary', 1);
				
				try
					{
						nlapiSubmitRecord(taxRecord, false, true);
					}
				catch(err)
					{
						var errorMsg = err.message;
					}
			}
		}
}
