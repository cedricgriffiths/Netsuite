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
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function brandTreatmentFC(type, name, linenum)
{
	if(name == 'custentity_bbs_brand')
		{
			var selectedBrand = nlapiGetFieldValues(name);
			
			nlapiRemoveSelectOption('custpage_treatment', null);
			
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
						
						nlapiInsertSelectOption('custpage_treatment', treatmentId, treatmentName, false);
					}
				}
		}
}
