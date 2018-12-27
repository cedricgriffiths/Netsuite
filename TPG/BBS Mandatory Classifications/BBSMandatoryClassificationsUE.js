/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 Nov 2018     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */
function classificationsBeforeSubmit(type)
{
	//Only worry about creating records
	//
	if(type == 'create')
		{
			var executionContext = nlapiGetContext().getExecutionContext();
			var performCheck = true;
			
			//Only interested in csv imports
			//
			if(executionContext == 'csvimport')
				{
					var newrecord = nlapiGetNewRecord();
					var recordType = newrecord.getRecordType();
					
					//If we are importing supplier invoices, then we need to check to see if it is an overhead
					//
					if( recordType == 'vendorbill')
						{
							var isOverhead = newrecord.getFieldValue('custbodyoverhead');
							
							if(isOverhead == 'T')
								{
									performCheck = false;
								}
						}
					
					if(performCheck)
						{
							var message = '';
							var itemLines = null;
							var expenseLines = null;
							
							try
								{
									itemLines = newrecord.getLineItemCount('item');
								}
							catch(err)
								{
									itemLines = null;
								}
							
							try
								{
									expenseLines = newrecord.getLineItemCount('expense');
								}
							catch(err)
								{
									expenseLines = null;
								}
							
							
							if(itemLines != null && itemLines != '')
								{
									for (var int = 1; int <= itemLines; int++) 
										{
											var lineBusinessLine = newrecord.getLineItemValue('item', 'department', int);
											var lineServiceType = newrecord.getLineItemValue('item', 'class', int);
											var lineSourceMarket = newrecord.getLineItemValue('item', 'custcol_csegsm', int);
											var lineDestinationMarket = newrecord.getLineItemValue('item', 'custcol_csegdm', int);
											var lineBookingReference = newrecord.getLineItemValue('item', 'custcol_csegbkref', int);
										
											message += (lineBusinessLine == null || lineBusinessLine == '' ? 'Item Line ' + int + ': Please enter a value for Business Line\n' : '');
											message += (lineServiceType == null || lineServiceType == '' ? 'Item Line ' + int + ': Please enter a value for Service Type\n' : '');
											message += (lineSourceMarket == null || lineSourceMarket == '' ? 'Item Line ' + int + ': Please enter a value for Source Market\n' : '');
											
											if(recordType == 'salesorder' || recordType == 'invoice' || recordType == 'creditmemo')
												{
													
												}
											else
												{
													message += (lineDestinationMarket == null || lineDestinationMarket == '' ? 'Item Line ' + int + ': Please enter a value for Destination Market\n' : '');
												}
											
											message += (lineBookingReference == null || lineBookingReference == '' ? 'Item Line ' + int + ': Please enter a value for Project\n' : '');
										}
								}
							
							if(expenseLines != null && expenseLines != '')
								{
									for (var int = 1; int <= expenseLines; int++) 
										{
											var lineBusinessLine = newrecord.getLineItemValue('expense', 'department', int);
											var lineServiceType = newrecord.getLineItemValue('expense', 'class', int);
											var lineSourceMarket = newrecord.getLineItemValue('expense', 'custcol_csegsm', int);
											var lineDestinationMarket = newrecord.getLineItemValue('expense', 'custcol_csegdm', int);
											var lineBookingReference = newrecord.getLineItemValue('expense', 'custcol_csegbkref', int);
										
											message += (lineBusinessLine == null || lineBusinessLine == '' ? 'Expense Line ' + int + ': Please enter a value for Business Line\n' : '');
											message += (lineServiceType == null || lineServiceType == '' ? 'Expense Line ' + int + ': Please enter a value for Service Type\n' : '');
											message += (lineSourceMarket == null || lineSourceMarket == '' ? 'Expense Line ' + int + ': Please enter a value for Source Market\n' : '');
											
											if(recordType == 'salesorder' || recordType == 'invoice' || recordType == 'creditmemo')
												{
													
												}
											else
												{
													message += (lineDestinationMarket == null || lineDestinationMarket == '' ? 'Expense Line ' + int + ': Please enter a value for Destination Market\n' : '');
												}
											
											message += (lineBookingReference == null || lineBookingReference == '' ? 'Expense Line ' + int + ': Please enter a value for Project\n' : '');
										}
								}
						
							
							if(message != '')
								{	
									throw nlapiCreateError('BBS_MISSING_CLASSIFICATIONS', message, true);
								}
						}
				}
		}
}
