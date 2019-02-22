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
function itemPricingMaintSuitelet(request, response){
	
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
			var baseParentsParam = request.getParameter('baseparents');
			
			stageParam = (stageParam == 0 ? 1 : stageParam);
			
			
			//=====================================================================
			// Form creation
			//=====================================================================
			//
			var form = nlapiCreateForm('Customer Item Pricing Maintenance', false);
			form.setScript('customscript_bbs_item_pricingm_cl');
			form.setTitle('Customer Item Pricing Maintenance');
			
			
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
						
							//Add a select field to pick the customer from
							//
							var customerField = form.addField('custpage_customer_select', 'select', 'Customer', 'customer', 'custpage_grp_customer');
							customerField.setMandatory(true);
		
							//Add a select field to pick the base parent from
							//
							var baseParentField = form.addField('custpage_base_parent_select', 'multiselect', 'Base Parent Items', null, 'custpage_grp_parent');
							baseParentField.setDisplaySize(900, 10);
							baseParentField.setBreakType('startcol');
							
							var messageField = form.addField('custpage_base_parent_count', 'text', '', null, 'custpage_grp_parent');
							messageField.setDisplayType('inline');
							
							
							//Add a submit button to the form
							//
							form.addSubmitButton('Maintain Item Pricing');
			
							break;
					
					case 2:
							//=====================================================================
							// Stage 2 - Display sublists of child items for each parent
							//=====================================================================
							//
						
							//Add fields to show the previous selections
							//
							var customerField = form.addField('custpage_customer_select', 'text', 'Customer', null, 'custpage_grp_customer');
							var baseParentField = form.addField('custpage_base_parent_select', 'textarea', 'Base Parent Items', null, 'custpage_grp_parent');
							
							//Disable the fields from entry
							//
							customerField.setDisplayType('disabled');
							baseParentField.setDisplayType('disabled');
							
							//Set the default values
							customerField.setDefaultValue(custTxtParam);
							
							//Create a tab for the sublists
							//
							var childItemsTab = form.addTab('custpage_child_items_tab', 'Item Pricing');
							childItemsTab.setLabel('Item Pricing');
							
							//Read the customer record
							//
							var custRecord = nlapiLoadRecord('customer', custIdParam);
							
							var itemPricingLines = custRecord.getLineItemCount('itempricing');
							var items = [];
							
							//Get all of the item pricing items
							//
							for (var int = 1; int <= itemPricingLines; int++) 
								{
									var itemId = custRecord.getLineItemValue('itempricing', 'item', int);
									
									items.push(itemId);
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
									var pointsFieldId = 'custpage_def_price_' + baseParentId.toString();
									
									var subtab = form.addSubTab(subtabId, baseParents[baseParentId], 'custpage_child_items_tab');
									form.addField(pointsFieldId, 'currency', 'Price', null, subtabId);
									
									var sublist = form.addSubList(sublistId, 'list', baseParents[baseParentId], subtabId);
									sublist.addMarkAllButtons();
									sublist.setLabel(baseParents[baseParentId]);
									
									var buttonFunction2 = "updatePrices('" + baseParentId.toString() + "')";
									sublist.addButton(sublistId + '_update_prices', 'Update Selected Prices', buttonFunction2);
									
									var sublistFieldTick = sublist.addField(sublistId + '_tick', 'checkbox', 'Select', null);
									var sublistFieldId = sublist.addField(sublistId + '_id', 'text', 'Id', null);
									var sublistFieldName = sublist.addField(sublistId + '_name', 'text', 'Name', null);
									var sublistFieldPriceLevel = sublist.addField(sublistId + '_level', 'text', 'Price Level', null);
									var sublistFieldCurrency = sublist.addField(sublistId + '_currency', 'text', 'Currency', null);
									var sublistFieldPrice = sublist.addField(sublistId + '_price', 'currency', 'Price', null);
									
									//Set entry fields
									//
									sublistFieldPrice.setDisplayType('entry');
									
									//Hide the id field
									//
									sublistFieldId.setDisplayType('hidden');
									
									//Search for the item based on the parent
									//
									var itemSearch = getResults(nlapiCreateSearch("item",
											[
											   ["internalid","anyof",items],
											   "AND",
											   ["parent", "anyof", baseParentId]
											], 
											[
											   new nlobjSearchColumn("itemid").setSort(false), 
											   new nlobjSearchColumn("custitem_bbs_matrix_item_seq")
											]
											));
									
									var itemsToDisplay = [];
									var tempArray = {};
									
									//Build up a list of items that we want to display
									//
									if(itemSearch != null && itemSearch.length > 0)
										{
											for (var int2 = 0; int2 < itemSearch.length; int2++) 
												{
													var itemSearchItemId = itemSearch[int2].getId();
													var itemSearchItemSeq = itemSearch[int2].getValue("custitem_bbs_matrix_item_seq");
												
													tempArray[itemSearchItemSeq] = itemSearchItemId;
												}
										}
									
									//Sort by matrix sequence
									//
									for ( var tempKey in orderedTempArray) 
										{
											delete orderedTempArray[tempKey];
										}
								
									const orderedTempArray = {};
									Object.keys(tempArray).sort().forEach(function(key) {
										orderedTempArray[key] = tempArray[key];
									});
									
									var sublistLine = Number(1);
									
									for ( var orderedKey in orderedTempArray) 
										{
											for (var int = 1; int <= itemPricingLines; int++) 
												{
													var itemId = custRecord.getLineItemValue('itempricing', 'item', int);
													
													if(itemId == orderedTempArray[orderedKey])
														{
															var itemName = custRecord.getLineItemText('itempricing', 'item', int);
															var itemLevel = custRecord.getLineItemValue('itempricing', 'level', int);
															var itemLevelText = custRecord.getLineItemText('itempricing', 'level', int);
															var itemCurrency = custRecord.getLineItemText('itempricing', 'currency', int);
															var itemPrice = custRecord.getLineItemValue('itempricing', 'price', int);
																
															itemLevelText = (itemLevel == '-1' ? 'Custom' : itemLevelText);
															
															//Populate the sublist
															//
															sublist.setLineItemValue(sublistId + '_id', sublistLine, itemId);
															sublist.setLineItemValue(sublistId + '_name', sublistLine, itemName);
															sublist.setLineItemValue(sublistId + '_level', sublistLine, itemLevelText);
															sublist.setLineItemValue(sublistId + '_currency', sublistLine, itemCurrency);
															sublist.setLineItemValue(sublistId + '_price', sublistLine, itemPrice);
																			
															sublistLine++;
															
															break;
														}
												}
										}
								}
		
							//Add a submit button
							//
							form.addSubmitButton('Update Customer Item Pricing');
							
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
							messageField.setDefaultValue('An email will be sent to ' + emailAddress + ' when the customer item pricing maintenance process has completed.');
						
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
						baseParentsParam = request.getParameter('custpage_baseparents_param');
						sessionParam = request.getParameter('custpage_session_param');
						
						//Build up the parameters so we can call this suitelet again, but move it on to the next stage
						//
						var params = new Array();
						params['custid'] = custIdParam;
						params['custtxt'] = custTxtParam;
						params['baseparents'] = baseParentsParam;
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
										var item = request.getLineItemValue(sublistId, sublistId + '_id', int);
										var price = request.getLineItemValue(sublistId, sublistId + '_price', int);
										var name = request.getLineItemValue(sublistId, sublistId + '_name', int);
										var data = [item,price,name];
												
										//Build up the parent & child object
										//
										parentAndChild[baseParentId].push(data);
									}
							}
						
						//Now we have the parent & child object we need to pass it to the scheduled script
						//
						var scheduleParams = {
									custscript_bbs_cipm_parent_child: JSON.stringify(parentAndChild), 
									custscript_bbs_cipm_customer_id: custIdParam
									};
						
						nlapiScheduleScript('customscript_bbs_item_pricingm_sh', null, scheduleParams);
		
						//Call the next stage
						//
						var params = new Array();
						params['stage'] = stage + 1;
						
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
function getResults(search)
{
	var searchResult = search.runSearch();
	
	//Get the initial set of results
	//
	var pageSize = 100;
	var start = 0;
	var end = pageSize;
	var searchResultSet = searchResult.getResults(start, end);
	
	if(searchResultSet != null)
		{
			var resultlen = searchResultSet.length;
		
			//If there is more than 1000 results, page through them
			//
			while (resultlen == pageSize) 
				{
						start += pageSize;
						end += pageSize;
		
						var moreSearchResultSet = searchResult.getResults(start, end);
						resultlen = moreSearchResultSet.length;
		
						searchResultSet = searchResultSet.concat(moreSearchResultSet);
				}
		}
	return searchResultSet;
}
