    /**
     * Module Description
     * 
     * Version    Date            Author           Remarks
     * 1.00       03 Nov 2016     dgeronimo
     *
     */
    
    /**
     * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
     * @returns {Void}
     */
    function ciasync_scheduled(type) {
        
        
        var stLogTitle = "CIASYNC_SCHEDULED";
        log('DEBUG', stLogTitle, 'START');
        
        var objContext = nlapiGetContext();
        var stRemainingUsage = objContext.getRemainingUsage();
        //var stCIDateFlag = request.getParameter("custpage_cidate_flag");
        //var stCIDate     = request.getParameter("custpage_cidate");
        //var updateDueDate = request.getParameter("custpage_update_duedate");
        //selectedci       = request.getParameter(FLD_CUSTPAGE_SELECTED_CI);
        //arrPageValues    = JSON.parse(selectedci);
        
        
        var context         = nlapiGetContext();    
        var arrPageValues   = context.getSetting("script", SCRIPTPARAM_CUSTSCRIPT_NSTS_CI_ARRPAGE_VALUES);
        var objOVar         = context.getSetting("script", SCRIPTPARAM_CUSTSCRIPT_NSTS_CI_OTHERVARIABLE);
        
        log('DEBUG', stLogTitle, 'ARRPAGEVALUES:' + arrPageValues);
        log('DEBUG', stLogTitle, 'OBJOVAR:' + objOVar);
        
        arrPageValues       = JSON.parse(arrPageValues);
        objOVar             = JSON.parse(objOVar);
        
        var stCIDateFlag    = objOVar['custpage_cidate_flag'];
        var stCIDate        = objOVar['custpage_cidate'];
        var updateDueDate   = objOVar['custpage_update_duedate'];
        var objCIFilters    = objOVar['objCIFilters'];
        
        getCITask({
            type: ONLINE,
            intCICount: 0,
            doSave: true,
            fields:{
                custrecord_nsts_ci_tasl_updt_due_date: updateDueDate
            }
        });
            
        var objCIconfig = getCISetup();
    
        var stTitle = "";
    
        var arrCustomerIds = [];
        var arrCiIds = [];
        var arrScedParam = [];
        var arrCIPDF = [];
        var bIsAnyProcessCommited = false;
                   
        //v2.0 Enhancement - Process CI per Customer - Don't process parents in process
        var arrCustomerCheck = [];
        if(objCIconfig.includeSubCustomers == "T") {
            var arrCustomersCheckInProcess = [];
            for (var i = 0; i < arrPageValues.length; i++){
                var stCustomerId = arrPageValues[i].customerid;
                if (!isEmpty(stCustomerId)) {
                    arrCustomersCheckInProcess.push(stCustomerId);
                }
            }
            
            if (!isEmpty(arrCustomersCheckInProcess)) {
                arrCustomerCheck.push(getCustomerCIsInProcess(arrCustomersCheckInProcess));
            }
        }
        
        for (var i = 0; i < arrPageValues.length; i++)
        {
            var selected = arrPageValues[i];
            var stCustomerId = selected.customerid;
            var objData = JSON.parse(selected.data);
            objCIFilters.customer = stCustomerId;
            
            //v2.0 Enhancement - Process CI per Customer - Don't process parents in process
            if (arrCustomerCheck.indexOf(stCustomerId) >= 0) {
                continue;
            }
            
            var arrSelectedInvoices = getInvoiceIdwithFilter(objCIFilters, objData);
    
            //GET CI REF Start's Here
            var stCIPreference = "";
            
            for(pref in objData){
                var prefName = pref;
                switch(prefName){
                    case "jobMain":
                        prefName = "Project";
                        break;
                    case "entity":
                        prefName = "Customer";
                        break;
                }
                
                var dataValue = (isEmpty(objData[pref].text))? objData[pref].value: objData[pref].text;
                stCIPreference += (isEmpty(stCIPreference)?"":",") + "{0}:{1}".format(prefName.toUpperCase(),dataValue);
            }
            
            //GET CI REF END's Here 
            var ciCount = (isEmpty(arrSelectedInvoices))? 0: arrSelectedInvoices.length;
            
            if(ciCount <= 0){
                continue;
            }
    
            bIsAnyProcessCommited = true;        
            var recNewCI = nlapiCreateRecord(RECTYPE_CUSTOMRECORDSS_NSTS_CI_CONSOLIDATE_INVOICE);
            log("debug", stLogTitle, "stCIPreference:" + stCIPreference);
            recNewCI.setFieldValue(FLD_CUSTRECORD_NSTS_CI_PREFERENCES, stCIPreference);
            recNewCI.setFieldValue(FLD_CUSTRECORD_NSTS_CI_CUSTOMER, stCustomerId);
            recNewCI.setFieldValues(FLD_CUSTRECORD_NSTS_CI_SELECTED_INV, arrSelectedInvoices);
            recNewCI.setFieldValue(FLD_CUSTRECORD_NSTS_CI_SAVED_IN_SERVERSIDE, "T");
            recNewCI.setFieldValue(FLD_CUSTRECORD_NSTS_CI_COUNT_INVOICES, ciCount);
            recNewCI.setFieldValue(FLD_CUSTRECORDNSTS_CI_TASK, HC_TASK_ID);
            
            
            if (!isEmpty(stCIDate)) recNewCI.setFieldValue(FLD_CUSTRECORD_NSTS_CI_DATE, stCIDate);
            var recId = nlapiSubmitRecord(recNewCI,true,true);
            arrCiIds.push(recId);
            
            var objCI = {
                    arrSelectedInvoices : arrSelectedInvoices ,
                    customer : stCustomerId ,
                    data : objData ,
                    ciId : recId ,
                    stCIDateFlag : stCIDateFlag ,
                    stCIDate : stCIDate,
                    stAsOfDate : objCIFilters.asofdate,
                    updateDueDate : updateDueDate
                };
                
            if (arrCustomerIds.indexOf(stCustomerId) < 0) {
                arrCustomerIds.push(stCustomerId);
            }
    
            arrScedParam.push(objCI);
        }
        
        for (var i = 0; i < arrCustomerIds.length; i++) {
            nlapiSubmitField('customer', arrCustomerIds[i], FLD_CUSTENTITY_NSTS_CI_IN_PROCESS, 'T');
        }
        
        if (bIsAnyProcessCommited)
        {
            log('DEBUG', stLogTitle, 'SENDING CI TO SCHEDULED SCRIPT!');
            var userid = objContext.getUser();
            
            objCIFilters.userid = userid;
            
            var arrSchedParam = {};
            var stKeys = JSON.stringify(arrScedParam);
    
            var stFilters = JSON.stringify(objCIFilters);
            arrSchedParam[SCRIPTPARAM_CUSTSCRIPT_NSTS_CI_KEYS_TO_GENERATE] = stKeys;
            arrSchedParam[SCRIPTPARAM_CUSTSCRIPT_NSTS_CI_FILTERS_TO_GENERATE] = stFilters;
            arrSchedParam[SCRIPTPARAM_CUSTSCRIPT_NSTS_CI_TASK_ID] = HC_TASK_ID;
            
            var status = nlapiScheduleScript(SCRIPTID_SCHED, null, arrSchedParam);
        }else{
            log('DEBUG', stLogTitle, 'NO CI TO PROCESS');
        };
        
        
        
    }
