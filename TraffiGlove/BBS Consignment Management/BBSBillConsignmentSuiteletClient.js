/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       27 Jun 2017     cedricgriffiths
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
function billFieldChanged(type, name, linenum){
 
}

function ProcessSupplier(supplier)
{
	var lines = nlapiGetLineItemCount('custpage_sublist1');
	
	for (var int = 1; int <= lines; int++) 
	{
		var lineSupplier = nlapiGetLineItemValue('custpage_sublist1', 'custpage_col7', int);
		
		if (lineSupplier == supplier)
			{
				nlapiSetLineItemValue('custpage_sublist1', 'custpage_col1', int, 'T');
			}
	}
}
