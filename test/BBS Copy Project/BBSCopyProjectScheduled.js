/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       06 Nov 2018     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function copyProjectScheduled(type) 
{
	//Get the parameters
	//
	var context = nlapiGetContext();
	var usersEmail = context.getUser();
	
	var parameters = context.getSetting('SCRIPT', 'custscript_bbs_project_params');
	var parameterObject = JSON.parse(parameters);
	var projectId = parameterObject['projectid'];
	var customerId = parameterObject['customerid'];
	var projectName = parameterObject['name'];
	var projectStartDate = parameterObject['startdate'];
	var projectPM = parameterObject['projectmanager'];
	
	//Variables set up
	//
	var emailMessage = 'The project has now been copied, please see any messages below;\n';
	var sourceProjectRecord = null;
	var destinationProjectRecord = null;
	var destinationProjectId = null;
	
	//Read the source project record
	//
	try
		{
			sourceProjectRecord = nlapiLoadRecord('job', projectId)
		}
	catch(err)
		{
			sourceProjectRecord = null;
			emailMessage += 'Error reading source project - ' + err.message + '\n';
		}
	
	if(sourceProjectRecord)
		{
			//Create a new project record
			//
			destinationProjectRecord = nlapiCopyRecord('job', projectId);
			
			//Populate the new project record
			//
			destinationProjectRecord.setFieldValue('companyname', projectName);
			destinationProjectRecord.setFieldValue('startdate', projectStartDate);
			destinationProjectRecord.setFieldValue('parent', customerId);
			destinationProjectRecord.setFieldValue('custentity1', projectPM);

			
			//Try to save the new project
			//
			try
				{
					destinationProjectId = nlapiSubmitRecord(destinationProjectRecord, true, true);
				}
			catch(err)
				{
					destinationProjectId = null;
					emailMessage += 'Error creating new project - ' + err.message + '\n';
				}
			
			//If we have created the project we can continue
			//
			if(destinationProjectId)
				{
				
				}
		}
	
	
	
	
	
	
	
	
	
	
	nlapiSendEmail(usersEmail, usersEmail, 'Project Copy', emailMessage);
}
