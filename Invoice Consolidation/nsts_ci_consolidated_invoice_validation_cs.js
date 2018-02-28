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
* 
* @author Dennis Geronimo
* @version 1.00 15 Dec 2014 dgeronimo:  Initial version. 
* 
*/

var OBJCIDETAILWINDOW = null;

function pageInit_CIDefaulting(type)
{
    if (CURRECTYPE == RECTYPE_CUSTOMRECORD_NSTS_CI_SETUP)
    {
        fieldChanged_ConfigureCISetFields(type, FLD_CUSTRECORD_NSTS_CI_ENABLE_CI, 0);
        fieldChanged_ConfigureCISetFields(type, FLD_CUSTRECORD_NSTS_CI_SCHEDULE, 0);
        fieldChanged_ConfigureCISetFields(type, FLD_CUSTRECORD_NSTS_CI_EMAIL_ATTACHMENT, 0);
        fieldChanged_ConfigureCISetFields(type, FLD_CUSTRECORD_NSTS_CI_FAX_ATTACHMENT, 0);
    }
    else if (CURRECTYPE == RECTYPE_CUSTOMRECORD_SS_CI_CONSOLIDATE_INVOICE)
    {
        nlapiDisableField(FLD_CUSTRECORD_SS_CI_CUSTOMER, true);
        nlapiDisableField(FLD_CUSTRECORD_SS_CI_SELECTED_INV, true);
        nlapiDisableField(FLD_CUSTRECORD_SS_CI_NUMBER, true);
        nlapiDisableField(FLD_CUSTRECORD_SS_CI_PDF_URL, true);
        nlapiDisableField(FLD_CUSTRECORD_NSTS_CI_DATE, true);
        nlapiDisableField(FLD_CUSTRECORD_NSTS_CI_ISPROCESSED, true);

        nlapiDisableField("name", true);
        
    }
    else if(CURRECTYPE == "customer")
    {
        fieldChanged_ConfigureCISetFields(type, FLD_CUSTENTITY_NSTS_CI_EMAIL_ATTACHMENT, 0);
        fieldChanged_ConfigureCISetFields(type, FLD_CUSTENTITY_NSTS_CI_FAX_ATTACHMENT, 0);
    }
    
    return true;
}


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
* This function is used to configure, enabling or disabling of fields, the CI-Setup fields based on user preference / input
* 
* @author Dennis Geronimo
* @version 1.00 15 Dec 2014 dgeronimo:  Initial version. 
* 
*/
function fieldChanged_ConfigureCISetFields(type, name, linenum)
{
    if (CURRECTYPE == RECTYPE_CUSTOMRECORD_NSTS_CI_SETUP)
    {
        if (name == FLD_CUSTRECORD_NSTS_CI_ENABLE_CI)
        {
            var st_ciEnable = nlapiGetFieldValue(name);
            if (st_ciEnable == "T")
            {
                nlapiDisableField(FLD_CUSTRECORD_NSTS_CI_ENABLE_FOR, false);
                nlapiSetFieldMandatory(FLD_CUSTRECORD_NSTS_CI_ENABLE_FOR, true);
                
                nlapiDisableField(FLD_CUSTRECORD_NSTS_CI_CREATE_ONLINE, false);
                nlapiDisableField(FLD_CUSTRECORD_NSTS_CI_SCHEDULE, false);
                nlapiDisableField(FLD_CUSTRECORD_NSTS_CI_CUSTOMER_SCREEN, false);
            }
            else
            {
                nlapiSetFieldValue(FLD_CUSTRECORD_NSTS_CI_CREATE_ONLINE,'F',false,true);
                nlapiSetFieldValue(FLD_CUSTRECORD_NSTS_CI_SCHEDULE,'F',false,true);
                nlapiSetFieldValue(FLD_CUSTRECORD_NSTS_CI_CUSTOMER_SCREEN,'F',false,true);
                
                nlapiDisableField(FLD_CUSTRECORD_NSTS_CI_ENABLE_FOR, true);
                nlapiSetFieldMandatory(FLD_CUSTRECORD_NSTS_CI_ENABLE_FOR, false);

                nlapiDisableField(FLD_CUSTRECORD_NSTS_CI_CREATE_ONLINE, true);
                nlapiDisableField(FLD_CUSTRECORD_NSTS_CI_SCHEDULE, true);
                nlapiDisableField(FLD_CUSTRECORD_NSTS_CI_CUSTOMER_SCREEN, true);
            }

        }
        else if (name == FLD_CUSTRECORD_NSTS_CI_EMAIL_ATTACHMENT)
        {
            if (nlapiGetFieldValue(name) == "T")
            {
                nlapiSetFieldMandatory(FLD_CUSTRECORD_NSTS_CI_EMAIL_TEMPLATE, true);
                nlapiDisableField(FLD_CUSTRECORD_NSTS_CI_EMAIL_TEMPLATE, false);
                nlapiSetFieldMandatory(FLD_CUSTRECORD_NSTS_CI_EMAIL_SENDER, true);
                nlapiDisableField(FLD_CUSTRECORD_NSTS_CI_EMAIL_SENDER, false);
                nlapiDisableField(FLD_CUSTRECORD_NSTS_CI_CONTACT_CATEGORY, false);

            }
            else
            {
                nlapiSetFieldMandatory(FLD_CUSTRECORD_NSTS_CI_EMAIL_TEMPLATE, false);
                nlapiDisableField(FLD_CUSTRECORD_NSTS_CI_EMAIL_TEMPLATE, true);
                nlapiSetFieldMandatory(FLD_CUSTRECORD_NSTS_CI_EMAIL_SENDER, false);
                nlapiDisableField(FLD_CUSTRECORD_NSTS_CI_EMAIL_SENDER, true);
                nlapiDisableField(FLD_CUSTRECORD_NSTS_CI_CONTACT_CATEGORY, true);
            }
        }
        else if (name == FLD_CUSTRECORD_NSTS_CI_FAX_ATTACHMENT)
        {
            if (nlapiGetFieldValue(name) == "T")
            {
                nlapiSetFieldMandatory(FLD_CUSTRECORD_NSTS_CI_FAX_SENDER, true);
                nlapiDisableField(FLD_CUSTRECORD_NSTS_CI_FAX_SENDER, false);
                nlapiSetFieldMandatory(FLD_CUSTRECORD_NSTS_CI_FAX_TEMPLATE, true);
                nlapiDisableField(FLD_CUSTRECORD_NSTS_CI_FAX_TEMPLATE, false);
            }
            else
            {
                nlapiSetFieldMandatory(FLD_CUSTRECORD_NSTS_CI_FAX_SENDER, false);
                nlapiDisableField(FLD_CUSTRECORD_NSTS_CI_FAX_SENDER, true);
                nlapiSetFieldMandatory(FLD_CUSTRECORD_NSTS_CI_FAX_TEMPLATE, false);
                nlapiDisableField(FLD_CUSTRECORD_NSTS_CI_FAX_TEMPLATE, true);
            }
        }
        
        
        //==============
        if(name == FLD_CUSTRECORD_NSTS_CI_MAX_NO){
            var _max_no = parseInt(nlapiGetFieldValue(FLD_CUSTRECORD_NSTS_CI_MAX_NO));
            var _min_no = parseInt(nlapiGetFieldValue(FLD_CUSTRECORD_NSTS_CI_MIN_NO));
            _max_no = (_max_no)? _max_no : 0;
            _min_no = (_min_no)? _min_no : 0;
            
            if (_max_no < _min_no){
                var stlbl = nlapiGetField(FLD_CUSTRECORD_NSTS_CI_MAX_NO).getLabel()
                alert(stlbl + " should be Greater Than or Equal to " + _min_no);
                nlapiSetFieldValue(FLD_CUSTRECORD_NSTS_CI_MAX_NO, _min_no);
                return false;
            }
        }

        if(name == FLD_CUSTRECORD_NSTS_CI_MIN_NO){
            var _max_no = parseInt(nlapiGetFieldValue(FLD_CUSTRECORD_NSTS_CI_MAX_NO));
            var _min_no = parseInt(nlapiGetFieldValue(FLD_CUSTRECORD_NSTS_CI_MIN_NO));
            _max_no = (_max_no)? _max_no : 0;
            _min_no = (_min_no)? _min_no : 0;
            
            if (_min_no > _max_no ){
                var stlbl = nlapiGetField(FLD_CUSTRECORD_NSTS_CI_MIN_NO).getLabel()
                if(_max_no > 0)
                {
                    alert(stlbl + " should be Less Than or Equal to " + _max_no);
                    nlapiSetFieldValue(FLD_CUSTRECORD_NSTS_CI_MIN_NO, _max_no);
                }
                
                return false;
            }
            
        }
        //==============
        
    }
    else if (CURRECTYPE == "customer")
    {
        if(name == FLD_CUSTENTITY_NSTS_CI_EMAIL_ATTACHMENT)
        {
            if (nlapiGetFieldValue(name) == "T")
            {
                nlapiSetFieldMandatory(FLD_CUSTENTITY_NSTS_CI_EMAIL_TEMPLATE, true);
                nlapiSetFieldMandatory(FLD_CUSTENTITY_NSTS_CI_EMAIL_SENDER, true);
                nlapiDisableField(FLD_CUSTENTITY_NSTS_CI_EMAIL_TEMPLATE, false);
                nlapiDisableField(FLD_CUSTENTITY_NSTS_CI_EMAIL_SENDER, false);
            }
            else
            {
                nlapiSetFieldMandatory(FLD_CUSTENTITY_NSTS_CI_EMAIL_TEMPLATE, false);
                nlapiSetFieldMandatory(FLD_CUSTENTITY_NSTS_CI_EMAIL_SENDER, false);
                nlapiDisableField(FLD_CUSTENTITY_NSTS_CI_EMAIL_TEMPLATE, true);
                nlapiDisableField(FLD_CUSTENTITY_NSTS_CI_EMAIL_SENDER, true);
                nlapiSetFieldValue(FLD_CUSTENTITY_NSTS_CI_EMAIL_TEMPLATE, "");
            }
        }
        else if(name == FLD_CUSTENTITY_NSTS_CI_FAX_ATTACHMENT)
        {
            if (nlapiGetFieldValue(name) == "T")
            {
                nlapiSetFieldMandatory(FLD_CUSTENTITY_NSTS_CI_FAX_TEMPLATE, true);
                nlapiSetFieldMandatory(FLD_CUSTENTITY_NSTS_CI_FAX_SENDER, true);
                nlapiDisableField(FLD_CUSTENTITY_NSTS_CI_FAX_TEMPLATE, false);
                nlapiDisableField(FLD_CUSTENTITY_NSTS_CI_FAX_SENDER, false);
            }
            else
            {
                nlapiSetFieldMandatory(FLD_CUSTENTITY_NSTS_CI_FAX_TEMPLATE, false);
                nlapiSetFieldMandatory(FLD_CUSTENTITY_NSTS_CI_FAX_SENDER, false);
                nlapiDisableField(FLD_CUSTENTITY_NSTS_CI_FAX_TEMPLATE, true);
                nlapiDisableField(FLD_CUSTENTITY_NSTS_CI_FAX_SENDER, true);
                nlapiSetFieldValue(FLD_CUSTENTITY_NSTS_CI_FAX_TEMPLATE, "");
            }
        }
    }
    else if(CURRECTYPE == "customerpayment")
    {
        
        if(name == "CUSTBODY_NSTS_CI_NUMBER")
        {
            var stCInumber = nlapiGetFieldValue(name);
            nlapiSetFieldValue("custbody_nsts_ci_number_custpayment", stCInumber);
        }
    }
    return true;
}


/**
* Copyright (c) 1998-2015 NetSuite, Inc.
* 2955 Campus Drive, Suite 100, San Mateo, CA, USA 94403-2511
* All Rights Reserved.
* 
* This software is the confidential and proprietary information of
* NetSuite, Inc. ("Confidential Information"). You shall not
* disclose such Confidential Information and shall use it only in
* accordance with the terms of the license agreement you entered into
* with NetSuite.
* 
* This function is used to validate the CI-Setup if the entries are correct
* 
* @author Dennis Geronimo
* @version 1.00 15 Dec 2014 dgeronimo:  Initial version. 
* 
*/
function saveRecord_ValidateCISetup()
{
    var intErrCount = 0;
    var stError = "";
    if (CURRECTYPE == RECTYPE_CUSTOMRECORD_NSTS_CI_SETUP)
    {
        var bIsMandatory = false;
        var bIsMandatoryEmpty = false;
        
        var stIsCIEnable = nlapiGetFieldValue(FLD_CUSTRECORD_NSTS_CI_ENABLE_CI);
        if (stIsCIEnable == "F") { return true; }
        
        var stCIOnline      = nlapiGetFieldValue(FLD_CUSTRECORD_NSTS_CI_CREATE_ONLINE);
        var stCISched       = nlapiGetFieldValue(FLD_CUSTRECORD_NSTS_CI_SCHEDULE);
        var stCICustScreen  = nlapiGetFieldValue(FLD_CUSTRECORD_NSTS_CI_CUSTOMER_SCREEN);
        
        var stEnableFor = nlapiGetFieldValue(FLD_CUSTRECORD_NSTS_CI_ENABLE_FOR);
        if(isEmpty(stEnableFor))
        {
            var stlblEnableFor = nlapiGetField(FLD_CUSTRECORD_NSTS_CI_ENABLE_FOR).getLabel();
            
            intErrCount++;
            stError += "-" + stlblEnableFor + " is Required.\n";
        }
        
        if (stCIOnline == "F" && stCISched == "F" && stCICustScreen == "F")
        {
            intErrCount++;
            stError += "-At least one of the following should be enabled:\n" + "\t- Enable Online Consolidation\n" + "\t- Enable Scheduled Consolidation\n" + "\t- Enable Consolidation on Customer Screen.\n\n";
        }
        
        var _max_no = parseInt(nlapiGetFieldValue(FLD_CUSTRECORD_NSTS_CI_MAX_NO));
        var _min_no = parseInt(nlapiGetFieldValue(FLD_CUSTRECORD_NSTS_CI_MIN_NO));
        _max_no = (_max_no) ? _max_no : 0;
        _min_no = (_min_no) ? _min_no : 0;

        if (_max_no < _min_no)
        {
            var stlblMax = nlapiGetField(FLD_CUSTRECORD_NSTS_CI_MAX_NO).getLabel();
            var stlblMin = nlapiGetField(FLD_CUSTRECORD_NSTS_CI_MIN_NO).getLabel();
            intErrCount++;
            stError += "-" + stlblMax + " should be Greater Than or Equal to " + stlblMin + ".\n";
        }
        
        if (nlapiGetFieldValue(FLD_CUSTRECORD_NSTS_CI_EMAIL_ATTACHMENT) == "T")
        {
            var stEmailSender = nlapiGetFieldValue(FLD_CUSTRECORD_NSTS_CI_EMAIL_SENDER);
            var stEmailTemplate = nlapiGetFieldValue(FLD_CUSTRECORD_NSTS_CI_EMAIL_TEMPLATE);
            var stLblEmail = nlapiGetField(FLD_CUSTRECORD_NSTS_CI_EMAIL_ATTACHMENT).getLabel();
            if (isEmpty(stEmailSender))
            {
                intErrCount++;
                stError += "-Email Sender is Required.\n";
            }
            if (isEmpty(stEmailTemplate))
            {
                intErrCount++;
                stError += "-Email Template is Required.\n";
            }
        }
        
        if (nlapiGetFieldValue(FLD_CUSTRECORD_NSTS_CI_FAX_ATTACHMENT) == "T")
        {
            var stFaxSender = nlapiGetFieldValue(FLD_CUSTRECORD_NSTS_CI_FAX_SENDER);
            var stFaxTemplate = nlapiGetFieldValue(FLD_CUSTRECORD_NSTS_CI_FAX_TEMPLATE);
            var stLblFax = nlapiGetField(FLD_CUSTRECORD_NSTS_CI_FAX_ATTACHMENT).getLabel();
            if (isEmpty(stFaxSender))
            {
                intErrCount++;
                stError += "-Fax Sender is Required.\n";
            }
            if (isEmpty(stFaxTemplate))
            {
                intErrCount++;
                stError += "-Fax Template is Required.\n";
            }
        }

        var isPDFToFileCabFolder = nlapiGetFieldValue(FLD_CUSTRECORD_NSTS_CI_AS_FILE_IN_FOLDER);
        if (isEmpty(isPDFToFileCabFolder))
        {
            intErrCount++;
            stError += "-folder in File Cabinet is Required.\n";
        }else{
            var arrFilters=[];
            arrFilters.push(new nlobjSearchFilter("internalid",null,"is",isPDFToFileCabFolder))

            var resultFolders = nlapiSearchRecord("folder",null,arrFilters);
            if(isEmpty(resultFolders)){
                intErrCount++;
                stError += "-Folder in File Cabinet does not exist.\n";
            }
        }
    }
    else if (CURRECTYPE == "customer")
    {
        if(nlapiGetFieldValue(FLD_CUSTENTITY_NSTS_CI_EMAIL_ATTACHMENT) == "T")
        {
            if(isEmpty(nlapiGetFieldValue(FLD_CUSTENTITY_NSTS_CI_EMAIL_TEMPLATE)))
            {
                intErrCount++;
                stError += "CI Email Template Is Required.\n";
            }
            
            
            if (isEmpty(nlapiGetFieldValue(FLD_CUSTENTITY_NSTS_CI_EMAIL_SENDER)))
            {
                intErrCount++;
                stError += "-Email Sender is Required.\n";
            }
        }
        
        if(nlapiGetFieldValue(FLD_CUSTENTITY_NSTS_CI_FAX_ATTACHMENT) == "T")
        {
            if(isEmpty(nlapiGetFieldValue(FLD_CUSTENTITY_NSTS_CI_FAX_TEMPLATE)))
            {
                intErrCount++;
                stError += "CI Fax Template Is Required.\n";
            }
            
            if (isEmpty(nlapiGetFieldValue(FLD_CUSTENTITY_NSTS_CI_FAX_SENDER)))
            {
                intErrCount++;
                stError += "-Fax Sender is Required.\n";
            }
        }
    }
    
    if (intErrCount > 0)
    {
        alert(stError);
        return false
    }
    
    return true;
}

/*
* ====================================================================
* SUITELET CLIENT SIDE FUNCTION
* ====================================================================
*/

var ciConfig = null;
function pageInit_ci_Pageload(type){
    ciConfig = getCISetup(true);
    
    var intLineCnt =  nlapiGetLineItemCount(SUBLIST_CUSTPAGE_CI_INVOICES);
    for(var ii=1; ii <= intLineCnt;ii++){
        jQuery("#link_tranid_" + ii).click(function(){
            var rel = jQuery(this).attr('rel');
            var stline =  jQuery(this).attr('id');
            stline = stline.replace('link_tranid_','');
            showDetails(rel,stline);
        });
    }
}

function fieldChanged_SetPageNos(type, name, linenum)
{
    console.log("type:" + type + " name:" + name + " linenum:" + linenum);
    var stCustomerFldId = nlapiGetFieldValue(FLD_CUSTPAGE_ENTITY);

    if (type == SUBLIST_CUSTPAGE_CI_INVOICES)
    {
        var select_ci = nlapiGetFieldValue(FLD_CUSTPAGE_SELECTED_CI);
        var arrPageVals = isEmpty(select_ci) ? [] : JSON.parse(select_ci);
        var isSelected = nlapiGetLineItemValue(type, FLD_SELECTINVOICE, linenum);
        var objPageValue = {
            customerid : nlapiGetLineItemValue(type, stCustomerFldId, linenum) ,
            data : nlapiGetLineItemValue(type, FLD_SELECTINVOICEDATA, linenum) ,
        }
        var isExist = false;
        var index = -1
        for (var i = 0; i < arrPageVals.length; i++)
        {
            var obj = arrPageVals[i];
            if (obj.customerid == objPageValue.customerid && obj.data == objPageValue.data)
            {
                isExist = true;
                index = i;
            }
        }

        if (!isExist)
        {
            if (isSelected == "T")
            {
                arrPageVals.push(objPageValue);
            }
        }
        else
        {
            if (isSelected == "F")
            {
                arrPageVals.splice(index, 1);
                //alert(isSelected + " : " + index);
            }
        }
        nlapiSetFieldValue(FLD_CUSTPAGE_SELECTED_CI, JSON.stringify(arrPageVals));
    }
    
    if(name == FLD_CUSTPAGE_CIDATE_FLAG){
        var stCIDateFlag = nlapiGetFieldValue(name);
        if(stCIDateFlag == "2"){
            nlapiDisableField(FLD_CUSTPAGE_CIDATE, false);
            nlapiSetFieldMandatory(FLD_CUSTPAGE_CIDATE ,true);
        }else{
            nlapiDisableField(FLD_CUSTPAGE_CIDATE, true);
            nlapiSetFieldMandatory(FLD_CUSTPAGE_CIDATE ,true);
        }
    }
    
    var arrExcludeList = ["selectinvoice",FLD_CUSTPAGE_CIDATE_FLAG,FLD_CUSTPAGE_CIDATE,'custpage_update_duedate'];
    if(arrExcludeList.indexOf(name) < 0){
        nlapiDisableField("submitter", true);
        nlapiDisableField("secondarysubmitter", true);
        jQuery("#tr_secondarysubmitter").attr("class","pgBntG pgBntBDis")
        
    }
}

function validateField_ci_OnlineScreen(type,name,linenum)
{
    if(name == FLD_CUSTPAGE_CUSTOMER)
    {
        if(isEmpty(ciConfig)){
            return true;
        }
        
        if(ciConfig.includeSubCustomers == "T")
        {
            var stValue = nlapiGetFieldValue(name);
            if(isEmpty(stValue) == true || stValue == -1 || stValue == "-1")
            {
                return true;
            }
            var stResult =  nlapiLookupField("customer", stValue, "parent");
            if(stResult != stValue)
            { 
                alert("Include Sub Customers option is enabled,\nTop level parent will be selected.");
                nlapiSetFieldValue(name, stResult, false);
                return true;
            }
        }
        
    }
    return true;
}

function saveRecord_ValidateHasSelection()
{
    
    var loadType = nlapiGetFieldValue("custpage_loadtype");
    if(loadType == "search"){
        return true;
    }
    
    var errCount = 0;
    var errMessage = "";
    var stCIDateFlag = nlapiGetFieldValue(FLD_CUSTPAGE_CIDATE_FLAG);
    if(stCIDateFlag == "2"){
        var cDate = nlapiGetFieldValue(FLD_CUSTPAGE_CIDATE);
        if(isEmpty(cDate))
        {
            errMessage += "-Specific Date is Required\n";
            errCount++;
        }
    }
    
    var count = nlapiGetLineItemCount(SUBLIST_CUSTPAGE_CI_INVOICES);
    var hasSelection = false;
    
    for(var i=1; i<=count; i++)
    {
        var isSelected = nlapiGetLineItemValue(SUBLIST_CUSTPAGE_CI_INVOICES,FLD_SELECTINVOICE,i);
        
        if(isSelected=='T')
        {
            hasSelection = true;
            break;
        }
    }
    
    if(!hasSelection)
    {
        errCount++
        errMessage+='-Please select customer to consolidate\n';
    }
    
    if(errCount>0)
    {
        alert(errMessage);
        return false;
    }
    //SET the selected Invoices

    
    return true;
}




function markAll()
{
    var lns = nlapiGetLineItemCount(SUBLIST_CUSTPAGE_CI_INVOICES);
    for (var i = 1; i <= lns; i++)
    {
        nlapiSetLineItemValue(SUBLIST_CUSTPAGE_CI_INVOICES, 'selectinvoice', i, 'T');
        fieldChanged_SetPageNos(SUBLIST_CUSTPAGE_CI_INVOICES,"selectinvoice",i);
    }
}

function unmarkAll()
{
    var lns = nlapiGetLineItemCount(SUBLIST_CUSTPAGE_CI_INVOICES);
    for (var i = 1; i <= lns; i++)
    {
        nlapiSetLineItemValue(SUBLIST_CUSTPAGE_CI_INVOICES, 'selectinvoice', i, 'F');
        fieldChanged_SetPageNos(SUBLIST_CUSTPAGE_CI_INVOICES,"selectinvoice",i);
    }
}

function linkMouseover(name, id, event)
{
    var win = (typeof parent.getExtTooltip != 'undefined' && parent.getExtTooltip) ? parent : window;
    if (typeof win.getExtTooltip != 'undefined') var tip = win.getExtTooltip(name, 'invoice', 'DEFAULT_TEMPLATE', id, null);
    if (tip != undefined) tip.onTargetOver(event);
}

function showDetails(url, line){
    
    if (OBJCIDETAILWINDOW) OBJCIDETAILWINDOW.closed;
    var selectedinvoices = nlapiGetLineItemValue(SUBLIST_CUSTPAGE_CI_INVOICES, "selectedinvoices", line);
    var data = nlapiGetLineItemValue(SUBLIST_CUSTPAGE_CI_INVOICES, FLD_SELECTINVOICEDATA, line);
    data = encodeURIComponent(data);
    url = url + '&selectedinvoices=' + selectedinvoices + "&data=" + data;
    OBJCIDETAILWINDOW = window.open(url, "Consolidate Customer Invoices Detailed", "height=" + (screen.height - 250) + ",width=" + (screen.width - 200) + ",scrollbars=1");
    OBJCIDETAILWINDOW.focus();
    
}

function selectInvoices(line, value)
{
    var stSelected = "F";
    if (!isEmpty(value))
    {
        stSelected = "T";
    }
    nlapiSetLineItemValue(SUBLIST_CUSTPAGE_CI_INVOICES, "selectinvoice", line, stSelected);
    nlapiSetLineItemValue(SUBLIST_CUSTPAGE_CI_INVOICES, "selectedinvoices", line, value.join(','));
    nlapiSetLineItemValue(SUBLIST_CUSTPAGE_CI_INVOICES, "_selectedinvoices", line, value.length);
    jQuery("input[name^='_selectedinvoices']").attr('disabled', 'disabled');
}

function disabledFieldSelectedData()
{
    var tmout = setTimeout(function()
    {
        jQuery("input[name^='_selectedinvoices'] ").attr('disabled', 'disabled');
        clearTimeout(tmout);
    }, 50);
}

function setSelectInvoices()
{
    var SUBLIST = 'custpage_ci_invoices_detail';
    var stLine = nlapiGetFieldValue("custpage_invoice_line");
    var stSelectedValue = [];
    var lns = nlapiGetLineItemCount(SUBLIST);
    for (var i = 1; i <= lns; i++)
    {
        var isSelected = nlapiGetLineItemValue(SUBLIST, 'selectinvoice', i);
        if (isSelected == "T")
        {
            stSelectedValue.push(nlapiGetLineItemValue(SUBLIST, intInvoiceId, i));
        }
    }
    window.ischanged = false;
    window.opener.selectInvoices(stLine, stSelectedValue);
    window.close();
}

function replaceQueryString(url, param, value)
{
    var re = new RegExp("([?|&])" + param + "=.*?(&|$)", "i");
    if (url.match(re)) return url.replace(re, '$1' + param + "=" + value + '$2');
    else return url + '&' + param + "=" + value;
}

function filterCI(url)
{
    nlapiSetFieldValue("custpage_page", 0); 
    nlapiSetFieldValue("custpage_loadtype","search");
    window.ischanged = false;
    var isOneWorld = nlapiGetContext().getFeature("SUBSIDIARIES");
    var arrErr = []
    if(isEmpty(nlapiGetFieldValue('custpage_subsidiary')) && isOneWorld == true){
    	arrErr.push("Subsidiary is Required");
    }
    
    if(isEmpty(nlapiGetFieldValue('custpage_asofdate'))){
        arrErr.push("Invoice Cut-off Date is Required");

    }
    if(!isEmpty(arrErr)){
        alert(arrErr.join('\n'));
        return
    }
    
    url = url + "&loadType=search";
    document.forms[0].action = url;
    document.forms[0].submit();

}

function gotoPage(page)
{
    var url = nlapiResolveURL("suitelet", SCRIPTID_ONLINE, DEPLOYMENTID_ONLINE);
    nlapiSetFieldValue("custpage_page", page);  
    url = url + "&loadType=search";
    window.ischanged = false;
    
    document.forms[0].action = url;
    document.forms[0].submit();
}

/*
 * ====================================================================
 * END SUITELET CLIENT SIDE FUNCTION
 * ====================================================================
 */
