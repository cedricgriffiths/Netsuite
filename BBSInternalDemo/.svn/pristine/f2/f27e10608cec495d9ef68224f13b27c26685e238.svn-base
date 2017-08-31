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
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to save line item, false to abort save
 */
function clientValidateLine(type) {

	var returnStatus = true;

	if (type == 'item') {

		var applyLogic = false;
		var productRecord = null;
		var itemId = nlapiGetCurrentLineItemValue(type, 'item');
		var orderCustomer = nlapiGetFieldValue('entity');

		//Read the item record to see what type it is
		//
		if (itemId != null & itemId != '') {

			try {
				productRecord = nlapiLoadRecord('assemblyitem', itemId);

				applyLogic = true;
			}
			catch (err) {

				try {
					productRecord = nlapiLoadRecord('inventoryitem', itemId);

					applyLogic = true;
				}
				catch (err) {

					try {
						productRecord = nlapiLoadRecord('kititem', itemId);

						applyLogic = true;
					}
					catch (err) {

						applyLogic = false;
					}
				}
			}
		}

		//Logic to set commit on line to 'Do not commit' if ship date is > 4 weeks away 
		//and we are working with a valid line item type
		//
		var headerShipDate = nlapiStringToDate(nlapiGetFieldValue('shipdate'));

		if (headerShipDate != NaN && applyLogic == true) {

			var weeks = datediff(new Date(), headerShipDate, 'weeks');

			if (weeks >= 4) {

				//Set commit to 'do not commit' (3)   -  (1)=Available Qty
				//
				nlapiSetCurrentLineItemValue(type, 'commitinventory', '3', false, true);
			}
		}

		//Logic to check to see if expected ship date should be mandatory, but only for valid
		//line item types
		//
		var lineESD = nlapiGetCurrentLineItemValue(type, 'expectedshipdate');

		if ((lineESD == null || lineESD == '') && applyLogic == true) {

			alert('Expected Ship Date Cannot Be Blank!');

			returnStatus = false;

		}
		else {

			returnStatus = true;
		}

		//Now check to see if we are working with a special item
		//
		if (productRecord != null) {

			var itemType = productRecord.getFieldValue('custitem_bbs_item_type');
			var specialCustomer = productRecord.getFieldValue('custitem_bbs_special_customer');

			//Only check if item type is 'Special'
			//
			if (itemType != null && itemType != '' && itemType == '2') {

				//Go and get the customer record to see if there is a parent
				//
				var customerRecord = nlapiLoadRecord('customer', orderCustomer);
				var parentCustomer = customerRecord.getFieldValue('parent');

				specialCustomer = specialCustomer == null ? '' : specialCustomer;
				parentCustomer = parentCustomer == null ? '' : parentCustomer

				//Is the special customer on the item the same as the order customer
				//
				if (specialCustomer != null && specialCustomer != '') {

					if (orderCustomer != specialCustomer && specialCustomer != parentCustomer) {

						alert('Special product is not assigned to the customer or its parent');

						returnStatus = false;
					}
				}
			}
		}

	}

	return returnStatus;
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
