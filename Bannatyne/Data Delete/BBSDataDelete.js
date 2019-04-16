/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       16 Apr 2019     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{
	var cashsaleSearch = getResults(nlapiCreateSearch("cashsale",
			[
			   ["postingperiod","abs","143"], 
			   "AND", 
			   ["mainline","is","T"], 
			   "AND", 
			   ["type","anyof","CashSale"], 
			   "AND", 
			   ["custrecord_bbs_cash_sale.custrecord_bbs_cash_sale","noneof","@NONE@"], 
			   "AND", 
			   ["formulatext: case when {amount} != {custrecord_bbs_cash_sale.custrecordbbs_amount} then 1 else 0 end","is","1"]
			], 
			[
			   new nlobjSearchColumn("internalid"), 
			   new nlobjSearchColumn("tranid"), 
			   new nlobjSearchColumn("amount"), 
			   new nlobjSearchColumn("custrecordbbs_amount","CUSTRECORD_BBS_CASH_SALE")
			]
			));
	
	for (var int = 0; int < cashsaleSearch.length; int++) 
		{
			checkResources();
			
			var recordId = cashsaleSearch[int].getId();
			
			try
				{
					nlapiDeleteRecord('cashsale', recordId);
				}
			catch(err)
				{
					nlapiLogExecution('ERROR', err.message, recordId);
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

function translateType(_transactionType)
{
	var realTransactionType = null;
	
	switch(_transactionType)
		{
			case 'CustInvc':
				
				realTransactionType = 'invoice';
				break;
				
			case 'VendBill':
				
				realTransactionType = 'vendorbill';
				break;
				
			case 'CustCred':
				
				realTransactionType = 'creditmemo';
				break;
				
			case 'VendCred':
				
				realTransactionType = 'vendorcredit';
				break;	
		}
	
	return realTransactionType;
}

function checkResources()
{
	var remaining = parseInt(nlapiGetContext().getRemainingUsage());
	
	if(remaining < 100)
		{
			nlapiYieldScript();
		}
}

