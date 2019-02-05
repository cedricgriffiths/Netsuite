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
		var custPriceLevelParam = request.getParameter('custpricelevel');
		var custCurrencyParam = request.getParameter('custcurrency');
		var finishIdParam = request.getParameter('finishid');
		var finishTxtParam = request.getParameter('finishtxt');
		var finishRefIdParam = request.getParameter('finishrefid');
		var finishRefTxtParam = request.getParameter('finishreftxt');
		var baseParentsParam = request.getParameter('baseparents');
		var sessionParam = request.getParameter('session');
		
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
		
		var custPriceLevelField = form.addField('custpage_cust_pricel_param', 'text', 'customer price level');
		custPriceLevelField.setDisplayType('hidden');
		custPriceLevelField.setDefaultValue(custPriceLevelParam);
		
		var custCurrencyField = form.addField('custpage_cust_currency_param', 'text', 'customer currency');
		custCurrencyField.setDisplayType('hidden');
		custCurrencyField.setDefaultValue(custCurrencyParam);
		
		
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
					
					//Add a select field to pick the finish process item from
					//
					var finishProcessItemField = form.addField('custpage_finish_item_select', 'select', 'Finish To Be Applied', null, 'custpage_grp_finish');
					
					//Add a select field to pick the finish ref from
					//
					var finishRefField = form.addField('custpage_finish_ref_select', 'select', 'Finish Ref', null, 'custpage_grp_finish');
					finishRefField.setDisplayType('disabled');
					
					//Add a select field to pick the base parent from
					//
					var baseParentField = form.addField('custpage_base_parent_select', 'multiselect', 'Base Parent Items', null, 'custpage_grp_parent');
					baseParentField.setDisplaySize(600, 10);
					
					//Add a filter field to limit the base parent
					//
					var baseParentFilter2Field = form.addField('custpage_base_parent_filter2', 'text', 'Base Parent Code Filter - Starts With', null, 'custpage_grp_parent');
					var baseParentFilterField = form.addField('custpage_base_parent_filter', 'text', 'Base Parent Description Filter - Contains', null, 'custpage_grp_parent');
					baseParentFilter2Field.setBreakType('startcol');
					
					var inventoryitemSearch = nlapiCreateSearch("inventoryitem",
							[
							   ["type","anyof","InvtPart"], 
							   "AND", 
							   ["matrix","is","T"], 
//SMI						   "AND", 
//SMI						   ["custitem_bbs_item_category","anyof","1","2","3"],
							   "AND", 
							   ["isinactive","is","F"]
							], 
							[
							   new nlobjSearchColumn("itemid",null,null).setSort(false), 
							   new nlobjSearchColumn("salesdescription",null,null)
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
					//=====================================================================
					// Stage 2 - Display sublists of child items for each parent
					//=====================================================================
					//
				
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
					
					//var dummyTab = form.addTab('custpage_dummy_tab', '');
					//form.addField('custpage_dummy_2', 'text', 'Dummy 2', null, 'custpage_dummy_tab');
					
					
					//Read the finish record
					//
					var finishRecord = nlapiLoadRecord('assemblyitem', finishIdParam);
					var finishCost = Number(0);
					var finishPrice = Number(0);
					
					//Calculate the cost of the finish
					//
					if(finishRecord)
						{
							//finishCost = Number(finishRecord.getFieldValue('custitem_bbs_item_cost'));
						
							var finishMembers = finishRecord.getLineItemCount('member');
							
							for (var finishMemberLine = 1; finishMemberLine <= finishMembers; finishMemberLine++) 
								{
									var memberId = finishRecord.getLineItemValue('member', 'item', finishMemberLine);
									var memberQuantity = Number(finishRecord.getLineItemValue('member', 'quantity', finishMemberLine));
									var memberType = finishRecord.getLineItemValue('member', 'sitemtype', finishMemberLine);
									var memberCost = Number(0);
									
									switch(memberType)
										{
											case 'InvtPart':
												
												memberCost = Number(nlapiLookupField('inventoryitem', memberId, 'averagecost', false)) * memberQuantity;
												break;
												
											case 'NonInvtPart':
												
												//memberCost = Number(nlapiLookupField('noninventoryitem', memberId, 'cost', false)) * memberQuantity;
												memberCost = Number(nlapiLookupField('noninventoryitem', memberId, 'custitem_bbs_embcost', false)) * memberQuantity;
												break;
										}
									
									finishCost += memberCost;
								}
						}
					
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
							var subtabId = 'custpage_subtab_' + baseParentId.toString();
							var sublistId = 'custpage_sublist_' + baseParentId.toString();
							var fieldId = 'custpage_def_sales_' + baseParentId.toString();
							var fieldFinishPriceId = 'custpage_fin_price_' + baseParentId.toString();
							
							var subtab = form.addSubTab(subtabId, baseParents[baseParentId], 'custpage_child_items_tab');
							form.addField(fieldId, 'currency', 'Sales Price', null, subtabId);
							
							var finishPriceField = form.addField(fieldFinishPriceId, 'currency', 'Customer Finish Price', null, subtabId);
							finishPriceField.setDisplayType('disabled');
							finishPriceField.setDefaultValue(finishPrice.toFixed(2));
							
							var sublist = form.addSubList(sublistId, 'list', baseParents[baseParentId], subtabId);
							sublist.addMarkAllButtons();
							sublist.setLabel(baseParents[baseParentId]);
							
							var buttionFunction = "updateSalesPrice('" + baseParentId.toString() + "')";
							sublist.addButton(sublistId + '_update', 'Update Sales Prices', buttionFunction);
							
							var buttionFunction = "calculateSalesPrice('" + baseParentId.toString() + "')";
							sublist.addButton(sublistId + '_calculate', 'Calculate Sales Prices', buttionFunction);
							
							sublist.addRefreshButton();
							
							var sublistFieldTick = sublist.addField(sublistId + '_tick', 'checkbox', 'Select', null);
							var sublistFieldId = sublist.addField(sublistId + '_id', 'text', 'Id', null);
							var sublistFieldName = sublist.addField(sublistId + '_name', 'text', 'Name', null);
							var sublistFieldOpt1 = sublist.addField(sublistId + '_opt1', 'text', 'Item Category', null);
							var sublistFieldOpt2 = sublist.addField(sublistId + '_opt2', 'text', 'Colour', null);
							var sublistFieldOpt3 = sublist.addField(sublistId + '_opt3', 'text', 'Size1', null);
							var sublistFieldOpt4 = sublist.addField(sublistId + '_opt4', 'text', 'Size2', null);
							var sublistFieldCost = sublist.addField(sublistId + '_cost', 'currency', 'Cost', null);
							var sublistFieldSales = sublist.addField(sublistId + '_sales', 'currency', 'Sales Price', null);
							var sublistFieldMargin = sublist.addField(sublistId + '_margin', 'text', 'Margin', null);
//SMI						var sublistFieldMin = sublist.addField(sublistId + '_min', 'integer', 'Min Stock', null);
//SMI						var sublistFieldMax = sublist.addField(sublistId + '_max', 'integer', 'Max Stock', null);
//SMI						var sublistFieldWeb = sublist.addField(sublistId + '_web', 'checkbox', 'Web Product', null);
							
/*SMI*/						var sublistFieldOpt2Id = sublist.addField(sublistId + '_opt2_id', 'text', 'Colour Id', null);
							
							
							//Set entry fields
							//
							sublistFieldSales.setDisplayType('entry');
							sublistFieldSales.setMandatory(true);
							sublistFieldMargin.setDisplayType('entry');
//SMI						sublistFieldMin.setDisplayType('entry');
//SMI						sublistFieldMax.setDisplayType('entry');
/*SMI*/						sublistFieldOpt2Id.setDisplayType('hidden');
							
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
															   ["type","anyof","InvtPart"], 
															   "AND", 
															   ["matrixchild","is","T"], 
															   "AND", 
															   ["internalid","anyof",matrixIds], 
															   //"AND", 
															   //["ispreferredvendor","is","T"],
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
									var matrixChildSearch = nlapiSearchRecord("inventoryitem",null,
											matrixChildFilter, 
											[
											   new nlobjSearchColumn("itemid",null,null), 
											   new nlobjSearchColumn("displayname",null,null), 
											   new nlobjSearchColumn("salesdescription",null,null), 
											   new nlobjSearchColumn("type",null,null), 
											   new nlobjSearchColumn("baseprice",null,null), 
											   new nlobjSearchColumn("averagecost",null,null), 
											   //new nlobjSearchColumn("vendorcost",null,null), 
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
													//var matrixCost = Number(matrixChildSearch[int3].getValue('vendorcost')) + finishCost;
													var matrixCost = Number(matrixChildSearch[int3].getValue('averagecost')) + finishCost;
													
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
													sublist.setLineItemValue(sublistId + '_cost', sublistLine, matrixCost);
													sublist.setLineItemValue(sublistId + '_opt2_id', sublistLine, matrixOpt2Id);
													
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
					form.addSubmitButton('Create Assemblies');
					
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
					messageField.setDefaultValue('An email will be sent to ' + emailAddress + ' when the assembly creation process has completed.');
				
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
				finishIdParam = request.getParameter('custpage_finish_id_param');
				finishTxtParam = request.getParameter('custpage_finish_txt_param');
				finishRefIdParam = request.getParameter('custpage_finishref_id_param');
				finishRefTxtParam = request.getParameter('custpage_finishref_txt_param');
				baseParentsParam = request.getParameter('custpage_baseparents_param');
				sessionParam = request.getParameter('custpage_session_param');
				
				//Build up the parameters so we can call this suitelet again, but move it on to the next stage
				//
				var params = new Array();
				params['custid'] = custIdParam;
				params['custtxt'] = custTxtParam;
				params['custpricelevel'] = custPriceLevelParam;
				params['custcurrency'] = custCurrencyParam;
				params['finishid'] = finishIdParam;
				params['finishtxt'] = finishTxtParam;
				params['finishrefid'] = finishRefIdParam;
				params['finishreftxt'] = finishRefTxtParam;
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
								var salesPrice = request.getLineItemValue(sublistId, sublistId + '_sales', int);
//SMI							var minStock = request.getLineItemValue(sublistId, sublistId + '_min', int);
//SMI							var maxStock = request.getLineItemValue(sublistId, sublistId + '_max', int);
//SMI							var webProduct = request.getLineItemValue(sublistId, sublistId + '_web', int);
/*SMI*/							var colourId = request.getLineItemValue(sublistId, sublistId + '_opt2_id', int);
								
//SMI							var data = [item,salesPrice,minStock,maxStock,webProduct];
								var data = [item,salesPrice,colourId];
								
								//Build up the parent & child object
								//
								parentAndChild[baseParentId].push(data);
							}
					}
				}
				
				//Now we have the parent & child object we need to pass it to the scheduled script
				//
				var scheduleParams = {
							custscript_bbs_parent_child: JSON.stringify(parentAndChild), 
							custscript_bbs_customer_id: custIdParam,
							custscript_bbs_finish_id: finishIdParam,
							custscript_bbs_finishref_id: finishRefIdParam,
							};
				
				nlapiScheduleScript('customscript_bbs_create_assem_scheduled', null, scheduleParams);

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

