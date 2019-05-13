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
var salesAccInterCo = null;
	
var cosAccGroup = null;
var cosAccFIT = null;
var cosAccMICE = null;
var cosAccB2C = null;
var cosAccInterCo = null;
	
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
	salesAccInterCo = context.getSetting('SCRIPT', 'custscript_bbs_sales_acc_inco');
	
	cosAccGroup = context.getSetting('SCRIPT', 'custscript_bbs_cogs_acc_group');
	cosAccFIT = context.getSetting('SCRIPT', 'custscript_bbs_cogs_acc_fit');
	cosAccMICE = context.getSetting('SCRIPT', 'custscript_bbs_cogs_acc_mice');
	cosAccB2C = context.getSetting('SCRIPT', 'custscript_bbs_cogs_acc_b2c');
	cosAccInterCo = context.getSetting('SCRIPT', 'custscript_bbs_cogs_acc_inco');
	
	deferredRevenueAcc = context.getSetting('SCRIPT', 'custscript_bbs_def_revenue_acc');
	deferredCostsAcc = context.getSetting('SCRIPT', 'custscript_bbs_def_costs_acc');
	
	openingBalancesAcc = context.getSetting('SCRIPT', 'custscript_bbs_open_bal_acc');
	
	//Create the search
	//
	var transactionSearch = nlapiCreateSearch("transaction",
			[
			   [
			    	[["type","anyof","VendBill","VendCred","CustCred","CustInvc"],"AND",["mainline","is","F"],"AND",["taxline","is","F"],"AND",["shipping","is","F"],"AND",["cogs","is","F"],"AND",["custbodyoverhead","is","F"],"AND",["custcol_bbs_journal_posted","is","F"]],
			    	"OR",
			    	[["type","anyof","Journal"],"AND",["custcol_bbs_journal_posted","is","F"],"AND",["custbody_bbs_system_generated","is","F"]]
			    ], 
			   "AND", 
			   ["custcol_csegbkref.custrecord_arrival_date","onorbefore","today"], 
			   "AND", 
			   ["custcol_csegbkref.custrecord_arrival_date","onorafter","01/01/2019"], 
			   "AND", 
			   ["account","anyof",deferredRevenueAcc,deferredCostsAcc]
			],

			/*
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
			   ["custcol_csegbkref.custrecord_arrival_date","onorbefore",today],
			   "AND", 
			   ["custcol_csegbkref.custrecord_arrival_date","onorafter","01/01/2019"], 
			   "AND", 
			   ["account","anyof",deferredRevenueAcc,deferredCostsAcc] //,openingBalancesAcc]
			   
			], */
			
			[
			   new nlobjSearchColumn("tranid").setSort(false), 
			   new nlobjSearchColumn("transactionnumber"), 
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
			   new nlobjSearchColumn("line"), 
			   new nlobjSearchColumn("lineuniquekey"), 
			   new nlobjSearchColumn("representingsubsidiary","customer",null), 
			   new nlobjSearchColumn("representingsubsidiary","vendor",null),
			   new nlobjSearchColumn("internalid","customer",null), 
			   new nlobjSearchColumn("internalid","vendor",null),
			   new nlobjSearchColumn("custcol_cseg_sales_dept"),
			   new nlobjSearchColumn("account"),
			   new nlobjSearchColumn("custrecord_arrival_date","custcol_csegbkref"),
			   new nlobjSearchColumn("memo")
			]
			);
	
	//Get the search results
	//
	var transactionSearchResults = getResults(transactionSearch);
	
	//Do we have any results to process
	//
	if(transactionSearchResults != null && transactionSearchResults.length > 0)
		{
			var lastTransactionId = '';
			var lastTransactionType = '';
			var journalRecord = null;
			var uniqueLineIds = {};
			
			//Loop through the results & process
			//
			for (var int = 0; int < transactionSearchResults.length; int++) 
				{
					checkResources();
					
					var subsidiary = transactionSearchResults[int].getValue("subsidiary");
					var documentNumber = transactionSearchResults[int].getValue("tranid");
					var transactionNumber = transactionSearchResults[int].getValue("transactionnumber");
					var businessLine = transactionSearchResults[int].getValue("department");
					var serviceType = transactionSearchResults[int].getValue("class");
					var destinationMarket = transactionSearchResults[int].getValue("custcol_csegdm");
					var sourceMarket = transactionSearchResults[int].getValue("custcol_csegsm");
					var bookingReference = transactionSearchResults[int].getValue("custcol_csegbkref");
					var originalCurrency = transactionSearchResults[int].getText("currency");
					var exchangeRate = Number(transactionSearchResults[int].getValue("exchangerate"));
					//var amount = Math.abs(Number(transactionSearchResults[int].getValue("fxamount")));
					var amount = Number(transactionSearchResults[int].getValue("fxamount"));
					var transactionLineNo = Number(transactionSearchResults[int].getValue("line"));
					var transactionId = transactionSearchResults[int].getId();
					var transactionUniqueKey = transactionSearchResults[int].getValue("lineuniquekey");
					var transactionType = transactionSearchResults[int].getValue("type");
					var custRepresentingSubsidiary = transactionSearchResults[int].getValue("representingsubsidiary","customer");
					var suppRepresentingSubsidiary = transactionSearchResults[int].getValue("representingsubsidiary","vendor");
					var custInternalId = transactionSearchResults[int].getValue("internalid","customer");
					var suppInternalId = transactionSearchResults[int].getValue("internalid","vendor");
					var salesDepartment = transactionSearchResults[int].getValue("custcol_cseg_sales_dept");
					var originalAccount = transactionSearchResults[int].getValue("account");
					var travelDate = transactionSearchResults[int].getValue("custrecord_arrival_date","custcol_csegbkref");
					var memo = transactionSearchResults[int].getValue("memo");
					
					var originalCurrenyAmount = amount;
					
					amount = (amount * exchangeRate).round(2);
					
					//Has the transaction number changed
					//
					if(transactionId != lastTransactionId)
						{
							//If we have a journal to save, then save it
							//
							if(journalRecord != null)
								{
									//Commit the previous journal
									//
									saveJournal(journalRecord, lastTransactionType, lastTransactionId, uniqueLineIds);
								}
							
							//Save the transaction number & type
							//
							lastTransactionId = transactionId;
							lastTransactionType = transactionType;
							
							//Clear out the list of unique line id's
							//
							for ( var uniqueLineId in uniqueLineIds) 
								{
									delete uniqueLineIds[uniqueLineId];
								}
							
							//Get the currency from the subsidiary
							//
							var currency = nlapiLookupField('subsidiary', subsidiary, 'currency', false);
							
							//Create the journal
							//
							journalRecord = nlapiCreateRecord('journalentry', {recordmode: 'dynamic'});
							
							//Header values
							//
							journalRecord.setFieldValue('subsidiary', subsidiary);
							journalRecord.setFieldValue('trandate', today);
							journalRecord.setFieldValue('currency', currency);
							journalRecord.setFieldValue('custbody_bbs_system_generated','T');
							
							//Fill in the To Subsidiary if intercompany posting
							//
							if(custRepresentingSubsidiary != null && custRepresentingSubsidiary != '')
								{
									journalRecord.setFieldValue('tosubsidiary', custRepresentingSubsidiary);
								}
							
							if(suppRepresentingSubsidiary != null && suppRepresentingSubsidiary != '')
								{
									journalRecord.setFieldValue('tosubsidiary', suppRepresentingSubsidiary);
								}
						
							
							//journalRecord.setFieldValue('exchangerate', exchangeRate);
							//journalRecord.setFieldValue('postingperiod', periodNumber);
						}
					
					//Save the unique line id, so we can update it to say we have created a journal later
					//
					uniqueLineIds[transactionUniqueKey] = transactionUniqueKey;
					
					//Work out what account we should use
					//
					var salesAcc = null;
					var cogsAcc = null;
					
					try
						{
							switch (transactionType)
								{
									case 'CustInvc':
										journalRecord.selectNewLineItem('line');
										journalRecord.setCurrentLineItemValue('line', 'account', deferredRevenueAcc);
										//journalRecord.setCurrentLineItemValue('line', 'account', originalAccount);
										
										if(amount >= 0)
											{
												//If we have a positive amount then this goes as a debit to the deferred revenue account
												//
												journalRecord.setCurrentLineItemValue('line', 'debit', amount);
											}
										else
											{
												//If its negative, then it goes as a credit to the deferred revenue account
												//
												journalRecord.setCurrentLineItemValue('line', 'credit', Math.abs(amount));
											}
										
										journalRecord.setCurrentLineItemValue('line', 'department', businessLine);
										journalRecord.setCurrentLineItemValue('line', 'class', serviceType);
										journalRecord.setCurrentLineItemValue('line', 'custcol_csegdm', destinationMarket);
										journalRecord.setCurrentLineItemValue('line', 'custcol_csegsm', sourceMarket);
										journalRecord.setCurrentLineItemValue('line', 'custcol_csegbkref', bookingReference);
										journalRecord.setCurrentLineItemValue('line', 'custcol_bbs_originating_transaction', transactionId);
										journalRecord.setCurrentLineItemValue('line', 'memo', memo);
										journalRecord.setCurrentLineItemValue('line', 'entity', custInternalId);
										journalRecord.setCurrentLineItemValue('line', 'custcol_cseg_sales_dept', salesDepartment);
										journalRecord.setCurrentLineItemValue('line', 'custcol_bbs_amo_for_cur_jour', originalCurrenyAmount);
										journalRecord.setCurrentLineItemValue('line', 'custcol_bbs_orig_trans_curr', originalCurrency);
										journalRecord.setCurrentLineItemValue('line', 'custcol_bbs_arrival_date', travelDate);
										journalRecord.commitLineItem('line'); 
										
										
										salesAcc = getSalesAccount(businessLine, custRepresentingSubsidiary);
										journalRecord.selectNewLineItem('line');
										journalRecord.setCurrentLineItemValue('line', 'account', salesAcc);
										
										if(amount >= 0)
											{
												//If we have a positive amount then this goes as a credit to the sales account
												//
												journalRecord.setCurrentLineItemValue('line', 'credit', amount);
											}
										else
											{
												//If its negative, then it goes as a debit to the sales account
												//
												journalRecord.setCurrentLineItemValue('line', 'debit', Math.abs(amount));
											}
										
										journalRecord.setCurrentLineItemValue('line', 'department', businessLine);
										journalRecord.setCurrentLineItemValue('line', 'class', serviceType);
										journalRecord.setCurrentLineItemValue('line', 'custcol_csegdm', destinationMarket);
										journalRecord.setCurrentLineItemValue('line', 'custcol_csegsm', sourceMarket);
										journalRecord.setCurrentLineItemValue('line', 'custcol_csegbkref', bookingReference);
										journalRecord.setCurrentLineItemValue('line', 'custcol_bbs_originating_transaction', transactionId);
										journalRecord.setCurrentLineItemValue('line', 'memo', memo);
										journalRecord.setCurrentLineItemValue('line', 'entity', custInternalId);
										journalRecord.setCurrentLineItemValue('line', 'custcol_cseg_sales_dept', salesDepartment);
										journalRecord.setCurrentLineItemValue('line', 'custcol_bbs_amo_for_cur_jour', originalCurrenyAmount);
										journalRecord.setCurrentLineItemValue('line', 'custcol_bbs_orig_trans_curr', originalCurrency);
										journalRecord.setCurrentLineItemValue('line', 'custcol_bbs_arrival_date', travelDate);
										
										if(custRepresentingSubsidiary != null && custRepresentingSubsidiary != '')
											{
												journalRecord.setCurrentLineItemValue('line', 'eliminate', 'T');
											}
										
										journalRecord.commitLineItem('line'); 
										
										break;
										
									case 'VendBill':
										journalRecord.selectNewLineItem('line');
										journalRecord.setCurrentLineItemValue('line', 'account', deferredCostsAcc);
										//journalRecord.setCurrentLineItemValue('line', 'account', originalAccount);
										
										if(amount >= 0)
											{
												//If we have a positive amount then this goes as a credit to the sales account
												//
												journalRecord.setCurrentLineItemValue('line', 'credit', amount);
											}
										else
											{
												//If its negative, then it goes as a debit to the sales account
												//
												journalRecord.setCurrentLineItemValue('line', 'debit', Math.abs(amount));
											}
										
										//journalRecord.setCurrentLineItemValue('line', 'credit', amount);
										journalRecord.setCurrentLineItemValue('line', 'department', businessLine);
										journalRecord.setCurrentLineItemValue('line', 'class', serviceType);
										journalRecord.setCurrentLineItemValue('line', 'custcol_csegdm', destinationMarket);
										journalRecord.setCurrentLineItemValue('line', 'custcol_csegsm', sourceMarket);
										journalRecord.setCurrentLineItemValue('line', 'custcol_csegbkref', bookingReference);
										journalRecord.setCurrentLineItemValue('line', 'custcol_bbs_originating_transaction', transactionId);
										journalRecord.setCurrentLineItemValue('line', 'memo', memo);
										journalRecord.setCurrentLineItemValue('line', 'entity', suppInternalId);
										journalRecord.setCurrentLineItemValue('line', 'custcol_bbs_amo_for_cur_jour', originalCurrenyAmount);
										journalRecord.setCurrentLineItemValue('line', 'custcol_bbs_orig_trans_curr', originalCurrency);
										journalRecord.setCurrentLineItemValue('line', 'custcol_bbs_arrival_date', travelDate);
										journalRecord.commitLineItem('line'); 
										
										cogsAcc = getCogsAccount(businessLine, suppRepresentingSubsidiary);
										journalRecord.selectNewLineItem('line');
										journalRecord.setCurrentLineItemValue('line', 'account', cogsAcc);
										
										if(amount >= 0)
											{
												//If we have a positive amount then this goes as a debit to the deferred revenue account
												//
												journalRecord.setCurrentLineItemValue('line', 'debit', amount);
											}
										else
											{
												//If its negative, then it goes as a credit to the deferred revenue account
												//
												journalRecord.setCurrentLineItemValue('line', 'credit', Math.abs(amount));
											}
										
										//journalRecord.setCurrentLineItemValue('line', 'debit', amount);
										journalRecord.setCurrentLineItemValue('line', 'department', businessLine);
										journalRecord.setCurrentLineItemValue('line', 'class', serviceType);
										journalRecord.setCurrentLineItemValue('line', 'custcol_csegdm', destinationMarket);
										journalRecord.setCurrentLineItemValue('line', 'custcol_csegsm', sourceMarket);
										journalRecord.setCurrentLineItemValue('line', 'custcol_csegbkref', bookingReference);
										journalRecord.setCurrentLineItemValue('line', 'custcol_bbs_originating_transaction', transactionId);
										journalRecord.setCurrentLineItemValue('line', 'memo', memo);
										journalRecord.setCurrentLineItemValue('line', 'entity', suppInternalId);
										journalRecord.setCurrentLineItemValue('line', 'custcol_bbs_amo_for_cur_jour', originalCurrenyAmount);
										journalRecord.setCurrentLineItemValue('line', 'custcol_bbs_orig_trans_curr', originalCurrency);
										journalRecord.setCurrentLineItemValue('line', 'custcol_bbs_arrival_date', travelDate);
										
										if(suppRepresentingSubsidiary != null && suppRepresentingSubsidiary != '')
											{
												journalRecord.setCurrentLineItemValue('line', 'eliminate', 'T');
											}
										
										journalRecord.commitLineItem('line'); 
										
										break;
										
									case 'CustCred':
										journalRecord.selectNewLineItem('line');
										journalRecord.setCurrentLineItemValue('line', 'account', deferredRevenueAcc);
										//journalRecord.setCurrentLineItemValue('line', 'account', originalAccount);
										
										if(amount >= 0)
											{
												//If we have a positive amount then this goes as a credit to the deferred revenue account
												//
												journalRecord.setCurrentLineItemValue('line', 'debit', amount);
											}
										else
											{
												//If its negative, then it goes as a debit to the deferred revenue account
												//
												journalRecord.setCurrentLineItemValue('line', 'credit', Math.abs(amount));
											}
										
										journalRecord.setCurrentLineItemValue('line', 'department', businessLine);
										journalRecord.setCurrentLineItemValue('line', 'class', serviceType);
										journalRecord.setCurrentLineItemValue('line', 'custcol_csegdm', destinationMarket);
										journalRecord.setCurrentLineItemValue('line', 'custcol_csegsm', sourceMarket);
										journalRecord.setCurrentLineItemValue('line', 'custcol_csegbkref', bookingReference);
										journalRecord.setCurrentLineItemValue('line', 'custcol_bbs_originating_transaction', transactionId);
										journalRecord.setCurrentLineItemValue('line', 'memo', memo);
										journalRecord.setCurrentLineItemValue('line', 'entity', custInternalId);
										journalRecord.setCurrentLineItemValue('line', 'custcol_cseg_sales_dept', salesDepartment);
										journalRecord.setCurrentLineItemValue('line', 'custcol_bbs_amo_for_cur_jour', originalCurrenyAmount);
										journalRecord.setCurrentLineItemValue('line', 'custcol_bbs_orig_trans_curr', originalCurrency);
										journalRecord.setCurrentLineItemValue('line', 'custcol_bbs_arrival_date', travelDate);
										journalRecord.commitLineItem('line'); 
										
										
										salesAcc = getSalesAccount(businessLine, custRepresentingSubsidiary);
										journalRecord.selectNewLineItem('line');
										journalRecord.setCurrentLineItemValue('line', 'account', salesAcc);
										
										if(amount >= 0)
											{
												//If we have a positive amount then this goes as a debit to the sales account
												//
												journalRecord.setCurrentLineItemValue('line', 'credit', amount);
											}
										else
											{
												//If its negative, then it goes as a credit to the sales account
												//
												journalRecord.setCurrentLineItemValue('line', 'debit', Math.abs(amount));
											}
									
										journalRecord.setCurrentLineItemValue('line', 'department', businessLine);
										journalRecord.setCurrentLineItemValue('line', 'class', serviceType);
										journalRecord.setCurrentLineItemValue('line', 'custcol_csegdm', destinationMarket);
										journalRecord.setCurrentLineItemValue('line', 'custcol_csegsm', sourceMarket);
										journalRecord.setCurrentLineItemValue('line', 'custcol_csegbkref', bookingReference);
										journalRecord.setCurrentLineItemValue('line', 'custcol_bbs_originating_transaction', transactionId);
										journalRecord.setCurrentLineItemValue('line', 'memo', memo);
										journalRecord.setCurrentLineItemValue('line', 'entity', custInternalId);
										journalRecord.setCurrentLineItemValue('line', 'custcol_cseg_sales_dept', salesDepartment);
										journalRecord.setCurrentLineItemValue('line', 'custcol_bbs_amo_for_cur_jour', originalCurrenyAmount);
										journalRecord.setCurrentLineItemValue('line', 'custcol_bbs_orig_trans_curr', originalCurrency);
										journalRecord.setCurrentLineItemValue('line', 'custcol_bbs_arrival_date', travelDate);
										
										if(custRepresentingSubsidiary != null && custRepresentingSubsidiary != '')
											{
												journalRecord.setCurrentLineItemValue('line', 'eliminate', 'T');
											}
										
										journalRecord.commitLineItem('line'); 
										
										break;
										
									case 'VendCred':
										journalRecord.selectNewLineItem('line');
										journalRecord.setCurrentLineItemValue('line', 'account', deferredCostsAcc);
										//journalRecord.setCurrentLineItemValue('line', 'account', originalAccount);
										
										if(amount >= 0)
											{
												//If we have a positive amount then this goes as a credit to the sales account
												//
												journalRecord.setCurrentLineItemValue('line', 'credit', amount);
											}
										else
											{
												//If its negative, then it goes as a debit to the sales account
												//
												journalRecord.setCurrentLineItemValue('line', 'debit', Math.abs(amount));
											}
									
										
										//journalRecord.setCurrentLineItemValue('line', 'debit', amount);
										journalRecord.setCurrentLineItemValue('line', 'department', businessLine);
										journalRecord.setCurrentLineItemValue('line', 'class', serviceType);
										journalRecord.setCurrentLineItemValue('line', 'custcol_csegdm', destinationMarket);
										journalRecord.setCurrentLineItemValue('line', 'custcol_csegsm', sourceMarket);
										journalRecord.setCurrentLineItemValue('line', 'custcol_csegbkref', bookingReference);
										journalRecord.setCurrentLineItemValue('line', 'custcol_bbs_originating_transaction', transactionId);
										journalRecord.setCurrentLineItemValue('line', 'memo', memo);
										journalRecord.setCurrentLineItemValue('line', 'entity', suppInternalId);
										journalRecord.setCurrentLineItemValue('line', 'custcol_bbs_amo_for_cur_jour', originalCurrenyAmount);
										journalRecord.setCurrentLineItemValue('line', 'custcol_bbs_orig_trans_curr', originalCurrency);
										journalRecord.setCurrentLineItemValue('line', 'custcol_bbs_arrival_date', travelDate);
										journalRecord.commitLineItem('line'); 
										
										cogsAcc = getCogsAccount(businessLine, suppRepresentingSubsidiary);
										journalRecord.selectNewLineItem('line');
										journalRecord.setCurrentLineItemValue('line', 'account', cogsAcc);
										
										if(amount >= 0)
											{
												//If we have a positive amount then this goes as a credit to the sales account
												//
												journalRecord.setCurrentLineItemValue('line', 'debit', amount);
											}
										else
											{
												//If its negative, then it goes as a debit to the sales account
												//
												journalRecord.setCurrentLineItemValue('line', 'credit', Math.abs(amount));
											}
								
										
										//journalRecord.setCurrentLineItemValue('line', 'credit', amount);
										journalRecord.setCurrentLineItemValue('line', 'department', businessLine);
										journalRecord.setCurrentLineItemValue('line', 'class', serviceType);
										journalRecord.setCurrentLineItemValue('line', 'custcol_csegdm', destinationMarket);
										journalRecord.setCurrentLineItemValue('line', 'custcol_csegsm', sourceMarket);
										journalRecord.setCurrentLineItemValue('line', 'custcol_csegbkref', bookingReference);
										journalRecord.setCurrentLineItemValue('line', 'custcol_bbs_originating_transaction', transactionId);
										journalRecord.setCurrentLineItemValue('line', 'memo', memo);
										journalRecord.setCurrentLineItemValue('line', 'entity', suppInternalId);
										journalRecord.setCurrentLineItemValue('line', 'custcol_bbs_amo_for_cur_jour', originalCurrenyAmount);
										journalRecord.setCurrentLineItemValue('line', 'custcol_bbs_orig_trans_curr', originalCurrency);
										journalRecord.setCurrentLineItemValue('line', 'custcol_bbs_arrival_date', travelDate);
										
										if(suppRepresentingSubsidiary != null && suppRepresentingSubsidiary != '')
											{
												journalRecord.setCurrentLineItemValue('line', 'eliminate', 'T');
											}
										
										journalRecord.commitLineItem('line'); 
										
										break;
								}
						}
					catch(err)
						{
							nlapiLogExecution('ERROR', 'Error processing transaction id ' + transactionId, err.message);
						}
				}
			
			//Save the last journal record
			//
			saveJournal(journalRecord, lastTransactionType, lastTransactionId, uniqueLineIds);
		}
}


//=============================================================================================
//=============================================================================================
//Functions
//=============================================================================================
//=============================================================================================
//
function saveJournal(_journalRecord, _transactionType, _transactionNumber, _uniqueLineIds)
{
	//Save the journal
	//
	var journalId = null;
	
	try
		{
			journalId = nlapiSubmitRecord(_journalRecord, true, true);
		}
	catch(err)
		{
			journalId = null;
			var message = err.message;
			nlapiLogExecution('ERROR', 'Error creating journal', err.message);
		}
	
	//If the journal saved ok, then update the line to say we have processed it
	//
	if(journalId != null)
		{
			//Load the source transaction record
			//
			var sourceTransactionRecord = null;
			
			try
				{
					sourceTransactionRecord = nlapiLoadRecord(translateType(_transactionType), _transactionNumber);
				}
			catch(err)
				{
					sourceTransactionRecord = null;
					nlapiLogExecution('ERROR', 'Error loading source transaction', err.message);
				}
			
			//Have we got the source transaction record?
			//
			if(sourceTransactionRecord)
				{
					var transactionItemLines = sourceTransactionRecord.getLineItemCount('item');
					var transactionExpenseLines = sourceTransactionRecord.getLineItemCount('expense');
					var transactionJournalLines = sourceTransactionRecord.getLineItemCount('line');
					
					//Loop through the journal lines
					//
					if(transactionJournalLines != null && transactionJournalLines != '')
						{
							for (var int2 = 1; int2 <= transactionJournalLines; int2++) 
								{
									var lineUniqueKey = sourceTransactionRecord.getLineItemValue('line', 'lineuniquekey', int2);
									
									if(_uniqueLineIds[lineUniqueKey])
										{
											sourceTransactionRecord.setLineItemValue('line', 'custcol_bbs_journal_posted', int2, 'T');
										}
								}
						}
					
					//Loop through the item lines
					//
					if(transactionItemLines != null && transactionItemLines != '')
						{
							for (var int2 = 1; int2 <= transactionItemLines; int2++) 
								{
									var lineUniqueKey = sourceTransactionRecord.getLineItemValue('item', 'lineuniquekey', int2);
									
									if(_uniqueLineIds[lineUniqueKey])
										{
											sourceTransactionRecord.setLineItemValue('item', 'custcol_bbs_journal_posted', int2, 'T');
										}
								}
						}
					
					//Loop through the expense lines
					//
					if(transactionExpenseLines != null && transactionExpenseLines != '')
						{
							for (var int3 = 1; int3 <= transactionExpenseLines; int3++) 
								{
									var lineUniqueKey = sourceTransactionRecord.getLineItemValue('expense', 'lineuniquekey', int3);
									
									if(_uniqueLineIds[lineUniqueKey])
										{
											sourceTransactionRecord.setLineItemValue('expense', 'custcol_bbs_journal_posted', int3, 'T');
										}
								}
						}
					
					//See if we can update the source transaction record to say we have posted the journal
					//
					try
						{
							nlapiSubmitRecord(sourceTransactionRecord, false, true);
						}
					catch(err)
						{
							nlapiLogExecution('ERROR', 'Error updating source transaction, deleting created journal', err.message);
						
							//If we cannot update the original transaction the we should delete the journal we created
							//
							try
								{
									nlapiDeleteRecord('journalentry', journalId);
								}
							catch(err)
								{
									nlapiLogExecution('ERROR', 'Cannot remove newly create journal', err.message);
								}
						}
				}
		}	
}

function translateType(_transactionType)
{
	var realTransactionType = null;
	
	switch(_transactionType)
		{
			case 'Journal':
				
				realTransactionType = 'journalentry';
				break;
			
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

function getCogsAccount(_businessLine, _suppRepresentingSubsidiary)
{
	var returnedAccount = null;
	
	if(_suppRepresentingSubsidiary != null && _suppRepresentingSubsidiary != '')
		{
			returnedAccount = cosAccInterCo;
		}
	else
		{
			switch(_businessLine)
				{
					case '1': //FIT
						
						returnedAccount = cosAccFIT;
						break;
						
					case '2': //MICE
						
						returnedAccount = cosAccMICE;
						break;
						
					case '3': //Group
						
						returnedAccount = cosAccGroup;
						break;
						
					case '4': //B2C
						
						returnedAccount = cosAccB2C;
						break;
				}
		}
	return returnedAccount;
}

function getSalesAccount(_businessLine, _custRepresentingSubsidiary)
{
	var returnedAccount = null;
	
	if(_custRepresentingSubsidiary != null && _custRepresentingSubsidiary != '')
		{
			returnedAccount = salesAccInterCo;
		}
	else
		{
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