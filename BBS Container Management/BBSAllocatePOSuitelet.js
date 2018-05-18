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
		var paramItem = request.getParameter('item');
		
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
					
					var listSelect = list1.addField('custpage_cons_tick', 'checkbox', 'Select', null);
					var listConRef = list1.addField('custpage_cons_id', 'text', 'Id', null);
					var listConName = list1.addField('custpage_cons_shipref', 'text', 'Shipment Reference', null);
					var listConNum = list1.addField('custpage_cons_container', 'text', 'Container Number', null);
					var listConId = list1.addField('custpage_cons_int_id', 'text', 'Int Id', null);
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
							var field3 = form.addField('custpage_field3', 'text', 'Item (Contains Text)', null, 'custpage_grp1');
							
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
							
							if (paramItem)
							{	
								field3.setDefaultValue(paramItem);
								nlapiSetFieldValue('custpage_field3', paramItem, true, true);
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
					
							//Create sublist columns
							//
							var listSelect =list1.addField('custpage_col_tick', 'checkbox', 'Select', null);
							var listHyper = list1.addField('custpage_col_po_url', 'url', 'View', null);		
							var listSupplier = list1.addField('custpage_col_supplier', 'text', 'Supplier', null);
							var listPoNumber = list1.addField('custpage_col_po_num', 'text', 'Purchase Order', null);
							var listDocNum = list1.addField('custpage_col_line_no', 'text', 'Line No', null);
							var listDate = list1.addField('custpage_col_dated', 'date', 'Dated', null);
							var listItem = list1.addField('custpage_col_item', 'text', 'Item', null);
							var listItemDesc = list1.addField('custpage_col_description', 'text', 'Description', null);		
							var listRate = list1.addField('custpage_col_rate', 'currency', 'Rate', null);
							var listQty = list1.addField('custpage_col_quantity', 'float', 'Quantity', null);
							var listAmount = list1.addField('custpage_col_amount', 'currency', 'Amount', null);					
							var listCurrency = list1.addField('custpage_col_currency', 'text', 'Currency', null);	
							var listExchRate = list1.addField('custpage_col_exch_rate', 'float', 'Exch Rate', null);						
							var listReceived = list1.addField('custpage_col_received', 'float', 'Received', null);
							var listContainer = list1.addField('custpage_col_on_container', 'float', 'On Container', null);
							var listRemain = list1.addField('custpage_col_outstanding', 'float', 'Outstanding', null);
							var listAlloc = list1.addField('custpage_col_allocate', 'float', 'Allocate', null);						
							var listPOId = list1.addField('custpage_col_po_id', 'text', 'Id', null);						
							var listWeight = list1.addField('custpage_col_weight', 'float', 'Weight', null);						
							var listCurrencyId = list1.addField('custpage_col_curr_id', 'text', 'Currency Id', null);	
							
							//Set column display attributes
							//
							listCurrencyId.setDisplayType('hidden');
							listHyper.setLinkText('View');
							listWeight.setDisplayType('hidden');
							listPOId.setDisplayType('hidden');
							listAlloc.setDisplayType('entry');
							
							//Add a refresh button to the sublist
							//
							list1.addButton('custpage_refresh', 'Refresh List', 'ButtonRefresh()');
					
							//Populate the po list based on the search criteria
							//
							var results = libFindPurchaseOrders(paramSupplier, paramPoNo, paramItem);
							
							var suppliers = {};
							var pos = {};
							
							if (results)
								{
									//Copy the results to the sublist
									//
									var previousPoId = -1;
									var poRec = null;
									
									for (var int = 0; int < results.length; int++) 
									{
										var line = int + 1;
										var poId = results[int].getId();
										
										var lineNo = results[int].getValue('line');
										var supplier = results[int].getValue('entityid','vendor');
										var supplierId = results[int].getValue('internalid','vendor');
										var tranid = results[int].getValue('tranid');
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
										var currency = results[int].getValue('currency');
										var currencyText = results[int].getText('currency');
										var exchangeRate = results[int].getValue('exchangerate');
										
										var poURL = nlapiResolveURL('RECORD', 'purchaseorder', poId, 'VIEW');
										
										if(!suppliers[supplier])
										{
											suppliers[supplier] = [supplier,supplierId]
										}
										
										if(!pos[tranid])
										{
											pos[tranid] = [tranid,poId]
										}
									
										list1.setLineItemValue('custpage_col_po_num', line, tranid); 
										list1.setLineItemValue('custpage_col_line_no', line, lineNo); 
										list1.setLineItemValue('custpage_col_dated', line, tranDate); 
										list1.setLineItemValue('custpage_col_rate', line, rate); 
										list1.setLineItemValue('custpage_col_quantity', line, qty); 
										list1.setLineItemValue('custpage_col_amount', line, amount); 
										list1.setLineItemValue('custpage_col_item', line, item); 
										list1.setLineItemValue('custpage_col_po_url', line, poURL);
										list1.setLineItemValue('custpage_col_po_id', line, poId);
										list1.setLineItemValue('custpage_col_received', line, recv);
										list1.setLineItemValue('custpage_col_on_container', line, onCont);
										list1.setLineItemValue('custpage_col_supplier', line, supplier);
										list1.setLineItemValue('custpage_col_outstanding', line, rem);
										list1.setLineItemValue('custpage_col_description', line, itemDesc);
										list1.setLineItemValue('custpage_col_weight', line, weight);
										list1.setLineItemValue('custpage_col_currency', line, currencyText);
										list1.setLineItemValue('custpage_col_exch_rate', line, exchangeRate);
										list1.setLineItemValue('custpage_col_curr_id', line, currency);
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
					var consId = request.getLineItemValue('custpage_sublist1', 'custpage_cons_int_id', int);
					var consChecked = request.getLineItemValue('custpage_sublist1', 'custpage_cons_tick', int);
					
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
			
				var poArray = {};
				
				for (var int = 1; int <= lineCount; int++) 
				{
					//Get the po details from the sublist
					//
					var poId = request.getLineItemValue('custpage_sublist1', 'custpage_col_po_id', int);
					var poLine = Number(request.getLineItemValue('custpage_sublist1', 'custpage_col_line_no', int));
					var poChecked = request.getLineItemValue('custpage_sublist1', 'custpage_col_tick', int);
					var poAllocated = Number(request.getLineItemValue('custpage_sublist1', 'custpage_col_allocate', int));
					var poDescription = request.getLineItemValue('custpage_sublist1', 'custpage_col_description', int);
					var poRate = request.getLineItemValue('custpage_sublist1', 'custpage_col_rate', int);
					var poWeight = request.getLineItemValue('custpage_sublist1', 'custpage_col_weight', int);
					var poExchangeRate = request.getLineItemValue('custpage_sublist1', 'custpage_col_exch_rate', int);
					var poCurrency = request.getLineItemValue('custpage_sublist1', 'custpage_col_curr_id', int);

					
					//Build an array of po id's to process along with all the relevant lines
					//
					if (poChecked == 'T')
					{
						var poLineData = [poId,poLine,poChecked,poAllocated,poDescription,poRate,poWeight,int,poExchangeRate,poCurrency];
						
						if(!poArray[poId])
							{
								poArray[poId] = [];
							}

						poArray[poId].push(poLineData);

					}
					
				}
					//Loop through each po record
					//
					for ( var poKey in poArray) 
					{
						var poLinesData = poArray[poKey];
						
						//Read the po record
						//
						var poRecord = nlapiLoadRecord('purchaseorder', poKey);
						var poSupplier = poRecord.getFieldValue('entity');
						
						//Loop through all the lines on the po that need processing
						//
						for (var int = 0; int < poLinesData.length; int++) 
						{
							var poLineData = poLinesData[int];
							
							//Find the relevant line in the po items sublist
							//
							var poSublistLineNo = libFindLine(poRecord, 'item', Number(poLineData[1]));
							//var poSublistLineNo = Number(poLineData[1]);
							
							//Update the amount on consignment on the po line
							//
							var onConsignment = Number(poRecord.getLineItemValue('item', 'custcol_bbs_consignment_allocated', poSublistLineNo));
							var newAlloc = onConsignment + Number(poLineData[3]);
							
							poRecord.setLineItemValue('item', 'custcol_bbs_consignment_allocated', poSublistLineNo, newAlloc);
							
							//Now create a new consignment detail record
							//
							var poItem = poRecord.getLineItemValue('item', 'item', poSublistLineNo);
							
							var consDetail = nlapiCreateRecord('customrecord_bbs_consignment_detail');
							
							consDetail.setFieldValue('custrecord_bbs_consignment_header_id', paramConsId);
							consDetail.setFieldValue('custrecord_bbs_con_det_po_id', poLineData[0]);
							consDetail.setFieldValue('custrecord_bbs_con_det_po_line', poLineData[1]); //poLineData[1]);
							consDetail.setFieldValue('custrecord_bbs_con_det_allocated', poLineData[3]);
							consDetail.setFieldValue('custrecord_bbs_con_det_item', poItem);
							consDetail.setFieldValue('custrecord_bbs_con_det_supplier', poSupplier);
							consDetail.setFieldValue('custrecord_bbs_con_det_item_description', poLineData[4]);
							consDetail.setFieldValue('custrecord_bbs_con_det_item_rate', poLineData[5]);
							consDetail.setFieldValue('custrecord_bbs_con_det_item_weight', poLineData[6]);
							consDetail.setFieldValue('custrecord_bbs_con_det_currency', poLineData[9]);
							consDetail.setFieldValue('custrecord_bbs_con_det_exch_rate', poLineData[8]);
							
							nlapiSubmitRecord(consDetail, false, true);
						}
						
						//Now submit the po record
						//
						nlapiSubmitRecord(poRecord, false, true);
					}

				
				//Redirect back to the calling consignment record
				//
				nlapiSetRedirectURL('RECORD', 'customrecord_bbs_consignment', paramConsId, true, null);
				
				break;
		}
		}
}
