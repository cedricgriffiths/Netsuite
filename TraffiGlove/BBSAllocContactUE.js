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
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function daysWorkedARS(type)
{
	var updateRequired = false;
	var newRecord = nlapiGetNewRecord();
	var newDaysWorked = newRecord.getFieldValue('custentity_sw_no_of_days_worked');
	var newRecordId = newRecord.getId();
	var today = new Date();
	
	newDaysWorked = (newDaysWorked == null ? '' : newDaysWorked);
	
	if(type == 'create' || type == 'edit')
		{
			if(type == 'create')
				{
					updateRequired = true;
				}
			
			if(type == 'edit')
				{
					var oldRecord = nlapiGetOldRecord();
					var oldDaysWorked = oldRecord.getFieldValue('custentity_sw_no_of_days_worked');
					
					oldDaysWorked = (oldDaysWorked == null ? '' : oldDaysWorked);
					
					if(oldDaysWorked != newDaysWorked)
						{
							updateRequired = true;
						}
				}
		
			if(updateRequired)
				{
					var contactRecord = nlapiLoadRecord('contact', newRecordId);
					
					var daysWorked = contactRecord.getFieldValue('custentity_sw_no_of_days_worked');
					var company = contactRecord.getFieldValue('company');
					var customerRecord = null;
					
					//Get the customer record
					//
					try
						{
							customerRecord = nlapiLoadRecord('customer', company);
						}
					catch(err)
						{
							customerRecord = null;
							nlapiLogExecution('ERROR', 'Error loading customer record', err.message);
						}
					
					//We have got the customer record
					//
					if(customerRecord)
						{
							//Is the customer using allocations
							//
							var custUseAlloc = customerRecord.getFieldValue('custentity_bbs_use_budget');
							
							if(custUseAlloc == 'T')
								{
									//Search for the allocation record based on days worked & the contact's company
									//
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
									
									//Process the allocation record & update the fields on the contact record
									//
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
											
											contactRecord.setFieldValue('custentity_sw_top_1_available', top1);
											contactRecord.setFieldValue('custentity_sw_top_2_available', top2);
											contactRecord.setFieldValue('custentity_sw_top_3_available', top3);
											contactRecord.setFieldValue('custentity_sw_top_4_available', top4);
											contactRecord.setFieldValue('custentity_sw_top_5_available', top5);
											
											contactRecord.setFieldValue('custentity_sw_bottom_1_available', bottom1);
											contactRecord.setFieldValue('custentity_sw_bottom_2_available', bottom2);
											contactRecord.setFieldValue('custentity_sw_bottom_3_available', bottom3);
											
											contactRecord.setFieldValue('custentity_sw_middle_1_available', middle1);
										}
									
									if(type == 'create')
										{
											//Get the PFA record for reset_days
											//
											var customrecord_sw_family_allocationSearch = nlapiSearchRecord("customrecord_sw_family_allocation",null,
												[
												   ["name","is",'Reset_Days'], 
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
										
											//Get the no of days from the pfa record
											//
											if(customrecord_sw_family_allocationSearch != null && customrecord_sw_family_allocationSearch.length == 1)
												{
													var top1Days = Number(customrecord_sw_family_allocationSearch[0].getValue("custrecord_sw_top_1"));
													var top2Days = Number(customrecord_sw_family_allocationSearch[0].getValue("custrecord_sw_top_2"));
													var top3Days = Number(customrecord_sw_family_allocationSearch[0].getValue("custrecord_sw_top_3"));
													var top4Days = Number(customrecord_sw_family_allocationSearch[0].getValue("custrecord_sw_top_4"));
													var top5Days = Number(customrecord_sw_family_allocationSearch[0].getValue("custrecord_sw_top_5"));
													var bottom1Days = Number(customrecord_sw_family_allocationSearch[0].getValue("custrecord_sw_bottom_1"));
													var bottom2Days = Number(customrecord_sw_family_allocationSearch[0].getValue("custrecord_sw_bottom_2"));
													var bottom3Days = Number(customrecord_sw_family_allocationSearch[0].getValue("custrecord_sw_bottom_3"));
													var middle1Days = Number(customrecord_sw_family_allocationSearch[0].getValue("custrecord_sw_middle_1"));
													
													//Calculate the reset dates
													//
													var top1ResetDate = (top1Days > 0 ? nlapiAddDays(today, top1Days) : null);
													var top2ResetDate = (top2Days > 0 ? nlapiAddDays(today, top2Days) : null);
													var top3ResetDate = (top3Days > 0 ? nlapiAddDays(today, top3Days) : null);
													var top4ResetDate = (top4Days > 0 ? nlapiAddDays(today, top4Days) : null);
													var top5ResetDate = (top5Days > 0 ? nlapiAddDays(today, top5Days) : null);
													var bottom1ResetDate = (bottom1Days > 0 ? nlapiAddDays(today, bottom1Days) : null);
													var bottom2ResetDate = (bottom2Days > 0 ? nlapiAddDays(today, bottom2Days) : null);
													var bottom3ResetDate = (bottom3Days > 0 ? nlapiAddDays(today, bottom3Days) : null);
													var middle1ResetDate = (middle1Days > 0 ? nlapiAddDays(today, middle1Days) : null);
													
													//Update the allocation fields
													//
													var todayDateString = nlapiDateToString(today);
													
													contactRecord.setFieldValue('custentity_sw_first_order_date', todayDateString);
													contactRecord.setFieldValue('custentity_sw_pseudo_first_order_date','T');
													
													contactRecord.setFieldValue('custentity_sw_top_1_used_since', todayDateString);
													contactRecord.setFieldValue('custentity_sw_top_2_used_since', todayDateString);
													contactRecord.setFieldValue('custentity_sw_top_3_used_since', todayDateString);
													contactRecord.setFieldValue('custentity_sw_top_4_used_since', todayDateString);
													contactRecord.setFieldValue('custentity_sw_top_5_used_since', todayDateString);
													contactRecord.setFieldValue('custentity_sw_bottom_1_used_since', todayDateString);
													contactRecord.setFieldValue('custentity_sw_bottom_2_used_since', todayDateString);
													contactRecord.setFieldValue('custentity_sw_bottom_3_used_since', todayDateString);
													contactRecord.setFieldValue('custentity_sw_middle_1_used_since', todayDateString);
													
													contactRecord.setFieldValue('custentity_sw_top_1_reset_date', (top1ResetDate == null ? top1ResetDate : nlapiDateToString(top1ResetDate)));							
													contactRecord.setFieldValue('custentity_sw_top_2_reset_date', (top2ResetDate == null ? top2ResetDate : nlapiDateToString(top2ResetDate)));
													contactRecord.setFieldValue('custentity_sw_top_3_reset_date', (top3ResetDate == null ? top3ResetDate : nlapiDateToString(top3ResetDate)));
													contactRecord.setFieldValue('custentity_sw_top_4_reset_date', (top4ResetDate == null ? top4ResetDate : nlapiDateToString(top4ResetDate)));
													contactRecord.setFieldValue('custentity_sw_top_5_reset_date', (top5ResetDate == null ? top5ResetDate : nlapiDateToString(top5ResetDate)));
													contactRecord.setFieldValue('custentity_sw_bottom_1_reset_date', (bottom1ResetDate == null ? bottom1ResetDate : nlapiDateToString(bottom1ResetDate)));
													contactRecord.setFieldValue('custentity_sw_bottom_2_reset_date', (bottom2ResetDate == null ? bottom2ResetDate : nlapiDateToString(bottom2ResetDate)));
													contactRecord.setFieldValue('custentity_sw_bottom_3_reset_date', (bottom3ResetDate == null ? bottom2ResetDate : nlapiDateToString(bottom3ResetDate)));
													contactRecord.setFieldValue('custentity_sw_middle_1_reset_date', (middle1ResetDate == null ? middle1ResetDate : nlapiDateToString(middle1ResetDate)));
												}	
										}
									
									//Finally save the contact record
									//
									nlapiSubmitRecord(contactRecord, false, true);
								}
						}
				}
		}
}
