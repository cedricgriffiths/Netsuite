/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       30 Aug 2018     cedricgriffiths
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
function userEventAfterSubmit(type)
{
	if(type == 'create')
		{
			var newRecord = nlapiGetNewRecord();
			var newId = newRecord.getId();
			
			var importRecord = null;
			
			try
				{
					importRecord = nlapiLoadRecord('customrecord_bbs_trans_import', newId);
				}
			catch(err)
				{
					importRecord = null;
				}
			
			if(importRecord)
				{
					var woId = importRecord.getFieldValue('custrecord_bbs_tran_id');
					var woStartDate = importRecord.getFieldValue('custrecord_bbs_start_date');
					var woEndDate = importRecord.getFieldValue('custrecord_bbs_end_date');
					
					var woRecord = null;
					
					try
						{
							woRecord = nlapiLoadRecord('workorder', woId);
						}
					catch(err)
						{
							woRecord = null;
						}
					
					if(woRecord)
						{
							if(woStartDate != null && woStartDate != '')
								{
									woRecord.setFieldValue('startdate', woStartDate);
								}
							
							if(woEndDate != null && woEndDate != '')
								{
									woRecord.setFieldValue('enddate', woEndDate);
								}
							
							nlapiSubmitRecord(woRecord, false, true);
						}
					
					nlapiDeleteRecord('customrecord_bbs_trans_import', newId);
				}
		}
}
