/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       23 Aug 2017     cedricgriffiths
 *
 */
function libPrintLabel()
{
	var currentRecordId = nlapiGetRecordId();
	
	// Get the relative url of the suitelet 
	//
	var url = nlapiResolveURL('SUITELET', 'customscript_bbs_production_batch_label', 'customdeploy_bbs_production_batch_label');

	url = url + '&batchid=' + currentRecordId;
	
	// Open a new window
	//
	window.open(url, '_blank', 'Production Batch Label', 'menubar=no, titlebar=no, toolbar=no, scrollbars=no, resizable=yes');

}