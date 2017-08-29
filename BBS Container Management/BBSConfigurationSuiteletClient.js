/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       11 Jul 2017     cedricgriffiths
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
	if(name == 'custpage_fld_post_to_intran')
		{
			var post = nlapiGetFieldValue('custpage_fld_post_to_intran');
			
			if(post == 'F')
				{
				nlapiSetFieldValue('custpage_fld_intran_loc', '', false, true);
				nlapiSetFieldValue('custpage_fld_inv_adj_acc', null, false, true);
				
				nlapiSetFieldMandatory('custpage_fld_intran_loc', false);
				nlapiSetFieldMandatory('custpage_fld_inv_adj_acc', false);
				}
			else
				{
					nlapiSetFieldMandatory('custpage_fld_intran_loc', true);
					nlapiSetFieldMandatory('custpage_fld_inv_adj_acc', true);	
				}
		}
}
