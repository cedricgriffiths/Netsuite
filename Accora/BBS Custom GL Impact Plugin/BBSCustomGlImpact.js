/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       19 Apr 2018     cedricgriffiths
 *
 */
function customizeGlImpact(transactionRecord, standardLines, customLines, book)
{
	//Get the source record type & id
	//
	var rectype = transactionRecord.getRecordType();
	var recid   = transactionRecord.getId();
	var configs = {};
	
	//Get the configuration records
	//
	var customrecord_bbs_custom_gl_configSearch = nlapiSearchRecord("customrecord_bbs_custom_gl_config",null,
			[
			], 
			[
			   new nlobjSearchColumn("name").setSort(false), 
			   new nlobjSearchColumn("custrecord_bbs_custom_gl_to_acc"), 
			   new nlobjSearchColumn("custrecord_bbs_custom_gl_from_acc"), 
			   new nlobjSearchColumn("custrecord_bbs_custom_gl_disc_item"),
			   new nlobjSearchColumn("custrecord_bbs_custom_gl_ship_charge")
			]
			);
	
	//Procede if we have a config
	//
	if(customrecord_bbs_custom_gl_configSearch)
		{
			//Make sure we have something from the search
			//
			if(customrecord_bbs_custom_gl_configSearch.length > 0)
				{
					for (var int = 0; int < customrecord_bbs_custom_gl_configSearch.length; int++) 
						{
							//Get the config values
							//
							var configShippingId = customrecord_bbs_custom_gl_configSearch[int].getValue('custrecord_bbs_custom_gl_ship_charge');
							var configDiscountId = customrecord_bbs_custom_gl_configSearch[int].getValue('custrecord_bbs_custom_gl_disc_item');
							var configFromAccId = customrecord_bbs_custom_gl_configSearch[int].getValue('custrecord_bbs_custom_gl_from_acc');
							var configToAccId = customrecord_bbs_custom_gl_configSearch[int].getValue('custrecord_bbs_custom_gl_to_acc');
							
							configs[configDiscountId] = [configShippingId,configFromAccId,configToAccId];
						}
					
					//Where was the item fulfilment created from 
					//
					var createdfrom = transactionRecord.getFieldValue('createdfrom');
					
					if(createdfrom != null && createdfrom != '')
						{
							//Get the count of standard lines
							//
							var linecount = standardLines.getCount();
							
							//Loop round the lines
							//
							if(linecount > 0)
								{
									//Load the sales order record & get the count of lines
									//
									var soRecord = null;
									
									try
										{
											soRecord = nlapiLoadRecord('salesorder', createdfrom);
										}
									catch(err)
										{
											soRecord = null;
										}
									
									if(soRecord != null)
										{
											var lines = soRecord.getLineItemCount('item');
											var soDiscount = soRecord.getFieldValue('discountitem');
											
											//Only procede if the sale order has the correct discount on it
											//
											if(configs[soDiscount])
												{
													var configDiscountId = soDiscount;
													var configShippingId = configs[soDiscount][0];
													var configFromAccId = configs[soDiscount][1];
													var configToAccId = configs[soDiscount][2];
													
													var shippingCost = Number(0);
													
													//Find the shipping cost on the sales order lines
													//
													for (var int = 1; int <= lines; int++) 
														{
															var itemType = soRecord.getLineItemValue('item', 'itemtype', int);
															var itemId = soRecord.getLineItemValue('item', 'item', int);
														
															if(itemType == 'OthCharge' && itemId == configShippingId)
																{
																	shippingCost = Number(soRecord.getLineItemValue('item', 'amount', int));
																}
														}
													
													//See if shipping cost is actually on the fulfilment record
													//
													var fulfilmentLines = transactionRecord.getLineItemCount('item');
													var fulfilmentHasShipping = false;
													
													for (var fulfilmentLine = 1; fulfilmentLine <= fulfilmentLines; fulfilmentLine++) 
														{
															var fulfilmentItemType = transactionRecord.getLineItemValue('item', 'itemtype', fulfilmentLine);
															var fulfilmentItemId = transactionRecord.getLineItemValue('item', 'item', fulfilmentLine);
														
															if(fulfilmentItemType == 'OthCharge' && fulfilmentItemId == configShippingId)
																{
																	fulfilmentHasShipping = true;
																}
														}
													
													//If the fulfillment does not have a shipping charge on it, then we zero the value
													//
													if(!fulfilmentHasShipping)
														{
															shippingCost = Number(0);
														}
													
													//Loop through the standard GL lines
													//
													var shippingDone = false;
													
													for (var i=0; i<linecount; i++) 
														{
															//Get the line object
															//
															var line =  standardLines.getLine(i);
															
															//Ignore the summary line or any non-posting lines
															//
															if(line.isPosting() && line.getId() != 0)
																{
																	var account = line.getAccountId();
																	var debit = Number(line.getDebitAmount());
																	var location = line.getLocationId();
																	var classId = line.getClassId();
																	var departmentId = line.getDepartmentId();
																	var customSegId = line.getSegmentValueId('cseg_bbs_sector_uk');
																	
																	//Find the relevant posting line by looking at the account id
																	//
																	if(account == configFromAccId)
																		{
																			//Add new posting lines here
																			//
																			if(debit != 0)
																				{
																					var newLine = customLines.addNewLine();
																					newLine.setAccountId(parseInt(configFromAccId));
																					newLine.setCreditAmount(debit);
																					newLine.setMemo('Cost Of Warranty');
																					newLine.setLocationId(location);
																					newLine.setClassId(classId);
																					newLine.setDepartmentId(departmentId);
																					newLine.setSegmentValueId('cseg_bbs_sector_uk', customSegId);
																					
																					var newLine = customLines.addNewLine();
																					newLine.setAccountId(parseInt(configToAccId));
																					newLine.setDebitAmount(debit);
																					newLine.setMemo('Cost Of Warranty');
																					newLine.setLocationId(location);
																					newLine.setClassId(classId);
																					newLine.setDepartmentId(departmentId);
																					newLine.setSegmentValueId('cseg_bbs_sector_uk', customSegId);
																				}
																			
																			//Add shipping posting lines here
																			//
																			if(!shippingDone && shippingCost != 0)
																				{
																					shippingDone = true;
																				
																					var newLine = customLines.addNewLine();
																					newLine.setAccountId(parseInt(configFromAccId));
																					newLine.setCreditAmount(shippingCost);
																					newLine.setMemo('Warranty Shipping');
																					newLine.setLocationId(location);
																					newLine.setClassId(classId);
																					newLine.setDepartmentId(departmentId);
																					newLine.setSegmentValueId('cseg_bbs_sector_uk', customSegId);
																					
																					var newLine = customLines.addNewLine();
																					newLine.setAccountId(parseInt(configToAccId));
																					newLine.setDebitAmount(shippingCost);
																					newLine.setMemo('Warranty Shipping');
																					newLine.setLocationId(location);
																					newLine.setClassId(classId);
																					newLine.setDepartmentId(departmentId);
																					newLine.setSegmentValueId('cseg_bbs_sector_uk', customSegId);
																				}
																		}
																}
														}
												}
										}
								}
						}
				}
		}
}