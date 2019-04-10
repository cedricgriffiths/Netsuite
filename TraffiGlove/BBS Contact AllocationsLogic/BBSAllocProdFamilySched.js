/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       04 May 2018     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{
	var context = nlapiGetContext();
	var productFamilyId = context.getSetting('SCRIPT', 'custscript_bbs_pf_id');
	var prodFamilyRecord = null;
	
	try
		{
			prodFamilyRecord = nlapiLoadRecord('customrecord_sw_family_allocation', productFamilyId);
		}
	catch(err)
		{
			prodFamilyRecord = null;
			nlapiLogExecution('ERROR', 'Error getting product family record', err.messgae);
		}
	
	if(prodFamilyRecord)
		{
			var pfCustomer = prodFamilyRecord.getFieldValue('custrecord_sw_family_customer');
			var pfName  = prodFamilyRecord.getFieldValue('name');
			var pfTop1 = prodFamilyRecord.getFieldValue('custrecord_sw_top_1');
			var pfTop2 = prodFamilyRecord.getFieldValue('custrecord_sw_top_2');
			var pfTop3 = prodFamilyRecord.getFieldValue('custrecord_sw_top_3');
			var pfTop4 = prodFamilyRecord.getFieldValue('custrecord_sw_top_4');
			var pfTop5 = prodFamilyRecord.getFieldValue('custrecord_sw_top_5');
			var pfBottom1 = prodFamilyRecord.getFieldValue('custrecord_sw_bottom_1');
			var pfBottom2 = prodFamilyRecord.getFieldValue('custrecord_sw_bottom_2');
			var pfBottom3 = prodFamilyRecord.getFieldValue('custrecord_sw_bottom_3');
			var pfMiddle1 = prodFamilyRecord.getFieldValue('custrecord_sw_middle_1');
			
			var contactSearch = nlapiSearchRecord("contact",null,
					[
					   ["company","anyof",pfCustomer], 
					   "AND", 
					   ["custentity_sw_no_of_days_worked","equalto",pfName]
					], 
					[
					   new nlobjSearchColumn("entityid")
					]
					);
			
			if(contactSearch != null && contactSearch.length > 0)
				{
					for (var int = 0; int < contactSearch.length; int++) 
						{
							checkResources();
							
							var contactId = contactSearch[int].getId();
							
							var contactRecord = null;
							
							try
								{
									contactRecord = nlapiLoadRecord('contact', contactId);
								}
							catch(err)
								{
									contactRecord = null;
									nlapiLogExecution('ERROR', 'Error getting contact record', err.messgae);
								}
							
							if(contactRecord)
								{
									contactRecord.setFieldValue('custentity_sw_top_1_available', pfTop1);
									contactRecord.setFieldValue('custentity_sw_top_2_available', pfTop2);
									contactRecord.setFieldValue('custentity_sw_top_3_available', pfTop3);
									contactRecord.setFieldValue('custentity_sw_top_4_available', pfTop4);
									contactRecord.setFieldValue('custentity_sw_top_5_available', pfTop5);
									
									contactRecord.setFieldValue('custentity_sw_bottom_1_available', pfBottom1);
									contactRecord.setFieldValue('custentity_sw_bottom_2_available', pfBottom2);
									contactRecord.setFieldValue('custentity_sw_bottom_3_available', pfBottom3);
									
									contactRecord.setFieldValue('custentity_sw_middle_1_available', pfMiddle1);
									
									nlapiSubmitRecord(contactRecord, false, true);
								}
						}
				}
		}
	
	var context = nlapiGetContext();
	var usersEmail = context.getUser();
	
	nlapiSendEmail(usersEmail, usersEmail, 'Product Family Allocation Update', 'Changes to the product family allocation record have been copied to the relevant contact records');
}

function checkResources()
{
	var remaining = parseInt(nlapiGetContext().getRemainingUsage());
	
	if(remaining < 100)
		{
			nlapiYieldScript();
		}
}
