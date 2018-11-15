/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 Nov 2018     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{
	//Get todays date as a string
	//
	var todaysDate = new Date();
	var today = nlapiDateToString(todaysDate);
	var periodNumber = libGetPeriod(today);
	
	//Get the parameters
	//
	var context = nlapiGetContext();
	var salesAccGroup = context.getSetting('SCRIPT', 'custscript_bbs_sales_acc_group');
	var salesAccFIT = context.getSetting('SCRIPT', 'custscript_bbs_sales_acc_fit');
	var salesAccMICE = context.getSetting('SCRIPT', 'custscript_bbs_sales_acc_mice');
	var salesAccB2C = context.getSetting('SCRIPT', 'custscript_bbs_sales_acc_b2c');
	
	var cosAccGroup = context.getSetting('SCRIPT', 'custscript_bbs_cogs_acc_group');
	var cosAccFIT = context.getSetting('SCRIPT', 'custscript_bbs_cogs_acc_fit');
	var cosAccMICE = context.getSetting('SCRIPT', 'custscript_bbs_cogs_acc_mice');
	var cosAccB2C = context.getSetting('SCRIPT', 'custscript_bbs_cogs_acc_b2c');
	
	var deferredRevenueAcc = context.getSetting('SCRIPT', 'custscript_bbs_def_revenue_acc');
	var deferredCostsAcc = context.getSetting('SCRIPT', 'custscript_bbs_def_costs_acc');
	
	
	//Create the search
	//
	var transactionSearch = nlapiCreateSearch("transaction",null,
			[
			   ["type","anyof","VendCred","VendBill","CustInvc","CustCred"], 
			   "AND", 
			   ["mainline","is","F"], 
			   "AND", 
			   ["taxline","is","F"], 
			   "AND", 
			   ["shipping","is","F"], 
			   "AND", 
			   ["cogs","is","F"], 
			   "AND", 
			   ["custbodyoverhead","is","F"], 
			   "AND", 
			   ["custcol_bbs_journal_posted","is","F"], 
			   "AND", 
			   ["line.csegbkref.custrecord_arrival_date","onorbefore",today]
			], 
			[
			   new nlobjSearchColumn("subsidiary").setSort(false), 
			   new nlobjSearchColumn("tranid"), 
			   new nlobjSearchColumn("type"), 
			   new nlobjSearchColumn("department"), 
			   new nlobjSearchColumn("class"), 
			   new nlobjSearchColumn("line.csegdm"), 
			   new nlobjSearchColumn("line.csegsm"), 
			   new nlobjSearchColumn("line.csegbkref"), 
			   new nlobjSearchColumn("currency"), 
			   new nlobjSearchColumn("exchangerate"), 
			   new nlobjSearchColumn("fxamount"), 
			   new nlobjSearchColumn("formulacurrency").setFormula("{fxamount} *  {exchangerate}")
			]
			);
	
	//Get the search results
	//
	var transactionSearchResults = getResults(transactionSearch);
	
	//Do we have any results to process
	//
	if(transactionSearchResults != null && transactionSearchResults.length > 0)
		{
			//Loop through the results & process
			//
			for (var int = 0; int < transactionSearchResults.length; int++) 
				{
					checkResources();
					
					var subsidiary = transactionSearchResults[int].getValue("subsidiary");
					var documentNumber = transactionSearchResults[int].getValue("tranid");
					var tranType = transactionSearchResults[int].getValue("type");
					var businessLine = transactionSearchResults[int].getValue("department");
					var serviceType = transactionSearchResults[int].getValue("class");
					var destinationMarket = transactionSearchResults[int].getValue("line.csegdm");
					var sourceMarket = transactionSearchResults[int].getValue("line.csegsm");
					var bookingReference = transactionSearchResults[int].getValue("line.csegbkref");
					var currency = transactionSearchResults[int].getValue("currency");
					var exchangeRate = Number(transactionSearchResults[int].getValue("exchangerate"));
					var amount = Number(transactionSearchResults[int].getValue("fxamount"));
					
					amount = amount * exchangeRate;
					
					//Create the journal
					//
					var journalRecord = nlapiCreateRecord('journalentry', {recordmode: 'dynamic'});
					
					//Header values
					//
					journalRecord.setFieldValue('subsidiary', subsidiary);
					journalRecord.setFieldValue('trandate', today);
					journalRecord.setFieldValue('currency', currency);
					journalRecord.setFieldValue('postingperiod', periodNumber);
					
					//Work out what account we should use
					//
					var salesAcc = null;
					var cogsAcc = null;
					
					switch (tranType)
						{
							case 'invoice':
								salesAcc = getSalesAccount(businessLine);
								
								journalRecord.selectNewLineItem('line');
								journalRecord.setCurrentLineItemValue('line', 'account', deferredRevenueAcc);
								journalRecord.setCurrentLineItemValue('line', 'debit', amount);
								journalRecord.setCurrentLineItemValue('line', 'department', businessLine);
								journalRecord.setCurrentLineItemValue('line', 'class', serviceType);
								journalRecord.setCurrentLineItemValue('line', 'csegdm', destinationMarket);
								journalRecord.setCurrentLineItemValue('line', 'csegsm', sourceMarket);
								journalRecord.setCurrentLineItemValue('line', 'csegbkref', bookingReference);
								journalRecord.setCurrentLineItemValue('line', 'memo', documentNumber);
								journalRecord.commitLineItem('line'); 
								
								journalRecord.selectNewLineItem('line');
								journalRecord.setCurrentLineItemValue('line', 'account', salesAcc);
								journalRecord.setCurrentLineItemValue('line', 'credit', amount);
								journalRecord.setCurrentLineItemValue('line', 'department', businessLine);
								journalRecord.setCurrentLineItemValue('line', 'class', serviceType);
								journalRecord.setCurrentLineItemValue('line', 'csegdm', destinationMarket);
								journalRecord.setCurrentLineItemValue('line', 'csegsm', sourceMarket);
								journalRecord.setCurrentLineItemValue('line', 'csegbkref', bookingReference);
								journalRecord.setCurrentLineItemValue('line', 'memo', documentNumber);
								journalRecord.commitLineItem('line'); 
								
								break;
								
							case 'vendorbill':
								cogsAcc = getCogsAccount(businessLine);
								
								journalRecord.selectNewLineItem('line');
								journalRecord.setCurrentLineItemValue('line', 'account', deferredCostsAcc);
								journalRecord.setCurrentLineItemValue('line', 'credit', amount);
								journalRecord.setCurrentLineItemValue('line', 'department', businessLine);
								journalRecord.setCurrentLineItemValue('line', 'class', serviceType);
								journalRecord.setCurrentLineItemValue('line', 'csegdm', destinationMarket);
								journalRecord.setCurrentLineItemValue('line', 'csegsm', sourceMarket);
								journalRecord.setCurrentLineItemValue('line', 'csegbkref', bookingReference);
								journalRecord.setCurrentLineItemValue('line', 'memo', documentNumber);
								journalRecord.commitLineItem('line'); 
								
								journalRecord.selectNewLineItem('line');
								journalRecord.setCurrentLineItemValue('line', 'account', cogsAcc);
								journalRecord.setCurrentLineItemValue('line', 'debit', amount);
								journalRecord.setCurrentLineItemValue('line', 'department', businessLine);
								journalRecord.setCurrentLineItemValue('line', 'class', serviceType);
								journalRecord.setCurrentLineItemValue('line', 'csegdm', destinationMarket);
								journalRecord.setCurrentLineItemValue('line', 'csegsm', sourceMarket);
								journalRecord.setCurrentLineItemValue('line', 'csegbkref', bookingReference);
								journalRecord.setCurrentLineItemValue('line', 'memo', documentNumber);
								journalRecord.commitLineItem('line'); 
								
								break;
								
							case 'creditmemo':
								salesAcc = getSalesAccount(businessLine);
								
								journalRecord.selectNewLineItem('line');
								journalRecord.setCurrentLineItemValue('line', 'account', deferredRevenueAcc);
								journalRecord.setCurrentLineItemValue('line', 'credit', amount);
								journalRecord.setCurrentLineItemValue('line', 'department', businessLine);
								journalRecord.setCurrentLineItemValue('line', 'class', serviceType);
								journalRecord.setCurrentLineItemValue('line', 'csegdm', destinationMarket);
								journalRecord.setCurrentLineItemValue('line', 'csegsm', sourceMarket);
								journalRecord.setCurrentLineItemValue('line', 'csegbkref', bookingReference);
								journalRecord.setCurrentLineItemValue('line', 'memo', documentNumber);
								journalRecord.commitLineItem('line'); 
								
								journalRecord.selectNewLineItem('line');
								journalRecord.setCurrentLineItemValue('line', 'account', salesAcc);
								journalRecord.setCurrentLineItemValue('line', 'debit', amount);
								journalRecord.setCurrentLineItemValue('line', 'department', businessLine);
								journalRecord.setCurrentLineItemValue('line', 'class', serviceType);
								journalRecord.setCurrentLineItemValue('line', 'csegdm', destinationMarket);
								journalRecord.setCurrentLineItemValue('line', 'csegsm', sourceMarket);
								journalRecord.setCurrentLineItemValue('line', 'csegbkref', bookingReference);
								journalRecord.setCurrentLineItemValue('line', 'memo', documentNumber);
								journalRecord.commitLineItem('line'); 
								
								break;
								
							case 'vendorcredit':
								cogsAcc = getCogsAccount(businessLine);
								
								journalRecord.selectNewLineItem('line');
								journalRecord.setCurrentLineItemValue('line', 'account', deferredCostsAcc);
								journalRecord.setCurrentLineItemValue('line', 'debit', amount);
								journalRecord.setCurrentLineItemValue('line', 'department', businessLine);
								journalRecord.setCurrentLineItemValue('line', 'class', serviceType);
								journalRecord.setCurrentLineItemValue('line', 'csegdm', destinationMarket);
								journalRecord.setCurrentLineItemValue('line', 'csegsm', sourceMarket);
								journalRecord.setCurrentLineItemValue('line', 'csegbkref', bookingReference);
								journalRecord.setCurrentLineItemValue('line', 'memo', documentNumber);
								journalRecord.commitLineItem('line'); 
								
								journalRecord.selectNewLineItem('line');
								journalRecord.setCurrentLineItemValue('line', 'account', cogsAcc);
								journalRecord.setCurrentLineItemValue('line', 'credit', amount);
								journalRecord.setCurrentLineItemValue('line', 'department', businessLine);
								journalRecord.setCurrentLineItemValue('line', 'class', serviceType);
								journalRecord.setCurrentLineItemValue('line', 'csegdm', destinationMarket);
								journalRecord.setCurrentLineItemValue('line', 'csegsm', sourceMarket);
								journalRecord.setCurrentLineItemValue('line', 'csegbkref', bookingReference);
								journalRecord.setCurrentLineItemValue('line', 'memo', documentNumber);
								journalRecord.commitLineItem('line'); 
								
								break;
						}
					
					var journalId = null;
					
					try
						{
							journalId = nlapiSubmitRecord(journalRecord, true, true);
						}
					catch(err)
						{
							journalId = null;
							nlapiLogExecution('ERROR', 'Error creating journal', err.message);
						}
				}
		}
}


//=============================================================================================
//=============================================================================================
//Functions
//=============================================================================================
//=============================================================================================
//
function libGetPeriod(periodDate)
{
	var returnValue = '';
	
	var accountingperiodSearch = nlapiSearchRecord("accountingperiod",null,
			[
			   ["startdate","onorbefore",periodDate], 
			   "AND", 
			   ["enddate","onorafter",periodDate], 
			   "AND", 
			   ["closed","is","F"], 
			   "AND", 
			   ["isyear","is","F"], 
			   "AND", 
			   ["isquarter","is","F"]
			], 
			[
			   new nlobjSearchColumn("periodname",null,null), 
			   new nlobjSearchColumn("startdate",null,null).setSort(false)
			]
			);
	
	if(accountingperiodSearch && accountingperiodSearch.length == 1)
		{
			returnValue = accountingperiodSearch[0].getId();
		}
	
	return returnValue;
}

function getCogsAccount(_businessLine)
{
	var returnedAccount = null;
	
	switch(_businessLine)
		{
			case '1': //FIT
				
				returnedAccount = cogsAccFIT;
				break;
				
			case '2': //MICE
				
				returnedAccount = cogsAccMICE;
				break;
				
			case '3': //Group
				
				returnedAccount = cogsAccGroup;
				break;
				
			case '4': //B2C
				
				returnedAccount = cogsAccB2C;
				break;
		}
	
	return returnedAccount;
}

function getSalesAccount(_businessLine)
{
	var returnedAccount = null;
	
	switch(_businessLine)
		{
			case '1': //FIT
				
				returnedAccount = salesAccFIT;
				break;
				
			case '2': //MICE
				
				returnedAccount = salesAccMICE;
				break;
				
			case '3': //Group
				
				returnedAccount = salesAccGroup;
				break;
				
			case '4': //B2C
				
				returnedAccount = salesAccB2C;
				break;
		}
	
	return returnedAccount;
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