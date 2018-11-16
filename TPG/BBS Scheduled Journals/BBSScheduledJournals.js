/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 Nov 2018     cedricgriffiths
 *
 */

var salesAccGroup = null;
var salesAccFIT = null;
var salesAccMICE = null;
var salesAccB2C = null;
	
var cosAccGroup = null;
var cosAccFIT = null;
var cosAccMICE = null;
var cosAccB2C = null;
	
var deferredRevenueAcc = null;
var deferredCostsAcc = null;
	
	
/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{
	Number.prototype.round = function(places) 
		{
			return +(Math.round(this + "e+" + places)  + "e-" + places);
		}
	
	//Get todays date as a string
	//
	var todaysDate = new Date();
	var today = nlapiDateToString(todaysDate);
	var periodNumber = libGetPeriod(today);
	
	//Get the parameters
	//
	var context = nlapiGetContext();
	salesAccGroup = context.getSetting('SCRIPT', 'custscript_bbs_sales_acc_group');
	salesAccFIT = context.getSetting('SCRIPT', 'custscript_bbs_sales_acc_fit');
	salesAccMICE = context.getSetting('SCRIPT', 'custscript_bbs_sales_acc_mice');
	salesAccB2C = context.getSetting('SCRIPT', 'custscript_bbs_sales_acc_b2c');
	
	cosAccGroup = context.getSetting('SCRIPT', 'custscript_bbs_cogs_acc_group');
	cosAccFIT = context.getSetting('SCRIPT', 'custscript_bbs_cogs_acc_fit');
	cosAccMICE = context.getSetting('SCRIPT', 'custscript_bbs_cogs_acc_mice');
	cosAccB2C = context.getSetting('SCRIPT', 'custscript_bbs_cogs_acc_b2c');
	
	deferredRevenueAcc = context.getSetting('SCRIPT', 'custscript_bbs_def_revenue_acc');
	deferredCostsAcc = context.getSetting('SCRIPT', 'custscript_bbs_def_costs_acc');
	
	
	//Create the search
	//
	var transactionSearch = nlapiCreateSearch("transaction",
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
			   ["custcol_csegbkref.custrecord_arrival_date","onorbefore",today]
			], 
			[
			   new nlobjSearchColumn("tranid").setSort(false), 
			   new nlobjSearchColumn("type"), 
			   new nlobjSearchColumn("department"), 
			   new nlobjSearchColumn("class"), 
			   new nlobjSearchColumn("custcol_csegsm"), 
			   new nlobjSearchColumn("custcol_csegdm"), 
			   new nlobjSearchColumn("custcol_csegbkref"), 
			   new nlobjSearchColumn("currency"), 
			   new nlobjSearchColumn("exchangerate"), 
			   new nlobjSearchColumn("fxamount"), 
			   new nlobjSearchColumn("formulacurrency").setFormula("{fxamount} *  {exchangerate}"), 
			   new nlobjSearchColumn("subsidiary"), 
			   new nlobjSearchColumn("line")
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
					var businessLine = transactionSearchResults[int].getValue("department");
					var serviceType = transactionSearchResults[int].getValue("class");
					var destinationMarket = transactionSearchResults[int].getValue("custcol_csegdm");
					var sourceMarket = transactionSearchResults[int].getValue("custcol_csegsm");
					var bookingReference = transactionSearchResults[int].getValue("custcol_csegbkref");
					//var currency = transactionSearchResults[int].getValue("currency");
					var exchangeRate = Number(transactionSearchResults[int].getValue("exchangerate"));
					var amount = Math.abs(Number(transactionSearchResults[int].getValue("fxamount")));
					var transactionLineNo = Number(transactionSearchResults[int].getValue("line"));
					var transactionId = Number(transactionSearchResults[int].getId());
					var transactionType = transactionSearchResults[int].getValue("type");
					
					amount = (amount * exchangeRate).round(2);
					
					//Get the currency from the subsidiary
					//
					var currency = nlapiLookupField('subsidiary', subsidiary, 'currency', false);
					
					//Create the journal
					//
					var journalRecord = nlapiCreateRecord('journalentry', {recordmode: 'dynamic'});
					
					//Header values
					//
					journalRecord.setFieldValue('subsidiary', subsidiary);
					journalRecord.setFieldValue('trandate', today);
					journalRecord.setFieldValue('currency', currency);
					//journalRecord.setFieldValue('exchangerate', exchangeRate);
					//journalRecord.setFieldValue('postingperiod', periodNumber);
					
					//Work out what account we should use
					//
					var salesAcc = null;
					var cogsAcc = null;
					
					switch (transactionType)
						{
							case 'CustInvc':
								salesAcc = getSalesAccount(businessLine);
								
								journalRecord.selectNewLineItem('line');
								journalRecord.setCurrentLineItemValue('line', 'account', deferredRevenueAcc);
								journalRecord.setCurrentLineItemValue('line', 'debit', amount);
								journalRecord.setCurrentLineItemValue('line', 'department', businessLine);
								journalRecord.setCurrentLineItemValue('line', 'class', serviceType);
								journalRecord.setCurrentLineItemValue('line', 'custcol_csegdm', destinationMarket);
								journalRecord.setCurrentLineItemValue('line', 'custcol_csegsm', sourceMarket);
								journalRecord.setCurrentLineItemValue('line', 'custcol_csegbkref', bookingReference);
								journalRecord.setCurrentLineItemValue('line', 'memo', 'Invoice ' + documentNumber);
								journalRecord.commitLineItem('line'); 
								
								journalRecord.selectNewLineItem('line');
								journalRecord.setCurrentLineItemValue('line', 'account', salesAcc);
								journalRecord.setCurrentLineItemValue('line', 'credit', amount);
								journalRecord.setCurrentLineItemValue('line', 'department', businessLine);
								journalRecord.setCurrentLineItemValue('line', 'class', serviceType);
								journalRecord.setCurrentLineItemValue('line', 'custcol_csegdm', destinationMarket);
								journalRecord.setCurrentLineItemValue('line', 'custcol_csegsm', sourceMarket);
								journalRecord.setCurrentLineItemValue('line', 'custcol_segbkref', bookingReference);
								journalRecord.setCurrentLineItemValue('line', 'memo', 'Invoice ' + documentNumber);
								journalRecord.commitLineItem('line'); 
								
								break;
								
							case 'VendBill':
								cogsAcc = getCogsAccount(businessLine);
								
								journalRecord.selectNewLineItem('line');
								journalRecord.setCurrentLineItemValue('line', 'account', deferredCostsAcc);
								journalRecord.setCurrentLineItemValue('line', 'credit', amount);
								journalRecord.setCurrentLineItemValue('line', 'department', businessLine);
								journalRecord.setCurrentLineItemValue('line', 'class', serviceType);
								journalRecord.setCurrentLineItemValue('line', 'custcol_csegdm', destinationMarket);
								journalRecord.setCurrentLineItemValue('line', 'custcol_csegsm', sourceMarket);
								journalRecord.setCurrentLineItemValue('line', 'custcol_csegbkref', bookingReference);
								journalRecord.setCurrentLineItemValue('line', 'memo', 'Supplier Invoice ' + documentNumber);
								journalRecord.commitLineItem('line'); 
								
								journalRecord.selectNewLineItem('line');
								journalRecord.setCurrentLineItemValue('line', 'account', cogsAcc);
								journalRecord.setCurrentLineItemValue('line', 'debit', amount);
								journalRecord.setCurrentLineItemValue('line', 'department', businessLine);
								journalRecord.setCurrentLineItemValue('line', 'class', serviceType);
								journalRecord.setCurrentLineItemValue('line', 'custcol_csegdm', destinationMarket);
								journalRecord.setCurrentLineItemValue('line', 'custcol_csegsm', sourceMarket);
								journalRecord.setCurrentLineItemValue('line', 'custcol_csegbkref', bookingReference);
								journalRecord.setCurrentLineItemValue('line', 'memo', 'Supplier Invoice ' + documentNumber);
								journalRecord.commitLineItem('line'); 
								
								break;
								
							case 'CustCred':
								salesAcc = getSalesAccount(businessLine);
								
								journalRecord.selectNewLineItem('line');
								journalRecord.setCurrentLineItemValue('line', 'account', deferredRevenueAcc);
								journalRecord.setCurrentLineItemValue('line', 'credit', amount);
								journalRecord.setCurrentLineItemValue('line', 'department', businessLine);
								journalRecord.setCurrentLineItemValue('line', 'class', serviceType);
								journalRecord.setCurrentLineItemValue('line', 'custcol_csegdm', destinationMarket);
								journalRecord.setCurrentLineItemValue('line', 'custcol_csegsm', sourceMarket);
								journalRecord.setCurrentLineItemValue('line', 'custcol_csegbkref', bookingReference);
								journalRecord.setCurrentLineItemValue('line', 'memo', 'Credit Memo ' + documentNumber);
								journalRecord.commitLineItem('line'); 
								
								journalRecord.selectNewLineItem('line');
								journalRecord.setCurrentLineItemValue('line', 'account', salesAcc);
								journalRecord.setCurrentLineItemValue('line', 'debit', amount);
								journalRecord.setCurrentLineItemValue('line', 'department', businessLine);
								journalRecord.setCurrentLineItemValue('line', 'class', serviceType);
								journalRecord.setCurrentLineItemValue('line', 'custcol_csegdm', destinationMarket);
								journalRecord.setCurrentLineItemValue('line', 'custcol_csegsm', sourceMarket);
								journalRecord.setCurrentLineItemValue('line', 'custcol_csegbkref', bookingReference);
								journalRecord.setCurrentLineItemValue('line', 'memo', 'Credit Memo ' + documentNumber);
								journalRecord.commitLineItem('line'); 
								
								break;
								
							case 'VendCred':
								cogsAcc = getCogsAccount(businessLine);
								
								journalRecord.selectNewLineItem('line');
								journalRecord.setCurrentLineItemValue('line', 'account', deferredCostsAcc);
								journalRecord.setCurrentLineItemValue('line', 'debit', amount);
								journalRecord.setCurrentLineItemValue('line', 'department', businessLine);
								journalRecord.setCurrentLineItemValue('line', 'class', serviceType);
								journalRecord.setCurrentLineItemValue('line', 'custcol_csegdm', destinationMarket);
								journalRecord.setCurrentLineItemValue('line', 'custcol_csegsm', sourceMarket);
								journalRecord.setCurrentLineItemValue('line', 'custcol_csegbkref', bookingReference);
								journalRecord.setCurrentLineItemValue('line', 'memo', 'Supplier Credit ' + documentNumber);
								journalRecord.commitLineItem('line'); 
								
								journalRecord.selectNewLineItem('line');
								journalRecord.setCurrentLineItemValue('line', 'account', cogsAcc);
								journalRecord.setCurrentLineItemValue('line', 'credit', amount);
								journalRecord.setCurrentLineItemValue('line', 'department', businessLine);
								journalRecord.setCurrentLineItemValue('line', 'class', serviceType);
								journalRecord.setCurrentLineItemValue('line', 'custcol_csegdm', destinationMarket);
								journalRecord.setCurrentLineItemValue('line', 'custcol_csegsm', sourceMarket);
								journalRecord.setCurrentLineItemValue('line', 'custcol_csegbkref', bookingReference);
								journalRecord.setCurrentLineItemValue('line', 'memo', 'Supplier Credit ' + documentNumber);
								journalRecord.commitLineItem('line'); 
								
								break;
						}
					
					//Save the journal
					//
					var journalId = null;
					
					try
						{
							journalId = nlapiSubmitRecord(journalRecord, true, true);
						}
					catch(err)
						{
							journalId = null;
							var message = err.message;
							nlapiLogExecution('ERROR', 'Error creating journal', err.message);
						}
					
					//If the journal saved ok, then update the line to say we have processed it
					//
					
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
	
	if(remaining < 200)
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