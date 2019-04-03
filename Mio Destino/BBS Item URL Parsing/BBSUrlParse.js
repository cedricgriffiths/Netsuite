
function urlFieldUE(type)
{
	var itemCount = nlapiGetLineItemCount('item');

	for (var lineNo = 1; lineNo <= itemCount; lineNo++) 
		{
			// Get the product id from the current line
			//
			var productId = nlapiGetLineItemValue('item', 'item', lineNo);
			var productType = nlapiGetLineItemValue('item', 'itemtype', lineNo);
	
			if (productId != null) 
				{
					var productRecord = null;
		
					// Read the product based on its id
					//
					try {
							productRecord = nlapiLoadRecord(getItemRecType(productType), productId);
						}
					catch (err) 
						{		
						}
		
					if (productRecord != null) 
						{
							// Get the image reference
							//
							var itemImage = productRecord.getFieldValue('storedisplayimage');
							var channelImage = productRecord.getFieldValue('custitem_bbs_channel_image');
						
							if (itemImage != null && itemImage != '') 
								{
									//Read the file from the cabinet
									//
									var itemImageFile = nlapiLoadFile(itemImage);
				
									if (itemImageFile != null && itemImageFile != '') 
										{
											var itemImageUrl = itemImageFile.getURL();
					
											if (itemImageUrl != '') 
												{
													var context = nlapiGetContext();
													var env = context.getEnvironment();
						
													itemImageUrl = 'https://system.eu1.netsuite.com' + itemImageUrl
													
													nlapiSetLineItemValue('item', 'custcol_bbs_thumbnail_image_parsed', lineNo, itemImageUrl);
												}
										}
								}
							else
								{
									if (channelImage != null && channelImage != '') 
										{
											nlapiSetLineItemValue('item', 'custcol_bbs_thumbnail_image_parsed', lineNo, channelImage);
										}
								}
						}
				}
		}
}

function getItemRecType(ItemType)
{
	var itemType = '';
	
	switch(ItemType)
	{
		case 'InvtPart':
			itemType = 'inventoryitem';
			break;
			
		case 'Assembly':
			itemType = 'assemblyitem';
			break;
			
		case 'NonInvtPart':
			itemType = 'noninventoryitem';
			break;
	}

	return itemType;
}
