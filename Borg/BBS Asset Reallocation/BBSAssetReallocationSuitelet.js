/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       03 Mar 2017     cedricgriffiths
 *
 */


//=============================================================================================
//Configuration
//=============================================================================================
//	

	
/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function assetReallocationSuitelet(request, response)
{


	
	//=============================================================================================
	//Start of main code
	//=============================================================================================
	//

	if (request.getMethod() == 'GET') 
	{
		//Get request - so return a form for the user to process
		//
		
		//Get parameters
		//
		var paramFromBillingCustomerId = request.getParameter('frombillingcustomerid');
		var paramFromBillingCustomerText = request.getParameter('frombillingcustomertext');
		var paramFromCustomerId = request.getParameter('fromcustomerid');
		var paramFromCustomerText = request.getParameter('fromcustomertext');
		var paramFromLocationId = request.getParameter('fromlocationid');
		var paramFromLocationText = request.getParameter('fromlocationtext');
		
		var paramToBillingCustomerId = request.getParameter('tobillingcustomerid');
		var paramToBillingCustomerText = request.getParameter('tobillingcustomertext');
		var paramToCustomerId = request.getParameter('tocustomerid');
		var paramToCustomerText = request.getParameter('tocustomertext');
		var paramToLocationId = request.getParameter('tolocationid');
		var paramToLocationText = request.getParameter('tolocationtext');
		
		var stage = Number(request.getParameter('stage'));
		
		stage = (stage == 0 || stage == null ? 1 : stage);

		// Create a form
		//
		var form = nlapiCreateForm('Asset Reallocation');
		form.setScript('customscript_bbs_ar_suitelet_client');
		form.setTitle('Asset Reallocation');
		
		//Store the current stage in a field in the form so that it can be retrieved in the POST section of the code
		//
		var stageField = form.addField('custpage_stage', 'integer', 'stage');
		stageField.setDisplayType('hidden');
		stageField.setDefaultValue(stage);
		
		//Store parameter data in fields in the form so that it can be retrieved in the POST section of the code
		//
		var fromBillingCustomerIdField = form.addField('custpage_from_billing_cust_id', 'text', 'From Billing Customer Id');
		fromBillingCustomerIdField.setDisplayType('hidden');
		fromBillingCustomerIdField.setDefaultValue(paramFromBillingCustomerId);
		
		var fromBillingCustomerTextField = form.addField('custpage_from_billing_cust_txt', 'text', 'From Billing Customer Text');
		fromBillingCustomerTextField.setDisplayType('hidden');
		fromBillingCustomerTextField.setDefaultValue(paramFromBillingCustomerText);
		
		var fromCustomerIdField = form.addField('custpage_from_cust_id', 'text', 'From Customer Id');
		fromCustomerIdField.setDisplayType('hidden');
		fromCustomerIdField.setDefaultValue(paramFromCustomerId);
		
		var fromCustomerTextField = form.addField('custpage_from_cust_txt', 'text', 'From Customer Text');
		fromCustomerTextField.setDisplayType('hidden');
		fromCustomerTextField.setDefaultValue(paramToCustomerText);
		
		var fromLocationIdField = form.addField('custpage_from_location_id', 'text', 'From Location Id');
		fromLocationIdField.setDisplayType('hidden');
		fromLocationIdField.setDefaultValue(paramFromLocationId);
		
		var fromLocationTextField = form.addField('custpage_from_location_txt', 'text', 'From Location Text');
		fromLocationTextField.setDisplayType('hidden');
		fromLocationTextField.setDefaultValue(paramFromLocationText);
		
		
		var toBillingCustomerIdField = form.addField('custpage_to_billing_cust_id', 'text', 'To Billing Customer Id');
		toBillingCustomerIdField.setDisplayType('hidden');
		toBillingCustomerIdField.setDefaultValue(paramToBillingCustomerId);
		
		var toBillingCustomerTextField = form.addField('custpage_to_billing_cust_txt', 'text', 'To Billing Customer Text');
		toBillingCustomerTextField.setDisplayType('hidden');
		toBillingCustomerTextField.setDefaultValue(paramToBillingCustomerText);
		
		var toCustomerIdField = form.addField('custpage_to_cust_id', 'text', 'To Customer Id');
		toCustomerIdField.setDisplayType('hidden');
		toCustomerIdField.setDefaultValue(paramToCustomerId);
		
		var toCustomerTextField = form.addField('custpage_to_cust_txt', 'text', 'To Customer Text');
		toCustomerTextField.setDisplayType('hidden');
		toCustomerTextField.setDefaultValue(paramToCustomerText);
		
		var toLocationIdField = form.addField('custpage_to_location_id', 'text', 'To Location Id');
		toLocationIdField.setDisplayType('hidden');
		toLocationIdField.setDefaultValue(paramToLocationId);
		
		var toLocationTextField = form.addField('custpage_to_location_txt', 'text', 'To Location Text');
		toLocationTextField.setDisplayType('hidden');
		toLocationTextField.setDefaultValue(paramToLocationText);
				
		
		//Add a field group for from selection
		//
		var fieldGroupFrom = form.addFieldGroup('custpage_grp_from', 'Assets From');

		//Add a field group for to selection
		//
		var fieldGroupTo = form.addFieldGroup('custpage_grp_to', 'Assets To');

		
		//Work out what the form layout should look like based on the stage number
		//
		switch(stage)
		{
		case 1:	
				//Add a select fields
				//
				var customerField = form.addField('custpage_from_cust_select', 'select', 'Customer', 'customer', 'custpage_grp_from');
				var billingCustomerField = form.addField('custpage_from_bill_cust_select', 'select', 'Billing Customer', 'customer', 'custpage_grp_from');
				var locationField = form.addField('custpage_from_location_select', 'select', 'Location', null, 'custpage_grp_from');
				customerField.setMandatory(true);
				
				var customerField = form.addField('custpage_to_cust_select', 'select', 'Customer', 'customer', 'custpage_grp_to');
				var billingCustomerField = form.addField('custpage_to_bill_cust_select', 'select', 'Billing Customer', 'customer', 'custpage_grp_to');
				var locationField = form.addField('custpage_to_location_select', 'select', 'Location', null, 'custpage_grp_to');
				customerField.setMandatory(true);
				locationField.setMandatory(true);
				
			
				//Add a submit button to the form
				//
				form.addSubmitButton('Select Assets');
				
				break;
		
		case 2:	
				//Filter the items to display based on the criteria chosen in stage 1
				//
				
				var customerField = form.addField('custpage_from_cust_select', 'text', 'Customer', null, 'custpage_grp_from');
				customerField.setDisplayType('disabled');
				customerField.setDefaultValue(paramFromCustomerText);
					
				var billingCustomerField = form.addField('custpage_from_bill_cust_select', 'text', 'Billing Customer', null, 'custpage_grp_from');
				billingCustomerField.setDisplayType('disabled');
				billingCustomerField.setDefaultValue(paramFromBillingCustomerText);
					
				var locationField = form.addField('custpage_from_location_select', 'text', 'Location', null, 'custpage_grp_from');
				locationField.setDisplayType('disabled');
				locationField.setDefaultValue(paramFromLocationText);
					
				var customerField = form.addField('custpage_to_cust_select', 'text', 'Customer', null, 'custpage_grp_to');
				customerField.setDisplayType('disabled');
				customerField.setDefaultValue(paramToCustomerText);
					
				var billingCustomerField = form.addField('custpage_to_bill_cust_select', 'text', 'Billing Customer', null, 'custpage_grp_to');
				billingCustomerField.setDisplayType('disabled');
				billingCustomerField.setDefaultValue(paramToBillingCustomerText);
					
				var locationField = form.addField('custpage_to_location_select', 'text', 'Location', null, 'custpage_grp_to');
				locationField.setDisplayType('disabled');
				locationField.setDefaultValue(paramToLocationText);
					
				var tab = form.addTab('custpage_tab_assets', 'Assets To Select');
				tab.setLabel('Assets To Select');
				
				var tab2 = form.addTab('custpage_tab_items2', '');
				
				form.addField('custpage_tab2', 'text', 'test', null, 'custpage_tab_items2');
				
				var subList = form.addSubList('custpage_sublist_assets', 'list', 'Assets To Select', 'custpage_tab_assets');
				
				subList.setLabel('Assets To Select');
				
				//Add a mark/unmark button
				//
				subList.addMarkAllButtons();
				
				
				var listSelect = subList.addField('custpage_sublist_tick', 'checkbox', 'Select', null);
				var listName = subList.addField('custpage_sublist_name', 'text', 'Name', null);
				var listBillingCust = subList.addField('custpage_sublist_bill_cust', 'text', 'Billing Customer', null);
				var listLocation = subList.addField('custpage_sublist_location', 'text', 'Location', null);
				var listMake = subList.addField('custpage_sublist_make', 'text', 'Make', null);
				var listModel = subList.addField('custpage_sublist_model', 'text', 'Model', null);
				var listSerial = subList.addField('custpage_sublist_serial', 'text', 'Serial Number', null);
				var listIsItem = subList.addField('custpage_sublist_is_item', 'text', 'Asset Is Item', null);
				var listId = subList.addField('custpage_sublist_id', 'text', 'Id', null);
				listId.setDisplayType('hidden');
				
				filters = [];
				
				if(paramFromCustomerId != '')
					{
						filters.push(["custrecord_faasset_customer","anyof",paramFromCustomerId])
					}
		
				if(paramFromBillingCustomerId != null && paramFromBillingCustomerId != '')
					{
						filters.push("AND",["custrecord_faasset_billingcustomer","anyof",paramFromBillingCustomerId])
					}
				
				if(paramFromLocationId != null && paramFromLocationId != '')
					{
						filters.push("AND",["custrecord_faasset_falocation","anyof",paramFromLocationId])
					}
		
				var customrecord_faassetSearch = nlapiSearchRecord("customrecord_faasset",null,
						filters, 
						[
						   new nlobjSearchColumn("name").setSort(false), 
						   new nlobjSearchColumn("custrecord_faasset_make"), 
						   new nlobjSearchColumn("custrecord_faasset_model"), 
						   new nlobjSearchColumn("custrecord_faasset_serial"), 
						   new nlobjSearchColumn("custrecord_faasset_item"),
						   new nlobjSearchColumn("custrecord_faasset_billingcustomer"),
						   new nlobjSearchColumn("custrecord_faasset_falocation")
						]
						);		

				if(customrecord_faassetSearch != null && customrecord_faassetSearch.length > 0)
					{
						var line = Number(0);
						
						for (var int = 0; int < customrecord_faassetSearch.length; int++) 
							{
								var id = customrecord_faassetSearch[int].getId();
								var name = customrecord_faassetSearch[int].getValue("name");
								var make = customrecord_faassetSearch[int].getValue("custrecord_faasset_make");
								var model = customrecord_faassetSearch[int].getValue("custrecord_faasset_model");
								var serial = customrecord_faassetSearch[int].getValue("custrecord_faasset_serial");
								var isItem = customrecord_faassetSearch[int].getText("custrecord_faasset_item");
								var billingCust = customrecord_faassetSearch[int].getText("custrecord_faasset_billingcustomer");
								var location = customrecord_faassetSearch[int].getText("custrecord_faasset_falocation");
								
								line++;
								
								subList.setLineItemValue('custpage_sublist_name', line, name);
								subList.setLineItemValue('custpage_sublist_make', line, make);
								subList.setLineItemValue('custpage_sublist_model', line, model);
								subList.setLineItemValue('custpage_sublist_serial', line, serial);
								subList.setLineItemValue('custpage_sublist_is_item', line, isItem);
								subList.setLineItemValue('custpage_sublist_bill_cust', line, billingCust);
								subList.setLineItemValue('custpage_sublist_location', line, location);
								subList.setLineItemValue('custpage_sublist_id', line, id);	
							}
					}
				
				form.addSubmitButton('Reassign Assets');

				break;
				
			case 3:
			
				//Add a message field 
				//
				var messageField = form.addField('custpage_message', 'textarea', 'Message', null, null);
				messageField.setDisplaySize(120, 4);
				messageField.setDisplayType('readonly');
				messageField.setDefaultValue('The selected assets have now been moved to the new specified location');
			
				form.addSubmitButton('Finish');

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
		
		//Get the stage of the processing we are at
		//
		var stage = Number(request.getParameter('custpage_stage'));
		
		switch(stage)
		{
			case 1:

				
				//Build up the parameters so we can call this suitelet again, but move it on to the next stage
				//
				var params = new Array();
				params['stage'] = '2';
				
				params['frombillingcustomerid'] = request.getParameter('custpage_from_billing_cust_id');
				params['frombillingcustomertext'] = request.getParameter('custpage_from_billing_cust_txt');
				params['fromcustomerid'] = request.getParameter('custpage_from_cust_id');
				params['fromcustomertext'] = request.getParameter('custpage_from_cust_txt');
				params['fromlocationid'] = request.getParameter('custpage_from_location_id');
				params['fromlocationtext'] = request.getParameter('custpage_from_location_txt');
				
				params['tobillingcustomerid'] = request.getParameter('custpage_to_billing_cust_id');
				params['tobillingcustomertext'] = request.getParameter('custpage_to_billing_cust_txt');
				params['tocustomerid'] = request.getParameter('custpage_to_cust_id');
				params['tocustomertext'] = request.getParameter('custpage_to_cust_txt');
				params['tolocationid'] = request.getParameter('custpage_to_location_id');
				params['tolocationtext'] = request.getParameter('custpage_to_location_txt');
	
				
				var context = nlapiGetContext();
				response.sendRedirect('SUITELET',context.getScriptId(), context.getDeploymentId(), null, params);
				
				break;
				
			case 2:
				
				var paramToBillingCustomerId = request.getParameter('custpage_to_billing_cust_id');
				var paramToCustomerId = request.getParameter('custpage_to_cust_id');
				var paramToLocationId = request.getParameter('custpage_to_location_id');
				
				
				var lineCount = request.getLineItemCount('custpage_sublist_assets');
				
				for (var int = 1; int <= lineCount; int++) 
					{
						var ticked = request.getLineItemValue('custpage_sublist_assets', 'custpage_sublist_tick', int);
						
						//Look for ticked lines
						//
						if (ticked == 'T')
							{
								var assetId = request.getLineItemValue('custpage_sublist_assets', 'custpage_sublist_id', int);
								
								var fields = new Array();
								var values = new Array();
								
								fields[0] = 'custrecord_faasset_customer';
								fields[1] = 'custrecord_faasset_falocation';
								fields[2] = 'custrecord_faasset_billingcustomer';
								
								values[0] = paramToCustomerId;
								values[1] = paramToLocationId;
								
								if(paramToBillingCustomerId != '')
									{
										values.push(paramToBillingCustomerId);
									}
								else
									{
										values.push(null);
									}
								
								var status = nlapiSubmitField('customrecord_faasset', assetId, fields, values, true);
								
							}
					}
				
				var params = new Array();
				params['stage'] = '3';
				
				var context = nlapiGetContext();
				response.sendRedirect('SUITELET',context.getScriptId(), context.getDeploymentId(), null, params);
				
				break;
			
			case 3:
				
				response.sendRedirect('TASKLINK', 'CARD_20',null,null,null);
				
				break;
		}
	}
}

//=====================================================================
//Functions
//=====================================================================
//








