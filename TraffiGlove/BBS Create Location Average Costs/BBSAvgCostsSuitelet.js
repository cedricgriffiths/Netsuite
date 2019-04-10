/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       03 Mar 2017     cedricgriffiths
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function avgcostSuitelet(request, response)
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
		var stageParam = Number(request.getParameter('stage'));
		
		stageParam = (stageParam == 0 ? 1 : stageParam);
		
		//=====================================================================
		// Form creation
		//=====================================================================
		//
		var form = nlapiCreateForm('Create Location Average Costs', false);
		form.setTitle('Create Location Average Costs');
		form.setScript('customscript_bbs_avgcost_client');
		
		
		//=====================================================================
		// Hidden fields to pass data to the POST section
		//=====================================================================
		//
		
		//Stage
		//
		var stageField = form.addField('custpage_stage', 'integer', 'stage');
		stageField.setDisplayType('hidden');
		stageField.setDefaultValue(stageParam);
		
		//Subsidiary
		//
		var subsidField = form.addField('custpage_subsidiary', 'text', 'subsidiary');
		subsidField.setDisplayType('hidden');
		
		//Location
		//
		var locField = form.addField('custpage_location', 'text', 'location');
		locField.setDisplayType('hidden');
		
		//Account
		//
		var accField = form.addField('custpage_account', 'text', 'account');
		accField.setDisplayType('hidden');
		

		//=====================================================================
		// Form layout based on stage number
		//=====================================================================
		//
		switch(stageParam)
		{
			case 1:
				
				//=====================================================================
				// Field groups creation
				//=====================================================================
				//
				
				//Add a field group for header info
				//
				var fieldGroupHeader = form.addFieldGroup('custpage_grp_header', 'Selection');
				fieldGroupHeader.setSingleColumn(true);
				

				//=====================================================================
				// Fields creation
				//=====================================================================
				//

				//Add a select field to select the subsidiary
				//
				var subsidiaryField = form.addField('custpage_subsidiary_select', 'select', 'Subsidiary', 'subsidiary', 'custpage_grp_header');
				subsidiaryField.setMandatory(true);
				
				//Add a text field to select the location
				//
				var beginsWithField = form.addField('custpage_location_select', 'select', 'Location', null, 'custpage_grp_header');
				beginsWithField.setMandatory(true);
				
				//Add a text field to select the account
				//
				var accountField = form.addField('custpage_account_select', 'select', 'Account', 'account', 'custpage_grp_header');
				accountField.setMandatory(true);
				
				form.addSubmitButton('Update Average Costs');
				
				break;
				
			case 2:
				//=====================================================================
				// Stage 2 - Display message about email to be received
				//=====================================================================
				//
			
				//Get the context & the users email address
				//
				var context = nlapiGetContext();
				var emailAddress = context.getEmail();
				
				//Add a message field 
				//
				var messageField = form.addField('custpage_message', 'textarea', 'Message', null, null);
				messageField.setDisplaySize(120, 4);
				messageField.setDisplayType('readonly');
				messageField.setDefaultValue('An email will be sent to ' + emailAddress + ' when the pricelist creation process has completed.');
			
				
				break;
		}
		
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
		
		
		//Get the stage 
		//
		var stage = Number(request.getParameter('custpage_stage'));
		
		switch(stage)
		{
			case 1:
					
				//Retrieve the parameters from the form fields
				//
				var subsidiaryParam = request.getParameter('custpage_subsidiary');
				var locationParam = request.getParameter('custpage_location');
				var accountParam = request.getParameter('custpage_account');
				
				var parameterObject = {};
				parameterObject['subsidiary'] = subsidiaryParam;
				parameterObject['location'] = locationParam;
				parameterObject['account'] = accountParam;
				
				var scheduleParams = {custscript_bbs_avgcost_params: JSON.stringify(parameterObject)};
				nlapiScheduleScript('customscript_bbs_avgcost_scheduled', null, scheduleParams);

				//Call the next stage
				//
				var params = new Array();
				params['stage'] = stage + 1;
				
				var context = nlapiGetContext();
				response.sendRedirect('SUITELET',context.getScriptId(), context.getDeploymentId(), null, params);
				
				break;
		}
	}
}

//=====================================================================
// Functions
//=====================================================================
//

