/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       18 May 2016     cedric
 *
 */

/**
 * @param {String} recType Record type internal id
 * @param {Number} recId Record internal id
 * @returns {Void}
 */
function massUpdate(recType, recId) {

	var salesOrderRecord = nlapiLoadRecord(recType, recId);

	var itemCount = salesOrderRecord.getLineItemCount('item');

	for (var linenum = 1; linenum <= itemCount; linenum++) {

		var lineAmount = Number(salesOrderRecord.getLineItemValue('item', 'amount', linenum));
		var linecost = Number(salesOrderRecord.getLineItemValue('item', 'costestimate', linenum));
		var altSalesAmount = lineAmount - linecost;

		salesOrderRecord.setLineItemValue('item', 'altsalesamt', linenum, altSalesAmount);

	}

	nlapiSubmitRecord(salesOrderRecord, false, true);
}
