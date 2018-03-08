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
	if(['custpage_subsidiary_select', 'custpage_ship_date','custpage_customer_select'].indexOf(name) > -1)
		{
			var filters = {};
		
			var subsidiary = nlapiGetFieldValue('custpage_subsidiary_select');
			filters['subsidiary'] = subsidiary;

			var shipDate = nlapiGetFieldValue('custpage_ship_date');
			filters['shipdate'] = shipDate;
		
			var customer = nlapiGetFieldValue('custpage_customer_select');
			filters['customer'] = customer;

			var filtersString = JSON.stringify(filters);
			
			var session = nlapiGetFieldValue('custpage_session_param');
			
			libSetSessionData(session, filtersString);
		}

	if(name == 'custpage_subsidiary_select')
		{
			var thisSubsidiary = nlapiGetFieldValue('custpage_subsidiary_select');
			
			var customersObject = libGetCustomers(thisSubsidiary);
			
			nlapiRemoveSelectOption('custpage_customer_select', null);
			nlapiInsertSelectOption('custpage_customer_select', 0, '--All--', true);
			
			for ( var customerId in customersObject) 
			{
				nlapiInsertSelectOption('custpage_customer_select', customerId, customersObject[customerId], false);
			}
			
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
