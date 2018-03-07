/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       07 Mar 2018     cedricgriffiths
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
function salesOrderFieldChanged(type, name, linenum)
{
	if(type == 'item' && name == 'custcol_bbs_pack_size')
		{
			var packSize = nlapiGetCurrentLineItemValue(type, name);
			nlapiSetCurrentLineItemValue(type, 'units', packSize, true, true);
		}
}
