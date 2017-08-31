/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       17 Dec 2015     cedric
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Operation types: create, edit, delete, xedit, approve,
 *            cancel, reject (SO, ER, Time Bill, PO & RMA only) pack, ship (IF
 *            only) dropship, specialorder, orderitems (PO only) paybills
 *            (vendor payments)
 * @returns {Void}
 */
function userEventAfterSubmit(type) {
	var detailRecord = null;

	if (type == 'delete') {
		detailRecord = nlapiGetOldRecord();
	}
	else {
		detailRecord = nlapiGetNewRecord();
	}

	var contractHeaderId = detailRecord.getFieldValue('custrecord_bbs_con_detail_contract');

	// Get the id of the contract header
	// var contractHeaderId =
	// nlapiGetFieldValue('custrecord_bbs_con_detail_contract');

	// Load up the search on the contract item records
	var search = nlapiLoadSearch('customrecord_bbs_con_detail', 'customsearch_bbs_contract_detail');

	// Add a filter to return only records for the current contract
	var detailFilter = new nlobjSearchFilter('custrecord_bbs_con_detail_contract', null, 'is', contractHeaderId);
	search.addFilter(detailFilter);

	// Run the serach & get the results back
	var searchResultSet = search.runSearch();
	var searchResults = searchResultSet.getResults(0, 100);

	// Init totals
	var totalSale = Number(0);
	var totalCost = Number(0);
	var totalMargin = Number(0);
	var annualSale = Number(0);
	var annualCost = Number(0);

	// See if we have any item lines to show
	if (searchResults.length > 0) {
		// Loop through all of the items
		for (var int = 0; int < searchResults.length; int++) {
			// Get the field values
			var annual = Number(searchResults[int].getValue("custrecord_bbs_con_detail_annual_value"));
			var prorata = Number(searchResults[int].getValue("custrecord_bbs_con_detail_prorata_value"));
			var cost = Number(searchResults[int].getValue("custrecord_bbs_con_detail_supplier_cost"));
			var proRataCost = Number(searchResults[int].getValue('custrecord_bbs_con_detail_supp_prorata'));

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
	}

	// Calculate the margin value
	totalMargin = totalSale - totalCost;

	// Load the contract header record
	var contractHeaderRecord = nlapiLoadRecord('customrecord_bbs_con_header', contractHeaderId);

	// Set the field values on the contract header
	contractHeaderRecord.setFieldValue('custrecord_bbs_con_total_sales_value', totalSale);
	contractHeaderRecord.setFieldValue('custrecord_bbs_con_total_cost', totalCost);
	contractHeaderRecord.setFieldValue('custrecord_bbs_con_total_margin', totalMargin);
	contractHeaderRecord.setFieldValue('custrecord_bbs_con_annualised_value', annualSale);
	contractHeaderRecord.setFieldValue('custrecord_bbs_con_annualised_cost', annualCost);

	// Save the contract header
	nlapiSubmitRecord(contractHeaderRecord, false, true);

}
