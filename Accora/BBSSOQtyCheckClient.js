/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       18 Jul 2018     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function qtyCheckSaveRecord()
{

    return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function qtyCheckFieldChanged(type, name, linenum)
{
	if(type == 'item' && name == 'quantity')
		{
			var subsidiary = nlapiGetFieldValue('subsidiary');
		
			if(subsidiary == 5)
				{
					var itemId = nlapiGetCurrentLineItemValue('item', 'item');
					var itemType = nlapiGetCurrentLineItemValue('item', 'itemtype');
					var itemQty = Number(nlapiGetCurrentLineItemValue('item', 'quantity'));
					
					var itemSerialised = itemIsSerialised(itemId, itemType);
					
					if(itemSerialised && itemQty > 1)
						{
							alert('Item quantity must be "1" for a serial numbered item');
						}
				}
		}
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to save line item, false to abort save
 */
function qtyCheckValidateLine(type)
{
	if(type == 'item')
	{
		var subsidiary = nlapiGetFieldValue('subsidiary');
		
		if(subsidiary == 5)
			{
				var itemId = nlapiGetCurrentLineItemValue('item', 'item');
				var itemType = nlapiGetCurrentLineItemValue('item', 'itemtype');
				var itemQty = Number(nlapiGetCurrentLineItemValue('item', 'quantity'));
				
				var itemSerialised = itemIsSerialised(itemId, itemType);
				
				if(itemSerialised && itemQty > 1)
					{
						alert('Item quantity must be "1" for a serial numbered item');
						
						return false;
					}
			}
	}
	
    return true;
}

function itemIsSerialised(item, itemType)
{
	var returnValue = false;
	var thisItemType = getItemRecordType(itemType);
	
	if(thisItemType != null)
		{
			var isSerialItem = nlapiLookupField(thisItemType, item, 'custitem_serial_numbered', false);
			
			if(isSerialItem == 'T')
				{
					returnValue = true;
				}
		}
	
	return returnValue;
}

function getItemRecordType(girtItemType)
{
	var girtItemRecordType = '';
	
	switch(girtItemType)
	{
		case 'InvtPart':
			girtItemRecordType = 'inventoryitem';
			break;
		
		case 'NonInvtPart':
			girtItemRecordType = 'noninventoryitem';
			break;
		
		case 'Assembly':
			girtItemRecordType = 'assemblyitem';
			break;
			
		case 'Kit':
			girtItemRecordType = 'kititem';
			break;
			
		default:
			girtItemRecordType = null;
			break;
	}

	return girtItemRecordType;
}

