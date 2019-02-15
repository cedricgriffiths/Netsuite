/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       24 May 2018     cedricgriffiths
 *
 */


function cbcSalesOrderBeforeLoad(type, form, request)
{
	if (type =='edit' || type == 'view')
		{
			var recId = nlapiGetRecordId();
			var errors = nlapiLookupField('salesorder', recId, 'custbody_cbc_errors', false).replace(/\n/g,'<br />');
			
			
			if(errors != null && errors != '')
				{
					var html = '<SCRIPT language="JavaScript" type="text/javascript">';
					html += "function bindEvent(element, type, handler) {if(element.addEventListener) {element.addEventListener(type, handler, false);} else {element.attachEvent('on'+type, handler);}} "; 
					html += 'bindEvent(window, "load", function(){'; 
					
					html += "require(['N/record', 'N/ui/message']," +
								"function(record, message) {" +
									"function myPageInit() {" +
										"var myMsg = message.create({title: 'CUSTOMER BUDGET CONTROL',message: '" + errors + "',type: message.Type.ERROR});" +
										"myMsg.show();}" +
									"myPageInit();" +
								"});";
					html += '});'; 
					html += '</SCRIPT>';
					
					// push a dynamic field into the environment
					var field0 = form.addField('custpage_alertmode', 'inlinehtml', '',null,null); 
					field0.setDefaultValue(html);
					}
		}
}


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
//=====================================================================
//Main Code
//=====================================================================
//
function cbcSalesOrderAfterSubmit(type)
{
	//Get the old & new records
	//
	var oldRecord = nlapiGetOldRecord();
	var newRecord = nlapiGetNewRecord();

	var contactItemObject = {};
	var errors = [];
	
	nlapiLogExecution('DEBUG', 'Sales Order UE', type);
	
	//Process depending on type of action
	//
	if(type == 'create')
		{
			//Get the summarised items by contact values from the new record
			//
			nlapiLogExecution('DEBUG', 'New Record', JSON.stringify(newRecord));
		
			getItemsFromSoRecord(newRecord, contactItemObject, 'A'); //Add mode
			nlapiLogExecution('DEBUG', 'Get Items', JSON.stringify(contactItemObject));
			
			//Update the list with the alloc type & equivalent points usage from the customer items table
			//
			updateItemsWithAllocAndPoints(newRecord, contactItemObject);
			nlapiLogExecution('DEBUG', 'Update Items', JSON.stringify(contactItemObject));
			
			//Work out what we have used against the contacts allowed usage
			//
			var orderDate = newRecord.getFieldValue('trandate');
			
			calculateContactsUsage(contactItemObject, errors, orderDate);
			
			//Process any errors
			//
			processErrors(newRecord, errors, type);
		}		

	if(type == 'edit')
		{
			//Get the summarised items by contact values from the new record
			//
			getItemsFromSoRecord(newRecord, contactItemObject, 'A'); //Add mode
			
			//Get the summarised items by contact values from the old record
			//
			getItemsFromSoRecord(oldRecord, contactItemObject, 'S'); //Subtract mode
			
			//Update the list with the alloc type & equivalent points usage from the customer items table
			//
			updateItemsWithAllocAndPoints(newRecord, contactItemObject);
			
			//Work out what we have used against the contacts allowed usage
			//
			var orderDate = newRecord.getFieldValue('trandate');
			
			calculateContactsUsage(contactItemObject, errors, orderDate);
			
			//Process any errors
			//
			processErrors(newRecord, errors, type);
			}
	
	if(type == 'cancel')
		{
			//Get the summarised items by contact values from the new record
			//
			getItemsFromSoRecord(newRecord, contactItemObject, 'A'); //Add mode
			
			//Get the summarised items by contact values from the old record
			//
			getItemsFromSoRecord(oldRecord, contactItemObject, 'S'); //Subtract mode
			
			//If we have now cancelled the order we need to look at what items are outstanding, so as we can credit the allocations
			//
			processCancelledItems(newRecord, contactItemObject);
	
			//Update the list with the alloc type & equivalent points usage from the customer items table
			//
			updateItemsWithAllocAndPoints(newRecord, contactItemObject);
			
			//Work out what we have used against the contacts allowed usage
			//
			var orderDate = newRecord.getFieldValue('trandate');
			
			calculateContactsUsage(contactItemObject, errors, orderDate);
			
			//Process any errors
			//
			processErrors(newRecord, errors, type);
		}

	if(type == 'delete')
		{
			//Get the summarised items by contact values from the old record
			//
			getItemsFromSoRecord(oldRecord, contactItemObject, 'S'); //Subtract mode
			
			//Update the list with the alloc type & equivalent points usage from the customer items table
			//
			updateItemsWithAllocAndPoints(oldRecord, contactItemObject);
			
			//Work out what we have used against the contacts allowed usage
			//
			calculateContactsUsage(contactItemObject, errors, null);
			
			//Process any errors
			//
			processErrors(newRecord, errors, type);
		}

	
	var govUsage = nlapiGetContext().getRemainingUsage();
	
	var dummy = 'debug';
}


//=====================================================================
//Functions
//=====================================================================
//
function processCancelledItems(_soRecord, _contactItemObject)
{
	var newRecordOrderPlacedBy = _soRecord.getFieldValue('custbody_cbc_order_placed_by');
	var newRecordOrderPlacedByText = _soRecord.getFieldText('custbody_cbc_order_placed_by');
	var newLinesCount = _soRecord.getLineItemCount('item');
	
	
	//Allow for nulls
	//
	newRecordOrderPlacedBy = (newRecordOrderPlacedBy == null ? '' : newRecordOrderPlacedBy);
	newRecordOrderPlacedByText = (newRecordOrderPlacedByText == null ? '' : newRecordOrderPlacedByText);
	
	for (var int = 1; int <= newLinesCount; int++) 
		{
			//Get the values from the lines
			//
			var newLineItem = _soRecord.getLineItemValue('item','item',int);
			var newLineItemText = _soRecord.getLineItemText('item','item',int);
			var newLineQuantity = _soRecord.getLineItemValue('item','quantity',int);
			var newLineQuantityFulfilled = _soRecord.getLineItemValue('item','quantityfulfilled',int);
			var newLineAmount = _soRecord.getLineItemValue('item','amount',int);
			var newLineRate = _soRecord.getLineItemValue('item','rate',int);
			var newLineManpackContact = _soRecord.getLineItemValue('item','custcol_cbc_manpack_contact',int);
			var newLineManpackContactText = _soRecord.getLineItemText('item','custcol_cbc_manpack_contact',int);
			
			//Allow for nulls
			//
			newLineManpackContact = (newLineManpackContact == null ? '' : newLineManpackContact);
			newLineManpackContactText = (newLineManpackContactText == null ? '' : newLineManpackContactText);
			
			//If the manpack contact is empty then set it with the id of the order placed by person
			//
			newLineManpackContact = (newLineManpackContact == '' ? newRecordOrderPlacedBy : newLineManpackContact);
			newLineManpackContactText = (newLineManpackContactText == '' ? newRecordOrderPlacedByText : newLineManpackContactText);
			
			//We are only interested in lines that will have a contact associated with them, otherwise ignore them
			//
			if(newLineManpackContact != '')
				{
					//Build up the contact + item key
					//
					var contactItemKey = padding_left(newLineManpackContact,'0',6) + padding_left(newLineItem,'0',6);
					
					var outstandingQuantity = Number(newLineQuantity) - Number(newLineQuantityFulfilled);
					var outstandingAmount = Number(newLineRate) * outstandingQuantity;
					
					if(outstandingQuantity != 0)
						{
							//Update the quantity & value for the item
							//
							_contactItemObject[contactItemKey][2] = Number(_contactItemObject[contactItemKey][2]) - outstandingQuantity;
							_contactItemObject[contactItemKey][3] = Number(_contactItemObject[contactItemKey][3]) - outstandingAmount;
						}
				}
		}
}

function getItemsFromSoRecord(_soRecord, _contactItemObject, _mode)
{
	var newRecordOrderPlacedBy = _soRecord.getFieldValue('custbody_cbc_order_placed_by');
	var newRecordOrderPlacedByText = _soRecord.getFieldText('custbody_cbc_order_placed_by');
	var newLinesCount = _soRecord.getLineItemCount('item');
	var contactGrades = {};
	
	nlapiLogExecution('DEBUG', 'Line Count', newLinesCount);
	
	//Allow for nulls
	//
	newRecordOrderPlacedBy = (newRecordOrderPlacedBy == null ? '' : newRecordOrderPlacedBy);
	newRecordOrderPlacedByText = (newRecordOrderPlacedByText == null ? '' : newRecordOrderPlacedByText);
	
	for (var int = 1; int <= newLinesCount; int++) 
		{
			//Get the values from the lines
			//
			var newLineItem = _soRecord.getLineItemValue('item','item',int);
			var newLineItemText = _soRecord.getLineItemText('item','item',int);
			var newLineQuantity = _soRecord.getLineItemValue('item','quantity',int);
			var newLineAmount = _soRecord.getLineItemValue('item','amount',int);
			var newLineManpackContact = _soRecord.getLineItemValue('item','custcol_cbc_manpack_contact',int);
			var newLineManpackContactText = _soRecord.getLineItemText('item','custcol_cbc_manpack_contact',int);
			var newLineClosed = _soRecord.getLineItemValue('item','isclosed',int);
			
			//Allow for nulls
			//
			newLineManpackContact = (newLineManpackContact == null ? '' : newLineManpackContact);
			newLineManpackContactText = (newLineManpackContactText == null ? '' : newLineManpackContactText);
			newLineClosed = (newLineClosed == null ? newLineClosed = 'F' : newLineClosed);
			
			//If the manpack contact is empty then set it with the id of the order placed by person
			//
			newLineManpackContact = (newLineManpackContact == '' ? newRecordOrderPlacedBy : newLineManpackContact);
			newLineManpackContactText = (newLineManpackContactText == '' ? newRecordOrderPlacedByText : newLineManpackContactText);
			
			//We are only interested in lines that will have a contact associated with them & that they are not closed, otherwise ignore them
			//
			nlapiLogExecution('DEBUG', 'manpack contact', newLineManpackContact);
			nlapiLogExecution('DEBUG', 'closed', newLineClosed);
			
			if(newLineManpackContact != '' && (newLineClosed == 'F' || newLineClosed == '' || newLineClosed == null))
				{
					//Build up the contact + item key
					//
					var contactItemKey = padding_left(newLineManpackContact,'0',6) + padding_left(newLineItem,'0',6);
					
					//See if we need to add or deduct the values based on the mode which is based on passing the new or old record
					//
					var modifier = Number(1);
					
					switch(_mode)
						{
							case 'A':
								modifier = Number(1);
								break;
								
							case 'S':
								modifier = Number(-1);
								break;
						}
					
					var tempNewLineQuantity = Number(newLineQuantity) * modifier;
					var tempNewLineAmount = Number(newLineAmount) * modifier;
					
					//Get the grade for the manpack contact
					//
					var newLineManpackContactGrade = '0';
					
					if(newLineManpackContact != null && newLineManpackContact != '')
						{
							if(contactGrades[newLineManpackContact])
								{
									newLineManpackContactGrade = contactGrades[newLineManpackContact];
								}
							else
								{
									newLineManpackContactGrade = nlapiLookupField('contact', newLineManpackContact, 'custentity_cbc_contact_grade', false);
									contactGrades[newLineManpackContact] = newLineManpackContactGrade;
								}
						}
					
					//Does this key value exist in the contact item object
					//
					if(!_contactItemObject[contactItemKey])
						{
							_contactItemObject[contactItemKey] = [newLineManpackContact, newLineItem, tempNewLineQuantity, tempNewLineAmount,0,0,newLineItemText,newLineManpackContactText,0,newLineManpackContactGrade]; //(0)contact, (1)item, (2)quantity, (3)amount, (4)allocation type, (5)points, (6)item text, (7)contact text, (8)actual monetary value, (9)contact grade
						}
					else
						{
							//Update the quantity & value for the item
							//
							_contactItemObject[contactItemKey][2] = Number(_contactItemObject[contactItemKey][2]) + tempNewLineQuantity;
							_contactItemObject[contactItemKey][3] = Number(_contactItemObject[contactItemKey][3]) + tempNewLineAmount;
						}
				}
		}
}


function updateItemsWithAllocAndPoints(_record, _contactItemObject)
{
	var itemsObject = {};
	var itemsArray = [];
	var customer = _record.getFieldValue('entity');
	
	//Build up a list of items 
	//
	for ( var contactItem in _contactItemObject) 
		{
			itemsObject[_contactItemObject[contactItem][1]] = _contactItemObject[contactItem][1];
		}
	
	//Convert the items object to an array of items
	//
	for ( var items in itemsObject) 
		{
			itemsArray.push(items);
		}
	
	//Have we got any items to process?
	//
	if(itemsArray.length > 0)
		{
			//Search for the items in the CBC Customer Items table
			//
			var filters = [
			               	["custrecord_cbc_item_customer","anyof",customer],
			               	"AND",
			               	["custrecord_cbc_item_item","anyof",itemsArray]
			              ];
			
			var customrecord_cbc_item_record_recordSearch = nlapiSearchRecord("customrecord_cbc_item_record",null,
					filters, 
					[
						new nlobjSearchColumn("custrecord_cbc_item_item"),
						new nlobjSearchColumn("custrecord_cbc_item_allocation_type"),
						new nlobjSearchColumn("custrecord_cbc_item_points"),
						new nlobjSearchColumn("custrecord_cbc_item_grade")
					]
					);
			
			if(customrecord_cbc_item_record_recordSearch && customrecord_cbc_item_record_recordSearch.length > 0)
				{
					for (var int = 0; int < customrecord_cbc_item_record_recordSearch.length; int++) 
						{
							var item = customrecord_cbc_item_record_recordSearch[int].getValue("custrecord_cbc_item_item");
							var allocType = customrecord_cbc_item_record_recordSearch[int].getValue("custrecord_cbc_item_allocation_type");
							var points = Number(customrecord_cbc_item_record_recordSearch[int].getValue("custrecord_cbc_item_points"));
							var grade = Number(customrecord_cbc_item_record_recordSearch[int].getValue("custrecord_cbc_item_grade"));
							
							for ( var contactItem in _contactItemObject) 
								{
									var contactItemId = _contactItemObject[contactItem][1];
									var contactItemGrade = _contactItemObject[contactItem][9];
								
									if(contactItemId == item && contactItemGrade == grade)
										{
											_contactItemObject[contactItem][4] = allocType;
											_contactItemObject[contactItem][5] = points; // * Number(_contactItemObject[contactItem][2]);
											_contactItemObject[contactItem][8] = _contactItemObject[contactItem][3]; //copy the item value into the actual monetary amount
										}
								}
						}
				}
		}
}


function calculateContactsUsage(_contactItemObject, _errors, _orderDate)
{
	if(typeof _orderDate == 'undefined')
		{
			_orderDate = null;
		}
	
	var contactsObject = {};
	
	//Build up a list of contacts to work with
	//
	for ( var contactItem in _contactItemObject) 
		{
			contactsObject[_contactItemObject[contactItem][0]] = _contactItemObject[contactItem][0];
		}
	
	nlapiLogExecution('DEBUG', 'Contacts Object', JSON.stringify(contactsObject));
	
	//Loop through the contacts
	//
	for ( var contactToProcess in contactsObject) 
		{
			var contactBudgets = new Object();
			var firstOrder = false;
			
			//Get the contact's budget type
			//
			var contactBudgetType = Number(nlapiLookupField('contact', contactToProcess, 'custentity_cbc_contact_budget_type', false));
			
			nlapiLogExecution('DEBUG', 'Contacts budget type', contactBudgetType);
			
			//Get the contact's first order date & update if required
			//
			var contactFirstOrderDate = nlapiLookupField('contact', contactToProcess, 'custentity_cbc_contact_first_order_date', false);
			contactFirstOrderDate = (contactFirstOrderDate == null ? '' : contactFirstOrderDate);
			
			if(contactFirstOrderDate == '' && _orderDate != null)
				{
					nlapiSubmitField('contact', contactToProcess, 'custentity_cbc_contact_first_order_date', _orderDate, false);
					firstOrder = true;
				}
			
			//Get the contact allocations records
			//
			var customrecord_cbc_contact_recordSearch = nlapiSearchRecord("customrecord_cbc_contact_record",null,
					[["custrecord_cbc_contact_id","anyof",contactToProcess]], 
					[
						new nlobjSearchColumn("custrecord_cbc_contact_id"),
						new nlobjSearchColumn("custrecord_cbc_contact_budget_type"),
						new nlobjSearchColumn("custrecord_cbc_contact_item_alloc_type"),
						new nlobjSearchColumn("custrecord_cbc_contact_quantity"),
						new nlobjSearchColumn("custrecord_cbc_contact_usage"),
						new nlobjSearchColumn("custrecord_cbc_contact_reset_days")
					]
					);
			
			if(customrecord_cbc_contact_recordSearch && customrecord_cbc_contact_recordSearch.length > 0)
				{
					for (var int = 0; int < customrecord_cbc_contact_recordSearch.length; int++) 
						{
							var contactAllocId = customrecord_cbc_contact_recordSearch[int].getId();
							var contactAllocItemAllocType = customrecord_cbc_contact_recordSearch[int].getValue('custrecord_cbc_contact_item_alloc_type');
							var contactAllocItemAllocTypeText = customrecord_cbc_contact_recordSearch[int].getText('custrecord_cbc_contact_item_alloc_type');
							var contactAllocQuantity = Number(customrecord_cbc_contact_recordSearch[int].getValue('custrecord_cbc_contact_quantity'));
							var contactAllocUsage = Number(customrecord_cbc_contact_recordSearch[int].getValue('custrecord_cbc_contact_usage'));
							var contactAllocResetDays = Number(customrecord_cbc_contact_recordSearch[int].getValue('custrecord_cbc_contact_reset_days'));
							
							contactBudgets[contactAllocId] = [contactAllocId,contactAllocItemAllocType,contactAllocQuantity,contactAllocUsage,contactAllocResetDays,contactAllocItemAllocTypeText];
						}
				}
			
			//Process based on the contact's budget type
			//
			switch(contactBudgetType)
				{
					case 1:	//Monetary
						
						//Loop through all of the items finding only those which belong to the current contact
						//
						var totalAmount = Number(0);
						var itemContactText = '';
						
						for ( var contactItem in _contactItemObject) 
							{
								itemContact = _contactItemObject[contactItem][0];
								
								if(itemContact == contactToProcess)
									{
										itemContactText = _contactItemObject[contactItem][7];
									
										var itemAmount = Number(_contactItemObject[contactItem][8]);
										totalAmount += itemAmount;
									}
							}
						
						//Now process the budgets that we got from the contact
						//
						for ( var budget in contactBudgets) 
							{
								var budgetQuantity = Number(contactBudgets[budget][2]);
								var budgetUsgae = Number(contactBudgets[budget][3]);
								var budgetId = contactBudgets[budget][0];
								
								//Calculate the new usage value
								//
								if(totalAmount < 0)
									{
										totalAmount = Math.round(Math.abs(totalAmount)) * -1.0;
									}
								else
									{
										totalAmount = Math.round(totalAmount) ;
									}
								
								var newBudgetUsage = budgetUsgae + totalAmount;
									
								nlapiSubmitField('customrecord_cbc_contact_record', budgetId, 'custrecord_cbc_contact_usage', newBudgetUsage, false);
								
								if(newBudgetUsage > budgetQuantity)
									{
										//Budget exceeded, add to the errors collection
										//
										var message = 'Monetary budget exceeded for ' + itemContactText + 
										' (Allowed Budget = ' + budgetQuantity.toString() + 
										', Current Usage = ' + budgetUsgae.toString() + 
										', New Usage = ' + newBudgetUsage.toString() + 
										')';
										_errors.push(message);
									}
									
								
								//Also, if this is the first order for the contact, then we need to update the reset date on each of the contacts budget records
								//
								if(firstOrder && _orderDate != null)
									{
										setContactFirstOrderDate(_orderDate, Number(contactBudgets[budget][4]), budgetId);
									}
							}
						
						break;
						
					case 2: //Points
						
						//Loop through all of the items finding only those which belong to the current contact
						//
						var totalPoints = Number(0);
						var itemContactText = '';
						
						for ( var contactItem in _contactItemObject) 
							{
								itemContact = _contactItemObject[contactItem][0];
								
								if(itemContact == contactToProcess)
									{
										itemContactText = _contactItemObject[contactItem][7];
									
										var itemPoints = Number(_contactItemObject[contactItem][5]);
										var itemQuantity = Number(_contactItemObject[contactItem][2]);
										
										totalPoints += (itemPoints * itemQuantity);
									}
							}
						
						//Now process the budgets that we got from the contact
						//
						for ( var budget in contactBudgets) 
							{
								var budgetQuantity = Number(contactBudgets[budget][2]);
								var budgetUsgae = Number(contactBudgets[budget][3]);
								var budgetId = contactBudgets[budget][0];
								
								//Calculate the new usage value
								//
								var newBudgetUsage = budgetUsgae + totalPoints;
								
								nlapiSubmitField('customrecord_cbc_contact_record', budgetId, 'custrecord_cbc_contact_usage', newBudgetUsage, false);
								
								if(newBudgetUsage > budgetQuantity)
									{
										//Budget exceeded, add to the errors collection
										//
										var message = 'Points budget exceeded for ' + itemContactText + 
										' (Allowed Budget = ' + budgetQuantity.toString() + 
										', Current Usage = ' + budgetUsgae.toString() + 
										', New Usage = ' + newBudgetUsage.toString() + 
										')';
										_errors.push(message);
									}
									
								
								//Also, if this is the first order for the contact, then we need to update the reset date on each of the contacts budget records
								//
								if(firstOrder && _orderDate != null)
									{
										setContactFirstOrderDate(_orderDate, Number(contactBudgets[budget][4]), budgetId);
									}
							}
						
						break;
						
					case 3: //Allocations
						
						//Loop through all of the items finding only those which belong to the current contact
						//
						nlapiLogExecution('DEBUG', 'Allocations', 'In allocations');
						
						var sublistLineNo = Number(0);
						
						for ( var contactItem in _contactItemObject) 
							{
								sublistLineNo++;
								
								itemContact = _contactItemObject[contactItem][0];
								
								//We have found an item that belongs to the current contact
								//
								if(itemContact == contactToProcess)
									{
									nlapiLogExecution('DEBUG', 'Allocations', 'Matched contact');
									
										//Get data about the item on the order
										//
										var itemQuantity = Number(_contactItemObject[contactItem][2]);
										var itemAllocationType = _contactItemObject[contactItem][4];
										var itemName = _contactItemObject[contactItem][6];
										var itemContactText = _contactItemObject[contactItem][7];
										
										//Now find the corresponding allocation type in the budgets that we got from the contact
										//
										for ( var budget in contactBudgets) 
											{
												var budgetAllocType = contactBudgets[budget][1];
												var budgetAllocTypeText = contactBudgets[budget][5];
												var budgetQuantity = Number(contactBudgets[budget][2]);
												var budgetUsage = Number(contactBudgets[budget][3]);
												var budgetId = contactBudgets[budget][0];
												
												//Found a match
												//
												if(budgetAllocType == itemAllocationType)
													{
													nlapiLogExecution('DEBUG', 'Allocations', 'Matched alloc type');
													
														//Calculate the new usage value
														//
														var newBudgetUsage = budgetUsage + itemQuantity;
														contactBudgets[budget][3] = newBudgetUsage;
														
														
														nlapiSubmitField('customrecord_cbc_contact_record', budgetId, 'custrecord_cbc_contact_usage', newBudgetUsage, false);
														
														if(newBudgetUsage > budgetQuantity)
															{
																//Budget exceeded, add to the errors collection
																//
																var message = 'Allocation exceeded for ' + itemContactText + 
																' for product ' + itemName + 
																' on line number ' + sublistLineNo.toString() + 
																' (Allocation Type = ' + budgetAllocTypeText +
																', Allowed Qty = ' + budgetQuantity.toString() + 
																', Current Usage = ' + budgetUsage.toString() + 
																', New Usage = ' + newBudgetUsage.toString() + 
																')';
																_errors.push(message);
															}
													}
												
												//Also, if this is the first order for the contact, then we need to update the reset date on each of the contacts budget records
												//
												if(firstOrder && _orderDate != null)
													{
														setContactFirstOrderDate(_orderDate, Number(contactBudgets[budget][4]), budgetId);
													}
											}
									}
							}

						break;
				}
		}
}


function setContactFirstOrderDate(_orderDate, _resetDays, _budgetId)
{
	var orderDateAsDate = nlapiStringToDate(_orderDate);
	var budgetResetDate = nlapiDateToString(nlapiAddDays(orderDateAsDate, _resetDays));
	
	nlapiSubmitField('customrecord_cbc_contact_record', _budgetId, 'custrecord_cbc_contact_reset_date', budgetResetDate, false);
}


function processErrors(_record, _errors, _type)
{
	var errorText = '';
	var recordId = _record.getId();
	
	//Extract the error array into a text string
	//
	for (var int = 0; int < _errors.length; int++) 
		{
			errorText += _errors[int] + "\n";
		}
	
	if(type != 'delete')
		{
			//Update the sales order with the error text
			//
			nlapiSubmitField('salesorder', recordId, 'custbody_cbc_errors', errorText, false);
		}
	

	
	//Send an email to the operator
	//
	if(errorText != '')
		{
			var userId = nlapiGetContext().getUser();
			var emailText = 'The following customer budget control errors have been detected; \n\n';
			var soURL = 'https://system.eu1.netsuite.com' + nlapiResolveURL('RECORD', 'salesorder', recordId, 'view');
			
			emailText += errorText;
			emailText += '\n';
			emailText += 'Follow this link to see the sales order ' + soURL + '\n';
			
			nlapiSendEmail(userId, userId, 'CUSTOMER BUDGET CONTROL', emailText);
		}
}


//left padding s with c to a total of n chars
//
function padding_left(s, c, n) 
{
	if (! s || ! c || s.length >= n) 
	{
		return s;
	}
	
	var max = (n - s.length)/c.length;
	
	for (var i = 0; i < max; i++) 
	{
		s = c + s;
	}
	
	return s;
}








