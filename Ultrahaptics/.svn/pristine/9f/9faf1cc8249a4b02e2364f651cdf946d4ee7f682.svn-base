/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       28 Feb 2017     cedricgriffiths
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
	if (type == 'item')
		{
			if (name == 'custcol_bbs_department')
				{
					var dept = nlapiGetCurrentLineItemValue('item', 'custcol_bbs_department');
					nlapiSetCurrentLineItemValue('item', 'department', dept, true, true);
				}
			
			if (name == 'class')
				{
					nlapiSetCurrentLineItemValue(type, 'custcol_bbs_department', null, true, true);
				}
		}
	else
		{
			if (name == 'custbody_bbs_department')
				{
					var dept = nlapiGetFieldValue(name);
					
					nlapiSetFieldValue('department', dept, true, true);
				}
				
			if (name == 'class')
			{
				nlapiSetFieldValue('custbody_bbs_department', null, true, true);
			}
		}
}
