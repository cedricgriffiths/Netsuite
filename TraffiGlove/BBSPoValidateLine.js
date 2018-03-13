/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       09 Mar 2018     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to save line item, false to abort save
 */
function clientValidatePoLine(type)
{
	var returnValue = true;
	
	if(type == 'item')
		{
			var itemType = nlapiGetCurrentLineItemValue('item', 'itemtype');
			
			if(itemType == 'Assembly' || itemType == 'InvtPart' || itemType == 'NonInvtPart')
				{
					var location = nlapiGetCurrentLineItemValue('item', 'location');
					
					if(location == null || location == '')
						{
							alert('Please enter a value for "Location"');
							returnValue = false;
						}
				}
		}
    return returnValue;
}
