/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       31 Aug 2017     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function worksOrderAfterSubmit(type)
{
	//Only work when in edit or create mode
	//
	if(type == 'edit' || type == 'create')
	{
		var newRecord = nlapiGetNewRecord();
		var woId = newRecord.getId();
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
}
