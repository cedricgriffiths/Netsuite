/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       17 Aug 2017     cedricgriffiths
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suiteletLauncher(request, response)
{
	var uniqueId = Number(Date.now()).toFixed(0).toString();
	
	response.sendRedirect('SUITELET', 'customscript_bbs_test_suitelet', 'customdeploy_bbs_test_suitelet', null, {uniqueid: uniqueId});
}
