/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       12 Mar 2019     cedricgriffiths
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
function resetJournalPostedBL(type, form, request)
{
	if(type == 'copy' || type == 'create')
		{
			var lines = nlapiGetLineItemCount('item');
			
			for (var int = 1; int <= lines; int++) 
				{
					nlapiSetLineItemValue('item', 'custcol_bbs_journal_posted', int, 'F');
				}
			
			lines = nlapiGetLineItemCount('expense');
			
			for (var int = 1; int <= lines; int++) 
				{
					nlapiSetLineItemValue('expense', 'custcol_bbs_journal_posted', int, 'F');
				}
		}
}
