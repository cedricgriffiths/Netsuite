/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       31 May 2018     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{
	var today = new Date();
	var todayString = nlapiDateToString(today);
	
	var customrecord_cbc_contact_recordSearch = nlapiCreateSearch("customrecord_cbc_contact_record",
			[
			   ["custrecord_cbc_contact_reset_date","onorbefore",todayString]
			], 
			[
			   new nlobjSearchColumn("custrecord_cbc_contact_reset_days"), 
			   new nlobjSearchColumn("custrecord_cbc_contact_reset_date"), 
			   new nlobjSearchColumn("custrecord_cbc_contact_usage")
			]
			);
	
	var customrecord_cbc_contact_recordResults = getResults(customrecord_cbc_contact_recordSearch);
	
	for (var int = 0; int < customrecord_cbc_contact_recordResults.length; int++) 
		{
			checkResources();
			
			var resetDate = nlapiStringToDate(customrecord_cbc_contact_recordResults[int].getValue('custrecord_cbc_contact_reset_date'));
			var resetDays = Number(customrecord_cbc_contact_recordResults[int].getValue('custrecord_cbc_contact_reset_days'));
			var recordId = customrecord_cbc_contact_recordResults[int].getId();
			
			var newResetDate = nlapiAddDays(resetDate, resetDays);
			var newResetDateString = nlapiDateToString(newResetDate);
			
			var fieldArray = ['custrecord_cbc_contact_reset_date','custrecord_cbc_contact_usage'];
			var valueArray = [newResetDateString, '0'];
			
			nlapiSubmitField('customrecord_cbc_contact_record', recordId, fieldArray, valueArray, false);
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

function checkResources()
{
	var remaining = parseInt(nlapiGetContext().getRemainingUsage());
	
	if(remaining < 100)
		{
			nlapiYieldScript();
		}
}
