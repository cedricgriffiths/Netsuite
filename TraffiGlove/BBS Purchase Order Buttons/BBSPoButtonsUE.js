/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       09 Jan 2019     cedricgriffiths
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
function poButtonsBeforeLoad(type, form, request)
{
	if (type == 'edit' || type == 'create')
		{
			var itemSublist = form.getSubList('item');
			
			if(itemSublist)
				{
					itemSublist.addButton('custpage_but_cpy_del_date', 'Copy Delivery Date', 'clientCopyDelDate()');
					itemSublist.addButton('custpage_but_cpy_location', 'Copy Location', 'clientCopyLocation()');
					itemSublist.addButton('custpage_but_cpy_xfac_date', 'Copy Ex Factory Date', 'clientCopyXfacDate()');
				}
		}
}
