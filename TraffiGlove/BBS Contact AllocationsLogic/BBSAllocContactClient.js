/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       03 May 2018     cedricgriffiths
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
function daysWorkedFieldChanged(type, name, linenum)
{
	if(name == 'custentity_sw_no_of_days_worked')
		{
			var daysWorked = nlapiGetFieldValue('custentity_sw_no_of_days_worked');
			var company = nlapiGetFieldValue('company');
			
			if(daysWorked != null && daysWorked != '')
				{
					var customrecord_sw_family_allocationSearch = nlapiSearchRecord("customrecord_sw_family_allocation",null,
							[
							   ["name","is",daysWorked], 
							   "AND", 
							   ["custrecord_sw_family_customer","anyof",company]
							], 
							[
							   new nlobjSearchColumn("name"), 
							   new nlobjSearchColumn("custrecord_sw_top_1"), 
							   new nlobjSearchColumn("custrecord_sw_top_2"), 
							   new nlobjSearchColumn("custrecord_sw_top_3"), 
							   new nlobjSearchColumn("custrecord_sw_top_4"), 
							   new nlobjSearchColumn("custrecord_sw_top_5"), 
							   new nlobjSearchColumn("custrecord_sw_bottom_1"), 
							   new nlobjSearchColumn("custrecord_sw_bottom_2"), 
							   new nlobjSearchColumn("custrecord_sw_bottom_3"), 
							   new nlobjSearchColumn("custrecord_sw_middle_1")
							]
							);
					
					if(customrecord_sw_family_allocationSearch && customrecord_sw_family_allocationSearch.length == 1)
						{
							var top1 = customrecord_sw_family_allocationSearch[0].getValue("custrecord_sw_top_1");
							var top2 = customrecord_sw_family_allocationSearch[0].getValue("custrecord_sw_top_2");
							var top3 = customrecord_sw_family_allocationSearch[0].getValue("custrecord_sw_top_3");
							var top4 = customrecord_sw_family_allocationSearch[0].getValue("custrecord_sw_top_4");
							var top5 = customrecord_sw_family_allocationSearch[0].getValue("custrecord_sw_top_5");
							var bottom1 = customrecord_sw_family_allocationSearch[0].getValue("custrecord_sw_bottom_1");
							var bottom2 = customrecord_sw_family_allocationSearch[0].getValue("custrecord_sw_bottom_2");
							var bottom3 = customrecord_sw_family_allocationSearch[0].getValue("custrecord_sw_bottom_3");
							var middle1 = customrecord_sw_family_allocationSearch[0].getValue("custrecord_sw_middle_1");
							
							nlapiSetFieldValue('custentity_sw_top_1_available', top1, false, true);
							nlapiSetFieldValue('custentity_sw_top_2_available', top2, false, true);
							nlapiSetFieldValue('custentity_sw_top_3_available', top3, false, true);
							nlapiSetFieldValue('custentity_sw_top_4_available', top4, false, true);
							nlapiSetFieldValue('custentity_sw_top_5_available', top5, false, true);
							
							nlapiSetFieldValue('custentity_sw_bottom_1_available', bottom1, false, true);
							nlapiSetFieldValue('custentity_sw_bottom_2_available', bottom2, false, true);
							nlapiSetFieldValue('custentity_sw_bottom_3_available', bottom3, false, true);
							
							nlapiSetFieldValue('custentity_sw_middle_1_available', middle1, false, true);
						}
				}
		}
}