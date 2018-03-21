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
function soUpdateWoSuitelet(request, response)
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
		
		var context = nlapiGetContext();
		var usersSubsidiary = context.getSubsidiary();
		
		
		//=====================================================================
		// Form creation
		//=====================================================================
		//
		var form = nlapiCreateForm('Update Works Orders on a Sales Order', false);
		form.setTitle('Update Works Orders on a Sales Order');
		form.setScript(script);
		
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
				// Tabs creation
				//=====================================================================
				//
				
				//Create a tab for the sublists
				//
				var customersTab = form.addTab('custpage_works_orders_tab', 'Works Orders');
				customersTab.setLabel('Works Orders');
				
				//Create a subtab
				//
				var subtab = form.addSubTab('custpage_works_orders_subtab', 'Works Orders Selection', 'custpage_works_orders_tab');
				
				//Add a field group for filters
				//
				var fieldGroupFilters = form.addFieldGroup('custpage_grp_filters', 'Filters', 'custpage_works_orders_subtab');

				//Add a text field to filter the company name
				//
				var salesOrderField = form.addField('custpage_sales_order_select', 'text', 'Sales Order', null, 'custpage_grp_filters');
				
				
				//=====================================================================
				// Sublist creation
				//=====================================================================
				//
				
				//Add a sublist to the subtab
				//
				var sublist = form.addSubList('custpage_sublist_works_orders', 'list', 'Works Orders', 'custpage_works_orders_subtab');
				sublist.setLabel('Works Orders');
				
				//Add fields to the sublist
				var sublistFieldWorksOrder = sublist.addField('custpage_sublist_wo_number', 'text', 'Works Order', null);
				var sublistFieldWorksOrderId = sublist.addField('custpage_sublist_wo_id', 'text', 'Id', null);
				sublistFieldWorksOrderId.setDisplayType('hidden');
				
				//=====================================================================
				// Get data
				//=====================================================================
				//
				
				//Get the session data
				//
				sessionField.setDefaultValue(sessionParam);
				
				var sessionData = libGetSessionData(sessionParam);
				var filter = sessionData;
				
				//Get the data for the sublist
				//
				if(filter != null && filter != '')
					{
						var salesorderSearch = nlapiSearchRecord("salesorder",null,
								[
								   ["type","anyof","SalesOrd"], 
								   "AND", 
								   ["mainline","is","T"], 
								   "AND", 
								   ["numbertext","is",filter]
								], 
								[
								   new nlobjSearchColumn("tranid",null,null), 
								   new nlobjSearchColumn("entity",null,null)
								]
								);
					
						if(salesorderSearch != null && salesorderSearch.length == 1)
							{
								var soId = salesorderSearch[0].getValue("tranid");
								
								var salesOrderRecord = nlapiLoadRecord('salesorder', soId);
								
								//Populate the sublist
								//
								for (var int = 0; int < searchResultSet.length; int++) 
									{
										var woName = searchResultSet[int].getText('woid');
										var woId = searchResultSet[int].getValue('woid');
										
										var sublistLine = int + 1;
										
										sublist.setLineItemValue('custpage_sublist_wo_number', sublistLine, woName);
										sublist.setLineItemValue('custpage_sublist_wo_id', sublistLine, woId);
									}
							}
					}

				
				//Add a submit button
				//
				form.addSubmitButton('Update Works Orders');
		
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
				messageField.setDefaultValue('An email will be sent to ' + emailAddress + ' when the works order have been refreshed.');
			
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
				var lineCount = request.getLineItemCount('custpage_sublist_fulfils');
				var ffIds = [];
				
				for (var int2 = 1; int2 <= lineCount; int2++) 
					{
						var ticked = request.getLineItemValue('custpage_sublist_fulfils', 'custpage_sublist_tick', int2);
					
						//Look for ticked lines
						//
						if (ticked == 'T')
							{
								var custId = request.getLineItemValue('custpage_sublist_fulfils', 'custpage_sublist_fulfil_id', int2);
								ffIds.push(custId);
							}
					}
				
				var parameterObject = {};
				parameterObject['ffids'] = ffIds;
				
				var invDateValue = request.getParameter('custpage_inv_date');
				var invPeriodValue = request.getParameter('custpage_inv_period');
				
				parameterObject['date'] = invDateValue;
				parameterObject['period'] = invPeriodValue;
				
				var scheduleParams = {custscript_bbs_invoicing_params: JSON.stringify(parameterObject)};
				nlapiScheduleScript('customscript_bbs_invoicing_scheduled', null, scheduleParams);

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

