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
var HC_MODULES = ['N/record','N/runtime','N/search','N/task'];
define(HC_MODULES, function(record,runtime,search,task) {
    var OBJ_SCRIPT  = runtime.getCurrentScript();
    var ST_ARRCIREC = null;
    var ST_DUEDATE  = null;
    
    var HC_CI_RECORD = {
            ID: 'customrecord_nsts_ci_consolidate_invoice',
            FIELDS: {
                CUSTRECORD_NSTS_CI_SELECTED_INV : 'custrecord_nsts_ci_selected_inv',
                CUSTRECORD_NSTS_CI_TRAN_DUEDATE: 'custrecord_nsts_ci_tran_duedate'
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
        var intStart  = 0;
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
    
    /*
     * 
     * Gevernace: 
     *  #if bSaveCreatedDeplyment is true and new deployment is created then 15 unit 
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
        var objScrh = searchLoad({
            id: 'customsearch_nsts_ci_without_link',
            resultLimit: 1000,
        });
        
        var arrRes = objScrh.result;
        log.debug("GETINPUTDATA",arrRes);
        var intCtr = 0;
        var arrInternal = [];
        var arrResult = [];
        
        for(var i = 0; i < arrRes.length; i++){
            intCtr++;
           
            arrInternal.push(arrRes[i]);
            if (intCtr == 150) {
                arrResult.push(arrInternal);
                arrInternal= [];
                intCtr = 0;
            }
        }
        
        if (intCtr > 0) {
            arrResult.push(arrInternal);
        }
        
        return arrResult;
    }
    
    var mapKey = 0;
    var map = function(context){
        mapKey++;
        log.debug('REDUCE context',JSON.stringify(context));
        var objMapValue = JSON.parse(context.value);
        context.write("key_" + mapKey,objMapValue);
    }
   
    var reduce = function(context){
        /**
         * 5 point create new CIL and sumbit record
         * 5 pints submitField on Invoice
         * 10 points
         */
        log.debug('REDUCE context',JSON.stringify(context) );
        log.debug('REDUCE context type',typeof(context.values) );
        var arrError = [];
        var arrRedValues =  context.values;
        for(var i in arrRedValues){
            var objRedVal = arrRedValues[i];
            if(typeof objRedVal == 'string'){
                objRedVal = JSON.parse(objRedVal);
            }
            
            var arrMapVal = objRedVal;
            var intBufId = 0;
            for(var intInv = 0; intInv < arrMapVal.length; intInv++){
                var recInv = arrMapVal[intInv];

                log.debug('REDUCE',"#:" + intInv);
                log.debug('REDUCE',"arInv.type:" + typeof(recInv));
                log.debug('REDUCE',"arInv.string:" + JSON.stringify(recInv));
                
                
                var intInvId = recInv.id;
                intBufId = intInvId;
                log.debug('REDUCE',"intInvId:" + intInvId);
                
                var recCil = record.create({
                    type: HC_CIL_RECORD.ID,
                });
                
                recCil.setValue(HC_CIL_RECORD.FIELDS.CUSTRECORD_NSTS_CIL_INVOICE,intInvId);
                var intcilid = recCil.save();
                try{
                    record.submitFields({
                        type: 'invoice',
                        id: intInvId,
                        values: {
                            custbody_nsts_ci_link: intcilid
                        },
                        options: {
                            enablesourcing: true,
                            ignoreMandatoryFields:true
                        },
                        ignoreMandatoryFields: true
                    });
                }catch(e){
                    if(!isEmpty(intcilid)){
                        try{
                            record.delete({
                                type: HC_CIL_RECORD.ID,
                                id: intcilid
                            })
                        }catch(e2){}

                    }
                    arrError.push("invoice:" + intInvId + " - " + e.message);
                }
            }
            
            context.write(intBufId,{lastid: intBufId, trancount: arrMapVal.length});
        }

        if(!isEmpty(arrError)){
            throw Error(arrError.join("\n"));
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

        var OBJ_SCRIPT  = runtime.getCurrentScript();
        var intRerunCount = OBJ_SCRIPT.getParameter({name: 'custscript_nsts_rerun_count'});
        var inMaxDeployment = 150;

        
        intRerunCount = parseInt(intRerunCount);
        
        var intRunCnt = 0;
        if(intRerunCount > inMaxDeployment){
            intRunCnt = intRerunCount / inMaxDeployment;
            //intRunCnt = Math.ceil(intRunCnt);
            intRunCnt = 0;
        }
        
        var intLoopCount = (intRerunCount > 150)? 150: intRerunCount;
        
        /*log.debug("SUMMARIZE", "intRerunCount:" + intRerunCount + " intLoopCount:" + intLoopCount + " intRunCnt:" + intRunCnt);
        for(var i=1; i <= intLoopCount; i++){
            checkAndCreateRMTask({
                scriptid: 'customscript_nsts_mr_ci_generate_ci_link',
                maxCreateDeployment: intRerunCount,
                params: {
                    custscript_nsts_rerun_count: intRunCnt,
                }
            });

        }*/
        
        var stKeyId = 0;
        var intCnt = 0;
        summary.output.iterator().each(function (key, value){
            stKeyId = key;
            var objVal = value;
            if(typeof objVal == "string"){
                objVal = JSON.parse(objVal);
            }
            
            intCnt += parseInt(objVal.trancount);
            log.debug("SUMMARIZE Key:" + stKeyId, objVal);
            log.debug("SUMMARIZE Key:" + stKeyId, "intCnt:" + objVal.trancount + " objVal type:" + typeof objVal);
            return true;
        });
        
        log.debug("SUMMARIZE Key:" + stKeyId, intCnt);
        if(intCnt >= 1000){
            checkAndCreateRMTask({
                scriptid: 'customscript_nsts_mr_ci_generate_ci_link',
                params: {
                    custscript_nsts_rerun_count: 1,
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