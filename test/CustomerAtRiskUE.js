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
function userEventBeforeLoad(type, form, request){
 
	if (type == 'create' || type == 'view')
		{
			//var recId = nlapiGetRecordId();
			
			var atRisk = nlapiGetFieldValue('custentity_bbs_customer_at_risk');
			var noSupport = nlapiGetFieldValue('custentity_bbs_customer_support_ended');
			
			var atRiskMsg = nlapiGetFieldValue('custentity_bbs_customer_at_risk_msg');
			var noSupportMsg = nlapiGetFieldValue('custentity_bbs_customer_no_support_msg');
			
			var atRiskMessage = 'Customer Is At Risk! ' + ((atRiskMsg == null) ? '' : atRiskMsg);
			var noSupportMessage = 'Customer Support Contract Has Ended! ' + ((noSupportMsg == null) ? '' : noSupportMsg);
			
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
					html += '</SCRIPT>'
					
					// push a dynamic field into the environment
					var field0 = form.addField('custpage_alertmode', 'inlinehtml', '',null,null); 
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
				var field0 = form.addField('custpage_alertmode2', 'inlinehtml', '',null,null); 
				field0.setDefaultValue(html);
			}
		}
}
