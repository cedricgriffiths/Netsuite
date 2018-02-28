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
 * 1.00       02 Mar 2016     pdeleon   Initial version.
 * 
 */

/** 
* A Function for Generic Beforeload User event
* if the type is Customer this function will add "Create Consolidated Invoices" button to allow CI on Customer screen
* if the type is CI Record/CI Tasks/CI Logs this function will set all field into inline text to restrict the user from 
* editing the field Value.
*/
function beforeLoad_CIProcessUserEvent(type, form, request)
{
    var context = nlapiGetContext();
    if(context.getExecutionContext()!='userinterface')
    {
        return;
    }
    
    var recordType = nlapiGetRecordType();
    log("debug", "customerScreenbeforeLoad", "recordType:" + recordType + " type:" + type + " ,form:");

    if (recordType == "customer")
    {
        if(type!='view')
        {
            return;
        }
        
        var arrCol = [new nlobjSearchColumn('custrecord_nsts_ci_customer_screen'),
                      new nlobjSearchColumn(FLD_CUSTRECORD_NSTS_CI_ENABLE_FOR),
                      new nlobjSearchColumn('custrecord_nsts_ci_enable_ci')];
        var arrRes = nlapiSearchRecord(RECTYPE_CUSTOMRECORD_NSTS_CI_SETUP,null,null,arrCol);
        
        var enableButton = false;        
        var ALL_CUST = 1;
        var SELECTED_CUST = 2;
                
        if(arrRes)
        {
            var bEnableCI = arrRes[0].getValue('custrecord_nsts_ci_enable_ci');
            var bEnableCustScreen = arrRes[0].getValue('custrecord_nsts_ci_customer_screen');
            var bExclude = nlapiGetFieldValue('custentity_nsts_ci_exclude_ci');
            
            if(bEnableCI=='T' && bEnableCustScreen=='T')
            {
                var stEnabledFor = arrRes[0].getValue(FLD_CUSTRECORD_NSTS_CI_ENABLE_FOR);
            
                if(stEnabledFor == ALL_CUST || (stEnabledFor==SELECTED_CUST && bExclude!='T'))
                {
                    enableButton = true;
                }
                
                var ciConfig = getCISetup();
                
                if(ciConfig.includeSubCustomers == "T"){
                    var stId = nlapiGetRecordId();
                    var stParent = nlapiLookupField("customer", stId, "parent");
                    if(stId != stParent)
                    {
                        enableButton = false;
                    }
                    
                }
                
            }
        }
        log("debug", "customerScreenbeforeLoad", "enableButton=" + enableButton);
        
        if(!enableButton)
        {
            return true;
        }
        

        if (type == "view")
        {
            var FLD_CUSTENTITY_NSTS_CI_DEFAULT_LAYOUT = "custentity_nsts_ci_default_layout";
            var stSuiteLet = nlapiResolveURL("suitelet", SCRIPTID_ONLINE, DEPLOYMENTID_ONLINE);
            var cId = nlapiGetRecordId();
            var stDefaultLayout = nlapiGetFieldValue(FLD_CUSTENTITY_NSTS_CI_DEFAULT_LAYOUT);
            var script = "<script type='text/javascript'>var OBJCICUSTOMERONSCREENWINDOW;{0}</script>".format(customerOnScreenCI.toString().replace(/\n/g, ""));

            stSuiteLet += "&custpage_customerscreen=T&custpage_customer=" + cId + "&custpage_defaultlayout=" + stDefaultLayout;

            form.addField("custpage_ci_scripts", "inlinehtml", "").setDefaultValue(script);
            form.addButton("custpage_process_ci", "Create Consolidated Invoices", "customerOnScreenCI('{0}')".format(stSuiteLet));
        }
    }
    
    if (recordType == RECTYPE_CUSTOMRECORDSS_NSTS_CI_CONSOLIDATE_INVOICE)
    {
        if (type == 'copy') { 
            throw nlapiCreateError("Error", "Copying CI record is not allowed.", true);
            return;
        }

        if (type == "view")
        {
            var stSuiteLet = nlapiResolveURL("suitelet", SCRIPTID_ONLINE, DEPLOYMENTID_ONLINE);
            var cusId = nlapiGetFieldValue("id");
            stSuiteLet += "&loadType=resendcommunication&type=email&ciId=" + cusId;
            var script = "<script type='text/javascript'>var OBJRESENDCOMMUNICATION;{0}</script>".format(resendCommunication.toString().replace(/\n/g, ""));
            form.addField("custpage_ci_scripts", "inlinehtml", "").setDefaultValue(script);

            form.addButton("custpage_send_email", "Send Email", "resendCommunication('{0}')".format(stSuiteLet));
        }
        

        if (!isEmpty(form))
        {
            form.getField(FLD_CUSTRECORD_NSTS_CI_CUSTOMER).setDisplayType("inline");
            form.getField(FLD_CUSTRECORD_NSTS_CI_SELECTED_INV).setDisplayType("inline");
            form.getField(FLD_CUSTRECORD_NSTS_CI_DATE).setDisplayType("inline");
            form.getField(FLD_CUSTRECORD_NSTS_CI_ISPROCESSED).setDisplayType("inline");
            form.getField(FLD_CUSTRECORD_NSTS_CI_PDFFILE).setDisplayType("inline");
            form.getField(FLD_CUSTRECORD_NSTS_CI_PREFERENCES).setDisplayType("inline");

            form.getField(FLD_CUSTRECORD_NSTS_CI_PREF_LOCATION).setDisplayType("inline");
            form.getField(FLD_CUSTRECORD_NSTS_CI_PREF_DUEDATE).setDisplayType("inline");
            form.getField(FLD_CUSTRECORD_NSTS_CI_PREF_CONTRACT).setDisplayType("inline");
            form.getField(FLD_CUSTRECORD_NSTS_CI_PREF_PROJECT).setDisplayType("inline");
            form.getField(FLD_CUSTRECORD_NSTS_CI_PREF_SOURCE).setDisplayType("inline");
            
            form.getField(FLD_CUSTRECORD_NSTS_CI_PDF_SUBTOTAL).setDisplayType("inline");
            form.getField(FLD_CUSTRECORD_NSTS_CI_PDF_ITEMTOTAL).setDisplayType("inline");
            form.getField(FLD_CUSTRECORD_NSTS_CI_PDF_DISCOUNT).setDisplayType("inline");
            form.getField(FLD_CUSTRECORD_NSTS_CI_PDF_TAX).setDisplayType("inline");
            form.getField(FLD_CUSTRECORD_NSTS_CI_PDF_SHIPPING_HANDLING).setDisplayType("inline");
            form.getField(FLD_CUSTRECORD_NSTS_CI_PDF_AMOUNTPAID).setDisplayType("inline");
            form.getField(FLD_CUSTRECORD_NSTS_CI_PDF_TOTAL_DUE).setDisplayType("inline");
            
            /* REMOVE - On Demand PDF 
            var stAllowDelete_devonly = context.getSetting("script","custscript_nsts_ci_allow_delete_dev_only");
            if(stAllowDelete_devonly== "T"){
                var url = nlapiResolveURL("suitelet", SCRIPTID_ONLINE, DEPLOYMENTID_ONLINE)
                url += "&loadType=generatepdf&ciID=" + nlapiGetRecordId();
                
                form.addField("custpage_ondemandpdflink", "url", "").setLinkText("On demand PDF(dev use Only)").setDefaultValue(url);
            }
            */
            
            var stAllowDelete_devonly = context.getSetting("script","custscript_nsts_ci_allow_delete_dev_only");
            if(stAllowDelete_devonly== "T"){
                var url = nlapiResolveURL("suitelet", SCRIPTID_ONLINE, DEPLOYMENTID_ONLINE)
                url += "&loadType=generatepdf&ciID=" + nlapiGetRecordId();
                
                form.addField("custpage_ondemandpdflink", "url", "").setLinkText("On demand PDF(dev use Only)").setDefaultValue(url);
            }
            
            form.getField("name").setDisplayType("inline");
        }
    }
    
    if (recordType == RECTYPE_CUSTOMRECORD_NSTS_CI_SETUP)
    {
        var objContext              = nlapiGetContext();
        var isProject               = objContext.getSetting("FEATURE", "jobs");
        var isConsolidateJob        = nlapiLoadConfiguration("accountingpreferences").getFieldValue("CONSOLINVOICES");
        isConsolidateJob            = (isEmpty(isConsolidateJob))? "F" : isConsolidateJob;
        isProject                   = (isProject == "T"  && isConsolidateJob == "F")? "T" : "F";
        var isLocation              = objContext.getSetting("FEATURE", "locations");
        var isConsolidatedPayment   = objContext.getSetting("FEATURE", "consolpayments");
        var isContract              = isContractFeatureEnabled();
        
        if(isEmpty(isProject) || isProject == "F")
        {
            form.getField(FLD_CUSTRECORD_NSTS_CI_PROJECT).setDisplayType("disabled").setDefaultValue("F");
            nlapiSetFieldValue(FLD_CUSTRECORD_NSTS_CI_PROJECT, "F");
        }
        
        if(isEmpty(isLocation) || isLocation == "F")
        {
            form.getField(FLD_CUSTRECORD_NSTS_CI_LOCATION).setDefaultValue("F");
            nlapiSetFieldValue(FLD_CUSTRECORD_NSTS_CI_LOCATION, "F");
            form.getField(FLD_CUSTRECORD_NSTS_CI_LOCATION).setDisplayType("disabled").setDefaultValue("F");
            
        }
        
        if(isEmpty(isConsolidatedPayment) || isConsolidatedPayment == "F")
        {
            form.getField(FLD_CUSTRECORD_NSTS_CI_INCLUDE_SUBCUST).setDefaultValue("F");
            nlapiSetFieldValue(FLD_CUSTRECORD_NSTS_CI_INCLUDE_SUBCUST, "F");
            form.getField(FLD_CUSTRECORD_NSTS_CI_INCLUDE_SUBCUST).setDisplayType("disabled");
        }
        
        if(!isContract)
        {
            nlapiSetFieldValue(FLD_CUSTRECORD_NSTS_CI_CONTRACT, "F");
            nlapiSetFieldValue(FLD_CUSTRECORD_NSTS_CI_CONTRACT, "F");
            form.getField(FLD_CUSTRECORD_NSTS_CI_CONTRACT).setDisplayType("disabled").setDefaultValue(null);
        }
    }
    
    
    if(recordType == RECTYPE_CUSTOMRECORD_NSTS_CI_TASK)
    {
        if (type == 'copy') { 
            throw nlapiCreateError("Error", "Copying CI Task is not allowed.", true);
            return;
        }
        
        if (!isEmpty(form))
        {
            form.getField(FLD_CUSTRECORD_NSTS_CI_TASK_TYPE).setDisplayType("inline");
            form.getField(FLD_CUSTRECORD_NSTS_CI_INITIATED_BY).setDisplayType("inline");
            form.getField(FLD_CUSTRECORD_NSTS_CI_TASK_START).setDisplayType("inline");
            form.getField(FLD_CUSTRECORD_NSTS_CI_TASK_ENDED).setDisplayType("inline");
            form.getField(FLD_CUSTRECORD_NSTS_CI_TASK_STATUS).setDisplayType("inline");
            form.getField(FLD_CUSTRECORD_NSTS_CI_ERROR_DETAILS).setDisplayType("inline");
            form.getField(FLD_CUSTRECORD_NSTS_CI_RECORDS).setDisplayType("disabled");
            form.getField(FLD_CUSTRECORD_NSTS_CI_RECORDS_CREATED).setDisplayType("inline");
            form.getField("name").setDisplayType("inline");
        }
    }
    
    if(recordType == RECTYPE_CUSTOMRECORD_NSTS_CI_LOG)
    {
        if (type == 'copy') { 
            throw nlapiCreateError("Error", "Copying CI Log is not allowed.", true);
            return;
        }
        
        if (!isEmpty(form))
        {
            form.getField(FLD_CUSTRECORD_NSTS_CI_TASK_ID).setDisplayType("inline");
            form.getField(FLD_CUSTRECORD_NSTS_CI_SCRIPT_NAME).setDisplayType("inline");
            form.getField(FLD_CUSTRECORD_NSTS_CI_LOG_MSG).setDisplayType("inline");
            //form.getField("name").setDisplayType("inline");
        }
    }

}


/**
 * This function is used to restrict the User from deleting the CI Record/CI Task/CI logs
 * If the type is CI Setup this function will prevent the creation of multiple CI Record and Deletion on CI Setup 
 * Record the CI Setup record should contain only one record
 * @param type
 */
function beforeSubmit_CIProssesUserEvent(type)
{   
    var context     = nlapiGetContext();
    
    if(context.getExecutionContext()!='userinterface')
    {
        return;
    }
    
    var stAllowDelete_devonly = context.getSetting("script","custscript_nsts_ci_allow_delete_dev_only");
    log("debug", "stAllowDelete_devonly", "stAllowDelete_devonly:" + stAllowDelete_devonly + " ,type:" + type);
    
    var recordType = nlapiGetRecordType();
    if (recordType == RECTYPE_CUSTOMRECORDSS_NSTS_CI_CONSOLIDATE_INVOICE)
    {
        if (nlapiGetFieldValue(FLD_CUSTRECORD_NSTS_CI_SAVED_IN_SERVERSIDE) == "F")
        {
            if (type == 'create')
            {
                throw nlapiCreateError("Error", "Creating a new CI record is not allowed.", true);
            }
        }
        
        /* REMOVE - Disable CI Delete
        if (type == "delete" || type == "xdelete" )
        {

            if (stAllowDelete_devonly == "F" || isEmpty(stAllowDelete_devonly))
            {
                throw nlapiCreateError("Error", "Deleting CI record is not allowed.", true);
                return;
            }
        }
        */
    }
    else if (recordType == RECTYPE_CUSTOMRECORD_NSTS_CI_SETUP)
    {
        var objContext          = nlapiGetContext();
        var isProject           = objContext.getSetting("FEATURE", "jobs");
        var isConsolidateJob    = nlapiLoadConfiguration("accountingpreferences").getFieldValue("CONSOLINVOICES");
        isProject               = (isProject == "T"  && isConsolidateJob == "F")? "T" : "F";
        var isLocation          = objContext.getSetting("FEATURE", "locations");
        var isContract          = isContractFeatureEnabled();
        var isConsolidatedPayment   = objContext.getSetting("FEATURE", "consolpayments");
        if(isEmpty(isConsolidatedPayment) || isConsolidatedPayment == "F"){
            nlapiSetFieldValue(FLD_CUSTRECORD_NSTS_CI_INCLUDE_SUBCUST, "F");
        }
        
        if(isEmpty(isProject) || isProject == "F"){
            nlapiSetFieldValue(FLD_CUSTRECORD_NSTS_CI_PROJECT, "F");
        }
        if(isEmpty(isLocation) || isLocation == "F"){
            nlapiSetFieldValue(FLD_CUSTRECORD_NSTS_CI_LOCATION, "F");
        }
        if(!isContract){
            nlapiSetFieldValue(FLD_CUSTRECORD_NSTS_CI_CONTRACT, "F");
        }
        
        if (type == 'create')
        {
            var res = nlapiSearchRecord(RECTYPE_CUSTOMRECORD_NSTS_CI_SETUP);

            if (res) { 
                throw nlapiCreateError("Error", "Creating a new CI-Setup record is not allowed.", true); 
            }
        }

        if (type == 'delete' || type == 'xdelete') { 
            throw nlapiCreateError("Error", "Deleting CI-Setup custom record is not allowed.", true);
        }
    }
    else if(recordType == RECTYPE_CUSTOMRECORD_NSTS_CI_LAYOUT)
    {
        log("DEBUG", "beforeSubmit_CIProssesUserEvent", "Type:" + RECTYPE_CUSTOMRECORD_NSTS_CI_LAYOUT);

        var stLayoutFileId  = nlapiGetFieldValue(FLD_CUSTRECORD_NSTS_CI_PDF_TEMPLATE_FILE);
        var objTemplateFile = nlapiLoadFile(stLayoutFileId);
        var stTemplateXML   = objTemplateFile.getValue();
        
        if(stTemplateXML.toLocaleLowerCase().indexOf("<pdf>") < 0 || stTemplateXML.toLocaleLowerCase().indexOf("</pdf>") < 0)
        {
            log("ERROR", "beforeSubmit_CIProssesUserEvent", "ERROR xml:");
            throw nlapiCreateError("ERROR", "Invalid Template File");
        }
    }
    
    if(recordType == RECTYPE_CUSTOMRECORD_NSTS_CI_TASK)
    {
        if (type == 'create' && context.getExecutionContext()=='userinterface') {
            throw nlapiCreateError("ERROR", "Creating CI Tasks are not allowed");
        }
        if (stAllowDelete_devonly == "F" || isEmpty(stAllowDelete_devonly))
        {
            if (type == 'delete' || type == 'xdelete') { throw nlapiCreateError("Error", "Deleting CI Task record is not allowed.", true); }
        }
    }
    
    if(recordType == RECTYPE_CUSTOMRECORD_NSTS_CI_LOG)
    {
        if (type == 'create' && context.getExecutionContext()=='userinterface') {
            throw nlapiCreateError("ERROR", "Creating CI Logs are not allowed");
        }
        if (type == 'delete' || type == 'xdelete') { 
            throw nlapiCreateError("Error", "Deleting CI Log is not allowed.", true);
        }
    }
}
