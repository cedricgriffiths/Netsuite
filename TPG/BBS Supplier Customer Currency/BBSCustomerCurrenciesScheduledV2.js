/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       04 Apr 2019     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{
	processResults('customer');
	processResults('vendor');
}

function processResults(_recordType)
{
	var firstTime = true;
	var previousRecordId = '';
	var currencies = {};
	
	var recordSearch = getResults(nlapiCreateSearch(_recordType,
			[
			], 
			[
			   new nlobjSearchColumn("entityid").setSort(false), 
			   new nlobjSearchColumn("subsidiary"), 
			   new nlobjSearchColumn("currency","mseSubsidiary",null)
			]
			));
	
	//Do we have results?
	//
	if(recordSearch != null && recordSearch.length > 0)
		{
			nlapiLogExecution('DEBUG', 'Record Type', _recordType);
			nlapiLogExecution('DEBUG', 'Record Count', recordSearch.length);
		
			//Loop through the results
			//
			for (var int = 0; int < recordSearch.length; int++) 
				{
					//Check resources
					//
					checkResources();
				
					//Get search data
					//
					var recordId = recordSearch[int].getId();
					var recordCurrencyId = recordSearch[int].getValue("currency","mseSubsidiary");
				
					//Is this the first time through the loop
					//
					if(firstTime)
						{
							firstTime = false;
							previousRecordId = recordId;
						}
					
					//If we are still on the same customer then accumulate the currencies
					//
					if(previousRecordId == recordId)
						{
							currencies[recordCurrencyId] = recordCurrencyId;
						}
					else
						{
							//If we are now on a new customer, we need to see if the previous customer needs its currencies updating
							//
							updateCurrencies(previousRecordId, currencies, _recordType);
							
							//Reset everything for the next customer
							//
							previousRecordId = recordId;
							
							for ( var currency in currencies) 
								{
									delete currencies[currency];
								}
						}
				}
			
			//At the end of the loop process the final customer
			//
			updateCurrencies(previousRecordId, currencies, _recordType);
		}
}

function updateCurrencies(_recordId, _currencies, _recType)
{
	var record = null;
	
	//Read the customer record
	//
	try
		{
			record = nlapiLoadRecord(_recType, _recordId);
		}
	catch(err)
		{
			record = null;
			nlapiLogExecution('ERROR', 'Error reading ' + _recType + ' with id = ' + _recordId, err.message);
		}
	
	//Record found?
	//
	if(record != null)
		{
			var currencyCount = record.getLineItemCount('currency');
			var recordUpdated = false;
			
			//Loop through all the currencies that have been found belonging to the subsidiaries
			//
			for ( var currency in _currencies) 
				{
					var currencyFound = false;
					
					//Can we find a matching currency in the currency sublist
					//
					for (var int = 1; int <= currencyCount; int++) 
						{
							var lineCurrency = record.getLineItemValue('currency', 'currency', int);
							
							if(lineCurrency == currency)
								{
									currencyFound = true;
									break;
								}
						}
					
					//If the currency does not exist, we need to add it
					//
					if(!currencyFound)
						{
							record.selectNewLineItem('currency');
							record.setCurrentLineItemValue('currency', 'currency', currency);
							record.commitLineItem('currency', false);
								
							recordUpdated = true;
						}
				}
			
			if(recordUpdated)
				{
					try
						{
							nlapiSubmitRecord(record, false, true);
						}
					catch(err)
						{
							nlapiLogExecution('ERROR', 'Error updating ' + _recordType + ' id = ' + _recordId, err.message);
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