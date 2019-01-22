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
	//Check for Create or Edit mode
	//
	if(type == 'create' || type == 'edit')
		{
			var newRecord = nlapiGetNewRecord();
			var newId = newRecord.getId();
			var newType = newRecord.getRecordType();
			
			//If we are in create mode, then do the w/o status check
			//
			if(type == 'create')
				{
					//See where this assembly build record has been created from i.e. the works order
					//
					var createdFrom = newRecord.getFieldValue('createdfrom');
					
					//Do we have a created from?
					//
					if(createdFrom != null && createdFrom != '')
						{
							//Read the works order record
							//
							var woRecord = nlapiLoadRecord('workorder', createdFrom);
							
							if(woRecord)
								{
									//Get the works order status
									//
									var woStatus = woRecord.getFieldValue('orderstatus');
									
									//See if the works order is marked as 'In Process'
									//
									if(woStatus == 'D')
										{
											//Remove the production batch link from the works order
											//
											woRecord.setFieldValue('custbody_bbs_wo_batch', null);
											
											//Save the works order
											//
											try
							  					{
													nlapiSubmitRecord(woRecord, false, true);
							  					}
						  					catch(err)
							  					{
						  							nlapiLogExecution('DEBUG', 'Error saving works order record', err.message);
							  					}
										}
								}
						}
				}
			
			 
			//Get the inventory detail sub-record for the assembly build
			//
			var invDetail = newRecord.viewSubrecord('inventorydetail');
			
			//If the sub-record is empty, then we need to populate it
			//
			if(invDetail == null)
				{
					//Load the build record & get the required data from it
					//
					var buildRecord = nlapiLoadRecord(newType, newId);
					var assemblyId = buildRecord.getFieldValue('item');
					var buildLocation = buildRecord.getFieldValue('location');
					var buildQuantity = buildRecord.getFieldValue('quantity');
					var buildCreatedFrom = buildRecord.getFieldValue('createdfrom');
					
					if(buildCreatedFrom != null && buildCreatedFrom != '')
						{
							var woNumber = nlapiLookupField('workorder', buildCreatedFrom, 'tranid', false);
							
							var invDetailSubRecord = buildRecord.createSubrecord('inventorydetail');
							invDetailSubRecord.selectNewLineItem('inventoryassignment');
							invDetailSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', buildQuantity);
							invDetailSubRecord.setCurrentLineItemValue('inventoryassignment', 'issueinventorynumber', woNumber);
							invDetailSubRecord.commitLineItem('inventoryassignment');
							invDetailSubRecord.commit();
							
							try
			  					{
									nlapiSubmitRecord(buildRecord, false, true);
			  					}
		  					catch(err)
			  					{
		  							nlapiLogExecution('DEBUG', 'Error saving assembly build record', err.message);
			  					}
						}
				}
		}
}
