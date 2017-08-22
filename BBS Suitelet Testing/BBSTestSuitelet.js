/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       16 Feb 2017     cedricgriffiths
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */


function suitelet(request, response){

	var paramStartDate = request.getParameter('startdate');
	var paramEndDate = request.getParameter('enddate');
	//var uniqueId = request.getParameter('uniqueid'); //Number(Date.now()).toFixed(0).toString();
	//var sessionData = '';
	
	if (request.getMethod() == 'GET') {
		
		var filters = new Array();
		var columns = new Array();
		filters[0] = new nlobjSearchFilter('custrecord_bbs_params_id', null, 'is', uniqueId);
		columns[0] = new nlobjSearchColumn('custrecord_bbs_params_data');
		
		var paramsSearch = nlapiSearchRecord('customrecord_bbs_internal_params', null, filters, columns);
		
		
		if (paramsSearch == null || paramsSearch.length == 0)
			{
				var paramsRecord = nlapiCreateRecord('customrecord_bbs_internal_params');
				paramsRecord.setFieldValue('custrecord_bbs_params_id', uniqueId);
				nlapiSubmitRecord(paramsRecord, false, true);
			}
		else
			{
				sessionData = paramsSearch[0].getValue('custrecord_bbs_params_data');
			}

		
		// Create a form
		//
		var form = nlapiCreateForm('BBS Test Suitlet');
		
		// Set the client side script to be used with this form
		form.setScript('customscript_bbs_test_suitlet_client');
		
		form.addButton('custpage_button1', 'Button 1', 'buttonClick()');
		
		// Add a submit button
		//
		form.addSubmitButton('Submit');

		// Create the uplift field
		//
		var field1 = form.addField('custpage_field1', 'text', 'Field 1');
		//field1.setDefaultValue(uniqueId);
		
		var tab1 = form.addTab('custpage_tab1', 'Tab 1');
		
		var subtab11 = form.addSubTab('custpage_subtab1', 'Sub Tab 1', 'custpage_tab1');
		var subtab12 = form.addSubTab('custpage_subtab2', 'Sub Tab 2', 'custpage_tab1');
		
		var field2 = form.addField('custpage_field2', 'text', 'Field 2', null, 'custpage_tab1');

		var tab2 = form.addTab('custpage_tab2', 'Tab 2');
		
		var field3 = form.addField('custpage_field3', 'text', 'Field 3', null, 'custpage_tab2');
		var field4 = form.addField('custpage_field4', 'text', 'Field 4', null, 'custpage_subtab1');
		//var field5 = form.addField('custpage_field5', 'text', 'Field 5', null, 'custpage_subtab2');
		var list1 = form.addSubList('custpage_sublist1', 'list', 'Static Sub List', 'custpage_subtab2')
		
		list1.setLabel('Static Sub List');
		
		list1.addField('custpage_col1', 'checkbox', 'Column 1', null);
		list1.addField('custpage_col2', 'text', 'Column 2', null);
		list1.addField('custpage_col3', 'integer', 'Column 3', null);
		list1.addField('custpage_col4', 'float', 'Column 4', null);
		
		list1.addMarkAllButtons();
		
		for(var i=1; i< 10; i++ ) 
			{
		    list1.setLineItemValue('custpage_col2', i, 'val' + i); 
		    list1.setLineItemValue('custpage_col3', i, i.toString()); 
		    
			}
		    
		var list2 = form.addSubList('custpage_sublist2', 'staticlist', 'Sub List', 'custpage_subtab1');
		
		list2.setLabel('Sub List');
		list2.addButton('custpage_button2', 'Do some Stuff', 'button2Click()');
		list2.addRefreshButton();
      
		list2.addField('custpage_col21', 'checkbox', 'Column 1', null);
		list2.addField('custpage_col22', 'text', 'Column 2', null);
		var col23 = list2.addField('custpage_col23', 'integer', 'Column 3', null);
		col23.setDisplayType('entry');

		
		var prefix = ((sessionData == null || sessionData == '') ? '' : sessionData);
		

		
		for(var i=1; i< 10; i++ ) 
			{
		    list2.setLineItemValue('custpage_col22', i, prefix + i); 
		    list2.setLineItemValue('custpage_col23', i, i.toString()); 
		    
			}
		
		
		
		
		//Write the response
		//
		response.writePage(form);
	}
	else {

		//dumpResponse(request,response);

	}

}


