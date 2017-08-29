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

function unAllocatePOSuitelet(request, response){

	if (request.getMethod() == 'GET') {
		
		//Get the consignment id from the parameter list
		//
		var paramConsId = request.getParameter('consignmentid');
		var paramStage = Number(request.getParameter('stage'));
		
		switch(paramStage)
		{
			case 0:
				//Find all consignments that are at a stage of open
				//
				
				//Create a form
				//
				var form = nlapiCreateForm('Un-Assign Purchase Orders from Consignment ');
				
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
				var list1 = form.addSubList('custpage_sublist1', 'list', 'Consignment Records Availqble', 'custpage_tab1');
				
				list1.setLabel('Consignment Records Availqble');
				
				var listSelect = list1.addField('custpage_col1', 'checkbox', 'Select', null);
				var listConRef = list1.addField('custpage_col2', 'text', 'Id', null);
				var listConName = list1.addField('custpage_col3', 'text', 'Shipment Reference', null);
				var listConNum = list1.addField('custpage_col4', 'text', 'Container Number', null);
				var listConId = list1.addField('custpage_col5', 'text', 'Int Id', null);
				listConId.setDisplayType('hidden');
				
				// Add a submit button
				//
				form.addSubmitButton('Unassisgn Purchase Orders');

				//Populate the po list based on the search criteria
				//
				libFindConsignments(list1);
				
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
						var form = nlapiCreateForm('Un-Assign Purchase Orders from Consignment ' + consName);
						
						
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
						var tab1 = form.addTab('custpage_tab1', 'Purchase Order Lines');
						var list1 = form.addSubList('custpage_sublist1', 'list', 'Purchase Order Lines Allocated', 'custpage_tab1');
						
						list1.setLabel('Purchase Order Lines Allocated');
				
						var listSelect = list1.addField('custpage_col1', 'checkbox', 'Select', null);
						var listSupplier = list1.addField('custpage_col7', 'text', 'Supplier', null);
						var listPoNumber = list1.addField('custpage_col2', 'text', 'Purchase Order', null);
						var listDocNum = list1.addField('custpage_col3', 'text', 'Line No', null);
						var listItem = list1.addField('custpage_col8', 'text', 'Item', null);
						var listDescription = list1.addField('custpage_col9', 'text', 'Description', null);
						var listAlloc = list1.addField('custpage_col4', 'float', 'Allocated', null);
						
						var listDetId = list1.addField('custpage_col5', 'text', 'Detail Id', null);
						listDetId.setDisplayType('hidden');
						
						var listPOId = list1.addField('custpage_col6', 'text', 'PO Id', null);
						listPOId.setDisplayType('hidden');
		
						
						//Add a mark/unmark button
						//
						list1.addMarkAllButtons();
				
						var lineCount = consRecord.getLineItemCount('recmachcustrecord_bbs_consignment_header_id');
						
						for (var linenum = 1; linenum <= lineCount; linenum++) 
						{
							var lineDetailId = consRecord.getLineItemValue('recmachcustrecord_bbs_consignment_header_id', 'id', linenum);
							var linePoTxt = consRecord.getLineItemText('recmachcustrecord_bbs_consignment_header_id', 'custrecord_bbs_con_det_po_id', linenum);
							var linePoId = consRecord.getLineItemValue('recmachcustrecord_bbs_consignment_header_id', 'custrecord_bbs_con_det_po_id', linenum);
							var linePoLine = consRecord.getLineItemValue('recmachcustrecord_bbs_consignment_header_id', 'custrecord_bbs_con_det_po_line', linenum);
							var lineAllocated = consRecord.getLineItemValue('recmachcustrecord_bbs_consignment_header_id', 'custrecord_bbs_con_det_allocated', linenum);
							var lineSupplier = consRecord.getLineItemText('recmachcustrecord_bbs_consignment_header_id', 'custrecord_bbs_con_det_supplier', linenum);
							var lineItem = consRecord.getLineItemText('recmachcustrecord_bbs_consignment_header_id', 'custrecord_bbs_con_det_item', linenum);
							var lineDesc = consRecord.getLineItemValue('recmachcustrecord_bbs_consignment_header_id', 'custrecord_bbs_con_det_item_description', linenum);
							
							list1.setLineItemValue('custpage_col2', linenum, linePoTxt);
							list1.setLineItemValue('custpage_col3', linenum, linePoLine);
							list1.setLineItemValue('custpage_col4', linenum, lineAllocated);
							list1.setLineItemValue('custpage_col5', linenum, lineDetailId);
							list1.setLineItemValue('custpage_col6', linenum, linePoId);
							list1.setLineItemValue('custpage_col7', linenum, lineSupplier);
							list1.setLineItemValue('custpage_col8', linenum, lineItem);
							list1.setLineItemValue('custpage_col9', linenum, lineDesc);
							
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
				
				response.sendRedirect('SUITELET', 'customscript_bbs_cons_unalloc_po', 'customdeploy_bbs_cons_unalloc_po',null,params);
				
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
					var poChecked = request.getLineItemValue('custpage_sublist1', 'custpage_col1', int);
					var poLine = Number(request.getLineItemValue('custpage_sublist1', 'custpage_col3', int));
					var poAllocated = Number(request.getLineItemValue('custpage_sublist1', 'custpage_col4', int));
					var detailId = request.getLineItemValue('custpage_sublist1', 'custpage_col5', int);
					var poId = Number(request.getLineItemValue('custpage_sublist1', 'custpage_col6', int));
					
					//Process only the checked lines
					//
					if (poChecked == 'T')
					{
						//Delete the consignment detail record 
						//
						var consDetail = nlapiDeleteRecord('customrecord_bbs_consignment_detail', detailId);
							
					}
				}
				
				//Redirect back to the calling consignment record
				//
				nlapiSetRedirectURL('RECORD', 'customrecord_bbs_consignment', paramConsId, true, null);
				
		}
	}
}
