/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       21 Mar 2016     cedric
 *
 */

/**
 * @param {nlobjRequest}
 *            request Request object
 * @param {nlobjResponse}
 *            response Response object
 * @returns {Void} Any output is written via response object
 */
function SupplierSelect(request, response) {
	var defaultHtml = '<html><body><h1>No Suppliers to Select</h1></body></html>';

	if (request.getMethod() == 'GET') {
		// Get the id of the item from the query param
		//
		var itemIdParam = request.getParameter('itemid');

		if (itemIdParam != null && itemIdParam != '') {
			// We are assuming that we are working with service items only
			//
			var itemRecord = null;

			try {

				itemRecord = nlapiLoadRecord('noninventoryitem', itemIdParam);
			}
			catch (err) {

				try {

					itemRecord = nlapiLoadRecord('discountitem', itemIdParam);
				}
				catch (err) {

					try {
						itemRecord = nlapiLoadRecord('serviceitem', itemIdParam);

					}
					catch (err) {
					}
				}
			}

			// Find out how many vendors are associated with this item
			//
			var vendorCount = itemRecord.getLineItemCount('itemvendor');

			// If we have vendors, then show a list in a form
			//
			if (vendorCount > 0) {
				// Create a form
				//
				var form = nlapiCreateForm('Select Supplier for Item');

				// Add a submit button
				//
				form.addSubmitButton('Submit');

				// Create the supplier select field
				//
				var supplierfield = form.addField('custpage_supplier', 'select', 'Supplier');

				supplierfield.addSelectOption('', '', true);

				// Loop round all the suppliers
				//
				for (var lineNum = 1; lineNum <= vendorCount; lineNum++) {
					// Get the supplier id
					//
					var vendorId = itemRecord.getLineItemValue('itemvendor', 'vendor', lineNum);

					// Read the supplier record
					//
					var supplierRecord = nlapiLoadRecord('vendor', vendorId);

					// Construct the supplier desription
					//
					var supplierIdNumber = supplierRecord.getFieldValue('entityid');
					var supplierName = supplierRecord.getFieldValue('companyname');
					var supplierDescription = supplierIdNumber + ' ' + supplierName;

					// Add the supplier to the select list
					//
					supplierfield.addSelectOption(vendorId, supplierDescription);
				}

				// Write output
				//
				response.writePage(form);
			}
			else {
				response.write(defaultHtml);
			}
		}
		else {
			response.write(defaultHtml);
		}
	}
	else {
		// Get selected Item ID
		//
		var data = request.getParameter('custpage_supplier');

		// Trigger the callback function and close pop-up window
		//
		response.write('<html><body><script>window.opener.supplierSelectCallback("' + data + '"); window.close();</script></body></html>');
	}
}
