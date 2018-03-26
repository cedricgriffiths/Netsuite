/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       27 Feb 2018     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function assemblyBuildAS(type)
{
	if(type == 'create' || type == 'edit')
		{
			var newRecord = nlapiGetNewRecord();
			var newId = newRecord.getId();
			var newType = newRecord.getRecordType();
			
			if(type == 'create')
				{
					var createdFrom = newRecord.getFieldValue('createdfrom');
					
					if(createdFrom != null && createdFrom != '')
						{
							var woRecord = nlapiLoadRecord('workorder', createdFrom);
							
							if(woRecord)
								{
									woStatus = woRecord.getFieldValue('orderstatus');
									
									if(woStatus == 'D')
										{
											woRecord.setFieldValue('custbody_bbs_wo_batch', null);
											nlapiSubmitRecord(woRecord, false, true);
										}
								}
						}
				}
			
			var invDetail = newRecord.viewSubrecord('inventorydetail');
			
			if(invDetail == null)
				{
					var buildRecord = nlapiLoadRecord(newType, newId);
					var assemblyId = buildRecord.getFieldValue('item');
					var buildLocation = buildRecord.getFieldValue('location');
					var buildQuantity = buildRecord.getFieldValue('quantity');
					
					var itemRecord = nlapiLoadRecord('assemblyitem', assemblyId);
					var binCount = itemRecord.getLineItemCount('binnumber');
					
					var componentBin = '';
					
					for (var int5 = 1; int5 <= binCount; int5++) 
					{
						var binPreferred = itemRecord.getLineItemValue('binnumber', 'preferredbin', int5);
						var binLocation = itemRecord.getLineItemValue('binnumber', 'location', int5);
						
						if(binPreferred == 'T' && binLocation == buildLocation)
							{
								componentBin = itemRecord.getLineItemValue('binnumber', 'binnumber', int5);
								break;
							}
					}
					
					if(componentBin != '')
						{
							var invDetailSubRecord = buildRecord.createSubrecord('inventorydetail');
							invDetailSubRecord.selectNewLineItem('inventoryassignment');
							invDetailSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', buildQuantity);
							invDetailSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', componentBin);
							invDetailSubRecord.commitLineItem('inventoryassignment');
							invDetailSubRecord.commit();
							
							nlapiSubmitRecord(buildRecord, false, true);
						}
				}
		}
}
