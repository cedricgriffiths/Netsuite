/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       23 Aug 2017     cedricgriffiths
 *
 */
function libCheckAssembly()
{
	var currentRecordId = nlapiGetRecordId();
	
	// Get the relative url of the suitelet 
	//
	var url = nlapiResolveURL('SUITELET', 'customscript_bbs_chk_assm_suitelet', 'customdeploy_bbs_chk_assm_suitelet');

	url = url + '&salesorderid=' + currentRecordId;
	
	// Open a new window
	//
	window.open(url, '_blank', 'Assembly Build Requirements', 'menubar=no, titlebar=no, toolbar=no, scrollbars=no, resizable=yes');

}