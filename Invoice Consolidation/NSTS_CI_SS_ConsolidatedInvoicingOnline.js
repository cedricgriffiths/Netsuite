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
* A generic solution provided by NetSolution for Consolidating Invoices.
* this solution contains the creation of CI Record which tag to the Customer
* and associated Invoices. Each invoices will contain the CI Number field and
* Once it's being process and Included in the CI the CI number will be tag to
* the invoice
 * 
 * Version    Date            Author           Remarks
 * 1.00       02 Mar 2016     pdeleon   Initial version.
 * 
 */

/**
* This scheduled script process the creation of the PDF and updates both CI custom record and child invoices
* when the online CI consolidation from the suitelet gets submitted.
**/
function schedule_ProcessCIOnline()
{
    var stLogTitle = 'SCHEDULE_PROCESSCIONLINE';
    var blErrorEmailSent = false;
    var arrUniqCust = [];
    var arrUnprocessedCI = [];
    var ciConfig = null;
    var objLogs = {
            search      : [] ,
            cicreate    : [] ,
            pdf         : [] ,
            email       : [] ,
            fax         : [] ,
            inv         : [] ,
            ci          : [] ,
            err         : []
        };
    var context     = nlapiGetContext();  
    var stKeys      = context.getSetting("script", SCRIPTPARAM_CUSTSCRIPT_NSTS_CI_KEYS_TO_GENERATE);
    var stFilters   = context.getSetting("script", SCRIPTPARAM_CUSTSCRIPT_NSTS_CI_FILTERS_TO_GENERATE);
    var stTaskId      = context.getSetting("script", SCRIPTPARAM_CUSTSCRIPT_NSTS_CI_TASK_ID);
    
    /**
     * @TODO: CI v2.5
     * remove this in CI V2.5
     * var stCITaskId = createCITask(ONLINE,arrPageValues.length);
     */
    stTaskId = getCITask({
        type: ONLINE,
        intCICount: 0,
        taskid: stTaskId,
    }).getId();
    
    
    log('DEBUG',stLogTitle,"getCITask #1 ID:" + stTaskId);
    
    try{
  
        HC_TASK_OBJ     = null;
        //create a CI task custom record 
        
        var stLogTitle  = "SCHEDULE_PROCESSCIONLINE";
        log("debug", stLogTitle, "Start");
        
        var objKeys         = JSON.parse(stKeys);
        var objCIFilters    = JSON.parse(stFilters);
        objCIFilters.taskid =  stTaskId;
        
        for (var i = 0; i < objKeys.length; i++) {
            var stCustomerId = objKeys[i].customer;
            var stCIId = objKeys[i].ciId;
            
            if (arrUniqCust.indexOf(stCustomerId) < 0) {
                arrUniqCust.push(stCustomerId);
            }
            if (arrUnprocessedCI.indexOf(stCIId) < 0) {
                arrUnprocessedCI.push(stCIId);
            }
            nlapiLogExecution('debug', 'cust:' + stCustomerId, 'ci:' + stCIId);
        }
        
        ciConfig        = getCISetup();
        log("debug", stLogTitle, "objCIFilters.customerscreen:" + objCIFilters.customerscreen + " ,stKeys:" + stKeys + " ,stFilters:" + stFilters);
        
        if (objCIFilters.customerscreen == "T")
        {
            log("debug",stLogTitle, "START OBJCIFILTERS.CUSTOMERSCREEN :" + objCIFilters.customerscreen);
            ciConfig = getLayout(objCIFilters.defaultlayout);
            ciConfig.customerscreen = "T";
            
            GLOBAL_CI_SETUP_CONFIG.emailSenderUserId = objCIFilters.userid; //18;//objFilters.userid;
            GLOBAL_CI_SETUP_CONFIG.faxSenderUserId = objCIFilters.userid;
            
            log("debug",stLogTitle, "END OBJCIFILTERS.CUSTOMERSCREEN :" + objCIFilters.customerscreen);
        }
        
        //update the CI Task to Inprocess
        /**
         * @TODO: CI v2.5
         * remove this in CI V2.5
         */
        getCITask({
            taskid: stTaskId,
            fields:{
                custrecord_nsts_ci_task_status: IN_PROCESS
            }
        });
        log('DEBUG',stLogTitle,"getCITask #2 ID:" + stTaskId);
        
        //v2.0 Send Email to AR Contacts
        var arrAREmails = [];
        if (!isEmpty(arrUniqCust)) {
            var arrContactCategory = ciConfig.contactCategory.split(',');
            if (!isEmpty(arrContactCategory)) {
                arrAREmails = getARContacts(arrUniqCust, arrContactCategory);
            }
        }
    
        try
        {
             
            var arrCINumber     = [];
            var arrCICustomers  = [];

            // ATLAS Enhancement - Use customer/preferred term to populate CI due date
            var objTerm = getPreferredTerm();
            
            for (var i = 0; i < objKeys.length; i++)
            {              
                var arrSelectedInvoices = objKeys[i].arrSelectedInvoices;
                var stCustomerId        = objKeys[i].customer;
                var ciId                = objKeys[i].ciId;        
                //var ciId = -1;
                
                try{                    
                    ciId = processMainCITransaction(objKeys[i],null,objLogs,ciConfig,objCIFilters,arrAREmails,objTerm);
                    delete arrUnprocessedCI[arrUnprocessedCI.indexOf(ciId)];
                }catch(e){
                    log("ERROR", 'Unexpected Error',  e);
                    appendCILog({
                        taskid: stTaskId,
                        message: 'ERROR: ' + e
                    });
                    getCITask({taskid: stTaskId, doSave: true });
                    log('DEBUG',stLogTitle,"getCITask #3 ID:" + stTaskId);
                }
                
                if(ciId> 0){
                    arrCINumber.push(ciId);
                }
    
                arrCICustomers.push(stCustomerId);
                
                objKeys[i] = null;
                
                USAGE_STARTTIME = NSUtil.rescheduleScript(USAGE_LIMIT, USAGE_STARTTIME, USAGE_MAXTIMEINTERVALINMS);
            }
            
            //unmarkCustomerCIInProcess(arrUniqCust);
            
            /**
             * @TODO: CI v2.5
             */
            appendBulkCILog(objLogs,{taskid: stTaskId});
            
            log('debug', 'ci id:' + stTaskId, 'uniq cust:' + arrUniqCust + " stTaskId:" + stTaskId);
            
            //unmarkCustomerCIInProcess(arrUniqCust);
            
            /**
             * @TODO: CI v2.5
             */
            appendCILog({
                taskid: stTaskId,
                message: 'Online Consolidation - ********Completed********',
                arrCiNum: arrCINumber
            });
            
            getCITask({
                taskid: stTaskId,
                fields:{
                    custrecord_nsts_ci_task_ended: nlapiDateToString(new Date(),'datetimetz'),
                    custrecord_nsts_ci_task_status: ((objLogs.err.length==0)? COMPLETED: COMPLETEWERR),
                    custrecord_nsts_ci_records_created:  objLogs.ci.length,
                    custrecord_nsts_ci_error_details: ((objLogs.err.length==0)? null: objLogs.err.join("\n")),
                    custrecord_nsts_ci_customers: arrCICustomers,
                    custrecord_nsts_ci_numbers: arrCINumber,
                    custrecord_nsts_ci_trigger_mr_script: 'T',
                    custrecord_nsts_ci_records: objLogs.ci.length,
                },
                doSave: true
            });
            log('DEBUG',stLogTitle,"getCITask #4 ID:" + stTaskId);
        }
        catch(error)
        {
            log("ERROR", 'Unexpected Error',  error);

            //update the CI Task about task completion            
            /**
             * @TODO: CI v2.5
             */
            appendCILog({
                taskid: stTaskId,
                message: 'ERROR: ' + error
            });
            appendCILog({
                taskid: stTaskId,
                message: 'Online Consolidation - ********ERROR/FAILED********'
            });
            
            getCITask({
                taskid: stTaskId,
                fields:{
                    custrecord_nsts_ci_task_ended: nlapiDateToString(new Date(),'datetimetz'),
                    custrecord_nsts_ci_task_status: FAILED,
                    custrecord_nsts_ci_records_created:  objLogs.ci.length,
                    custrecord_nsts_ci_error_details: error.toString(),
                    custrecord_nsts_ci_customers: arrCICustomers,
                    custrecord_nsts_ci_records: objLogs.ci.length,
                },
                doSave: true
            });
            log('DEBUG',stLogTitle,"getCITask #5 ID:" + stTaskId);
            
            for (var i=0; i < arrUnprocessedCI.length; i++) {
                nlapiLogExecution('debug', 'unproc', arrUnprocessedCI[i]);
                if (!isEmpty(arrUnprocessedCI[i])) {
                    try {
                        nlapiSubmitField(RECTYPE_CUSTOMRECORDSS_NSTS_CI_CONSOLIDATE_INVOICE, arrUnprocessedCI[i], FLD_CUSTRECORD_NSTS_CI_STATUS_LIST, CI_STATUS_FAILED);
                    } catch (e) {
                        log("ERROR", 'Unexpected Error',  e);
                        appendCILog({
                            taskid: stTaskId,
                            message: 'ERROR: ' + e
                        });
                        getCITask({taskid: stTaskId, doSave: true });
                        log('DEBUG',stLogTitle,"getCITask #6 ID:" + stTaskId)
                    }
                }
                
                USAGE_STARTTIME = NSUtil.rescheduleScript(USAGE_LIMIT, USAGE_STARTTIME, USAGE_MAXTIMEINTERVALINMS);
            }
            

            
            if (arrUniqCust) {
                unmarkCustomerCIInProcess(arrUniqCust);
            }
            
            if (!isEmpty(ciConfig) && !isEmpty(ciConfig.adminEmail) && !isEmpty(ciConfig.emailSenderUserId)) {
                sendErrorEmail(ciConfig.emailSenderUserId, ciConfig.adminEmail, stTaskId, error);
                blErrorEmailSent = true;
            }
            
           if (error.getDetails != undefined) 
            {
                log('ERROR', 'Process Error', error.getCode() + ': ' + error.getDetails());
                throw error;
            }
            else
            {
                log("ERROR", 'Unexpected Error',  error.toString());
                throw nlapiCreateError('99999', error.toString());
            }
        }
    } catch (error) {
        
        log("ERROR", 'Unexpected Error',  error);
        /**
         * @TODO: CI v2.5
         */
        appendCILog({
            taskid: stTaskId,
            message: 'ERROR: ' + error
        });
        appendCILog({
            taskid: stTaskId,
            message: 'Online Consolidation - ********ERROR/FAILED********'
        });
        getCITask({
            taskid: stTaskId,
            fields:{
                custrecord_nsts_ci_task_ended: nlapiDateToString(new Date(),'datetimetz'),
                custrecord_nsts_ci_task_status: FAILED,
                custrecord_nsts_ci_records_created:  objLogs.ci.length,
                custrecord_nsts_ci_error_details: error.toString(),
                custrecord_nsts_ci_customers: arrCICustomers,
                custrecord_nsts_ci_records: objLogs.ci.length,
            },
            doSave: true
        });
        log('DEBUG',stLogTitle,"getCITask #7 ID:" + stTaskId);
        if (!isEmpty(arrUniqCust)) {
            unmarkCustomerCIInProcess(arrUniqCust);
        }
        
        if (!isEmpty(ciConfig) && !isEmpty(ciConfig.adminEmail) && !isEmpty(ciConfig.emailSenderUserId) && !blErrorEmailSent) {
            sendErrorEmail(ciConfig.emailSenderUserId, ciConfig.adminEmail, stTaskId, error);
        }

        for (var i=0; i < arrUnprocessedCI.length; i++) {
            if (!isEmpty(arrUnprocessedCI[i])) {
                try {
                    nlapiSubmitField(RECTYPE_CUSTOMRECORDSS_NSTS_CI_CONSOLIDATE_INVOICE, arrUnprocessedCI[i], FLD_CUSTRECORD_NSTS_CI_STATUS_LIST, CI_STATUS_FAILED);
                } catch (e) {
                    log("ERROR", 'Unexpected Error',  e);
                    appendCILog({
                        taskid: stTaskId,
                        message: 'ERROR: ' + e
                    });
                    getCITask({taskid: stTaskId, doSave: true });
                    log('DEBUG',stLogTitle,"getCITask #8 ID:" + stTaskId);
                }
            }
            
            USAGE_STARTTIME = NSUtil.rescheduleScript(USAGE_LIMIT, USAGE_STARTTIME, USAGE_MAXTIMEINTERVALINMS);
        }
        
       if (error.getDetails != undefined) 
        {
            log('ERROR', 'Process Error', error.getCode() + ': ' + error.getDetails());
            throw error;
        }
        else
        {
            log("ERROR", 'Unexpected Error',  error.toString());
            throw nlapiCreateError('99999', error.toString());
        }
    }
    log("debug", stLogTitle, "End");
}
