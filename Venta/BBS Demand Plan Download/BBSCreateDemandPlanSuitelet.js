/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       24 Apr 2018     cedricgriffiths
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function createDemandPlanSuitelet(request, response)
{
	
	//=====================================================================
	// Get request - so return a form for the user to process
	//=====================================================================
	//
	
	if (request.getMethod() == 'GET') 
	{
		//=====================================================================
		// Parameters passed to the suitelet
		//=====================================================================
		//
		var context = nlapiGetContext();
		var usersSubsidiary = context.getSubsidiary();
		
		
		//=====================================================================
		// Form creation
		//=====================================================================
		//
		var form = nlapiCreateForm('Update Item Demand Plans', false);
		form.setTitle('Update Item Demand Plans');

		form.addFieldGroup('custpage_group_info', 'Information', null);
		form.addFieldGroup('custpage_group_params', 'Parameters', null);
		
		//Get the context & the users email address
		//
		var context = nlapiGetContext();
		var emailAddress = context.getEmail();
				
		//Add a message field 
		//
		var messageField = form.addField('custpage_message', 'textarea', 'Message', null, 'custpage_group_info');
		messageField.setDisplaySize(120, 4);
		messageField.setDisplayType('readonly');
		messageField.setDefaultValue('An email will be sent to ' + emailAddress + ' when the update to item demand plans has completed.');
		
		//Add parameters
		//
		var today = new Date();
		var todayString = nlapiDateToString(today);
		
		var startDateField = form.addField('custpage_start_date', 'date', 'Start Of Demand Plan (Day Of Month Will Be Ignored)', null, 'custpage_group_params');
		startDateField.setDefaultValue(todayString);
		
		var oppsUpliftField = form.addField('custpage_opps_uplift', 'float', '% Of Opportunities To Be Calculated', null, 'custpage_group_params');
		oppsUpliftField.setDefaultValue('100.00');
		oppsUpliftField.setLayoutType('normal', 'startcol');
		
		var salesUpliftField = form.addField('custpage_sales_uplift', 'float', '% Of Sales History To Be Calculated', null, 'custpage_group_params');
		salesUpliftField.setDefaultValue('100.00');
		
		
		//Add a submit button
		//
		form.addSubmitButton('Update Item Demand Plans')
		
		//Write the response
		//
		response.writePage(form);
	}
	else
	{
		//=====================================================================
		// Post request - so process the returned form
		//=====================================================================
		//
		var parameters = {};
		var oppsPercent = request.getParameter('custpage_opps_uplift');
		var salesPercent = request.getParameter('custpage_sales_uplift');
		var startDate = request.getParameter('custpage_start_date');
		
		parameters['custscript_bbs_opportunity_percent'] = oppsPercent;
		parameters['custscript_bbs_sales_percent'] = salesPercent;
		parameters['custscript_bbs_start_date'] = startDate;
		
		nlapiScheduleScript('customscript_bbs_demand_plan_scheduled', null, parameters);
		
		response.sendRedirect('TASKLINK', 'CARD_-29' , null, null, null);
	}
}

//=====================================================================
// Functions
//=====================================================================
//

