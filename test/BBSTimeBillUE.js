/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       25 Apr 2018     cedricgriffiths
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
function userEventBeforeSubmit(type)
{
	if(type == 'create')
		{
			var timeRecord = nlapiGetNewRecord();
			var employee = timeRecord.getFieldValue('employee');
			timeRecord.setFieldValue('custcol_bbs_employee', employee);
		}
}
