/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       01 Sep 2017     cedricgriffiths
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
function clientFieldChanged(type, name, linenum)
{
	if (name == 'custpage_from_bill_cust_select')
		{
			nlapiSetFieldValue('custpage_from_billing_cust_txt', nlapiGetFieldText(name), false, true);
			nlapiSetFieldValue('custpage_from_billing_cust_id', nlapiGetFieldValue(name), false, true);
		}

	if (name == 'custpage_from_cust_select')
		{
			nlapiSetFieldValue('custpage_from_cust_txt', nlapiGetFieldText(name), false, true);
			nlapiSetFieldValue('custpage_from_cust_id', nlapiGetFieldValue(name), false, true);
			
			var locations = getLocations(nlapiGetFieldValue(name));
			
			nlapiRemoveSelectOption('custpage_from_location_select', null);
			nlapiInsertSelectOption('custpage_from_location_select', 0, '', true);
			
			for ( var locationId in locations) 
				{
					nlapiInsertSelectOption('custpage_from_location_select', locationId, locations[locationId], false);
				}
		}

	if (name == 'custpage_from_location_select')
		{
			nlapiSetFieldValue('custpage_from_location_txt', nlapiGetFieldText(name), false, true);
			nlapiSetFieldValue('custpage_from_location_id', nlapiGetFieldValue(name), false, true);
		}

	if (name == 'custpage_to_bill_cust_select')
		{
			nlapiSetFieldValue('custpage_to_billing_cust_txt', nlapiGetFieldText(name), false, true);
			nlapiSetFieldValue('custpage_to_billing_cust_id', nlapiGetFieldValue(name), false, true);
		}
	
	if (name == 'custpage_to_cust_select')
		{
			nlapiSetFieldValue('custpage_to_cust_txt', nlapiGetFieldText(name), false, true);
			nlapiSetFieldValue('custpage_to_cust_id', nlapiGetFieldValue(name), false, true);
			
			var locations = getLocations(nlapiGetFieldValue(name));
			
			nlapiRemoveSelectOption('custpage_to_location_select', null);
			nlapiInsertSelectOption('custpage_to_location_select', 0, '', true);
			
			for ( var locationId in locations) 
				{
					nlapiInsertSelectOption('custpage_to_location_select', locationId, locations[locationId], false);
				}
		}
	
	if (name == 'custpage_to_location_select')
		{
			nlapiSetFieldValue('custpage_to_location_txt', nlapiGetFieldText(name), false, true);
			nlapiSetFieldValue('custpage_to_location_id', nlapiGetFieldValue(name), false, true);
		}


}


function getLocations(_customerId)
{
	var returnData = {};
	
	var customrecord_falocationSearch = nlapiSearchRecord("customrecord_falocation",null,
			[
			   ["custrecord_falocation_customer","anyof", _customerId]
			], 
			[
			   new nlobjSearchColumn("name").setSort(false), 
			   new nlobjSearchColumn("custrecord_falocation_customer")
			]
			);
	
	if(customrecord_falocationSearch != null && customrecord_falocationSearch.length > 0)
		{
			for (var int = 0; int < customrecord_falocationSearch.length; int++) 
				{
					var name = customrecord_falocationSearch[int].getValue("name");
					var id = customrecord_falocationSearch[int].getId();
					
					returnData[id] = name;
				}
		}
	
	return returnData;
}









