/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       12 Apr 2017     cedricgriffiths
 *
 */

/**
 * @returns {Void} Any or no return value
 */
function getPoApprover() 
{
	//Initialise the return value
	//
    var returnValue = '';
    
	try
		{
			//Get the current record - a vendor bill
			//
			var vendorBillRecord = nlapiGetNewRecord();
		
			//Get the number of lines in the purchase order sublist
			//
		    var lines = vendorBillRecord.getLineItemCount('purchaseorders');
		    var poId = '';
		    
		    //Find the first purchase order in the sublist
		    //
		    for (var int = 1; int <= lines; int++) 
		    	{
					poId = vendorBillRecord.getLineItemValue('purchaseorders', 'id', int);
					
					if (poId != null && poId != '')
						{
							break;
						}
		    	}
		    
		    //If we have a purchase order, then we need to find the approver
		    //
		    if 	(poId != null && poId != '')
		    	{
		    		//Load the purchase order record
		    		//
		    		var poRecord = nlapiLoadRecord('purchaseorder', poId);
		    		
		    		if(poRecord)
		    			{
		    				//Get the id of the approver
		    				//
		    				returnValue = poRecord.getFieldValue('custbody_currentuser_hid');
		    			}
		    	}
		}
	catch(err)
		{
			nlapiLogExecution('DEBUG', 'Execution Error', err.message);
		}
	
    return returnValue;
}
