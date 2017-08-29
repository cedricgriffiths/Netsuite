/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       03 Mar 2017     cedricgriffiths
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
function userEventBeforeLoad(type, form, request){
 
	//Add the ManPack button to the Items sublist
	//
	if (type == 'create' || type == 'edit')
		{
			var itemSublist = form.getSubList('item');
			
			if(itemSublist)
				{
					itemSublist.addButton('custpage_bbs_button1', 'Filtered Item Search', 'manPackProcessing()');
				}
		}
}
