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
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function copyQuotePageInit(type)
{
	if(type == 'copy')
		{
			var originalProbability = nlapiGetFieldValue('custpage_bbs_orig_probability').replace('%', '');
					
			if(originalProbability != null && originalProbability != '')
				{
					var allowedProbabilities = ['1.0','10.0','25.0','50.0','75.0','99.0'];
				
					if(allowedProbabilities.indexOf(originalProbability) != -1)
						{
							nlapiSetFieldValue('probability', originalProbability, true, true);
						}
				}
		}
}
