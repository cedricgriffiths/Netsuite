/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 Mar 2019     cedricgriffiths
 *
 */


/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to save line item, false to abort save
 */
function poItemValidateLine(type)
{
	if(type == 'item')
		{
			var currentLineItem = nlapiGetCurrentLineItemValue('item', 'item');
			var currentLineItemText = nlapiGetCurrentLineItemText('item', 'item');
			var currentLineNo = nlapiGetCurrentLineItemValue('item', 'line');
			var locationId = nlapiGetFieldValue('location');
			
			if(locationId == '11' || locationId == '16') //AMS Canada, AMS 
				{
					var lines = nlapiGetLineItemCount('item');
					
					for (var int = 1; int <= lines; int++) 
						{
							var thisLineItem = nlapiGetLineItemValue('item', 'item', int);
							var thisLineNo = nlapiGetLineItemValue('item', 'line', int);
						
							if(currentLineItem == thisLineItem && (currentLineNo != thisLineNo || currentLineNo == null))
								{
									alert('WARNING - Product "' + currentLineItemText + '" already exists on this purchase order!')
									break;
								}
						}
				}
		}

	return true;
}
