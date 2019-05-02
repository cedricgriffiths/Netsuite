/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       01 May 2019     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function soLocationBeforeLoad(type, form, request)
{
	//Get the subsidiary
	//
	var subsidiaryId = nlapiGetFieldValue('subsidiary');
	
	//Get the form id
	//
	var formId = nlapiGetFieldValue('customform');
	
	//Is it Accora Ireland
	//
	if(subsidiaryId == '7' && formId == '150')
		{
			var locationsToUse = {};
			
			//Read the available locations for the subsidiary
			//
			var locationSearch = nlapiSearchRecord("location",null,
					[
					   ["subsidiary","anyof",subsidiaryId]
					], 
					[
					   new nlobjSearchColumn("name").setSort(false)
					]
					);
			
			if(locationSearch != null && locationSearch.length > 0)
				{
					for (var int = 0; int < locationSearch.length; int++) 
						{
							var locationId = locationSearch[int].getId();
							var locationName = locationSearch[int].getValue('name');
							
							locationsToUse[locationId] = locationName;
						}
				}
			
			//Now read the global inventory relationship record for the subsidiary
			//
			var globalinventoryrelationshipSearch = nlapiSearchRecord("globalinventoryrelationship",null,
					[
					   ["originatingsubsidiary","anyof",subsidiaryId]
					], 
					[
					   new nlobjSearchColumn("subsidiary").setSort(false), 
					   new nlobjSearchColumn("inventorysubsidiary"), 
					   new nlobjSearchColumn("location")
					]
					);
			
			if(globalinventoryrelationshipSearch != null && globalinventoryrelationshipSearch.length > 0)
				{
					for (var int = 0; int < globalinventoryrelationshipSearch.length; int++) 
						{
							var locationId = globalinventoryrelationshipSearch[int].getValue('location');
							var locationName = globalinventoryrelationshipSearch[int].getText('location');
							
							locationsToUse[locationId] = locationName;
						}
				}
			
			//Get the saved fulfil location (if any)
			//
			var savedFulfilLocation = nlapiGetFieldValue('custbody3');
			
			//Add a new field group to the form
			//
			form.addFieldGroup('custpage_bbs_group', 'Cross Subsidiary Location', 'main');
			
			//Add a new location field to the field group
			//
			var subsidLocationField = form.addField('custpage_subsid_location', 'select', 'Cross Subsidiary Location', null, 'custpage_bbs_group');
			subsidLocationField.setMandatory(true);
			
			//Add a blank select option to the field
			//
			subsidLocationField.addSelectOption('0', '', true);
			
			//Now add all the remaining options to the field
			//
			for ( var location in locationsToUse) 
				{
					subsidLocationField.addSelectOption(location, locationsToUse[location], (locationsToUse[location] == savedFulfilLocation ? true : false));
				}
			
			//subsidLocationField.addSelectOption('129', 'Frank - Demo Stock', false);
			//subsidLocationField.addSelectOption('130', 'Des - Demo Stock', false);
			//subsidLocationField.addSelectOption('128', 'IE HQ', false);
			//subsidLocationField.addSelectOption('14', 'Europa', false);
			//subsidLocationField.addSelectOption('7', 'Orwell', false);
		}
}
