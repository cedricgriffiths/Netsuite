/**
 * Copyright (c) 1998-2016 NetSuite, Inc.
 * 2955 Campus Drive, Suite 100, San Mateo, CA, USA 94403-2511
 * All Rights Reserved.
 * 
 * This software is the confidential and proprietary information of
 * NetSuite, Inc. ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with NetSuite.
 * 
 * Disabled editing of the due date and term fields if there is a CI associated
 * to the invoice
 * 
 * 
 * Version    Date            Author           Remarks
 * 1.00       11 Mar 2016     dgeronimo	        Initial version.
 * 
 */


function cil_beforesubmit(type) {
    var stExecContext = nlapiGetContext().getExecutionContext();
    
    if(stExecContext == "csvimport"){
        throw "Invalid: CIL cannot be created on import.";
    }
}

/**
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @return {void}
 */
function cil_aftersubmit(type) {
    if(type != "delete"){
        var rec = nlapiLookupField(nlapiGetRecordType(), nlapiGetRecordId(), ['custrecord_nsts_cil_invoice',"custrecord_nsts_ci_link_othervar"])
        
        var objOtherVar = nlapiGetFieldValue('custrecord_nsts_ci_link_othervar');
        var intInvId = rec['custrecord_nsts_cil_invoice'];
        if(!isEmpty(objOtherVar)){
            objOtherVar = JSON.parse(objOtherVar);
            
            try{

                var bUpdDueDate = objOtherVar.updateDueDate;
                var stCIDate = objOtherVar.ciDate;

                log("DEBUG","cil_aftersubmit",'bUpdDueDate:' + bUpdDueDate + ' stCIDate:' + stCIDate + " intInvId: " + intInvId);
                if((bUpdDueDate == true || bUpdDueDate == 'true') && !isEmpty(stCIDate) && !isEmpty(intInvId)){
                    log("DEBUG","cil_aftersubmit #2",'stCIDate:' + stCIDate + " intInvId: " + intInvId);
                    nlapiSubmitField('invoice', intInvId, ["terms","duedate"], ["",stCIDate], false);
                    log("DEBUG","cil_aftersubmit #3",'update complte stCIDate:' + stCIDate + " intInvId: " + intInvId);
                    
                }
                log("DEBUG","cil_aftersubmit",stCIDate);
                
            }catch(e){
                log("DEBUG","ERROR: cil_aftersubmit" ,e);
            }
        }
    }
}
