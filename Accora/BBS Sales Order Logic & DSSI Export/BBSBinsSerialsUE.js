/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       30 Oct 2017     cedricgriffiths
 *
 */


function serialNumbersAS(type)
{
	if(type == 'create' || type == 'edit')
		{
			var newRecord = nlapiGetNewRecord();
			var newId = newRecord.getId();
			var newType = newRecord.getRecordType();
			var thisRecord = null;
			
			try
				{
					thisRecord = nlapiLoadRecord(newType, newId);
				}
			catch(err)
				{
					thisRecord = null;
				}
			
			if(thisRecord)
				{
					var count = thisRecord.getLineItemCount('item');
					var salesOrderId = thisRecord.getFieldValue('createdfrom');
					var thisRecordUpdated = false;
					
					for (var int = 1; int <= count; int++) 
						{
							var serials = "";
							var itemOrderLine = thisRecord.getLineItemValue('item', 'orderline', int);
							var rec = thisRecord.viewLineItemSubrecord('item', 'inventorydetail', int);
							var serialCount = Number(0);   
							
							if (rec)
								{
									var invcount = rec.getLineItemCount('inventoryassignment');  
									
									  for(var x = 1; x <=invcount ; x++) 
										  {
											  var serialNumber = rec.getLineItemText('inventoryassignment', 'issueinventorynumber', x);
											  
											  if(serialNumber != null && serialNumber != '')
												  {
													  if(serialCount > 0)
														  {
															  serials += ',';
														  }
													  
													  serials += serialNumber;
													  serialCount++;
												  }
										  }
								}
							
							if(serialCount > 0)
								{
									thisRecord.setLineItemValue('item', 'custcol_serial_numbers_udi', int, serials);
									thisRecordUpdated = true;
									
									//Update the sales order with the serial numbers
									//
									var salesOrderRecord = null;
									
									try
										{
											salesOrderRecord = nlapiLoadRecord('salesorder', salesOrderId);
										}
									catch(err)
										{
											salesOrderRecord = null;
										}
									
									if(salesOrderRecord != null)
										{
											var soLines = salesOrderRecord.getLineItemCount('item');
											
											for (var int2 = 1; int2 <= soLines; int2++) 
												{
													var soLineNo = salesOrderRecord.getLineItemValue('item', 'line', int2);
													
													if(soLineNo == itemOrderLine)
														{
															salesOrderRecord.setLineItemValue('item', 'custcol_serial_numbers_udi', int2, serials);
															
															try
																{
																	nlapiSubmitRecord(salesOrderRecord, false, true);
																}
															catch(err)
																{
																	nlapiLogExecution('ERROR', 'Error saving sales order', err.message);
																}
															
															break;
														}
												}
										}
								}
						}
					
					if(thisRecordUpdated)
						{
							nlapiSubmitRecord(thisRecord, false, true);
						}
				}
		}
}	

