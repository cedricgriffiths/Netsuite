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
function vendorBillHasPOs() {

    var returnValue = Number(0);
    
	try
	{
	var rec = nlapiGetNewRecord();

    var lines = rec.getLineItemCount('purchaseorders');
    
    if (lines > 0 )
    	{
    		returnValue = Number(1);
    	}
    	
	}
	catch(err)
	{
		nlapiLogExecution('DEBUG', 'Execution Error', err.message);
	}
	
    return returnValue;
}
