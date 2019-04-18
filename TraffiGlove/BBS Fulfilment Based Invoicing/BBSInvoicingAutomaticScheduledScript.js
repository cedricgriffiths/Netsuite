/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       29 Aug 2017     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function invoicingAutoScheduled(type) 
{
	//=============================================================================================
	//=============================================================================================
	//Start of main code
	//=============================================================================================
	//=============================================================================================
	//

	//Get the parameters
	//
	var context = nlapiGetContext();
	var emailSender = context.getSetting('SCRIPT', 'custscript_bbs_auto_invoice_email');
	var emailReceiver = context.getSetting('SCRIPT', 'custscript_bbs_auto_invoice_email_to');
	
	var today = new Date();
	var dateParam = nlapiDateToString(today);
	var periodParam = getPeriod(dateParam);
	var ffidsParam = getFulfilments(dateParam)
	
	checkResources();
	
	var emailMessage = 'The following invoices have been created;\n';
	
	for (var int = 0; int < ffidsParam.length; int++) 
		{
			//Check to see if we have enough resources to continue
			//
			checkResources();
			
			//Load the fulfilment record (10 GU's)
			//
			var fulfilmentRecord = nlapiLoadRecord('itemfulfillment', ffidsParam[int]);
			
			if(fulfilmentRecord)
				{
					//Get the sales order (10 GU's)
					//
					var salesOrderId = fulfilmentRecord.getFieldValue('createdfrom');
					
					if(salesOrderId != null && salesOrderId != '')
						{
							//Transform the sales order into an invoice
							//
							var transformValues = {};
							transformValues['recordmode'] = 'dynamic';
							
							var invoiceRecord = null;
							
							//Trap for the possibility that the sales order is already fully billed & cannot therefore be transformed to an invoice
							//
							try
								{
									invoiceRecord = nlapiTransformRecord('salesorder', salesOrderId, 'invoice', {recordmode: 'dynamic'}); //(10 GU's)
								}
							catch(err)
								{
									invoiceRecord = null;
									emailMessage += "An error occured trying to transform sales order into an invoice - " + err.message + '\n';
									nlapiLogExecution('ERROR', 'Error transforming sales order (' + salesOrderId + ') to invoice', err.message);
								}
							
							//Have we got an invoice record
							//
							if(invoiceRecord)
								{
									invoiceRecord.setFieldValue('trandate', dateParam);
									invoiceRecord.setFieldValue('postingperiod', periodParam);
									invoiceRecord.setFieldValue('custbody_bbs_created_from_fulfillment',ffidsParam[int]);
									
									//Loop through the invoice lines setting the quantities to zero
									//
									var invLines = invoiceRecord.getLineItemCount('item');
									
									for (var int2 = 1; int2 <= invLines; int2++) 
										{
											//invoiceRecord.setCurrentLineItemValue('item', 'quantity', 0);
											invoiceRecord.setLineItemValue('item', 'quantity', int2, 0);
										}
									
									//Loop through the fulfilment lines looking for the corresponding lines on the invoice
									//
									var ffLines = fulfilmentRecord.getLineItemCount('item');
									
									for (var int3 = 1; int3 <= ffLines; int3++) 
										{
											var ffOrderLineNumber = fulfilmentRecord.getLineItemValue('item', 'orderline', int3);
											var ffQuantity = Number(fulfilmentRecord.getLineItemValue('item', 'quantity', int3));
										
											//Now loop through the invoice lines to find the matching one
											//
											for (var int4 = 1; int4 <= invLines; int4++) 
												{
													var InvOrderLineNumber = invoiceRecord.getLineItemValue('item', 'orderline', int4);
												
													if(InvOrderLineNumber == ffOrderLineNumber)
														{
															invoiceRecord.setLineItemValue('item', 'quantity', int4, ffQuantity);
															var invRate = Number(invoiceRecord.getLineItemValue('item', 'rate', int4));
															var invAmount = invRate * ffQuantity;
															var invEstUnitCost = Number(invoiceRecord.getLineItemValue('item', 'costestimaterate', int4));
															var invEstExtendedCost = invEstUnitCost * ffQuantity;
															
															invoiceRecord.setLineItemValue('item', 'amount', int4, invAmount);
															invoiceRecord.setLineItemValue('item', 'costestimate', int4, invEstExtendedCost);
															
															
															
															break;
														}
												}
										}
									
									//Loop through the invoice lines removing any zero quantity lines
									//
									var invLines = invoiceRecord.getLineItemCount('item');
									
									for (var int2 = invLines; int2 >= 1; int2--) 
										{
											var invoiceQty = Number(invoiceRecord.getLineItemValue('item', 'quantity', int2));
											
											if(invoiceQty == 0)
												{
													invoiceRecord.removeLineItem('item', int2, false);
												}
										}
									
									var invoiceId = null;
									
									try
										{
											invoiceId = nlapiSubmitRecord(invoiceRecord, false, true);  //(20 GU's)
										}
									catch(err)
										{
											invoiceId = null;
											emailMessage += "An error occured trying to save the invoice - " + err.message + '\n';
											nlapiLogExecution('ERROR', 'Error trying to save invoice', err.message);
										}
									
									//Update the fulfilment with the related invoice
									//
									if(invoiceId != null && invoiceId != '')
										{
											fulfilmentRecord.setFieldValue('custbody_bbs_related_invoice', invoiceId);
											
											try
												{
													nlapiSubmitRecord(fulfilmentRecord, false, true);
												}
											catch(err)
												{
													nlapiLogExecution('ERROR', 'Error updating fulfilment with invoice id', err.message);
												}
											
											var invoiceNumber = nlapiLookupField('invoice', invoiceId, 'tranid');
											
											var invoiceUrl = 'https://system.eu1.netsuite.com' + nlapiResolveURL('RECORD', 'invoice', invoiceId, 'view');
											emailMessage += 'Invoice ' + invoiceNumber.toString() + ' ' + invoiceUrl + '\n';
										}
								}
						}
				}
		}
	
	
	//Send the email to the user to say that we have finished
	//
	emailMessage += '\n';
	emailMessage += 'Invoice generation from fulfilments has completed\n';
	
	if(emailSender != null && emailSender != '' && emailReceiver != null && emailReceiver != '')
		{
			nlapiSendEmail(emailSender, emailReceiver, 'Automatic Invoice Generation', emailMessage);
		}
	
	nlapiLogExecution('AUDIT', 'Email sent to ' + emailReceiver, emailMessage);
}

//=============================================================================================
//=============================================================================================
//Functions
//=============================================================================================
//=============================================================================================
//
function checkResources()
{
	var remaining = parseInt(nlapiGetContext().getRemainingUsage());
	
	if(remaining < 200)
		{
			nlapiYieldScript();
		}
}

function getPeriod(periodDate)
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

function getFulfilments(_dateString)
{
	var fulfilIds = [];
	
	var filterArray =  [
		                   ["custbody_bbs_related_invoice","anyof","@NONE@"],	//Not already been through this process
		                   "AND",
		                   ["type","anyof","ItemShip"],							//Fulfillments
		                   "AND",
		                   ["mainline","is","T"],								//Main line 
		                   "AND", 
		                   ["status","anyof","ItemShip:C"],						//Fulfilment status is "Shipped"
		                   "AND", 
		                   ["createdfrom","noneof","@NONE@"], 					//Created from is filled in
		                   "AND", 
		                   ["createdfrom.status","noneof","SalesOrd:G","SalesOrd:C","SalesOrd:H","SalesOrd:A"],			//Sales order not at "Billed","Cancelled","Closed","Pending Approval" status
		                   "AND",
		                   ["trandate","within",_dateString,_dateString],
		                   "AND",
		                   ["subsidiary","noneof","8"]							//Not Traffisafe
		                   ];

		var fulfillmentSearch = nlapiCreateSearch("itemfulfillment",filterArray,
			[
			   new nlobjSearchColumn("tranid",null,null)
			]
			);
		
		var searchResult = fulfillmentSearch.runSearch();
		
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
		
		//Populate the sublist
		//
		for (var int = 0; int < searchResultSet.length; int++) 
			{
				var ffIntId = searchResultSet[int].getId();
				fulfilIds.push(ffIntId);		
			}

	return fulfilIds;
}