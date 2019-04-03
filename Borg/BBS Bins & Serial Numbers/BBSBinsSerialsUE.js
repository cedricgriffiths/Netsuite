/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       30 Oct 2017     cedricgriffiths
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
function binsSerialNumbersBS(type)
{
	var count = nlapiGetLineItemCount('item');
	 
	for(var i=1; i <= count; i++ ) 
	{
		var bins = "";
		var serials = "";
		
		nlapiSelectLineItem('item', i);
		
		var rec = nlapiViewLineItemSubrecord('item', 'inventorydetail',i);
		
		if (rec)
			{
				var invcount = rec.getLineItemCount('inventoryassignment');  
				 
				  for(var x = 1; x <=invcount ; x++) 
				  {
					  rec.selectLineItem('inventoryassignment', x);
				    
					  var binID = rec.getCurrentLineItemText('inventoryassignment', 'binnumber');
					  var quantity = rec.getCurrentLineItemValue('inventoryassignment', 'quantity');
					  var serialNumber = rec.getCurrentLineItemText('inventoryassignment', 'issueinventorynumber');
					  
					  if(x>1)
					  {
						  bins += '\n';
						  serials += '\n';
					  }
					  
					  bins += binID + ' (' + quantity + ')';
					  serials += serialNumber;
				  }
			}
		  nlapiSetCurrentLineItemValue('item', 'custcol_bbs_if_bin_no', bins);  
		  nlapiSetCurrentLineItemValue('item', 'custcol_bbs_if_serial_no', serials);  
		  
		  nlapiCommitLineItem('item');
	}
	 
}

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
											  
											  if(x>1)
												  {
													  serials += '\n';
												  }
											  
											  serials += serialNumber;
											  serialCount++;
										  }
								}
							
							
							if(serialCount > 0)
								{
									thisRecord.setLineItemValue('item', 'custcol_bbs_if_serial_no', int, serials);
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
															salesOrderRecord.setLineItemValue('item', 'custcol_bbs_if_serial_no', int2, serials);
															
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

