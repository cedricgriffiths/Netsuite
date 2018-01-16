/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       27 Jun 2017     cedricgriffiths
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function billConsignmentSuitelet(request, response){

	if (request.getMethod() == 'GET') {
		
		//Get the consignment id from the parameter list
		//
		var paramConsId = request.getParameter('consignmentid');
		var paramStage = Number(request.getParameter('stage'));
		
		switch(paramStage)
		{
			case 0:
				//Find all consignments that are at a stage of not closed
				//
				
				//Create a form
				//
				var form = nlapiCreateForm('Generate Vendor Bill(s) From Consignment');
				
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
				var list1 = form.addSubList('custpage_sublist1', 'list', 'Consignment Records Available', 'custpage_tab1');
				
				list1.setLabel('Consignment Records Available');
				
				var listSelect = list1.addField('custpage_col1', 'checkbox', 'Select', null);
				var listConRef = list1.addField('custpage_col2', 'text', 'Id', null);
				var listConName = list1.addField('custpage_col3', 'text', 'Shipment Reference', null);
				var listConNum = list1.addField('custpage_col4', 'text', 'Container Number', null);
				var listConId = list1.addField('custpage_col5', 'text', 'Int Id', null);
				listConId.setDisplayType('hidden');
				
				var listStatus = list1.addField('custpage_col6', 'text', 'Status', null);
				
				// Add a submit button
				//
				form.addSubmitButton('Continue');

				//Populate the po list based on the search criteria
				//
				libFindNotClosedConsignments(list1);
				
				//Write the response
				//
				response.writePage(form);
				
				break;
				
			case 1:
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
						var form = nlapiCreateForm('Generate Vendor Bill(s) From Consignment ' + consName);
						
						// Set the client side script to be used with this form
						//
						form.setScript('customscript_bbs_cons_bill_client');
						
						//Save the consignment id in a field on the form, but hide it
						//
						var fieldConsignment = form.addField('custpage_consignment', 'text', 'Consignment');
						fieldConsignment.setDefaultValue(paramConsId.toString());
						
						fieldConsignment.setDisplayType('hidden');
						
						//Save the stage number
						//
						var stageField = form.addField('custpage_stage', 'integer', 'stage');
						stageField.setDisplayType('hidden');
						stageField.setDefaultValue(paramStage);
						
						//Add a tab and a sublist
						//
						var tab1 = form.addTab('custpage_tab1', 'Consignment Detail Lines');
						var list1 = form.addSubList('custpage_sublist1', 'list', 'Consignment Detail Lines', 'custpage_tab1');
						
						list1.setLabel('Consignment Detail Lines');
				
						var listSelect = list1.addField('custpage_col1', 'checkbox', 'Select', null);
						var listSupplier = list1.addField('custpage_col7', 'text', 'Supplier', null);
						var listPoNumber = list1.addField('custpage_col2', 'text', 'Purchase Order', null);
						var listDocNum = list1.addField('custpage_col3', 'text', 'PO Line No', null);
						var listItem = list1.addField('custpage_col8', 'text', 'Item', null);
						var listAlloc = list1.addField('custpage_col4', 'float', 'On Consignment', null);
						var listDetId = list1.addField('custpage_col5', 'text', 'Detail Id', null);
						listDetId.setDisplayType('hidden');
						
						var listPOId = list1.addField('custpage_col6', 'text', 'PO Id', null);
						listPOId.setDisplayType('hidden');
						
						var listSupplierId = list1.addField('custpage_col9', 'text', 'Supplier Id', null);
						listSupplierId.setDisplayType('hidden');
						
						var listSublistLine = list1.addField('custpage_col10', 'text', 'Sublist Line No', null);
						listSublistLine.setDisplayType('hidden');
		
						
						//Add a mark/unmark button
						//
						list1.addMarkAllButtons();
				
						var lineCount = consRecord.getLineItemCount('recmachcustrecord_bbs_consignment_header_id');
						var suppliers = {};
						var sublistLine = Number(0);
						
						for (var linenum = 1; linenum <= lineCount; linenum++) 
						{
							var lineDetailId = consRecord.getLineItemValue('recmachcustrecord_bbs_consignment_header_id', 'id', linenum);
							var linePoTxt = consRecord.getLineItemText('recmachcustrecord_bbs_consignment_header_id', 'custrecord_bbs_con_det_po_id', linenum);
							var linePoId = consRecord.getLineItemValue('recmachcustrecord_bbs_consignment_header_id', 'custrecord_bbs_con_det_po_id', linenum);
							var linePoLine = consRecord.getLineItemValue('recmachcustrecord_bbs_consignment_header_id', 'custrecord_bbs_con_det_po_line', linenum);
							var lineAllocated = consRecord.getLineItemValue('recmachcustrecord_bbs_consignment_header_id', 'custrecord_bbs_con_det_allocated', linenum);
							var lineSupplier = consRecord.getLineItemText('recmachcustrecord_bbs_consignment_header_id', 'custrecord_bbs_con_det_supplier', linenum);
							var lineSupplierId = consRecord.getLineItemValue('recmachcustrecord_bbs_consignment_header_id', 'custrecord_bbs_con_det_supplier', linenum);
							var lineItem = consRecord.getLineItemText('recmachcustrecord_bbs_consignment_header_id', 'custrecord_bbs_con_det_item', linenum);
							var lineBill = consRecord.getLineItemText('recmachcustrecord_bbs_consignment_header_id', 'custrecord_bbs_cons_det_vendor_bill', linenum);
							
							//We only want to show lines that are not associated with a bill
							//
							if(!lineBill)
								{
									sublistLine++;
								
									list1.setLineItemValue('custpage_col2', sublistLine, linePoTxt);
									list1.setLineItemValue('custpage_col3', sublistLine, linePoLine);
									list1.setLineItemValue('custpage_col4', sublistLine, lineAllocated);
									list1.setLineItemValue('custpage_col5', sublistLine, lineDetailId);
									list1.setLineItemValue('custpage_col6', sublistLine, linePoId);
									list1.setLineItemValue('custpage_col7', sublistLine, lineSupplier);
									list1.setLineItemValue('custpage_col8', sublistLine, lineItem);
									list1.setLineItemValue('custpage_col9', sublistLine, lineSupplierId);
									list1.setLineItemValue('custpage_col10', sublistLine, linenum);
									
									//Build a list of suppliers
									//
									if(!suppliers[lineSupplier])
										{
											suppliers[lineSupplier] = lineSupplier;
										}
								}
						}
						
						//Add supplier buttons
						//
						for ( var key in suppliers) 
						{
							list1.addButton('custpage_supp_' + key, 'Select ' + key, "ProcessSupplier('" + key + "')");
						}
						
						// Add a submit button
						//
						form.addSubmitButton('Confirm');
		
						//Write the response
						//
						response.writePage(form);
					}
			}
		}
	else
		{
		//Get the stage
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
				
				response.sendRedirect('SUITELET', 'customscript_bbs_cons_bill', 'customdeploy_bbs_cons_bill',null,params);
				
				break;
					
			case 1:

				//Now process the selected records
				//
				var suppliersArray = {};
				
				//Get the default vendor bill location
				//
				vendorBillLoc = nlapiGetContext().getPreference('custscript_bbs_cons_bill_loc');
				
				//Get the consignment id & the consignment record
				//
				var paramConsId = request.getParameter('custpage_consignment');
				var consignmentRecord = nlapiLoadRecord('customrecord_bbs_consignment', paramConsId);
				
				//Count the number of lines in the sublist
				//
				var lineCount = request.getLineItemCount('custpage_sublist1');
			
				for (var int = 1; int <= lineCount; int++) 
				{
					//Get the po details from the sublist
					//
					var poChecked = request.getLineItemValue('custpage_sublist1', 'custpage_col1', int);
					var poLine = Number(request.getLineItemValue('custpage_sublist1', 'custpage_col3', int));
					var poAllocated = Number(request.getLineItemValue('custpage_sublist1', 'custpage_col4', int));
					var detailId = request.getLineItemValue('custpage_sublist1', 'custpage_col5', int);
					var poId = Number(request.getLineItemValue('custpage_sublist1', 'custpage_col6', int));
					var poText = request.getLineItemValue('custpage_sublist1', 'custpage_col2', int);
					var supplierId = Number(request.getLineItemValue('custpage_sublist1', 'custpage_col9', int));
					var sublistLineNo = Number(request.getLineItemValue('custpage_sublist1', 'custpage_col10', int));
					
					//Process only the checked lines
					//
					
					if (poChecked == 'T')
					{
						//Create a data element that is the po id + the po line no + the line number from the consignment detail sublist
						//
						var poAndLine = poId.toString() + '|' + poLine.toString() + '|' + sublistLineNo.toString() + '|' + poAllocated.toString();
						
						//Build list of suppliers & their purchase orders/lines that are to processed
						//
						if(!suppliersArray[supplierId])
							{
								//If supplier not in array, then add 
								suppliersArray[supplierId] = [];
							}
						
						//Save the po & line into the relevant supplier row of the supplier array
						//
						suppliersArray[supplierId][suppliersArray[supplierId].length] = poAndLine;
							
					}
				}
				
				//Now we have an array of suppliers & their po's/lines
				//We can generate the bills
				//
				
				//Loop round the suppliers
				//
				for ( var supplierId in suppliersArray) 
				{
					var posForSupplier = {};
					var lastPoId = '';
					var poRecord = null;
					
					//Create a new bill for each supplier
					//
					var vendorBillRecord = nlapiCreateRecord('vendorbill', {recordmode: 'dynamic'});
					
					vendorBillRecord.setFieldValue('entity', supplierId); 
					vendorBillRecord.setFieldValue('custbody_bbs_cons_related_consignment', paramConsId);
					
					//Get the po/line data for this supplier
					//
					var poData = suppliersArray[supplierId];
					
					//Loop round each of the pos/lines for this supplier
					//
					for (var int2 = 0; int2 < poData.length; int2++) 
					{
						var poAndLine = poData[int2];
						
						//Split the PO & line number out
						//
						var poAndLIneArray = poAndLine.split('|');
						var poId = poAndLIneArray[0];
						var poLine = poAndLIneArray[1];
						var consignmentSublistLine = poAndLIneArray[2];
						var consignmentAllocated = Number(poAndLIneArray[3]);
						
						//Read the PO record if we have changed po's
						//
						if(poId != lastPoId)
							{
								lastPoId = poId;
								poRecord = nlapiLoadRecord('purchaseorder', poId);
							}	
						
							//Check to make sure we have a po record
							//
							if(poRecord)
								{
									//Get the correct sublist line for the po record
									//
									var poSublistLine = libFindLine(poRecord, 'item', poLine)
									
									//Now get the data from the po item line
									//
									var poLineAmount = poRecord.getLineItemValue('item', 'amount', poSublistLine);
									var poLineItem = poRecord.getLineItemValue('item', 'item', poSublistLine);
									var poLineLocation = poRecord.getLineItemValue('item', 'location', poSublistLine);
									var poLineRate = poRecord.getLineItemValue('item', 'rate', poSublistLine);
									var poLineUnits = poRecord.getLineItemValue('item', 'units', poSublistLine);
									var poLineVendorName = poRecord.getLineItemValue('item', 'vendorname', poSublistLine);
									var poLineOnConsignment = poRecord.getLineItemValue('item', 'custcol_bbs_consignment_allocated', poSublistLine);
									
									//Use the default vendor bill location if not on po line
									//
									if(!poLineLocation)
										{
											poLineLocation = vendorBillLoc;
										}
									
									//Get some PO header info 
									//
									var poHeadDate = poRecord.getFieldValue('trandate');
									var poHeadNumber = poRecord.getFieldValue('tranid');
									var poHeadTotal = poRecord.getFieldValue('total');
									var poHeadCurrency = poRecord.getFieldValue('currency');
										
									
									//Set the vendor bill currency from the po currency
									//
									vendorBillRecord.setFieldValue('currency', poHeadCurrency); 
									vendorBillRecord.setFieldValue('location', poLineLocation); 
									
									
									//Save the unique po's for this supplier into an array so we can update the purchaseorders sublist on the vendor bill
									//
									if(!posForSupplier[poId])
										{
											posForSupplier[poId] = [poId, poHeadNumber, poHeadDate, poHeadTotal, '/app/accounting/transactions/purchord.nl'];
										}
										
									//Add a line to the vendor bill
									//
									vendorBillRecord.selectNewLineItem('item');
									vendorBillRecord.setCurrentLineItemValue('item', 'item', poLineItem); 
									vendorBillRecord.setCurrentLineItemValue('item', 'orderdoc', poId); 
									vendorBillRecord.setCurrentLineItemValue('item', 'orderline', poLine); 
									
									//vendorBillRecord.setCurrentLineItemValue('item', 'quantity', poLineOnConsignment); 
									vendorBillRecord.setCurrentLineItemValue('item', 'quantity', consignmentAllocated); 
									
									vendorBillRecord.setCurrentLineItemValue('item', 'rate', poLineRate); 
									//vendorBillRecord.setCurrentLineItemValue('item', 'amount', poLineAmount); 
									vendorBillRecord.setCurrentLineItemValue('item', 'location', poLineLocation); 
									vendorBillRecord.setCurrentLineItemValue('item', 'vendorname', poLineVendorName); 
									vendorBillRecord.commitLineItem('item', false);
										
								}
					}
					
					//Add the purchase order links to the vendor bill
					//
					for ( var poIds in posForSupplier) 
					{
						var poSupplierData = posForSupplier[poIds];
						
						vendorBillRecord.selectNewLineItem('purchaseorders');
						vendorBillRecord.setCurrentLineItemValue('purchaseorders', 'poid', poSupplierData[1]); 
						vendorBillRecord.setCurrentLineItemValue('purchaseorders', 'id', poSupplierData[0]); 
						vendorBillRecord.setCurrentLineItemValue('purchaseorders', 'poamount', poSupplierData[3]); 
						vendorBillRecord.setCurrentLineItemValue('purchaseorders', 'podate', poSupplierData[2]); 
						vendorBillRecord.setCurrentLineItemValue('purchaseorders', 'linkurl', poSupplierData[4]); 
						vendorBillRecord.commitLineItem('purchaseorders', false);
					}
					
					//Save the Vendor Bill
					//
					var vendorBillId = nlapiSubmitRecord(vendorBillRecord, true, false);
					
					//Update the consignment detail sublist with the vendor bill id
					//
					for (var int2 = 0; int2 < poData.length; int2++) 
					{
						var poAndLine = poData[int2];
						
						//Split the consignment sublist line out
						//
						var poAndLineArray = poAndLine.split('|');
						var consignmentSublistLine = poAndLineArray[2];
						
						//Update the sublist line
						//
						consignmentRecord.setLineItemValue('recmachcustrecord_bbs_consignment_header_id', 'custrecord_bbs_cons_det_vendor_bill', consignmentSublistLine, vendorBillId);
						
					}
				}
				
				//Save the consignment record
				//
				nlapiSubmitRecord(consignmentRecord, false, true);
				
				//Redirect back to the consignment record
				//
				nlapiSetRedirectURL('RECORD', 'customrecord_bbs_consignment', paramConsId, false, null);
				
		}
	}
}
