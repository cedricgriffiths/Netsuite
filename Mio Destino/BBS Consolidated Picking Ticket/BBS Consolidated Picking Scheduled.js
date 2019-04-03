/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       21 Nov 2017     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function cplScheduled(type) 
{
	//Get the parameters
	//
	var context = nlapiGetContext();
	var orders = JSON.parse(context.getSetting('SCRIPT', 'custscript_bbs_orders'));
	
	for (var int = 0; int < orders.length; int++) 
	{
		var salesRecord = nlapiLoadRecord('salesorder', orders[int]);
		
		if (salesRecord)
			{
				salesRecord.setFieldValue('custbody_bbs_consolidated_pick_printed', 'T');
			
				nlapiSubmitRecord(salesRecord, false, true);
			}
	}
	
}
