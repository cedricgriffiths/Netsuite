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
function priceListFieldChanged(type, name, linenum)
{
	//If any of the filters are changed, then get the data from all of those filters & store the data in the session data
	//
	if(['custpage_cust_type_select', 'custpage_subsidiary_select', 'custpage_begins_with'].indexOf(name) > -1)
		{
			var filters = {};
		
			var customerType = nlapiGetFieldValue('custpage_cust_type_select');
			filters['type'] = customerType;
			
			var subsidiary = nlapiGetFieldValue('custpage_subsidiary_select');
			filters['subsidiary'] = subsidiary;

			var beginsWith = nlapiGetFieldValue('custpage_begins_with');
			filters['beginswith'] = beginsWith;

			var filtersString = JSON.stringify(filters);
			
			var session = nlapiGetFieldValue('custpage_session_param');
			
			libSetSessionData(session, filtersString);
		}
	/*
	if(type == 'custpage_sublist_customer' && name == 'custpage_sublist_customer_tick')
		{
			var ticked = nlapiGetLineItemValue(type, name, linenum);
			
			if(ticked == 'T')
				{
					var theParent = nlapiGetLineItemValue(type, 'custpage_sublist_customer_internal', linenum);
				
					var lines = nlapiGetLineItemCount(type);
				
					for (var int = 1; int <= lines; int++) 
						{
							var otherParent = nlapiGetLineItemValue(type, 'custpage_sublist_customer_parent', int);
							
							if(otherParent == theParent)
								{
									nlapiSetLineItemValue(type, 'custpage_sublist_customer_tick', int, 'T');
								}
						}
				}
			
		}
		*/
}	
