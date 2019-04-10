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
	var parameterString = context.getSetting('SCRIPT', 'custscript_bbs_param_object_matrix');
	
	var parameterObject = JSON.parse(parameterString);
	
	//Debugging
	//
	nlapiLogExecution('DEBUG', 'Parameter String', parameterString);
	
	//Extract the parameters
	//
	var itemId = parameterObject['itemid'];
	var oldModifierGroup = parameterObject['oldmodifiergroup'];
	var oldCategory = parameterObject['oldcategory'];
	var oldRetailPrice = parameterObject['oldretailprice'];
	var newModifierGroup = parameterObject['newmodifiergroup'];
	var newCategory = parameterObject['newcategory'];
	var newRetailPrice = parameterObject['newretailprice'];
	
	
	//=============================================================================================
	//Update matrix records if the modifier group has changed
	//=============================================================================================
	//
	if(oldModifierGroup != newModifierGroup)
		{
			var customrecordbbs_item_locatin_matrixSearch = getResults(nlapiCreateSearch("customrecordbbs_item_locatin_matrix",
					[
					   ["custrecord_bbs_item","anyof",itemId], 
					   "AND", 
					   ["custrecordbbs_modifier_group","anyof",oldModifierGroup]
					], 
					[
					   new nlobjSearchColumn("internalid").setSort(false)
					]
					));
			
			//Process results of search
			//
			if(customrecordbbs_item_locatin_matrixSearch != null && customrecordbbs_item_locatin_matrixSearch.length > 0)
				{
					for (var int = 0; int < customrecordbbs_item_locatin_matrixSearch.length; int++) 
						{
							checkResources();
						
							//Get the matrix record id & then read in the record
							//
							var recordId = customrecordbbs_item_locatin_matrixSearch[int].getId();
							
							var matrixRecord = null;
							
							try
								{
									matrixRecord = nlapiLoadRecord('customrecordbbs_item_locatin_matrix', recordId);
								}
							catch(err)
								{
									matrixRecord = null;
								}
							
							if(matrixRecord)
								{
									//Update the the modifier group & its modifier id
									//
									var locationId = matrixRecord.getFieldValue('custrecordbbs_merchant_location');
									var newModifierId = getModifierGroupId(newModifierGroup, locationId);
									
									matrixRecord.setFieldValue('custrecordbbs_modifier_group', newModifierGroup);
									matrixRecord.setFieldValue('custrecordbbs_modif_group_ids', newModifierId);
									
									var status = matrixRecord.getFieldValue('custrecordbbs_process_status');
									
									//If the process status is not set to "New' then set it to modified
									//
									if(status != '1')
										{
											matrixRecord.setFieldValue('custrecordbbs_process_status', '2');
										}
									
									//Update the matrix record
									//
									try
										{
											nlapiSubmitRecord(matrixRecord, false, true);
										}
									catch(err)
										{
											nlapiLogExecution('ERROR', 'Error Saving Clover Item Location Matrix Record', err.message);
										}
								}
						}
				}
		}
	
	
	//=============================================================================================
	//Update matrix records if the category has changed
	//=============================================================================================
	//
	if(oldCategory != newCategory)
		{
			var customrecordbbs_item_locatin_matrixSearch = getResults(nlapiCreateSearch("customrecordbbs_item_locatin_matrix",
					[
					   ["custrecord_bbs_item","anyof",itemId], 
					   "AND", 
					   ["custrecordbbs_category","anyof",oldCategory]
					], 
					[
					   new nlobjSearchColumn("internalid").setSort(false)
					]
					));
			
			if(customrecordbbs_item_locatin_matrixSearch != null && customrecordbbs_item_locatin_matrixSearch.length > 0)
				{
					for (var int = 0; int < customrecordbbs_item_locatin_matrixSearch.length; int++) 
						{
							checkResources();
						
							//Get the matrix record id & then read in the record
							//
							var recordId = customrecordbbs_item_locatin_matrixSearch[int].getId();
							
							var matrixRecord = null;
							
							try
								{
									matrixRecord = nlapiLoadRecord('customrecordbbs_item_locatin_matrix', recordId);
								}
							catch(err)
								{
									matrixRecord = null;
								}
							
							if(matrixRecord)
								{
									//Update the the category & its modifier id
									//
									var locationId = matrixRecord.getFieldValue('custrecordbbs_merchant_location');
									var newCategoryId = getCategoryId(newCategory, locationId);
									
									matrixRecord.setFieldValue('custrecordbbs_category', newCategory);
									matrixRecord.setFieldValue('custrecordbbs_category_id', newCategoryId);
									
									var status = matrixRecord.getFieldValue('custrecordbbs_process_status');
									
									//If the process status is not set to "New' then set it to modified
									//
									if(status != '1')
										{
											matrixRecord.setFieldValue('custrecordbbs_process_status', '2');
										}
									
									//Update the matrix record
									//
									try
										{
											nlapiSubmitRecord(matrixRecord, false, true);
										}
									catch(err)
										{
											nlapiLogExecution('ERROR', 'Error Saving Clover Item Location Matrix Record', err.message);
										}
								}
						}
				}
		}
	
	
	//=============================================================================================
	//Update matrix records if the retail price has changed
	//=============================================================================================
	//
	if(oldRetailPrice != newRetailPrice)
		{
			var customrecordbbs_item_locatin_matrixSearch = getResults(nlapiCreateSearch("customrecordbbs_item_locatin_matrix",
					[
					   ["custrecord_bbs_item","anyof",itemId], 
					   "AND", 
					   ["custrecordbbs_retail_price","equalto",oldRetailPrice]
					], 
					[
					   new nlobjSearchColumn("internalid").setSort(false)
					]
					));
			
			if(customrecordbbs_item_locatin_matrixSearch != null && customrecordbbs_item_locatin_matrixSearch.length > 0)
				{
					for (var int = 0; int < customrecordbbs_item_locatin_matrixSearch.length; int++) 
						{
							checkResources();
							
							//Get the matrix record id & then read in the record
							//
							var recordId = customrecordbbs_item_locatin_matrixSearch[int].getId();
							
							var matrixRecord = null;
							
							try
								{
									matrixRecord = nlapiLoadRecord('customrecordbbs_item_locatin_matrix', recordId);
								}
							catch(err)
								{
									matrixRecord = null;
								}
							
							if(matrixRecord)
								{
									//Update the retail price
									//
									matrixRecord.setFieldValue('custrecordbbs_retail_price', newRetailPrice);
									
									var status = matrixRecord.getFieldValue('custrecordbbs_process_status');
									
									//If the process status is not set to "New' then set it to modified
									//
									if(status != '1')
										{
											matrixRecord.setFieldValue('custrecordbbs_process_status', '2');
										}
									
									//Update the matrix record
									//
									try
										{
											nlapiSubmitRecord(matrixRecord, false, true);
										}
									catch(err)
										{
											nlapiLogExecution('ERROR', 'Error Saving Clover Item Location Matrix Record', err.message);
										}
								}
						}
				}
		}
}

//=============================================================================================
//=============================================================================================
//Functions
//=============================================================================================
//=============================================================================================
//
function checkResources()
{
	var remaining = parseInt(nlapiGetContext().getRemainingUsage());
	
	if(remaining < 100)
		{
			nlapiYieldScript();
		}
}

function getModifierGroupId(_itemModifierGroup, _location)
{
	var modifierGroupId = '';
	
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

function getResults(search)
{
	var searchResult = search.runSearch();
	
	//Get the initial set of results
	//
	var start = 0;
	var end = 1000;
	var searchResultSet = searchResult.getResults(start, end);
	var resultlen = searchResultSet.length;

	//If there is more than 1000 results, page through them
	//
	while (resultlen == 1000) 
		{
				start += 1000;
				end += 1000;

				var moreSearchResultSet = searchResult.getResults(start, end);
				resultlen = moreSearchResultSet.length;

				searchResultSet = searchResultSet.concat(moreSearchResultSet);
		}
	
	return searchResultSet;
}
