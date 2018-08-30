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
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function atpDateFieldChanged(type, name, linenum)
{
	if(type == 'item' && name == 'expectedshipdate')
		{
			var shipDate = nlapiGetCurrentLineItemValue('item', 'expectedshipdate');
			
			var itemId = nlapiGetCurrentLineItemValue('item', 'item');
			var itemType = nlapiGetCurrentLineItemValue('item', 'itemtype');
			
			if(itemType == 'Assembly' || itemType == 'InvtPart' && (shipDate != null && shipDate != ''))
				{
					var shippingDays = Number(0);
					
					if(itemType == 'Assembly' )
						{
							shippingDays = Number(nlapiLookupField('assemblyitem', itemId, 'custitem_bbs_shipping_days', false));
						}
					
					if(itemType == 'InvtPart' )
					{
						shippingDays = Number(nlapiLookupField('inventoryitem', itemId, 'custitem_bbs_shipping_days', false));
					}
					
					if(shippingDays > 0)
						{
							var newDate = nlapiDateToString(nlapiAddDays(nlapiStringToDate(shipDate), shippingDays));
							
							nlapiSetCurrentLineItemValue('item', 'expectedshipdate', newDate, false, true);
						}
				}
		}
}
