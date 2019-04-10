/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       20 Mar 2018     cedricgriffiths
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
function assignWoToSoARS(type)
{
	if(type != 'delete')
		{
			//Get the current sales order record
			//
			var salesOrderRecord = nlapiGetNewRecord();
			var salesOrderId = salesOrderRecord.getId();
			
			try
				{
					salesOrderRecord = nlapiLoadRecord('salesorder', salesOrderId); //10 GU's
				}
			catch(err)
				{
					salesOrderRecord = null;
				}
			
			if(salesOrderRecord)
				{
					//Get count of item lines
					//
					var itemLineCount = salesOrderRecord.getLineItemCount('item');
					
					var woNeeded = false;
					var woCount = Number(0);
					
					//Loop through the items looking for assembly items on backorder with no works order assigned to them
					//
					for (var int = 1; int <= itemLineCount; int++) 
						{
							var itemType = salesOrderRecord.getLineItemValue('item', 'itemtype', int);
							var itemBackorder = Number(salesOrderRecord.getLineItemValue('item', 'quantitybackordered', int));
							var itemWorksOrder = salesOrderRecord.getLineItemValue('item', 'woid', int);
						
							if(itemType == 'Assembly' && itemBackorder > 0 && (itemWorksOrder == null || itemWorksOrder == ''))
								{
									woNeeded = true;
									woCount++;
								}
						}
					
					//Do we need to create any works orders?
					//
					if(woNeeded)
						{
							//If there are no more than 30 then we can do them interactively
							//
							if(woCount <= 30)
								{
											
									itemLineCount = salesOrderRecord.getLineItemCount('item');
											
									//Get the customer & the subsidiary
									//
									var salesOrderEntity = salesOrderRecord.getFieldValue('entity');
									var salesOrderSubsidiary = salesOrderRecord.getFieldValue('subsidiary');
											
									//Loop through the items
									//
									for (var int = 1; int <= itemLineCount; int++) 
										{
											var itemType = salesOrderRecord.getLineItemValue('item', 'itemtype', int);
											var itemId = salesOrderRecord.getLineItemValue('item', 'item', int);
											var itemBackorder = Number(salesOrderRecord.getLineItemValue('item', 'quantitybackordered', int));
											var itemWorksOrder = salesOrderRecord.getLineItemValue('item', 'woid', int);
											var itemLine = salesOrderRecord.getLineItemValue('item', 'line', int);
													
											if(itemType == 'Assembly' && itemBackorder > 0 && (itemWorksOrder == null || itemWorksOrder == ''))
												{										
													//Create a works order 
													//
													var worksOrderRecord = nlapiCreateRecord('workorder', {recordmode: 'dynamic'}); //10GU's
				//									worksOrderRecord.setFieldValue('sourcetransactionid', salesOrderId);
				//									worksOrderRecord.setFieldValue('sourcetransactionline', itemLine);
				//									worksOrderRecord.setFieldValue('specialorder', 'T');
													worksOrderRecord.setFieldValue('subsidiary', salesOrderSubsidiary);
													worksOrderRecord.setFieldValue('entity', salesOrderEntity);
													worksOrderRecord.setFieldValue('assemblyitem', itemId);
													worksOrderRecord.setFieldValue('quantity', itemBackorder);
															
													worksOrderRecord.setFieldValue('soid', salesOrderId);
													worksOrderRecord.setFieldValue('soline', itemLine);
													worksOrderRecord.setFieldValue('specord', 'T');
															
													//Save the works order
													//
													try
														{
															var worksOrderId = nlapiSubmitRecord(worksOrderRecord, true, true); //20GU's
														}
													catch(err)
														{
															nlapiLogExecution('ERROR', 'Creating Works Order', err.message);
														}
												}
										}
								}
							else
								{
									//If there are more than 30, then we will need to schedule a script to do it
									//
									var scheduleParams = {custscript_bbs_so_id: salesOrderId};
									nlapiScheduleScript('customscript_bbs_assign_wo_so_sched', null, scheduleParams);
								}
						}
				}
		}
}


