/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       18 Feb 2016     cedric
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Void}
 */
function clientRecalc(type) {

	// Verify that we are working with expenses
	//
	if (type == "expense") {

		// Get the relevant values from the current line
		//
		var lineQuantity = nlapiGetCurrentLineItemValue(type, "quantity");
		var lineRate = nlapiGetCurrentLineItemValue(type, "rate");
		var lineMemo = nlapiGetCurrentLineItemValue(type, "memo");
		var lineBillable = nlapiGetCurrentLineItemValue(type, "isbillable");

		// Only update the memo field if we have a rate & the line is billable
		//
		if (lineRate != "" && lineRate != null & lineBillable == "T") {

			// Have we already got the quantity/rate descriptive on the memo?
			//
			var locationOfBracket = lineMemo.indexOf("[", 0);

			// Build the descriptive test
			//
			var descriptive = " [" + lineQuantity + " @ £" + lineRate + "]";

			// No descriptive on line, so add one to the end
			//
			if (locationOfBracket == -1) {
				lineMemo += descriptive;

				// Save the memo field back to the line
				//
				nlapiSetCurrentLineItemValue(type, "memo", lineMemo, true, true);

				//Commit the current line
				//
				//nlapiCommitLineItem(type);

			}
			else {
				// Replace the existing descriptive text
				//
				//lineMemo = lineMemo.substring(0, (locationOfBracket - 1)) + descriptive;
			}

		}

		//Get the category and the has been split flag
		//
		var categoryId = nlapiGetCurrentLineItemValue(type, 'category');
		var hasBeenSplit = nlapiGetCurrentLineItemValue(type, 'custcol_bbs_expense_has_been_split');

		//Only continue if we have a category & the line has not been split
		//
		if (categoryId != null && categoryId != '' && hasBeenSplit != 'T') {

			//Read the expense category record
			//
			var categoryRecord = nlapiLoadRecord('expensecategory', categoryId);

			//Get the default vat field
			//
			var defaultVat = categoryRecord.getFieldValue('custrecord_bbs_expense_category_vatcode');

			//Get the current value of the vat field
			//
			var currentVatCode = nlapiGetCurrentLineItemValue(type, 'taxcode');

			if (defaultVat != null && defaultVat != '' && (currentVatCode == null || currentVatCode == '')) {

				//Set the taxcode based on the default from the expense category
				//
				nlapiSetCurrentLineItemValue(type, 'taxcode', defaultVat, true, true);

			}

			//Get the secondary category to use
			//
			var splitCat = categoryRecord.getFieldValue('custrecord_bbs_split_expense_category');

			//Only continue if we have a secondary category to use
			//
			if (splitCat != null && splitCat != '') {

				//Read the secondary category record
				//
				var splitCatRecord = nlapiLoadRecord('expensecategory', splitCat);

				//Get the vat code from the secondary category
				//
				var defaultVat = splitCatRecord.getFieldValue('custrecord_bbs_expense_category_vatcode');

				//Set the current line to show it has been split
				//
				nlapiSetCurrentLineItemValue(type, 'custcol_bbs_expense_has_been_split', 'T', false, true);

				//Get the current values of quantity & memo fields
				//
				var currentQuantity = nlapiGetCurrentLineItemValue(type, 'quantity');
				var currentMemo = nlapiGetCurrentLineItemValue(type, 'memo');
				var currentCustomer = nlapiGetCurrentLineItemValue(type, 'customer');
				var currentReimburse = nlapiGetCurrentLineItemValue(type, 'isnonreimbursable');
				var currentReceipt = nlapiGetCurrentLineItemValue(type, 'receipt');
				var currentDepartment = nlapiGetCurrentLineItemValue(type, 'department');
				var currentSegment = nlapiGetCurrentLineItemValue(type, 'class');
				var currentBillable = nlapiGetCurrentLineItemValue(type, 'isbillable');

				//Commit the current line to update the change to the split indicator
				//
				nlapiCommitLineItem(type);

				//Create a new line & fill in the defaults
				//
				nlapiSelectNewLineItem(type);

				nlapiSetCurrentLineItemValue(type, 'category', splitCat, true, true);
				nlapiSetCurrentLineItemValue(type, 'quantity', currentQuantity, true, true);
				nlapiSetCurrentLineItemValue(type, 'taxcode', defaultVat, true, true);

				nlapiSetCurrentLineItemValue(type, 'memo', currentMemo, true, true);
				nlapiSetCurrentLineItemValue(type, 'custcol_bbs_expense_has_been_split', 'T', true, true);

				nlapiSetCurrentLineItemValue(type, 'customer', currentCustomer, true, true);

				nlapiSetCurrentLineItemValue(type, 'isnonreimbursable', currentReimburse, true, true);
				nlapiSetCurrentLineItemValue(type, 'receipt', currentReceipt, true, true);
				nlapiSetCurrentLineItemValue(type, 'department', currentDepartment, true, true);
				nlapiSetCurrentLineItemValue(type, 'class', currentSegment, true, true);
				nlapiSetCurrentLineItemValue(type, 'isbillable', currentBillable, true, true);

				//Commit the new line
				//
				nlapiCommitLineItem(type);
			}
			else {

				nlapiSetCurrentLineItemValue(type, 'custcol_bbs_expense_has_been_split', 'T', true, true);

				nlapiCommitLineItem(type);

			}
		}
	}
}
