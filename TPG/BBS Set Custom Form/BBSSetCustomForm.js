/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       14 Nov 2018     cedricgriffiths
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
function setFormBeforeSubmit(type)
{
	if(type == 'create')
		{
			//Get the parameters
			//
			var context = nlapiGetContext();
			var formId = context.getSetting('SCRIPT', 'custscript_bbs_custom_form_id');
			var executionContext = context.getExecutionContext();
			
			if(formId != null && formId != '' && executionContext == 'csvimport')
				{
					var isOverhead = nlapiGetFieldValue('custbodyoverhead');
					
					if (isOverhead == 'T')
						{
							nlapiSetFieldValue('customform', formId, true, true);
						}
				}
		}
}
