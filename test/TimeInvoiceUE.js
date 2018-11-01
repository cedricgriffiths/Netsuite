/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       23 Apr 2018     cedricgriffiths
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
function afterSumbitUpdateTimeTracking(type)
{
    //get the current invoice record    
    currentRecordId = nlapiGetRecordId();
    var currentRec = nlapiLoadRecord('invoice',currentRecordId);
    
    // Get the number of line Time Tracking items submitted
    lines = currentRec.getLineItemCount('time'); 
    
    //parse the list of time records
    for ( var i=1; i<=lines; i++ )
        {
	        //get the ID of the Time Tracking 
	        var timeRecId = currentRec.getLineItemValue('time', 'doc', i);
	        var timeSelected = currentRec.getLineItemValue('time', 'apply', i);
	        var timeQuantity = currentRec.getLineItemValue('time', 'quantity', i);
	        var timeRate = currentRec.getLineItemValue('time', 'rate', i);
	        var timeAmount = currentRec.getLineItemValue('time', 'amount', i);
	        
	        //if it's selected on the invoice, update its custom field
	        if (timeSelected == 'T')
	        	{
	        		var timeRecord = null;
	        		
	        		try
		        		{
		        			timeRecord = nlapiLoadRecord('timebill', timeRecId);
		        		}
	        		catch(err)
		        		{
	        				timeRecord = null;
		        		}
	        		
	        		if(timeRecord)
	        			{
		        			timeRecord.setFieldValue('custcol_bbs_related_invoice', currentRecordId);
		        			timeRecord.setFieldValue('custcol_bbs_related_invoice_qty', timeQuantity);
		        			timeRecord.setFieldValue('custcol_bbs_related_invoice_rate', timeRate);
		        			timeRecord.setFieldValue('custcol_bbs_related_invoice_amt', timeAmount);
		        			
		        			try
			        			{
			        				nlapiSubmitRecord(timeRecord, false, true);
			        			}
		        			catch(err)
			        			{
			        				nlapiLogExecution('ERROR', 'Error updating time bill record', err.message);
			        			}
	        			}
	        		
	                 //nlapiSubmitField('timebill', timeRecId, 'custcol_bbs_related_invoice', currentRecordId );
	                 //nlapiSubmitField('timebill', timeRecId, 'custcol_bbs_related_invoice_qty', timeQuantity );
	                 //nlapiSubmitField('timebill', timeRecId, 'custcol_bbs_related_invoice_rate', timeRate );
	                 //nlapiSubmitField('timebill', timeRecId, 'custcol_bbs_related_invoice_amt', timeAmount );
	                 
	        	}
	        else
	            {
		            //ensure that updates on invoices when Time Tracking records are unapplied
		            var timeRecord = nlapiLoadRecord('timebill', timeRecId);
		            var invoiceNoSet = timeRecord.getFieldValue('custcol_bbs_related_invoice');
		            
		            if (invoiceNoSet != null)
		            	{
			            	timeRecord.setFieldValue('custcol_bbs_related_invoice', null);
		        			timeRecord.setFieldValue('custcol_bbs_related_invoice_qty', null);
		        			timeRecord.setFieldValue('custcol_bbs_related_invoice_rate', null);
		        			timeRecord.setFieldValue('custcol_bbs_related_invoice_amt', null);
		        			
		        			try
			        			{
			        				nlapiSubmitRecord(timeRecord, false, true);
			        			}
		        			catch(err)
			        			{
			        				nlapiLogExecution('ERROR', 'Error updating time bill record', err.message);
			        			}
		            	
		            	
		                	//nlapiSubmitField('timebill', timeRecId, 'custcol_bbs_related_invoice', null ); 
		                	//nlapiSubmitField('timebill', timeRecId, 'custcol_bbs_related_invoice_qty', null );
			                //nlapiSubmitField('timebill', timeRecId, 'custcol_bbs_related_invoice_rate', null );
			                //nlapiSubmitField('timebill', timeRecId, 'custcol_bbs_related_invoice_amt', null );
		            	}
	            }
        }
} 
       