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
									//Get the works order "created from"
									//
									//var woCreatedFrom = woRecord.getFieldValue('createdfrom');
								
									//Prevent the update of the sales order manpack status
									var woCreatedFrom = null;
								
									//See if we have a "created from"
									//
									if(woCreatedFrom)
										{
											var salesOrderRecord = nlapiLoadRecord('salesorder', woCreatedFrom);
										  	
										  	if(salesOrderRecord)
										  		{
										  			var manpackItemCount = Number(0);
										  			var manpackPeople = {};
										  			
										  			var items = salesOrderRecord.getLineItemCount('item');
										  			var currentManpackInfo = salesOrderRecord.getFieldValue('custbody_bbs_manpack_info');
										  			
										  			for (var int = 1; int <= items; int++) 
											  			{
															var manpackPerson = salesOrderRecord.getLineItemValue('item', 'custcol_bbs_sales_line_contact', int);
															var manpackItemQty = Number(salesOrderRecord.getLineItemValue('item', 'quantitycommitted', int));
															
															if(manpackItemQty > 0 && manpackPerson != null && manpackPerson != '')
																{
																	manpackItemCount += manpackItemQty;
																	manpackPeople[manpackPerson] = manpackPerson;
																}
														}
										  			
										  			var manpackInfo = 'MANPACK ' + (Object.keys(manpackPeople).length).toString() + ' (' + manpackItemCount.toString() + ')';
										  			
										  			if(manpackInfo != currentManpackInfo)
										  				{
										  					salesOrderRecord.setFieldValue('custbody_bbs_manpack_info', manpackInfo);
										  			
										  					try
											  					{
											  						nlapiSubmitRecord(salesOrderRecord, false, true);
											  					}
										  					catch(err)
											  					{
										  							nlapiLogExecution('DEBUG', 'Error saving sales order record', err.message);
											  					}
										  				}
										  		}
										}
								
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
					
					//Get the item record relating to the assembly
					//
					var itemRecord = nlapiLoadRecord('assemblyitem', assemblyId);
					var binCount = itemRecord.getLineItemCount('binnumber');
					
					var componentBin = '';
					
					//Find the preferred bin for the locxation in question
					//
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
					
					//If we have found a bin, then create the sub-record
					//
					if(componentBin != '')
						{
							var invDetailSubRecord = buildRecord.createSubrecord('inventorydetail');
							invDetailSubRecord.selectNewLineItem('inventoryassignment');
							invDetailSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', buildQuantity);
							invDetailSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', componentBin);
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
