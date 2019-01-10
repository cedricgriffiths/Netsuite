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
function buildWoSuitelet(request, response)
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
		var form = nlapiCreateForm('Build Works Orders From Production Batch', false);
		form.setTitle('Build Works Orders From Production Batch');
		form.setScript('customscript_bbs_build_wo_client');
		
		
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

				//Add a field group 
				//
				var fieldGroupHeader = form.addFieldGroup('custpage_grp_operator', 'Operator');
				var fieldGroupHeader = form.addFieldGroup('custpage_grp_batch', 'Production Batch');
				
				
				//=====================================================================
				// Fields creation
				//=====================================================================
				//

				//Add a field for the operator
				//
				var operatorIdField = form.addField('custpage_operator_id', 'text', 'Operator Id', null, 'custpage_grp_operator');
				operatorIdField.setMandatory(true);
				
				var operatorNameField = form.addField('custpage_operator_name', 'text', 'Operator Name', null, 'custpage_grp_operator');
				operatorNameField.setDisplayType('disabled');
				
				//Add a field for the production batch
				//
				var productionBatchIdField = form.addField('custpage_prod_batch_id', 'text', 'Production Batch Id', null, 'custpage_grp_batch');
				productionBatchIdField.setMandatory(true);
				
				var productionBatchNameField = form.addField('custpage_prod_batch_name', 'text', 'Production Batch Name', null, 'custpage_grp_batch');
				productionBatchNameField.setDisplayType('disabled');
				productionBatchNameField.setLayoutType('normal', 'startcol');
				
				var productionBatchStatusField = form.addField('custpage_prod_batch_status', 'text', 'Production Batch Status', null, 'custpage_grp_batch');
				productionBatchStatusField.setDisplayType('disabled');
				
				
				//=====================================================================
				// Tabs creation
				//=====================================================================
				//
				
				//Create a tab for the sublists
				//
				var customersTab = form.addTab('custpage_wo_tab', 'Works Orders');
				customersTab.setLabel('Works Orders');
				
				//Create a subtab
				//
				var subtab = form.addSubTab('custpage_wo_subtab', 'Works Order Selection', 'custpage_wo_tab');
				
				
				//=====================================================================
				// Sublist creation
				//=====================================================================
				//
				
				//Add a sublist to the subtab
				//
				var sublist = form.addSubList('custpage_sublist_wo', 'list', 'Works Orders', 'custpage_wo_subtab');
				sublist.setLabel('Works Orders');
				
				//Add buttons to the sublist
				//
				sublist.addMarkAllButtons();
				sublist.addRefreshButton();
				
				//Add fields to the sublist
				var sublistFieldTick = sublist.addField('custpage_sublist_tick', 'checkbox', 'Select', null);
				var sublistFieldWoDate = sublist.addField('custpage_sublist_wo_date', 'text', 'Date', null);
				var sublistFieldWoName = sublist.addField('custpage_sublist_wo_name', 'text', 'Works Order #', null);
				var sublistFieldWoItem = sublist.addField('custpage_sublist_wo_item', 'text', 'Item', null);
				var sublistFieldWoItem = sublist.addField('custpage_sublist_wo_item_desc', 'text', 'Description', null);
				var sublistFieldWoCustomer = sublist.addField('custpage_sublist_wo_customer', 'text', 'Customer', null);
				var sublistFieldWoQuantity = sublist.addField('custpage_sublist_wo_quantity', 'text', 'Quantity', null);
				var sublistFieldWoStatus = sublist.addField('custpage_sublist_wo_status', 'text', 'Status', null);
				var sublistFieldWoId = sublist.addField('custpage_sublist_wo_id', 'text', 'Id', null);
				sublistFieldWoId.setDisplayType('hidden');
				
				//=====================================================================
				// Get data
				//=====================================================================
				//
				
				//Get the session data
				//
				sessionField.setDefaultValue(sessionParam);
				
				var sessionData = libGetSessionData(sessionParam);
				var filters = JSON.parse(sessionData);
				
				//Get the data for the sublist (works orders in-process, planned or released)
				//
				if(filters != null)
					{
						var filterArray =  [
											   ["type","anyof","WorkOrd"], 
											   "AND", 
											   ["mainline","is","T"], 
											   "AND", 
											   ["status","anyof","WorkOrd:D","WorkOrd:A","WorkOrd:B"]
											];
						
						if(filters['batchid'] != '')
							{
								filterArray.push("AND",["custbody_bbs_wo_batch","anyof",filters['batchid']]);
							}
						else
							{
								filterArray.push("AND",["custbody_bbs_wo_batch","anyof","-1"]);
							}
						
						var workorderSearch = nlapiCreateSearch("workorder",
								filterArray, 
								[
								   new nlobjSearchColumn("tranid").setSort(false), 
								   new nlobjSearchColumn("entity"), 
								   new nlobjSearchColumn("memo"), 
								   new nlobjSearchColumn("trandate"), 
								   new nlobjSearchColumn("item"), 
								   new nlobjSearchColumn("altname","customer",null), 
								   new nlobjSearchColumn("quantity"), 
								   new nlobjSearchColumn("statusref"),
								   new nlobjSearchColumn("salesdescription","item",null)
								]
								);
						
						var searchResultSet = getResults(workorderSearch);
						
						//Populate the sublist
						//
						for (var int = 0; int < searchResultSet.length; int++) 
							{
								var woIntId = searchResultSet[int].getId();
								var woDocNo = searchResultSet[int].getValue('tranid');
								var woCustName = searchResultSet[int].getText('entity');
								var woCustAltName = searchResultSet[int].getValue("altname","customer");
								var woItem = searchResultSet[int].getText('item');
								var woItemDescription = searchResultSet[int].getValue("salesdescription",'item');
								var woDate = searchResultSet[int].getValue('trandate');
								var woQuantity = searchResultSet[int].getValue('quantity');
								var woMemo = searchResultSet[int].getValue('memo');
								var woStatus = searchResultSet[int].getText('statusref');
								
								var sublistLine = int + 1;
						
								sublist.setLineItemValue('custpage_sublist_wo_date', sublistLine, woDate);
								sublist.setLineItemValue('custpage_sublist_wo_name', sublistLine, woDocNo);
								sublist.setLineItemValue('custpage_sublist_wo_item', sublistLine, woItem);
								sublist.setLineItemValue('custpage_sublist_wo_item_desc', sublistLine, woItemDescription);
								sublist.setLineItemValue('custpage_sublist_wo_customer', sublistLine, woCustName);
								sublist.setLineItemValue('custpage_sublist_wo_quantity', sublistLine, woQuantity);
								sublist.setLineItemValue('custpage_sublist_wo_status', sublistLine, woStatus);
								sublist.setLineItemValue('custpage_sublist_wo_id', sublistLine, woIntId);
								
								
							}
					}

				
				//Add a submit button
				//
				form.addSubmitButton('Build Works Orders');
		
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
				messageField.setDefaultValue('An email will be sent to ' + emailAddress + ' when the works order build process has completed.');
			
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
				var lineCount = request.getLineItemCount('custpage_sublist_wo');
				var woIds = [];
				var woTicked = Number(0);
				
				for (var int2 = 1; int2 <= lineCount; int2++) 
					{
						var ticked = request.getLineItemValue('custpage_sublist_wo', 'custpage_sublist_tick', int2);
					
						//Look for ticked lines
						//
						if (ticked == 'T')
							{
								var woId = request.getLineItemValue('custpage_sublist_wo', 'custpage_sublist_wo_id', int2);
								woIds.push(woId);
								woTicked++;
							}
					}
				
				//Get the batch & operator id from the form
				//
				var batchId = request.getParameter('custpage_prod_batch_id');
				var operatorId = request.getParameter('custpage_operator_id');
				var operatorName = request.getParameter('custpage_operator_name');
				
				//Update the batch status to show it is awaiting works order completion
				//
				nlapiSubmitField('customrecord_bbs_assembly_batch', batchId, 'custrecord_bbs_batch_status', '2', false);
				
				//Set up the parameters & call the scheduled script to build the works orders
				//
				var parameterObject = {};
				parameterObject['woids'] = woIds;
				parameterObject['wocount'] = lineCount;
				parameterObject['woticked'] = woTicked;
				parameterObject['operatorid'] = operatorId;
				parameterObject['operatorname'] = operatorName;
				parameterObject['batchid'] = batchId;
				
				var scheduleParams = {custscript_bbs_wo_build_params: JSON.stringify(parameterObject)};
				nlapiScheduleScript('customscript_bbs_wo_build_scheduled', null, scheduleParams);

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
function getResults(search)
{
	var searchResult = search.runSearch();
	
	//Get the initial set of results
	//
	var start = 0;
	var end = 1000;
	var searchResultSet = searchResult.getResults(start, end);
	
	if(searchResultSet != null)
		{
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
		}
	return searchResultSet;
}
