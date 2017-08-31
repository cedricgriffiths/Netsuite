/**
 * Module Description
 * 
 * Version Date Author Remarks 1.00 29 Mar 2016 cedric
 * 
 */

function SalesOrderInit()
{
	// Find out where the sales order was created from
	//
	var createdFrom = nlapiGetFieldValue('createdfrom');

	// If we were created from something, find out what
	//
	if (createdFrom != null && createdFrom != '')
	{
		var originalRecord = null;

		try
		{
			// Were we from a quote (estimate)
			//
			originalRecord = nlapiLoadRecord('estimate', createdFrom);

		}
		catch (err)
		{
			try
			{
				// Were we from an opportunity?
				//
				originalRecord = nlapiLoadRecord('opportunity', createdFrom);
			}
			catch (err)
			{
				originalRecord = null;
			}
		}

		// Have we found where we have come from?
		//
		if (originalRecord != null)
		{
			// Get the record type that we have come from
			//
			var originalType = originalRecord.getRecordType();

			// How many lines are on the sales order
			//
			var lineCount = nlapiGetLineItemCount('item');

			// Loop through all the lines
			//
			for (var lineNo = 1; lineNo <= lineCount; lineNo++)
			{
				// Set the current line
				//
				nlapiSelectLineItem('item', lineNo);

				// Get the supplier from the original record
				//
				var originalSupplier = originalRecord.getLineItemValue('item', 'custcol_bbs_opp_supplier', lineNo);

				// Get the supplier from the sales order
				//
				var salesOrderSupplier = nlapiGetLineItemValue('item', 'povendor', lineNo)

				// Compare the two suppliers
				//
				if (originalSupplier != salesOrderSupplier)
				{
					nlapiSetCurrentLineItemValue('item', 'povendor', originalSupplier, false, true);
				}

				// Get the supplier unit cost from the original record
				//
				var originalSupplierUnitCost = Number(originalRecord.getLineItemValue('item', 'custcol_bbs_opp_linecost', lineNo));

				// Update the po rate with the new supplier cost
				//
				if (originalSupplierUnitCost != NaN && originalSupplierUnitCost != 0)
				{
					nlapiSetCurrentLineItemValue('item', 'porate', originalSupplierUnitCost, false, true);
				}

				// Get the sales margin from the original record
				//
				var originalSalesMargin = Number(originalRecord.getLineItemValue('item', 'custcol_bbs_opp_margin', lineNo));

				// Update the sales margin from the original record
				//
				if (originalSalesMargin != NaN && originalSalesMargin != 0)
				{
					nlapiSetCurrentLineItemValue('item', 'custcol_bbs_opp_margin', originalSalesMargin, false, true);
				}

				// Commit the current line
				//
				nlapiCommitLineItem('item');
			}
		}
	}
}

function SalesFieldChanged(type, name, linenum)
{
	ProcessFieldChanges(type, name, linenum, 'porate');
}

function QuoteFieldChanged(type, name, linenum)
{
	ProcessFieldChanges(type, name, linenum, 'custcol_bbs_opp_linecost');
}

function OpportunityFieldChanged(type, name, linenum)
{
	ProcessFieldChanges(type, name, linenum, 'custcol_bbs_opp_linecost');
}

function ProcessFieldChanges(type, name, linenum, unitCostField)
{
	// Make sure we are working with items
	//
	if (type == 'item')
	{
		// Get the item from the line
		//
		var itemItem = nlapiGetCurrentLineItemValue(type, "item");

		// We only want to continue if we have a line item entered
		//
		if (itemItem != null && itemItem != '')
		{
			// Get the value of the supplier unit cost
			//
			var supplierUnitCost = Number(nlapiGetCurrentLineItemValue(type, unitCostField));
			var salesMargin = Number(nlapiGetCurrentLineItemValue(type, 'custcol_bbs_opp_margin'));

			// Get the quantity on the SO line
			var linequantity = Number(nlapiGetCurrentLineItemValue(type, 'quantity'));

			// See if we are changing the unit cost or the margin
			//
			if (name == unitCostField || name == 'custcol_bbs_opp_margin')
			{
				// Update the cost estimate type to be "CUSTOM"
				nlapiSetCurrentLineItemValue(type, 'costestimatetype', 'CUSTOM', true, true);

				// Update the cost estimate to be the supplier unit cost *
				// quantity
				var newCostEstimate = linequantity * supplierUnitCost;

				// Update the costestimate based on the new supplier unit cost
				//
				nlapiSetCurrentLineItemValue(type, 'costestimate', newCostEstimate, true, true);

				// Calculate the selling price based on the required margin
				//
				if (salesMargin != 0)
				{
					var calSalesMargin = salesMargin / 100.0;

					var costEstimate = Number(nlapiGetCurrentLineItemValue(type, 'costestimate')) / linequantity;
					var newRate = Number((costEstimate / (1 - calSalesMargin)).toFixed(2));

					// Update the price level to be "CUSTOM"
					nlapiSetCurrentLineItemValue(type, 'price', -1, true, true);

					// Write the new rate back to the line item
					nlapiSetCurrentLineItemValue(type, 'rate', newRate, true, true);
				}

			}
		}
	}
}
