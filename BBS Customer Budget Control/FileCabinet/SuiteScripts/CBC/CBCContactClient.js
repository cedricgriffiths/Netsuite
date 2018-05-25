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
	if(name == 'custentity_cbc_contact_budget_type')
		{
			var contactId = nlapiGetRecordId();
			var companyId = nlapiGetFieldValue('company');
			var budgetType = nlapiGetFieldValue('custentity_cbc_contact_budget_type');
			
			if(contactId != '')
				{
					removeExistingBudgets(contactId);
					
					nlapiSetFieldValue('custentity_cbc_contact_first_order_date', null, false, true);
					
					if(budgetType != '')
						{
							copyBudgetsFromCompany(contactId, companyId, budgetType);
						}
					
					alert('Customer Budget Control records have been copied down from the company & will be visible after the contact record has been saved');
				}
		}
}

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

function copyBudgetsFromCompany(_contactId, _companyId, _budgetType)
{
	var filters = [
	               ["custrecord_cbc_customer_id","anyof",_companyId],
	               "AND",
	               ["custrecord_cbc_customer_budget_type","anyof",_budgetType]
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
	
}