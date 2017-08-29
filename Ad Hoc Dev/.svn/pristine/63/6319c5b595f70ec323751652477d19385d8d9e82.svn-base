/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       19 Feb 2016     cedric
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
 * @returns {Void}
 */
function CostRecalc(type)
{
	// Get the number of rows in the sales order
	//
	var itemCount = nlapiGetLineItemCount('item');

	// Init total
	//
	var totalCost = parseFloat(0);

	// Loop through the lines in the sales order
	//
	for (var lineNo = 1; lineNo <= itemCount; lineNo++)
	{
		// Get value of the estimated cost
		//
		var cost = Number(nlapiGetLineItemValue('item', 'costestimate', lineNo));

		// Sum up the cost
		//
		if (cost != NaN)
		{
			totalCost += cost;
		}
	}

	// Set the field value on the sales order
	//
	nlapiSetFieldValue('custbody_bbs_total_estimated_cost', totalCost, false, true);

}