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
 * (Module description here. Whole header length should not exceed 
 * 100 characters in width. Use another line if needed.)
 * 
 * Version    Date            Author           Remarks
 * 1.00       19 Jul 2016     Dennis Geronimo   Initial version.
 * 
 */

/**
* @NApiVersion 2.0
* @NScriptType usereventscript
*/
var HC_MODULES = ['N/record','N/search', 'N/runtime', 'N/task'];

define(HC_MODULES,function(record,search,runtime,task){
    
    function isEmpty(value){
        var bResult = false;            
        if (value == null || value == 'null' || value == undefined || value == '' || value == "" || value.length <= 0) { bResult = true; }
        return bResult;
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
    
    function ciBeforeSubmit(context){
        log.debug("CIBEFORESUBMIT","start");
        var newRecord           = context.newRecord;
        var bIsUpdateDueDate  = newRecord.getValue('custrecord_nsts_ci_tasl_updt_due_date');
        var bTriggerMR  = newRecord.getValue('custrecord_nsts_ci_trigger_mr_script');
        
        var intRMTask = newRecord.getValue('custrecord_nsts_ci_rm_task_id');
        
        
        var arrCI  = newRecord.getValue('custrecord_nsts_ci_numbers');
        
        newRecord.setValue('custrecord_nsts_ci_trigger_mr_script',false);
        log.debug('CIBEFORESUBMIT','bTriggerMR:' + bTriggerMR +  'BISUPDATEDUEDATE:' + bIsUpdateDueDate + ' arrCI:' + JSON.stringify(arrCI));

        var FUNC_TRIGGER_MAPRED = function(){
            if( bTriggerMR == true){
                /*var rmTask = checkAndCreateRMTask(intRMTask,{
                    custscript_nsts_rm_ci_upd_cirecord: arrCI,
                    custscript_nsts_rm_ci_upd_duedate: bIsUpdateDueDate,
                    custscript_nsts_rm_ci_task_id: newRecord.id
                    });*/
                
                var rmTask = checkAndCreateRMTask({
                    scriptid: 'customscript_nsts_mr_ci_update_cil',
                    params: {
                        custscript_nsts_rm_ci_upd_cirecord: arrCI,
                        custscript_nsts_rm_ci_upd_duedate: bIsUpdateDueDate,
                        custscript_nsts_rm_ci_task_id: newRecord.id
                   }
                });
                newRecord.setValue('custrecord_nsts_ci_rm_task_id',rmTask.mrTaskId);
                
            }
        };
        
        FUNC_TRIGGER_MAPRED();
    }
    
        
    return {
        beforeSubmit: ciBeforeSubmit,
        //afterSubmit : ciAfterSubmit
    }
});
