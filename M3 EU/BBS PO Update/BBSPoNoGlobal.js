/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       14 Jan 2019     cedricgriffiths
 *
 */
function client_update_po_no();
{
	// Get the relative url of the suitelet 
	//
	var url = nlapiResolveURL('SUITELET', 'customscript_bbs_po_no_suitelet', 'customdeploy_bbs_po_no_suitelet');

	//Add the order id as a parameter
	//
	var recordId = nlapiGetRecordId();
	
	url = url + '&recordid=' + recordId;
	
	// Open a new window
	//
	window.open(url, '_blank', 'Update Purchase Order Number', 'menubar=no, titlebar=no, toolbar=no, scrollbars=no, resizable=yes');
}