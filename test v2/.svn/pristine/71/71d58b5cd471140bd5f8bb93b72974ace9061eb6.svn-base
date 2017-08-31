/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/ui/message'],
/**
 * @param {record} record
 * @param {message} message
 */
function(record, message) {


    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
    function fieldChanged(scriptContext) 
    {
    	var field = scriptContext.fieldId;
    	var currentRec = scriptContext.currentRecord;
    	
    	if (field == 'company')
    		{
    			var helpdesk = currentRec.getValue({fieldId: 'helpdesk'});
    			
    			if (!helpdesk)
    				{
    					var customerId = currentRec.getValue({fieldId: 'company'});
    				
    					if (customerId != null && customerId != '')
    						{
    							var custRecord = record.load({type: record.Type.CUSTOMER, id: customerId });
    							
    							var atRisk = custRecord.getValue({fieldId: 'custentity_bbs_customer_at_risk'});
    							var noSupport = custRecord.getValue({fieldId: 'custentity_bbs_customer_support_ended'});
    							
    							var atRiskMsg = custRecord.getValue({fieldId: 'custentity_bbs_customer_at_risk_msg'});
    							var noSupportMsg = custRecord.getValue({fieldId: 'custentity_bbs_customer_no_support_msg'});
    							
    							var atRiskMessage = 'Customer Is At Risk! ' + ((atRiskMsg == null) ? '' : atRiskMsg);
    							var noSupportMessage = 'Customer Support Contract Has Ended! ' + ((noSupportMsg == null) ? '' : noSupportMsg);
    							
    							
    							if (atRisk)
    								{
    									var myMsg = message.create({title: '',message: atRiskMessage,type: message.Type.WARNING});
										myMsg.show();
    								}
    							
    							if (noSupport)
								{
									var myMsg = message.create({title: '',message: noSupportMessage,type: message.Type.ERROR});
									myMsg.show();
								}
    						}
    				}
    		}
    }
    return {
        fieldChanged: fieldChanged
    };
});
