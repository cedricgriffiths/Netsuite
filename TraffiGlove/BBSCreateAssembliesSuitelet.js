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
function createAssembliesSuitelet(request, response){
	
	//=====================================================================
	// Get request - so return a form for the user to process
	//=====================================================================
	//
	
	if (request.getMethod() == 'GET') 
	{
		//=====================================================================
		// Parameters passed to the suitelet
		//=====================================================================
		//
		var stageParam = Number(request.getParameter('stage'));
		var custIdParam = request.getParameter('custid');
		var custTxtParam = request.getParameter('custtxt');
		var finishIdParam = request.getParameter('finishid');
		var finishTxtParam = request.getParameter('finishtxt');
		var finishRefIdParam = request.getParameter('finishrefid');
		var finishRefTxtParam = request.getParameter('finishreftxt');
		var baseParentsParam = request.getParameter('baseparents');
		
		stageParam = (stageParam == 0 ? 1 : stageParam);
		
		
		//=====================================================================
		// Form creation
		//=====================================================================
		//
		var form = nlapiCreateForm('Create Assemblies', false);
		form.setScript('customscript_bbs_create_assem_client');
		form.setTitle('Create Assemblies');
		
		
		//=====================================================================
		// Hidden fields to pass data to the POST section
		//=====================================================================
		//
		
		//Customer
		//
		var custIdField = form.addField('custpage_cust_id_param', 'text', 'customer id');
		custIdField.setDisplayType('hidden');
		custIdField.setDefaultValue(custIdParam);
		
		var custTxtField = form.addField('custpage_cust_txt_param', 'text', 'customer text');
		custTxtField.setDisplayType('hidden');
		custTxtField.setDefaultValue(custTxtParam);
		
		//Finish Item
		//
		var finishIdField = form.addField('custpage_finish_id_param', 'text', 'finish id');
		finishIdField.setDisplayType('hidden');
		finishIdField.setDefaultValue(finishIdParam);
		
		var finishTxtField = form.addField('custpage_finish_txt_param', 'text', 'finish text');
		finishTxtField.setDisplayType('hidden');
		finishTxtField.setDefaultValue(finishTxtParam);
		
		//Finish Ref
		//
		var finishRefIdField = form.addField('custpage_finishref_id_param', 'text', 'finishref id');
		finishRefIdField.setDisplayType('hidden');
		finishRefIdField.setDefaultValue(finishRefIdParam);
		
		var finishRefTxtField = form.addField('custpage_finishref_txt_param', 'text', 'finishref text');
		finishRefTxtField.setDisplayType('hidden');
		finishRefTxtField.setDefaultValue(finishRefTxtParam);
		
		//Base Parent
		//
		var baseParentIdField = form.addField('custpage_baseparents_param', 'longtext', 'base parents');
		baseParentIdField.setDisplayType('hidden');
		baseParentIdField.setDefaultValue(baseParentsParam);
		
		//Stage
		//
		var stageField = form.addField('custpage_stage', 'integer', 'stage');
		stageField.setDisplayType('hidden');
		stageField.setDefaultValue(stageParam);
		
		
		//=====================================================================
		// Field groups creation
		//=====================================================================
		//
		
		//Add a field group for customer/parent
		//
		var fieldGroupCustomer = form.addFieldGroup('custpage_grp_customer', 'Customer');
		fieldGroupCustomer.setSingleColumn(false);
		
		//Add a field group for finish
		//
		var fieldGroupFinish = form.addFieldGroup('custpage_grp_finish', 'Finish');
		fieldGroupFinish.setSingleColumn(false);
		
		//Add a field group for parent item
		//
		var fieldGroupParent = form.addFieldGroup('custpage_grp_parent', 'Base Parent');
		fieldGroupParent.setSingleColumn(false);
		
		
		//=====================================================================
		// Form layout based on stage number
		//=====================================================================
		//
		switch(stageParam)
		{
			case 1:	
					//Add a select field to pick the customer from
					//
					var customerField = form.addField('custpage_customer_select', 'select', 'Customer', 'customer', 'custpage_grp_customer');
					
					//Add a select field to pick the finish process item from
					//
					var finishProcessItemField = form.addField('custpage_finish_item_select', 'select', 'Finish Process Item', null, 'custpage_grp_finish');
					
					//Add a select field to pick the finish ref from
					//
					var finishRefField = form.addField('custpage_finish_ref_select', 'select', 'Finish Ref', null, 'custpage_grp_finish');
					
					//Add a select field to pick the base parent from
					//
					var baseParentField = form.addField('custpage_base_parent_select', 'multiselect', 'Base Parent Items', null, 'custpage_grp_parent');
					baseParentField.setDisplaySize(600, 10);
					
					//Add a filter field to limit the base parent
					//
					var baseParentFilterField = form.addField('custpage_base_parent_filter', 'text', 'Base Parent Filter', null, 'custpage_grp_parent');
					
					var inventoryitemSearch = nlapiCreateSearch("inventoryitem",
							[
							   ["type","anyof","InvtPart"], 
							   "AND", 
							   ["matrix","is","T"]
							], 
							[
							   new nlobjSearchColumn("itemid",null,null), 
							   new nlobjSearchColumn("salesdescription",null,null).setSort(false)
							]
							);
					
					var searchResult = inventoryitemSearch.runSearch();
					
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
						
					//Copy the results to the select field
					//
					var line = 1;
					
					for (var int = 0; int < searchResultSet.length; int++) 
						{
							var baseParentId = searchResultSet[int].getId();
							var baseParentText = searchResultSet[int].getValue('itemid') + ' - ' + searchResultSet[int].getValue('salesdescription');
							
							baseParentField.addSelectOption(baseParentId, baseParentText, false);

						}
					
					
					//Add a submit button to the form
					//
					form.addSubmitButton('Select Base Item Children');
	
					break;
			
			case 2:	
					//Add fields to show the previous selections
					//
					var customerField = form.addField('custpage_customer_select', 'text', 'Customer', null, 'custpage_grp_customer');
					var finishProcessItemField = form.addField('custpage_finish_item_select', 'text', 'Finish Process Item', null, 'custpage_grp_finish');
					var finishRefField = form.addField('custpage_finish_ref_select', 'text', 'Finish Ref', null, 'custpage_grp_finish');
					var baseParentField = form.addField('custpage_base_parent_select', 'textarea', 'Base Parent Items', null, 'custpage_grp_parent');
					
					//Disable the fields from entry
					//
					customerField.setDisplayType('disabled');
					finishProcessItemField.setDisplayType('disabled');
					finishRefField.setDisplayType('disabled');
					baseParentField.setDisplayType('disabled');
					
					//Set the default values
					customerField.setDefaultValue(custTxtParam);
					finishProcessItemField.setDefaultValue(finishTxtParam);
					finishRefField.setDefaultValue(finishRefTxtParam);
					
					//Create a tab for the sublists
					//
					var childItemsTab = form.addTab('custpage_child_items_tab', 'Child Items');
					childItemsTab.setLabel('Child Items');
					
					var dummyTab = form.addTab('custpage_dummy_tab', '');
					form.addField('custpage_dummy_2', 'text', 'Dummy 2', null, 'custpage_dummy_tab');
					
					//Process the base parent items
					//
					var baseParents = JSON.parse(baseParentsParam);

					baseParentField.setDisplaySize(80, (Object.keys(baseParents)).length);
					
					var baseParentString = '';
					
					for ( var baseParentId in baseParents) 
						{
							//Show the base parent items that we have selected in the text area
							//
							baseParentString += baseParents[baseParentId] + '\n';
							baseParentField.setDefaultValue(baseParentString);

							//Create & populate a sublist for each base parent item we have selected
							//
							var sublistId = 'custpage_sublist_' + baseParentId.toString();
							
							var sublist = form.addSubList(sublistId, 'list', baseParents[baseParentId], 'custpage_child_items_tab');
							sublist.addMarkAllButtons();
							
							var sublistFieldTick = sublist.addField(sublistId + '_tick', 'checkbox', 'Select', null);
							var sublistFieldId = sublist.addField(sublistId + '_id', 'text', 'Id', null);
							var sublistFieldName = sublist.addField(sublistId + '_name', 'text', 'Name', null);
							var sublistFieldOpt1 = sublist.addField(sublistId + '_opt1', 'text', 'Colour', null);
							var sublistFieldOpt2 = sublist.addField(sublistId + '_opt2', 'text', 'Item Category', null);
							var sublistFieldOpt3 = sublist.addField(sublistId + '_opt3', 'text', 'Size1', null);
							var sublistFieldOpt4 = sublist.addField(sublistId + '_opt4', 'text', 'Size2', null);
							
							//Hide the id field
							//
							sublistFieldId.setDisplayType('hidden');
							
							//Read the base parent record
							//
							var baseParentRecord = nlapiLoadRecord('inventoryitem', baseParentId);
							
							if(baseParentRecord)
								{
									//Process the child items
									//
									var matrixCount = baseParentRecord.getLineItemCount('matrixmach');
									
									for (var int2 = 1; int2 <= matrixCount; int2++) 
										{
											var matrixId = baseParentRecord.getLineItemValue('matrixmach', 'mtrxid', int2);
											var matrixName = baseParentRecord.getLineItemValue('matrixmach', 'mtrxname', int2);
											var matrixOpt1 = baseParentRecord.getLineItemValue('matrixmach', 'mtrxoption1', int2);
											var matrixOpt2 = baseParentRecord.getLineItemValue('matrixmach', 'mtrxoption2', int2);
											var matrixOpt3 = baseParentRecord.getLineItemValue('matrixmach', 'mtrxoption3', int2);
											var matrixOpt4 = baseParentRecord.getLineItemValue('matrixmach', 'mtrxoption4', int2);
											
											//Populate the sublist
											//
											sublist.setLineItemValue(sublistId + '_id', int2, matrixId);
											sublist.setLineItemValue(sublistId + '_name', int2, matrixName);
											sublist.setLineItemValue(sublistId + '_opt1', int2, matrixOpt1);
											sublist.setLineItemValue(sublistId + '_opt2', int2, matrixOpt2);
											sublist.setLineItemValue(sublistId + '_opt3', int2, matrixOpt3);
											sublist.setLineItemValue(sublistId + '_opt4', int2, matrixOpt4);
										}
								}
						}

					//Add a submit button
					//
					form.addSubmitButton('Create Assemblies');
					
					break;
		}
			
		//Write the response
		//
		response.writePage(form);
	}
	else
	{
		//=====================================================================
		// Post request - so process the returned form
		//=====================================================================
		//
		
		//Get the stage 
		//
		var stage = Number(request.getParameter('custpage_stage'));
		
		switch(stage)
		{
			case 1:
				custIdParam = request.getParameter('custpage_cust_id_param');
				custTxtParam = request.getParameter('custpage_cust_txt_param');
				finishIdParam = request.getParameter('custpage_finish_id_param');
				finishTxtParam = request.getParameter('custpage_finish_txt_param');
				finishRefIdParam = request.getParameter('custpage_finishref_id_param');
				finishRefTxtParam = request.getParameter('custpage_finishref_txt_param');
				baseParentsParam = request.getParameter('custpage_baseparents_param');
				
				//Build up the parameters so we can call this suitelet again, but move it on to the next stage
				//
				var params = new Array();
				params['custid'] = custIdParam;
				params['custtxt'] = custTxtParam;
				params['finishid'] = finishIdParam;
				params['finishtxt'] = finishTxtParam;
				params['finishrefid'] = finishRefIdParam;
				params['finishreftxt'] = finishRefTxtParam;
				params['baseparents'] = baseParentsParam;
				
				params['stage'] = stage + 1;
				
				var context = nlapiGetContext();
				
				response.sendRedirect('SUITELET',context.getScriptId(), context.getDeploymentId(), null, params);
				
				break;
				
			case 2:
				//Get the base parents so we can iterate through them
				//
				baseParentsParam = request.getParameter('custpage_baseparents_param');
				var baseParents = JSON.parse(baseParentsParam);
				
				//Get the other data needed from the parameters
				//
				custIdParam = request.getParameter('custpage_cust_id_param');
				finishIdParam = request.getParameter('custpage_finish_id_param');
				finishRefIdParam = request.getParameter('custpage_finishref_id_param');
				
				//Create a parent & child object
				//
				var parentAndChild = {};
				
				//Loop through the base parents sublists
				//
				for ( var baseParentId in baseParents) 
				{
					var sublistId = 'custpage_sublist_' + baseParentId.toString();
					var lineCount = request.getLineItemCount(sublistId);
					
					parentAndChild[baseParentId] = [];
					
					//Loop through the rows in the sublist
					//
					for (var int = 1; int <= lineCount; int++) 
					{
						var ticked = request.getLineItemValue(sublistId, sublistId + '_tick', int);
						
						//Look for ticked lines
						//
						if (ticked == 'T')
							{
								var item = request.getLineItemValue(sublistId, sublistId + '_id', int);
								
								//Build up the parent & child object
								//
								parentAndChild[baseParentId].push(item);
							}
					}
				}
				
				//TODO - Now we have the parent & child object we need to process it somehow
				//
				var params = {
							custscript_bbs_parent_child: JSON.stringify(parentAndChild), 
							custscript_bbs_customer_id: custIdParam,
							custscript_bbs_finish_id: finishIdParam,
							custscript_bbs_finishref_id: finishRefIdParam,
							};
				
				nlapiScheduleScript('customscript_bbs_create_assem_scheduled', 'customdeploy_bbs_create_assem_scheduled', params);
				
				var xml = "<html><body><script>window.close();</script></body></html>";
				response.write(xml);
				
				break;
		}
	}
}

//=====================================================================
// Functions
//=====================================================================
//

