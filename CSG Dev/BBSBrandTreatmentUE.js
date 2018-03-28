/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       28 Mar 2018     cedricgriffiths
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
function brandTreatmentBl(type, form, request)
{
	if(type =='create' || type =='edit')
		{
			var treatmentField = form.addField('custpage_treatment', 'multiselect', 'Treatments', null, null);
			
			if(type == 'edit')
				{
					var treatmentsSelected = nlapiGetFieldValues('custentity_bbs_treatment');
					
					var selectedBrand = nlapiGetFieldValues('custentity_bbs_brand');
					
					
					//nlapiRemoveSelectOption('custpage_treatment', null);
					
					var customrecord_bbs_treatment_areaSearch = nlapiSearchRecord("customrecord_bbs_treatment_area",null,
							[
							   ["custrecord_bbs_treatment_area_brand","anyof",selectedBrand]
							], 
							[
							   new nlobjSearchColumn("name").setSort(false)
							]
							);
					
					if(customrecord_bbs_treatment_areaSearch)
						{
							for (var int = 0; int < customrecord_bbs_treatment_areaSearch.length; int++) 
							{
								var treatmentId = customrecord_bbs_treatment_areaSearch[int].getId();
								var treatmentName = customrecord_bbs_treatment_areaSearch[int].getValue('name');
								
								if(treatmentsSelected.indexOf(treatmentId) > -1)
									{
										treatmentField.addSelectOption(treatmentId, treatmentName, true);
									}
								else
									{
										treatmentField.addSelectOption(treatmentId, treatmentName, false);
									}
								
							}
						}
				}
		}
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */
function brandTreatmentBS(type)
{
	var selectedTreatments = nlapiGetFieldValues('custpage_treatment');
	
	nlapiSetFieldValues('custentity_bbs_treatment', null, false, true);
	
	if(selectedTreatments)
		{
			nlapiSetFieldValues('custentity_bbs_treatment', selectedTreatments, false, true);
		}
}
