/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       02 Feb 2016     cedric
 *
 */

/**
 * @returns {Void} Any or no return value
 */

// Custom workflow action to update a back-to-back PO from the SO
//
function UpdatePoFromSo()
{
	// Get the current PO record
	var poRecord = nlapiGetNewRecord();

	// Get the id of the PO to use later
	var poId = poRecord.getId()

	// Get the created from field
	var poCreatedFrom = poRecord.getFieldValue("createdfrom");

	// Has this PO been created from something else?
	if (poCreatedFrom != null && poCreatedFrom != "")
	{
		var soRecord = null;

		// See if the "Created From" was a sales order
		try
		{
			var soRecord = nlapiLoadRecord("salesorder", poCreatedFrom);
		}
		catch (err)
		{
			// Failed to read the SO, so null the soRecord object
			soRecord = null;
		}

		// If we have got the sales order, we can proceed
		if (soRecord != null)
		{
			// Get count of PO & SO lines
			var poItemCount = poRecord.getLineItemCount("item");
			var soItemCount = soRecord.getLineItemCount("item");

			// Start at SO line 1
			var soLine = 1;

			// Loop through each PO line trying to find a matching SO line
			for (var poLine = 1; poLine <= poItemCount; poLine++)
			{
				// Select the relevant line item record in the PO
				poRecord.selectLineItem("item", poLine);

				// Get the required data from the PO line to match the SO
				// against
				var poItem = poRecord.getCurrentLineItemValue("item", "item");
				var poQuantity = poRecord.getCurrentLineItemValue("item", "quantity");

				// Set the matched flag to false
				var matched = false;

				// Read the SO line until we find a match or we run out of SO
				// lines
				//
				while (matched == false && soLine <= soItemCount)
				{
					// First see if the current SO line has a link to the PO
					var soCreatedPo = soRecord.getLineItemValue("item", "createdpo", soLine);

					// If it was linked, then proceed further
					if (soCreatedPo != null && soCreatedPo != "" && soCreatedPo == poId)
					{
						// This line is linked to the PO, now see if it matches
						// the PO line
						var soItem = soRecord.getLineItemValue("item", "item", soLine);
						var soQuantity = soRecord.getLineItemValue("item", "quantity", soLine);

						// Does it match ?
						if (soItem == poItem && soQuantity == poQuantity)
						{
							// We have found a match so now get the relevant
							// data from the SO and update the PO line
							var soCostestimate = soRecord.getLineItemValue("item", "costestimate", soLine);

							// Set the rate on the PO line item
							poRecord.setCurrentLineItemValue("item", "rate", soCostestimate);

							// Commit the PO line item
							poRecord.commitLineItem("item", false);

							// Say that we have matched a record, so we can exit
							// the loop and move on to the next PO line
							var matched = "True";
						}
					}

					// Increment the SO line counter
					soLine++;
				}

				// If we have run off the end of the SO lines, we need to break
				// out of the loop of PO lines
				if (soLine > soItemCount)
				{
					break;
				}
			}
		}
	}
}
