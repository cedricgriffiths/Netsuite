/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       31 Oct 2018     cedricgriffiths
 *
 */


/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */
function setLineDateBeforeSubmit(type)
{
	if(type == 'create')
		{
			var receiveByDate = nlapiGetFieldValue('duedate');
			
			if(receiveByDate != null && receiveByDate != '')
				{
					var lines = nlapiGetLineItemCount('item');
					
					for (var int = 1; int <= lines; int++) 
						{
							nlapiSetLineItemValue('item', 'expectedreceiptdate', int, receiveByDate);
						}
				}
		}
}

function setLineDateAfterSubmit(type)
{
	if(type == 'create')
		{
			var newPoRecord = nlapiGetNewRecord();
			var newPoId = newPoRecord.getId();
			newPoRecord = nlapiLoadRecord('purchaseorder', newPoId);
			
			var receiveByDate = newPoRecord.getFieldValue('duedate');
			
			if(receiveByDate != null && receiveByDate != '')
				{
					var lines = newPoRecord.getLineItemCount('item');
					
					for (var int = 1; int <= lines; int++) 
						{
							newPoRecord.setLineItemValue('item', 'expectedreceiptdate', int, receiveByDate);
						}
					
					nlapiSubmitRecord(newPoRecord, false, true);
				}
		}
	
	if(type == 'edit')
		{
			var newPoRecord = nlapiGetNewRecord();
			var oldPoRecord = nlapiGetOldRecord();
			
			var newDueDate = newPoRecord.getFieldValue('duedate');
			var oldDueDate = oldPoRecord.getFieldValue('duedate');
			
			if(newDueDate != oldDueDate && newDueDate != '' && newDueDate != null)
				{
					var newPoId = newPoRecord.getId();
					newPoRecord = nlapiLoadRecord('purchaseorder', newPoId);
					
					var lines = newPoRecord.getLineItemCount('item');
							
					for (var int = 1; int <= lines; int++) 
						{
							newPoRecord.setLineItemValue('item', 'expectedreceiptdate', int, newDueDate);
						}
							
					nlapiSubmitRecord(newPoRecord, false, true);
				}
		}
}