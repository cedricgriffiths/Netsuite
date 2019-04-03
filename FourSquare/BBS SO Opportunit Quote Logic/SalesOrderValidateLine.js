/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       17 Nov 2015     cedric
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Sublist internal id
 * @returns {Boolean} True to save line item, false to abort save
 */
function SalesOrderValidateLine(type)
{
	// See if we are working with a drop shipment item
	//
	var dropShip = nlapiGetCurrentLineItemValue(type, "createpo");

	if (dropShip == "DropShip")
	{
		// Get the quantity on the SO line
		var linequantity = Number(nlapiGetCurrentLineItemValue(type, "quantity"));

		// Get the po rate (This is the value of the manually entered cost)
		var poRate = Number(nlapiGetCurrentLineItemValue(type, "porate"));

		// Get the current value of the unit cost estimate (costestimate /
		// quantity)
		var currentCostEstimate = Number(nlapiGetCurrentLineItemValue(type, "costestimate")) / linequantity;

		// If the po rate is different from the unit cost estimate then recalc
		if (currentCostEstimate != poRate)
		{
			// Get the product id from the current line
			var productId = nlapiGetCurrentLineItemValue(type, 'item');

			// Make sure we have a product id to use
			if (productId != null)
			{
				// Initialise the product record to null
				var productRecord = null;

				// Read the product based on its id
				try
				{
					// Try to read the product as an inventory item
					productRecord = nlapiLoadRecord('inventoryitem', productId);
				}
				catch (err)
				{
					try
					{
						// Try to read the product as a non inventory item
						productRecord = nlapiLoadRecord('noninventoryitem', productId);
					}
					catch (err)
					{
						try
						{
							// Try to read the product as an assembly item
							productRecord = nlapiLoadRecord('assemblyitem', productId);
						}
						catch (err)
						{
							try
							{
								// Try to read the product as a kit item
								productRecord = nlapiLoadRecord('kititem', productId);
							}
							catch (err)
							{
								try
								{
									// Try to read the product as an item group
									// item
									productRecord = nlapiLoadRecord('itemgroup', productId);
								}
								catch (err)
								{
									// Didn't find the product rcord
									productRecord = null;
								}
							}
						}
					}
				}

				// See if we actually have a valid product record
				if (productRecord != null)
				{
					// Get the markup percentage from product
					var costUplift = productRecord.getFieldValue('custitem_bbs_4sqr_item_cost_uplift');

					// Check to see if we have anything in the markup field
					if (costUplift != null && costUplift != "")
					{
						// Remove the % sign & convert to a number
						var markupPercentage = Number(costUplift.replace("%", ""));

						// Only proceed if the markup > 0
						if (markupPercentage != 0)
						{
							// Apply the markup to the entered cost price
							var newRate = poRate + ((poRate / 100.00) * markupPercentage);

							// Update the cost estimate type to be "CUSTOM"
							nlapiSetCurrentLineItemValue(type, "costestimatetype", "CUSTOM", true, true);

							// Update the cost estimate to be the po cost *
							// quantity
							var newCostEstimate = linequantity * poRate;

							nlapiSetCurrentLineItemValue(type, "costestimate", newCostEstimate, true, true);

							// Update the price level to be "CUSTOM"
							nlapiSetCurrentLineItemValue(type, "price", -1, true, true);

							// Write the new rate back to the line item
							nlapiSetCurrentLineItemValue(type, "rate", newRate, true, true);
						}
					}
				}
			}
		}
	}

	// Return true to indicate the line validation was ok
	return true;
}
