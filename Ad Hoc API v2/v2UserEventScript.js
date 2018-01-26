/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/runtime'],
/**
 * @param {record} record
 * @param {runtime} runtime
 */
function(record, runtime) {
   
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function v2beforeLoad(scriptContext) {
    	
    	if (scriptContext.type == scriptContext.UserEventType.VIEW) {
    		
    		var field = scriptContext.form.addField({
    			id: 'custpageinjectcode',
    			type: 'INLINEHTML',
    			label: 'Inject Code'
    		});
    		
    		
    		var text = "";


    		
    		field.defaultValue = "<script>" + text + "</script>"; 
        }
    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function v2beforeSubmit(scriptContext) {

    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function v2afterSubmit(scriptContext) {

    }

    return {
        beforeLoad: v2beforeLoad,
        beforeSubmit: v2beforeSubmit,
        afterSubmit: v2afterSubmit
    };
    
});
