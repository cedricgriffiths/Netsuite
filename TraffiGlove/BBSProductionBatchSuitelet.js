/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       03 Mar 2017     cedricgriffiths
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function productionBatchSuitelet(request, response){

	if (request.getMethod() == 'GET') 
	{
		//Get request - so return a form for the user to process
		//
		
		//Get parameters
		//
		var productionBatchId = request.getParameter('productionbatchid');
		var belongsToId = request.getParameter('belongstoid');
		var customerId = request.getParameter('customerid');
		var stage = Number(request.getParameter('stage'));
		var ffi = request.getParameter('ffi');
		var mode = request.getParameter('mode'); //U = update existing production batch, C = create a production batch
		var soLink = request.getParameter('solink'); // T/F - choose to select w/o that are/are not linked to sales orders
		var soCommitStatus = request.getParameter('socommitstatus'); 
		var soCommitStatusText = request.getParameter('socommitstatustext'); 
		var soId = request.getParameter('soid'); 
		var soText = request.getParameter('sotext'); 
		
		// Create a form
		//
		var form = nlapiCreateForm('Assign Works Orders To Production Batch');
		form.setScript('customscript_bbs_pb_suitelet_client');
		
		//Store the current stage in a field in the form so that it can be retrieved in the POST section of the code
		//
		var stageField = form.addField('custpage_stage', 'integer', 'stage');
		stageField.setDisplayType('hidden');
		stageField.setDefaultValue(stage);
		
		//Store the production batch in a field in the form so that it can be retrieved in the POST section of the code
		//
		var productionBatchField = form.addField('custpage_production_batch', 'integer', 'ProductionBatch');
		productionBatchField.setDisplayType('hidden');
		productionBatchField.setDefaultValue(productionBatchId);
		
		//Store the mode in a field in the form so that it can be retrieved in the POST section of the code
		//
		var modeField = form.addField('custpage_mode', 'text', 'Mode');
		modeField.setDisplayType('hidden');
		modeField.setDefaultValue(mode);
		
		//Store the solink in a field in the form so that it can be retrieved in the POST section of the code
		//
		var solinklField = form.addField('custpage_solink', 'text', 'SO Link');
		solinklField.setDisplayType('hidden');
		solinklField.setDefaultValue(soLink);
		
		//Store the so commit status in a field in the form so that it can be retrieved in the POST section of the code
		//
		var soComStatField = form.addField('custpage_so_com_text', 'text', 'SO Commit Text');
		soComStatField.setDisplayType('hidden');
		soComStatField.setDefaultValue(soCommitStatusText);
		
		//Store the so text in a field in the form so that it can be retrieved in the POST section of the code
		//
		var soTextField = form.addField('custpage_so_text', 'text', 'SO Text');
		soTextField.setDisplayType('hidden');
		soTextField.setDefaultValue(soText);
		
		
		var prodBatchTitle = '';
		
		switch (mode)
		{
		//Update an existing production batch with selected works orders
		//
		case 'U':
			
			if (productionBatchId != null && productionBatchId != '')
			{
				var prodBatchRecord = nlapiLoadRecord('customrecord_bbs_assembly_batch', productionBatchId);
				
				if(prodBatchRecord)
					{
						prodBatchTitle = 'Assign Works Orders To Production Batch ' + prodBatchRecord.getFieldValue('custrecord_bbs_bat_description');
					}
			}
			
			break;
		
		//Create production batches from selected works orders
		//
		case 'C':
			
			prodBatchTitle = 'Create Production Batches For Works Orders';
			
			break;
		}
		
		switch(soLink)
		{
		case 'T':
			prodBatchTitle = prodBatchTitle + ' (WO Linked To SO)'
			break;
			
		default:
			prodBatchTitle = prodBatchTitle + ' (WO Not Linked To SO)'
			break;
		}
		
		form.setTitle(prodBatchTitle);
		
		//Add a field group for optional filters
		//
		var fieldGroup2 = form.addFieldGroup('custpage_grp2', 'Optional Filters');

		//Work out what the form layout should look like based on the stage number
		//
		switch(stage)
		{
		case 1:	
				//Add a select field to pick the customer from
				//
				var customerField = form.addField('custpage_customer_select', 'select', 'Works Order Customer', 'customer', 'custpage_grp2');
				var assemblyBelongsToField = form.addField('custpage_asym_belongs_select', 'select', 'Assembly Belongs To', 'customer','custpage_grp2');
				var fullFinishField = form.addField('custpage_ffi_select', 'text', 'Full Finish item', null,'custpage_grp2');
				
				//If we are looking at w/o that are linked to s/o then add specific filters
				//
				if(soLink == 'T')
					{
						var soCommitStatusField = form.addField('custpage_so_commit_select', 'select', 'Sales Order Commitment Status', 'customlist_bbs_commitment_status','custpage_grp2');
					
						var soSelectionField = form.addField('custpage_so_select', 'select', 'Sales Orders', null,'custpage_grp2');
						
						//Now search the available w/o for s/o numbers
						//
						var filterArray = [
						                   ["mainline","is","T"], 
						                   "AND", 
						                   ["type","anyof","WorkOrd"], 
						                   "AND", 
						                   ["custbody_bbs_wo_batch","anyof","@NONE@"], 
						                   "AND", 
						                   ["status","anyof","WorkOrd:A","WorkOrd:B"],
						                   "AND",
						                   ["createdfrom","noneof","@NONE@"]
						                ];
						
						var woSearch = nlapiCreateSearch("transaction", filterArray, 
								[
								   new nlobjSearchColumn("createdfrom",null,null)
								]
								);
								
						var searchResult = woSearch.runSearch();
				
						//Get the initial set of results
						//
						var start = 0;
						var end = 1000;
						var searchResultSet = searchResult.getResults(start, end);
						var resultlen = searchResultSet.length;
				
						//If there is more than 1000 results, page through them
						//
						while (resultlen == 1000) 
							{
									start += 1000;
									end += 1000;
				
									var moreSearchResultSet = searchResult.getResults(start, end);
									resultlen = moreSearchResultSet.length;
				
									searchResultSet = searchResultSet.concat(moreSearchResultSet);
							}
						
						var soArray = {};
						
						//Build up a list of sales order to pick from
						//
						for (var int = 0; int < searchResultSet.length; int++) 
						{
							var soId = searchResultSet[int].getValue('createdfrom');
							var soText = searchResultSet[int].getText('createdfrom');
							
							if(!soArray[soId])
								{
									soArray[soId] = soText;
								}
						}
						
						soSelectionField.addSelectOption( '', '', true);
						
						for ( var soKey in soArray) 
						{
							soSelectionField.addSelectOption(soKey, soArray[soKey], false);
						}
						
					}
				
				//Add a submit button to the form
				//
				form.addSubmitButton('Select Works Orders');
				
				break;
		
		case 2:	
				//Filter the items to display based on the criteria chosen in stage 1
				//
				var customerField = form.addField('custpage_customer_select', 'text', 'Assembly Customer', null, 'custpage_grp2');
				customerField.setDisplayType('disabled');
				
				if(customerId != '')
					{
						var text = nlapiLookupField('customer', customerId, 'companyname', false);
						customerField.setDefaultValue(text);
					}
				
				var assemblyBelongsToField = form.addField('custpage_asym_belongs_select', 'text', 'Assembly Belongs To', null, 'custpage_grp2');
				assemblyBelongsToField.setDisplayType('disabled');
				
				if(belongsToId != '')
				{
					var text = nlapiLookupField('customer', belongsToId, 'companyname', false);
					assemblyBelongsToField.setDefaultValue(text);
				}
			
				var fullFinishField = form.addField('custpage_ffi_select', 'text', 'Full Finish Item', null, 'custpage_grp2');
				fullFinishField.setDisplayType('disabled');
				
				if(ffi != '')
				{
					fullFinishField.setDefaultValue(ffi);
				}
				
				if(soLink == 'T')
				{
					var soCommitStatusField = form.addField('custpage_so_commit_select', 'text', 'Sales Order Commitment Status', null, 'custpage_grp2');
					soCommitStatusField.setDisplayType('disabled');
					soCommitStatusField.setDefaultValue(soCommitStatusText);
					
					var soTextField = form.addField('custpage_so_text_select', 'text', 'Sales Order', null, 'custpage_grp2');
					soTextField.setDisplayType('disabled');
					soTextField.setDefaultValue(soText);
				}
				
				var tab = form.addTab('custpage_tab_items', 'Works Orders To Select');
				tab.setLabel('Works Orders To Select');
				
				var tab2 = form.addTab('custpage_tab_items2', '');
				
				form.addField('custpage_tab2', 'text', 'test', null, 'custpage_tab_items2');
				
				var subList = form.addSubList('custpage_sublist_items', 'list', 'Works Orders To Select', 'custpage_tab_items');
				
				subList.setLabel('Works Orders To Select');
				
				//Add a mark/unmark button
				//
				subList.addMarkAllButtons();
				
				
				var listSelect = subList.addField('custpage_sublist_tick', 'checkbox', 'Select', null);
				var listWoNo = subList.addField('custpage_sublist_wo_no', 'text', 'Works Order No', null);
				var listSoNo = subList.addField('custpage_sublist_so_no', 'text', 'Sales Order No', null);
				var listSoCommitStatus = subList.addField('custpage_sublist_so_status', 'text', 'Sales Order Status', null);
				var listCustomer = subList.addField('custpage_sublist_customer', 'text', 'WO Customer', null);
				var listAssembly = subList.addField('custpage_sublist_assembly', 'text', 'Assembly', null);
				var listBelongs = subList.addField('custpage_sublist_belongs', 'text', 'Assembly Belongs To', null);
				var listQty = subList.addField('custpage_sublist_qty', 'integer', 'Quantity', null);
				var listDate = subList.addField('custpage_sublist_date', 'text', 'Date Entered', null);
				var listStatus = subList.addField('custpage_sublist_status', 'text', 'WO Commit Status', null);
				var listId = subList.addField('custpage_sublist_id', 'text', 'Id', null);
				listId.setDisplayType('hidden');
				var listFFI = subList.addField('custpage_sublist_ffi', 'text', 'FFI', null);
				var listFinishType = subList.addField('custpage_sublist_finish_type', 'text', 'Finish Type', null);
				
				var filterArray = [
				                   ["mainline","is","T"], 
				                   "AND", 
				                   ["type","anyof","WorkOrd"], 
				                   "AND", 
				                   ["custbody_bbs_wo_batch","anyof","@NONE@"], 
				                   "AND", 
				                   ["status","anyof","WorkOrd:A","WorkOrd:B"]
				                ];
				
				if(customerId != '')
				{
					filterArray.push("AND",["entity","anyof",customerId]);
				}
				
				if(belongsToId != '')
				{
					filterArray.push("AND",["item.custitem_bbs_item_customer","anyof",belongsToId]);
				}
				
				if(soLink == 'T')
				{
					if(soId != '')
					{
						filterArray.push("AND",["createdfrom","anyof",soId]);
					}
					else
						{
							filterArray.push("AND",["createdfrom","noneof","@NONE@"]);
						}
				}
				else
				{
					filterArray.push("AND",["createdfrom","anyof","@NONE@"]);
				}	
				
				if(ffi != '')
				{
					filterArray.push("AND",["custbody_bbs_wo_ffi.itemid","startswith",ffi]);
				}
				
				if(soCommitStatus != '')
				{
					filterArray.push("AND",["createdfrom.custbody_bbs_commitment_status","anyof",soCommitStatus]);
				}
				
				
				
				var woSearch = nlapiCreateSearch("transaction", filterArray, 
						[
						   new nlobjSearchColumn("tranid",null,null), 
						   new nlobjSearchColumn("entity",null,null), 
						   new nlobjSearchColumn("item",null,null), 
						   new nlobjSearchColumn("custitem_bbs_item_customer","item",null), 
						   new nlobjSearchColumn("quantity",null,null), 
						   new nlobjSearchColumn("datecreated",null,null), 
						   new nlobjSearchColumn("custbody_bbs_commitment_status",null,null), 
						   new nlobjSearchColumn("createdfrom",null,null),
						   new nlobjSearchColumn("custbody_bbs_commitment_status",null,null), 
						   new nlobjSearchColumn("custbody_bbs_wo_finish",null,null), 
						   new nlobjSearchColumn("custbody_bbs_wo_ffi",null,null), 
						   new nlobjSearchColumn("custbody_bbs_commitment_status","createdFrom",null)
						]
						);
						
				var searchResult = woSearch.runSearch();
		
				//Get the initial set of results
				//
				var start = 0;
				var end = 1000;
				var searchResultSet = searchResult.getResults(start, end);
				var resultlen = searchResultSet.length;
		
				//If there is more than 1000 results, page through them
				//
				while (resultlen == 1000) 
					{
							start += 1000;
							end += 1000;
		
							var moreSearchResultSet = searchResult.getResults(start, end);
							resultlen = moreSearchResultSet.length;
		
							searchResultSet = searchResultSet.concat(moreSearchResultSet);
					}
					
				
				//Copy the results to the sublist
				//
				var line = Number(0);
				var memberItemRecords = {};
				var fullFinishItems = {};
				
				for (var int = 0; int < searchResultSet.length; int++) 
				{
					/*
					//Find a Full Finish Item on the W/O
					//
					var ffiFilterArray = [
										   ["mainline","is","F"], 
										   "AND", 
										   ["type","anyof","WorkOrd"], 
										   "AND", 
										   ["item.custitem_bbs_item_process_type","anyof","3"], 
										   "AND", 
										   ["internalid","anyof",searchResultSet[int].getId()]
										];
					
					if (ffi != '')
					{
						ffiFilterArray.push("AND",["item.itemid","startswith",ffi]);
					}
					
					var workorderSearch = nlapiSearchRecord("workorder",null,ffiFilterArray,
							[
							   new nlobjSearchColumn("itemid","item",null),
							   new nlobjSearchColumn("custitem_bbs_item_process_type","item",null),
							   new nlobjSearchColumn("item", null ,null),
							]
							);
					
					var ffiText = '';
					var finishTypeText = '';
					var finishTypeId = '';
					
					
					if (workorderSearch != null && workorderSearch.length > 0)
					{	
						//Get the full finish item code
						//
						var ffiText = workorderSearch[0].getValue("itemid","item");
						
						//Get the id of the item, which in itself should be an assembly
						//
						var ffiId = workorderSearch[0].getValue("item");
						
						//Now load the assembly record or the full finish item
						//
						var ffiRecord = null;
						
						if(fullFinishItems[ffiId])
							{
								ffiRecord = fullFinishItems[ffiId];
							}
						else
							{
								if(nlapiGetContext().getRemainingUsage() > 10)
									{
										ffiRecord = nlapiLoadRecord('assemblyitem', ffiId);
										fullFinishItems[ffiId] = ffiRecord; 
									}
							}
						
						if(ffiRecord)
							{
								var ffiComponents = ffiRecord.getLineItemCount('member');
								
								if(ffiComponents > 0)
								{
									var memberItemId = ffiRecord.getLineItemValue('member', 'item', 1);
									var memberItemType = ffiRecord.getLineItemValue('member', 'sitemtype', 1);
									
									var memberItemRecord = null;
									
									if (memberItemId)
										{
											if(memberItemRecords[memberItemId])
												{
													memberItemRecord = memberItemRecords[memberItemId];
												}
											else
												{
													if(nlapiGetContext().getRemainingUsage() > 10)
													{
														memberItemRecord = nlapiLoadRecord(getItemRecType(memberItemType), memberItemId);
														memberItemRecords[memberItemId] = memberItemRecord;
													}
												}
											
											
											if(memberItemRecord)
												{
													finishTypeText = memberItemRecord.getFieldText('custitem_bbs_item_process_type');
													finishTypeId = memberItemRecord.getFieldValue('custitem_bbs_item_process_type');
												}
										}
								}								
							}
					}
					*/
					//if ((ffi != '' && ffiText != '') || ffi == '')
					//	{
							line++;
		
							subList.setLineItemValue('custpage_sublist_wo_no', line, searchResultSet[int].getValue('tranid'));
							subList.setLineItemValue('custpage_sublist_so_no', line, searchResultSet[int].getText('createdfrom'));
							subList.setLineItemValue('custpage_sublist_customer', line, searchResultSet[int].getText('entity'));
							subList.setLineItemValue('custpage_sublist_assembly', line, searchResultSet[int].getText('item'));
							subList.setLineItemValue('custpage_sublist_belongs', line, searchResultSet[int].getText('custitem_bbs_item_customer','item'));
							subList.setLineItemValue('custpage_sublist_qty', line, searchResultSet[int].getValue('quantity'));
							subList.setLineItemValue('custpage_sublist_date', line, searchResultSet[int].getValue('datecreated'));
							subList.setLineItemValue('custpage_sublist_status', line, searchResultSet[int].getText('custbody_bbs_commitment_status'));
							subList.setLineItemValue('custpage_sublist_id', line, searchResultSet[int].getId());
							//subList.setLineItemValue('custpage_sublist_ffi', line, ffiText);
							//subList.setLineItemValue('custpage_sublist_finish_type', line, finishTypeText);
							subList.setLineItemValue('custpage_sublist_ffi', line, searchResultSet[int].getText('custbody_bbs_wo_ffi'));
							subList.setLineItemValue('custpage_sublist_finish_type', line, searchResultSet[int].getText('custbody_bbs_wo_finish'));
							subList.setLineItemValue('custpage_sublist_so_status', line, searchResultSet[int].getText('custbody_bbs_commitment_status','createdFrom'));
					//	}
				}
		
				switch(mode)
				{
				case 'C':
					form.addSubmitButton('Create Production Batches');
					
					break;
					
				case 'U':
					form.addSubmitButton('Assign Selected Works Orders');
				
					break;
				}
				
				//form.addField('custpage_remaining', 'text', 'Remaining', null, null).setDefaultValue(nlapiGetContext().getRemainingUsage());
				
				break;
			}
		
		//Write the response
		//
		response.writePage(form);
	}
	else
	{
		//Post request - so process the returned form
		//
		
		//Get the stage of the manpack processing we are at
		//
		var stage = Number(request.getParameter('custpage_stage'));
		
		switch(stage)
		{
			case 1:

				var customerId = request.getParameter('custpage_customer_select');
				var belongsToId = request.getParameter('custpage_asym_belongs_select');
				var productionBatchId = request.getParameter('custpage_production_batch');
				var ffi = request.getParameter('custpage_ffi_select');
				var mode = request.getParameter('custpage_mode');
				var solink = request.getParameter('custpage_solink');
				var socommitstatus = request.getParameter('custpage_so_commit_select');
				var socommitstatustext = request.getParameter('custpage_so_com_text');
				var soid = request.getParameter('custpage_so_select');
				var sotext = request.getParameter('custpage_so_text');
				
				//Build up the parameters so we can call this suitelet again, but move it on to the next stage
				//
				var params = new Array();
				params['customerid'] = customerId;
				params['belongstoid'] = belongsToId;
				params['productionbatchid'] = productionBatchId;
				params['stage'] = '2';
				params['ffi'] = ffi;
				params['mode'] = mode;
				params['solink'] = solink;
				params['socommitstatus'] = socommitstatus;
				params['socommitstatustext'] = socommitstatustext;
				params['soid'] = soid;
				params['sotext'] = sotext;
				
				response.sendRedirect('SUITELET','customscript_bbs_assign_wo_suitelet', 'customdeploy_bbs_assign_wo_suitelet', null, params);
				
				break;
				
			case 2:
				
				var lineCount = request.getLineItemCount('custpage_sublist_items');
				var productionBatchId = request.getParameter('custpage_production_batch');
				var mode = request.getParameter('custpage_mode');
				
				switch(mode)
				{
				case 'U':
					
					//Find all the ticked items & their quantities
					//
					for (var int = 1; int <= lineCount; int++) 
					{
						var ticked = request.getLineItemValue('custpage_sublist_items', 'custpage_sublist_tick', int);
						
						if (ticked == 'T')
							{
								var woId = request.getLineItemValue('custpage_sublist_items', 'custpage_sublist_id', int);
								
								var woRecord = nlapiLoadRecord('workorder', woId);
								woRecord.setFieldValue('custbody_bbs_wo_batch', productionBatchId);
								nlapiSubmitRecord(woRecord, false, true);
							}
					}
					
					response.sendRedirect('RECORD', 'customrecord_bbs_assembly_batch', productionBatchId, true, null);
					
					break;
					
				case 'C':
					var woArray = {};
					
					for (var int = 1; int <= lineCount; int++) 
					{
						var ticked = request.getLineItemValue('custpage_sublist_items', 'custpage_sublist_tick', int);
						
						if (ticked == 'T')
							{
							var woId = request.getLineItemValue('custpage_sublist_items', 'custpage_sublist_id', int);
							var belongsTo = request.getLineItemValue('custpage_sublist_items', 'custpage_sublist_belongs', int);
							var ffi = request.getLineItemValue('custpage_sublist_items', 'custpage_sublist_ffi', int);
							
							var key = belongsTo + ' - ' + ffi;
							
							if(!woArray[key])
								{
									woArray[key] = [woId];
								}
							else
								{
									woArray[key].push(woId);
								}
							}
					}
					
					var prodBatchId = '';
					
					for (var woKey in woArray) 
					{
						var prodBatchRecord = nlapiCreateRecord('customrecord_bbs_assembly_batch');
						prodBatchRecord.setFieldValue('custrecord_bbs_bat_description',woKey);
						
						prodBatchId = nlapiSubmitRecord(prodBatchRecord, true, true);
						
						woIds = woArray[woKey];
						
						for (var int2 = 0; int2 < woIds.length; int2++) 
						{
							var woRecord = nlapiLoadRecord('workorder', woIds[int2]);
							woRecord.setFieldValue('custbody_bbs_wo_batch', prodBatchId);
							nlapiSubmitRecord(woRecord, false, true);
						}
					}
					
					response.sendRedirect('RECORD', 'customrecord_bbs_assembly_batch', prodBatchId, true, null);
					
					break;
				}
				
				break;
		}
	}
}

function getItemRecType(ItemType)
{
	var itemType = '';
	
	switch(ItemType)
	{
		case 'InvtPart':
			itemType = 'inventoryitem';
			break;
			
		case 'Assembly':
			itemType = 'assemblyitem';
			break;
			
		case 'NonInvtPart':
			itemType = 'noninventoryitem';
			break;
	}

	return itemType;
}