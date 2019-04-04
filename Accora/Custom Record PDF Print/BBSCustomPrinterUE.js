/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       12 Jul 2017     cedricgriffiths
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
function customPrinterBeforeLoad(type, form, request)
{
	if(type == 'edit')
		{
			form.addButton('custpage_but_cust_print', 'Custom PDF Printing', 'customPrinterButton()');
		}
	
	if(type == 'view')
	{
		form.addButton('custpage_but_cust_print', 'Custom PDF Printing', 'customPrinterButton()');
		form.setScript('customscript_bbs_custom_printer_client')
	}
}
