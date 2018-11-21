/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       21 Nov 2018     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to save line item, false to abort save
 */
function sqmValidateLine(type)
{
	Number.prototype.round = function(places) 
		{
		  return +(Math.round(this + "e+" + places)  + "e-" + places);
		}
	
	if(type == 'item')
		{
			var rate = Number(nlapiGetCurrentLineItemValue('item', 'rate'));
			var item = nlapiGetCurrentLineItemValue('item', 'item');
			var itemType = nlapiGetCurrentLineItemValue('item', 'itemtype');
			var sqmRequired = 0;
			
			try
				{
					sqmRequired = Number(nlapiLookupField(getItemRecordType(itemType), item, 'custitem_bbs_item_sq_m_required', false));
				}
			catch(err)
				{
					sqmRequired = 0;
				}
			
			if(sqmRequired != 0 && !isNaN(sqmRequired))
				{
					var priceSqm = (rate / sqmRequired).round(2);
					
					nlapiSetCurrentLineItemValue('item', 'custcol_bbs_sales_sq_metre_price', priceSqm, false, true);
				}
		}
	
    return true;
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

