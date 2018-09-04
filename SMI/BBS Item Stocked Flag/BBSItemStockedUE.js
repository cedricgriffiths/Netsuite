/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       20 Aug 2018     cedricgriffiths
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
function itemStockedAfterSubmit(type)
{
	if(type == 'create' || type == 'edit')
		{
			var newItemRecord = nlapiGetNewRecord();
			var itemId = newItemRecord.getId();
			var itemType = newItemRecord.getRecordType();
			
			if(itemType == 'inventoryitem' && itemId != null)
				{
					//nlapiLogExecution('DEBUG', 'Item Stocked UE', "Type=" + type + " Item Type=" + itemType + " ItemId=" + itemId);
					
					var lines = newItemRecord.getLineItemCount('locations');
					var hasReorderPoint = false;
					
					for (var int = 1; int <= lines; int++) 
						{
							var reorderPoint = newItemRecord.getLineItemValue('locations', 'reorderpoint', int);
							
							if(reorderPoint != null && reorderPoint != '')
								{
									hasReorderPoint = true;
									break;
								}
						}
					
					if(hasReorderPoint)
						{
							nlapiSubmitField(itemType, itemId, 'custitem_bbs_item_stocked', 'T', false);
						}
					else
						{
							nlapiSubmitField(itemType, itemId, 'custitem_bbs_item_stocked', 'F', false);
						}
				}
		}
}
