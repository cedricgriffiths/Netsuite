/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       23 Feb 2018     cedricgriffiths
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
function sumQuantities(type)
{
	if(type == 'create' || type == 'edit')
		{
			var newRecord = nlapiGetNewRecord();
			var newId = newRecord.getId();
			var newType = newRecord.getRecordType();
			
			var currentRecord = nlapiLoadRecord(newType, newId);
			
			if(currentRecord)
				{
					var totalQuantity = Number(0);
					var itemCount = currentRecord.getLineItemCount('item');
					
					for (var int = 1; int <= itemCount; int++) 
						{
							var lineQuantity = Number(currentRecord.getLineItemValue('item', 'quantity', int));
							
							totalQuantity += lineQuantity;
						}
					
					currentRecord.setFieldValue('custbody_bbs_total_order_items', totalQuantity);
					
					try
						{
							nlapiSubmitRecord(currentRecord, false, true);
						}
					catch(err)
						{
							nlapiLogExecution('ERROR', 'Error updating total order items', err.message);
						}
				}
		}
}
