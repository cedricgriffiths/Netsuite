/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       04 Jan 2016     cedric
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
 * @param {String}
 *            name Field internal id
 * @param {Number}
 *            linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function clientFieldChanged(type, name, linenum)
{
	// Check to see if we are in the context of the contract drop down box
	if (name == 'custpage_f0')
	{
		// Get the field value
		var contract = nlapiGetFieldValue('custpage_f0');

		// See if we have actually picked a contract
		if (contract != null && contract != '')
		{
			// Make the submit button visible
			setFieldAndLabelVisibility("tbl_submitter", true);
		}
		else
		{
			// Hide the submit button
			setFieldAndLabelVisibility("tbl_submitter", false);
		}
	}
}

function clientPageInit(type)
{
	// Hide the submit button
	setFieldAndLabelVisibility("tbl_submitter", false);
}
