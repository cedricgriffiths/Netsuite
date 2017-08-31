/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       18 May 2016     cedric
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Operation types: create, edit, delete, xedit approve, reject,
 *            cancel (SO, ER, Time Bill, PO & RMA only) pack, ship (IF)
 *            markcomplete (Call, Task) reassign (Case) editforecast (Opp,
 *            Estimate)
 * @returns {Void}
 */
function userEventBeforeSubmit(type) {

	if (type == 'create' || type == 'edit') {

		var itemCount = nlapiGetLineItemCount('item');

		for (var linenum = 1; linenum <= itemCount; linenum++) {

			var lineAmount = Number(nlapiGetLineItemValue('item', 'amount', linenum));
			var linecost = Number(nlapiGetLineItemValue('item', 'costestimate', linenum));
			var altSalesAmount = lineAmount - linecost;

			nlapiSetLineItemValue('item', 'altsalesamt', linenum, altSalesAmount);

		}
	}
}
