/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       20 Mar 2019     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{
	var itemSearch = nlapiSearchRecord("item",null,
			[
			   ["externalid","anyof","@NONE@"]
			], 
			[
			   new nlobjSearchColumn("itemid").setSort(false), 
			   new nlobjSearchColumn("type")
			]
			);
	
	if(itemSearch != null && itemSearch.length > 0)
		{
			for (var int = 0; int < itemSearch.length; int++) 
				{
					var itemName = itemSearch[int].getValue("itemid");
					var itemId = itemSearch[int].getId();
					var itemType = itemSearch[int].getValue("type");
					
					nlapiSubmitField(getItemRecordType(itemType), itemId, 'externalid', itemName, false);
				}
		}
}

function getItemRecordType(_itemType)
{
	var _itemRecordType = '';
	
	switch(_itemType)
	{
		case 'InvtPart':
			_itemRecordType = 'inventoryitem';
			break;
		
		case 'NonInvtPart':
			_itemRecordType = 'noninventoryitem';
			break;
		
		case 'Assembly':
			_itemRecordType = 'assemblyitem';
			break;
			
		case 'Kit':
			_itemRecordType = 'kititem';
			break;
			
		case 'Service':
			_itemRecordType = 'serviceitem';
			break;
			
		case 'Discount':
			_itemRecordType = 'discountitem';
			break;
		
		case 'Group':
			_itemRecordType = 'itemgroup';
			break;
		
		default:
			_itemRecordType = girtItemType;
			break;
	}

	return _itemRecordType;
}
