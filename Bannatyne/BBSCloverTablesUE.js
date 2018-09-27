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
							case 'customrecordbbs_clover_category_list':
								
								externalId = isNull(cloverRecord.getFieldValue('name'),'') + isNull(cloverRecord.getFieldText('custrecordbbs_merch_location'),'');
								
								break;
								
							case 'customrecordbbs_clover_modifier_group':

								externalId = isNull(cloverRecord.getFieldValue('name'),'') + isNull(cloverRecord.getFieldText('custrecordbbs_merch_loc2'),'');
								
								break;
								
							case 'customrecordbbs_clover_modifier_list2':

								externalId = isNull(cloverRecord.getFieldValue('name'),'') + isNull(cloverRecord.getFieldText('custrecordbbs_merch_loc4'),'');
								
								break;
								
							case 'customrecordbbs_item_locatin_matrix':

								locationId = cloverRecord.getFieldValue('custrecordbbs_location_2');
								
								if(locationId != null && locationId != '')
									{
										merchantId = isNull(nlapiLookupField('location', locationId, 'custrecordbbs_clover_merchant_id', false));
									}
								
								itemId = cloverRecord.getFieldValue('custrecord_bbs_item');
								
								if(itemId != null && itemId != '')
									{
										var itemSearch = nlapiSearchRecord("item",null,
												[
												   ["internalid","anyof",itemId]
												], 
												[
												   new nlobjSearchColumn("itemid")
												]
												);
										
										if(itemSearch && itemSearch.length == 1)
											{
												itemName = itemSearch[0].getValue("itemid");
											}
									}
								
								externalId = itemName + merchantId;
								
								break;
						}
					
					cloverRecord.setFieldValue('externalid', externalId);
					
					nlapiSubmitRecord(cloverRecord, false, true);
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

