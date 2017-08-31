/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       08 Jul 2016     cedric           Customer : Borg
 *
 */

/**
 * @param {String} recType Record type internal id
 * @param {Number} recId Record internal id
 * @returns {Void}
 */
function massUpdate(recType, recId) {

	var salesOrderRecord = nlapiLoadRecord(recType, recId);

	var origShipDate = salesOrderRecord.getFieldValue('custbody_bbs_orig_shipping_date');
	var origRequestedDate = salesOrderRecord.getFieldValue('custbody_bbs_orig_requested_date');

	salesOrderRecord.setFieldValue('custbody_bbs_custreqshipdate', origShipDate);

	if (origRequestedDate != null && origRequestedDate != '') {

		salesOrderRecord.setFieldValue('shipdate', origRequestedDate);
	}

	nlapiSubmitRecord(salesOrderRecord, false, true);

}
