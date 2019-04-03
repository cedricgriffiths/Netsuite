/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       21 Jun 2018     cedricgriffiths
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
function projectBeforeLoad(type, form, request)
{
	if(type == 'edit' || type == 'view')
		{
			var thisRecordId = nlapiGetRecordId();
			var thisRecord = nlapiLoadRecord('job',thisRecordId);
			
			var lineCount = thisRecord.getLineItemCount('plstatement');
			var totalCost = Number(0);
			
			for (var int = 1; int <= lineCount; int++) 
				{
					var costTotal = thisRecord.getLineItemValue('plstatement', 'costcategory', int);
					
					if(costTotal == 'Total')
						{
							var cost = Number(thisRecord.getLineItemValue('plstatement', 'cost', int));
							totalCost += cost;
						}
				}
			
			nlapiSetFieldValue('custentity_bbs_actual_costs', totalCost, false, true);

		}
}
