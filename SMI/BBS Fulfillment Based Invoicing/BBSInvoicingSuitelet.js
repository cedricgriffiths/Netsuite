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
function invoicingSuitelet(request, response)
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
		
		//=====================================================================
		// Form creation
		//=====================================================================
		//
		var form = nlapiCreateForm('Generate Invoices From Fulfilments', false);
		form.setTitle('Generate Invoices From Fulfilments');
		form.setScript('customscript_bbs_invoicing_client');
		
		
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

				//Add a field group for invoice defaults
				//
				var fieldGroupHeader = form.addFieldGroup('custpage_grp_invoice', 'Invoice Defaults');
				
				
				//=====================================================================
				// Fields creation
				//=====================================================================
				//

				//Add a field for the invoice date
				//
				var invDateField = form.addField('custpage_inv_date', 'date', 'Invoice Date', null, 'custpage_grp_invoice');
				invDateField.setDefaultValue(nlapiDateToString(new Date()));
				
				//Add a field for the accounting period
				//
				var invPeriodField = form.addField('custpage_inv_period', 'select', 'Period', null, 'custpage_grp_invoice');
				
				//Populate the accounting period list
				//
				var currentPeriod = libGetPeriod(new Date());
				
				var accountingperiodSearch = nlapiSearchRecord("accountingperiod",null,
						[
						   ["closed","is","F"], 
						   "AND", 
						   ["isyear","is","F"], 
						   "AND", 
						   ["isquarter","is","F"],
						   "AND", 
						   ["arlocked","is","F"]
						], 
						   [
						   new nlobjSearchColumn("periodname",null,null),
						   new nlobjSearchColumn("startdate",null,null).setSort(false)
						   ]
						);
				
				if(accountingperiodSearch)
					{
						for (var int = 0; int < accountingperiodSearch.length; int++) 
							{
								var periodId = accountingperiodSearch[int].getId();
								var periodName = accountingperiodSearch[int].getValue('periodname');
							
								if(periodId == currentPeriod)
									{
										invPeriodField.addSelectOption(periodId, periodName, true);
									}
								else
									{
										invPeriodField.addSelectOption(periodId, periodName, false);
									}
							}
					}
				
				//=====================================================================
				// Tabs creation
				//=====================================================================
				//
				
				//Create a tab for the sublists
				//
				var customersTab = form.addTab('custpage_fulfillments_tab', 'Fulfillments');
				customersTab.setLabel('Customers');
				
				//Create a subtab
				//
				var subtab = form.addSubTab('custpage_fulfillments_subtab', 'Fulfillment Selection', 'custpage_fulfillments_tab');
				
				//Add a field group for filters
				//
				var fieldGroupFilters = form.addFieldGroup('custpage_grp_filters', 'Filters', 'custpage_fulfillments_subtab');

				//Add a text field to filter the company name
				//
				var customerField = form.addField('custpage_customer_select', 'select', 'Customer', 'customer', 'custpage_grp_filters');
				
				//Add a text field to filter the ship date
				//
				var today = new Date();
				var todayString = nlapiDateToString(today);
				
				var shipDateFieldStart = form.addField('custpage_ship_start', 'date', 'Fulfilment Date Start', null, 'custpage_grp_filters');
				var shipDateFieldEnd = form.addField('custpage_ship_end', 'date', 'Fulfilment Date End', null, 'custpage_grp_filters');
				
				shipDateFieldStart.setDefaultValue(todayString);
				shipDateFieldEnd.setDefaultValue(todayString);
				
				shipDateFieldStart.setMandatory(true);
				shipDateFieldEnd.setMandatory(true);
				
				shipDateFieldStart.setLayoutType('normal', 'startcol');
				
				
				//=====================================================================
				// Sublist creation
				//=====================================================================
				//
				
				//Add a sublist to the subtab
				//
				var sublist = form.addSubList('custpage_sublist_fulfils', 'list', 'Fulfilments', 'custpage_fulfillments_subtab');
				sublist.setLabel('Fulfilments');
				
				//Add buttons to the sublist
				//
				sublist.addMarkAllButtons();
				sublist.addRefreshButton();
				
				//Add fields to the sublist
				var sublistFieldTick = sublist.addField('custpage_sublist_tick', 'checkbox', 'Select', null);
				var sublistFieldCustomer = sublist.addField('custpage_sublist_customer_name', 'text', 'Customer', null);
				var sublistFieldSalesOrder = sublist.addField('custpage_sublist_sales_order', 'text', 'Sales Order', null);
				var sublistFieldFulfilSoStatus = sublist.addField('custpage_sublist_so_status', 'text', 'SO Status', null);
				var sublistFieldFulfilSoShip = sublist.addField('custpage_sublist_so_shipdate', 'date', 'SO Ship Date', null);
				var sublistFieldFulfilNo = sublist.addField('custpage_sublist_fulfil_no', 'text', 'Fulfilment No', null);
				var sublistFieldFulfilDate = sublist.addField('custpage_sublist_fulfil_date', 'date', 'Fulfilment Date', null);
				var sublistFieldFulfilMemo = sublist.addField('custpage_sublist_fulfil_memo', 'text', 'Memo', null);
				var sublistFieldFulfilCurrency = sublist.addField('custpage_sublist_fulfil_currency', 'text', 'Currency', null);
				var sublistFieldFulfilId = sublist.addField('custpage_sublist_fulfil_id', 'text', 'Id', null);
				sublistFieldFulfilId.setDisplayType('hidden');
				
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
						                   ["custbody_bbs_related_invoice","anyof","@NONE@"],	//Not already been through this process
						                   "AND",
						                   ["type","anyof","ItemShip"],							//Fulfillments
						                   "AND",
						                   ["mainline","is","T"],								//Main line 
						                   "AND", 
						                   ["status","anyof","ItemShip:C"],						//Fulfilment status is "Shipped"
						                   "AND", 
						                   ["createdfrom","noneof","@NONE@"], 					//Created from is filled in
						                   "AND", 
						                   ["createdfrom.status","noneof","SalesOrd:G","SalesOrd:C","SalesOrd:H","SalesOrd:A"],			//Sales order not at "Billed","Cancelled","Closed","Pending Approval" status 
						                   "AND", 
						                   ["createdfrom.type","anyof","SalesOrd"]
						                   ];
						
						if(filters['shipdatestart'] != '' && filters['shipdateend'] != '')
						{
							filterArray.push("AND",["trandate","within",filters['shipdatestart'],filters['shipdateend']]);
						}
					
						if(filters['customer'] != '' && filters['customer'] != '0')
						{
							filterArray.push("AND",["entity","anyof",filters['customer']]);
						}
						
						var fulfillmentSearch = nlapiCreateSearch("itemfulfillment",filterArray,
							[
							   new nlobjSearchColumn("entity",null,null).setSort(false), 
							   new nlobjSearchColumn("trandate",null,null).setSort(false),
							   new nlobjSearchColumn("tranid",null,null),
							   new nlobjSearchColumn("createdfrom",null,null), 
							   new nlobjSearchColumn("memo",null,null), 
							   new nlobjSearchColumn("currency",null,null),
							   new nlobjSearchColumn("status","createdfrom",null),
							   new nlobjSearchColumn("shipdate","createdfrom",null)
							]
							);
						
						var searchResult = fulfillmentSearch.runSearch();
						
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
						
						//Populate the sublist
						//
						for (var int = 0; int < searchResultSet.length; int++) 
							{
								var ffIntId = searchResultSet[int].getId();
								var ffDocNo = searchResultSet[int].getValue('tranid');
								var ffCustName = searchResultSet[int].getText('entity');
								var ffCreatedFrom = searchResultSet[int].getText('createdfrom');
								var ffDate = searchResultSet[int].getValue('trandate');
								var ffCurrency = searchResultSet[int].getText('currency');
								var ffMemo = searchResultSet[int].getValue('memo');
								var ffSoStatus = searchResultSet[int].getText('status','createdfrom');
								var ffSoShipdate = searchResultSet[int].getValue('shipdate','createdfrom');
								
								var sublistLine = int + 1;
								
								sublist.setLineItemValue('custpage_sublist_customer_name', sublistLine, ffCustName);
								sublist.setLineItemValue('custpage_sublist_sales_order', sublistLine, ffCreatedFrom);
								sublist.setLineItemValue('custpage_sublist_fulfil_no', sublistLine, ffDocNo);
								sublist.setLineItemValue('custpage_sublist_fulfil_date', sublistLine, ffDate);
								sublist.setLineItemValue('custpage_sublist_fulfil_id', sublistLine, ffIntId);
								sublist.setLineItemValue('custpage_sublist_fulfil_memo', sublistLine, ffMemo);
								sublist.setLineItemValue('custpage_sublist_fulfil_currency', sublistLine, ffCurrency);
								sublist.setLineItemValue('custpage_sublist_so_status', sublistLine, ffSoStatus);
								sublist.setLineItemValue('custpage_sublist_so_shipdate', sublistLine, ffSoShipdate);
								
							}
					}

				
				//Add a submit button
				//
				form.addSubmitButton('Generate Invoices');
		
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
				messageField.setDefaultValue('An email will be sent to ' + emailAddress + ' when the invoice creation process has completed.');
			
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

