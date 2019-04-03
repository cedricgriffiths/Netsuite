/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       09 Jan 2018     cedricgriffiths
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response)
{
	if (request.getMethod() == 'GET') 
		{
			var form = nlapiCreateForm('Delete Price Levels', false);
			form.setTitle('Delete Price Levels');
			
			var messageField = form.addField('custpage_message', 'textarea', 'Message', null, null);
			messageField.setDisplaySize(120, 4);
			messageField.setDisplayType('readonly');
			messageField.setDefaultValue('This utility will clear down all the price levels from all of the item records - USE WITH CARE');
		
			form.addSubmitButton('Schedule Pricelevel Cleardown');
			
			//Write the response
			//
			response.writePage(form);
		}
	else
		{
			var status = nlapiScheduleScript('customscript_bbs_delete_price_levels', 'customdeploy_bbs_delete_price_levels', null);
			var context = nlapiGetContext();
			var usersEmail = context.getUser();
			
			nlapiSendEmail(usersEmail, usersEmail, 'Pricelevel Deletion', 'The pricelevel deletion scheduled script has been submitted (status = "' + status + '")');
			
			response.sendRedirect('TASKLINK', 'CARD_-29',null,null,null);
		}
}
