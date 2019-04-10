/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       27 Feb 2018     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function woBatchUpdate(type) 
{
	//Read in the parameter(s)
	//
	var context = nlapiGetContext();
	var woArrayString = context.getSetting('SCRIPT', 'custscript_wo_array');
	nlapiLogExecution('DEBUG', 'W/O JSON String', woArrayString);
	
	var woArray = JSON.parse(woArrayString);

	for (var woKey in woArray) 
		{
			woIds = woArray[woKey];
			
			for (var int2 = 0; int2 < woIds.length; int2++) 
				{
					checkResources();
					
					var woRecord = null;
					
					try
						{
							woRecord = nlapiLoadRecord('workorder', woIds[int2]); //10GU's
						}
					catch(err)
						{
							woRecord = null;
							nlapiLogExecution('DEBUG', 'Error getting works order - ' + err.message, woIds[int2]);
						}
					
					if(woRecord)
						{
							woRecord.setFieldValue('custbody_bbs_wo_batch', woKey);
							
							try
								{
									nlapiSubmitRecord(woRecord, false, true); //20GU's
								}
							catch(err)
								{
									nlapiLogExecution('DEBUG', 'Error updating works order - ' + err.message, woIds[int2]);
								}
						}
					else
						{
							nlapiLogExecution('DEBUG', 'No works order found ', woIds[int2]);
						}
				}
			
			var batchRecord = nlapiLoadRecord('customrecord_bbs_assembly_batch', woKey); //2GU;s
			
			if(batchRecord)
				{
					checkResources();
					
					batchRecord.setFieldValue('custrecord_bbs_wo_updated', 'T');
					
					try
						{
							nlapiSubmitRecord(batchRecord, false, true); //2GU's
						}
					catch(err)
						{
							nlapiLogExecution('DEBUG', 'Error updating production batch - ' + err.message, woKey);
						}
				}
		}
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
	
	if(remaining < 100)
		{
			nlapiYieldScript();
		}
}