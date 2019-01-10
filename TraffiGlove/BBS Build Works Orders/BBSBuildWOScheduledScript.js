/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       29 Aug 2017     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function woBuildScheduled(type) 
{
	//=============================================================================================
	//=============================================================================================
	//Start of main code
	//=============================================================================================
	//=============================================================================================
	//
	var context = nlapiGetContext();
	var usersEmail = context.getUser();
	var buildErrorCount = Number(0);
	var emailMessage = 'The following works orders have been built;\n\n';
	
	//Get the parameters
	//
	var parameters = context.getSetting('SCRIPT', 'custscript_bbs_wo_build_params');
	var parameterObject = JSON.parse(parameters);
	var operatorParam = parameterObject['operatorid'];
	var operatorNameParam = parameterObject['operatorname'];
	var batchParam = parameterObject['batchid'];
	var woCountParam = Number(parameterObject['wocount']);
	var woTickedParam = Number(parameterObject['woticked']);
	var woidsParam = parameterObject['woids'];
	
	nlapiLogExecution('DEBUG', 'Parameters', parameters);
	
	for (var int = 0; int < woidsParam.length; int++) 
		{
			//Check to see if we have enough resources to continue
			//
			if(int%10 == 0)
				{
					checkResources();
				}
			
			var woRecordId = woidsParam[int];
			var woName = nlapiLookupField('workorder', woRecordId, 'tranid', false);
			
			
			//Transform the works order into an assembly build
			//
			var buildRecord = null;
							
			//Trap for the possibility that the transform will not work
			//
			try
				{
					buildRecord = nlapiTransformRecord('workorder', woRecordId, 'assemblybuild', {recordmode: 'dynamic'}); //(10 GU's)
				}
			catch(err)
				{
					emailMessage += "An error occured when trying to build works order " + woName + " - " + err.message + '\n';
					buildRecord = null;
					buildErrorCount++;
				}
							
			//Have we got an build record
			//
			if(buildRecord)
				{
					var buildId = null;
					
					//Set the memo field to show who built this
					//
					buildRecord.setFieldValue('memo', 'Automated build from production batch ' + batchParam + ' by ' +  operatorNameParam);
					
					try
						{
							buildId = nlapiSubmitRecord(buildRecord, false, true);  //(20 GU's)
							var buildName = nlapiLookupField('assemblybuild', buildId, 'tranid', false);
							
							emailMessage += "Works Order " + woName + ' has been built by Assembly Build ' + buildName + '\n';
							
						}
					catch(err)
						{
							buildId = null;
							emailMessage += "An error occured when trying to build works order " + woName + " - " + err.message + '\n';
							buildErrorCount++;
						}	
				}
		}
	
	//Update the batch record status
	//
	if(woCountParam != woTickedParam || buildErrorCount > 0)
		{
			//If not all wo's were ticked or there were errors in creating the build records
			//
			nlapiSubmitField('customrecord_bbs_assembly_batch', batchParam, 'custrecord_bbs_batch_status', '3', false); //Some works orders built
		}
	else
		{
			//If all wo's were ticked & there were no errors creating the build records
			//
			nlapiSubmitField('customrecord_bbs_assembly_batch', batchParam, 'custrecord_bbs_batch_status', '4', false); //All works orders built
		}
		
	
	//Send the email to the user to say that we have finished
	//
	emailMessage += '\n';
	emailMessage += 'Build works orders from production batches has completed\n';
	nlapiSendEmail(usersEmail, usersEmail, 'Build Works Orders', emailMessage);
}

//=============================================================================================
//=============================================================================================
//Functions
//=============================================================================================
//=============================================================================================
//
function checkResources()
{
	var remaining = parseInt(nlapiGetContext().getRemainingUsage());
	
	if(remaining < 200)
		{
			nlapiYieldScript();
		}
}