/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       28 Apr 2016     cedric
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
function clientFieldChanged(type, name, linenum) {

	if (name == 'shipaddresslist') {

		var selectedAddressId = nlapiGetFieldValue(name);

		nlapiSetFieldValue('custbody10', selectedAddressId, false, true);

	}
}
