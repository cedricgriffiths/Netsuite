/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       14 Jan 2019     cedricgriffiths
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
function poNoBeforeLoad(type, form, request)
{
	//Add the button in view mode only & also associate a global script to the form
	//which will hold the function the button will call
	//
	if(type == 'view')
		{
			form.addButton('custpage_button_po_no', 'Update Purchase Order No', 'client_update_po_no');
			form.setScript('customscript_bbs_po_no_global');
		}
}
