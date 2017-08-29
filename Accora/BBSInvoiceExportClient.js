/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       26 Jul 2017     cedricgriffiths
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
function clientFieldChanged(type, name, linenum){
 
}

function exportInvoice()
{
	libExportDSSI('I');	
}

function exportCredit()
{
	libExportDSSI('C');	
}


