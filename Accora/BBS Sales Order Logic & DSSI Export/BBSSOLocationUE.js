/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       01 May 2019     cedricgriffiths
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
function soLocationBeforeLoad(type, form, request)
{
	var subsidiaryId = nlapiGetFieldValue('subsidiary');

	if(subsidiaryId == '7')
		{
			form.addFieldGroup('custpage_bbs_group', 'Cross Subsidiary Location', 'main');
			
			var subsidLocationField = form.addField('custpage_subsid_location', 'select', 'Subsidiary Location', null, 'custpage_bbs_group');
			subsidLocationField.setMandatory(true);
			subsidLocationField.addSelectOption('0', '', true);
			subsidLocationField.addSelectOption('129', 'Frank - Demo Stock', false);
			subsidLocationField.addSelectOption('130', 'Des - Demo Stock', false);
			subsidLocationField.addSelectOption('128', 'IE HQ', false);
			subsidLocationField.addSelectOption('14', 'Europa', false);
			subsidLocationField.addSelectOption('7', 'Orwell', false);
		}
}
