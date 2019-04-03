/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget','N/record'],
/**
 * @param {serverWidget} serverWidget
 */
function(serverWidget, record) {
   
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(scriptContext) {

    	debugger;
    	
    	//Get the current record
    	//
    	var currentRec = scriptContext.newRecord;
	    
    	//Get the ship status
    	//
      	var shipStatus = currentRec.getValue({fieldId: 'shipstatus'});
      	
      	//Get the subsidiary
      	//
      	var subsidiary = currentRec.getValue({fieldId: 'subsidiary'});
      	
      	if(shipStatus != null && shipStatus != '' && shipStatus == 'A' && subsidiary == '5')
      		{
		    	var hideFld = scriptContext.form.addField({
		    		id:'custpage_hide_buttons',
		    		label:'not shown - hidden',
		    		type: serverWidget.FieldType.INLINEHTML
		    	});
		    	
		    	var scr = "";
		    	scr += 'jQuery("#markpacked").hide();';
		    	scr += 'jQuery("#tdbody_markpacked").hide();';
		    	scr += 'jQuery("#secondarymarkpacked").hide();';
		    	scr += 'jQuery("#tdbody_secondarymarkpacked").hide();';
		    	
		    	//push the script into the field so that it fires and does its handy work
		    	hideFld.defaultValue = "<script>jQuery(function($){require([], function(){" + scr + ";})})</script>"
      		}
    }

    

    return {
        beforeLoad: beforeLoad
    };
    
});
