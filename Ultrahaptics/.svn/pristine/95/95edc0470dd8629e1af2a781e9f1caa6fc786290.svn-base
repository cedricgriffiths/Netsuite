/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       12 May 2017     cedricgriffiths
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
function DraftBannerBeforeLoad(type, form, request)
{
	if (type =='edit' || type == 'view')
	{
		try
		{
			var draft = nlapiGetFieldValue('custbodyuh_cust_sostatus');
		

						if (draft == 'T')
							{
								var html = '<SCRIPT language="JavaScript" type="text/javascript">';
								html += "function bindEvent(element, type, handler) {if(element.addEventListener) {element.addEventListener(type, handler, false);} else {element.attachEvent('on'+type, handler);}} "; 
								html += 'bindEvent(window, "load", function(){'; 
								
								html += "require(['N/record', 'N/ui/message']," +
											"function(record, message) {" +
												"function myPageInit() {" +
													"var myMsg = message.create({title: '',message: 'This record is in DRAFT mode - no approval proccess will occur!',type: message.Type.WARNING});" +
													"myMsg.show();}" +
												"myPageInit();" +
											"});";
								html += '});'; 
								html += '</SCRIPT>';
								
								// push a dynamic field into the environment
								var field0 = form.addField('custpage_alertmode', 'inlinehtml', '',null,null); 
								field0.setDefaultValue(html);

						}
			}
		catch(err)
		{
		
		}
	}
}
