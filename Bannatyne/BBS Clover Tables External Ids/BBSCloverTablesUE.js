/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       14 Sep 2018     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */
function cloverAfterSubmit(type)
{
	if(type == 'create' || type == 'edit')
		{
			var newRecord = nlapiGetNewRecord();
			var currentId = newRecord.getId();
			var currentType = newRecord.getRecordType();
			
			var cloverRecord = null;
			
			try
				{
					cloverRecord = nlapiLoadRecord(currentType, currentId);
				}
			catch(err)
				{
					cloverRecord = null;
				}
			
			if(cloverRecord != null)
				{
					var externalId = '';
					var locationId = '';
					var merchantId = '';
					var itemId = '';
					var itemName = '';
					
					switch(currentType)
						{
							case 'serviceitem':
							case 'kititem':
							case 'inventoryitem':
							case 'noninventoryitem':
								
								externalId = isNull(cloverRecord.getFieldValue('displayname'),'');
								
								break;
								
							case 'customrecord_bbs_cl_loc_sub':
								
								externalId = isNull(cloverRecord.getFieldText('custrecordbbs_category_7'),'') + isNull(cloverRecord.getFieldText('custrecordbbs_merch_loc'),'');
								
								break;
								
							case 'customrecordbbs_clover_modifier_group':

								externalId = isNull(cloverRecord.getFieldText('custrecordbbs_clover_modifier_groups'),'') + isNull(cloverRecord.getFieldText('custrecordbbs_merch_loc2'),'');
								
								break;
								
							case 'customrecordbbs_clover_modifier_list2':

								externalId = isNull(cloverRecord.getFieldValue('name'),'') + isNull(cloverRecord.getFieldText('custrecordbbs_merch_loc4'),'');
								
								break;
								
							case 'customrecordbbs_item_locatin_matrix':

								merchantId = cloverRecord.getFieldText('custrecordbbs_merchant_location');
								itemName = cloverRecord.getFieldValue('custrecord_bbs_item_description');
								
								/*
								itemId = cloverRecord.getFieldValue('custrecord_bbs_item');
								
								if(itemId != null && itemId != '')
									{
										var itemSearch = nlapiSearchRecord("item",null,
												[
												   ["internalid","anyof",itemId]
												], 
												[
												   new nlobjSearchColumn("description")
												]
												);
										
										if(itemSearch && itemSearch.length == 1)
											{
												itemName = itemSearch[0].getValue("description");
											}
									}
								*/
								
								externalId = itemName + merchantId;
								
								break;
						}
					
					cloverRecord.setFieldValue('externalid', externalId);
					
					try
						{
							nlapiSubmitRecord(cloverRecord, false, true);
						}
					catch(err)
						{
							nlapiLogExecution('ERROR', 'Error saving clover record after updating externalid (' + currentType + ') (' + currentId + ')', err.message);
						}
				}
		}
}

function isNull(_string, _replacer)
{
	if(_string == null)
		{
			return _replacer;
		}
	else
		{
			return _string;
		}
}

