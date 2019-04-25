/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       07 Mar 2019     cedricgriffiths
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
function taskItemAS(type)
{
	if(type == 'edit')
		{
			var now = new Date();
			var nowString = nlapiDateToString(now);
			var errorText = '';
			var errorOccured = false;
			
			var compPrefs = nlapiLoadConfiguration('companypreferences');
			var defaultComponent = compPrefs.getFieldValue('custscript_bbs_default_component');
			
			//Get old & new records
			//
			var oldRecord = nlapiGetOldRecord();
			var newRecord = nlapiGetNewRecord();
			var newRecordId = newRecord.getId();
			
			//Get old & new item task status
			//
			var oldStatus = oldRecord.getFieldValue('custevent_bbs_task_item_stage');
			var newStatus = newRecord.getFieldValue('custevent_bbs_task_item_stage');
			
			//See if the status has changed
			//
			if(oldStatus != '5' && newStatus == '5')	//5=Awaiting Item Creation
				{
					//Get field data from task
					//
					var itemName = newRecord.getFieldValue('custevent_bbs_task_item_number');
					var itemType = newRecord.getFieldValue('custevent_bbs_task_item_type');
					var itemSerial = newRecord.getFieldValue('custevent_bbs_task_item_serial');
					var itemLotNumber = newRecord.getFieldValue('custevent_bbs_task_item_lotnum');
					var itemMaterial = newRecord.getFieldValue('custevent_bbs_task_item_material');
					var itemDescription = newRecord.getFieldValue('custevent_bbs_task_item_display_name');
					var itemTechDesc = newRecord.getFieldValue('custevent_bbs_task_item_tech_desc');
					var itemManufacturer = newRecord.getFieldValue('custevent_bbs_task_manufacturer');
					var itemManPartNo = newRecord.getFieldValue('custevent_bbs_task_manuf_part_number');
					var itemWeight = newRecord.getFieldValue('custevent_bbs_task_item_weight');
					var itemInitialRevision = newRecord.getFieldValue('custevent_bbs_task_item_revision');
					var itemInspectionReq = newRecord.getFieldValue('custevent_bbs_task_inspection_reqd');
					var itemUnitType = newRecord.getFieldValue('custevent_bbs_task_units_type');
					var itemStockUnits = newRecord.getFieldValue('custevent_bbs_task_units_stock');
					var itemSalesUnit = newRecord.getFieldValue('custevent_bbs_task_units_sales');
					var itemPurchaseUnit = newRecord.getFieldValue('custevent_bbs_task_units_purchase');
					var itemPurchaseDescription = newRecord.getFieldValue('custevent_bbs_task_purch_description');
					var itemPrefSupplier = newRecord.getFieldValue('custevent_bbs_task_preferred_supplier');
					var itemCurrency = newRecord.getFieldValue('custevent_bbs_task_purch_currency');
					var itemPurchasePrice = newRecord.getFieldValue('custevent_bbs_task_purchase_price');
					var itemLeadTime = newRecord.getFieldValue('custevent_bbs_task_purch_lead_time');
					var itemReorderPoint = newRecord.getFieldValue('custevent_bbs_task_reorder_point');
					var itemSafetyStock = newRecord.getFieldValue('custevent_bbs_task_safety_stock');
					var itemUseBins = newRecord.getFieldValue('custevent_bbs_task_use_bins');
					var itemAbcClass = newRecord.getFieldValue('custevent_bbs_task_item_abc_class');
					var itemRoundUpQty = newRecord.getFieldValue('custevent_bbs_task_round_up_qty');
					var itemCostingMethod = newRecord.getFieldValue('custevent_bbs_task_costing_method');
					var itemCogsAccount = newRecord.getFieldValue('custevent_bbs_task_account_cogs');
					var itemAssetAccount = newRecord.getFieldValue('custevent_bbs_task_account_asset');
					var itemPurchaseTaxCode = newRecord.getFieldValue('custevent_bbs_task_purch_tax_code');
					var itemSalesTaxCode = newRecord.getFieldValue('custevent_bbs_task_sales_tax_code');
					var itemPurchasePriceVariance = newRecord.getFieldValue('custevent_bbs_task_account_ppv');
					
					//See if this part number already exists
					//
					var itemSearch = nlapiSearchRecord("item",null,
							[
							   ["name","is",itemName]
							], 
							[
							   new nlobjSearchColumn("itemid").setSort(false), 
							]
							);
					
					if(itemSearch != null && itemSearch.length > 0)
						{
							errorText += ('An item with the part number (' + itemName + ') already exists, new part not created!\n');
						}
					else
						{
							//Start by creating the basic record type
							//
							var itemRecord = null;
							
							switch(itemType)
								{
									case '1':	//Assembly
										if(itemSerial == 'T')
										{
											itemRecord = nlapiCreateRecord('serializedassemblyitem', {recordmode: 'dynamic'});
										}
									else
										{
											if(itemLotNumber == 'T')
												{
													itemRecord = nlapiCreateRecord('lotnumberedassemblyitem', {recordmode: 'dynamic'});
												}
											else
												{
													itemRecord = nlapiCreateRecord('assemblyitem', {recordmode: 'dynamic'});
												}
										}
										
									break;
								
									case '2':	//Inventory Item
										
										if(itemSerial == 'T')
											{
												itemRecord = nlapiCreateRecord('serializedinventoryitem', {recordmode: 'dynamic'});
											}
										else
											{
												if(itemLotNumber == 'T')
													{
														itemRecord = nlapiCreateRecord('lotnumberedinventoryitem', {recordmode: 'dynamic'});
													}
												else
													{
														itemRecord = nlapiCreateRecord('inventoryitem', {recordmode: 'dynamic'});
													}
											}
										
										break;
								
									case '3':	//Non-Inventory Item
										itemRecord = nlapiCreateRecord('noninventoryitem', {recordmode: 'dynamic'});
										
										break;
								}
						
							//Ok to procede with item creation
							//
							if(itemRecord != null)
								{
									//Set field values
									//
									itemRecord.setFieldValue('itemid', itemName);
									itemRecord.setFieldValue('custitem_bbs_item_material', itemMaterial);
									itemRecord.setFieldValue('salesdescription', itemDescription);
									itemRecord.setFieldValue('displayname', itemDescription);
									itemRecord.setFieldValue('custitem_bbs_item_technical_desc', itemTechDesc);
									itemRecord.setFieldValue('manufacturer', itemManufacturer);
									itemRecord.setFieldValue('mpn', itemManPartNo);
									itemRecord.setFieldValue('weight', itemWeight);
									itemRecord.setFieldValue('weightunit', '3');	//Kg
									itemRecord.setFieldValue('custitem_bbs_item_inspection_yn', itemInspectionReq);
									itemRecord.setFieldValue('unitstype', itemUnitType);
									itemRecord.setFieldValue('stockunit', itemStockUnits);
									itemRecord.setFieldValue('saleunit', itemSalesUnit);
									itemRecord.setFieldValue('purchaseunit', itemPurchaseUnit);
									itemRecord.setFieldValue('purchasedescription', itemPurchaseDescription);
									itemRecord.setFieldValue('cost', itemPurchasePrice);
									itemRecord.setFieldValue('autoleadtime', 'F');
									itemRecord.setFieldValue('autoreorderpoint', 'F');
									itemRecord.setFieldValue('usebins', itemUseBins);
									itemRecord.setFieldValue('roundupascomponent', itemRoundUpQty);
									itemRecord.setFieldValue('cogsaccount', itemCogsAccount);
									itemRecord.setFieldValue('assetaccount', itemAssetAccount);
									itemRecord.setFieldValue('purchasetaxcode', itemPurchaseTaxCode);
									itemRecord.setFieldValue('salestaxcode', itemSalesTaxCode);
									itemRecord.setFieldValue('atpmethod', 'CUMULATIVE_ATP_WITH_LOOK_AHEAD');
									itemRecord.setFieldValue('purchasepricevarianceacct', itemPurchasePriceVariance);
									
									switch(itemCostingMethod)
										{
											case '1':
												itemRecord.setFieldValue('costingmethod', 'AVG');
												break;
										
											case '2':
												itemRecord.setFieldValue('costingmethod', 'FIFO');
												break;
										
											case '3':
												itemRecord.setFieldValue('costingmethod', 'STANDARD');
												break;
										
											default:
												itemRecord.setFieldValue('costingmethod', 'STANDARD');
												break;
										}
									
																											
									//Supplier sublist
									//
									try
										{
											itemRecord.selectNewLineItem('itemvendor');
											itemRecord.setCurrentLineItemValue('itemvendor', 'vendor', itemPrefSupplier);
											//itemRecord.setCurrentLineItemValue('itemvendor', 'vendorcurrencyid', itemCurrency);
											//itemRecord.setCurrentLineItemValue('itemvendor', 'itemvendorprice', itemPurchasePrice);
											itemRecord.setCurrentLineItemValue('itemvendor', 'preferredvendor', 'T');
											itemRecord.commitLineItem('itemvendor', false);
										}
									catch(err)
										{
											nlapiLogExecution('ERROR', 'Error assigning supplier to item', err.message);
											errorText += ('Error assigning supplier to item ' + err.message + '\n');
											errorOccured = true;
										}
										
									if(!errorOccured)
										{
											//Location sublist - but not for non-inventory items
											//
											if(itemType != '3')
												{
													var locations = itemRecord.getLineItemCount('locations');
													
													for (var int = 1; int <= locations; int++) 
														{
															var locationId = itemRecord.getLineItemValue('locations', 'location', int);
															
															if(locationId == '1')
																{
																	itemRecord.setLineItemValue('locations', 'reorderpoint', int, itemReorderPoint);
																	itemRecord.setLineItemValue('locations', 'leadtime', int, itemLeadTime);
																	itemRecord.setLineItemValue('locations', 'safetystocklevel', int, itemSafetyStock);
																	itemRecord.setLineItemValue('locations', 'invtclassification', int, itemAbcClass);
																	
																	break;
																}
														}
												}
										
											//Component sublist - but only for assemblies
											//
											if(itemType == '3')
												{
													itemRecord.selectNewLineItem('member');
													itemRecord.setCurrentLineItemValue('member', 'item', defaultComponent);
													itemRecord.setCurrentLineItemValue('member', 'quantity', 1);
													itemRecord.setCurrentLineItemValue('member', 'itemsource', 'STOCK');
													itemRecord.commitLineItem('member', false);
												}		
											
											//Save the item record
											//
											var itemId = null;
											
											try
												{
													itemId = nlapiSubmitRecord(itemRecord, true, true);
												}
											catch(err)
												{
													nlapiLogExecution('ERROR', 'Error creating item', err.message);
													errorText += ('Error creating item ' + err.message + '\n');
												}
										
											
											
											if(itemId != null)
												{
													//Create a revisions record
													//
													var revisionRecord = null;
													
													revisionRecord = nlapiCreateRecord('customrecord_bbs_item_revision');
													revisionRecord.setFieldValue('name', itemInitialRevision);
													revisionRecord.setFieldValue('custrecord_bbs_item_revision_item', itemId);
													revisionRecord.setFieldValue('custrecord_bbs_item_revision_status', '3');	//Pending
													
													try
														{
															nlapiSubmitRecord(revisionRecord, false, true);
														}
													catch(err)
														{
															nlapiLogExecution('ERROR', 'Error creating revision record', err.message);
															errorText += ('Error creating revision record ' + err.message + '\n');
														}
												
													//Finally update the task to say we have finished, if we created the item ok
													//
													var fieldIds = ['status','custevent_bbs_task_item_stage','completeddate'];
													var fieldValues = ['COMPLETE','6',nowString];
													
													try
														{
															nlapiSubmitField('task', newRecordId, fieldIds, fieldValues, false);
														}
													catch(err)
														{
															nlapiLogExecution('ERROR', 'Error updating item task', err.message);
														}
												}
										}
								}
						}
					
					//Add the error message to the message text on the task, so we can see why it failed
					//
					if(errorText != '')
						{
							try
								{
									nlapiSubmitField('task', newRecordId, 'custevent_bbs_task_item_error', errorText, false);
									nlapiSubmitField('task', newRecordId, 'custevent_bbs_task_item_stage', '4', false); //Set status to Review: Engineering
								}
							catch(err)
								{
									nlapiLogExecution('ERROR', 'Error updating item task', err.message);
								}
						}	
				}
		}
}
