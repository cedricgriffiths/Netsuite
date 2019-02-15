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
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function cbcContactAfterSubmit(type)
{
	if(type == 'create')
		{
			var newRecord = nlapiGetNewRecord();
			var contactId = newRecord.getId();
			var companyId = newRecord.getFieldValue('company');
			var budgetType = newRecord.getFieldValue('custentity_cbc_contact_budget_type');
		
			if(budgetType != '')
				{
					copyBudgetsFromCompany(contactId, companyId, budgetType);
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