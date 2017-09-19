
function urlFieldUE(type)
{
	var itemCount = nlapiGetLineItemCount('item');
	
	for (var i=1;i<=itemCount;i++)
		{			
			var urlValue = nlapiGetLineItemValue('item', 'custcol_sw_thumbnail_image', i);
			
			if (urlValue != null && urlValue != '')
				{
					var file = nlapiLoadFile(urlValue);
					
					// printed file must be available without login, otherwise you get error on printing 
					if (file.isOnline())
						{
							var itemImageUrl = file.getURL();
							
							var context = nlapiGetContext();

							var env = context.getEnvironment();

							
							// set completed url to your custom field of type free-form-text
							nlapiSetLineItemValue('item','custcol_sw_thumbnail_image_parsed', i, itemImageUrl);
						}
				}
		}
}
