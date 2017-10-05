/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       23 Aug 2017     cedricgriffiths
 *
 */
function libPoMatrix()
{
	var currentRecordId = nlapiGetRecordId();
	
	// Get the relative url of the suitelet 
	//
	var url = nlapiResolveURL('SUITELET', 'customscript_bbs_po_matrix_suitelet', 'customdeploy_bbs_po_matrix_suitelet');

	url = url + '&poid=' + currentRecordId;
	
	// Open a new window
	//
	window.open(url, '_blank', 'Print Purchase Order Matrix', 'menubar=no, titlebar=no, toolbar=no, scrollbars=no, resizable=yes');

}