/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       28 Apr 2016     cedric
 *
 */

/**
 * @param {String} recType Record type internal id
 * @param {Number} recId Record internal id
 * @returns {Void}
 */
function massUpdate(recType, recId) {

	var salesOrderRecord = nlapiLoadRecord(recType, recId);

	var selectedAddress = salesOrderRecord.getFieldValue('shipaddresslist');

	salesOrderRecord.setFieldValue('custbody10', selectedAddress);

	nlapiSubmitRecord(salesOrderRecord, false, true);
}
