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
 * @returns {Boolean} True to continue save, false to abort save
 */
function cbcContactBudgetSaveRecord()
{
	var returnStatus = true;
	
	var budgetType = nlapiGetFieldValue('custrecord_cbc_contact_budget_type');
	var allocType = nlapiGetFieldValue('custrecord_cbc_contact_item_alloc_type');
	var contactId = nlapiGetFieldValue('custrecord_cbc_contact_id');
	var recordId = nlapiGetRecordId();
	
	if(findExistingRecords(budgetType, allocType, contactId, recordId))
		{
			returnStatus = false;
			
			if(allocType != '')
				{
					alert('There is already a record with this item allocation type, please select a different type');
				}
			else
				{
					alert('There is already a record with this budget type, please select a different type');
				}
		}
	
    return returnStatus;
}


function findExistingRecords(_budgetType, _allocType, _contactId, _recordId)
{
	var recordsFound = false;
	
	var filters = [["custrecord_cbc_contact_id","anyof",_contactId]];
	
	if(_budgetType != '')
		{
			filters.push("AND",["custrecord_cbc_contact_budget_type","anyof",_budgetType]);
		}

	if(_allocType != '')
		{
			filters.push("AND",["custrecord_cbc_contact_item_alloc_type","anyof",_allocType]);
		}

	if(_recordId != '')
		{
			filters.push("AND",["internalid","noneof",_recordId]);
		}
	
	var customrecord_cbc_contact_recordSearch = nlapiSearchRecord("customrecord_cbc_contact_record",null,
			filters, 
			[
			   new nlobjSearchColumn("custrecord_cbc_contact_id")
			]
			);
	
	if(customrecord_cbc_contact_recordSearch && customrecord_cbc_contact_recordSearch.length > 0)
		{
			recordsFound = true;
		}
	
	return recordsFound;
}
















