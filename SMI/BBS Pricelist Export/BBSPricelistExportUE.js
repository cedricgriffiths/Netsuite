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
function pricelistExportBeforeLoad(type, form, request)
{
	if (type == 'edit')
	{
		form.addButton('custpage_but_price_export', 'Generate Pricelist', 'libPricelistExport()');
	}
	
	if (type == 'view')
		{
			form.setScript('customscript_bbs_pricelist_global');
			form.addButton('custpage_but_price_export', 'Generate Pricelist', 'libPricelistExport()');
		}
}
