/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       12 Apr 2019     cedricgriffiths
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
function quoteCopyBeforeLoad(type, form, request)
{
	if(type == 'copy')
		{
			var originalRecordId = request.getParameter('id');
			
			if(originalRecordId != null && originalRecordId != '')
				{
					var originalProbability = nlapiLookupField('estimate', originalRecordId, 'probability', false);
					
					var newField = form.addField('custpage_bbs_orig_probability', 'percent', 'Original Probability');
					newField.setDisplayType('hidden');
					
					nlapiSetFieldValue('custpage_bbs_orig_probability', originalProbability, false, true);
				}
		}
}
