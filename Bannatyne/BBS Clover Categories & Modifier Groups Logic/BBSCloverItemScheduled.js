/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 Oct 2018     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{
	//Read in the parameters
	//
	var context = nlapiGetContext();
	var parameterString = context.getSetting('SCRIPT', 'custscript_bbs_param_object');
	
	var parameterObject = JSON.parse(parameterString);
	
	//Debugging
	//
	nlapiLogExecution('DEBUG', 'Parameter String', parameterString);
	
	//Extract the parameters
	//
	var itemId = parameterObject['itemid'];
	var locations = parameterObject['locations'];
	var recordType = parameterObject['recordtype'];
	var itemRecord = null;
	
	switch(recordType)
		{
			case 'customrecordbbs_clover_category_list2':
				
				//Loop through all of the locations
				//
				for (var int = 0; int < locations.length; int++) 
					{
						var record = nlapiCreateRecord('customrecord_bbs_cl_loc_sub');
						record.setFieldValue('custrecordbbs_category_7', itemId);
						record.setFieldValue('custrecordbbs_merch_loc', locations[int]);
						
						try
							{
								nlapiSubmitRecord(record, true, true);
							}
						catch(err)
							{
								nlapiLogExecution('ERROR', 'Error Saving Clover Category Location Record', err.message);
							}
					}
				
				break;
				
			case 'customrecordbbs_modifier_groups':
				
				//Loop through all of the locations
				//
				for (var int = 0; int < locations.length; int++) 
					{
						var record = nlapiCreateRecord('customrecordbbs_clover_modifier_group');
						record.setFieldValue('custrecordbbs_clover_modifier_groups', itemId);
						record.setFieldValue('custrecordbbs_merch_loc2', locations[int]);
						record.setFieldValue('custrecord_bbs_new2', 'T');
						
						try
							{
								nlapiSubmitRecord(record, true, true);
							}
						catch(err)
							{
								nlapiLogExecution('ERROR', 'Error Saving Clover Modifier Group Location Record', err.message);
							}
					}
				
				break;
				
			case 'kititem':
			case 'inventoryitem':
			case 'noninventoryitem':
			case 'serviceitem':
		
				//Read the item record
				//
				try
					{
						itemRecord = nlapiLoadRecord(recordType, itemId);
					}
				catch(err)
					{
						itemRecord = null;
					}
				
				if(itemRecord)
					{
						//Get item details
						//
						var itemCategory = itemRecord.getFieldValue('custitembbs_clover_category_list');
						var itemModifierGroup = itemRecord.getFieldValue('custitembbs_modifier_group');
					
						//Find the retail price
						//
						var itemPrice = getRetailPrice(itemRecord);
						
						//Loop through all of the locations
						//
						for (var int = 0; int < locations.length; int++) 
							{
								var matrixRecord = nlapiCreateRecord('customrecordbbs_item_locatin_matrix');
								
								//Set the item
								//
								matrixRecord.setFieldValue('custrecord_bbs_item', itemId);
								
								//Set the location
								//
								matrixRecord.setFieldValue('custrecordbbs_merchant_location', locations[int]);
								
								//Set the retail price
								//
								matrixRecord.setFieldValue('custrecordbbs_retail_price', itemPrice);
								
								//Find & set the category for this location
								//
								matrixRecord.setFieldValue('custrecordbbs_category', itemCategory);
								
								var categoryId = getCategoryId(itemCategory, locations[int]);
								matrixRecord.setFieldValue('custrecordbbs_category_id', categoryId);
								
								//Find & set the modifier group for this location
								//
								matrixRecord.setFieldValue('custrecordbbs_modifier_group', itemModifierGroup);
								
								var modifierGroupId = getModifierGroupId(itemModifierGroup, locations[int]);
								matrixRecord.setFieldValue('custrecordbbs_modif_group_ids', modifierGroupId);
								
								//Set the process status = new
								//
								matrixRecord.setFieldValue('custrecordbbs_process_status', '1');
								
								
								//Submit the matrix record
								//
								try
									{
										nlapiSubmitRecord(matrixRecord, true, true);
									}
								catch(err)
									{
										nlapiLogExecution('ERROR', 'Error Saving Clover Item Location Matrix Record', err.message);
									}
							}
					}
				
				break;
		}
	
	
}

function getModifierGroupId(_itemModifierGroup, _location)
{
	var modifierGroupId = '';
	
	if(_itemModifierGroup != null && _itemModifierGroup != '')
		{
			var customrecordbbs_clover_modifier_groupSearch = nlapiSearchRecord("customrecordbbs_clover_modifier_group",null,
					[
					   ["custrecordbbs_clover_modifier_groups","anyof",_itemModifierGroup], 
					   "AND", 
					   ["custrecordbbs_merch_loc2","anyof",_location]
					], 
					[
					   new nlobjSearchColumn("custrecordbbs_clover_mod_group_id")
					]
					);
			
			if(customrecordbbs_clover_modifier_groupSearch != null && customrecordbbs_clover_modifier_groupSearch.length > 0)
			{
				modifierGroupId = customrecordbbs_clover_modifier_groupSearch[0].getValue("custrecordbbs_clover_mod_group_id");
			}
		}
	
	return modifierGroupId;
}

function getCategoryId(_itemCategory, _location)
{
	var categoryId = '';
	
	var customrecord_bbs_cl_loc_subSearch = nlapiSearchRecord("customrecord_bbs_cl_loc_sub",null,
			[
			   ["custrecordbbs_category_7","anyof", _itemCategory], 
			   "AND", 
			   ["custrecordbbs_merch_loc","anyof", _location]
			], 
			[
			   new nlobjSearchColumn("custrecordbbs_category_internal_id")
			]
			);
	
	if(customrecord_bbs_cl_loc_subSearch != null && customrecord_bbs_cl_loc_subSearch.length > 0)
		{
			categoryId = customrecord_bbs_cl_loc_subSearch[0].getValue("custrecordbbs_category_internal_id");
		}
	
	return categoryId;
}

function getRetailPrice(_itemRecord)
{
	var retailPrice = Number(0);
	
	//Read the price sublist based on the currency code
	//
	var priceSublist = 'price1';
	
	var priceLineCount = _itemRecord.getLineItemCount(priceSublist);
	var quantityLevels = _itemRecord.getMatrixCount(priceSublist, 'price');
	
	for (var int2 = 1; int2 <= priceLineCount; int2++) 
	{
		var pricePriceLevel = _itemRecord.getLineItemValue(priceSublist, 'pricelevel', int2);
		
		if (pricePriceLevel == '1')
			{
				retailPrice = Number(_itemRecord.getLineItemMatrixValue(priceSublist, 'price', int2, 1));

				break;
			}
	}

	return retailPrice;
}