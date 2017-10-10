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
function poMatrixBeforeLoad(type, form, request)
{
	if (type == 'edit')
	{
		//form.addButton('custpage_but_po_matrix', 'Print Po Matrix', 'libPoMatrix()');
	}
	
	if (type == 'view')
		{
			form.setScript('customscript_bbs_po_matrix_global');
			form.addButton('custpage_but_po_matrix', 'Print PO Matrix', 'gblPoMatrix()');
		}
}
