/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       01 Apr 2019     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{

	var budgetimportSearch = nlapiSearchRecord("budgetimport",null,
			[
			], 
			[
			   new nlobjSearchColumn("account").setSort(false), 
			   new nlobjSearchColumn("year"), 
			   new nlobjSearchColumn("department"), 
			   new nlobjSearchColumn("subsidiary"), 
			   new nlobjSearchColumn("location"), 
			   new nlobjSearchColumn("class"), 
			   new nlobjSearchColumn("customer"), 
			   new nlobjSearchColumn("amount"), 
			   new nlobjSearchColumn("category"), 
			   new nlobjSearchColumn("global"), 
			   new nlobjSearchColumn("item"), 
			   new nlobjSearchColumn("currency")
			]
			);
	/*
	var invoiceSearch = getResults(nlapiCreateSearch("transaction",
			[
			   ["type","anyof","VendCred","VendBill","CustCred"], 
			   "AND", 
			   [["datecreated","on","31-Mar-2019 11:59 pm"],"OR",["datecreated","on","1-Apr-2019 11:59 pm"]], 
			   "AND", 
			   ["mainline","is","T"], 
			   "AND", 
			   ["createdby","anyof","6"]
			], 
			[
			   new nlobjSearchColumn("tranid"), 
			   new nlobjSearchColumn("trandate").setSort(false), 
			   new nlobjSearchColumn("datecreated"), 
			   new nlobjSearchColumn("type"), 
			   new nlobjSearchColumn("createdby")
			]
			));
	*/
	
	/*
	var invoiceSearch = getResults(nlapiCreateSearch("invoice",
			[
			   ["type","anyof","CustInvc"], 
			   "AND", 
			   ["datecreated","on","31-Mar-2019"], 
			   "AND", 
			   ["mainline","is","T"]
			], 
			[
			   new nlobjSearchColumn("tranid"), 
			   new nlobjSearchColumn("trandate").setSort(false)
			]
			));
	*/
	
	for (var int = 0; int < invoiceSearch.length; int++) 
		{
			var recordId = invoiceSearch[int].getId();
			var recordType = invoiceSearch[int].getValue('type');
		
			try
				{
					nlapiDeleteRecord(translateType(recordType), recordId);
				}
			catch(err)
				{
				
				}
			 checkResources();
		}	
}

function checkResources()
{
	var remaining = parseInt(nlapiGetContext().getRemainingUsage());
	
	if(remaining < 100)
		{
			nlapiYieldScript();
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