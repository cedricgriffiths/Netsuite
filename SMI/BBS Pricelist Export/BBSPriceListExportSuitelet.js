/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       25 Aug 2017     cedricgriffiths
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response)
{
	//=============================================================================================
	//Start of main code
	//=============================================================================================
	//

	if (request.getMethod() == 'GET') 
	{
		//Get the parameters
		//
		var customerId = request.getParameter('customerid');
	
		//Schedule the pricelist script
		//
		var params = {custscript_bbs_customerid: customerId};
	
		nlapiScheduleScript('customscript_bbs_pricelist_schedule', null, params);
		
		var xml = "<html><body><script>window.close();</script></body></html>";
		response.write(xml);
		
	}
}

