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
	var suiteletId = request.getParameter('suiteletid');
	
	var sessionId = libCreateSession();
	
	response.sendRedirect('SUITELET', 'customscript_' + suiteletId, 'customdeploy_' + suiteletId, null, {sessionid: sessionId});
}
