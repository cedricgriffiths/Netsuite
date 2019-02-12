/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       29 May 2018     cedricgriffiths
 *
 */


/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function altSalesSaveRecord()
{
	var discountRate = Number(0);

	var lineCount = nlapiGetLineItemCount('item');
	
	//Search for a discount line
	//
	for (var int = 1; int <= lineCount; int++) 
		{
			var lineItemType = nlapiGetLineItemValue('item', 'itemtype', int);
			
			if(lineItemType == 'Discount')
				{
					discountRate = Math.abs(Number(nlapiGetLineItemValue('item', 'rate', int).replace('%', '')));
					
					break;
				}
		}
	
	for (var int = 1; int <= lineCount; int++) 
		{
			nlapiSelectLineItem('item', int);
			
			var item = nlapiGetCurrentLineItemValue('item', 'item');
			var itemType = nlapiGetCurrentLineItemValue('item', 'itemtype');
			var itemAmount = Number(nlapiGetCurrentLineItemValue('item', 'amount'));
			
			if(itemType != 'Discount' && itemType != 'EndGroup' && itemType != 'Description')
				{
					var grossMargin = Number(nlapiLookupField(getItemRecordType(itemType), item, 'custitem_gross_margin_percent_items', false));

					if(grossMargin != 0)
						{
							var altSalesAmount = (itemAmount / 100.00) * grossMargin;
							var discountAmount = (altSalesAmount / 100.00) * discountRate;
							
							altSalesAmount -= discountAmount;
							
							nlapiSetCurrentLineItemValue('item', 'altsalesamt', altSalesAmount, true, true);
							nlapiCommitLineItem('item');
						}
				}
		}
	
    return true;
}


/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to save line item, false to abort save
 */
function altSalesValidateLine(type)
{
	if(type == 'item')
		{
			var item = nlapiGetCurrentLineItemValue('item', 'item');
			var itemType = nlapiGetCurrentLineItemValue('item', 'itemtype');
			var line = nlapiGetCurrentLineItemValue('item', 'line');
			var amount = Number(nlapiGetCurrentLineItemValue('item', 'amount'));
			var rate = Number(nlapiGetCurrentLineItemValue('item', 'rate'));
			
			if(itemType != 'Discount' && itemType != 'EndGroup' && itemType != 'Description')
				{
					//If this is not a discount line, then we have to calculate the alt sales amount & then see if there is a discount line & apply that to the alt sales value
					//
					var grossMargin = Number(nlapiLookupField(getItemRecordType(itemType), item, 'custitem_gross_margin_percent_items', false));
					
					if(grossMargin != 0)
						{
							var altSalesAmount = (amount / 100.00) * grossMargin;
					
							var lineCount = nlapiGetLineItemCount('item');
							
							for (var int = 1; int <= lineCount; int++) 
								{
									var lineItemType = nlapiGetLineItemValue('item', 'itemtype', int);
									
									if(lineItemType == 'Discount')
										{
											var lineRate = Math.abs(Number(nlapiGetLineItemValue('item', 'rate', int).replace('%', '')));
											
											if(lineRate != 0)
												{
													var discountAmount = (altSalesAmount / 100.00) * lineRate;
													
													altSalesAmount -= discountAmount;
												}
										}
								}
							
							nlapiSetCurrentLineItemValue('item', 'altsalesamt', altSalesAmount, true, true);
						}
				}
		}
	
	return true;
		
}

function altSalesValidateDelete(type)
{
	var item = nlapiGetCurrentLineItemValue('item', 'item');
	var itemType = nlapiGetCurrentLineItemValue('item', 'itemtype');
	var line = nlapiGetCurrentLineItemValue('item', 'line');
	
    return true;
}

function getItemRecordType(girtItemType)
{
	var girtItemRecordType = '';
	
	switch(girtItemType)
	{
		case 'Service':
			girtItemRecordType = 'serviceitem';
			break;
			
		case 'Discount':
			girtItemRecordType = 'discountitem';
			break;
		
		case 'InvtPart':
			girtItemRecordType = 'inventoryitem';
			break;
	
		case 'NonInvtPart':
			girtItemRecordType = 'noninventoryitem';
			break;
		
		case 'Assembly':
			girtItemRecordType = 'assemblyitem';
			break;
			
		case 'NonInvtPart':
			girtItemRecordType = 'noninventoryitem';
			break;
			
		case 'Group':
			girtItemRecordType = 'itemgroup';
			break;
			
		default:
			girtItemRecordType = girtItemType;
			break;
			
	}

	return girtItemRecordType;
}