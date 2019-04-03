/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       30 Aug 2018     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function assemblyBuildTimeFieldChanged(type, name, linenum)
{
	if(name == 'assemblyitem' || name == 'quantity')
		{
			var assemblyId = nlapiGetFieldValue('assemblyitem');
			var	quantity = Number(nlapiGetFieldValue('quantity'));
			
			if(assemblyId != null && assemblyId != '' && quantity != 0)
				{
					var buildTime = Number(nlapiLookupField('assemblyitem', assemblyId, 'custitem_bbs_build_time', false));
					
					if(buildTime > 0)
						{
							var totalTime = buildTime * quantity;
							
							nlapiSetFieldValue('custbody_bbs_total_build_time', totalTime.toFixed(0), false, true);
						}
				}
		}
}
