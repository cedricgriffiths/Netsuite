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
function cbcCustomerBudgetSaveRecord()
{
	var returnStatus = true;
	
	var budgetType = nlapiGetFieldValue('custrecord_cbc_customer_budget_type');
	var allocType = nlapiGetFieldValue('custrecord_cbc_customer_item_alloc_type');
	var customerId = nlapiGetFieldValue('custrecord_cbc_customer_id');
	var grade = nlapiGetFieldValue('custrecord_cbc_customer_grade');
	
	var recordId = nlapiGetRecordId();
	
	if(findExistingRecords(budgetType, allocType, customerId, recordId, grade))
		{
			returnStatus = false;
			
			if(allocType != '')
				{
					alert('There is already a record with this item allocation type within the grade, please select a different type');
				}
			else
				{
					alert('There is already a record with this budget type within the grade, please select a different type');
				}
		}
	
    return returnStatus;
}


function findExistingRecords(_budgetType, _allocType, _customerId, _recordId, _grade)
{
	var recordsFound = false;
	
	var filters = [["custrecord_cbc_customer_id","anyof",_customerId]];
	
	if(_grade != '')
	{
		filters.push("AND",["custrecord_cbc_customer_grade","anyof",_grade]);
	}

	if(_budgetType != '')
	{
		filters.push("AND",["custrecord_cbc_customer_budget_type","anyof",_budgetType]);
	}

	if(_allocType != '')
		{
			filters.push("AND",["custrecord_cbc_customer_item_alloc_type","anyof",_allocType]);
		}

	if(_recordId != '')
		{
			filters.push("AND",["internalid","noneof",_recordId]);
		}
	
	var customrecord_cbc_customer_recordSearch = nlapiSearchRecord("customrecord_cbc_customer_record",null,
			filters, 
			[
			   new nlobjSearchColumn("custrecord_cbc_customer_id")
			]
			);
	
	if(customrecord_cbc_customer_recordSearch && customrecord_cbc_customer_recordSearch.length > 0)
		{
			recordsFound = true;
		}
	
	return recordsFound;
}
















