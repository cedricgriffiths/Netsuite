/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       04 May 2018     cedricgriffiths
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
function salesOrderAllocARS(type)
{
	//Only works on create of a sales order
	//
	if(type == 'create')
		{
			//Get initial data from sales order
			//
			var customerRecord = null;
			var salesRecord = nlapiGetNewRecord();
			var customer = salesRecord.getFieldValue('entity');
			var salesDate = nlapiStringToDate(salesRecord.getFieldValue('trandate'));
			
			//Get the customer record
			//
			try
				{
					customerRecord = nlapiLoadRecord('customer', customer);
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
							//Get the PFA record for reset_days
							//
							var customrecord_sw_family_allocationSearch = nlapiSearchRecord("customrecord_sw_family_allocation",null,
								[
								   ["name","is",'Reset_Days'], 
								   "AND", 
								   ["custrecord_sw_family_customer","anyof",customer]
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
									var top1ResetDate = (top1Days > 0 ? nlapiAddDays(salesDate, top1Days) : null);
									var top2ResetDate = (top2Days > 0 ? nlapiAddDays(salesDate, top2Days) : null);
									var top3ResetDate = (top3Days > 0 ? nlapiAddDays(salesDate, top3Days) : null);
									var top4ResetDate = (top4Days > 0 ? nlapiAddDays(salesDate, top4Days) : null);
									var top5ResetDate = (top5Days > 0 ? nlapiAddDays(salesDate, top5Days) : null);
									var bottom1ResetDate = (bottom1Days > 0 ? nlapiAddDays(salesDate, bottom1Days) : null);
									var bottom2ResetDate = (bottom2Days > 0 ? nlapiAddDays(salesDate, bottom2Days) : null);
									var bottom3ResetDate = (bottom3Days > 0 ? nlapiAddDays(salesDate, bottom3Days) : null);
									var middle1ResetDate = (middle1Days > 0 ? nlapiAddDays(salesDate, middle1Days) : null);
									
									//Look for manpack lines on the sales order
									//
									var lines = salesRecord.getLineItemCount('item');
									var manpackContacts = {};
									
									for (var int = 1; int <= lines; int++) 
										{
											var manpackName = salesRecord.getLineItemValue('item', 'custcol_bbs_sales_line_contact', int);
											
											//Collect the id's of the manpack contacts
											//
											if(manpackName != null && manpackName != '')
												{
													manpackContacts[manpackName] = manpackName;
												}
										}
									
									//Convert the manpack object to an array
									//
									manpackArray = [];
									
									for (var manpackContact in manpackContacts) 
										{
											manpackArray.push(manpackContact);
										}
									
									//Search for the contacts that are in the manpack list that also do not have a first order date
									//
									var contactSearch = nlapiSearchRecord("contact",null,
											//[
											//   ["internalid","anyof",manpackArray], 
											//   "AND", 
											//   ["custentity_sw_first_order_date","isempty",""]
											//]
											[
											   ["internalid","anyof",manpackArray], 
											   "AND", 
											   [["custentity_sw_first_order_date","isempty",""],"OR",["custentity_sw_pseudo_first_order_date","is","T"]]
											], 
											[
											   new nlobjSearchColumn("entityid")
											]
											);
									
									//Process the contacts search results
									//
									if(contactSearch != null && contactSearch.length > 0)
										{
											for (var int2 = 0; int2 < contactSearch.length; int2++) 
												{
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
															nlapiLogExecution('ERROR', 'Error loading contact record', err.message);
														}
														
													//We have got the contact record
													//
													if(contactRecord)
														{
															//Convert the sales order date to a string
															//
															var salesDateString = nlapiDateToString(salesDate);
															
															//Update the allocation fields
															//
															contactRecord.setFieldValue('custentity_sw_first_order_date', salesDateString);
															contactRecord.setFieldValue('custentity_sw_pseudo_first_order_date','F');
															
															contactRecord.setFieldValue('custentity_sw_top_1_used_since', salesDateString);
															contactRecord.setFieldValue('custentity_sw_top_2_used_since', salesDateString);
															contactRecord.setFieldValue('custentity_sw_top_3_used_since', salesDateString);
															contactRecord.setFieldValue('custentity_sw_top_4_used_since', salesDateString);
															contactRecord.setFieldValue('custentity_sw_top_5_used_since', salesDateString);
															contactRecord.setFieldValue('custentity_sw_bottom_1_used_since', salesDateString);
															contactRecord.setFieldValue('custentity_sw_bottom_2_used_since', salesDateString);
															contactRecord.setFieldValue('custentity_sw_bottom_3_used_since', salesDateString);
															contactRecord.setFieldValue('custentity_sw_middle_1_used_since', salesDateString);
															
															contactRecord.setFieldValue('custentity_sw_top_1_reset_date', (top1ResetDate == null ? top1ResetDate : nlapiDateToString(top1ResetDate)));							
															contactRecord.setFieldValue('custentity_sw_top_2_reset_date', (top2ResetDate == null ? top2ResetDate : nlapiDateToString(top2ResetDate)));
															contactRecord.setFieldValue('custentity_sw_top_3_reset_date', (top3ResetDate == null ? top3ResetDate : nlapiDateToString(top3ResetDate)));
															contactRecord.setFieldValue('custentity_sw_top_4_reset_date', (top4ResetDate == null ? top4ResetDate : nlapiDateToString(top4ResetDate)));
															contactRecord.setFieldValue('custentity_sw_top_5_reset_date', (top5ResetDate == null ? top5ResetDate : nlapiDateToString(top5ResetDate)));
															contactRecord.setFieldValue('custentity_sw_bottom_1_reset_date', (bottom1ResetDate == null ? bottom1ResetDate : nlapiDateToString(bottom1ResetDate)));
															contactRecord.setFieldValue('custentity_sw_bottom_2_reset_date', (bottom2ResetDate == null ? bottom2ResetDate : nlapiDateToString(bottom2ResetDate)));
															contactRecord.setFieldValue('custentity_sw_bottom_3_reset_date', (bottom3ResetDate == null ? bottom2ResetDate : nlapiDateToString(bottom3ResetDate)));
															contactRecord.setFieldValue('custentity_sw_middle_1_reset_date', (middle1ResetDate == null ? middle1ResetDate : nlapiDateToString(middle1ResetDate)));
															
															//Submit the contact record
															//
															nlapiSubmitRecord(contactRecord, false, true);
														}
												}
										}
								}
						}
				}
		}
}
