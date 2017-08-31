/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       17 Aug 2016     cedric
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function contractUplift(request, response) {

	var paramStartDate = request.getParameter('startdate');
	var paramEndDate = request.getParameter('enddate');

	if (request.getMethod() == 'GET') {
		// Create a form
		//
		var form = nlapiCreateForm('Select Contract Uplift');

		// Add a submit button
		//
		form.addSubmitButton('Submit');

		// Create the uplift field
		//
		var upliftfield = form.addField('custpage_uplift', 'percent', 'Percentage Uplift');

		upliftfield.setDefaultValue('0.0%');

		//Create the start and end date fields
		//
		var startDateField = form.addField('custpage_startdate', 'date', 'Contract Start Date');
		var endDateField = form.addField('custpage_enddate', 'date', 'Contract End Date');

		startDateField.setLayoutType('outside', 'startrow');
		endDateField.setLayoutType('outside', 'startrow');

		if (paramStartDate != null && paramStartDate != '') {

			startDateField.setDefaultValue(paramStartDate);
		}

		if (paramEndDate != null && paramEndDate != '') {

			endDateField.setDefaultValue(paramEndDate);
		}

		//Write the response
		//
		response.writePage(form);
	}
	else {

		// Get the uplift
		//
		var uplift = request.getParameter('custpage_uplift');
		var start = request.getParameter('custpage_startdate');
		var end = request.getParameter('custpage_enddate');

		// Trigger the callback function and close pop-up window
		//
		response.write('<html><body><script>window.opener.contractUpliftCallback("' + uplift + '","' + start + '","' + end + '"); window.close();</script></body></html>');
	}

}
