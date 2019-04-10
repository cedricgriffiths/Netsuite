/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       16 Oct 2018     cedricgriffiths
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
function CloverFieldChanged(type, name, linenum)
{
	//See if the location, category or modifier group has changed
	//if so, we need to re-get the category and/or modifier group id's
	//
	if(name == 'custrecordbbs_merchant_location' || name == 'custrecordbbs_category' || name == 'custrecordbbs_modifier_group')
		{
			var locationId = nlapiGetFieldValue('custrecordbbs_merchant_location');
			var categoryId = nlapiGetFieldValue('custrecordbbs_category');
			var modifierId = nlapiGetFieldValues('custrecordbbs_modifier_group');
			
			var cloverCategoryId = getCategoryId(categoryId, locationId);
			var cloverModifierId = getModifierGroupId(modifierId, locationId);
			
			nlapiSetFieldValue('custrecordbbs_category_id', cloverCategoryId, false, true);
			nlapiSetFieldValue('custrecordbbs_modif_group_ids', cloverModifierId, false, true);
			
		}
}

function getModifierGroupId(_itemModifierGroup, _location)
{
	var modifierGroupId = '';
	
	if(_itemModifierGroup != null && _itemModifierGroup != '' && _location != null && _location != '')
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
				for (var int = 0; int < customrecordbbs_clover_modifier_groupSearch.length; int++) 
					{
						modifierGroupId += customrecordbbs_clover_modifier_groupSearch[int].getValue("custrecordbbs_clover_mod_group_id");
						modifierGroupId += ',';
					}
				
				modifierGroupId = modifierGroupId.substring(0,modifierGroupId.length - 1);
			}
	}
	
	return modifierGroupId;
}

function getCategoryId(_itemCategory, _location)
{
	var categoryId = '';
	
	if(_itemCategory != null && _itemCategory != '' && _location != null && _location != '')
		{
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
		}
	
	return categoryId;
}
