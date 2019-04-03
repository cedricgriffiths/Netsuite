/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       07 Mar 2017     cedricgriffiths
 *
 */

/**
 * @returns {Void} Any or no return value
 */
function workflowAction() {

	var context = nlapiGetContext();
	
	var emailUserId = context.getSetting('SCRIPT', 'custscript_email_user');
	
	if (emailUserId != '')
		{
			var merger = nlapiCreateEmailMerger(2);
			merger.setTransaction(transactionId);
			var mergeResult = merger.merge(); 
			
			var emailSubject = mergeResult.getSubject();
			var emailBody = mergeResult.getBody();
			
			nlapiSendEmail(emailUserId, recipient, subject, body, null, null, records, attachments, true, false);
				
		}
}
