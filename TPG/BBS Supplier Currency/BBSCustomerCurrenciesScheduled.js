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
	var lastCustomerId = '';
	var lastCustomerHadDKK = false;
	
	var customerSearch = getResults(nlapiCreateSearch("customer",
			[
			   ["subsidiary","anyof","15"], 
			   "AND", 
			   ["currency","noneof","5"]
			], 
			[
			   new nlobjSearchColumn("entityid").setSort(false), 
			   new nlobjSearchColumn("currency","customerCurrencyBalance",null)
			]
			));
	
	if(customerSearch != null && customerSearch.length > 0)
		{
			for (var int = 0; int < customerSearch.length; int++) 
				{
					var customerId = customerSearch[int].getId();
					var supplierCurrency = customerSearch[int].getValue("currency","customerCurrencyBalance");
					
					//At the start of the loop set the last supplier to be the current supplier
					//
					if(int == 0)
						{
							lastCustomerId = customerId;
						}

					//If we have just changed suppliers, see if the last one had a DKK currency
					//
					if(lastCustomerId != customerId)
						{
							if(!lastCustomerHadDKK)
								{
									//If not, we need to add the currency to this supplier
									//
									createCurrency(lastCustomerId);
								}
							
							//Update the variables
							//
							lastCustomerId = customerId;
							lastCustomerHadDKK = false;
						}
					
					//Have we got a DKK currency
					//
					if(supplierCurrency == 'DKK')
						{
							lastCustomerHadDKK = true;
						}
							
				}
			
			if(!lastCustomerHadDKK)
				{
					//If not, we need to add the currency to this supplier
					//
					createCurrency(customerId);
				}
		}
}

function createCurrency(_customerId)
{
	checkResources();
	
	var customerRecord = null;
	
	try
		{
			customerRecord = nlapiLoadRecord('customer', _customerId);
		}
	catch(err)
		{
			customerRecord = null;
		}
	
	if(customerRecord != null)
		{
			customerRecord.selectNewLineItem('currency');
			customerRecord.setCurrentLineItemValue('currency', 'currency', '5');
			customerRecord.commitLineItem('currency', false);
			
			try
				{
					nlapiSubmitRecord(customerRecord, false, true);
				}
			catch(err)
				{
					nlapiLogExecution('ERROR', 'Error updating customer id = ' + _customerId, err.message);
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

function checkResources()
{
	var remaining = parseInt(nlapiGetContext().getRemainingUsage());
	
	if(remaining < 200)
		{
			nlapiYieldScript();
		}
}