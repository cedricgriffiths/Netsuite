/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       10 Sep 2018     cedricgriffiths
 *
 */
function glbprintJobSheet()
{
	var url = nlapiResolveURL('SUITELET', 'customscript_bbs_print_job_sheet', 'customdeploy_bbs_print_job_sheet');
	
	var Id = nlapiGetRecordId();

	// Add the case id to the url
	//
	url += '&caseid=' + Id;

	// Open the suitelet in the current window
	//
	window.open(url, '_blank', 'Print Job Sheet', 'toolbar=no, scrollbars=no, resizable=no');
}