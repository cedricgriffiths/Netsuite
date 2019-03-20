/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       20 Mar 2019     cedricgriffiths
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

function itemExternalIdAS(type)
{
	if(type == 'create')
		{
			var newRecord = nlapiGetNewRecord();
			var newId = newRecord.getId();
			var itemName = newRecord.getFieldValue('itemid');
			
			nlapiSubmitField('noninventoryitem', newId, 'externalid', itemName, false);
		}
}
