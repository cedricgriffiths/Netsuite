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
function avgcostFieldChanged(type, name, linenum)
{
	
	if(name == 'custpage_subsidiary_select')
		{
			var subsidId =  nlapiGetFieldValue(name);
			nlapiSetFieldValue('custpage_subsidiary', subsidId, false, true);
			nlapiSetFieldValue('custpage_location', null, true, true);
			
			if(subsidId)
				{
					var locationSearch = nlapiSearchRecord("location",null,
							[
							   ["subsidiary","anyof",subsidId]
							], 
							[
							   new nlobjSearchColumn("name",null,null).setSort(false)
							]
							);
				}
			
			//Remove any existing selections
			//
			nlapiRemoveSelectOption('custpage_location_select', null);
			
			//Add a blank selection
			//
			nlapiInsertSelectOption('custpage_location_select', 0, '', true);
			
			//Add in the finish items into the select list
			//
			if(locationSearch)
				{
					for (var int = 0; int < locationSearch.length; int++) 
						{
							var locationId = locationSearch[int].getId();
							var locationName = locationSearch[int].getValue('name');
							
							nlapiInsertSelectOption('custpage_location_select', locationId, locationName, false);
				
						}
				}
		}
	
	if(name == 'custpage_location_select')
		{
			var locationId =  nlapiGetFieldValue(name);
			nlapiSetFieldValue('custpage_location', locationId, false, true);
			
		}

	if(name == 'custpage_account_select')
	{
		var locationId =  nlapiGetFieldValue(name);
		nlapiSetFieldValue('custpage_account', locationId, false, true);
		
	}



}	
