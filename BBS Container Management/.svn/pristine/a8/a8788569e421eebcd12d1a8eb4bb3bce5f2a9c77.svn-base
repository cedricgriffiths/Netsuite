/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       17 Feb 2017     cedricgriffiths
 *
 */


/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */

function allocatePOSuitelet(request, response){

	if (request.getMethod() == 'GET') {
		
		//Get the consignment id from the parameter list
		//
		var paramConsId = request.getParameter('consignmentid');
		var paramSupplier = request.getParameter('supplierid');
		var paramStage = Number(request.getParameter('stage'));
		var paramPoNo = Number(request.getParameter('pono'));
		
		switch(paramStage)
			{
				case 0:
					//Find all consignments that are at a stage of open
					//
					
					//Create a form
					//
					var form = nlapiCreateForm('Assign Purchase Orders to Consignment ');
					
					// Set the client side script to be used with this form
					//
					form.setScript('customscript_bbs_allocate_po_client');
					
					//Save the stage number
					//
					var stageField = form.addField('custpage_stage', 'integer', 'stage');
					stageField.setDisplayType('hidden');
					stageField.setDefaultValue(paramStage);
					
					//Add a tab and a sublist
					//
					var tab1 = form.addTab('custpage_tab1', 'Consignment Records');
					var list1 = form.addSubList('custpage_sublist1', 'list', 'Consignment Records Available to Allocate To', 'custpage_tab1');
					
					list1.setLabel('Consignment Records Available to Allocate To');
					
					var listSelect = list1.addField('custpage_col1', 'checkbox', 'Select', null);
					var listConRef = list1.addField('custpage_col2', 'text', 'Id', null);
					var listConName = list1.addField('custpage_col3', 'text', 'Shipment Reference', null);
					var listConNum = list1.addField('custpage_col4', 'text', 'Container Number', null);
					var listConId = list1.addField('custpage_col5', 'text', 'Int Id', null);
					listConId.setDisplayType('hidden');
					
					// Add a submit button
					//
					form.addSubmitButton('Allocate To Consignment');
	
					//Populate the po list based on the search criteria
					//
					libFindConsignments(list1);
					
					//Write the response
					//
					response.writePage(form);
					
					break;
					
				case 1:
					//Allocate P/O's to the consignment
					//
					
					//Only carry on if we do have a consignment id
					//
					if (paramConsId)
						{
							//Read the consignment to get the description
							//
							var consRecord = nlapiLoadRecord('customrecord_bbs_consignment', paramConsId);
							var consName = consRecord.getFieldValue('name');
						
							// Create a form
							//
							var form = nlapiCreateForm('Assign Purchase Orders to Consignment ' + consName);
							
							// Set the client side script to be used with this form
							//
							form.setScript('customscript_bbs_allocate_po_client');
							
							//Save the stage number
							//
							var stageField = form.addField('custpage_stage', 'integer', 'stage');
							stageField.setDisplayType('hidden');
							stageField.setDefaultValue(paramStage);
							
							var fieldGroup1 = form.addFieldGroup('custpage_grp1', 'Filter Criteria');
							
							//Add some fields that will control the PO search
							//
							var field1 = form.addField('custpage_field1', 'select', 'Supplier', null,'custpage_grp1');
							var field2 = form.addField('custpage_field2', 'select', 'Purchase Order No', null, 'custpage_grp1');
							//var field3 = form.addField('custpage_field3', 'text', 'Field 3', null, 'custpage_grp1');
							
							if (paramSupplier)
								{
									field1.setDefaultValue(paramSupplier);
									nlapiSetFieldValue('custpage_field1', paramSupplier, true, true);
								}
						
							if (paramPoNo)
								{	
									field2.setDefaultValue(paramPoNo);
									nlapiSetFieldValue('custpage_field2', paramPoNo, true, true);
								}
							
							//Save the consignment id in a field on the form, but hide it
							//
							var fieldConsignment = form.addField('custpage_consignment', 'text', 'Consignment');
							fieldConsignment.setDefaultValue(paramConsId.toString());
							
							fieldConsignment.setDisplayType('hidden');
							
							//Add a tab and a sublist
							//
							var tab1 = form.addTab('custpage_tab1', 'Purchase Orders');
							var list1 = form.addSubList('custpage_sublist1', 'list', 'Purchase Orders Available For Allocation', 'custpage_tab1');
							
							list1.setLabel('Purchase Orders Available For Allocation');
					
							var listSelect =list1.addField('custpage_col1', 'checkbox', 'Select', null);
							
							var listHyper = list1.addField('custpage_col9', 'url', 'View', null);
							listHyper.setLinkText('View');
							
							var listSupplier = list1.addField('custpage_col13', 'text', 'Supplier', null);
							var listPoNumber = list1.addField('custpage_col2', 'text', 'Purchase Order', null);
							var listDocNum = list1.addField('custpage_col3', 'text', 'Line No', null);
							var listDate = list1.addField('custpage_col4', 'date', 'Dated', null);
							var listItem = list1.addField('custpage_col8', 'text', 'Item', null);
							var listItemDesc = list1.addField('custpage_col16', 'text', 'Description', null);
							
							var listRate = list1.addField('custpage_col5', 'currency', 'Rate', null);
							var listQty = list1.addField('custpage_col6', 'float', 'Quantity', null);
							var listAmount = list1.addField('custpage_col7', 'currency', 'Amount', null);
							
							var listReceived = list1.addField('custpage_col11', 'float', 'Received', null);
							var listContainer = list1.addField('custpage_col12', 'float', 'On Container', null);
							var listRemain = list1.addField('custpage_col14', 'float', 'Outstanding', null);
							var listAlloc = list1.addField('custpage_col15', 'float', 'Allocate', null);
							listAlloc.setDisplayType('entry');
							
							var listPOId = list1.addField('custpage_col10', 'text', 'Id', null);
							listPOId.setDisplayType('hidden');
							
							var listWeight = list1.addField('custpage_col17', 'float', 'Weight', null);
							listWeight.setDisplayType('hidden');

							
							list1.addButton('custpage_refresh', 'Refresh List', 'ButtonRefresh()');
					
							//Populate the po list based on the search criteria
							//
							var results = libFindPurchaseOrders(paramSupplier, paramPoNo);
							
							var suppliers = {};
							var pos = {};
							
							if (results)
								{
									//Copy the results to the sublist
									//
									for (var int = 0; int < results.length; int++) 
									{
										var line = int + 1;
										var poId = results[int].getId();
										
										var supplier = results[int].getValue('entityid','vendor');
										var supplierId = results[int].getValue('internalid','vendor');
										var tranid = results[int].getValue('tranid');
										var lineNo = results[int].getValue('line');
										var tranDate = results[int].getValue('trandate');
										var rate = results[int].getValue('rate');
										var qty = results[int].getValue('quantity');
										var amount = results[int].getValue('amount');
										var item = results[int].getText('item');
										var itemDesc = results[int].getValue('memo');
										var recv = results[int].getValue('quantityshiprecv');
										var onCont = results[int].getValue('custcol_bbs_consignment_allocated');
										var rem = results[int].getValue('formulanumeric');
										var weight = results[int].getValue('weight','item');
										
										var poURL = nlapiResolveURL('RECORD', 'purchaseorder', poId, 'VIEW');
										
										if(!suppliers[supplier])
										{
											suppliers[supplier] = [supplier,supplierId]
										}
										
										if(!pos[tranid])
										{
											pos[tranid] = [tranid,poId]
										}
									
										list1.setLineItemValue('custpage_col2', line, tranid); 
										list1.setLineItemValue('custpage_col3', line, lineNo); 
										list1.setLineItemValue('custpage_col4', line, tranDate); 
										list1.setLineItemValue('custpage_col5', line, rate); 
										list1.setLineItemValue('custpage_col6', line, qty); 
										list1.setLineItemValue('custpage_col7', line, amount); 
										list1.setLineItemValue('custpage_col8', line, item); 
										list1.setLineItemValue('custpage_col9', line, poURL);
										list1.setLineItemValue('custpage_col10', line, poId);
										list1.setLineItemValue('custpage_col11', line, recv);
										list1.setLineItemValue('custpage_col12', line, onCont);
										list1.setLineItemValue('custpage_col13', line, supplier);
										list1.setLineItemValue('custpage_col14', line, rem);
										list1.setLineItemValue('custpage_col16', line, itemDesc);
										list1.setLineItemValue('custpage_col17', line, weight);
									}
									
									
									field1.addSelectOption('', '', true);
							
									const orderedSuppliers = {};
									Object.keys(suppliers).sort().forEach(function(key) {
										orderedSuppliers[key] = suppliers[key];
									});
									
									for ( var supplier in orderedSuppliers) 
										{
											var suppData = orderedSuppliers[supplier];
											
											if(paramSupplier && paramSupplier == suppData[1])
												{
													field1.addSelectOption(suppData[1], suppData[0], true);
												}
											else
												{
													field1.addSelectOption(suppData[1], suppData[0], false);
												}
										}
									
									field2.addSelectOption('', '', true);

									const orderedPos = {};
									Object.keys(pos).sort().forEach(function(key) {
										orderedPos[key] = pos[key];
									});
									
									for ( var po in orderedPos) 
									{
										var poData = orderedPos[po];
										
										if (paramPoNo && paramPoNo == poData[1])
											{
												field2.addSelectOption(poData[1], poData[0], true);
											}
										else
											{
												field2.addSelectOption(poData[1], poData[0], false);
											}
									}
								}
							
							// Add a submit button
							//
							form.addSubmitButton('Confirm');
			
							//Write the response
							//
							response.writePage(form);
						}
					break;
			}
		}
	else
		{
		//Get the stage of the processing we are at
		//
		var stage = Number(request.getParameter('custpage_stage'));
		var consSelected = null;
		
		switch(stage)
		{
			case 0:
				
				//Count the number of lines in the sublist
				//
				var lineCount = request.getLineItemCount('custpage_sublist1');
			
				for (var int = 1; int <= lineCount; int++) 
				{
					//Get the details from the sublist
					//
					var consId = request.getLineItemValue('custpage_sublist1', 'custpage_col5', int);
					var consChecked = request.getLineItemValue('custpage_sublist1', 'custpage_col1', int);
					
					//Process only the checked lines
					//
					if (consChecked == 'T')
					{
						consSelected = consId;
					}
				}
				
				var params = new Array();
				
				if (consSelected)
					{
						params['stage'] = '1';
						params['consignmentid'] = consSelected;
					}
				else
					{
					params['stage'] = '0';
					}
				
				response.sendRedirect('SUITELET', 'customscript_bbs_cons_alloc_po', 'customdeploy_bbs_cons_alloc_po',null,params);
				
				break;
					
			case 1:
				
				//Now process the selected po records
				//
				
				//Get the consignment id
				//
				var paramConsId = request.getParameter('custpage_consignment');
				
				//Count the number of lines in the sublist
				//
				var lineCount = request.getLineItemCount('custpage_sublist1');
			
				for (var int = 1; int <= lineCount; int++) 
				{
					//Get the po details from the sublist
					//
					var poId = request.getLineItemValue('custpage_sublist1', 'custpage_col10', int);
					var poLine = Number(request.getLineItemValue('custpage_sublist1', 'custpage_col3', int));
					var poChecked = request.getLineItemValue('custpage_sublist1', 'custpage_col1', int);
					var poAllocated = Number(request.getLineItemValue('custpage_sublist1', 'custpage_col15', int));
					var poDescription = request.getLineItemValue('custpage_sublist1', 'custpage_col16', int);
					var poRate = request.getLineItemValue('custpage_sublist1', 'custpage_col5', int);
					var poWeight = request.getLineItemValue('custpage_sublist1', 'custpage_col17', int);
					
					//Process only the checked lines
					//
					if (poChecked == 'T')
					{
						//Load up the po record
						//
						var poRecord = nlapiLoadRecord('purchaseorder', poId);
						
						if (poRecord)
						{
							var poSupplier = poRecord.getFieldValue('entity');
							
							//Update the amount on consignment on the po line
							//
							var onConsignment = Number(poRecord.getLineItemValue('item', 'custcol_bbs_consignment_allocated', poLine));
							
							var newAlloc = onConsignment + poAllocated;
							
							poRecord.setLineItemValue('item', 'custcol_bbs_consignment_allocated', poLine, newAlloc);
							var poItem = poRecord.getLineItemValue('item', 'item', poLine);
							
							nlapiSubmitRecord(poRecord, false, true);
							
							//Create a consignment detail record to allocate the po to
							//
							var consDetail = nlapiCreateRecord('customrecord_bbs_consignment_detail');
							
							consDetail.setFieldValue('custrecord_bbs_consignment_header_id', paramConsId);
							consDetail.setFieldValue('custrecord_bbs_con_det_po_id', poId);
							consDetail.setFieldValue('custrecord_bbs_con_det_po_line', poLine);
							consDetail.setFieldValue('custrecord_bbs_con_det_allocated', poAllocated);
							consDetail.setFieldValue('custrecord_bbs_con_det_item', poItem);
							consDetail.setFieldValue('custrecord_bbs_con_det_supplier', poSupplier);
							consDetail.setFieldValue('custrecord_bbs_con_det_item_description', poDescription);
							consDetail.setFieldValue('custrecord_bbs_con_det_item_rate', poRate);
							consDetail.setFieldValue('custrecord_bbs_con_det_item_weight', poWeight);
							
							nlapiSubmitRecord(consDetail, false, true);
						}
					}
				}
				
				//Redirect back to the calling consignment record
				//
				nlapiSetRedirectURL('RECORD', 'customrecord_bbs_consignment', paramConsId, true, null);
				
				break;
		}
		}
}
