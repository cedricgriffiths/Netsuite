/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       19 Dec 2017     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function primaryProductChangedARS(type)
{
	var customerRecord = nlapiGetNewRecord();
	var customerId = customerRecord.getId();
	var customerPP = customerRecord.getFieldValue('custentity_bbs_cust_primaryproduct');
	
	if(type == 'edit')
		{
			var supportcaseSearch = nlapiSearchRecord("supportcase",null,
					[
					   ["status","noneof","5"], 
					   "AND", 
					   ["stage","anyof","OPEN"], 
					   "AND", 
					   ["helpdesk","is","F"], 
					   "AND", 
					   ["company.internalid","anyof",customerId]
					], 
					[
					   new nlobjSearchColumn("casenumber",null,null)
					]
					);
		
			if(supportcaseSearch)
				{
					for (var int = 0; int < supportcaseSearch.length; int++) 
						{
							var caseId = supportcaseSearch[int].getId();
							
							if(caseId)
								{
									var caseRecord = nlapiLoadRecord('supportcase', caseId);
									
									if(caseRecord)
										{
											caseRecord.setFieldValue('custevent_bbs_case_primaryproduct', customerPP);
											nlapiSubmitRecord(caseRecord, false, true);
										}
								}
						}
				}
		}
}
