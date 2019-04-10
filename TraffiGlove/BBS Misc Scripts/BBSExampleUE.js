/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       02 Nov 2018     cedricgriffiths
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
function bbsExampleAfterSubmit(type)
{
	//Only interested in edit mode
	//
	if(type == 'edit')
		{
			var oldRecord = nlapiGetOldRecord();	//Get the before image of the record
			var newRecord = nlapiGetNewRecord();	//Get the after image of the recored
			var newId = newRecord.getId();			//Get the id 
			var newType = newRecord.getRecordType();//Get the record type		
		    
			var oldStatus = oldRecord.getFieldValue('status');		//Get the old order status
			var newStatus = newRecord.getFieldValue('status');		//Get the new order status
			var newCustomerId = newRecord.getFieldValue('entity');	//Get the customer id 
			
			//Get the show on eos flag from the customer
			//
			var showOnEos = nlapiLookupField('customer', newCustomerId, 'custentity_sw_show_on_eos', false);	
			
			//If the show on eos flag is true & the status of the order has changed then carry on
			//
			if(showOnEos == 'T' && oldStatus != newStatus)
				{
					try
						{
					        var payload = {
					            type: 'user_event',
					            recordEventType: type,
					            recordType: newType,
					            recordId: newId,
					            password: 'i82qb4ip'
					        };
				        
					        nlapiRequestURL("https://eoshub.online/nssvc/event/", payload, null);
						}
					catch(e)
						{
				  			nlapiLogExecution('error','user_event has encountered an error.',e);
						}
				
				}
		}
}
