/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       29 Apr 2019     cedricgriffiths
 *
 */


/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function returnAuthSaveRecord()
{
	var orderValidated = true;
	
	//Get the created from
	//
	var createdFromId = nlapiGetFieldValue('createdfrom');
	var createdFromText = nlapiGetFieldText('createdfrom');

	//If we were created from a sales order or invoice then procede
	//
	if(createdFromId != null && createdFromId != '')
		{
			//Get the number of lines
			//
			var lines = nlapiGetLineItemCount('item');
			
			for (var int5 = 1; int5 <= lines; int5++) 
				{
					var validSerialNumbers = [];
					var currentSerialNumbers = [];
				
					var currentLineItemId = nlapiGetLineItemValue('item', 'item', int5);
					var currentLineItemText = nlapiGetLineItemText('item', 'item', int5);
					var currentLineItemType = nlapiGetLineItemValue('item', 'itemtype', int5);
					var currentLineItemQuantity = Number(nlapiGetLineItemValue('item', 'quantity', int5));
					
					//Is the line item serialised?
					//
					var isSerialised = 'F';
					
					try
						{
							isSerialised = nlapiLookupField(getItemRecType(currentLineItemType), currentLineItemId, 'isserialitem', false);
						}
					catch(err)
						{
							isSerialised = 'F';
						}
					
					//If the item is serialised, then we can continue
					//
					if(isSerialised == 'T')
						{
							//See if we were created from an invoice or a sales order
							//
							if(createdFromText.startsWith('Sales Order'))
								{
									//If a sales order then find all the serial numbers by looking at item fulfilments for that sales order
									//
									validSerialNumbers = getSalesOrderSerialNumbers(createdFromId, currentLineItemId);
								}
							
							if(createdFromText.startsWith('Invoice'))
								{
									//If an invoice then just get all the serial numbers from that invoice
									//
									validSerialNumbers = getInvoiceSerialNumbers(createdFromId, currentLineItemId);
								}
							
							//Now we can check the entered serial number(s) against the list from the associated transaction
							//
							currentSerialNumbers = getCurrentSerials(int5);
							
							//If no serial numbers entered, then this is a problem
							//
							if(currentSerialNumbers.length == 0)
								{
									var message = 'No serial number enetered for ' + currentLineItemText + ', valid serial numbers are;\n';
									
									message += displayValidSerialNumbers(validSerialNumbers);
									
									orderValidated = false;
									
									break;
								}
							
							//If qty pf serial numbers entered is not equal to the line quantity, then this is a problem
							//
							if(currentSerialNumbers.length > 0 && currentSerialNumbers.length != currentLineItemQuantity)
								{
									var message = 'Quantity of serial numbers entered for ' + currentLineItemText + ' (' + currentSerialNumbers.length + '), does not match line quantity (' + currentLineItemQuantity + ')';
									
									orderValidated = false;
									
									break;
								}
							
							
							//Validate entered serial numbers 
							//
							if(currentSerialNumbers.length > 0)
								{
									var message = '';
									
									for (var int2 = 0; int2 < currentSerialNumbers.length; int2++) 
										{
											var thisCurrentSerialNumber = currentSerialNumbers[int2];
											
											if(validSerialNumbers.indexOf(thisCurrentSerialNumber) == -1)
												{
													if(message == '')
														{
															message = 'The following serial number(s) are not valid for ' + currentLineItemText + ';\n';
														}
													
													message += thisCurrentSerialNumber + '\n';
												}
										}
									
									if(message != '')
										{
											message += 'Valid serial number(s) are;\n';
											
											message += displayValidSerialNumbers(validSerialNumbers);
											
											orderValidated = false;
											
											break;
										}
								}
						}
				}
		}
	
	if(!orderValidated)
		{
			alert(message);
		}
	
    return orderValidated;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to save line item, false to abort save
 */
function returnAuthValidateLine(type)
{
	var validSerialNumbers = [];
	var currentSerialNumbers = [];
	var lineValidated = true;
	
	//Only look at items sublist
	//
	if(type == 'item')
		{
			//Get the current line item
			//
			var currentLineItemId = nlapiGetCurrentLineItemValue('item', 'item');
			var currentLineItemType = nlapiGetCurrentLineItemValue('item', 'itemtype');
			var currentLineItemQuantity = Number(nlapiGetCurrentLineItemValue('item', 'quantity'));
			
			//Is the line item serialised?
			//
			var isSerialised = 'F';
			
			try
				{
					isSerialised = nlapiLookupField(getItemRecType(currentLineItemType), currentLineItemId, 'isserialitem', false);
				}
			catch(err)
				{
					isSerialised = 'F';
				}
			
			//Get the created from
			//
			var createdFromId = nlapiGetFieldValue('createdfrom');
			var createdFromText = nlapiGetFieldText('createdfrom');
		
			//If we have a created from & the item is serialised, then we can continue
			//
			if(createdFromId != null && createdFromId != '' && isSerialised == 'T')
				{
					//See if we were created from an invoice or a sales order
					//
					if(createdFromText.startsWith('Sales Order'))
						{
							//If a sales order then find all the serial numbers by looking at item fulfilments for that sales order
							//
							validSerialNumbers = getSalesOrderSerialNumbers(createdFromId, currentLineItemId);
						}
					
					if(createdFromText.startsWith('Invoice'))
						{
							//If an invoice then just get all the serial numbers from that invoice
							//
							validSerialNumbers = getInvoiceSerialNumbers(createdFromId, currentLineItemId);
						}
					
					//Now we can check the entered serial number(s) against the list from the associated transaction
					//
					currentSerialNumbers = getCurrentSerials(null);
					
					//If no serial numbers entered, then this is a problem
					//
					if(currentSerialNumbers.length == 0)
						{
							var message = 'No serial number enetered, valid serial numbers are;\n';
							
							message += displayValidSerialNumbers(validSerialNumbers);
							
							alert(message);
							
							lineValidated = false;
						}
					
					//If qty pf serial numbers entered is not equal to the line quantity, then this is a problem
					//
					if(currentSerialNumbers.length > 0 && currentSerialNumbers.length != currentLineItemQuantity)
						{
							var message = 'Quantity of serial numbers entered (' + currentSerialNumbers.length + '), does not match line quantity (' + currentLineItemQuantity + ')';
							
							alert(message);
							
							lineValidated = false;
						}
					
					
					//Validate entered serial numbers 
					//
					if(currentSerialNumbers.length > 0)
						{
							var message = '';
							
							for (var int2 = 0; int2 < currentSerialNumbers.length; int2++) 
								{
									var thisCurrentSerialNumber = currentSerialNumbers[int2];
									
									if(validSerialNumbers.indexOf(thisCurrentSerialNumber) == -1)
										{
											if(message == '')
												{
													message = 'The following serial number(s) are not valid;\n';
												}
											
											message += thisCurrentSerialNumber + '\n';
										}
								}
							
							if(message != '')
								{
									message += 'Valid serial number(s) are;\n';
									
									message += displayValidSerialNumbers(validSerialNumbers);
									
									alert(message);
									lineValidated = false;
								}
						}
				}
		}
	else
		{
			lineValidated = true;
		}
	
    return lineValidated;
}

function getInvoiceSerialNumbers(_invoiceId, _currentLineItemId)
{
	var returnedSerialNumbers = [];
	
	//Search the related invoice to find any serial numbers for the specific item
	//
	var transactionSearch = nlapiSearchRecord("transaction",null,
			[
			   ["type","anyof","CustInvc"], 
			   "AND", 
			   ["itemnumber.inventorynumber","isnotempty",""], 
			   "AND", 
			   ["mainline","is","F"], 
			   "AND", 
			   ["taxline","is","F"], 
			   "AND", 
			   ["shipping","is","F"], 
			   "AND", 
			   ["cogs","is","F"],
			   "AND",
			   ["internalid","anyof",_invoiceId],
			   "AND",
			   ["item","anyof",_currentLineItemId]
			], 
			[
			   new nlobjSearchColumn("item"), 
			   new nlobjSearchColumn("inventorynumber","itemNumber",null)
			]
			);

	if(transactionSearch != null && transactionSearch.length > 0)
		{
			for (var int = 0; int < transactionSearch.length; int++) 
				{
					var serialNumber = transactionSearch[int].getValue("inventorynumber","itemNumber");
					returnedSerialNumbers.push(serialNumber);
				}
		}
	
	return returnedSerialNumbers;

}

function getSalesOrderSerialNumbers(_orderId, _currentLineItemId)
{
	var returnedSerialNumbers = [];
	
	//Search the related invoice to find any serial numbers for the specific item
	//
	var transactionSearch = nlapiSearchRecord("transaction",null,
			[
			   ["type","anyof","ItemShip"], 
			   "AND", 
			   ["itemnumber.inventorynumber","isnotempty",""], 
			   "AND", 
			   ["mainline","is","F"], 
			   "AND",
			   ["createdfrom","anyof",_orderId],
			   "AND",
			   ["item","anyof",_currentLineItemId]
			], 
			[
			   new nlobjSearchColumn("item"), 
			   new nlobjSearchColumn("inventorynumber","itemNumber",null)
			]
			);

	if(transactionSearch != null && transactionSearch.length > 0)
		{
			for (var int = 0; int < transactionSearch.length; int++) 
				{
					var serialNumber = transactionSearch[int].getValue("inventorynumber","itemNumber");
					returnedSerialNumbers.push(serialNumber);
				}
		}
	
	return returnedSerialNumbers;

}

function getItemRecType(ItemType)
{
	//Translate the record type as returned from a saved search into a value that can be used in a lookup api
	//
	var itemType = '';
	
	switch(ItemType)
	{
		case 'InvtPart':
			itemType = 'inventoryitem';
			break;
			
		case 'Assembly':
			itemType = 'assemblyitem';
			break;
			
		case 'NonInvtPart':
			itemType = 'noninventoryitem';
			break;
			
		case 'OthCharge':
			itemType = 'otherchargeitem';
			break;
	}

	return itemType;
}

function getCurrentSerials(_lineNo)
{
	var returnedSerials = [];
	
	//If we have been given a line number, we need to select that line first
	//
	if(_lineNo != null)
		{
			nlapiSelectLineItem('item', _lineNo);
		}
	
	//Get the inventorydetail subrecord
	//
	var invDetail = nlapiViewCurrentLineItemSubrecord('item', 'inventorydetail');
	
	if(invDetail != null && invDetail != '')
		{
			//See how many lines we have in inventoryassignment
			//
			var invcount = invDetail.getLineItemCount('inventoryassignment');  
			
			//Get the serial numbers
			//
			for(var x = 1; x <=invcount ; x++) 
				{
				  	invDetail.selectLineItem('inventoryassignment', x);
				    
				  	var thisSerialNumber = invDetail.getCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber');
				  	
				  	returnedSerials.push(thisSerialNumber);
				}
		}
	
	return returnedSerials;
}

function displayValidSerialNumbers(_validSerialNumbers)
{
	//Show the contents of the valid serial numbers array as a string with each serial number on a new line
	//
	var _message = '';
	
	if(_validSerialNumbers.length > 0)
		{
			for (var int = 0; int < _validSerialNumbers.length; int++) 
				{
					_message += _validSerialNumbers[int] + '\n';
				}
		}
	else
		{
			_message += '<No valid serial numbers found>';
		}
	
	return _message;
}