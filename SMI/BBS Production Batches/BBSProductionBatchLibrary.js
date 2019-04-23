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

function libReprint()
{
	var currentRecordId = nlapiGetRecordId();
	var batches = [currentRecordId];
	
	// Get the relative url of the suitelet 
	//
	var url = nlapiResolveURL('SUITELET', 'customscript_bbs_assign_wo_suitelet', 'customdeploy_bbs_assign_wo_suitelet');

	url = url + '&mode=C&solink=T&stage=4&batches=' + JSON.stringify(batches);
	
	// Open a new window
	//
	window.open(url, '_blank', 'Reprint Production Batch Documentation', 'menubar=no, titlebar=no, toolbar=no, scrollbars=no, resizable=yes');

}