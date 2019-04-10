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
function priceListSuitelet(request, response)
{
	
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
		var sessionParam = request.getParameter('session');
		var stageParam = Number(request.getParameter('stage'));
		
		stageParam = (stageParam == 0 ? 1 : stageParam);
		
		//=====================================================================
		// Form creation
		//=====================================================================
		//
		var form = nlapiCreateForm('Generate Customer Pricelists', false);
		form.setTitle('Generate Customer Pricelists');
		form.setScript('customscript_bbs_pricelist_client');
		
		
		//=====================================================================
		// Hidden fields to pass data to the POST section
		//=====================================================================
		//
		
		//Stage
		//
		var stageField = form.addField('custpage_stage', 'integer', 'stage');
		stageField.setDisplayType('hidden');
		stageField.setDefaultValue(stageParam);
		
		//Session
		//
		var sessionField = form.addField('custpage_session_param', 'text', 'session');
		sessionField.setDisplayType('hidden');
		

		//=====================================================================
		// Form layout based on stage number
		//=====================================================================
		//
		switch(stageParam)
		{
			case 1:
				
				//Get a session
				//
				var sessionId = libCreateSession();
				
				var paramsP1 = new Array();
				paramsP1['session'] = sessionId;
				paramsP1['stage'] = stageParam + 1;
				
				var context = nlapiGetContext();
				response.sendRedirect('SUITELET',context.getScriptId(), context.getDeploymentId(), null, paramsP1);
				
				break;
				
			case 2:

				//=====================================================================
				// Field groups creation
				//=====================================================================
				//
				
				//Add a field group for header info
				//
				var fieldGroupHeader = form.addFieldGroup('custpage_grp_header', 'Information');
				fieldGroupHeader.setSingleColumn(true);
				
				//Add a field group for formatting
				//
				var fieldGroupFormat = form.addFieldGroup('custpage_grp_format', 'Formatting');
				fieldGroupFormat.setSingleColumn(true);
				
				
				//=====================================================================
				// Fields creation
				//=====================================================================
				//
							
				//Add a text field for the header message
				//
				var messageField = form.addField('custpage_customer_message', 'textarea', 'Price List Header Message', null, 'custpage_grp_header');
				messageField.setDisplaySize(120, 4)	;
				
				//Add a checkbox field to filter by sales in the last 12 months
				//
				var twelveMonthSalesField = form.addField('custpage_last_12_months', 'checkbox', 'Styles Sold Only In Last 12 Months', null, 'custpage_grp_format');
				
				//Add a checkbox field to allow consolidated output
				//
				var consolidatedField = form.addField('custpage_consolidated_output', 'checkbox', 'Consolidated Output Format', null, 'custpage_grp_format');
		
				//Add a checkbox field to allow internal or external output
				//
				var internalexternalField = form.addField('custpage_internal_output', 'checkbox', 'Internal Use Output Format', null, 'custpage_grp_format');
		
				
				//=====================================================================
				// Tabs creation
				//=====================================================================
				//
				
				//Create a tab for the sublists
				//
				var customersTab = form.addTab('custpage_customers_tab', 'Customers');
				customersTab.setLabel('Customers');
				
				//Create a subtab
				//
				var subtab = form.addSubTab('custpage_customers_subtab', 'Customer Selection', 'custpage_customers_tab');
				
				//Add a field group for filters
				//
				var fieldGroupFilters = form.addFieldGroup('custpage_grp_filters', 'Filters', 'custpage_customers_subtab');
				//fieldGroupFilters.setSingleColumn(true);
				
				//Add a select field to select Customer, Prospect or Lead
				//
				var customerTypeField = form.addField('custpage_cust_type_select', 'select', 'Customer Type', null, 'custpage_grp_filters');
				customerTypeField.addSelectOption('', '', true);
				customerTypeField.addSelectOption('CUSTOMER', 'Customer', false);
				customerTypeField.addSelectOption('LEAD', 'Lead', false);
				customerTypeField.addSelectOption('PROSPECT', 'Prospect', false);
				
				//Add a select field to select the subsidiary
				//
				var subsidiaryField = form.addField('custpage_subsidiary_select', 'select', 'Subsidiary', 'subsidiary', 'custpage_grp_filters');
				
				//Add a text field to filter the company name
				//
				var beginsWithField = form.addField('custpage_begins_with', 'text', 'Name Begins With', null, 'custpage_grp_filters');
				
				
				//=====================================================================
				// Sublist creation
				//=====================================================================
				//
				
				//Add a sublist to the subtab
				//
				var sublist = form.addSubList('custpage_sublist_customer', 'list', 'Customers', 'custpage_customers_subtab');
				sublist.setLabel('Customers');
				
				//Add buttons to the sublist
				//
				sublist.addMarkAllButtons();
				sublist.addRefreshButton();
				
				//Add fields to the sublist
				var sublistFieldTick = sublist.addField('custpage_sublist_customer_tick', 'checkbox', 'Select', null);
				var sublistFieldInternalId = sublist.addField('custpage_sublist_customer_internal', 'text', 'Internal Id', null);
				var sublistFieldId = sublist.addField('custpage_sublist_customer_id', 'text', 'Id', null);
				var sublistFieldName = sublist.addField('custpage_sublist_customer_name', 'text', 'Name', null);
				var sublistFieldType = sublist.addField('custpage_sublist_customer_type', 'text', 'Type', null);
				var sublistFieldStatus = sublist.addField('custpage_sublist_customer_status', 'text', 'Status', null);
				var sublistFieldSubsidiary = sublist.addField('custpage_sublist_customer_subsid', 'text', 'Subsidiary', null);
				var sublistFieldParent = sublist.addField('custpage_sublist_customer_parent', 'text', 'Parent', null);
				sublistFieldParent.setDisplayType('hidden');
				
				//=====================================================================
				// Get customer data
				//=====================================================================
				//
				
				//Get the session data
				//
				sessionField.setDefaultValue(sessionParam);
				
				var sessionData = libGetSessionData(sessionParam);
				var filters = JSON.parse(sessionData);
				
				//Get the data for the sublist
				//
				if(filters != null)
					{
						var filterArray =  [
						                   ["entityid","isnotempty",""]
						                   ];
						
						if(filters['type'] != '')
						{
							filterArray.push("AND",["stage","anyof",filters['type']]);
						}
						
						if(filters['subsidiary'] != '')
						{
							filterArray.push("AND",["subsidiary","anyof",filters['subsidiary']]);
						}
					
						if(filters['beginswith'] != '')
						{
							filterArray.push("AND",["entityid","startswith",filters['beginswith']]);
						}
					
					var customerSearch = nlapiCreateSearch("customer",filterArray,
							[
							   new nlobjSearchColumn("entityid",null,null),
							   new nlobjSearchColumn("altname",null,null).setSort(false), 
							   new nlobjSearchColumn("stage",null,null), 
							   new nlobjSearchColumn("entitystatus",null,null), 
							   new nlobjSearchColumn("subsidiary",null,null), 
							   new nlobjSearchColumn("parent",null,null)
							]
							);
						
						var searchResult = customerSearch.runSearch();
						
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
						
						for (var int = 0; int < searchResultSet.length; int++) 
							{
								var custIntId = searchResultSet[int].getId();
								var custId = searchResultSet[int].getValue('entityid');
								var custName = searchResultSet[int].getValue('altname');
								var custType = searchResultSet[int].getText('stage');
								var custStatus = searchResultSet[int].getText('entitystatus');
								var custSubsid = searchResultSet[int].getText('subsidiary');
								var custParent = searchResultSet[int].getValue('parent');
								
								var sublistLine = int + 1;
								
								sublist.setLineItemValue('custpage_sublist_customer_internal', sublistLine, custIntId);
								sublist.setLineItemValue('custpage_sublist_customer_id', sublistLine, custId);
								sublist.setLineItemValue('custpage_sublist_customer_name', sublistLine, custName);
								sublist.setLineItemValue('custpage_sublist_customer_type', sublistLine, custType);
								sublist.setLineItemValue('custpage_sublist_customer_status', sublistLine, custStatus);
								sublist.setLineItemValue('custpage_sublist_customer_subsid', sublistLine, custSubsid);
								sublist.setLineItemValue('custpage_sublist_customer_parent', sublistLine, custParent);
							}
					}
				
				
				//Add a submit button
				//
				form.addSubmitButton('Generate Price Lists');
		
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
				messageField.setDefaultValue('An email will be sent to ' + emailAddress + ' when the pricelist creation process has completed.');
			
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
			case 2:
					
				//Retrieve the parameters from the form fields
				//
				var messageParam = request.getParameter('custpage_customer_message');
				var last12MonthsParam = request.getParameter('custpage_last_12_months');
				var consolidatedParam = request.getParameter('custpage_consolidated_output');
				var internalParam = request.getParameter('custpage_internal_output');
				var lineCount = request.getLineItemCount('custpage_sublist_customer');
				var customerIds = [];
				
				for (var int2 = 1; int2 <= lineCount; int2++) 
					{
						var ticked = request.getLineItemValue('custpage_sublist_customer', 'custpage_sublist_customer_tick', int2);
					
						//Look for ticked lines
						//
						if (ticked == 'T')
							{
								var custId = request.getLineItemValue('custpage_sublist_customer', 'custpage_sublist_customer_internal', int2);
								customerIds.push(custId);
							}
					}
				
				var parameterObject = {};
				parameterObject['message'] = messageParam;
				parameterObject['12Months'] = last12MonthsParam;
				parameterObject['consolidated'] = consolidatedParam;
				parameterObject['internal'] = internalParam;
				parameterObject['custids'] = customerIds;
				
				
				var scheduleParams = {custscript_bbs_pricelist_params: JSON.stringify(parameterObject)};
				nlapiScheduleScript('customscript_bbs_pricelist_scheduled', null, scheduleParams);

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

