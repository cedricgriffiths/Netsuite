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
	var lastSupplierId = '';
	var lastSupplierHadDKK = false;
	
	var vendorSearch = getResults(nlapiCreateSearch("vendor",
			[
			   ["subsidiary","anyof","15"], 
			   "AND", 
			   ["currency","noneof","5"]
			], 
			[
			   new nlobjSearchColumn("entityid").setSort(false), 
			   new nlobjSearchColumn("currency","VendorCurrencyBalance",null)
			]
			));
	
	if(vendorSearch != null && vendorSearch.length > 0)
		{
			for (var int = 0; int < vendorSearch.length; int++) 
				{
					var supplierId = vendorSearch[int].getId();
					var supplierCurrency = vendorSearch[int].getValue("currency","VendorCurrencyBalance");
					
					//At the start of the loop set the last supplier to be the current supplier
					//
					if(int == 0)
						{
							lastSupplierId = supplierId;
						}

					//If we have just changed suppliers, see if the last one had a DKK currency
					//
					if(lastSupplierId != supplierId)
						{
							if(!lastSupplierHadDKK)
								{
									//If not, we need to add the currency to this supplier
									//
									createCurrency(lastSupplierId);
								}
							
							//Update the variables
							//
							lastSupplierId = supplierId;
							lastSupplierHadDKK = false;
						}
					
					//Have we got a DKK currency
					//
					if(supplierCurrency == 'DKK')
						{
							lastSupplierHadDKK = true;
						}
							
				}
			
			if(!lastSupplierHadDKK)
				{
					//If not, we need to add the currency to this supplier
					//
					createCurrency(supplierId);
				}
		}
}

function createCurrency(_supplierId)
{
	checkResources();
	
	var supplierRecord = null;
	
	try
		{
			supplierRecord = nlapiLoadRecord('vendor', _supplierId);
		}
	catch(err)
		{
			supplierRecord = null;
		}
	
	if(supplierRecord != null)
		{
			supplierRecord.selectNewLineItem('currency');
			supplierRecord.setCurrentLineItemValue('currency', 'currency', '5');
			supplierRecord.commitLineItem('currency', false);
			
			try
				{
					nlapiSubmitRecord(supplierRecord, false, true);
				}
			catch(err)
				{
					nlapiLogExecution('ERROR', 'Error updating supplier id = ' + _supplierId, err.message);
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