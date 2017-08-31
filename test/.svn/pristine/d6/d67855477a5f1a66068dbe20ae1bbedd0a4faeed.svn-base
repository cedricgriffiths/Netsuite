/**
 * Module Description
 * 
 * Version Date Author Remarks 1.00 18 Mar 2016 cedric
 * 
 */

function LibDeleteContract() {
	// Get basic details
	//
	var headerRecordType = nlapiGetRecordType();
	var headerRecordId = nlapiGetRecordId();

	// Search contract detail records for ones having this header
	//
	var detailSearchFilters = new Array();
	detailSearchFilters[0] = new nlobjSearchFilter('custrecord_bbs_con_detail_contract', null, 'is', headerRecordId);

	// Create the search
	//
	var detailSearch = nlapiCreateSearch('customrecord_bbs_con_detail', detailSearchFilters);

	// Run the search
	//
	var detailSearchResults = detailSearch.runSearch();

	// Get the result set from the search
	//
	var detailSearchResultSet = detailSearchResults.getResults(0, 100);

	// See if there are any results to process
	//
	if (detailSearchResultSet != null) {
		for (var detailResultCount = 0; detailResultCount < detailSearchResultSet.length; detailResultCount++) {
			// Get the contract detail id
			//
			var contractDetailId = detailSearchResultSet[detailResultCount].getId();

			// Now search for any contract detail items
			//
			var detailItemSearchFilters = new Array();
			detailItemSearchFilters[0] = new nlobjSearchFilter('custrecord_bbs_con_detail_item_detail_id', null, 'is', contractDetailId);

			// Create the search
			//
			var detailItemSearch = nlapiCreateSearch('customrecord_bbs_con_detail_items', detailItemSearchFilters);

			// Run the search
			//
			var detailItemSearchResults = detailItemSearch.runSearch();

			// Get the result set from the search
			//
			var detailItemSearchResultSet = detailItemSearchResults.getResults(0, 100);

			// See if we have any results to process
			//
			if (detailItemSearchResultSet != null) {
				for (var detailItemResultCount = 0; detailItemResultCount < detailItemSearchResultSet.length; detailItemResultCount++) {
					// Get the contract detail item id
					//
					var contractDetailItemId = detailItemSearchResultSet[detailItemResultCount].getId();

					// Delete the contract detail item
					nlapiDeleteRecord('customrecord_bbs_con_detail_items', contractDetailItemId);
				}
			}

			// Now delete the contract detail record
			//
			nlapiDeleteRecord('customrecord_bbs_con_detail', contractDetailId);

		}
	}

	// Now delete the contract header
	//
	var headerRecord = nlapiLoadRecord(headerRecordType, headerRecordId);
	var refNumber = headerRecord.getFieldValue('name');

	nlapiDeleteRecord(headerRecordType, headerRecordId);

	alert('Contract ' + refNumber + ' has been deleted');
}

function LibCreateSalesOrder() {

	// Get basic details
	//
	var headerRecordType = nlapiGetRecordType();
	var headerRecordId = nlapiGetRecordId();
	var currentDeatilRecordType = 'recmachcustrecord_bbs_con_detail_contract';

	// Get details from contract header
	//
	var contractHeaderRecord = nlapiLoadRecord(headerRecordType, headerRecordId);

	var contractCustomer = contractHeaderRecord.getFieldValue('custrecord_bbs_con_customer');
	var contractStartDate = contractHeaderRecord.getFieldValue('custrecord_bbs_con_start_date');

	// See if we have any contract detail records that do not yet have a sales
	// order associated with them
	// If there are none, then there are no items that we could put on a new
	// sales order anyway
	//

	// Find out how many contract item lines the header has
	var detailCount = contractHeaderRecord.getLineItemCount(currentDeatilRecordType);
	var unallocatedCount = 0;

	for (var lineNo = 1; lineNo <= detailCount; lineNo++) {

		// Get values from the detail record
		//
		var salesOrder = contractHeaderRecord.getLineItemValue(currentDeatilRecordType, 'custrecord_bbs_con_detail_sales_order', lineNo);

		if (salesOrder == null || salesOrder == '') {
			unallocatedCount++;
		}
	}

	// If there are no records that are unassigned to a sales order
	// then there's nothing to do
	//
	if (unallocatedCount == 0) {
		alert('There are no contract lines unassigned to a sales order. Sales order not created');
	}
	else {

		// Create sales order
		//
		var salesOrderRecord = nlapiCreateRecord('salesorder', { recordmode : 'dynamic'
		});

		// Fill in sales order header info
		//
		var todaysDate = new Date();
		var todaysDateString = nlapiDateToString(todaysDate, 'date');

		salesOrderRecord.setFieldValue('entity', contractCustomer);
		salesOrderRecord.setFieldValue('trandate', todaysDateString);
		salesOrderRecord.setFieldValue('saleseffectivedate', todaysDateString);
		salesOrderRecord.setFieldValue('shipdate', todaysDateString);
		salesOrderRecord.setFieldValue('custbody_bbs_contract_header', headerRecordId);

		// Create the sales order lines
		//

		// Loop round all of the detail lines
		//
		for (var lineNo = 1; lineNo <= detailCount; lineNo++) {

			// See if the current line has a sales order on it already
			// We want to only process lines with no s/o allocated
			//
			var salesOrderPresent = contractHeaderRecord.getLineItemValue(currentDeatilRecordType, 'custrecord_bbs_con_detail_sales_order', lineNo);

			if (salesOrderPresent == null || salesOrderPresent == '') {
				// Get values from the detail record
				//
				var itemType = contractHeaderRecord.getLineItemValue(currentDeatilRecordType, 'custrecord_bbs_con_detail_item_type', lineNo);
				var itemDescription = contractHeaderRecord.getLineItemValue(currentDeatilRecordType, 'custrecord_bbs_con_detail_description', lineNo);
				var itemAnnualValue = contractHeaderRecord.getLineItemValue(currentDeatilRecordType, 'custrecord_bbs_con_detail_annual_value', lineNo);
				var itemProRataValue = contractHeaderRecord.getLineItemValue(currentDeatilRecordType, 'custrecord_bbs_con_detail_prorata_value', lineNo);
				var itemSupplier = contractHeaderRecord.getLineItemValue(currentDeatilRecordType, 'custrecord_bbs_con_detail_supplier', lineNo);
				var itemSupplierCost = contractHeaderRecord.getLineItemValue(currentDeatilRecordType, 'custrecord_bbs_con_detail_supplier_cost', lineNo);
				var itemStartDate = contractHeaderRecord.getLineItemValue(currentDeatilRecordType, 'custrecord_bbs_con_detail_start_date', lineNo);
				var itemEndDate = contractHeaderRecord.getLineItemValue(currentDeatilRecordType, 'custrecord_bbs_con_detail_end_date', lineNo);

				itemDescription = itemDescription.concat(' (', itemStartDate, ' - ', itemEndDate, ')');

				// Create a new sales order line
				//
				salesOrderRecord.selectNewLineItem('item');

				// Set its values
				//
				salesOrderRecord.setCurrentLineItemValue('item', 'item', itemType);
				salesOrderRecord.setCurrentLineItemValue('item', 'description', itemDescription);
				salesOrderRecord.setCurrentLineItemValue('item', 'povendor', itemSupplier);
				salesOrderRecord.setCurrentLineItemValue('item', 'costestimatetype', 'CUSTOM');
				salesOrderRecord.setCurrentLineItemValue('item', 'revrecstartdate', itemStartDate);
				salesOrderRecord.setCurrentLineItemValue('item', 'revrecenddate', itemEndDate);

				salesOrderRecord.setCurrentLineItemValue('item', 'createpo', 'DropShip');

				if (itemSupplierCost != null && itemSupplierCost != "") {
					salesOrderRecord.setCurrentLineItemValue('item', 'costestimate', itemSupplierCost);
					salesOrderRecord.setCurrentLineItemValue('item', 'porate', itemSupplierCost);
				}
				else {
					salesOrderRecord.setCurrentLineItemValue('item', 'costestimate', '0');
					salesOrderRecord.setCurrentLineItemValue('item', 'porate', '0');
				}

				if (itemProRataValue != null && itemProRataValue != '') {
					salesOrderRecord.setCurrentLineItemValue('item', 'rate', itemProRataValue);
				}
				else {
					salesOrderRecord.setCurrentLineItemValue('item', 'rate', itemAnnualValue);
				}

				salesOrderRecord.commitLineItem('item');
			}
		}

		// Set order status to 'Pending Approval'
		//
		salesOrderRecord.setFieldValue('orderstatus', 'A');

		// Submit Sales Order
		//
		try {
			var salesOrderId = nlapiSubmitRecord(salesOrderRecord, false, false);
		}
		catch (err) {
			alert('Error - ' + err.message);
		}

		// Now we have created the sales order, update the lines with the sales
		// order id & update the header so say we have created a sales order
		//
		//contractHeaderRecord.setFieldValue('custrecord_bbs_con_billing_status', 3);

		for (var lineNo = 1; lineNo <= detailCount; lineNo++) {
			// Select the current detail record
			//
			//contractHeaderRecord.selectLineItem(currentDeatilRecordType, lineNo);

			var salesOrderPresent = contractHeaderRecord.getLineItemValue(currentDeatilRecordType, 'custrecord_bbs_con_detail_sales_order', lineNo);

			if (salesOrderPresent == null || salesOrderPresent == '') {
				// Update the sales order id on the line
				//
				contractHeaderRecord.setLineItemValue(currentDeatilRecordType, 'custrecord_bbs_con_detail_sales_order', lineNo, salesOrderId);

				// Save the line details
				//
				//contractHeaderRecord.commitLineItem(currentDeatilRecordType, true);
			}
		}

		// Submit the header
		//
		nlapiSubmitRecord(contractHeaderRecord, false, true);

		// Let the user know we have created a sales order
		//
		salesOrderRecord = nlapiLoadRecord('salesorder', salesOrderId);

		var salesOrderNumber = salesOrderRecord.getFieldValue('tranid');

		alert('Sales order ' + salesOrderNumber + ' Created');
	}

}

function LibCreateOpportunity() {

	// Get basic details
	//
	var headerRecordType = nlapiGetRecordType();
	var headerRecordId = nlapiGetRecordId();
	var currentDeatilRecordType = 'recmachcustrecord_bbs_con_detail_contract';

	// Get details from contract header
	//
	var contractHeaderRecord = nlapiLoadRecord(headerRecordType, headerRecordId);
	var contractMemo = contractHeaderRecord.getFieldValue('custrecord_bbs_contract_memo');
	var contractCustomer = contractHeaderRecord.getFieldValue('custrecord_bbs_con_customer');
	var contractStartDate = contractHeaderRecord.getFieldValue('custrecord_bbs_con_start_date');
	var contractName = contractHeaderRecord.getFieldValue('name');

	// See if we have any contract detail records that do not yet have an opportunity
	// associated with them
	// If there are none, then there are no items that we could put on a new
	// opportunity anyway
	//

	// Find out how many contract item lines the header has
	var detailCount = contractHeaderRecord.getLineItemCount(currentDeatilRecordType);
	var allocatedCount = 0;

	for (var lineNo = 1; lineNo <= detailCount; lineNo++) {

		// Get values from the detail record
		//
		var opportunity = contractHeaderRecord.getLineItemValue(currentDeatilRecordType, 'custrecord_bbs_con_detail_opportunity', lineNo);

		if (opportunity != null && opportunity != '') {
			allocatedCount++;
		}
	}

	// If there are no records that are unassigned to a sales order
	// then there's nothing to do
	//
	if (allocatedCount > 0) {
		alert('Contract has already been allocated to an opportunity - please use the "Refresh Opportunity" option');
	}
	else {

		// Create opportunity
		//
		var opportunityRecord = nlapiCreateRecord('opportunity', { recordmode : 'dynamic'
		});

		// Fill in opportunity header info
		//
		var todaysDate = new Date();
		var todaysDateString = nlapiDateToString(todaysDate, 'date');

		opportunityRecord.setFieldValue('entity', contractCustomer);
		opportunityRecord.setFieldValue('trandate', todaysDateString);
		opportunityRecord.setFieldValue('expectedclosedate', contractStartDate);
		opportunityRecord.setFieldValue('custbody_bbs_contract_header', headerRecordId);
		opportunityRecord.setFieldValue('title', contractName);
		opportunityRecord.setFieldValue('memo', contractMemo);

		// Create the opportunity lines
		//

		// Loop round all of the detail lines
		//
		for (var lineNo = 1; lineNo <= detailCount; lineNo++) {

			// See if the current line has a sales order on it already
			// We want to only process lines with no s/o allocated
			//
			var salesOrderPresent = contractHeaderRecord.getLineItemValue(currentDeatilRecordType, 'custrecord_bbs_con_detail_opportunity', lineNo);

			if (salesOrderPresent == null || salesOrderPresent == '') {

				var itemType = contractHeaderRecord.getLineItemValue(currentDeatilRecordType, 'custrecord_bbs_con_detail_item_type', lineNo);

				var itemRecord = null;
				var itemRecordType = '';

				try {

					itemRecord = nlapiLoadRecord('noninventoryitem', itemType);
					itemRecordType = 'noninventoryitem';
				}
				catch (err) {

				}

				// Get values from the detail record
				//
				var itemType = contractHeaderRecord.getLineItemValue(currentDeatilRecordType, 'custrecord_bbs_con_detail_item_type', lineNo);
				var itemDescription = contractHeaderRecord.getLineItemValue(currentDeatilRecordType, 'custrecord_bbs_con_detail_description', lineNo);
				var itemAnnualValue = contractHeaderRecord.getLineItemValue(currentDeatilRecordType, 'custrecord_bbs_con_detail_annual_value', lineNo);
				var itemProRataValue = contractHeaderRecord.getLineItemValue(currentDeatilRecordType, 'custrecord_bbs_con_detail_prorata_value', lineNo);
				var itemSupplier = contractHeaderRecord.getLineItemValue(currentDeatilRecordType, 'custrecord_bbs_con_detail_supplier', lineNo);
				var itemSupplierCost = contractHeaderRecord.getLineItemValue(currentDeatilRecordType, 'custrecord_bbs_con_detail_supplier_cost', lineNo);

				var itemSupplierProRata = contractHeaderRecord.getLineItemValue(currentDeatilRecordType, 'custrecord_bbs_con_detail_supp_prorata', lineNo);

				var itemStartDate = contractHeaderRecord.getLineItemValue(currentDeatilRecordType, 'custrecord_bbs_con_detail_start_date', lineNo);
				var itemEndDate = contractHeaderRecord.getLineItemValue(currentDeatilRecordType, 'custrecord_bbs_con_detail_end_date', lineNo);

				if (itemDescription == null){
					itemDescription = '';
				}
				
				itemDescription = itemDescription.concat(' (', itemStartDate, ' - ', itemEndDate, ')');

				// Create a new opportunity line
				//
				opportunityRecord.selectNewLineItem('item');

				// Set its values
				//
				opportunityRecord.setCurrentLineItemValue('item', 'item', itemType);
				opportunityRecord.setCurrentLineItemValue('item', 'description', itemDescription);

				if (itemRecordType == 'noninventoryitem') {

					opportunityRecord.setCurrentLineItemValue('item', 'costestimatetype', 'CUSTOM');
				}

				opportunityRecord.setCurrentLineItemValue('item', 'custcol_bbs_contract_povendor', itemSupplier);
				opportunityRecord.setCurrentLineItemValue('item', 'custcol_bbs_contract_revrecstartdate', itemStartDate);
				opportunityRecord.setCurrentLineItemValue('item', 'custcol_bbs_contract_revrecenddate', itemEndDate);
				opportunityRecord.setCurrentLineItemValue('item', 'custcol_bbs_contract_createpo', 'DropShip');

				if (itemSupplierProRata != null && itemSupplierProRata != '') {

					opportunityRecord.setCurrentLineItemValue('item', 'costestimate', itemSupplierProRata);
					opportunityRecord.setCurrentLineItemValue('item', 'custcol_bbs_contract_porate', itemSupplierProRata);
				}
				else {

					if (itemSupplierCost != null && itemSupplierCost != "") {
						opportunityRecord.setCurrentLineItemValue('item', 'costestimate', itemSupplierCost);
						opportunityRecord.setCurrentLineItemValue('item', 'custcol_bbs_contract_porate', itemSupplierCost);

					}
					else {
						opportunityRecord.setCurrentLineItemValue('item', 'costestimate', '0');
						opportunityRecord.setCurrentLineItemValue('item', 'custcol_bbs_contract_porate', '0');
					}
				}

				if (itemProRataValue != null && itemProRataValue != '') {
					opportunityRecord.setCurrentLineItemValue('item', 'rate', itemProRataValue);
				}
				else {
					opportunityRecord.setCurrentLineItemValue('item', 'rate', itemAnnualValue);
				}

				opportunityRecord.commitLineItem('item');
			}
		}

		// Set opportunity status to 'Proposal'
		//
		opportunityRecord.setFieldValue('entitystatus', '10');

		// Submit Opportunity
		//
		try {
			var opportunityId = nlapiSubmitRecord(opportunityRecord, false, false);
		}
		catch (err) {
			alert('Error - ' + err.message);
		}

		// Now we have created the opportunity, update the lines with the 
		// opportunity id 
		//
		//contractHeaderRecord.setFieldValue('custrecord_bbs_con_billing_status', 3);

		for (var lineNo = 1; lineNo <= detailCount; lineNo++) {
			// Select the current detail record
			//
			//contractHeaderRecord.selectLineItem(currentDeatilRecordType, lineNo);

			var opportunityPresent = contractHeaderRecord.getLineItemValue(currentDeatilRecordType, 'custrecord_bbs_con_detail_opportunity', lineNo);

			if (opportunityPresent == null || opportunityPresent == '') {
				// Update the sales order id on the line
				//
				contractHeaderRecord.setLineItemValue(currentDeatilRecordType, 'custrecord_bbs_con_detail_opportunity', lineNo, opportunityId);

				// Save the line details
				//
				//contractHeaderRecord.commitLineItem(currentDeatilRecordType, true);
			}
		}

		// Submit the header
		//
		nlapiSubmitRecord(contractHeaderRecord, false, true);

		// Let the user know we have created a sales order
		//
		opportunityRecord = nlapiLoadRecord('opportunity', opportunityId);

		var salesOrderNumber = opportunityRecord.getFieldValue('tranid');

		alert('Opprtunity ' + salesOrderNumber + ' Created');
	}

}

function LibPrintContract() {

	// Get the relative url of the suitelet that prints the contract
	var url = nlapiResolveURL('SUITELET', 'customscript_bbs_contract_print_script', 'customdeploy_bbs_contract_print_deploy');

	// Get the id of the contract header we are on
	var headerRecordId = nlapiGetRecordId();

	// Add the header id as a query param to the url
	url += '&contractid=' + headerRecordId;

	// Open the contract print in a new window
	window.open(url, '_blank', 'Contract Print', 'toolbar=no, scrollbars=no, resizable=no');
}

function LibRefreshOpportunity() {

	// Get basic details
	//
	var headerRecordType = nlapiGetRecordType();
	var headerRecordId = nlapiGetRecordId();
	var currentDeatilRecordType = 'recmachcustrecord_bbs_con_detail_contract';

	// Get details from contract header
	//
	var contractHeaderRecord = nlapiLoadRecord(headerRecordType, headerRecordId);
	var contractMemo = contractHeaderRecord.getFieldValue('custrecord_bbs_contract_memo');
	var contractCustomer = contractHeaderRecord.getFieldValue('custrecord_bbs_con_customer');
	var contractStartDate = contractHeaderRecord.getFieldValue('custrecord_bbs_con_start_date');
	var contractName = contractHeaderRecord.getFieldValue('name');
	var opportunityId = null;

	// See if we have any contract detail records that have an opportunity
	// associated with them

	// Find out how many contract item lines the header has
	var detailCount = contractHeaderRecord.getLineItemCount(currentDeatilRecordType);
	var allocatedCount = 0;
	var previousOpportunityId = '';
	var opportunityCount = 0;
	var oppIsClosed = false;

	for (var lineNo = 1; lineNo <= detailCount; lineNo++) {

		// Get values from the detail record
		//
		var opportunity = contractHeaderRecord.getLineItemValue(currentDeatilRecordType, 'custrecord_bbs_con_detail_opportunity', lineNo);

		if (opportunity != null && opportunity != '') {

			allocatedCount++;
			opportunityId = opportunity;

			//If we have an opportunity, then find out its status
			//
			var oppRecord = nlapiLoadRecord('opportunity', opportunity);
			var oppStatus = oppRecord.getFieldValue('entitystatus');

			if (oppStatus == '13' || oppStatus == '14') {

				oppIsClosed = true;
			}

			if (previousOpportunityId != opportunity) {

				previousOpportunityId = opportunity;
				opportunityCount++;

			}
		}
	}

	// If there are no records that are assigned to an opportunity
	// then there's nothing to do
	//
	if (allocatedCount == 0) {
		alert('There are no contract lines assigned to an opportunity. Opportunity cannot be refreshed');
	}
	else {

		if (opportunityCount > 1) {
			alert('There is more than one opportunity assigned to this contract. Opportunity cannot be refreshed');
		}
		else {

			if (oppIsClosed) {

				alert('The opportunity is at a status of "closed". Opportunity cannot be refreshed');
			}
			else {

				// Load the opportunity
				//
				var opportunityRecord = nlapiLoadRecord('opportunity', opportunityId);

				//Remove all of the opportunity lines
				//
				var oppLineCount = opportunityRecord.getLineItemCount('item');

				for (var oppLineNo = oppLineCount; oppLineNo > 0; oppLineNo--) {

					opportunityRecord.removeLineItem('item', oppLineNo);

				}

				// Fill in opportunity header info
				//
				var todaysDate = new Date();
				var todaysDateString = nlapiDateToString(todaysDate, 'date');

				opportunityRecord.setFieldValue('entity', contractCustomer);
				opportunityRecord.setFieldValue('trandate', todaysDateString);
				opportunityRecord.setFieldValue('expectedclosedate', contractStartDate);
				opportunityRecord.setFieldValue('custbody_bbs_contract_header', headerRecordId);
				opportunityRecord.setFieldValue('title', contractName);
				opportunityRecord.setFieldValue('memo', contractMemo);

				// Create the opportunity lines
				//

				// Loop round all of the detail lines
				//
				for (var lineNo = 1; lineNo <= detailCount; lineNo++) {

					var itemType = contractHeaderRecord.getLineItemValue(currentDeatilRecordType, 'custrecord_bbs_con_detail_item_type', lineNo);

					var itemRecord = null;
					var itemRecordType = '';

					try {

						itemRecord = nlapiLoadRecord('noninventoryitem', itemType);
						itemRecordType = 'noninventoryitem';
					}
					catch (err) {

					}

					var itemDescription = contractHeaderRecord.getLineItemValue(currentDeatilRecordType, 'custrecord_bbs_con_detail_description', lineNo);
					var itemAnnualValue = contractHeaderRecord.getLineItemValue(currentDeatilRecordType, 'custrecord_bbs_con_detail_annual_value', lineNo);
					var itemProRataValue = contractHeaderRecord.getLineItemValue(currentDeatilRecordType, 'custrecord_bbs_con_detail_prorata_value', lineNo);
					var itemSupplier = contractHeaderRecord.getLineItemValue(currentDeatilRecordType, 'custrecord_bbs_con_detail_supplier', lineNo);
					var itemSupplierCost = contractHeaderRecord.getLineItemValue(currentDeatilRecordType, 'custrecord_bbs_con_detail_supplier_cost', lineNo);

					var itemSupplierProRata = contractHeaderRecord.getLineItemValue(currentDeatilRecordType, 'custrecord_bbs_con_detail_supp_prorata', lineNo);

					var itemStartDate = contractHeaderRecord.getLineItemValue(currentDeatilRecordType, 'custrecord_bbs_con_detail_start_date', lineNo);
					var itemEndDate = contractHeaderRecord.getLineItemValue(currentDeatilRecordType, 'custrecord_bbs_con_detail_end_date', lineNo);

					if (itemDescription == null){
						itemDescription = '';
					}
					
					itemDescription = itemDescription.concat(' (', itemStartDate, ' - ', itemEndDate, ')');

					// Create a new opportunity line
					//
					opportunityRecord.selectNewLineItem('item');

					// Set its values
					//
					opportunityRecord.setCurrentLineItemValue('item', 'item', itemType);
					opportunityRecord.setCurrentLineItemValue('item', 'description', itemDescription);

					if (itemRecordType == 'noninventoryitem') {

						opportunityRecord.setCurrentLineItemValue('item', 'costestimatetype', 'CUSTOM');
					}

					opportunityRecord.setCurrentLineItemValue('item', 'custcol_bbs_contract_povendor', itemSupplier);
					opportunityRecord.setCurrentLineItemValue('item', 'custcol_bbs_contract_revrecstartdate', itemStartDate);
					opportunityRecord.setCurrentLineItemValue('item', 'custcol_bbs_contract_revrecenddate', itemEndDate);
					opportunityRecord.setCurrentLineItemValue('item', 'custcol_bbs_contract_createpo', 'DropShip');

					if (itemSupplierProRata != null && itemSupplierProRata != '') {

						opportunityRecord.setCurrentLineItemValue('item', 'costestimate', itemSupplierProRata);
						opportunityRecord.setCurrentLineItemValue('item', 'custcol_bbs_contract_porate', itemSupplierProRata);
					}
					else {

						if (itemSupplierCost != null && itemSupplierCost != "") {
							opportunityRecord.setCurrentLineItemValue('item', 'costestimate', itemSupplierCost);
							opportunityRecord.setCurrentLineItemValue('item', 'custcol_bbs_contract_porate', itemSupplierCost);

						}
						else {
							opportunityRecord.setCurrentLineItemValue('item', 'costestimate', '0');
							opportunityRecord.setCurrentLineItemValue('item', 'custcol_bbs_contract_porate', '0');
						}
					}

					if (itemProRataValue != null && itemProRataValue != '') {
						opportunityRecord.setCurrentLineItemValue('item', 'rate', itemProRataValue);
					}
					else {
						opportunityRecord.setCurrentLineItemValue('item', 'rate', itemAnnualValue);
					}

					opportunityRecord.commitLineItem('item');

				}

				// Set opportunity status to 'Proposal'
				//
				//opportunityRecord.setFieldValue('entitystatus', '10');

				// Submit Opportunity
				//
				try {
					var opportunityId = nlapiSubmitRecord(opportunityRecord, false, false);
				}
				catch (err) {
					alert('Error - ' + err.message);
				}

				// Now we have created the opportunity, update the lines with the 
				// opportunity id 
				//

				for (var lineNo = 1; lineNo <= detailCount; lineNo++) {

					// Select the current detail record
					//
					var opportunityPresent = contractHeaderRecord.getLineItemValue(currentDeatilRecordType, 'custrecord_bbs_con_detail_opportunity', lineNo);

					// Update the opportunity id on the line
					//
					contractHeaderRecord.setLineItemValue(currentDeatilRecordType, 'custrecord_bbs_con_detail_opportunity', lineNo, opportunityId);

				}

				// Submit the header
				//
				nlapiSubmitRecord(contractHeaderRecord, false, true);

				// Let the user know we have created a sales order
				//
				opportunityRecord = nlapiLoadRecord('opportunity', opportunityId);

				var salesOrderNumber = opportunityRecord.getFieldValue('tranid');

				alert('Opprtunity ' + salesOrderNumber + ' Refreshed');
			}
		}
	}
}