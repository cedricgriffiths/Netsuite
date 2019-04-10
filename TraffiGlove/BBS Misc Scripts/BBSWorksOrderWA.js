/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       05 Sep 2017     cedricgriffiths
 *
 */

/**
 * @returns {Void} Any or no return value
 */
function workflowAction() 
{
	
	//=============================================================================================
	//Code to check the w/o commitment status & set the ffi & finish
	//=============================================================================================
	//
	
	//Get the new record & also its status
	//
	var thisRecord = nlapiGetNewRecord();
	var woId = thisRecord.getId();
	var newRecord = nlapiLoadRecord('workorder', woId );
	var newStatus = newRecord.getFieldValue('status');
	
	//If the status is release, then we need to work out the commitment status
	//
	if(newStatus == 'Released' || newStatus == 'Built')
	{
		//Schedule the script
		//
		var params = {custscript_bbs_woid: woId};
	
		nlapiScheduleScript('customscript_bbs_wo_schedule', null, params);

	}
}

function wait(ms)
{
	var start = new Date().getTime();
	var end = start;
	
	while(end < start + ms) 
		{
	    	end = new Date().getTime();
		}
	}
