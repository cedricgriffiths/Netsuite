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
function invoicingScheduled(type) 
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
	var parameters = context.getSetting('SCRIPT', 'custscript_bbs_invoicing_params');
	var usersEmail = context.getUser();
	var parameterObject = JSON.parse(parameters);
	
	nlapiLogExecution('DEBUG', 'Parameters', parameters);
	
	var dateParam = parameterObject['date'];
	var periodParam = parameterObject['period'];
	var ffidsParam = parameterObject['ffids'];
	
	var emailMessage = 'The following invoices have been created;\n';
	
	for (var int = 0; int < ffidsParam.length; int++) 
		{
			//Check to see if we have enough resources to continue
			//
			if(int%10 == 0)
				{
					checkResources();
				}
			
			//Load the fulfilment record (10 GU's)
			//
			var fulfilmentRecord = nlapiLoadRecord('itemfulfillment', ffidsParam[int]);
			
			if(fulfilmentRecord)
				{
					//Get the shipping cost from the fulfilment
					//
					var fulfimentShippingCost = Number(fulfilmentRecord.getFieldValue('shippingcost'));
					
					//Get the sales order (10 GU's)
					//
					var salesOrderId = fulfilmentRecord.getFieldValue('createdfrom');
					
					if(salesOrderId != null && salesOrderId != '')
						{
							//Get the carrier info from the sales order
							//
							var orderShipCarrier = nlapiLookupField('salesorder', salesOrderId, 'shipcarrier', false);
							var orderShipMethod = nlapiLookupField('salesorder', salesOrderId, 'shipmethod', false);
						
							
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
								}
							
							//Have we got an invoice record
							//
							if(invoiceRecord)
								{
									invoiceRecord.setFieldValue('trandate', dateParam);
									invoiceRecord.setFieldValue('postingperiod', periodParam);
									invoiceRecord.setFieldValue('custbody_bbs_created_from_fulfillment',ffidsParam[int]);
									invoiceRecord.setFieldValue('shipcarrier', orderShipCarrier);
									invoiceRecord.setFieldValue('shipmethod', orderShipMethod);
									invoiceRecord.setFieldValue('shippingcost', fulfimentShippingCost);
									
									//Loop through the invoice lines setting the quantities to zero
									//
									var invLines = invoiceRecord.getLineItemCount('item');
									
									for (var int2 = 1; int2 <= invLines; int2++) 
										{
											try
												{
													invoiceRecord.selectLineItem('item', int2);
													invoiceRecord.setCurrentLineItemValue('item', 'quantity', 0);
													invoiceRecord.commitLineItem('item', false);
												}
											catch(err)
												{
													//Do nothing if we cannot set the quantity to zero.
													//This will be because the amount on the line is zero
												}
										}
									
									//Loop through the fulfilment lines looking for the corresponding lines on the invoice
									//
									var ffLines = fulfilmentRecord.getLineItemCount('item');
									
									for (var int3 = 1; int3 <= ffLines; int3++) 
										{
											//Get the fulfilment line no & the quantity
											//
											var ffOrderLineNumber = fulfilmentRecord.getLineItemValue('item', 'orderline', int3);
											var ffQuantity = Number(fulfilmentRecord.getLineItemValue('item', 'quantity', int3));
										
											//Now loop through the invoice lines to find the matching one
											//
											for (var int4 = 1; int4 <= invLines; int4++) 
												{
													var InvOrderLineNumber = invoiceRecord.getLineItemValue('item', 'orderline', int4);
												
													//Found a matching line on the invoice
													//
													if(InvOrderLineNumber == ffOrderLineNumber)
														{
															//Get the invoice item rate & the invoice vat rate
															var invRate = Number(invoiceRecord.getLineItemValue('item', 'rate', int4));
															var vatRate = Number((invoiceRecord.getLineItemValue('item', 'taxrate1', int4)).replace('%',''));
															
															//Set invoice values
															//
															try
																{
																	invoiceRecord.selectLineItem('item', int4);
																	invoiceRecord.setCurrentLineItemValue('item', 'quantity', ffQuantity);
																	invoiceRecord.commitLineItem('item', false);
																}	
															catch(err)
																{
																	//Do nothing if we cannot set the quantity to zero.
																	//This will be because the amount on the line is zero
																}
															
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
											
											emailMessage += "Error creating invoice for fulfilment id " + ffidsParam[int] + " - " +err.message + '\n';
											
											nlapiLogExecution('ERROR', 'Error creating invoice for fulfilment id ' + ffidsParam[int], err.message);
										}
									
									//Update the fulfilment with the related invoice
									//
									if(invoiceId != null && invoiceId != '')
										{
											//fulfilmentRecord.setFieldValue('custbody_bbs_related_invoice', invoiceId);
											
											try
												{
													//nlapiSubmitRecord(fulfilmentRecord, false, true);
													nlapiSubmitField('itemfulfillment', ffidsParam[int], 'custbody_bbs_related_invoice', invoiceId, false);
												}
											catch(err)
												{
													nlapiLogExecution('ERROR', 'Error updating fulfilment with invoice for fulfilment id ' + ffidsParam[int], err.message);
													
													emailMessage += 'Error updating fulfilment with invoice for fulfilment id ' + ffidsParam[int] + ' - ' + err.message + '\n';
												}
											
											//Get the invoice number from the new invoice
											//
											var invoiceNumber = nlapiLookupField('invoice', invoiceId, 'tranid');
											
											//Resolve the url for the link to the new invoice
											//
											var invoiceUrl = 'https://system.eu1.netsuite.com' + nlapiResolveURL('RECORD', 'invoice', invoiceId, 'view');
											
											//Add the invoice infor to the email message
											//
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
	nlapiSendEmail(usersEmail, usersEmail, 'Invoice Generation', emailMessage);
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
	
	if(remaining < 600)
		{
			nlapiYieldScript();
		}
}