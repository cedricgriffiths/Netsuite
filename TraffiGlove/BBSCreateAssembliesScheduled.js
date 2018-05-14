/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       27 Dec 2017     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function createAssembliesScheduled(type) 
{
	//List of custom fields to copy across
	//
	var customFields = [
						"custitem_bbs_item_app_attrib1",
						"custitem_bbs_item_app_attrib10",
						"custitem_bbs_item_app_attrib11",
						"custitem_bbs_item_app_attrib12",
						"custitem_bbs_item_app_attrib13",
						"custitem_bbs_item_app_attrib14",
						"custitem_bbs_item_app_attrib15",
						"custitem_bbs_item_app_attrib2",
						"custitem_bbs_item_app_attrib3",
						"custitem_bbs_item_app_attrib4",
						"custitem_bbs_item_app_attrib5",
						"custitem_bbs_item_app_attrib6",
						"custitem_bbs_item_app_attrib7",
						"custitem_bbs_item_app_attrib8",
						"custitem_bbs_item_app_attrib9",
						"custitem_bbs_item_attrib1",
						"custitem_bbs_item_attrib10",
						"custitem_bbs_item_attrib11",
						"custitem_bbs_item_attrib12",
						"custitem_bbs_item_attrib13",
						"custitem_bbs_item_attrib14",
						"custitem_bbs_item_attrib15",
						"custitem_bbs_item_attrib2",
						"custitem_bbs_item_attrib3",
						"custitem_bbs_item_attrib4",
						"custitem_bbs_item_attrib5",
						"custitem_bbs_item_attrib6",
						"custitem_bbs_item_attrib7",
						"custitem_bbs_item_attrib8",
						"custitem_bbs_item_attrib9",
						"custitem_bbs_item_back_image_loc",
						"custitem_bbs_item_body_address",
						"custitem_bbs_item_brand",
						"custitem_bbs_item_cert_no",
						"custitem_bbs_item_download_desc",
						"custitem_bbs_item_download_pdf",
						"custitem_bbs_item_front_image_loc",
						"custitem_bbs_item_long_desc",
						"custitem_bbs_item_r1",
						"custitem_bbs_item_r1_body_name",
						"custitem_bbs_item_r1_body_no",
						"custitem_bbs_item_r1_cert_end",
						"custitem_bbs_item_r1_cert_no",
						"custitem_bbs_item_r1_cert_start",
						"custitem_bbs_item_r1_image_loc",
						"custitem_bbs_item_r1_rating",
						"custitem_bbs_item_r2",
						"custitem_bbs_item_r2_body_address",
						"custitem_bbs_item_r2_body_name",
						"custitem_bbs_item_r2_body_no",
						"custitem_bbs_item_r2_cert_end",
						"custitem_bbs_item_r2_cert_start",
						"custitem_bbs_item_r2_image_loc",
						"custitem_bbs_item_r2_rating",
						"custitem_bbs_item_r3",
						"custitem_bbs_item_r3_body_address",
						"custitem_bbs_item_r3_body_name",
						"custitem_bbs_item_r3_body_no",
						"custitem_bbs_item_r3_cert_end",
						"custitem_bbs_item_r3_cert_no",
						"custitem_bbs_item_r3_cert_start",
						"custitem_bbs_item_r3_image_loc",
						"custitem_bbs_item_r3_rating",
						"custitem_bbs_item_r4",
						"custitem_bbs_item_r4_body_address",
						"custitem_bbs_item_r4_body_name",
						"custitem_bbs_item_r4_body_no",
						"custitem_bbs_item_r4_cert_end",
						"custitem_bbs_item_r4_cert_no",
						"custitem_bbs_item_r4_cert_start",
						"custitem_bbs_item_r4_image_loc",
						"custitem_bbs_item_r4_rating",
						"custitem_bbs_item_r5",
						"custitem_bbs_item_r5_body_address",
						"custitem_bbs_item_r5_body_name",
						"custitem_bbs_item_r5_body_no",
						"custitem_bbs_item_r5_cert_end",
						"custitem_bbs_item_r5_cert_no",
						"custitem_bbs_item_r5_cert_start",
						"custitem_bbs_item_r5_image_loc",
						"custitem_bbs_item_r5_rating",
						"custitem_bbs_item_thumbnail",
						"custitem_bbs_item_uom1",
						"custitem_bbs_item_uom1_barcode",
						"custitem_bbs_item_uom1_gross_weight",
						"custitem_bbs_item_uom1_height",
						"custitem_bbs_item_uom1_length",
						"custitem_bbs_item_uom1_nett_weight",
						"custitem_bbs_item_uom1_qty",
						"custitem_bbs_item_uom1_width",
						"custitem_bbs_item_uom2",
						"custitem_bbs_item_uom2_barcode",
						"custitem_bbs_item_uom2_gross_weight",
						"custitem_bbs_item_uom2_height",
						"custitem_bbs_item_uom2_length",
						"custitem_bbs_item_uom2_nett_weight",
						"custitem_bbs_item_uom2_qty",
						"custitem_bbs_item_uom2_vol",
						"custitem_bbs_item_uom2_width",
						"custitem_bbs_item_uom3",
						"custitem_bbs_item_uom3_barcode",
						"custitem_bbs_item_uom3_gross_weight",
						"custitem_bbs_item_uom3_height",
						"custitem_bbs_item_uom3_length",
						"custitem_bbs_item_uom3_qty",
						"custitem_bbs_item_uom3_vol",
						"custitem_bbs_item_uom3_width",
						"custitem_bbs_item_upom1_vol",
						"custitem_bbs_item_upom3_nett_weight",
						"custitem1"
						];

	//Read in the parameter containing the parent child object
	//
	var context = nlapiGetContext();
	var parentChildString = context.getSetting('SCRIPT', 'custscript_bbs_parent_child');
	var customerId = context.getSetting('SCRIPT', 'custscript_bbs_customer_id');
	var finishId = context.getSetting('SCRIPT', 'custscript_bbs_finish_id');
	var finishrefId = context.getSetting('SCRIPT', 'custscript_bbs_finishref_id');

	//Debugging
	//
	//nlapiLogExecution('DEBUG', 'parentChildString', parentChildString);
	//nlapiLogExecution('DEBUG', 'customerId', customerId);
	//nlapiLogExecution('DEBUG', 'finishId', finishId);
	//nlapiLogExecution('DEBUG', 'finishrefId', finishrefId);
	
	//Read the finish ref textual name
	//
	var finishrefText = nlapiLookupField('customlist_bbs_item_finish_ref', finishrefId, 'name');
	
	//Initialise local variables
	//
	var usersEmail = context.getUser();
	var emailText = 'The following items have been created;\n';
	var allChildPricing = {};
	var allChildWebProducts = {};
	var useItemPricing = false;
	var customerPriceLevel = null;
	var customerCurrency = null;
	
	//Re-hydrate the parent & child object
	//
	var parentAndChild = JSON.parse(parentChildString);
	
	//Get the customer record
	//
	var customerRecord = nlapiLoadRecord('customer', customerId);
	
	//Get the finish item record
	//
	var finishRecord = nlapiLoadRecord('assemblyitem', finishId);
	
	//Have we got everything we need so far?
	//
	if (parentAndChild && customerRecord && finishRecord)
		{
			//Loop through all the parent objects
			//
			for ( var parent in parentAndChild) 
				{
					//Read the parent record
					//	
					var parentRecord = nlapiLoadRecord('inventoryitem', parent);
					
					//Get the child items for this parent
					//
					var children = parentAndChild[parent];
					
					//Check to see if we have a parent & it also has children
					//We don't want to create the parent if there are no children to create
					//
					if(parentRecord && children.length > 0)
						{
							//=====================================================================
							//Process the parent record to create a new assembly item parent
							//=====================================================================
							//
						
							//Get data from the customer record
							//
							var customerRef = customerRecord.getFieldValue('entityid');
							var customerSubsidiary = customerRecord.getFieldValue('subsidiary');
							var customerParent = customerRecord.getFieldValue('parent');
							customerPriceLevel = customerRecord.getFieldValue('pricelevel');
							customerCurrency  = customerRecord.getFieldValue('currency');
							
							//If the customer has a parent, or if it does not have a parent, but its price level is the system default one,
							//then use item pricing, otherwise use the pricing level
							//
							if((customerParent != null && customerParent != '') || ((customerParent == null || customerParent == '') && customerPriceLevel == '1' ))
								{
									useItemPricing = true;
								}
							
							//Get data from the subsidiary record
							//
							var subsidiaryReocrd = nlapiLoadRecord('subsidiary', customerSubsidiary);
							var subsidiaryDefaultLocation = subsidiaryReocrd.getFieldValue('custrecord_sw_default_location');
							var subsidiaryDefaultBin = subsidiaryReocrd.getFieldValue('custrecord_sw_default_location_bin');
							
							//Get data from the base parent record
							//
							var parentName = parentRecord.getFieldValue('itemid');
							var parentItemCategory = getCategoryAbbreviation(parentRecord.getFieldValue('custitem_bbs_item_category'));
							var parentItemCategoryId = parentRecord.getFieldValue('custitem_bbs_item_category');
							var newParentName = customerRef + ' ' + parentItemCategory + '-' + parentName;
							var parentSalesDescription = parentRecord.getFieldValue('salesdescription');
							var parentSize2 = parentRecord.getFieldValues('custitem_bbs_item_size2');

							//Get data from the finish item
							//
							var finishItemDescription = finishRecord.getFieldValue('description');
							var newParentDescription = parentSalesDescription + ' with ' + finishItemDescription;
							
							//Initialise the new parent id
							//
							var newParentId = null;
							
							//See if the new parent actually already exists
							//
							var existingParentSearch = nlapiSearchRecord("assemblyitem",null,
									[
									   ["type","anyof","Assembly"], 
									   "AND", 
									   ["name","is",newParentName]
									], 
									[
									   new nlobjSearchColumn("itemid",null,null)
									]
									);
							
							if(existingParentSearch && existingParentSearch.length == 1)
								{
									newParentId = existingParentSearch[0].getId();
									
									var newParentUrl = 'https://system.eu1.netsuite.com' + nlapiResolveURL('RECORD', 'assemblyitem', newParentId, 'view');
									emailText += '\n';
									emailText += 'Existing Assembly Matrix Parent (' + newParentId.toString() + ') - ' + newParentName + ' ' + newParentUrl + '\n';
								}
							else
								{									
									try
										{
											//Instantiate an assembly item record
											//
											var newParentRecord = nlapiCreateRecord('assemblyitem', {recordmode: 'dynamic'});
											
											//Set field values 
											//
											//var template = '{custitem_bbs_item_category}-{itemid}-{custitem_bbs_item_colour}-{custitem_bbs_item_size1}';
											var template = '{itemid}-{custitem_bbs_item_colour}-{custitem_bbs_item_size1}';
											
											if (parentSize2 != '' && parentSize2 != null)
												{
													template += '-{custitem_bbs_item_size2}';
												}
											
											template += ' {custitem_bbs_item_finish_ref}';
											
											newParentRecord.setFieldValue('matrixtype', 'PARENT');
											newParentRecord.setFieldValue('itemid', newParentName);
											newParentRecord.setFieldValue('atpmethod', 'CUMULATIVE_ATP_WITH_LOOK_AHEAD');
											newParentRecord.setFieldValue('autopreferredstocklevel', 'F');
											newParentRecord.setFieldValue('autoreorderpoint', 'F');
											newParentRecord.setFieldValue('costcategory', 4);
											newParentRecord.setFieldValue('costingmethod', 'FIFO');
											newParentRecord.setFieldValue('effectivebomcontrol', 'EFFECTIVE_DATE');
											newParentRecord.setFieldValue('matrixitemnametemplate', template);
											newParentRecord.setFieldValue('unitstype', 1);
											newParentRecord.setFieldValue('saleunit', 1);
											newParentRecord.setFieldValue('stockunit', 1);
											newParentRecord.setFieldValue('subsidiary', customerSubsidiary);
											newParentRecord.setFieldValue('taxschedule', 1);
											newParentRecord.setFieldValue('usebins', 'T');
											newParentRecord.setFieldValue('location', subsidiaryDefaultLocation);
											newParentRecord.setFieldValue('preferredlocation', subsidiaryDefaultLocation);
											newParentRecord.setFieldValue('matchbilltoreceipt', 'T');
											newParentRecord.setFieldValue('custitem_sw_base_parent', parent);
											newParentRecord.setFieldValue('description', newParentDescription);
				
											//Copy in the custom fields
											//
											for (var custFieldCount = 0; custFieldCount < customFields.length; custFieldCount++) 
												{
													try
														{
															newParentRecord.setFieldValue(customFields[custFieldCount], parentRecord.getFieldValue(customFields[custFieldCount]));
														}
													catch(err)
														{
															var msg = err.message;
														}
													
												}
											
											//Add a component to the assembly
											//
											newParentRecord.selectNewLineItem('member');
											newParentRecord.setCurrentLineItemValue('member', 'item', finishId);
											newParentRecord.setCurrentLineItemValue('member', 'quantity', 1);
											newParentRecord.setCurrentLineItemValue('member', 'itemsource', 'PHANTOM');
											newParentRecord.commitLineItem('member', false);
											
											//Add a bin number to the assembly
											//
											newParentRecord.selectNewLineItem('binnumber');
											newParentRecord.setCurrentLineItemValue('binnumber', 'location', subsidiaryDefaultLocation);
											newParentRecord.setCurrentLineItemValue('binnumber', 'binnumber', subsidiaryDefaultBin);
											newParentRecord.setCurrentLineItemValue('binnumber', 'preferredbin', 'T');
											newParentRecord.commitLineItem('binnumber', false);					
											
											//Now save the assembly
											//
											newParentId = nlapiSubmitRecord(newParentRecord, true, true);
											
											//Add info to the email message
											//
											var newParentUrl = 'https://system.eu1.netsuite.com' + nlapiResolveURL('RECORD', 'assemblyitem', newParentId, 'view');
											emailText += '\n';
											emailText += 'Assembly Matrix Parent (' + newParentId.toString() + ') - ' + newParentName + ' ' + newParentUrl + '\n';
										}
									catch(err)
										{
											emailText += 'Error creating assembly parent record (' + newParentName + '), message is "' + err.message +'"\n';
										}
								}
							
							//=====================================================================
							//Process the child items
							//=====================================================================
							//
							
							//Check to see if we have created the new parent ok
							//
							if(newParentId)
								{
									
									//Loop through the child items
									//
									for (var int = 0; int < children.length; int++) 
										{
											var data = children[int];
											
											var child = data[0];
											var salesPrice = data[1];
											var minStock = data[2];
											var maxStock = data[3];
											var webProduct = data[4];
											
											//Read the child record
											//
											var childRecord = nlapiLoadRecord('inventoryitem', child);
											
											//Ok to proceede?
											//
											if(childRecord)
												{
													//Check the remaining governance units available & yield if required
													//
													var execContext = nlapiGetContext();
													var execRemaining = execContext.getRemainingUsage();
													
													if(execRemaining < 100)
														{
															nlapiYieldScript();
														}
													else
														{
															//Get data from the child record
															//
															var childSalesDescription = childRecord.getFieldValue('salesdescription');
															var newChildDescription = childSalesDescription + ' with ' + finishItemDescription;
																
															var childName = childRecord.getFieldValue('itemid');
															var newChildName = customerRef + ' ' + childName + ' ' + finishrefText;
															
															var childColour = childRecord.getFieldValue('custitem_bbs_item_colour');
															var childSize1 = childRecord.getFieldValue('custitem_bbs_item_size1');
															var childSize2 = childRecord.getFieldValue('custitem_bbs_item_size2');
															
															try
																{
																	//Instantiate an assembly item record
																	//
																	var newChildRecord = nlapiCreateRecord('assemblyitem', {recordmode: 'dynamic'});
																	
																	//Set field values 
																	//
																	newChildRecord.setFieldValue('matrixtype', 'CHILD');
																	newChildRecord.setFieldValue('parent', newParentId);
																	newChildRecord.setFieldValue('itemid', newChildName);
																	newChildRecord.setFieldValue('atpmethod', 'CUMULATIVE_ATP_WITH_LOOK_AHEAD');
																	newChildRecord.setFieldValue('autopreferredstocklevel', 'F');
																	newChildRecord.setFieldValue('autoreorderpoint', 'F');
																	newChildRecord.setFieldValue('costcategory', 4);
																	newChildRecord.setFieldValue('costingmethod', 'FIFO');
																	newChildRecord.setFieldValue('effectivebomcontrol', 'EFFECTIVE_DATE');
																	newChildRecord.setFieldValue('unitstype', 1);
																	newChildRecord.setFieldValue('saleunit', 1);
																	newChildRecord.setFieldValue('stockunit', 1);
																	newChildRecord.setFieldValue('subsidiary', customerSubsidiary);
																	newChildRecord.setFieldValue('taxschedule', 1);
																	newChildRecord.setFieldValue('usebins', 'T');
																	newChildRecord.setFieldValue('location', subsidiaryDefaultLocation);
																	newChildRecord.setFieldValue('preferredlocation', subsidiaryDefaultLocation);
																	newChildRecord.setFieldValue('matchbilltoreceipt', 'T');
																	newChildRecord.setFieldValue('custitem_sw_base_parent', parent);
																	newChildRecord.setFieldValue('description', newChildDescription);
																	
																	//Copy in the custom fields
																	//
																	for (var custFieldCount = 0; custFieldCount < customFields.length; custFieldCount++) 
																		{
																			try
																				{
																					newChildRecord.setFieldValue(customFields[custFieldCount], parentRecord.getFieldValue(customFields[custFieldCount]));
																				}
																			catch(err)
																				{
																					var msg = err.message;
																				}
																		}

																	//Do we have min/max stock levels?
																	//
																	if((minStock != null && minStock != '') || (maxStock != null && maxStock != ''))
																		{
																			//This is not a special works order item if we have stock levels
																			//
//No longer required														newChildRecord.setFieldValue('isspecialworkorderitem', 'F');
																			
																			//Also, now set the safety stock & preferred stock levels
																			//
																			var locationCount = newChildRecord.getLineItemCount('locations');
																			
																			//Find the default location in the sublist of locations
																			//
																			for (var int2 = 1; int2 <= locationCount; int2++) 
																				{
																					var locationId = newChildRecord.getLineItemValue('locations', 'location', int2);
																					
																					//Found the matching location
																					//
																					if(locationId == subsidiaryDefaultLocation)
																						{
																							if(minStock != null && minStock != '')
																								{
																									newChildRecord.setLineItemValue('locations', 'reorderpoint', int2, minStock);
																								}
																							
																							if(maxStock != null && maxStock != '')
																								{
																									newChildRecord.setLineItemValue('locations', 'preferredstocklevel', int2, maxStock);
																								}
																						
																							break;
																						}
																				}
																		}
																	else
																		{
//No longer required														newChildRecord.setFieldValue('isspecialworkorderitem', 'T');
																		}
																	
																	newChildRecord.setFieldValue('haschildren', 'F');
																	newChildRecord.setFieldValue('hasparent', 'T');
																	newChildRecord.setFieldValue('includechildren', 'F');
																	newChildRecord.setFieldValue('isphantom', 'F');
																	//newChildRecord.setFieldValue('matrixoptioncustitem_bbs_item_category', parentItemCategoryId);
																	newChildRecord.setFieldValue('matrixoptioncustitem_bbs_item_colour', childColour);
																	newChildRecord.setFieldValue('matrixoptioncustitem_bbs_item_size1', childSize1);
																	newChildRecord.setFieldValue('matrixoptioncustitem_bbs_item_size2', childSize2);
																	newChildRecord.setFieldValue('matrixoptioncustitem_bbs_item_finish_ref', finishrefId);
																	newChildRecord.setFieldValue('custitem_bbs_item_customer', customerId);
																	newChildRecord.setFieldValue('custitem_bbs_item_stock_type', 1);
																	newChildRecord.setFieldValue('custitemfinish_type', finishrefId);
																	newChildRecord.setFieldValue('custitem_bbs_item_finish_type', 1);
						
																	//Add a bin number to the assembly
																	//
																	newChildRecord.selectNewLineItem('binnumber');
																	newChildRecord.setCurrentLineItemValue('binnumber', 'location', subsidiaryDefaultLocation);
																	newChildRecord.setCurrentLineItemValue('binnumber', 'binnumber', subsidiaryDefaultBin);
																	newChildRecord.setCurrentLineItemValue('binnumber', 'preferredbin', 'T');
																	newChildRecord.commitLineItem('binnumber', false);
																	
																	//Add components to the assembly
																	//
																	newChildRecord.selectNewLineItem('member');
																	newChildRecord.setCurrentLineItemValue('member', 'item', child);
																	newChildRecord.setCurrentLineItemValue('member', 'quantity', 1);
																	newChildRecord.setCurrentLineItemValue('member', 'itemsource', 'STOCK');
																	newChildRecord.commitLineItem('member', false);
																	
																	newChildRecord.selectNewLineItem('member');
																	newChildRecord.setCurrentLineItemValue('member', 'item', finishId);
																	newChildRecord.setCurrentLineItemValue('member', 'quantity', 1);
																	newChildRecord.setCurrentLineItemValue('member', 'itemsource', 'PHANTOM');
																	newChildRecord.commitLineItem('member', false);
																	
																	//Use customer's price level if required
																	//
																	if(!useItemPricing)
																		{
																			//Read the price sublist based on the customer's currency code
																			//
																			var priceSublist = 'price' + customerCurrency.toString();
																			
																			var priceLineCount = newChildRecord.getLineItemCount(priceSublist);
																			var quantityLevels = newChildRecord.getMatrixCount(priceSublist, 'price');
																			
																			for (var priceLine = 1; priceLine <= priceLineCount; priceLine++) 
																			{
																				var pricePriceLevel = newChildRecord.getLineItemValue(priceSublist, 'pricelevel', priceLine);
																				
																				if (pricePriceLevel == customerPriceLevel)
																					{
																						newChildRecord.selectLineItem(priceSublist, priceLine);
																						newChildRecord.setCurrentLineItemMatrixValue(priceSublist, 'price', 1, salesPrice);
																						newChildRecord.commitLineItem(priceSublist, false);
																						break;
																					}
																			}
																		}
																	
																	//Calculate the matrix item sequence number
																	//
																	var itemSequence = resequence(newParentId,childColour,childSize1,childSize2);
																	newChildRecord.setFieldValue('custitem_bbs_matrix_item_seq', itemSequence);
																	
																	//Now save the assembly
																	//
																	var newchildId = nlapiSubmitRecord(newChildRecord, true, true);
																	
																	//Add the sales price and the record id to the list of all child item prices
																	//
																	allChildPricing[newchildId] = salesPrice;
																	
																	//Add the child item to the list of web products
																	//
																	if(webProduct == 'T')
																		{
																			allChildWebProducts[newchildId] = newchildId;
																		}
																	
																	//Add info to the email message
																	//
																	var newChildUrl = 'https://system.eu1.netsuite.com' + nlapiResolveURL('RECORD', 'assemblyitem', newchildId, 'view');
																	emailText += 'Assembly Matrix Child (' + newchildId.toString() + ') - ' + newChildName + ' ' + newChildUrl + '\n';
																}
															catch(err)
																{
																	emailText += 'Error creating assembly child record (' + newChildName + '), message is "' + err.message +'"\n';
																}
														}
												}
										}
								}
						}
				}
			
			//Update the customer's item pricing with the new child items created, but only if we are using item pricing
			//
			if(Object.keys(allChildPricing).length > 0 && useItemPricing)
				{
					try
						{
							var customerCurrency = customerRecord.getFieldValue('currency');
						
							for (var childPrice in allChildPricing) 
								{
									customerRecord.selectNewLineItem('itempricing');
									customerRecord.setCurrentLineItemValue('itempricing', 'item', childPrice);
									customerRecord.setCurrentLineItemValue('itempricing', 'level', -1);
									customerRecord.setCurrentLineItemValue('itempricing', 'currency', customerCurrency);
									customerRecord.setCurrentLineItemValue('itempricing', 'price', allChildPricing[childPrice]);
									customerRecord.commitLineItem('itempricing', false);
								}
							
							nlapiSubmitRecord(customerRecord, true, true);
							
							emailText += 'Customer item pricing has been updated\n';
						}
					catch(err)
						{
							emailText += 'Error creating customer item pricing, message is "' + err.message +'"\n';
						}
				}
			
			//Update the customer's web product with the new child items created
			//
			if(Object.keys(allChildWebProducts).length > 0)
				{
					for (var childWebProduct in allChildWebProducts) 
						{
							try
								{
									var webProductRecord = nlapiCreateRecord('customrecord_bbs_customer_web_product');

									webProductRecord.setFieldValue('custrecord_bbs_web_product_customer', customerId);
									webProductRecord.setFieldValue('custrecord_bbs_web_product_item', childWebProduct);
									
									nlapiSubmitRecord(webProductRecord, true, true);
								}
							catch(err)
								{
									emailText += 'Error creating customer web product record, message is "' + err.message +'"\n';
								}
						}
					
					emailText += 'Customer web products have been updated\n';
				}
		}
	
	//Send the email to the user to say that we have finished
	//
	nlapiSendEmail(usersEmail, usersEmail, 'Assembly Creation', emailText);
}


//=====================================================================
//Functions
//=====================================================================
//
function getCategoryAbbreviation(itemCategoryParam)
{
	var abbreviation = '';
	
	var listRecord = nlapiLoadRecord('customlist_bbs_item_category', itemCategoryParam);
	
	if (listRecord)
		{
			abbreviation = listRecord.getFieldValue('abbreviation');
		}
	
	return abbreviation;
}


function resequence(itemParent,itemColour,itemSize1,itemSize2) 
{
	//Local Variables
	//
	var parentSequence = '000000';
	var colourSequence = '000000';
	var size1Sequence = '000000';
	var size2Sequence = '000000';
	var fullSequence = '';
	
	//Set the parent sequence number
	//
	parentSequence = padding_left(itemParent,'0', 6);
	
	//Set the colour sequence number
	//
	if(itemColour != null && itemColour != '')
		{
			var filterArray = [["custrecord_bbs_colour_colour","anyof",itemColour]];
			
			var searchResultSet = nlapiSearchRecord("customrecord_bbs_item_colour_seq", null, filterArray, 
					[
					   new nlobjSearchColumn("custrecord_bbs_colour_sequence",null,null)
					]
					);
			
			if(searchResultSet)
				{
					var sequence = searchResultSet[0].getValue('custrecord_bbs_colour_sequence');
					
					if(sequence)
						{
						colourSequence = padding_left(sequence,'0', 6);
						}
				}
		}
	
	//Set the size 1 sequence number
	//
	if(itemSize1 != null && itemSize1 != '')
		{
			var filterArray = [["custrecord_bbs_item_size1_size","anyof",itemSize1]];
			
			var searchResultSet = nlapiSearchRecord("customrecord_bbs_item_size1_seq", null, filterArray, 
					[
					   new nlobjSearchColumn("custrecord_bbs_item_size1_seq",null,null)
					]
					);
			
			if(searchResultSet)
				{
					var sequence = searchResultSet[0].getValue('custrecord_bbs_item_size1_seq');
					
					if(sequence)
						{
						size1Sequence = padding_left(sequence,'0', 6);
						}
				}
		}
	
	//Set the size 2 sequence number
	//
	if(itemSize2 != null && itemSize2 != '')
		{
			var filterArray = [["custrecord_bbs_item_size2_size","anyof",itemSize2]];
			
			var searchResultSet = nlapiSearchRecord("customrecord_bbs_item_size2_seq", null, filterArray, 
					[
					   new nlobjSearchColumn("custrecord_bbs_item_size2_seq",null,null)
					]
					);
			
			if(searchResultSet)
				{
					var sequence = searchResultSet[0].getValue('custrecord_bbs_item_size2_seq');
					
					if(sequence)
						{
						size2Sequence = padding_left(sequence,'0', 6);
						}
				}
		}
	
	
	//Set the full sequence number
	//
	fullSequence = parentSequence + colourSequence + size1Sequence + size2Sequence;

	return fullSequence;
}


//left padding s with c to a total of n chars
//
function padding_left(s, c, n) 
{
	if (! s || ! c || s.length >= n) 
	{
		return s;
	}
	
	var max = (n - s.length)/c.length;
	
	for (var i = 0; i < max; i++) 
	{
		s = c + s;
	}
	
	return s;
}


