/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       27 Apr 2018     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{

	var invoiceSearch = nlapiCreateSearch("invoice",
			[
			   ["type","anyof","CustInvc"], 
			   "AND", 
			   ["mainline","is","T"]
			], 
			[
			   new nlobjSearchColumn("tranid")
			]
			);
	
	var invoiceSearchResults = getResults(invoiceSearch);
	
	nlapiLogExecution('DEBUG', 'Invoice Count', invoiceSearchResults.length);
	
	for (var int = 0; int < invoiceSearchResults.length; int++) 
		{
			checkResources();
			
			var currentRecordId = invoiceSearchResults[int].getId();
			
			nlapiLogExecution('DEBUG', 'Processing Invoice #', currentRecordId);
			
		    var currentRec = nlapiLoadRecord('invoice',currentRecordId);
		    
		    // Get the number of line Time Tracking items submitted
		    lines = currentRec.getLineItemCount('time'); 
		    
		    //parse the list of time records
		    for ( var i=1; i<=lines; i++ )
		        {
			        //get the ID of the Time Tracking 
			        var timeRecId = currentRec.getLineItemValue('time', 'doc', i);
			        var timeSelected = currentRec.getLineItemValue('time', 'apply', i);
			        var timeQuantity = currentRec.getLineItemValue('time', 'quantity', i);
			        var timeRate = currentRec.getLineItemValue('time', 'rate', i);
			        var timeAmount = currentRec.getLineItemValue('time', 'amount', i);
			        
			        //if it's selected on the invoice, update its custom field
			        if (timeSelected == 'T')
			        	{
			                 nlapiSubmitField('timebill', timeRecId, 'custcol_bbs_related_invoice', currentRecordId );
			                 nlapiSubmitField('timebill', timeRecId, 'custcol_bbs_related_invoice_qty', timeQuantity );
			                 nlapiSubmitField('timebill', timeRecId, 'custcol_bbs_related_invoice_rate', timeRate );
			                 nlapiSubmitField('timebill', timeRecId, 'custcol_bbs_related_invoice_amt', timeAmount );
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
