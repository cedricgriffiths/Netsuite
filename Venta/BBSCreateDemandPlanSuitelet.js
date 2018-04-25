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

			
		//Get the context & the users email address
		//
		var context = nlapiGetContext();
		var emailAddress = context.getEmail();
				
		//Add a message field 
		//
		var messageField = form.addField('custpage_message', 'textarea', 'Message', null, null);
		messageField.setDisplaySize(120, 4);
		messageField.setDisplayType('readonly');
		messageField.setDefaultValue('An email will be sent to ' + emailAddress + ' when the update to item demand plans has completed.');
			
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

		nlapiScheduleScript('customscript_bbs_demand_plan_scheduled', null, null);
		
		response.sendRedirect('TASKLINK', 'CARD_-29' , null, null, null);
	}
}

//=====================================================================
// Functions
//=====================================================================
//

