/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       01 Sep 2017     cedricgriffiths
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
function clientFieldChanged(type, name, linenum)
{
	if (name == 'custpage_delivery_date_from')
		{
			var fromDate = nlapiStringToDate(nlapiGetFieldValue('custpage_delivery_date_from'));
			var toDate = nlapiStringToDate(nlapiGetFieldValue('custpage_delivery_date_to'));
			
			if (fromDate > toDate)
				{
					nlapiSetFieldValue('custpage_delivery_date_to', nlapiGetFieldValue('custpage_delivery_date_from'), false, true);
				}
		}
	
}
