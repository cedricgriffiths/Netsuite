/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       16 Feb 2017     cedricgriffiths
 *
 */
function clientFieldChanged(type, name, linenum)
{
	// Check to see if we are in the context of the contract drop down box
	if (name == 'custpage_f0')
	{
		// Get the field value
		var contract = nlapiGetFieldValue('custpage_f0');

		// See if we have actually picked a contract
		if (contract != null && contract != '')
		{
			// Make the submit button visible
			setFieldAndLabelVisibility("tbl_submitter", true);
		}
		else
		{
			// Hide the submit button
			setFieldAndLabelVisibility("tbl_submitter", false);
		}
	}
}

function buttonClick() {
	
	var field1 = nlapiGetFieldValue('custpage_field1');;
	nlapiSetFieldValue('custpage_field1', 'clicked', false, true);
	alert('clicked');
}

function button2Click() {
	
	/*
	 var lineCount = nlapiGetLineItemCount('custpage_sublist2');
	
	nlapiSelectLineItem('custpage_sublist2', lineCount);
	var a = nlapiGetCurrentLineItemValue('custpage_sublist2', 'custpage_col23');
	
	nlapiRemoveLineItem('custpage_sublist2');
	
	for (var int = 1; int <= lineCount; int++) {
		var val = Number(nlapiGetLineItemValue('custpage_sublist2', 'custpage_col23', int));
		val++;
		nlapiSetLineItemValue('custpage_sublist2', 'custpage_col23', int, val);
	}
	*/
	var uniqueId = nlapiGetFieldValue('custpage_field1');
	
	
	var filters = new Array();
	var columns = new Array();
	filters[0] = new nlobjSearchFilter('custrecord_bbs_params_id', null, 'is', uniqueId);
	columns[0] = new nlobjSearchColumn('custrecord_bbs_params_data');
	
	var paramsSearch = nlapiSearchRecord('customrecord_bbs_internal_params', null, filters, columns);
	
	if (paramsSearch != null || paramsSearch.length == 1)
		{
			var id = paramsSearch[0].getId();
			var paramsRecord = nlapiLoadRecord('customrecord_bbs_internal_params', id);
			var field4 = nlapiGetFieldValue('custpage_field4');
			
			paramsRecord.setFieldValue('custrecord_bbs_params_data', field4);
			nlapiSubmitRecord(paramsRecord, false, true);
		}

	nlapiRefreshLineItems('custpage_sublist2');
	

}


