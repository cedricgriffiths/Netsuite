/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       31 Mar 2016     cedric
 *
 */

/**
 * @returns {Void} Any or no return value
 */
// Custom workflow action to update contract detail records with the related
// sales invoice
//
function UpdateContractDetailWithSalesInv() {
	// Get the current invoice record
	//
	var invRecord = nlapiGetNewRecord();

	// Get the id of the invoice to use later
	//
	var invId = invRecord.getId()

	// Get the sales order linked to this sales invoice
	var salesOrderId = invRecord.getFieldValue('createdfrom');

	// Has this been created from something else?
	//
	if (salesOrderId != null && salesOrderId != "") {

		var soRecord = null;

		// See if the "Created From" was a sales order
		//
		try {
			var soRecord = nlapiLoadRecord("salesorder", poCreatedFrom);
		}
		catch (err) {
			// Failed to read the SO, so null the soRecord object
			//
			soRecord = null;
		}

		if (soRecord != null) {

			// Search contract detail records for ones having the sales order
			//
			var searchFilters = new Array();
			searchFilters[0] = new nlobjSearchFilter('custrecord_bbs_con_detail_sales_order', null, 'is', salesOrderId);

			var searchColumns = new Array();
			searchColumns[0] = new nlobjSearchColumn('custrecord_bbs_con_detail_sales_order');
			searchColumns[1] = new nlobjSearchColumn('custrecord_bbs_con_detail_supplier');

			// Create the search
			//
			var search = nlapiCreateSearch('customrecord_bbs_con_detail', searchFilters, searchColumns);

			// Run the search
			//
			var searchResults = search.runSearch();

			// Set the result set from the search
			//
			var searchResultSet = searchResults.getResults(0, 100);

			for (var resultCount = 0; resultCount < searchResultSet.length; resultCount++) {
				// Get the contract detail id
				//
				var contractDetailId = searchResultSet[resultCount].getId();

				// Read the contract detail record
				//
				var contractDetailRecord = nlapiLoadRecord('customrecord_bbs_con_detail', contractDetailId);

				// Update it with the sales invoice details
				//
				contractDetailRecord.setFieldValue('custrecord_bbs_con_detail_sales_inv', invId);

				// Save the contract detail record
				//
				nlapiSubmitRecord(contractDetailRecord, false, true);
			}
		}
	}
}

// Custom workflow action to update contract detail records with the related
// purchase invoice (bill)
//
function UpdateContractDetailWithInv() {
	// Get the current invoice record
	//
	var invRecord = nlapiGetNewRecord();

	// Get the id of the invoice to use later
	//
	var invId = invRecord.getId()

	// Get the count of po's linked to this invoice
	//
	var poCount = invRecord.getLineItemCount('purchaseorders');

	// Loop through all of the po's linked to this invoice
	//
	for (var poLine = 1; poLine <= poCount; poLine++) {
		// Get the id of the po record
		//
		var poRecordId = invRecord.getLineItemValue('purchaseorders', 'id', poLine);

		// Search contract detail records for ones having the purchase order
		//
		var searchFilters = new Array();
		searchFilters[0] = new nlobjSearchFilter('custrecord_bbs_con_detail_po', null, 'is', poRecordId);

		var searchColumns = new Array();
		searchColumns[0] = new nlobjSearchColumn('custrecord_bbs_con_detail_sales_order');
		searchColumns[1] = new nlobjSearchColumn('custrecord_bbs_con_detail_supplier');

		// Create the search
		//
		var search = nlapiCreateSearch('customrecord_bbs_con_detail', searchFilters, searchColumns);

		// Run the search
		//
		var searchResults = search.runSearch();

		// Set the result set from the search
		//
		var searchResultSet = searchResults.getResults(0, 100);

		for (var resultCount = 0; resultCount < searchResultSet.length; resultCount++) {
			// Get the contract detail id
			//
			var contractDetailId = searchResultSet[resultCount].getId();

			// Read the contract detail record
			//
			var contractDetailRecord = nlapiLoadRecord('customrecord_bbs_con_detail', contractDetailId);

			// Update it with the invoice details
			//
			contractDetailRecord.setFieldValue('custrecord_bbs_con_detail_inv', invId);
			contractDetailRecord.setFieldValue('custrecord_bbs_con_detail_supp_inv_rec', 'T');

			// Save the contract detail record
			//
			nlapiSubmitRecord(contractDetailRecord, false, true);
		}
	}
}

// Custom workflow action to update contract detail records with the related po
//
function UpdateContractDetailWithPO() {
	// Get the current PO record
	//
	var poRecord = nlapiGetNewRecord();

	// Get the id of the PO to use later
	//
	var poId = poRecord.getId()

	// Get the created from field
	//
	var poCreatedFrom = poRecord.getFieldValue("createdfrom");

	// Has this PO been created from something else?
	//
	if (poCreatedFrom != null && poCreatedFrom != "") {
		var soRecord = null;

		// See if the "Created From" was a sales order
		//
		try {
			var soRecord = nlapiLoadRecord("salesorder", poCreatedFrom);
		}
		catch (err) {
			// Failed to read the SO, so null the soRecord object
			//
			soRecord = null;
		}

		// If we have got the sales order, we can proceed
		//
		if (soRecord != null) {
			// Get the supplier from the p/o
			//
			var supplierId = poRecord.getFieldValue('entity');

			// Search contract detail records for ones having the sales order &
			// supplier on that we are working with
			//
			var searchFilters = new Array();
			searchFilters[0] = new nlobjSearchFilter('custrecord_bbs_con_detail_sales_order', null, 'is', poCreatedFrom);
			searchFilters[1] = new nlobjSearchFilter('custrecord_bbs_con_detail_supplier', null, 'is', supplierId);

			var searchColumns = new Array();
			searchColumns[0] = new nlobjSearchColumn('custrecord_bbs_con_detail_sales_order');
			searchColumns[1] = new nlobjSearchColumn('custrecord_bbs_con_detail_supplier');

			// Create the search
			//
			var search = nlapiCreateSearch('customrecord_bbs_con_detail', searchFilters, searchColumns);

			// Run the search
			//
			var searchResults = search.runSearch();

			// Set the result set from the search
			//
			var searchResultSet = searchResults.getResults(0, 100);

			// Loop through all of the results
			//
			for (var int = 0; int < searchResultSet.length; int++) {
				// Get the contract detail id
				//
				var contractDetailId = searchResultSet[int].getId();

				// Read the contract detail record
				//
				var contractDetailRecord = nlapiLoadRecord('customrecord_bbs_con_detail', contractDetailId);

				// Update it with the p/o details
				//
				contractDetailRecord.setFieldValue('custrecord_bbs_con_detail_po', poId);
				contractDetailRecord.setFieldValue('custrecord_bbs_con_detail_po_raised', 'T');

				// Save the contract detail record
				//
				nlapiSubmitRecord(contractDetailRecord, false, true);
			}
		}
	}
}

//Custom workflow action to update contract detail records with the related so
//
function UpdateContractDetailWithSO() {
	// Get the current SO record
	//
	var soRecord = nlapiGetNewRecord();

	// Get the id of the SO to use later
	//
	var soId = soRecord.getId()

	// Get the created from field
	//
	var soCreatedFrom = soRecord.getFieldValue("opportunity");

	// Has this SO been created from something else?
	//
	if (soCreatedFrom != null && soCreatedFrom != "") {
		var oppRecord = null;

		// See if the "Created From" was an opportunity
		//
		try {
			var oppRecord = nlapiLoadRecord("opportunity", soCreatedFrom);
		}
		catch (err) {
			// Failed to read the SO, so null the soRecord object
			//
			oppRecord = null;
		}

		// If we have got the sopportunity, we can proceed
		//
		if (oppRecord != null) {

			// Search contract detail records for ones having the opportunity
			// on that we are working with
			//
			var searchFilters = new Array();
			searchFilters[0] = new nlobjSearchFilter('custrecord_bbs_con_detail_opportunity', null, 'is', soCreatedFrom);

			var searchColumns = new Array();
			searchColumns[0] = new nlobjSearchColumn('custrecord_bbs_con_detail_opportunity');

			// Create the search
			//
			var search = nlapiCreateSearch('customrecord_bbs_con_detail', searchFilters, searchColumns);

			// Run the search
			//
			var searchResults = search.runSearch();

			// Set the result set from the search
			//
			var searchResultSet = searchResults.getResults(0, 100);

			// Loop through all of the results
			//
			var contractHeaderId = null;

			for (var int = 0; int < searchResultSet.length; int++) {
				// Get the contract detail id
				//
				var contractDetailId = searchResultSet[int].getId();

				// Read the contract detail record
				//
				var contractDetailRecord = nlapiLoadRecord('customrecord_bbs_con_detail', contractDetailId);

				//Get the contract header id from the detail line
				//
				contractHeaderId = contractDetailRecord.getFieldValue('custrecord_bbs_con_detail_contract');

				// Update it with the sales order details
				//
				contractDetailRecord.setFieldValue('custrecord_bbs_con_detail_sales_order', soId);

				// Save the contract detail record
				//
				nlapiSubmitRecord(contractDetailRecord, false, true);
			}

			/*if (contractHeaderId != null) {

				var contractHeaderRecord = nlapiLoadRecord('customrecord_bbs_con_header', contractHeaderId);

				if (contractHeaderRecord != null) {

					//Set contract header to a status of 'live'
					//
					contractHeaderRecord.setFieldValue('custrecord_bbs_con_status', '1');

					nlapiSubmitRecord(contractHeaderRecord, false, true);
				}
			}*/
		}
	}
}

function UpdateContractWithNewSODetails() {
	// Get the current SO record
	//
	var soRecord = nlapiGetNewRecord();

	// Get the id of the SO to use later
	//
	var soId = soRecord.getId()

	// Get the contract field
	//
	var contractId = soRecord.getFieldValue("custbody_bbs_contract_header");

	//Did this s/o relate to a contract?
	//
	if (contractId != null && contractId != "") {

		//Read in the s/o
		//
		soRecord = nlapiLoadRecord('salesorder', soId);

		//Get the count of item lines
		//
		var itemCount = soRecord.getLineItemCount('item');

		//Loop through the item lines
		//
		var hasSoBeenUpdated = false;

		for (var lineNo = 1; lineNo <= itemCount; lineNo++) {

			//Does this item need copying to the contract?
			//
			var copyToContract = soRecord.getLineItemValue('item', 'custcol_bbs_copy_to_contract', lineNo);

			if (copyToContract != null && copyToContract == 'T') {

				//Create a new contract detail record
				//
				var contractDetailRecord = nlapiCreateRecord('customrecord_bbs_con_detail', { recordmode : 'dynamic'
				});

				//Get the required values from the s/o item line
				//
				var soItemDescription = soRecord.getLineItemValue('item', 'description', lineNo);
				var soItemPoVendor = soRecord.getLineItemValue('item', 'povendor', lineNo);
				var soItemPoRate = soRecord.getLineItemValue('item', 'porate', lineNo);
				var soItemItem = soRecord.getLineItemValue('item', 'item', lineNo);
				var soItemRate = soRecord.getLineItemValue('item', 'rate', lineNo);

				//Update the required fields on the contract detail
				//
				contractDetailRecord.setFieldValue('custrecord_bbs_con_detail_contract', contractId);
				contractDetailRecord.setFieldValue('custrecord_bbs_con_detail_description', soItemDescription);
				contractDetailRecord.setFieldValue('custrecord_bbs_con_detail_annual_value', soItemRate);
				contractDetailRecord.setFieldValue('custrecord_bbs_con_detail_supplier', soItemPoVendor);
				contractDetailRecord.setFieldValue('custrecord_bbs_con_detail_supplier_cost', soItemPoRate);
				contractDetailRecord.setFieldValue('custrecord_bbs_con_detail_sales_order', soId);
				contractDetailRecord.setFieldValue('custrecord_bbs_con_detail_item_type', soItemItem);

				//Save the contract detail record
				//
				nlapiSubmitRecord(contractDetailRecord, false, true);

				//Update the s/o item line to turn of the update flag
				//
				soRecord.setLineItemValue('item', 'custcol_bbs_copy_to_contract', lineNo, 'F');

				hasSoBeenUpdated = true;
			}
		}

		if (hasSoBeenUpdated) {

			nlapiSubmitRecord(soRecord, false, true);
		}
	}
}