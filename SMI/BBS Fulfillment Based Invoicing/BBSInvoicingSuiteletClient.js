/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       05 Mar 2017     cedricgriffiths
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
function invoicingFieldChanged(type, name, linenum)
{
	//If any of the filters are changed, then get the data from all of those filters & store the data in the session data
	//
	if(['custpage_ship_start', 'custpage_ship_end', 'custpage_customer_select'].indexOf(name) > -1)
		{
			var filters = {};
		
			var shipDateStart = nlapiGetFieldValue('custpage_ship_start');
			filters['shipdatestart'] = shipDateStart;
		
			var shipDateEnd = nlapiGetFieldValue('custpage_ship_end');
			filters['shipdateend'] = shipDateEnd;
		
			var customer = nlapiGetFieldValue('custpage_customer_select');
			filters['customer'] = customer;

			var filtersString = JSON.stringify(filters);
			
			var session = nlapiGetFieldValue('custpage_session_param');
			
			libSetSessionData(session, filtersString);
		}


	if(name == 'custpage_inv_date')
		{
			var currentPeriod = libGetPeriod(nlapiStringToDate(nlapiGetFieldValue('custpage_inv_date')));
			
			if(currentPeriod != '')
				{
					nlapiSetFieldValue('custpage_inv_period', currentPeriod, true, false);
				}
		}
}	

function clientSaveRecord()
{
	var returnStatus = false;
	var message = '';

	var count = nlapiGetLineItemCount('custpage_sublist_fulfils');
	message = 'Please select one or more fulfilments to continue';
				
	for (var int = 1; int <= count; int++) 
		{
			var tick = nlapiGetLineItemValue('custpage_sublist_fulfils', 'custpage_sublist_tick', int);
						
			if(tick == 'T')
				{
					returnStatus = true;
					break;
				}
		}

	if(!returnStatus)
		{	
			alert(message);
		}
	
    return returnStatus;
}
