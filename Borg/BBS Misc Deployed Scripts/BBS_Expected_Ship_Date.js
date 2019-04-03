/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       03 Jun 2016     cedric           Customer: Borg
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */
function userEventBeforeSubmit(type) {

	//Get the ship date from the order header
	//
	var headerShipDate = nlapiGetFieldValue('shipdate');

	// Get the number of items
	//
	var itemCount = nlapiGetLineItemCount('item');

	// Init most recent date
	//
	var latestDate = null;

	if (headerShipDate != null && headerShipDate != '') {

		latestDate = nlapiStringToDate(headerShipDate);
	}

	// Loop through the item lines 
	//
	for (var lineNo = 1; lineNo <= itemCount; lineNo++) {

		// Get the expected ship date
		//
		var lineESD = nlapiGetLineItemValue('item', 'expectedshipdate', lineNo);

		// See if we have a none null ESD
		//
		if (lineESD != null && lineESD != '') {

			var tempESDDate = nlapiStringToDate(lineESD);

			//If the latest date is null, then set it to the date from the current line
			//as this must be the first date we have found
			//
			if (latestDate == null) {

				latestDate = tempESDDate;
			}
			else {
				//Otherwise do a compare on the line date with the current soonest date we hold
				//
				if (tempESDDate > latestDate) {

					latestDate = tempESDDate;
				}
			}
		}
	}

	// Set the field value for the ship date
	//
	if (latestDate != null) {

		nlapiSetFieldValue('custbody_bbs_otif_date', nlapiDateToString(latestDate), false, true);
	}

}
