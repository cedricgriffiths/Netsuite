/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       14 Jul 2017     cedricgriffiths
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
function productionBatchBeforeLoad(type, form, request)
{
	if (type == 'edit')
		{
			form.addButton('custpage_but_add_wo', 'Assign Works Orders', 'assignWorksOrders()');
		}
	
}
