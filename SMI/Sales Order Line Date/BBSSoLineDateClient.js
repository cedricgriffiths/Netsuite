/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       18 Oct 2017     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function soLineDateFieldChanged(type, name, linenum)
{
	if(name == 'entity' || name == 'otherrefnum')
		{
			//Get the customer id
			//
			var customerId = nlapiGetFieldValue('entity');
			
			//If we have a customer id, we can proceed
			//
			if(customerId)
				{
					//Get the sales lead time in days from the customer
					//
					var salesLeadTime = Number(nlapiLookupField('customer', customerId, 'custentity_bbs_sales_lead_time', false));
					
					//Check to see if the lead time is a valid number
					//
					if(!isNaN(salesLeadTime) && salesLeadTime != 0)
						{
							//Get today's date
							//
							var today = new Date();
							
							//Add the lead time to today's date & convert back to a string
							//
							var newShipDate = nlapiAddDays(today, salesLeadTime);
							//var newShipDate = calcWorkingDays(today, salesLeadTime);
							
							var newShipDateString = nlapiDateToString(newShipDate);
							
							//Update the ship date on the order header
							//
							nlapiSetFieldValue('shipdate', newShipDateString, true, true);
						}
				}
		}
}

function calcWorkingDays(fromDate, days) 
{
    var count = 0;
    
    while (count < days) 
    	{
        	fromDate.setDate(fromDate.getDate() + 1);
        
        	if (fromDate.getDay() != 0 && fromDate.getDay() != 6) // Skip weekends
	            {
	        		count++;
	            }
    	}
    
    return fromDate;
}