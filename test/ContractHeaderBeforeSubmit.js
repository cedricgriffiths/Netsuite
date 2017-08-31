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
 *            type Operation types: create, edit, delete, xedit approve, reject,
 *            cancel (SO, ER, Time Bill, PO & RMA only) pack, ship (IF)
 *            markcomplete (Call, Task) reassign (Case) editforecast (Opp,
 *            Estimate)
 * @returns {Void}
 */
function userEventBeforeSubmit(type) {
	// Get the number of rows in the contract detail..
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

function userEventBeforeLoad(type, form, request) {
	// Add a print button to the form in view mode
	if (type == 'view') {
		// Add the global client script to the form manually as this is where
		// the 'on-click' function for the button is held
		form.setScript('customscript_bbs_contract_header_global');

		// Add the actual print button & call the print function in the global
		// script
		var customButton1 = form.addButton('custpage_printbutton', 'Print Contract', 'GlbPrintContract');
		//var customButton2 = form.addButton('custpage_salesorderbutton', 'Raise Sales Order', 'GlbCreateSalesOrder');
		var customButton3 = form.addButton('custpage_opportunitybutton', 'Raise Opportunity', 'GlbCreateOpportunity');
		var customButton4 = form.addButton('custpage_opportunityrefreshbutton', 'Refresh Opportunity', 'GlbRefreshOpportunity');
	}
}
