/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       04 May 2018     cedricgriffiths
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
function prodFamilyAllocARS(type)
{
	if(type == 'edit')
		{
			var oldRecord = nlapiGetOldRecord();
			var newRecord = nlapiGetNewRecord();
			
			var oldTop1 = oldRecord.getFieldValue('custrecord_sw_top_1');
			var oldTop2 = oldRecord.getFieldValue('custrecord_sw_top_2');
			var oldTop3 = oldRecord.getFieldValue('custrecord_sw_top_3');
			var oldTop4 = oldRecord.getFieldValue('custrecord_sw_top_4');
			var oldTop5 = oldRecord.getFieldValue('custrecord_sw_top_5');
			var oldBottom1 = oldRecord.getFieldValue('custrecord_sw_bottom_1');
			var oldBottom2 = oldRecord.getFieldValue('custrecord_sw_bottom_2');
			var oldBottom3 = oldRecord.getFieldValue('custrecord_sw_bottom_3');
			var oldMiddle1 = oldRecord.getFieldValue('custrecord_sw_middle_1');
			
			var newTop1 = newRecord.getFieldValue('custrecord_sw_top_1');
			var newTop2 = newRecord.getFieldValue('custrecord_sw_top_2');
			var newTop3 = newRecord.getFieldValue('custrecord_sw_top_3');
			var newTop4 = newRecord.getFieldValue('custrecord_sw_top_4');
			var newTop5 = newRecord.getFieldValue('custrecord_sw_top_5');
			var newBottom1 = newRecord.getFieldValue('custrecord_sw_bottom_1');
			var newBottom2 = newRecord.getFieldValue('custrecord_sw_bottom_2');
			var newBottom3 = newRecord.getFieldValue('custrecord_sw_bottom_3');
			var newMiddle1 = newRecord.getFieldValue('custrecord_sw_middle_1');
			
			var newName = newRecord.getFieldValue('name');
			
			if(newName != 'Reset_Days')
				{
					if(		oldTop1 !== newTop1 || 
							oldTop2 !== newTop2 || 
							oldTop3 !== newTop3 || 
							oldTop4 !== newTop4 || 
							oldTop5 !== newTop5 || 
							oldBottom1 !== newBottom1 || 
							oldBottom2 !== newBottom2 || 
							oldBottom3 !== newBottom3 || 
							oldMiddle1 != newMiddle1	)
						{
							var thisId = newRecord.getId();
							var parameters = {custscript_bbs_pf_id: thisId};
							
							nlapiScheduleScript('customscript_bbs_prod_family_sched', null, parameters);
						}
				}
		}
}
