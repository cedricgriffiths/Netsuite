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

	//Read in the parameter containing the parent child object
	//
	var context = nlapiGetContext();
	var parentChildString = context.getSetting('SCRIPT', 'custscript_bbs_parent_child');
	var customerId = context.getSetting('SCRIPT', 'custscript_bbs_customer_id');
	var finishId = context.getSetting('SCRIPT', 'custscript_bbs_finish_id');
	var finishrefId = context.getSetting('SCRIPT', 'custscript_bbs_finishref_id');
	
	
	//nlapiLogExecution('DEBUG', 'Parent And Child Object', parentChildString);
	//nlapiLogExecution('DEBUG', 'Customer Id', customerId);
	//nlapiLogExecution('DEBUG', 'Finish Id', finishId);
	//nlapiLogExecution('DEBUG', 'Finishref Id', finishrefId);
	
	var finishrefText = nlapiLookupField('customlist_bbs_item_finish_ref', finishrefId, 'name');
	var usersEmail = context.getUser();
	var emailText = 'The following items have been created;';
	
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
					
					if(parentRecord)
						{
							//=====================================================================
							//Process the parent record to create a new assembly item parent
							//=====================================================================
							//
						
							//Get data from the customer record
							//
							var customerRef = customerRecord.getFieldValue('entityid');
							var customerSubsidiary = customerRecord.getFieldValue('subsidiary');
						
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
							
							//Instantiate an assembly item record
							//
							var newParentRecord = nlapiCreateRecord('assemblyitem', {recordmode: 'dynamic'});
							
							//Set field values 
							//
							var template = '{custitem_bbs_item_category}-{itemid}-{custitem_bbs_item_colour}-{custitem_bbs_item_size1}';
							
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
							newParentRecord.setFieldValue('matchbilltoreceipt', 'T');
							newParentRecord.setFieldValue('custitem_sw_base_parent', parent);
							newParentRecord.setFieldValue('description', newParentDescription);

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
							newParentRecord.setCurrentLineItemValue('binnumber', 'binnumber', subsidiaryDefaultBin);
							newParentRecord.setCurrentLineItemValue('binnumber', 'preferredbin', 'T');
							newParentRecord.commitLineItem('binnumber', false);					
							
							//Now save the assembly
							//
							var newParentId = nlapiSubmitRecord(newParentRecord, true, true);
							
							emailText += '\n';
							emailText += 'Assembly Matrix Parent (' + newParentId.toString() + ') - ' + newParentName + '\n';
							
							
							//=====================================================================
							//Process the child items
							//=====================================================================
							//
										
							//Get the child items for this parent
							//
							var children = parentAndChild[parent];
							
							//Loop through the child items
							//
							for (var int = 0; int < children.length; int++) 
								{
									var child = children[int];
									
									//Read the child record
									//
									var childRecord = nlapiLoadRecord('inventoryitem', child);
									
									//Ok to proceede?
									//
									if(childRecord)
										{
											//Get data from the child record
											//
											var childSalesDescription = childRecord.getFieldValue('salesdescription');
											var newChildDescription = childSalesDescription + ' with ' + finishItemDescription;
												
											var childName = childRecord.getFieldValue('itemid');
											var newChildName = parentItemCategory + '-' + customerRef + ' ' + childName + ' ' + finishrefText;
											
											var childColour = childRecord.getFieldValue('custitem_bbs_item_colour');
											var childSize1 = childRecord.getFieldValue('custitem_bbs_item_size1');
											var childSize2 = childRecord.getFieldValue('custitem_bbs_item_size2');
											
											
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
											newChildRecord.setFieldValue('matchbilltoreceipt', 'T');
											newChildRecord.setFieldValue('custitem_sw_base_parent', parent);
											newChildRecord.setFieldValue('description', newChildDescription);
											newChildRecord.setFieldValue('isspecialworkorderitem', 'T');
											newChildRecord.setFieldValue('haschildren', 'F');
											newChildRecord.setFieldValue('hasparent', 'T');
											newChildRecord.setFieldValue('includechildren', 'F');
											newChildRecord.setFieldValue('isphantom', 'F');
											newChildRecord.setFieldValue('matrixoptioncustitem_bbs_item_category', parentItemCategoryId);
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
											
											
											//Now save the assembly
											//
											var newchildId = nlapiSubmitRecord(newChildRecord, true, true);
											
											emailText += 'Assembly Matrix Child (' + newchildId.toString() + ') - ' + newChildName + '\n';
											
										}
								}
						}
				}
		}
	
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


