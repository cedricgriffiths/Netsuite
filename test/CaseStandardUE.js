/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       24 Mar 2017     cedricgriffiths
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
function userEventBeforeLoad(type, form, request)
{
	if (type =='edit' || type == 'view')
		{
			//Get the case record
			//
			var recId = nlapiGetRecordId();
			var caseRecord = nlapiLoadRecord('supportcase', recId);
			
			var helpdesk = caseRecord.getFieldValue('helpdesk');
			
			//we only want this to work with standard case records
			//
			if (helpdesk != 'T')
				{
					//Get the customer (note, the customer might be an employee...)
					//
					var custId = caseRecord.getFieldValue('company');
					
					try
						{
							var custRecord = nlapiLoadRecord('customer', custId);
							
							var atRisk = custRecord.getFieldValue('custentity_bbs_customer_at_risk');
							var noSupport = custRecord.getFieldValue('custentity_bbs_customer_support_ended');
							var prePaid = custRecord.getFieldValue('custentity_bbs_support_hours');
							var noBespoke = custRecord.getFieldValue('custentity_bbs_no_bespoke');
							
							var atRiskMsg = custRecord.getFieldValue('custentity_bbs_customer_at_risk_msg');
							var noSupportMsg = custRecord.getFieldValue('custentity_bbs_customer_no_support_msg');
							
							var atRiskMessage = 'Customer Is At Risk! ' + ((atRiskMsg == null) ? '' : atRiskMsg);
							var noSupportMessage = 'Customer Support Contract Has Ended! ' + ((noSupportMsg == null) ? '' : noSupportMsg);
							var prePaidMessage = 'Customer Has Pre-Paid Hours Support - Please Account For Time Spent On Your Timesheet';
							var noBespokeMessage = 'Customer Does Not Have Support For Bespoke - Please Verify Subject Of Support Case';
							
							
							if (noBespoke == 'T')
							{
								var html = '<SCRIPT language="JavaScript" type="text/javascript">';
								html += "function bindEvent(element, type, handler) {if(element.addEventListener) {element.addEventListener(type, handler, false);} else {element.attachEvent('on'+type, handler);}} "; 
								html += 'bindEvent(window, "load", function(){'; 
								
								html += "require(['N/record', 'N/ui/message']," +
											"function(record, message) {" +
												"function myPageInit() {" +
													"var myMsg = message.create({title: '',message: '" + noBespokeMessage + "',type: message.Type.WARNING});" +
													"myMsg.show();}" +
												"myPageInit();" +
											"});";
								html += '});'; 
								html += '</SCRIPT>';
								
								// push a dynamic field into the environment
								var field0 = form.addField('custpage_alertmode_0', 'inlinehtml', '',null,null); 
								field0.setDefaultValue(html);
							}
						
							if (prePaid == 'T')
							{
								var html = '<SCRIPT language="JavaScript" type="text/javascript">';
								html += "function bindEvent(element, type, handler) {if(element.addEventListener) {element.addEventListener(type, handler, false);} else {element.attachEvent('on'+type, handler);}} "; 
								html += 'bindEvent(window, "load", function(){'; 
								
								html += "require(['N/record', 'N/ui/message']," +
											"function(record, message) {" +
												"function myPageInit() {" +
													"var myMsg = message.create({title: '',message: '" + prePaidMessage + "',type: message.Type.WARNING});" +
													"myMsg.show();}" +
												"myPageInit();" +
											"});";
								html += '});'; 
								html += '</SCRIPT>';
								
								// push a dynamic field into the environment
								var field0 = form.addField('custpage_alertmod_1', 'inlinehtml', '',null,null); 
								field0.setDefaultValue(html);
							}
						
							
							if (atRisk == 'T')
								{
									var html = '<SCRIPT language="JavaScript" type="text/javascript">';
									html += "function bindEvent(element, type, handler) {if(element.addEventListener) {element.addEventListener(type, handler, false);} else {element.attachEvent('on'+type, handler);}} "; 
									html += 'bindEvent(window, "load", function(){'; 
									
									html += "require(['N/record', 'N/ui/message']," +
												"function(record, message) {" +
													"function myPageInit() {" +
														"var myMsg = message.create({title: '',message: '" + atRiskMessage + "',type: message.Type.WARNING});" +
														"myMsg.show();}" +
													"myPageInit();" +
												"});";
									html += '});'; 
									html += '</SCRIPT>';
									
									// push a dynamic field into the environment
									var field0 = form.addField('custpage_alertmod_2', 'inlinehtml', '',null,null); 
									field0.setDefaultValue(html);
								}
							
							if (noSupport == 'T')
							{
								var html = '<SCRIPT language="JavaScript" type="text/javascript">';
								html += "function bindEvent(element, type, handler) {if(element.addEventListener) {element.addEventListener(type, handler, false);} else {element.attachEvent('on'+type, handler);}} "; 
								html += 'bindEvent(window, "load", function(){'; 
								
								html += "require(['N/record', 'N/ui/message']," +
											"function(record, message) {" +
												"function myPageInit() {" +
													"var myMsg = message.create({title: '',message: '" + noSupportMessage + "',type: message.Type.ERROR});" +
													"myMsg.show();}" +
												"myPageInit();" +
											"});";
								html += '});'; 
								html += '</SCRIPT>';
								
								// push a dynamic field into the environment
								var field0 = form.addField('custpage_alertmode_3', 'inlinehtml', '',null,null); 
								field0.setDefaultValue(html);
							}
						}
					catch(err)
						{
						
						}
				}
		}
}
