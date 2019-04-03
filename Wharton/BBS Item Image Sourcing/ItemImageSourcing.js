function beforeSubmit(type) {

	var itemCount = nlapiGetLineItemCount('item');

	for (var lineNo = 1; lineNo <= itemCount; lineNo++) {

		// Get the product id from the current line
		var productId = nlapiGetLineItemValue('item', 'item', lineNo);

		if (productId != null) {
			var productRecord = null;

			// Read the product based on its id
			try {
				productRecord = nlapiLoadRecord('noninventoryitem', productId);
			}
			catch (err) {
				try {
					productRecord = nlapiLoadRecord('inventoryitem', productId);
				}
				catch (err) {
					try {
						productRecord = nlapiLoadRecord('assemblyitem', productId);
					}
					catch (err) {
						try {
							productRecord = nlapiLoadRecord('kititem', productId);
						}
						catch (err) {
							try {
								productRecord = nlapiLoadRecord('itemgroup', productId);
							}
							catch (err) {

							}
						}
					}
				}
			}

			if (productRecord != null) {

				// Get the image reference
				var itemImage = productRecord.getFieldValue('custitem_bbs_item_thumb');

				if (itemImage != null && itemImage != '') {

					//Read the file from the cabinet
					var itemImageFile = nlapiLoadFile(itemImage);

					if (itemImageFile != null && itemImageFile != '') {

						var itemImageUrl = itemImageFile.getURL();

						if (itemImageUrl != '') {

							var context = nlapiGetContext();

							var env = context.getEnvironment();

							if (env == 'PRODUCTION') {
								itemImageUrl = 'https://system.netsuite.com' + itemImageUrl
							}
							else {
								itemImageUrl = 'https://system.sandbox.netsuite.com' + itemImageUrl
							}

							nlapiSetLineItemValue('item', 'custcol_bbs_qte_itemimage', lineNo, itemImageUrl);

						}
					}
				}
			}

		}
	}
}
