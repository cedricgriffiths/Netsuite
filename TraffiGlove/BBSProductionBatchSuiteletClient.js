/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       01 Sep 2017     cedricgriffiths
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
function clientFieldChanged(type, name, linenum)
{
	if (name == 'custpage_so_commit_select')
		{
			nlapiSetFieldValue('custpage_so_com_text', nlapiGetFieldText(name), false, true)
		}
	
	if (name == 'custpage_wo_commit_select')
	{
		nlapiSetFieldValue('custpage_wo_com_text', nlapiGetFieldText(name), false, true)
	}

	if (name == 'custpage_so_select')
	{
		nlapiSetFieldValue('custpage_so_text', nlapiGetFieldText(name), false, true)
	}
}
