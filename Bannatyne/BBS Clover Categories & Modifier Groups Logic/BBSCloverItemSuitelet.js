/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 Oct 2018     cedricgriffiths
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response)
{
	if (request.getMethod() == 'GET') 
		{
			//=============================================================================================
			//Start of main code
			//=============================================================================================
			//
			  
			  
			//Get request - so return a form for the user to process
			//
			
			//Get parameters
			//
			var itemId = request.getParameter('itemid');
			var itemName = request.getParameter('itemname');
			var recordType = request.getParameter('recordtype');
			
			var formTitle = '';
			var buttonTitle = '';
			var fieldTitle = '';
			
			switch(recordType)
				{
					case 'kititem':
					case 'inventoryitem':
					case 'noninventoryitem':
					case 'serviceitem':
					
							formTitle = 'Populate Item Location Matrix';
							buttonTitle = 'Finish';
							fieldTitle = 'Clover Item';
							
							break;
							
					case 'customrecordbbs_clover_category_list2':
						
						formTitle = 'Populate Clover Category Locations';
						buttonTitle = 'Finish';
						fieldTitle = 'Clover Category';
						
						break;
						
					case 'customrecordbbs_modifier_groups':
						
						formTitle = 'Populate Clover Modifier Groups Locations';
						buttonTitle = 'Finish';
						fieldTitle = 'Clover Modifier Group';
						
						break;
				}
			
			// Create a form
			//
			var form = nlapiCreateForm(formTitle, false);
			form.setTitle(formTitle);
			
			//Add a field group
			//
			form.addFieldGroup('custpage_group_main', 'Main', null);
			
			//Add a field to show the item we are processing
			//
			var cloverName = form.addField('custpage_form_clover_name', 'text', fieldTitle, null, 'custpage_group_main');
			cloverName.setDefaultValue(itemName);
			cloverName.setDisplayType('disabled');
			
			//Add a field to hold the item id
			//
			var cloverId = form.addField('custpage_form_clover_id', 'text', 'Clover Item Id', null, 'custpage_group_main');
			cloverId.setDefaultValue(itemId);
			cloverId.setDisplayType('hidden');
			
			//Add a field to hold the record type
			//
			var cloverRecordType = form.addField('custpage_form_record_type', 'text', 'Clover Record Type', null, 'custpage_group_main');
			cloverRecordType.setDefaultValue(recordType);
			cloverRecordType.setDisplayType('hidden');
			
			//Create the available location sublist
			//
			var subList1 = form.addSubList('custpage_sublist_locations', 'list', 'Available Locations', null);
			subList1.setLabel('Available Locations');

			//Add fields to the sublist
			//
			var sublist1Tick = subList1.addField('custpage_sublist1_tick', 'checkbox', 'Select', null);
			var sublist1Location = subList1.addField('custpage_sublist1_location', 'text', 'Location', null);
			var sublist1CloverCode = subList1.addField('custpage_sublist1_clover_code', 'text', 'Location Code', null);
			var sublist1LocationId = subList1.addField('custpage_sublist1_location_id', 'text', 'Location Id', null);
			sublist1LocationId.setDisplayType('hidden');
			
			//Find the location records
			//
			var customrecordbbs_clover_loc_tableSearch = nlapiSearchRecord("customrecordbbs_clover_loc_table",null,
					[
					 	["isinactive","is","F"]
					], 
					[
					   new nlobjSearchColumn("custrecordbbs_location_3").setSort(false), 
					   new nlobjSearchColumn("name")
					]
					);
			
			//Process the search results & populate the sublist
			//
			if(customrecordbbs_clover_loc_tableSearch)
				{
					var lineNumber = Number(1);
					
					for (var int = 0; int < customrecordbbs_clover_loc_tableSearch.length; int++) 
						{
							var resultsLocationId = customrecordbbs_clover_loc_tableSearch[int].getId();
							var resultsLocationText = customrecordbbs_clover_loc_tableSearch[int].getText('custrecordbbs_location_3');
							var resultsCloverId = customrecordbbs_clover_loc_tableSearch[int].getValue('name');
						
							subList1.setLineItemValue('custpage_sublist1_location', lineNumber, resultsLocationText);
							subList1.setLineItemValue('custpage_sublist1_clover_code', lineNumber, resultsCloverId);
							subList1.setLineItemValue('custpage_sublist1_location_id', lineNumber, resultsLocationId);
							
							lineNumber++;
						}
				}
			
			//Add buttons
			//
			subList1.addMarkAllButtons();
			form.addSubmitButton(buttonTitle);
			
			//Return the form to the user
			//
			response.writePage(form);
		}
	else
		{
			//Process the returned form
			//
			var sublistCount = request.getLineItemCount('custpage_sublist_locations');
			var cloverId = request.getParameter('custpage_form_clover_id');
			var recordType = request.getParameter('custpage_form_record_type');
			
			var parameterObject = {};
			parameterObject['itemid'] = cloverId;
			parameterObject['recordtype'] = recordType;
			
			var locationIds = [];
			
			for (var int2 = 1; int2 <= sublistCount; int2++) 
				{
					var sublistTicked = request.getLineItemValue('custpage_sublist_locations', 'custpage_sublist1_tick', int2);
					
					if(sublistTicked == 'T')
						{
							var sublistLocationId = request.getLineItemValue('custpage_sublist_locations', 'custpage_sublist1_location_id', int2);
						
							locationIds.push(sublistLocationId);
						}
				}
			
			parameterObject['locations'] = locationIds;
			
			var scheduleParams = {
					custscript_bbs_param_object: JSON.stringify(parameterObject)
					};
		
			nlapiScheduleScript('customscript_bbs_clover_item_scheduled', null, scheduleParams);

			response.sendRedirect('RECORD', recordType, cloverId, false, null);
		}
}
