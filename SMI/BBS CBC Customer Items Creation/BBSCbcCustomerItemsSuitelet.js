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
function cbcCustomerItemsSuitelet(request, response){
	
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
		var custPriceLevelParam = request.getParameter('custpricelevel');
		var custCurrencyParam = request.getParameter('custcurrency');
		var gradeIdParam = request.getParameter('gradeid');
		var gradeTxtParam = request.getParameter('gradetxt');
		//var budgetIdParam = request.getParameter('budgetid');
		//var budgetTxtParam = request.getParameter('budgettxt');
		var baseParentsParam = request.getParameter('baseparents');
		var sessionParam = request.getParameter('session');
		
		stageParam = (stageParam == 0 ? 1 : stageParam);
		
		
		//=====================================================================
		// Form creation
		//=====================================================================
		//
		var form = nlapiCreateForm('CBC Create Customer Items', false);
		form.setScript('customscript_bbs_create_cust_items_cl');
		form.setTitle('CBC Create Customer Items');
		
		
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
		
		var custPriceLevelField = form.addField('custpage_cust_pricel_param', 'text', 'customer price level');
		custPriceLevelField.setDisplayType('hidden');
		custPriceLevelField.setDefaultValue(custPriceLevelParam);
		
		var custCurrencyField = form.addField('custpage_cust_currency_param', 'text', 'customer currency');
		custCurrencyField.setDisplayType('hidden');
		custCurrencyField.setDefaultValue(custCurrencyParam);
		
		//Grade
		//
		var gradeIdField = form.addField('custpage_grade_id_param', 'text', 'grade id');
		gradeIdField.setDisplayType('hidden');
		gradeIdField.setDefaultValue(gradeIdParam);
		
		var gradeTxtField = form.addField('custpage_grade_txt_param', 'text', 'grade text');
		gradeTxtField.setDisplayType('hidden');
		gradeTxtField.setDefaultValue(gradeTxtParam);
		
		//Budget Type
		//
		//var budgetTypeIdField = form.addField('custpage_budget_id_param', 'text', 'budget type id');
		//budgetTypeIdField.setDisplayType('hidden');
		//budgetTypeIdField.setDefaultValue(budgetIdParam);
		
		//var budgetTypeTxtField = form.addField('custpage_budget_txt_param', 'text', 'budget type text');
		//budgetTypeTxtField.setDisplayType('hidden');
		//budgetTypeTxtField.setDefaultValue(budgetTxtParam);
		
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
		
		//Session
		//
		var sessionField = form.addField('custpage_session_param', 'text', 'session');
		sessionField.setDisplayType('hidden');
		sessionField.setDefaultValue(sessionParam);
		
		
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
		var fieldGroupGradeBudget = form.addFieldGroup('custpage_grp_grade_budget', 'Grade');
		fieldGroupGradeBudget.setSingleColumn(false);
		
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
					//=====================================================================
					// Stage 1 - Get the customer, Finish Item, Finish Ref & Base Parent(s)
					//=====================================================================
					//
				
					//Initialise the base parent parameter field
					//
					var dummyObject = {};
					baseParentIdField.setDefaultValue(JSON.stringify(dummyObject));
				
					//Get a session
					//
					var sessionId = libCreateSession();
					sessionField.setDefaultValue(sessionId);
					
					//Add a select field to pick the customer from
					//
					var customerField = form.addField('custpage_customer_select', 'select', 'Customer', 'customer', 'custpage_grp_customer');
					customerField.setMandatory(true);
					
					//Add a select field to pick the grade from
					//
					var gradeField = form.addField('custpage_grade_select', 'select', 'CBC Grade', 'customlist_cbc_grade', 'custpage_grp_grade_budget');
					gradeField.setMandatory(true);
					
					//Add a select field to pick the budget from
					//
					//var budgetField = form.addField('custpage_budget_type_select', 'select', 'CBC Budget Type', 'customlist_cbc_budget_management_type', 'custpage_grp_grade_budget');
					//budgetField.setMandatory(true);
					
					
					//Add a filter field to limit the base parent
					//
					var baseParentFilter2Field = form.addField('custpage_base_parent_filter2', 'text', 'Base Parent Code Filter - Starts With', null, 'custpage_grp_parent');
					var baseParentFilterField = form.addField('custpage_base_parent_filter', 'text', 'Base Parent Description Filter - Contains', null, 'custpage_grp_parent');
					
					//Add a filter field to limit the item type
					//
					var itemTypeField = form.addField('custpage_item_type_select', 'select', 'Item Type', null, 'custpage_grp_parent');
					itemTypeField.addSelectOption(0, '--None--', true);
					itemTypeField.addSelectOption(1, 'Inventory Items', false);
					itemTypeField.addSelectOption(2, 'Assembly Items', false);
					itemTypeField.addSelectOption(3, 'Both', false);
						
					//Add a select field to pick the base parent from
					//
					var baseParentField = form.addField('custpage_base_parent_select', 'multiselect', 'Base Parent Items', null, 'custpage_grp_parent');
					baseParentField.setDisplaySize(900, 10);
					baseParentField.setBreakType('startcol');
					
					var messageField = form.addField('custpage_base_message', 'inlinehtml', '', null, 'custpage_grp_parent');
					messageField.setDefaultValue('<p style="font-size:16px; color:DarkRed;">Maximum Rows Returned Is Limited To 400'+ '</p>');
					
					var messageField = form.addField('custpage_base_parent_count', 'text', '', null, 'custpage_grp_parent');
					messageField.setDisplayType('inline');
					
					
					//Add a submit button to the form
					//
					form.addSubmitButton('Select Base Item Children');
	
					break;
			
			case 2:
					//=====================================================================
					// Stage 2 - Display sublists of child items for each parent
					//=====================================================================
					//
				
					//Add fields to show the previous selections
					//
					var customerField = form.addField('custpage_customer_select', 'text', 'Customer', null, 'custpage_grp_customer');
					var gradeField = form.addField('custpage_grade_select', 'text', 'Grade', null, 'custpage_grp_grade_budget');
					//var budgetField = form.addField('custpage_budget_type_select', 'text', 'Budget Type', null, 'custpage_grp_grade_budget');
					var baseParentField = form.addField('custpage_base_parent_select', 'textarea', 'Base Parent Items', null, 'custpage_grp_parent');
					
					//Disable the fields from entry
					//
					customerField.setDisplayType('disabled');
					gradeField.setDisplayType('disabled');
					//budgetField.setDisplayType('disabled');
					baseParentField.setDisplayType('disabled');
					
					//Set the default values
					customerField.setDefaultValue(custTxtParam);
					gradeField.setDefaultValue(gradeTxtParam);
					//budgetField.setDefaultValue(budgetTxtParam);
					
					//Create a tab for the sublists
					//
					var childItemsTab = form.addTab('custpage_child_items_tab', 'Child Items');
					childItemsTab.setLabel('Child Items');
					
					//Get the session data
					//
					var sessionData = libGetSessionData(sessionParam);
					var filters = {};
					
					if(sessionData != null && sessionData != '')
						{
							filters = JSON.parse(sessionData);
						}
					
					//Process the base parent items
					//
					var baseParents = JSON.parse(baseParentsParam);

					baseParentField.setDisplaySize(90, (Object.keys(baseParents)).length);
					
					var baseParentString = '';
					
					for ( var baseParentId in baseParents) 
						{
							//Show the base parent items that we have selected in the text area
							//
							baseParentString += baseParents[baseParentId] + '\n';
							baseParentField.setDefaultValue(baseParentString);

							//Create & populate a sublist for each base parent item we have selected
							//
							var subtabId = 'custpage_subtab_' + baseParentId.toString();
							var sublistId = 'custpage_sublist_' + baseParentId.toString();
							var allocFieldId = 'custpage_def_alloc_' + baseParentId.toString();
							var pointsFieldId = 'custpage_def_points_' + baseParentId.toString();
							
							var subtab = form.addSubTab(subtabId, baseParents[baseParentId], 'custpage_child_items_tab');
							var allocTypeField = form.addField(allocFieldId, 'select', 'Allocation Type', 'customlist_cbc_item_allocation_type', subtabId);
							//allocTypeField.setMandatory(true);
							
							form.addField(pointsFieldId, 'integer', 'Points', null, subtabId);
							
							var sublist = form.addSubList(sublistId, 'list', baseParents[baseParentId], subtabId);
							sublist.addMarkAllButtons();
							sublist.setLabel(baseParents[baseParentId]);
							
							var buttonFunction = "updateAllocationType('" + baseParentId.toString() + "')";
							sublist.addButton(sublistId + '_update_alloc', 'Update Allocation Type', buttonFunction);
							
							var buttonFunction2 = "updatePoints('" + baseParentId.toString() + "')";
							sublist.addButton(sublistId + '_update_points', 'Update Points', buttonFunction2);
							
							
							sublist.addRefreshButton();
							
							var sublistFieldTick = sublist.addField(sublistId + '_tick', 'checkbox', 'Select', null);
							var sublistFieldId = sublist.addField(sublistId + '_id', 'text', 'Id', null);
							var sublistFieldName = sublist.addField(sublistId + '_name', 'text', 'Name', null);
							var sublistFieldOpt1 = sublist.addField(sublistId + '_opt1', 'text', 'Item Category', null);
							var sublistFieldOpt2 = sublist.addField(sublistId + '_opt2', 'text', 'Colour', null);
							var sublistFieldOpt3 = sublist.addField(sublistId + '_opt3', 'text', 'Size1', null);
							var sublistFieldOpt4 = sublist.addField(sublistId + '_opt4', 'text', 'Size2', null);
							var sublistFieldAlloc = sublist.addField(sublistId + '_alloc', 'select', 'Allocation Type', 'customlist_cbc_item_allocation_type');
							var sublistFieldPoints = sublist.addField(sublistId + '_points', 'integer', 'Points', null);
							sublistFieldAlloc.setMandatory(true);
							//Set entry fields
							//
							sublistFieldAlloc.setDisplayType('entry');
							sublistFieldPoints.setDisplayType('entry');
							
							//Hide the id field
							//
							sublistFieldId.setDisplayType('hidden');
							
							//Read the base parent record
							//
							var baseParentRecord = null;
							
							try
								{
									baseParentRecord = nlapiLoadRecord('inventoryitem', baseParentId);
								}
							catch(err)
								{
									baseParentRecord = null;
								}
							
							if(baseParentRecord == null)
								{
									try
										{
											baseParentRecord = nlapiLoadRecord('assemblyitem', baseParentId);
										}
									catch(err)
										{
											baseParentRecord = null;
										}
								}
							
							if(baseParentRecord)
								{
									//Process the child items
									//
									var matrixCount = baseParentRecord.getLineItemCount('matrixmach');
									var matrixIds = [];
									
									//Get the id's of all the matrix child items
									//
									for (var int2 = 1; int2 <= matrixCount; int2++) 
										{
											matrixIds.push(baseParentRecord.getLineItemValue('matrixmach', 'mtrxid', int2));
										}
									
									//Extract the filters for the specific parent
									//
									var parentFiltersColour = [];
									var parentFiltersSize1 = [];
									var parentFiltersSize2 = [];
									
									parentFilters = filters[baseParentId];
									
									if(parentFilters != null)
										{
											try
												{
													parentFiltersColour = parentFilters[0];
													parentFiltersSize1 = parentFilters[1];
													parentFiltersSize2 = parentFilters[2];
												}
											catch(err)
												{
												
												}
										}
									
									//Search for the matrix children
									//
									var matrixChildFilter = [
															   ["matrixchild","is","T"], 
															   "AND", 
															   ["internalid","anyof",matrixIds], 
															   "AND", 
															   ["isinactive","is","F"]
															];
									
									//Add additional filters based on colour, size1 & size2
									//
									if(parentFiltersColour.length > 0)
										{
											matrixChildFilter.push("AND", ["custitem_bbs_item_colour","anyof",parentFiltersColour]);
										}
								
									if(parentFiltersSize1.length > 0)
										{
											matrixChildFilter.push("AND", ["custitem_bbs_item_size1","anyof",parentFiltersSize1]);
										}
								
									if(parentFiltersSize2.length > 0)
										{
											matrixChildFilter.push("AND", ["custitem_bbs_item_size2","anyof",parentFiltersSize2]);
										}
								
									//Run the search
									//
									var matrixChildSearch = nlapiSearchRecord("item",null,
											matrixChildFilter, 
											[
											   new nlobjSearchColumn("itemid",null,null), 
											   new nlobjSearchColumn("displayname",null,null), 
											   new nlobjSearchColumn("salesdescription",null,null), 
											   new nlobjSearchColumn("type",null,null), 
											   new nlobjSearchColumn("baseprice",null,null), 
											   new nlobjSearchColumn("averagecost",null,null), 
											   new nlobjSearchColumn("custitem_bbs_item_category",null,null), 
											   new nlobjSearchColumn("custitem_bbs_item_colour",null,null), 
											   new nlobjSearchColumn("custitem_bbs_item_size1",null,null), 
											   new nlobjSearchColumn("custitem_bbs_item_size2",null,null), 
											   new nlobjSearchColumn("custitem_bbs_matrix_item_seq",null,null).setSort(false)
											]
											);
									
									//Instantiate objects to hold the possible colour selections
									//
									var matrixColours = {};
									var matrixSize1s = {};
									var matrixSize2s = {};
									
									if(matrixChildSearch)
										{
											//Loop through the search results
											//
											for (var int3 = 0; int3 < matrixChildSearch.length; int3++) 
												{
													var matrixId = matrixChildSearch[int3].getId();
													var matrixName = matrixChildSearch[int3].getValue('itemid');
													var matrixOpt1 = matrixChildSearch[int3].getText('custitem_bbs_item_category');
													var matrixOpt2 = matrixChildSearch[int3].getText('custitem_bbs_item_colour');
													var matrixOpt3 = matrixChildSearch[int3].getText('custitem_bbs_item_size1');
													var matrixOpt4 = matrixChildSearch[int3].getText('custitem_bbs_item_size2');
													var matrixOpt2Id = matrixChildSearch[int3].getValue('custitem_bbs_item_colour');
													var matrixOpt3Id = matrixChildSearch[int3].getValue('custitem_bbs_item_size1');
													var matrixOpt4Id = matrixChildSearch[int3].getValue('custitem_bbs_item_size2');
													
													//Build up the list of available colours & sizes
													//
													matrixColours[matrixOpt2Id] = matrixOpt2;
													matrixSize1s[matrixOpt3Id] = matrixOpt3;
													matrixSize2s[matrixOpt4Id] = matrixOpt4;
													
													//Populate the sublist
													//
													var sublistLine = int3 + 1;
													
													sublist.setLineItemValue(sublistId + '_id', sublistLine, matrixId);
													sublist.setLineItemValue(sublistId + '_name', sublistLine, matrixName);
													sublist.setLineItemValue(sublistId + '_opt1', sublistLine, matrixOpt1);
													sublist.setLineItemValue(sublistId + '_opt2', sublistLine, matrixOpt2);
													sublist.setLineItemValue(sublistId + '_opt3', sublistLine, matrixOpt3);
													sublist.setLineItemValue(sublistId + '_opt4', sublistLine, matrixOpt4);
												}
										}
									
									//Add the "filter by" fields
									//
									var filterByColour = form.addField('custpage_filter_colour_' + baseParentId.toString(), 'multiselect', 'Filter by Colour', null, subtabId);
									for ( var matrixColour in matrixColours) 
										{
											filterByColour.addSelectOption(matrixColour, matrixColours[matrixColour], false);
										}
									
									var filterBySize1 = form.addField('custpage_filter_size1_' + baseParentId.toString(), 'multiselect', 'Filter by Size1', null, subtabId);
									for ( var matrixSize1 in matrixSize1s) 
										{
											filterBySize1.addSelectOption(matrixSize1, matrixSize1s[matrixSize1], false);
										}
									
									var filterBySize2 = form.addField('custpage_filter_size2_' + baseParentId.toString(), 'multiselect', 'Filter by Size2', null, subtabId);
									for ( var matrixSize2 in matrixSize2s) 
										{
											filterBySize2.addSelectOption(matrixSize2, matrixSize2s[matrixSize2], false);
										}
								}
						}

					//Add a submit button
					//
					form.addSubmitButton('Create Customer Items');
					
					break;
					
			case 3:
					//=====================================================================
					// Stage 3 - Display message about email to be received
					//=====================================================================
					//
				
					//Get the context & the users email address
					//
					var context = nlapiGetContext();
					var emailAddress = context.getEmail();
					
					//Add a message field 
					//
					var messageField = form.addField('custpage_message', 'textarea', 'Message', null, null);
					messageField.setDisplaySize(120, 4);
					messageField.setDisplayType('readonly');
					messageField.setDefaultValue('An email will be sent to ' + emailAddress + ' when the customer item creation process has completed.');
				
					libClearSessionData(sessionParam);
					
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
				//=====================================================================
				// Stage 1 - Process the chosen customer, Finish Item, Finish Ref & 
				// Base Parent(s), then move to stage 2
				//=====================================================================
				//
				
				//Retrieve the parameters from the form fields
				//
				custIdParam = request.getParameter('custpage_cust_id_param');
				custTxtParam = request.getParameter('custpage_cust_txt_param');
				custPriceLevelParam = request.getParameter('custpage_cust_pricel_param');
				custCurrencyParam = request.getParameter('custpage_cust_currency_param');
				gradeIdParam = request.getParameter('custpage_grade_id_param');
				gradeTxtParam = request.getParameter('custpage_grade_txt_param');
				//budgetIdParam = request.getParameter('custpage_budget_id_param');
				//budgetTxtParam = request.getParameter('custpage_budget_txt_param');
				baseParentsParam = request.getParameter('custpage_baseparents_param');
				sessionParam = request.getParameter('custpage_session_param');
				
				//Build up the parameters so we can call this suitelet again, but move it on to the next stage
				//
				var params = new Array();
				params['custid'] = custIdParam;
				params['custtxt'] = custTxtParam;
				params['custpricelevel'] = custPriceLevelParam;
				params['custcurrency'] = custCurrencyParam;
				params['gradeid'] = gradeIdParam;
				params['gradetxt'] = gradeTxtParam;
				//params['budgetid'] = budgetIdParam;
				//params['budgettxt'] = budgetTxtParam;
				params['baseparents'] = baseParentsParam;
				params['session'] = sessionParam;
				params['stage'] = stage + 1;
				
				var context = nlapiGetContext();
				response.sendRedirect('SUITELET',context.getScriptId(), context.getDeploymentId(), null, params);
				
				break;
				
			case 2:
				//=====================================================================
				// Stage 2 - Process the chosen child items, submit the scheduled script
				// then move to stage 3
				//=====================================================================
				//
				
				//Get the base parents so we can iterate through them
				//
				baseParentsParam = request.getParameter('custpage_baseparents_param');
				var baseParents = JSON.parse(baseParentsParam);
				
				//Get the other data needed from the parameters
				//
				custIdParam = request.getParameter('custpage_cust_id_param');
				gradeIdParam = request.getParameter('custpage_grade_id_param');
				budgetIdParam = request.getParameter('custpage_budget_id_param');
				
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
								var allocationType = request.getLineItemValue(sublistId, sublistId + '_alloc', int);
								var points = request.getLineItemValue(sublistId, sublistId + '_points', int);
								var name = request.getLineItemValue(sublistId, sublistId + '_name', int);
								var data = [item,allocationType,points,name];
								
								//Build up the parent & child object
								//
								parentAndChild[baseParentId].push(data);
							}
					}
				}
				
				//Now we have the parent & child object we need to pass it to the scheduled script
				//
				var scheduleParams = {
							custscript_bbs_cbc_parent_child: JSON.stringify(parentAndChild), 
							custscript_bbs_cbc_customer_id: custIdParam,
							custscript_bbs_cbc_grade_id: gradeIdParam
							};
				
				nlapiScheduleScript('customscript_bbs_create_cust_items_sh', null, scheduleParams);

				//Call the next stage
				//
				var sessionId = request.getParameter('custpage_session_param');
				var params = new Array();
				params['stage'] = stage + 1;
				params['session'] = sessionId;
				
				var context = nlapiGetContext();
				response.sendRedirect('SUITELET',context.getScriptId(), context.getDeploymentId(), null, params);
				
				break;
		}
	}
}

//=====================================================================
// Functions
//=====================================================================
//

