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
 * Map/Reduce scheduled script to handle the Closed/Fully billed Closed PO
 * this script will reject a VP bill or credit a VP Bill depending on the condition 
 * if a bill is approved or not before PO closing
 * 
 * Version    Date            Author           Remarks
 * 1.00       21 Apr 2016     DennisGeronimo   Initial version.
 * 
 */


/**
 *@NApiVersion 2.x
 *@NScriptType MapReduceScript
*/
var HC_MODULES = ['N/record','N/runtime','N/search','N/format','N/task'];
define(HC_MODULES, function(record,runtime,search,formater,task) {
    var OBJ_SCRIPT  = runtime.getCurrentScript();
    var ST_ARRCIREC = null;
    var ST_DUEDATE  = null;
    
    var HC_CI_RECORD = {
            ID: 'customrecord_nsts_ci_consolidate_invoice',
            FIELDS: {
                CUSTRECORD_NSTS_CI_SELECTED_INV : 'custrecord_nsts_ci_selected_inv',
                CUSTRECORD_NSTS_CI_TRAN_DUEDATE: 'custrecord_nsts_ci_tran_duedate',
                CUSTRECORD_NSTS_CI_CUSTOMER: 'custrecord_nsts_ci_customer'
            }
    };
    
    var HC_CIL_RECORD = {
            ID: 'customrecord_nsts_ci_gen_ci_links',
            FIELDS: {
                CUSTRECORD_NSTS_CIL_INVOICE: 'custrecord_nsts_cil_invoice',
                CUSTRECORD_NSTS_CIL_CI_NUMBER: 'custrecord_nsts_cil_ci_number'
            }
    }
    
    
    /**
     * this will validate is a Array/String/Object is empty or not
     * @param value the value to validate
     */
    function isEmpty(value){
        var bResult = false;            
        if (value == null || value == 'null' || value == undefined || value == '' || value == "" || value.length <= 0) { bResult = true; }
        return bResult;
    }
    
    function keysToLowerCase(obj) {
        if (!typeof(obj) === "object" || typeof(obj) === "string" || typeof(obj) === "number" || typeof(obj) === "boolean") {
            return obj;
        }

        var lowKey;
        for(var key in obj){
            lowKey = key.toLowerCase();
            var orgObj  = obj[key];
            if(orgObj instanceof Array){
                obj[lowKey] = [];
                for(var indx in orgObj){
                    obj[lowKey].push(keysToLowerCase(orgObj[indx]));
                    
                }
            }else{
                obj[lowKey] = keysToLowerCase(obj[key]);
            }
        }
        return (obj);
    }

    /**
     * this can be used in used in JSON parse search result string in lookupField where the field result can be array or( text,value) or single object of (text,value)
     * @param field: searchResultColumn on the search result
     */
    function getValue(field){
        if(isEmpty(field)){
            return "";
        }
        
        var retVal = "";
        
        if(field instanceof Array){
            retVal = [];
            for(var i in field){
                retVal.push(field[i].value);
            }
            retVal = retVal.join(',');
        }else{
            if(typeof(field) === "object"){
                retVal = field.value;
            }else{
                retVal = field;
            }
    
        }
        
        return retVal;
    }
    /**
     * this can be used in JSON parse search result string in lookupField where the field result can be array or( text,value) or single object of (text,value)
     * @param field: searchResultColumn on the search result
     */
    function getText(field){
        if(isEmpty(field)){
            return "";
        }
        
        var retVal = "";
        
        if(field instanceof Array){
            retVal = [];
            for(var i in field){
                retVal.push(field[i].text);
            }
            retVal = retVal.join(',');
        }else{
            if(typeof(field) === "object"){
                retVal = field.text;
            }else{
                retVal = field;
            }
    
        }
        
        return retVal;
    }
    
//=================
    /**
     * this will get all result more than 1000
     * @param option: save search Option 
     * @param option.isLimitedResult
     * @return {result[]}
     */
    function searchGetAllResult(option){
        var result = [];
        if(option.isLimitedResult == true){
            var rs = search.create(option).run();
            result = rs.getRange(0,1000);
            
            return result;
        }
        
        var rp = search.create(option).runPaged();
        rp.pageRanges.forEach(function(pageRange){
            var myPage = rp.fetch({index: pageRange.index});
            result = result.concat(myPage.data);
        });
        
        return result;
    }
    
    /**
     * this will get all result more than 1000
     * @param option: save search Option 
     * @param option.isLimitedResult
     * @return {result[]}
     */
    function searchGetAllResultSrchObj(searchObject,option){
        
        if(isEmpty(option)){
            option = {};
        }
        
        var result = [];
        if(option.isLimitedResult == true){
            var rs = searchObject.run();
            result = rs.getRange(0,1000)
            
            return result;
        }
        
        var rp = searchObject.runPaged();
        rp.pageRanges.forEach(function(pageRange){
            var myPage = rp.fetch({index: pageRange.index});
            result = result.concat(myPage.data);
        });
        
        return result;
    }
    
    
    /**
     * this function will sort the search result by ASC
     * @param result array(search result) 
     * @param field string(name of the field to sort)
     */
    function searchSortResult(result,field){
        if(isEmpty(result) || isEmpty(field)){
            return [];
        }
        
        var arrResult = result.sort(function(a,b){
            var inta = a.getValue(field);
            var intb = b.getValue(field);
            return inta - intb;
        });
        
        return arrResult;
    }
    
    
    /**
     * @description load search with the ability to append additional or remove filters and columns.
     * @param option a regular search module for search.load
     * @param option.addFilters (array) this will hold the new appending filters
     * @param option.addColumns (array) this will hold the new appending Columns
     * @param option.removeFilters (array) remove the filter by colname or colname + operator or  colname + operator + filter value (not yet implemented)
     * @param option.removeColumns (array) remove the columns by colname (not yet implemented)
     * @param option.resultLimit (number)
     * @param option.resultStart (number)
     * @result Array of result
     */
    function searchLoad(option){
        if(isEmpty(option)){
            return null;
        }
        
        var objSearch = search.load({
            id: option.id,
        });
        
        if(!isEmpty(option.filters)){
            objSearch.filters = option.filters;
        }
        if(!isEmpty(option.columns)){
            objSearch.columns = option.columns;
                       
        }
        if(!isEmpty(objSearch.columns)){
            for(var i = 0; i < objSearch.columns.length; i++){

                
                if(!isEmpty(objSearch.columns[i].formula)){
                    //log.debug('SEARCHLOAD',JSON.stringify(objSearch.columns[i]));
                    var stName = objSearch.columns[i].name;
                    var stSummary = objSearch.columns[i].summary;
                    var stFormula = objSearch.columns[i].formula;
                    var stJoin = objSearch.columns[i].join;
                    var stFunction = objSearch.columns[i]['function'];
                    
                    var stSort = objSearch.columns[i].sort;
                    var stSortdir = objSearch.columns[i].sortdir;
                    var stLabel = objSearch.columns[i].label;
                    var stLabelId = isEmptyReplaceWith(stLabel, '');
                        stLabelId = stLabelId.replace(/\s/g,'');
                        stLabelId = stLabelId.toLowerCase();

                        objSearch.columns[i] = search.createColumn({
                            name: stName + "_" + stLabelId + (i+1),
                            summary: stSummary,
                            join: stJoin,
                            label: stLabel,
                            'function': stFunction,
                            formula: stFormula,
                            sort: stSort,
                            sortdir: stSortdir
                        });

                    //log.debug('SEARCHLOAD #2',JSON.stringify(objSearch.columns[i]));
                }
            }
        }

        
        if(!isEmpty(option.addFilters)){
            var arrFil = objSearch.filters;
            arrFil = isEmpty(arrFil)? []: arrFil;
            
            objSearch.filters = arrFil.concat(option.addFilters);
        }
        
        if(!isEmpty(option.addColumns)){
            var arrCol = objSearch.columns;
            arrCol = isEmpty(arrCol)? []: arrCol;
            
            objSearch.columns = arrCol.concat(option.addColumns);
        }
        
        var arrResult = [];
        var intStart  = 1;
        if(!isEmpty(option.resultStart))
            intStart = option.resultStart;
      
        if(!isEmpty(option.resultLimit)){

            option.resultLimit = parseInt(option.resultLimit);
            option.resultLimit = (option.resultLimit <= 0 )? 1000: option.resultLimit;
            arrResult = objSearch.run().getRange(intStart,option.resultLimit);
        }else{
            arrResult = searchGetAllResultSrchObj(objSearch, option);
        }

        return {
            search: objSearch,
            result: arrResult,
        }
    }
    
//=================
    
    function chuckArray(array, size) {
        var results = [];
        var arrBuff = [];

        var cnt = 0
        for (var i = 0; i < array.length; i++) {
            cnt++;
            arrBuff.push(array[i]);

            if (cnt == size) {
                results.push(arrBuff);
                arrBuff = [];
                cnt = 0;
            }
        }

        if (cnt > 0) {
            results.push(arrBuff);
        }

        return results;
    }
    
    /*
     * 
     * Gevernace: 
     *  #if bSaveCreatedDeplyment is true and new deployment is created then 10 unit 
     *  #else 0
     * option.scriptid (required)
     * option.deployid
     * option.title
     * option.params;
     * option.maxCreateDeployment
     * option.saveCreatedDeplyment
     */
    function checkAndCreateRMTask(option){
        
        var mrTask = null;
        var stScriptid = option.scriptid;
        var stDeploymentId = option.deployid;
        var stTitle = option.title;
        var params = option.params
        var intMaxCreateDeployment = option.maxCreateDeployment;
        var bSaveCreatedDeplyment = isEmpty(option.saveCreatedDeplyment)? true: Boolean(option.saveCreatedDeplyment);
        var bAddqueueids = true;
        
        intMaxCreateDeployment = parseInt(intMaxCreateDeployment);
        //intMaxCreateDeployment = 1000; //(intMaxCreateDeployment <= 0) ? 1000: intMaxCreateDeployment;
        
        intMaxCreateDeployment = 150;
        if(isEmpty(stScriptid)){
            throw Error('Script ID is required');
        }
        
        stTitle = isEmpty(stTitle)? "": stTitle;
        log.debug('CHECKANDCREATERMTASK',"bSaveCreatedDeplyment:" + bSaveCreatedDeplyment + " intMaxCreateDeployment:" + intMaxCreateDeployment);
        
        if(bSaveCreatedDeplyment == true){
            //Search for the script
            var arrFils = [];
            var arrCols = [];
            arrCols.push(new search.createColumn({na​m​e: 'internalid',sort: search.Sort.ASC}));

          //Search for the script deployment
            if(!isEmpty(stScriptid)){
                arrFils = [];
                arrFils.push(new search.createFilter({name: 'scriptid',join: 'script',operator: 'is',values: stScriptid}));
                arrFils.push(new search.createFilter({name: 'status',operator: 'anyof',values: ['NOTSCHEDULED']}));                
                var arrScriptDep = search.create({type: 'scriptdeployment',filters: arrFils,columns: arrCols}).run().getRange(0,1);

                if(!isEmpty(arrScriptDep)){
                    var intfunc_copy_deployment_errCount = 0;
                    var func_copy_deployment = function(deployid){
                        var scriptDepid = deployid;
                        
                        log.debug("scriptDepid",scriptDepid);
                        try{
                            var recDep = record.copy({
                                type: 'scriptdeployment',
                                id: scriptDepid
                            });
                            
                            stTitle += " " + arrScriptDep.length;
                            recDep.setValue('title',stTitle);
                            recDep.setValue('useallqueues',true);
                            recDep.setValue('startdate',new Date());
                            
                            if(bAddqueueids == true){
                                recDep.setValue('queueids',[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25]);
                            }

                            recDep.save();
                        }catch(e){
                            intfunc_copy_deployment_errCount++
                            log.debug("FUNC_COPY_DEPLOYMENT ERR",e);
                            bAddqueueids = false;
                            if(intfunc_copy_deployment_errCount<=2){
                                func_copy_deployment(deployid);
                            }
                        }
                    }
                    
                    var intFaillingCount = 0; //# of times the creaye task and copy deployment has fail
                    var func_create_task = function(){
                        try{
                            mrTask = task.create({taskType: task.TaskType.MAP_REDUCE});
                            mrTask.scriptId = stScriptid;

                            mrTask.params = params
                            mrTaskId = mrTask.submit();
                            intFaillingCount = 0;
                        }catch(e){
                            intFaillingCount++;
                            if(intFaillingCount <= 10){
                                func_copy_deployment(arrScriptDep[0].id);
                                func_create_task();
                            }
                        }
                    } //-->  var func_create_task = function(){

                    func_create_task();
                } //--> if(!isEmpty(arrScriptDep))
            } //--> if(!isEmpty(scriptid))
        }else{
            mrTask = task.create({taskType: task.TaskType.MAP_REDUCE});
            mrTask.scriptId = stScriptid;

            mrTask.params = params
            var mrTaskId = mrTask.submit();
        }


        return {
            mrTaskId: mrTaskId
        }
        
    }
    
    var getInputData = function(){
        ST_ARRCIREC = OBJ_SCRIPT.getParameter({name: 'custscript_nsts_rm_ci_upd_cirecord'});
        ST_DUEDATE  = OBJ_SCRIPT.getParameter({name: 'custscript_nsts_rm_ci_upd_duedate'});
        ST_TASKID   = OBJ_SCRIPT.getParameter({name: 'custscript_nsts_rm_ci_task_id'});
        
        if(isEmpty(ST_ARRCIREC) && isEmpty(ST_DUEDATE) && !isEmpty(ST_TASKID)){
            var arrCust;
            if(!isEmpty(ST_TASKID)){
                var recTask = record.load({
                    type: 'customrecord_nsts_ci_task',
                    id: ST_TASKID
                })
                
                arrCust = recTask.getValue('custrecord_nsts_ci_customers');
            }
            
            
            log.debug("UPDATE CUSTOMER","arrCust:" + JSON.stringify(arrCust) + " arrCust type:" + typeof arrCust + " isArray:" + (arrCust instanceof Array) );
            return [{
                customers: arrCust
            }];
        }
        
        var arrCIRec = JSON.parse(ST_ARRCIREC);
        
        if (isEmpty(arrCIRec)){
            log.debug("NO CI RECORD TO PROCESS!");
            return;
        }
        
        var arrFil = [];
        arrFil.push(search.createFilter({
            name: 'internalid',
            operator: 'anyof',
            values: arrCIRec}));
        log.debug("GETINPUTDATA arrCIRec",arrCIRec + " ST_ARRCIREC: "+ ST_ARRCIREC);
        var arrRes = searchGetAllResult({
            type: HC_CI_RECORD.ID,
            columns : [HC_CI_RECORD.FIELDS.CUSTRECORD_NSTS_CI_SELECTED_INV,
                       HC_CI_RECORD.FIELDS.CUSTRECORD_NSTS_CI_TRAN_DUEDATE,
                       HC_CI_RECORD.FIELDS.CUSTRECORD_NSTS_CI_CUSTOMER,
                       ],
            filters : arrFil
        });
        log.debug("GETINPUTDATA arrCIRec",arrCIRec);
        log.debug("GETINPUTDATA arrRes",arrRes);
        var intCtr = 0;
        var arrInternal = [];
        var arrResult = [];
        
        var intSplitProcPer = 400;
        if(Boolean(ST_DUEDATE) == true){
            intSplitProcPer = 300;
        }
        
        log.debug("GETINPUTDATA PROC",'Process will be split in every ' + intSplitProcPer);
        for(var i = 0; i < arrRes.length; i++){
            arrInternal= [];
            intCtr = 0;
            
            var rec = arrRes[i];
            var arrInv = rec.getValue(HC_CI_RECORD.FIELDS.CUSTRECORD_NSTS_CI_SELECTED_INV);
            var stCiDate = rec.getValue(HC_CI_RECORD.FIELDS.CUSTRECORD_NSTS_CI_TRAN_DUEDATE);
            var stCustomer = rec.getValue(HC_CI_RECORD.FIELDS.CUSTRECORD_NSTS_CI_CUSTOMER);
            arrInv = !isEmpty(arrInv)? arrInv : '';
            
            arrResult.push({
                ciid:rec.id,
                invoices: arrInv,
                updateDueDate: ST_DUEDATE,
                ciDate: stCiDate,
                taskid: ST_TASKID
                });
        }
        
        if(!isEmpty(arrResult)){
            arrResult[arrResult.length-1].islast = true;
        }
        return arrResult;
    }
    
    var mapKey = 0;
    var map = function(context){

        ST_ARRCIREC = OBJ_SCRIPT.getParameter({name: 'custscript_nsts_rm_ci_upd_cirecord'});
        ST_DUEDATE  = OBJ_SCRIPT.getParameter({name: 'custscript_nsts_rm_ci_upd_duedate'});
        ST_TASKID   = OBJ_SCRIPT.getParameter({name: 'custscript_nsts_rm_ci_task_id'});
        log.debug('MAP context',JSON.stringify(context) + " ST_ARRCIREC:" + ST_ARRCIREC + " ST_DUEDATE:" + ST_DUEDATE + " ST_TASKID:" + ST_TASKID);
        
        if(isEmpty(ST_ARRCIREC) && isEmpty(ST_DUEDATE) && !isEmpty(ST_TASKID)){


            var objCustomer = JSON.parse(context.value);
            log.debug('MAP context',JSON.stringify(context) + " objCustomer:" + JSON.stringify(objCustomer));
            var arrCustPart = chuckArray(objCustomer.customers, 150);
            for(var iPrt = 0; iPrt < arrCustPart.length; iPrt++){
                context.write("key_upd_cust",arrCustPart[iPrt]);
            }
            
            return;
        }

        var objMapValue = JSON.parse(context.value);
        log.debug('MAP context',JSON.stringify(context) + " invoices type:" + typeof(objMapValue.invoices));
        
        var arrInvoices = objMapValue.invoices;
        log.debug('MAP context',"Loading CI Record ID:" + arrInvoices.length);
        if(!isEmpty(arrInvoices) && arrInvoices.length >= 3800){
            var cirec = record.load({
                type: HC_CI_RECORD.ID,
                id: objMapValue.ciid
            })
            arrInvoices = cirec.getValue(HC_CI_RECORD.FIELDS.CUSTRECORD_NSTS_CI_SELECTED_INV);
            log.debug('MAP context',"Loading CI Record ID:" + objMapValue.ciid + " arrInvoices length:" + arrInvoices.length);
        }else{
            arrInvoices = isEmpty(arrInvoices)? []: arrInvoices.split(',');
        }
        
        
        var arrChuckInv = chuckArray(arrInvoices, 2000);
        var arrCILInternalid = [];
        for(var chckInvId = 0; chckInvId < arrChuckInv.length; chckInvId++){
            var arrTempInv = arrChuckInv[chckInvId];
            
            var arrFil = [];
            arrFil.push(search.createFilter({
                name: HC_CIL_RECORD.FIELDS.CUSTRECORD_NSTS_CIL_INVOICE,
                operator: 'anyof',
                values: arrTempInv}));
            
            arrFil.push(search.createFilter({
                name: HC_CIL_RECORD.FIELDS.CUSTRECORD_NSTS_CIL_CI_NUMBER,
                operator: 'isempty'}));

            var arrRes = searchGetAllResult({
                type: HC_CIL_RECORD.ID,
                filters : arrFil
            });
            
            arrCILInternalid = arrCILInternalid.concat(arrRes);
        }
        delete objMapValue.invoices;
        
        log.debug('MAP context',"arrCILInternalid length:" + arrCILInternalid.length);
        var arrCil = [];
        for(var i = 0;i< arrCILInternalid.length; i++){
            arrCil.push(arrCILInternalid[i].id);
        }
        
        var arrChuckCIL = chuckArray(arrCil, 300);
        log.debug('MAP context',"# of iteration in arrChuckCIL length:" + arrChuckCIL.length);
        for(var chckCilId = 0; chckCilId < arrChuckCIL.length; chckCilId++){
            mapKey++;
            var onjRedData = objMapValue;
            onjRedData.arrcil = arrChuckCIL[chckCilId]
            context.write("key_" + mapKey,objMapValue);
        }
        
        /*if(objMapValue.islast == true || objMapValue.islast == 'true'){
            //record.l taskid
            
            if(!isEmpty(objMapValue.taskid)){
                var recTask = record.load({
                    type: 'customrecord_nsts_ci_task',
                    id: objMapValue.taskid
                })
                
                var arrCust = recTask.getValue('custrecord_nsts_ci_customers');
                
                var arrCustPart = chuckArray(arrCust, 150);
                for(var iPrt = 0; iPrt < arrCustPart.length; iPrt++){
                    context.write("key_upd_cust",arrCustPart[iPrt]);
                }
            }
        }*/
        
        
    }
   
    var reduce = function(context){
        /**
         * 5 point create new CIL and sumbit record
         * 5 pints submitField on Invoice
         * 10 points
         */
        log.debug('REDUCE context',JSON.stringify(context) );
        var arrRedValues =  context.values;
        log.debug("key",context.key);
        
        if(context.key == "key_upd_cust"){
            ST_TASKID   = OBJ_SCRIPT.getParameter({name: 'custscript_nsts_rm_ci_task_id'});
            
            for(var i in arrRedValues){
                var objRedVal = arrRedValues[i];
                if(typeof objRedVal == 'string'){
                    objRedVal = JSON.parse(objRedVal);
                }
                
                log.debug("key:" + context.key ,objRedVal);
                
                for (var intCust = 0; intCust < objRedVal.length; intCust++){
                	try{
                        record.submitFields({
                            type: 'customer',
                            id: objRedVal[intCust],
                            values: {
                                custentity_nsts_ci_in_process: false,
                                custentity_nsts_ci_lock_inui: false
                            },
                            ignoreMandatoryFields: true
                        });
                	}catch(ex){
                    	log.debug("ERROR: UPDATING CUSTOMER CI FLAGS",ex);
                    }                   
                }
                
                if(!isEmpty(ST_TASKID)){
                	try{
                        record.submitFields({
                            type: 'customrecord_nsts_ci_task',
                            id: ST_TASKID,
                            values: {
                                custrecord_nsts_ci_task_status: 6,
                                custrecord_nsts_ci_task_ended: formater.format({value: new Date() , type: formater.Type.DATETIME})
                            },
                            ignoreMandatoryFields: true
                        });
                	}catch(e){
                		log.debug("ERROR: UPDATING CI TASK",ex);
                	}

                }
                
            }

            
            return;
        }

        for(var i in arrRedValues){
            var objRedVal = arrRedValues[i];
            if(typeof objRedVal == 'string'){
                objRedVal = JSON.parse(objRedVal);
            }
            
            var arrCil = objRedVal.arrcil;
            if(!isEmpty(arrCil)){
                for (var intcilcnt = 0; intcilcnt < arrCil.length; intcilcnt++){
                    try{
                        var intcil = arrCil[intcilcnt];
                        record.submitFields({
                            type: HC_CIL_RECORD.ID,
                            id: intcil,
                            values: {
                                custrecord_nsts_cil_ci_number: objRedVal.ciid,
                                custrecord_nsts_ci_link_othervar: JSON.stringify({
                                    updateDueDate: objRedVal.updateDueDate,
                                    ciDate: objRedVal.ciDate
                                })
                            },
                            ignoreMandatoryFields: true
                        });
                    }catch(ex){
                    	log.debug("ERROR: UPDATING CIL Record",ex);
                    }

                }
            }
 
        }

    }
    
    var summarize = function(summary){
        summary.mapSummary.errors.iterator().each(function(key, value){
            var msg = 'Tab: ' + key + '. Error: ' + value + '\n';
            log.debug('SUMMARIZE MAP ERROR',msg);
            return true;
            });
        summary.reduceSummary.errors.iterator().each(function(key, value){
            var msg = 'Tab: ' + key + '. Error: ' + value + '\n';
            log.debug('SUMMARIZE REDUCE ERROR',msg);
            return true;
            });
        
        ST_ARRCIREC = OBJ_SCRIPT.getParameter({name: 'custscript_nsts_rm_ci_upd_cirecord'});
        ST_DUEDATE  = OBJ_SCRIPT.getParameter({name: 'custscript_nsts_rm_ci_upd_duedate'});
        ST_TASKID   = OBJ_SCRIPT.getParameter({name: 'custscript_nsts_rm_ci_task_id'});
        
        if(!isEmpty(ST_ARRCIREC) && !isEmpty(ST_DUEDATE) && !isEmpty(ST_TASKID)){
            log.debug("CALLING UPDATE CUSTOMER!");
            var rmTask = checkAndCreateRMTask({
                scriptid: 'customscript_nsts_mr_ci_update_cil',
                params: {
                    custscript_nsts_rm_ci_task_id: ST_TASKID
               }
            });
        }
    }
    
    return {
        getInputData : getInputData,
        map : map,
        reduce : reduce,
        summarize : summarize
        };
});