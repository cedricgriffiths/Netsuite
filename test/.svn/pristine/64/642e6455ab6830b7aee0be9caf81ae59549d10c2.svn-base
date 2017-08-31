/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       19 Apr 2016     cedric
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function SalesOrderFieldChanged(type, name, linenum) {
	if (name == 'porate') {

		// Get the quantity on the SO line
		var linequantity = Number(nlapiGetCurrentLineItemValue(type, "quantity"));

		// Get the po rate (This is the value of the manually entered cost)
		var poRate = Number(nlapiGetCurrentLineItemValue(type, "porate"));

		// Get the current value of the unit cost estimate (costestimate /
		// quantity)
		var currentCostEstimate = Number(nlapiGetCurrentLineItemValue(type, "costestimate")) / linequantity;

		// If the po rate is different from the unit cost estimate then recalc
		if (currentCostEstimate != poRate) {

			// Update the cost estimate type to be "CUSTOM"
			nlapiSetCurrentLineItemValue(type, "costestimatetype", "CUSTOM", true, true);

			// Update the cost estimate to be the po cost * quantity
			var newCostEstimate = linequantity * poRate;

			nlapiSetCurrentLineItemValue(type, "costestimate", newCostEstimate, true, true);

		}
	}

}

function SalesOrderInit(type) {

	if (type == 'copy') {
		// Find out where the sales order was created from
		//
		var createdFrom = nlapiGetFieldValue('createdfrom');

		// If we were created from something, find out what
		//
		if (createdFrom != null && createdFrom != '') {

			var opportunityId = nlapiGetFieldValue('opportunity');

			if (opportunityId != null && opportunityId != '') {

				var originalRecord = nlapiLoadRecord('opportunity', opportunityId);

				if (originalRecord != null && originalRecord != '') {

					// How many lines are on the opportunity
					//
					var lineCount = nlapiGetLineItemCount('item');

					// Loop through all the lines
					//
					for (var lineNo = 1; lineNo <= lineCount; lineNo++) {

						// Set the current line
						//
						nlapiSelectLineItem('item', lineNo);

						//Get the original details from the opportunity
						//
						var itemSupplier = originalRecord.getLineItemValue('item', 'custcol_bbs_contract_povendor', lineNo);
						var itemStartDate = originalRecord.getLineItemValue('item', 'custcol_bbs_contract_revrecstartdate', lineNo);
						var itemEndDate = originalRecord.getLineItemValue('item', 'custcol_bbs_contract_revrecenddate', lineNo);
						var createPo = originalRecord.getLineItemValue('item', 'custcol_bbs_contract_createpo', lineNo);
						var itemSupplierCost = originalRecord.getLineItemValue('item', 'custcol_bbs_contract_porate', lineNo);

						//Update the current SO line
						//
						if (itemSupplier != null && itemSupplier != '') {
							nlapiSetCurrentLineItemValue('item', 'povendor', itemSupplier, true, true);
						}

						if (itemStartDate != null && itemStartDate != '') {
							nlapiSetCurrentLineItemValue('item', 'revrecstartdate', itemStartDate, true, true);
						}

						if (itemEndDate != null && itemEndDate != '') {
							nlapiSetCurrentLineItemValue('item', 'revrecenddate', itemEndDate, true, true);
						}

						if (createPo != null && createPo != '') {
							nlapiSetCurrentLineItemValue('item', 'createpo', createPo, true, true);
						}

						if (itemSupplierCost != null && itemSupplierCost != '') {
							nlapiSetCurrentLineItemValue('item', 'porate', itemSupplierCost, true, true);
						}

						// Commit the current line
						//
						nlapiCommitLineItem('item');

					}
				}
			}
		}
	}
}
