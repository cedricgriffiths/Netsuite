/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       22 Aug 2018     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function clientPageInit(type)
{
   
}


function printJobSheet()
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