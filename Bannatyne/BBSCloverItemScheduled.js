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
	var itemRecord = null;
	
	//Read the item record
	//
	try
		{
			itemRecord = nlapiLoadRecord('kititem', itemId);
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
					var categoryId = getCategoryId(itemCategory, locations[int]);
					matrixRecord.setFieldValue('custrecordbbs_category', categoryId);
					
					//Find & set the modifier group for this location
					//
					var modifierGroupId = getModifierGroupId(itemModifierGroup, locations[int]);
					matrixRecord.setFieldValue('custrecordbbs_modifier_group', modifierGroupId);
					
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
}

function getModifierGroupId(_itemModifierGroup, _location)
{
	var modifierGroupId = null;
	
	return modifierGroupId;
}

function getCategoryId(_itemCategory, _location)
{
	var categoryId = null;
	
	return categoryId;
}

function getRetailPrice(_itemRecord)
{
	var retailPrice = Number(0);
	
	return retailPrice;
}