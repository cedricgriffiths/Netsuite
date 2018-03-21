/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       05 Mar 2017     cedricgriffiths
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
function invoicingFieldChanged(type, name, linenum)
{
	//If any of the filters are changed, then get the data from all of those filters & store the data in the session data
	//
	if(name == 'custpage_sales_order_select')
		{
			var filtersString = nlapiGetFieldValue('custpage_sales_order_select');
			
			libSetSessionData(session, filtersString);
		}


}	
