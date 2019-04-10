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
	var today = new Date();
	var todayString = nlapiDateToString(today);
	
	//Find any reset days records in the product family allocation records
	//
	var customrecord_sw_family_allocationSearch = nlapiSearchRecord("customrecord_sw_family_allocation",null,
			[
			   ["name","is",'Reset_Days'], 
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
			   new nlobjSearchColumn("custrecord_sw_middle_1"),
			   new nlobjSearchColumn("custrecord_sw_family_customer")
			]
			);
	
	//See if we have found any reset days records
	//
	if(customrecord_sw_family_allocationSearch != null && customrecord_sw_family_allocationSearch.length > 0)
		{
			checkResources();
		
			//Loop through the results
			//
			for (var int = 0; int < customrecord_sw_family_allocationSearch.length; int++) 
				{
					var top1Days = Number(customrecord_sw_family_allocationSearch[int].getValue("custrecord_sw_top_1"));
					var top2Days = Number(customrecord_sw_family_allocationSearch[int].getValue("custrecord_sw_top_2"));
					var top3Days = Number(customrecord_sw_family_allocationSearch[int].getValue("custrecord_sw_top_3"));
					var top4Days = Number(customrecord_sw_family_allocationSearch[int].getValue("custrecord_sw_top_4"));
					var top5Days = Number(customrecord_sw_family_allocationSearch[int].getValue("custrecord_sw_top_5"));
					var bottom1Days = Number(customrecord_sw_family_allocationSearch[int].getValue("custrecord_sw_bottom_1"));
					var bottom2Days = Number(customrecord_sw_family_allocationSearch[int].getValue("custrecord_sw_bottom_2"));
					var bottom3Days = Number(customrecord_sw_family_allocationSearch[int].getValue("custrecord_sw_bottom_3"));
					var middle1Days = Number(customrecord_sw_family_allocationSearch[int].getValue("custrecord_sw_middle_1"));
					var customer = customrecord_sw_family_allocationSearch[int].getValue("custrecord_sw_family_customer");
					
					//Now find any contacts that belong to the current customer that have any reset dates expired
					//
					var contactSearch = nlapiSearchRecord("contact",null,
							[
							   ["custentity_sw_no_of_days_worked","greaterthan","0"], 
							   "AND", 
							   ["company","anyof",customer], 
							   "AND", 
							   [
							    	["custentity_sw_top_1_reset_date","onorbefore",todayString],
							    	"OR",
							    	["custentity_sw_top_2_reset_date","onorbefore",todayString],
							    	"OR",
							    	["custentity_sw_top_3_reset_date","onorbefore",todayString],
							    	"OR",
							    	["custentity_sw_top_4_reset_date","onorbefore",todayString],
							    	"OR",
							    	["custentity_sw_top_5_reset_date","onorbefore",todayString],
							    	"OR",
							    	["custentity_sw_bottom_1_reset_date","onorbefore",todayString],
							    	"OR",
							    	["custentity_sw_bottom_2_reset_date","onorbefore",todayString],
							    	"OR",
							    	["custentity_sw_bottom_3_reset_date","onorbefore",todayString],
							    	"OR",
							    	["custentity_sw_middle_1_reset_date","onorbefore",todayString]
							    ]
							], 
							[
							   new nlobjSearchColumn("entityid")
							]
							);
					
					//Have we found any contacts
					//
					if(contactSearch != null && contactSearch.length > 0)
						{
							//Loop through the results
							//
							for (var int2 = 0; int2 < contactSearch.length; int2++) 
								{
									checkResources();
									
									//Get the contact id
									//
									var contactId = contactSearch[int2].getId();
									
									//Load the contact record
									//
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
											//Get the reset dates from the contact record
											//
											var contactTop1Reset = contactRecord.getFieldValue('custentity_sw_top_1_reset_date');
											var contactTop2Reset = contactRecord.getFieldValue('custentity_sw_top_2_reset_date');
											var contactTop3Reset = contactRecord.getFieldValue('custentity_sw_top_3_reset_date');
											var contactTop4Reset = contactRecord.getFieldValue('custentity_sw_top_4_reset_date');
											var contactTop5Reset = contactRecord.getFieldValue('custentity_sw_top_5_reset_date');
											var contactBottom1Reset = contactRecord.getFieldValue('custentity_sw_bottom_1_reset_date');
											var contactBottom2Reset = contactRecord.getFieldValue('custentity_sw_bottom_2_reset_date');
											var contactBottom3Reset = contactRecord.getFieldValue('custentity_sw_bottom_3_reset_date');
											var contactMiddle1Reset = contactRecord.getFieldValue('custentity_sw_middle_1_reset_date');
											
											//If any of the dates have expired, move the reset date to the used since date & then recalculate the reset date
											//
											if(contactTop1Reset != null && contactTop1Reset != '' && nlapiStringToDate(contactTop1Reset) <= today)
												{
													var newResetDate = (top1Days > 0 ? nlapiAddDays(nlapiStringToDate(contactTop1Reset), top1Days) : null);
													
													contactRecord.setFieldValue('custentity_sw_top_1_used_since', contactTop1Reset);
													contactRecord.setFieldValue('custentity_sw_top_1_reset_date', newResetDate);
												}
											
											if(contactTop2Reset != null && contactTop2Reset != '' && nlapiStringToDate(contactTop2Reset) <= today)
												{
													var newResetDate = (top2Days > 0 ? nlapiAddDays(nlapiStringToDate(contactTop2Reset), top2Days) : null);
													
													contactRecord.setFieldValue('custentity_sw_top_2_used_since', contactTop2Reset);
													contactRecord.setFieldValue('custentity_sw_top_2_reset_date', newResetDate);
												}
										
											if(contactTop3Reset != null && contactTop3Reset != '' && nlapiStringToDate(contactTop3Reset) <= today)
											{
												var newResetDate = (top3Days > 0 ? nlapiAddDays(nlapiStringToDate(contactTop3Reset), top3Days) : null);
												
												contactRecord.setFieldValue('custentity_sw_top_3_used_since', contactTop3Reset);
												contactRecord.setFieldValue('custentity_sw_top_3_reset_date', newResetDate);
											}
										
											if(contactTop4Reset != null && contactTop4Reset != '' && nlapiStringToDate(contactTop4Reset) <= today)
											{
												var newResetDate = (top4Days > 0 ? nlapiAddDays(nlapiStringToDate(contactTop4Reset), top4Days) : null);
												
												contactRecord.setFieldValue('custentity_sw_top_4_used_since', contactTop4Reset);
												contactRecord.setFieldValue('custentity_sw_top_4_reset_date', newResetDate);
											}
										
											if(contactTop5Reset != null && contactTop5Reset != '' && nlapiStringToDate(contactTop5Reset) <= today)
											{
												var newResetDate = (top5Days > 0 ? nlapiAddDays(nlapiStringToDate(contactTop5Reset), top5Days) : null);
												
												contactRecord.setFieldValue('custentity_sw_top_5_used_since', contactTop5Reset);
												contactRecord.setFieldValue('custentity_sw_top_5_reset_date', newResetDate);
											}
										
											if(contactBottom1Reset != null && contactBottom1Reset != '' && nlapiStringToDate(contactBottom1Reset) <= today)
											{
												var newResetDate = (Bottom1Days > 0 ? nlapiAddDays(nlapiStringToDate(contactBottom1Reset), Bottom1Days) : null);
												
												contactRecord.setFieldValue('custentity_sw_bottom_1_used_since', contactBottom1Reset);
												contactRecord.setFieldValue('custentity_sw_bottom_1_reset_date', newResetDate);
											}
										
											if(contactBottom2Reset != null && contactBottom2Reset != '' && nlapiStringToDate(contactBottom2Reset) <= today)
											{
												var newResetDate = (Bottom2Days > 0 ? nlapiAddDays(nlapiStringToDate(contactBottom2Reset), Bottom2Days) : null);
												
												contactRecord.setFieldValue('custentity_sw_bottom_2_used_since', contactBottom2Reset);
												contactRecord.setFieldValue('custentity_sw_bottom_2_reset_date', newResetDate);
											}
										
											if(contactBottom3Reset != null && contactBottom3Reset != '' && nlapiStringToDate(contactBottom3Reset) <= today)
											{
												var newResetDate = (Bottom3Days > 0 ? nlapiAddDays(nlapiStringToDate(contactBottom3Reset), Bottom3Days) : null);
												
												contactRecord.setFieldValue('custentity_sw_bottom_3_used_since', contactBottom3Reset);
												contactRecord.setFieldValue('custentity_sw_bottom_3_reset_date', newResetDate);
											}
										
											if(contactMiddle1Reset != null && contactMiddle1Reset != '' && nlapiStringToDate(contactMiddle1Reset) <= today)
											{
												var newResetDate = (Middle1Days > 0 ? nlapiAddDays(nlapiStringToDate(contactMiddle1Reset), Middle1Days) : null);
												
												contactRecord.setFieldValue('custentity_sw_middle_1_used_since', contactMiddle1Reset);
												contactRecord.setFieldValue('custentity_sw_middle_1_reset_date', newResetDate);
											}
										
											//Submit the contact record
											//
											nlapiSubmitRecord(contactRecord, false, true);
										}
								}
						}
				}
		}
}

function checkResources()
{
	var remaining = parseInt(nlapiGetContext().getRemainingUsage());
	
	if(remaining < 200)
		{
			nlapiYieldScript();
		}
}
