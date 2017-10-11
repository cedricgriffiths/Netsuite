/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       11 Oct 2017     cedricgriffiths
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
function percentageFulfilmentARS(type)
{
	if(type == 'create' || type == 'edit')
		{
			var newRecord = nlapiGetNewRecord();
			var newId = newRecord.getId();
			var soRecord = nlapiLoadRecord('salesorder', newId);
			var soLines = soRecord.getLineItemCount('item');
			var soStatus = soRecord.getFieldValue('status');
			
			var qtyOrdered = Number(0);
			var qtyCommitted = Number(0);
			
			for (var int = 1; int <= soLines; int++) 
			{
				var itemType = nlapiGetLineItemValue('item', 'itemtype', int);
				
				if(itemType == 'InvtPart')
					{
						qtyOrdered += Number(nlapiGetLineItemValue('item', 'quantity', int));
						qtyCommitted += Number(nlapiGetLineItemValue('item', 'quantitycommitted', int));
					}
			}
			
			var percent = Number(((qtyCommitted / qtyOrdered) * 100.00).toFixed());
			
			var percentListValue = null;
			
			percentListValue = (percent >= 0 && percent <= 49 ? 1 : null);
			percentListValue = (percent >= 50 && percent <= 74 ? 2 : null);
			percentListValue = (percent >= 75 && percent <= 99 ? 3 : null);
			percentListValue = (percent == 100 ? 4 : null);
			
			soRecord.setFieldValue('custbody_bbs_fulfilment_percentage', percentListValue);
			
			nlapiSubmitRecord(soRecord, false, true);
		}
}
