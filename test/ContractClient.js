/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       16 Nov 2015     cedric
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Access mode: create, copy, edit
 * @returns {Void}
 */
function clientPageInit(type) {
	// Preset the status  on a new record
	//
	if (type == "create") {

		// Set status to "Pending"
		//
		nlapiSetFieldValue('custrecord_bbs_con_status', "2", false, true);
	}
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Sublist internal id
 * @param {String}
 *            name Field internal id
 * @param {Number}
 *            linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function clientFieldChanged(type, name, linenum) {
	// Only work on the start date field
	//
	if (name == 'custrecord_bbs_con_start_date') {

		// Get the current start date
		//
		var startDate = nlapiGetFieldValue('custrecord_bbs_con_start_date');

		if (startDate != '') {
			// Convert date string to a date datatype
			//
			var startDateDate = nlapiStringToDate(startDate);

			// Get month nunber & add 1 to it to get the lookup value for the
			// start month
			//
			var startMonth = startDateDate.getMonth() + 1;

			// Set the month lookup
			//
			nlapiSetFieldValue('custrecord_bbs_con_start_month', startMonth, false, true);

			// Get the end date current value value
			//
			var endDate = nlapiGetFieldValue('custrecord_bbs_con_end_date');

			// If the end date is empty the set it from the start date
			//
			if (endDate == '') {
				// Add 12 months minus 1 day to get the end date
				//
				var newEndDate = nlapiAddDays(nlapiAddMonths(startDateDate, 12), -1);

				// Set the end date value & trigger the field changed event
				//
				nlapiSetFieldValue('custrecord_bbs_con_end_date', nlapiDateToString(newEndDate), true, true);
			}
		}
	}

	if (name == 'custrecord_bbs_con_end_date') {
		// Get the current end date
		//
		var endDate = nlapiGetFieldValue('custrecord_bbs_con_end_date');

		// Convert date string to a date datatype
		//
		var endDateDate = nlapiStringToDate(endDate);

		// Get month nunber & add 1 to it to get the lookup value for the start
		// month
		//
		var endMonth = endDateDate.getMonth() + 1;

		// Set the month lookup
		//
		nlapiSetFieldValue('custrecord_bbs_con_end_month', endMonth, false, true);
	}
}

function resetStartEndDates() {

	// Get the number of rows in the contract detail
	var itemCount = nlapiGetLineItemCount('recmachcustrecord_bbs_con_detail_contract');

	var headerStartDate = nlapiGetFieldValue('custrecord_bbs_con_start_date');
	var headerEndDate = nlapiGetFieldValue('custrecord_bbs_con_end_date');

	// Loop through the lines in the contract details
	for (var lineNo = 1; lineNo <= itemCount; lineNo++) {

		nlapiSetLineItemValue('recmachcustrecord_bbs_con_detail_contract', 'custrecord_bbs_con_detail_start_date', lineNo, headerStartDate);
		nlapiSetLineItemValue('recmachcustrecord_bbs_con_detail_contract', 'custrecord_bbs_con_detail_end_date', lineNo, headerEndDate);
	}
}

function userEventRecalc(type) {
	// Get the number of rows in the contract detail
	var itemCount = nlapiGetLineItemCount('recmachcustrecord_bbs_con_detail_contract');

	// Init totals
	var totalSale = Number(0);
	var totalCost = Number(0);
	var totalMargin = Number(0);
	var annualSale = Number(0);
	var annualCost = Number(0);

	// Loop through the lines in the contract details
	for (var lineNo = 1; lineNo <= itemCount; lineNo++) {
		// Get values for annual, prorata & cost
		var annual = Number(nlapiGetLineItemValue('recmachcustrecord_bbs_con_detail_contract', 'custrecord_bbs_con_detail_annual_value', lineNo));
		var prorata = Number(nlapiGetLineItemValue('recmachcustrecord_bbs_con_detail_contract', 'custrecord_bbs_con_detail_prorata_value', lineNo));
		var cost = Number(nlapiGetLineItemValue('recmachcustrecord_bbs_con_detail_contract', 'custrecord_bbs_con_detail_supplier_cost', lineNo));
		var proRataCost = Number(nlapiGetLineItemValue('recmachcustrecord_bbs_con_detail_contract', 'custrecord_bbs_con_detail_supp_prorata', lineNo));

		annualSale += annual;
		annualCost += cost;

		// Summ up the values
		if (proRataCost != NaN && proRataCost != 0) {

			totalCost += proRataCost;
		}
		else {
			if (cost != NaN && cost != 0) {

				totalCost += cost;
			}
		}

		if (prorata != NaN && prorata != 0) {
			totalSale += prorata;
		}
		else {
			if (annual != NaN && annual != 0) {
				totalSale += annual;
			}
		}
	}

	// Calculate the margin value
	totalMargin = totalSale - totalCost;

	// Set the field values on the contract header
	nlapiSetFieldValue('custrecord_bbs_con_total_sales_value', totalSale, false, true);
	nlapiSetFieldValue('custrecord_bbs_con_total_cost', totalCost, false, true);
	nlapiSetFieldValue('custrecord_bbs_con_total_margin', totalMargin, false, true);
	nlapiSetFieldValue('custrecord_bbs_con_annualised_value', annualSale, false, true);
	nlapiSetFieldValue('custrecord_bbs_con_annualised_cost', annualCost, false, true);
}

function CloneContract() {

	//Call the uplift suitelet
	//
	var url = nlapiResolveURL('SUITELET', 'customscript_bbs_clone_contract_script', 'customdeploy_bbs_clone_contract_script');

	// Update the start & end dates on the new detail
	var newStartDate = nlapiAddDays(nlapiStringToDate(nlapiGetFieldValue('custrecord_bbs_con_end_date')), 1);
	var newEndDate = nlapiAddDays(nlapiAddMonths(newStartDate, 12), -1);

	// Add the start and end date as query param to the url
	url += '&startdate=' + nlapiDateToString(newStartDate) + '&enddate=' + nlapiDateToString(newEndDate);

	// Open the suitelet in a new window
	//
	window.open(url, '_blank', 'toolbar=no, scrollbars=no, resizable=no, width=900, height=400');
}

function applyUplift(originalValue, percentageUplift) {

	var returnValue = Number(0);

	returnValue = originalValue * ((percentageUplift / 100.0) + 1.0);

	if (returnValue.NaN) {

		returnValue = originalValue;
	}

	return returnValue;
}

function contractUpliftCallback(paramUplift, paramStartDate, paramEndDate) {

	//Variable definitions
	//
	var newReference = '';
	var headerRecordType = nlapiGetRecordType();
	var headerRecordId = nlapiGetRecordId();
	var currentDeatilRecordType = 'recmachcustrecord_bbs_con_detail_contract';
	var currentDetailItemRecordType = 'recmachcustrecord_bbs_con_detail_item_detail_id';
	var newDeatilRecordType = 'customrecord_bbs_con_detail';
	var newDetailItemRecordType = 'customrecord_bbs_con_detail_items';
	var newHeaderId = null;
	var uplift = Number(0);

	//Get the uplift percentage from the suitelet
	//
	if (paramUplift != null && paramUplift != '') {

		uplift = Number(paramUplift.replace('%', ''));
	}

	if (uplift.NaN) {

		uplift = Number(0);
	}

	// Get the current reference
	var contractReference = nlapiGetFieldValue('name');

	// Only process records where there is something in the reference
	if (contractReference.length > 0) {
		// See if the reference contains a full stop
		var dotPosition = contractReference.indexOf('.', 0);

		// If there is no full stop, then the new ref will be the old ref + '.1'
		if (dotPosition == -1) {
			newReference = contractReference.concat('.1');
		}
		else {
			// If there is a full stop, then find what is after it

			// Get the suffix
			var suffix = contractReference.slice(dotPosition + 1, contractReference.length);

			// Is the suffix a number?
			if (isNaN(suffix)) {
				// The suffix is not a number
				alert('Cannot clone contract as reference has a non numeric suffix');

				return;
			}
			else {
				// The suffix is a number

				// Increment the suffix number
				suffix++;

				// Build up the new reference
				newReference = contractReference.slice(0, dotPosition + 1) + suffix.toString();
			}
		}

		//Search to see if the new reference already exists
		//
		var cols = new Array();
		cols[0] = new nlobjSearchColumn('name');

		//Filter the search 
		//
		var filters = new Array();
		filters[0] = new nlobjSearchFilter('name', null, 'is', newReference);

		//Create, run & get the results for the search
		//
		var contractSearches = nlapiCreateSearch(headerRecordType, filters, cols);
		var contractResults = contractSearches.runSearch();
		var contractResultset = contractResults.getResults(0, 100);

		//Did we get any results?
		//
		if (contractResultset != null && contractResultset.length > 0) {

			alert('This contract has already been cloned to ' + newReference + ' - Clone aborted!');
		}
		else {

			//Search to see if any contract details do not have an item on them
			//
			var cols = new Array();
			cols[0] = new nlobjSearchColumn('custrecord_bbs_con_detail_description');

			//Filter the search 
			//
			var filters = new Array();
			filters[0] = new nlobjSearchFilter('custrecord_bbs_con_detail_contract', null, 'is', headerRecordId);
			filters[1] = new nlobjSearchFilter('custrecord_bbs_con_detail_item_type', null, 'anyof', '@NONE@');

			//Create, run & get the results for the search
			//
			var contractDetailSearches = nlapiCreateSearch(newDeatilRecordType, filters, cols);
			var contractDetailResults = contractDetailSearches.runSearch();
			var contractDetailResultset = contractDetailResults.getResults(0, 100);

			//Did we get any results?
			//
			if (contractDetailResultset != null && contractDetailResultset.length > 0) {

				alert('Some contract lines have missing items - Clone aborted!');
			}
			else {

				// Copy the header record
				var newHeader = nlapiCopyRecord(headerRecordType, headerRecordId);

				// Set the new reference
				//
				newHeader.setFieldValue('name', newReference);

				// Calculate the start & end dates based on the current dates
				//
				var newStartDate = nlapiAddDays(nlapiStringToDate(nlapiGetFieldValue('custrecord_bbs_con_end_date')), 1);
				var newEndDate = nlapiAddDays(nlapiAddMonths(newStartDate, 12), -1);

				// See if we have been passed in new start & end dates from the suitelet, if so use them
				//
				if (paramStartDate != null && typeof paramStartDate != 'undefined' && paramStartDate != '' && paramEndDate != null && typeof paramEndDate != 'undefined' && paramEndDate != '') {

					newStartDate = nlapiStringToDate(paramStartDate);
					newEndDate = nlapiStringToDate(paramEndDate);
				}

				newHeader.setFieldValue('custrecord_bbs_con_start_date', nlapiDateToString(newStartDate));
				newHeader.setFieldValue('custrecord_bbs_con_end_date', nlapiDateToString(newEndDate));

				newHeader.setFieldValue('custrecord_bbs_con_start_month', newStartDate.getMonth() + 1);
				newHeader.setFieldValue('custrecord_bbs_con_end_month', newEndDate.getMonth() + 1);

				// Set status to "Cloned"
				//newHeader.setFieldValue('custrecord_bbs_con_status', "2", false, true);
				newHeader.setFieldValue('custrecord_bbs_con_status', "5", false, true);

				// Commit the header
				newHeaderId = nlapiSubmitRecord(newHeader, false, false);

				// Now copy the old contract details to the new header
				//

				// Get the current header record
				var currentHeaderRecord = nlapiLoadRecord(headerRecordType, headerRecordId);

				// Find out how many contract item lines the header has
				var detailCount = currentHeaderRecord.getLineItemCount(currentDeatilRecordType);

				// Loop round all of the detail lines
				for (var lineNo = 1; lineNo <= detailCount; lineNo++) {
					// Get the record id of the detail line
					var currentDetailId = nlapiGetLineItemValue(currentDeatilRecordType, 'id', lineNo);

					// Create a copy of the detail line
					var newDetailRecord = nlapiCopyRecord(newDeatilRecordType, currentDetailId);

					// Set the contract id to be the new contract id
					newDetailRecord.setFieldValue('custrecord_bbs_con_detail_contract', newHeaderId);

					//Apply any uplift to the contract line
					//
					newDetailRecord.setFieldValue('custrecord_bbs_con_detail_annual_value', applyUplift(Number(newDetailRecord.getFieldValue('custrecord_bbs_con_detail_annual_value')), uplift));

					//Clear out any unwanted data from the cloned contract detail record
					//
					newDetailRecord.setFieldValue('custrecord_bbs_con_detail_prorata_value', '');
					newDetailRecord.setFieldValue('custrecord_bbs_con_detail_supp_prorata', '');
					newDetailRecord.setFieldValue('custrecord_bbs_con_detail_opportunity', '');
					newDetailRecord.setFieldValue('custrecord_bbs_con_detail_sales_order', '');
					newDetailRecord.setFieldValue('custrecord_bbs_con_detail_po', '');
					newDetailRecord.setFieldValue('custrecord_bbs_con_detail_inv', '');
					newDetailRecord.setFieldValue('custrecord_bbs_con_detail_sales_inv', '');
					newDetailRecord.setFieldValue('custrecord_bbs_con_detail_licence_rec', 'F');

					// Commit the new detail record
					var newDetailId = nlapiSubmitRecord(newDetailRecord, false, false);

					// Now see if this detail line has any detail items associated with
					// it
					//

					// Load the current detail line
					var currentDetailRecord = nlapiLoadRecord(newDeatilRecordType, currentDetailId);

					// Find out how many contract item detail lines the header has
					var detailItemCount = currentDetailRecord.getLineItemCount(currentDetailItemRecordType);

					// Loop round all of the detail lines
					for (var ItemLineNo = 1; ItemLineNo <= detailItemCount; ItemLineNo++) {
						// Get the record id of the detail item line
						currentDetailRecord.selectLineItem(currentDetailItemRecordType, ItemLineNo);
						var currentDetailItemId = currentDetailRecord.getCurrentLineItemValue(currentDetailItemRecordType, 'id');
						// var currentDetailItemId =
						// nlapiGetLineItemValue(currentDetailItemRecordType, 'id',
						// ItemLineNo);

						// Create a copy of the detail line
						var newDetailItemRecord = nlapiCopyRecord(newDetailItemRecordType, currentDetailItemId);

						// Set the detail id to be the new detail id
						newDetailItemRecord.setFieldValue('custrecord_bbs_con_detail_item_detail_id', newDetailId);

						// Commit the new detail item record
						nlapiSubmitRecord(newDetailItemRecord, false, false);
					}
				}

				// Notify the user the copy has completed
				alert('Contract has been cloned to ' + newReference);
			}
		}
	}
}

function PrintContract() {
	LibPrintContract();

}

function DeleteContract() {
	LibDeleteContract();

}

function CreateSalesOrder() {
	LibCreateSalesOrder();
}

function CreateOpportunity() {
	LibCreateOpportunity();
}

function RefreshOpportunity() {
	LibRefreshOpportunity();
}
