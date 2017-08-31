/**
 * Module Description
 * 
 * Version Date Author Remarks 1.00 21 Mar 2016 cedric
 * 
 */
function detailFieldChanged(type, name, linenum) {
	// Only work on the item type field
	//
	if (name == 'custrecord_bbs_con_detail_item_type') {
		// Get the field value
		//
		var selectedItem = nlapiGetFieldValue('custrecord_bbs_con_detail_item_type');

		// Only continue if an item has been selected
		//
		if (selectedItem != null && selectedItem != '') {
			// Get the service item & check the supplier count
			//
			var itemRecord = null;

			try {

				itemRecord = nlapiLoadRecord('noninventoryitem', selectedItem);
			}
			catch (err) {

				try {

					itemRecord = nlapiLoadRecord('discountitem', selectedItem);
				}
				catch (err) {
					try {
						itemRecord = nlapiLoadRecord('serviceitem', selectedItem);

					}
					catch (err) {
					}
				}
			}
			var vendorCount = itemRecord.getLineItemCount('itemvendor');

			if (vendorCount > 0) {
				var url = nlapiResolveURL('SUITELET', 'customscript_bbs_item_supplier_script', 'customdeploy_bbs_item_supplier_script');

				// Add the header id as a query param to the url
				//
				url += '&itemid=' + selectedItem;

				// Open the contract print in a new window
				//
				window.open(url, '_blank', 'toolbar=no, scrollbars=no, resizable=no, width=900, height=400');
			}
		}
	}
}

// Callback function from the suitelet pop-up
// Populate the supplier from the select list
//
function supplierSelectCallback(data) {
	nlapiSetFieldValue('custrecord_bbs_con_detail_supplier', data, true, true);
}