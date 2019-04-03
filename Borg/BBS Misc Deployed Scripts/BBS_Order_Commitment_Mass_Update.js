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
function orderCommitmentMassUpdate(recType, recId) {

	//See if the ship date on the order header is now within 4 weeks
	//if so, reset any item lines that are at 'do not commit' to 'Available Qty'
	//

	var salesOrderRecord = nlapiLoadRecord(recType, recId);

	var headerShipDate = nlapiStringToDate(nlapiGetFieldValue('shipdate'));

	if (headerShipDate != NaN) {

		var weeks = datediff(new Date(), headerShipDate, 'weeks');

		//Are we now within 4 weeks
		//
		if (weeks < 4) {

			//Get the line item count
			//
			var lines = salesOrderRecord.getLineItemCount('item');

			for (var lineno = 1; lineno <= lines; lineno++) {

				//Get the current value of the 'commit' field
				//
				var commit = salesOrderRecord.getLineItemValue('item', 'commitinventory', lineno);

				//If commit is set to 'do not commit', the set to 'available qty'
				//
				if (commit == '3') {

					salesOrderRecord.setLineItemValue('item', 'commitinventory', lineno, '1');
					salesOrderRecord.commitLineItem('item', false);
				}
			}

			nlapiSubmitRecord(salesOrderRecord, false, true);
		}
	}

}

function datediff(date1, date2, interval) {

	var second = 1000, minute = second * 60, hour = minute * 60, day = hour * 24, week = day * 7;

	date1 = new Date(date1);
	date2 = new Date(date2);

	var timediff = date2 - date1;

	if (isNaN(timediff))
		return NaN;

	switch (interval) {
		case "years":
			return date2.getFullYear() - date1.getFullYear();
		case "months":
			return ((date2.getFullYear() * 12 + date2.getMonth()) - (date1.getFullYear() * 12 + date1.getMonth()));
		case "weeks":
			return Math.floor(timediff / week);
		case "days":
			return Math.floor(timediff / day);
		case "hours":
			return Math.floor(timediff / hour);
		case "minutes":
			return Math.floor(timediff / minute);
		case "seconds":
			return Math.floor(timediff / second);
		default:
			return undefined;
	}
}
