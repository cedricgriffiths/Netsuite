/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       02 Apr 2019     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function customPrinterPageInit(type)
{
   //Do nothing
}

function customPrinterButton()
{
	var recordId = nlapiGetRecordId();
	var recordType = nlapiGetRecordType();
	
	// Get the relative url of the suitelet 
	//
	var url = nlapiResolveURL('SUITELET', 'customscript_bbs_custom_printer', 'customdeploy_bbs_custom_printer');

	url = url + '&recordid=' + recordId + '&recordtype=' + recordType;
	
	// Open a new window
	//
	window.open(url, '_blank', 'Custom PDF Printing', 'menubar=no, titlebar=no, toolbar=no, scrollbars=yes, resizable=yes');

}