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
		
			if(subsidiary == 5 || subsidiary == 7)
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
		
		if(subsidiary == 5 || subsidiary == 7)
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

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function qtyCheckSaveRecord()
{
	var subsidiary = nlapiGetFieldValue('subsidiary');
	
	if(subsidiary == 5 || subsidiary == 7)
		{
			var lines = nlapiGetLineItemCount('item');
			var faults = false;
		
			for (var int = 1; int <= lines; int++) 
				{
					var itemId = nlapiGetLineItemValue('item', 'item', int);
					var itemType = nlapiGetLineItemValue('item', 'itemtype', int);
					var itemQty = Number(nlapiGetLineItemValue('item', 'quantity', int));
					
					var itemSerialised = itemIsSerialised(itemId, itemType);
					
					if(itemSerialised && itemQty > 1)
						{
							faults = true;
						}
				}
			
			if(faults)
				{
					alert('Item quantity must be "1" for a serial numbered item');
					return false;
				}
			else
				{
					return true;
				}
		}
	else
		{
			return true;
		}
}


function itemIsSerialised(item, itemType)
{
	var returnValue = false;
	var thisItemType = getItemRecordType(itemType);
	
	if(thisItemType != null)
		{
			var isSerialItem = 'F';
			
			try
				{
					isSerialItem = nlapiLookupField(thisItemType, item, 'custitem_serial_numbered', false);
				}
			catch(err)
				{
				 	isSerialItem = 'F';
				}
			
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

