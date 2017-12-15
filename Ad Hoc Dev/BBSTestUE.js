/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       14 Dec 2017     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function userEventBeforeLoad(type, form, request)
{
	var nsLsaField = form.getField('custpage_lsa_vis');
	nsLsaField.setDisplayType('hidden');
	
	var nsLsaValue = nlapiGetFieldValue('custpage_lsa_vis');
	
	nlapiSetFieldValue('custentity_bbs_lsa_activity', nsLsaValue, false, true);

}
