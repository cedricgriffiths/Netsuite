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
	var woArray = JSON.parse(woArrayString);

	for (var woKey in woArray) 
		{
			woIds = woArray[woKey];
			
			for (var int2 = 0; int2 < woIds.length; int2++) 
				{
					checkResources();
					
					var woRecord = nlapiLoadRecord('workorder', woIds[int2]); //10GU's
					
					woRecord.setFieldValue('custbody_bbs_wo_batch', woKey);
					
					nlapiSubmitRecord(woRecord, false, true); //20GU's
				}
			
			var batchRecord = nlapiLoadRecord('customrecord_bbs_assembly_batch', woKey); //2GU;s
			
			if(batchRecord)
				{
					checkResources();
					
					batchRecord.setFieldValue('custrecord_bbs_wo_updated', 'T');
					nlapiSubmitRecord(batchRecord, false, true); //2GU's
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
	
	if(remaining < 50)
		{
			nlapiYieldScript();
		}
}