/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       24 Mar 2017     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function userEventAfterSubmit(type){
  
	if (type == 'create' )
		{	
			var caseRecord = nlapiGetNewRecord();
			
			var caseHelpdesk = caseRecord.getFieldValue('helpdesk');
			var caseStatus = caseRecord.getFieldValue('status');
			
			//See if the case has the help desk flag set & the status is 'Customer at Risk'
			//
			if (caseHelpdesk == 'T' && (caseStatus == '15' || caseStatus == '16'))
				{
					//Get the customer id from the case
					//
					var customer = caseRecord.getFieldValue('custevent_bbs_helpdesk_customer');
					
					//Get the title of the case
					//
					var title = caseRecord.getFieldValue('title');
					
					//Get the customer record
					//
					var custRecord = nlapiLoadRecord('customer', customer);
					
					//Save the current customer status
					//
					var originalStatus = custRecord.getFieldValue('entitystatus');
					custRecord.setFieldValue('custentity_bbs_original_status', originalStatus);
					
					//Set the at risk flag & status
					//
					if (caseStatus == '15')
						{
							custRecord.setFieldValue('custentity_bbs_customer_at_risk', 'T');
							custRecord.setFieldValue('entitystatus', '118');
							custRecord.setFieldValue('custentity_bbs_customer_at_risk_msg', title);
						}
					
					//Set the no support flag & status
					//
					if (caseStatus == '16')
						{
							custRecord.setFieldValue('custentity_bbs_customer_support_ended', 'T');
							custRecord.setFieldValue('entitystatus', '119');
							custRecord.setFieldValue('custentity_bbs_customer_no_support_msg', title);
						}
					
					//Update the customer record
					//
					nlapiSubmitRecord(custRecord, false, true);
				}
		}
	
	if (type == 'edit')
	{
		var newCaseRecord = nlapiGetNewRecord();
		var oldCaseRecord = nlapiGetOldRecord();
		
		var oldCaseStatus = oldCaseRecord.getFieldValue('status');
		var newCaseStatus = newCaseRecord.getFieldValue('status');
		
		var caseHelpdesk = newCaseRecord.getFieldValue('helpdesk');
		
		//If record is 'closed' then update the customer status
		//
		if (caseHelpdesk == 'T' && newCaseStatus == 5)
		{
			//Get the customer id from the case
			//
			var customer = newCaseRecord.getFieldValue('custevent_bbs_helpdesk_customer');
			
			//Get the customer record
			//
			var custRecord = nlapiLoadRecord('customer', customer);
			
			//Get the original customer status
			//
			var origStatus = custRecord.getFieldValue('custentity_bbs_original_status');
			
			//Set the status & un-set the at risk flag
			//
			custRecord.setFieldValue('custentity_bbs_customer_at_risk', 'F');
			custRecord.setFieldValue('custentity_bbs_customer_support_ended', 'F');
			custRecord.setFieldValue('entitystatus', origStatus);
			custRecord.setFieldValue('custentity_bbs_original_status', null);
			
			//Update the customer record
			//
			nlapiSubmitRecord(custRecord, false, true);
		}
	}
}
