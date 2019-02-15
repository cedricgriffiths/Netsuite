/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       23 May 2018     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function cbcContactFieldChanged(type, name, linenum)
{
	//If we change the budget type we have to remove the existing contact budget records & then add in the new ones
	//
	if(name == 'custentity_cbc_contact_budget_type')
		{
			var contactId = nlapiGetRecordId();
			var companyId = nlapiGetFieldValue('company');
			var budgetType = nlapiGetFieldValue('custentity_cbc_contact_budget_type');
			var grade = nlapiGetFieldValue('custentity_cbc_contact_grade');
			
			if(contactId != '')
				{
					removeExistingBudgets(contactId);
					
					nlapiSetFieldValue('custentity_cbc_contact_first_order_date', null, false, true);
					
					if(budgetType != '')
						{
							copyBudgetsFromCompany(contactId, companyId, budgetType, grade);
						}
					
					alert('Customer Budget Control records have been copied down from the company & will be visible after the contact record has been saved');
				}
		}
	
	//If we change the depot we have to process differnently based on budget type
	//
	if(name == 'custentity_cbc_contact_grade')
		{
			var contactId = nlapiGetRecordId();
			var companyId = nlapiGetFieldValue('company');
			var budgetType = nlapiGetFieldValue('custentity_cbc_contact_budget_type');
			var grade = nlapiGetFieldValue('custentity_cbc_contact_grade');
			var firstOrderDate = nlapiGetFieldValue('custentity_cbc_contact_first_order_date');
			
			if(contactId != '')
				{
					if(budgetType != '')
						{
							mergeBudgetsFromCompany(contactId, companyId, budgetType, grade, firstOrderDate);
						}
				}
		}
}

//Delete existing budget records for the contact
//
function removeExistingBudgets(_contactId)
{
	var filters = [["custrecord_cbc_contact_id","anyof",_contactId]];
	
	var customrecord_cbc_contact_recordSearch = nlapiSearchRecord("customrecord_cbc_contact_record",null,
			filters, 
			[
			   new nlobjSearchColumn("custrecord_cbc_contact_id")
			]
			);
	
	if(customrecord_cbc_contact_recordSearch && customrecord_cbc_contact_recordSearch.length > 0)
		{
			for (var int = 0; int < customrecord_cbc_contact_recordSearch.length; int++) 
				{
					var recordId = customrecord_cbc_contact_recordSearch[int].getId();
					
					try
						{
							nlapiDeleteRecord('customrecord_cbc_contact_record', recordId);
						}
					catch(err)
						{
							var message = err.message;
						}
				}
		}
}

//Copy the budget records down from the customer to the contact based on budget tyoe & grade
//
function copyBudgetsFromCompany(_contactId, _companyId, _budgetType, _grade)
{
	var recordsProcessed = Number(0);
	
	var filters = [
	               ["custrecord_cbc_customer_id","anyof",_companyId],
	               "AND",
	               ["custrecord_cbc_customer_budget_type","anyof",_budgetType],
	               "AND",
	               ["custrecord_cbc_customer_grade","anyof",_grade]
	               ];
	
	var customrecord_cbc_customer_recordSearch = nlapiSearchRecord("customrecord_cbc_customer_record",null,
			filters, 
			[
				new nlobjSearchColumn("custrecord_cbc_customer_id"),
				new nlobjSearchColumn("custrecord_cbc_customer_budget_type"),
				new nlobjSearchColumn("custrecord_cbc_customer_item_alloc_type"),
				new nlobjSearchColumn("custrecord_cbc_customer_quantity"),
				new nlobjSearchColumn("custrecord_cbc_customer_reset_days")
			]
			);
	
	if(customrecord_cbc_customer_recordSearch && customrecord_cbc_customer_recordSearch.length > 0)
		{
			recordsProcessed = customrecord_cbc_customer_recordSearch.length;
			
			for (var int = 0; int < customrecord_cbc_customer_recordSearch.length; int++) 
				{
					var itemAllocType = customrecord_cbc_customer_recordSearch[int].getValue('custrecord_cbc_customer_item_alloc_type');
					var quantity = customrecord_cbc_customer_recordSearch[int].getValue('custrecord_cbc_customer_quantity');
					var resetDays = customrecord_cbc_customer_recordSearch[int].getValue('custrecord_cbc_customer_reset_days');
				
					var contactBudgetRecord = nlapiCreateRecord('customrecord_cbc_contact_record');
					contactBudgetRecord.setFieldValue('custrecord_cbc_contact_id', _contactId);
					contactBudgetRecord.setFieldValue('custrecord_cbc_contact_budget_type', _budgetType);
					contactBudgetRecord.setFieldValue('custrecord_cbc_contact_item_alloc_type', itemAllocType);
					contactBudgetRecord.setFieldValue('custrecord_cbc_contact_quantity', quantity);
					contactBudgetRecord.setFieldValue('custrecord_cbc_contact_reset_days', resetDays);
					
					nlapiSubmitRecord(contactBudgetRecord, false, true);
				}
		}
	
	return recordsProcessed;
}

//Merge the budget records down from the customer to the contact based on budget type & grade
//
function mergeBudgetsFromCompany(_contactId, _companyId, _budgetType, _grade, _firstOrderDate)
{
	var contactsNewBudgets = {};
	
	//Find the records associated to the contact & save in the new budgets object
	//
	var filters = [["custrecord_cbc_contact_id","anyof",_contactId]];
	
	var customrecord_cbc_contact_recordSearch = nlapiSearchRecord("customrecord_cbc_contact_record",null,
			filters, 
			[
			   new nlobjSearchColumn("custrecord_cbc_contact_id"),
			   new nlobjSearchColumn("custrecord_cbc_contact_budget_type"),
			   new nlobjSearchColumn("custrecord_cbc_contact_item_alloc_type"),
			   new nlobjSearchColumn("custrecord_cbc_contact_quantity"),
			   new nlobjSearchColumn("custrecord_cbc_contact_reset_days"),
			   new nlobjSearchColumn("custrecord_cbc_contact_reset_date")
			]
			);
	
	if(customrecord_cbc_contact_recordSearch && customrecord_cbc_contact_recordSearch.length > 0)
		{
			for (var int = 0; int < customrecord_cbc_contact_recordSearch.length; int++) 
				{
					var recordId = customrecord_cbc_contact_recordSearch[int].getId();
					var budgetType = customrecord_cbc_contact_recordSearch[int].getValue("custrecord_cbc_contact_budget_type");
					var allocType = customrecord_cbc_contact_recordSearch[int].getValue("custrecord_cbc_contact_item_alloc_type");
					var quantity = customrecord_cbc_contact_recordSearch[int].getValue("custrecord_cbc_contact_quantity");
					var resetDays = customrecord_cbc_contact_recordSearch[int].getValue("custrecord_cbc_contact_reset_days");
					var resetDate = customrecord_cbc_contact_recordSearch[int].getValue("custrecord_cbc_contact_reset_date");
					
					var key = budgetType + '|' + allocType;
					
					contactsNewBudgets[key] = [recordId,budgetType,allocType,quantity,resetDays,resetDate,'D']; 
				}
		}
	
	//Now find the records that are on the company
	//
	var filters = [
	               ["custrecord_cbc_customer_id","anyof",_companyId],
	               "AND",
	               ["custrecord_cbc_customer_budget_type","anyof",_budgetType],
	               "AND",
	               ["custrecord_cbc_customer_grade","anyof",_grade]
	               ];
	
	var customrecord_cbc_customer_recordSearch = nlapiSearchRecord("customrecord_cbc_customer_record",null,
			filters, 
			[
				new nlobjSearchColumn("custrecord_cbc_customer_id"),
				new nlobjSearchColumn("custrecord_cbc_customer_budget_type"),
				new nlobjSearchColumn("custrecord_cbc_customer_item_alloc_type"),
				new nlobjSearchColumn("custrecord_cbc_customer_quantity"),
				new nlobjSearchColumn("custrecord_cbc_customer_reset_days")
			]
			);
	
	if(customrecord_cbc_customer_recordSearch && customrecord_cbc_customer_recordSearch.length > 0)
		{
			for (var int = 0; int < customrecord_cbc_customer_recordSearch.length; int++) 
				{
					var itemBudgetType = customrecord_cbc_customer_recordSearch[int].getValue('custrecord_cbc_customer_budget_type');
					var itemAllocType = customrecord_cbc_customer_recordSearch[int].getValue('custrecord_cbc_customer_item_alloc_type');
					var quantity = customrecord_cbc_customer_recordSearch[int].getValue('custrecord_cbc_customer_quantity');
					var resetDays = customrecord_cbc_customer_recordSearch[int].getValue('custrecord_cbc_customer_reset_days');
					
					var key = itemBudgetType + '|' + itemAllocType;
					
					if(contactsNewBudgets[key])
						{
							//we have found a record from the customer that already exists on the contact
							//
							var oldResetDays = Number(contactsNewBudgets[key][4]);
							var newResetDays = Number(resetDays);
							var daysDifference = newResetDays - oldResetDays;
							
							//If we have a difference in reset days & the current reset date is set, we need to recalculate it
							//
							if(daysDifference != 0 && contactsNewBudgets[key][5] != '')
								{
									var currentResetDate = nlapiStringToDate(contactsNewBudgets[key][5]);
									var newResetDate = nlapiAddDays(currentResetDate, daysDifference);
									contactsNewBudgets[key][5] = nlapiDateToString(newResetDate);
								}
							
							contactsNewBudgets[key][3] = quantity;
							contactsNewBudgets[key][4] = resetDays;
							contactsNewBudgets[key][6] = 'U';
						}
					else
						{
							//This must be a new budget record
							//
							contactsNewBudgets[key] = [null,itemBudgetType,itemAllocType,quantity,resetDays,null,'C']; 
						}
				}
		}
	else
		{
			//We have not found any relevant records associated to the customer, so what will happen is that all contact related records will be deleted
			//We need to notify the user about this
			//
			alert('No relevant budget records have been found for this grade - all existing budget records for this contact will be deleted');
		}
	
	//Now process the new budgets object & create, delete or update as appropriate
	//
	for ( var contactsNewBudget in contactsNewBudgets) 
		{
			var data = contactsNewBudgets[contactsNewBudget];
			
			switch(data[6])
				{
					case 'C':
						
						var contactBudgetRecord = nlapiCreateRecord('customrecord_cbc_contact_record');
						contactBudgetRecord.setFieldValue('custrecord_cbc_contact_id', _contactId);
						contactBudgetRecord.setFieldValue('custrecord_cbc_contact_budget_type', data[1]);
						contactBudgetRecord.setFieldValue('custrecord_cbc_contact_item_alloc_type', data[2]);
						contactBudgetRecord.setFieldValue('custrecord_cbc_contact_quantity', data[3]);
						contactBudgetRecord.setFieldValue('custrecord_cbc_contact_reset_days', data[4]);
						
						if(_firstOrderDate != '')
							{
								contactBudgetRecord.setFieldValue('custrecord_cbc_contact_reset_date',nlapiDateToString(nlapiAddDays(nlapiStringToDate(_firstOrderDate), data[4])));
							}
						
						nlapiSubmitRecord(contactBudgetRecord, false, true);
						
						break;
						
					case 'U':
						
						var budgetRecord = null;
						
						try
							{
								budgetRecord = nlapiLoadRecord('customrecord_cbc_contact_record', data[0]);
							}
						catch(err)
							{
								budgetRecord = null;
							}
						
						if(budgetRecord)
							{
								budgetRecord.setFieldValue('custrecord_cbc_contact_quantity', data[3]);
								budgetRecord.setFieldValue('custrecord_cbc_contact_reset_days', data[4]);
								budgetRecord.setFieldValue('custrecord_cbc_contact_reset_date', data[5]);
								
								nlapiSubmitRecord(budgetRecord, false, true);
							}
						
						break;
						
					case 'D':
						
						try
							{
								nlapiDeleteRecord('customrecord_cbc_contact_record', data[0]);
							}
					catch(err)
							{
								var message = err.message;
							}
					
						break;
				
				
				}
		}
}