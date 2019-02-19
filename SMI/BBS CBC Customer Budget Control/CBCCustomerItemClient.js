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
function cbcCustomerItemSaveRecord()
{
	var returnStatus = true;
	
	var item = nlapiGetFieldValue('custrecord_cbc_item_item');
	var grade = nlapiGetFieldValue('custrecord_cbc_item_grade');
	var customer = nlapiGetFieldValue('custrecord_cbc_item_customer');
	var recordId = nlapiGetRecordId();
	
	if(findExistingRecords(item, grade, customer, recordId))
		{
			returnStatus = false;
			
			alert('There is already a record with this customer / grade / item combination, please re-enter');
		}
	
    return returnStatus;
}


function findExistingRecords(_item, _grade, _customer, _recordId)
{
	var recordsFound = false;
	
	var filters = [
	               	["custrecord_cbc_item_customer","anyof",_customer],
	               	"AND",
	               	["custrecord_cbc_item_grade","anyof",_grade],
	               	"AND",
	               	["custrecord_cbc_item_item","anyof",_item]
	              ];

	if(_recordId != '')
		{
			filters.push("AND",["internalid","noneof",_recordId]);
		}
	
	var customrecord_cbc_item_record_recordSearch = nlapiSearchRecord("customrecord_cbc_item_record",null,
			filters, 
			[
			   new nlobjSearchColumn("custrecord_cbc_item_customer")
			]
			);
	
	if(customrecord_cbc_item_record_recordSearch && customrecord_cbc_item_record_recordSearch.length > 0)
		{
			recordsFound = true;
		}
	
	return recordsFound;
}
















