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
 * Suitelet : NSTS | CI Online Consolidation SL
 * this function is for the Suitelet Script the porpose of this is to generated the
 * CI Online Screen and the detailed screen
 * @param request nlobjRequest
 * @param response nlobjResponse
 */
function suitelet_OnlineConsolidation(request, response)
{
    var stLogTitle = "SUITELET_ONLINECONSOLIDATION";
    log("DEBUG", stLogTitle, "Start");
    var objContext = nlapiGetContext();
    
    var isSecondLoad   = request.getParameter("custpage_issecondload"); 
    var loadType       = request.getParameter("loadType");
    var customer       = request.getParameter("custpage_customer");
    var location       = request.getParameter("custpage_location");
    var billaddress    = request.getParameter("custpage_billaddress");
    var dueDate        = request.getParameter("custpage_duedate");
    var contract       = request.getParameter("custpage_contract");
    var project        = request.getParameter("custpage_project");
    var asofdate       = request.getParameter("custpage_asofdate");
    var currency       = request.getParameter("custpage_currency");
    var source         = request.getParameter("custpage_source");
    var defaultlayout  = request.getParameter("custpage_defaultlayout");
    var subsidiary     = request.getParameter("custpage_subsidiary");
    var customerscreen = request.getParameter("custpage_customerscreen");   
    var customFilters  = request.getParameter("customfilters");
    var selectedci     = request.getParameter(FLD_CUSTPAGE_SELECTED_CI);
        selectedci     = isEmpty(selectedci)? "" : selectedci;
    
    var arrPageValues = isEmpty(selectedci) ? [] : JSON.parse(selectedci);
    
    var page = request.getParameter("custpage_page");
        page = isEmpty(page) ? 0 : parseInt(page);
        page = page ? page : 0;
    
    asofdate = (isEmpty(asofdate))? nlapiDateToString(new Date()) : asofdate;
    
    currency = isEmpty(currency)? "" : currency;
    
    if(isEmpty(isSecondLoad))
    {
        var companyInfo = nlapiLoadConfiguration('companyinformation');
        currency = companyInfo.getFieldValue("basecurrency");       
    }
    
    
    subsidiary = isEmpty(subsidiary)? objContext.getSubsidiary(): subsidiary
    
    var objCIconfig = getCISetup();
    customFilters = new Array();
    for ( var param in request.getAllParameters())
    {
        if (param.indexOf("custpage_custfilter_") == 0)
        {
            
            var _cstFilter = param.replace("custpage_custfilter_", "");
            var _cstFilter2 = _cstFilter.replace(/_display$/g,"");
            _cstFilter2 = _cstFilter2.replace(/_labels/g,"");
             
            if(_cstFilter == _cstFilter2){
                var arrFieldname = _cstFilter.split('_');
                arrFieldname = arrFieldname.splice(0,arrFieldname.length-1);
                
                _cstFilter = arrFieldname.join("_")
                
                var stType = '';
                var stCustFieldVal = '';

                for(var ii = 0;ii < objCIconfig.arrCustomFilter.length;ii++){
                    var objFilter = objCIconfig.arrCustomFilter[ii];
                    objFilter.type = isEmpty(objFilter.type)? "" : objFilter.type.toLocaleLowerCase();
                    if(objFilter.id == _cstFilter){
                        stType = objFilter.type;
                    }
                }
                
                if(stType == 'multiselect'){
                    stCustFieldVal = request.getParameterValues(param)
                }else{
                    stCustFieldVal = request.getParameter(param);
                }
                
                log('debug', stLogTitle,"param=" + param + " stType=" + stType + " request.getParameter(param)=" + request.getParameter(param)) ;
                customFilters.push({
                    field : _cstFilter ,
                    value : stCustFieldVal,
                    type : stType
                });
            }
            
        }
    }
    
    var objCIFilters = {
        customer        : customer ,
        location        : location ,
        billaddress     : billaddress ,
        duedate         : dueDate ,
        contract        : contract ,
        project         : project,
        asofdate        : asofdate ,
        currency        : currency ,
        source          : source ,
        customFilters   : customFilters ,
        defaultlayout   : defaultlayout ,
        subsidiary      : subsidiary ,      
        customerscreen  : customerscreen,
    };
    
    if (request.getMethod() == 'GET')
    {
        loadType = isEmpty(loadType) ? "" : loadType;
        var objCIform = null;
        
        switch (loadType)
        {
            case "details":
                if (!isScheduledScriptInProcess()) {
                    var stLine                      = request.getParameter("line");
                    var stSelectedinvoices          = request.getParameter("selectedinvoices");
                    objCIFilters.data               = JSON.parse(request.getParameter("data"));
                    currency                        = request.getParameter("custpage_currency");
                    
                    objCIFilters.selectedinvoices   = stSelectedinvoices;
                    objCIFilters.line               = stLine;
                    objCIFilters.currency           = currency;
                    objCIFilters.subsidiary         = null;
                    objCIform                       = generateDetailedCIFrom(objCIFilters);
                    
                    log("DEBUG", stLogTitle, "End");
                    response.writePage(objCIform);
                } else {
                    response.write('Scheduled consolidation is in process. Please try again after a few minutes.');
                }
                break;
            case 'generatepdf':
                log("debug", stLogTitle, "on generatepdf request.getMethod():" + request.getMethod());
                generateOndemandPDF(request, response);
                break;
            case 'resendcommunication':
                resendCommunicationCIForm(request, response);
                break;
            default:
                if (!isScheduledScriptInProcess()) {
                    objCIFilters.page           = page;
                    objCIFilters.selectedData   = arrPageValues;
                    objCIform                   = generateMainCIForm(request, objCIFilters);
                    
                    log("DEBUG", stLogTitle, "End");
                    response.writePage(objCIform);
                } else {
                    response.write('Scheduled consolidation is in process. Please try again after a few minutes.');
                }
        }
    }
    else
    {
        
        loadType = isEmpty(loadType) ? "" : loadType;
        var objCIform = null;
        
        switch (loadType)
        {
            case "details":
                if (!isScheduledScriptInProcess()) {
                    log("debug", "xxxxxx", request.getParameter("data"));
                    
                    var stLine                      = request.getParameter("line");
                    var stSelectedinvoices          = request.getParameter("selectedinvoices");
                    objCIFilters.data               = JSON.parse(request.getParameter("data"));
                    currency                        = request.getParameter("custpage_currency");
                    
                    objCIFilters.selectedinvoices   = stSelectedinvoices;
                    objCIFilters.line               = stLine;
                    objCIFilters.currency           = currency; 
                    objCIFilters.subsidiary         = null;
                    objCIform                       = generateDetailedCIFrom(objCIFilters);
                    
                    log("DEBUG", stLogTitle, "End");
                    response.writePage(objCIform);
                } else {
                    response.write('Scheduled consolidation is in process. Please try again after a few minutes.');
                }
                break;
            case 'generatepdf':
                log("debug", stLogTitle, "on generatepdf request.getMethod():" + request.getMethod())
                generateOndemandPDF(request, response);
                break;
            case 'resendcommunication':
                resendCommunicationCIForm(request, response);
                break;
            case "search":
                if (!isScheduledScriptInProcess()) {
                    objCIFilters.page           = page;
                    objCIFilters.selectedData   = arrPageValues;
                    objCIform                   = generateMainCIForm(request, objCIFilters);
                    
                    log("DEBUG", stLogTitle, "End");
                    response.writePage(objCIform);
                } else {
                    response.write('Scheduled consolidation is in process. Please try again after a few minutes.');
                }
                break;
            default:
                if (!isScheduledScriptInProcess()) {
                    processCISubmit(request, response,objCIFilters);
                } else {
                    response.write('Scheduled consolidation is in process. Please try again after a few minutes.');
                }
        }
    }
}


/**
 * the sub function used in suitelet_OnlineConsolidation suitelet event that will handle the 
 * submit event once the Submit button is Clicked.
 * @param request nlobjRequest
 * @param response nlobjResponse
 * @param objCIFilters : {
 *      customer        : customer ,
 *      location        : location ,
 *      billaddress     : billaddress ,
 *      duedate         : dueDate ,
 *      contract        : contract ,
 *      project         : project,
 *      asofdate        : asofdate ,
 *      currency        : currency ,
 *      source          : source ,
 *      customFilters   : customFilters ,
 *      defaultlayout   : defaultlayout ,
 *      subsidiary      : subsidiary ,      
 *      customerscreen  : customerscreen,
 *  }
 */
function processCISubmit(request, response,objCIFilters){
    var stLogTitle = "processCISubmit";
    var objContext = nlapiGetContext();
    var stRemainingUsage = objContext.getRemainingUsage();
    var stCIDateFlag = request.getParameter("custpage_cidate_flag");
    var stCIDate     = request.getParameter("custpage_cidate");
    var updateDueDate = request.getParameter("custpage_update_duedate");
    
    selectedci       = request.getParameter(FLD_CUSTPAGE_SELECTED_CI);
    arrPageValues    = JSON.parse(selectedci);
    

    var objCIconfig = getCISetup();
    log('DEBUG', stLogTitle, "SUBMITTING FORM");

    var stTitle = "";
    var objCIform = nlapiCreateForm(stTitle);
    var pdflist = objCIform.addField("custpage_pdflist", "inlinehtml", "PDF List");
    var stSuiteLet = nlapiResolveURL("suitelet", SCRIPTID_ONLINE, DEPLOYMENTID_ONLINE);

    var urltoRedirect = nlapiResolveURL("record", RECTYPE_CUSTOMRECORDSS_NSTS_CI_CONSOLIDATE_INVOICE);
    urltoRedirect = urltoRedirect.replace(/custrecordentry/g, 'custrecordentrylist');

    log('DEBUG', stLogTitle, "SUBMITTING FORM #2");
    var arrCustomerIds = [];
    var arrScedParam = [];
    var arrCIPDF = [];
    var bIsAnyProcessCommited = false;
    
    arrCIPDF.push("CONSOLIDATED INVOICE");
    arrCIPDF.push("See Consolidated Invoice list <a href='{0}'>here</a> <hr>".format(urltoRedirect));
                        
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
    
    log('DEBUG', stLogTitle, "GETTING PAGE VALUES");
    for (var i = 0; i < arrPageValues.length; i++)
    {
        var selected = arrPageValues[i];
        var stCustomerId = selected.customerid;
        var objData = JSON.parse(selected.data);
        
        log("DEBUG",stLogTitle,JSON.stringify(selected));
        
        bIsAnyProcessCommited = true;
        objCIFilters.customer = stCustomerId;
        
        //v2.0 Enhancement - Process CI per Customer - Don't process parents in process
        if (arrCustomerCheck.indexOf(stCustomerId) >= 0) {
            continue;
        }
                    
        if (arrCustomerIds.indexOf(stCustomerId) < 0) {
            arrCustomerIds.push(stCustomerId);
            
            stRemainingUsage = objContext.getRemainingUsage();
            if(stRemainingUsage <= ((arrCustomerIds.length * 5) + 50)){
                break;
            }
            log('DEBUG', stLogTitle, "LOCKING CUSTOMER ID:" + stCustomerId);
            
            nlapiSubmitField('customer', stCustomerId, FLD_CUSTENTITY_NSTS_CI_LOCK_INUI, 'T',false);
        }
    }
    
    var userid = objContext.getUser();
    objCIFilters.userid = userid;
    
    var arrSchedParam = {};
    var stFilters = JSON.stringify(objCIFilters);
    
    var objOVar = {
            custpage_cidate_flag: stCIDateFlag,
            custpage_cidate: stCIDate,
            custpage_update_duedate: updateDueDate,
            objCIFilters: objCIFilters
    }
    
    arrSchedParam[SCRIPTPARAM_CUSTSCRIPT_NSTS_CI_ARRPAGE_VALUES] = JSON.stringify(arrPageValues);
    arrSchedParam[SCRIPTPARAM_CUSTSCRIPT_NSTS_CI_OTHERVARIABLE] = JSON.stringify(objOVar);
    
    var status = nlapiScheduleScript(SCRIPTID_ASYNC_PROC, null, arrSchedParam);

    arrCIPDF.push("Scheduled Status : " + status);
    arrCIPDF.push("<hr>");
    
    if(arrPageValues.length < arrCustomerIds.length){
        arrCIPDF.push("<h1 style='color:red;font-style: italic;'>Due to GOVERNANCE LIMIT! only " + arrCustomerIds.length + " CI is being processed when using the UI.");
        arrCIPDF.push('"Click the BACK button to select and process more CI."</h1>');
    }

    pdflist.setDefaultValue(confirmationText(arrCIPDF.join("</br>")));
    objCIform.addButton("custpage_pdflist", "Back", "window.location.href='{0}'".format(stSuiteLet));
    var stCustomerScreen = request.getParameter("custpage_customerscreen");
    if(stCustomerScreen == "T")
    {
        pdflist.setDefaultValue("<script type='text/javascript'>window.close();</script>");
    }
    
    log("DEBUG", stLogTitle, "End");
    response.writePage(objCIform);
}

/**
 * Checks if the scheduled script is currently running
 * @returns {Boolean}
 */
function isScheduledScriptInProcess() {
    var blResult = false;
    var arrFilter = [new nlobjSearchFilter('scriptid', 'scriptdeployment', 'is', SCHED_SCRIPT_DEPLOYMENTID),
                     new nlobjSearchFilter('status', null, 'anyof', ['PROCESSING', 'PENDING', 'IN QUEUE', 'QUEUED'])];
    var arrCol = [new nlobjSearchColumn('status', null, 'group')];
    
    var arrResult = nlapiSearchRecord('scheduledscriptinstance', null, arrFilter, arrCol);
    
    if (!isEmpty(arrResult)) {
        blResult = true;
    }
    
    return blResult;
}

/**
 * sub function used in generation online CI screen.
 * @param request : nlobjRequest
 * @param filters : {
 *      customer        : customer ,
 *      location        : location ,
 *      billaddress     : billaddress ,
 *      duedate         : dueDate ,
 *      contract        : contract ,
 *      project         : project,
 *      asofdate        : asofdate ,
 *      currency        : currency ,
 *      source          : source ,
 *      customFilters   : customFilters ,
 *      defaultlayout   : defaultlayout ,
 *      subsidiary      : subsidiary ,      
 *      customerscreen  : customerscreen,
 *  };
 * @returns
 */
function generateMainCIForm(request, filters)
{
    var stLogTitle = "GENERATEMAINCIFORM";
    log("debug", stLogTitle, "Start", 1);

    var objCIconfig = getCISetup();

    var stCIDate_Flag   = request.getParameter(FLD_CUSTPAGE_CIDATE_FLAG);
    var stCIDate        = request.getParameter(FLD_CUSTPAGE_CIDATE);
    
    var stCustomerScreen    = request.getParameter("custpage_customerscreen");
    var isSecondLoad        = request.getParameter("custpage_issecondload");
    var stDefaultLayout     = request.getParameter("custpage_defaultlayout");

    var arrColumns = [];
    var arrFilters = [];

    stCIDate_Flag = (isEmpty(stCIDate_Flag)) ? "4" : stCIDate_Flag;

    if (isEmpty(objCIconfig))
    {
        response.write("No CI Configuration");
        return;
    }

    // Create a form.
    var stTitle = "Consolidate Customer Invoices";
    var fldgroup_filters = "fldgroup_filters";

    var objCIform = nlapiCreateForm(stTitle);
    objCIform.setScript(CUSTOMSCRIPT_NSTS_CI_ONLINE_SUITELET_CS);
    objCIform.addFieldGroup(fldgroup_filters, "Main Filters");

    if (objCIconfig.enable_Online_Consolidation == "F")
    {
        objCIform.addField("custpace_label", "inlinehtml", "").setDefaultValue("This feature is not currently available in your Account. Contact your Administrator for queries.")
        response.writePage(objCIform);
        return;
    }

    // add hidden fields
    objCIform.addField("custpage_page", "text", "Page").setDisplayType("hidden");
    objCIform.addField("custpage_customerscreen", "checkbox", "customerscreen").setDisplayType("hidden").setDefaultValue(stCustomerScreen);
    objCIform.addField("custpage_issecondload", "checkbox", "isSecondload").setDisplayType("hidden").setDefaultValue(isSecondLoad);
    objCIform.addField("custpage_defaultlayout", "text", "defaultlayout").setDisplayType("hidden").setDefaultValue(stDefaultLayout);
    objCIform.addField("custpage_loadtype", "text", "defaultlayout").setDisplayType("hidden")
    
    
    // add custom buttons
    objCIform.addButton("custpage_search", "Search", "filterCI('{0}');".format(objCIconfig.suiteLetURL));
    objCIform.addSubmitButton("Submit");
    objCIform.addResetButton("Reset");
    objCIform.addButton("custpage_markall", "Mark All", "markAll();");
    objCIform.addButton("custpage_unmarkall", "Unmark All", "unmarkAll();");

    var cp_customer = objCIform.addField("custpage_customer", "select", "Customer", "customer", fldgroup_filters).setLayoutType("startrow");
    cp_customer.setLayoutType("startrow").setDefaultValue(filters.customer);
    cp_customer.setHelpText(arrHelpText.customer);

    if (stCustomerScreen == "T")
    {
        cp_customer.setDisplayType("inline");
        if (isEmpty(isSecondLoad))
        {
            if(objCIconfig.ismultiCurrency == "T"){
                filters.currency = nlapiLookupField("customer", filters.customer, "currency");
            }
            
            if(objCIconfig.subsidiary == "T"){
                filters.subsidiary = nlapiLookupField("customer", filters.customer, "subsidiary");
            }
        }
    }

    
    if(objCIconfig.subsidiary == "T"){
        var cp_subsidiary = objCIform.addField("custpage_subsidiary", "select", "subsidiary", "subsidiary", fldgroup_filters);
        cp_subsidiary.setLayoutType("midrow").setDefaultValue(filters.subsidiary);
        cp_subsidiary.setHelpText(arrHelpText.subsidiary);
        cp_subsidiary.setMandatory(true);
    }
    
    if(objCIconfig.ismultiCurrency == "T"){
        var cp_currency = objCIform.addField("custpage_currency", "select", "Currency", "currency", fldgroup_filters);
        cp_currency.setLayoutType("midrow");
        cp_currency.setHelpText(arrHelpText.currency);
        cp_currency.setDefaultValue(filters.currency);        
    }

    if (objCIconfig.contract == "T")
    {
        objCIform.addField("custpage_contract", "select", "Contract", RECTYPE_CUSTOMRECORD_CONTRACTS, fldgroup_filters).setLayoutType("midrow").setDefaultValue(filters.contract);
    }

    if (objCIconfig.project == "T")
    {
        objCIform.addField("custpage_project", "select", "Project", "job", fldgroup_filters).setLayoutType("midrow").setDefaultValue(filters.project);
    }

    if (objCIconfig.source == "T")
    {
        var objSource = objCIform.addField("custpage_source", "text", "Source",null, fldgroup_filters).setLayoutType("midrow");
        objSource.setDefaultValue(filters.source);
    }

    if (objCIconfig.billaddress == "T")
    {
        objCIform.addField("custpage_billaddress", "text", "Billing Address", null, fldgroup_filters).setLayoutType("midrow").setDefaultValue(filters.billaddress);
    }

    if (objCIconfig.location == "T")
    {
        objCIform.addField("custpage_location", "select", "Location", "location", fldgroup_filters).setLayoutType("midrow").setDefaultValue(filters.location);
    }

    if (objCIconfig.dueDate == "T")
    {
        objCIform.addField("custpage_duedate", "date", "Due Date", "", fldgroup_filters).setLayoutType("midrow").setDefaultValue(filters.duedate);
    }
    
    if (objCIconfig.paymentMethod == "T")
    {
        objCIform.addField("custpage_paymethod", "text", "Payment Method", null, fldgroup_filters).setLayoutType("midrow");
    }

    if (objCIconfig.invoiceType == "T")
    {
        objCIform.addField("custpage_invoicetype", "text", "Invoice Type", null, fldgroup_filters).setLayoutType("midrow");
    }

    var cp_cutoffdate = objCIform.addField("custpage_asofdate", "date", "Invoice Cut-off Date", null, fldgroup_filters);
    cp_cutoffdate.setLayoutType("midrow").setDefaultValue(filters.asofdate);
    cp_cutoffdate.setHelpText(arrHelpText.cutoffdate);
    cp_cutoffdate.setMandatory(true);
    
    var objFldEntity = objCIform.addField(FLD_CUSTPAGE_ENTITY, "text", "Entity").setDisplayType("hidden").setLayoutType("startrow");
    var sublist = objCIform.addSubList(SUBLIST_CUSTPAGE_CI_INVOICES, "list", "Invoices")

    //v2.0 enhancement - Process CI per Customer - Don't include parents with CI in process
    //var arrConsolidatedInv = [];//getConsolidatedInvoices();
/*    if(objCIconfig.includeSubCustomers == "T") {
        var arrCustFilter = getCustomerCIsInProcess();
        var customerFieldId = "parent";
        var customerFieldJoin = null;
        
        customerFieldId = "parent";
        if(objCIconfig.isProjectEnabled)
        {
            customerFieldJoin = "customermain"; //"customermain";
            
        }else{
            customerFieldJoin = "customer";
        }
        
        if (!isEmpty(arrCustFilter)) {
            if (arrCustFilter.indexOf(filters.customer) >= 0) {
                arrFilters.push(new nlobjSearchFilter(customerFieldId, customerFieldJoin, 'noneof', arrCustFilter));
            }
        }
    }*/

    arrFilters = setFilters(objCIconfig, filters, arrFilters);

    arrColumns = setColumns(objCIconfig, filters, arrColumns);
    arrFilters.push(new nlobjSearchFilter("internalid", null, "greaterthanorequalto", objCIconfig.minimumNumberChildInvoices).setSummaryType("count"));
    arrFilters.push(new nlobjSearchFilter("internalid", null, "lessthanorequalto", objCIconfig.maximumNumberChildInvoices).setSummaryType("count"));
    arrFilters.push(new nlobjSearchFilter(FLD_CUSTENTITY_NSTS_CI_LOCK_INUI, "customer", "is", 'F'));
    
    // Start Setup Custom Filters
    var setLayoutType = "startrow";
    for (var i = 0; i < objCIconfig.arrCustomFilter.length; i++)
    {
        var objCustFilter = objCIconfig.arrCustomFilter[i];

        if (!isEmpty(objCustFilter.value))
        {
            var defaultValue = "";
            
            defaultValue =  request.getParameter("custpage_custfilter_{0}_{1}".format(objCustFilter.id, i));
            if (setLayoutType == "startrow")
            {
                objCIform.addFieldGroup("group_customfilter", "Custom Filters");// .setShowBorder(true);
            }
            objCIform.addField("custpage_custfilter_{0}_{1}".format(objCustFilter.id, i), objCustFilter.type, objCustFilter.label, objCustFilter.src, "group_customfilter").setLayoutType(setLayoutType, 'startrow').setDefaultValue(defaultValue);
            setLayoutType = "midrow";
        }
    }
    // End Setup Custom Filters

    objCIform.addFieldGroup("group_presetData", "Set CI Input");
    var cidateFlag = objCIform.addField(FLD_CUSTPAGE_CIDATE_FLAG, "select", "CI Date", "", "group_presetData").setLayoutType("midrow");// customlist_nsts_ci_date
    cidateFlag.addSelectOption("1", "Current Date");
    cidateFlag.addSelectOption("2", "Specified Date"); //3
    cidateFlag.addSelectOption("3", "Last Invoice Date"); //4
    cidateFlag.addSelectOption("4", "Invoice Cutoff Date"); //2
    cidateFlag.setDefaultValue(stCIDate_Flag);
    cidateFlag.setHelpText(arrHelpText.cidate);

    var cidate = objCIform.addField("custpage_cidate", "date", "Specific Date", "", "group_presetData").setLayoutType("midrow");
    
    //ATLAS enhancement - process due date for CI
    var updateDueDate = objCIform.addField("custpage_update_duedate", "checkbox", "Update Due Date", "", "group_presetData").setLayoutType("midrow").setDefaultValue(objCIconfig.updateDueDate);

    if (stCIDate_Flag == "2")
    {
        cidate.setDisplayType("normal");
        cidate.setDefaultValue(stCIDate);
    }
    else
    {
        cidate.setDisplayType("disabled");
        cidate.setDefaultValue("");
    }

    var objSearch = getAllResults(null, objCIconfig.sourceSavedSearch, arrFilters, arrColumns,null,true)
    var saveSearch = objSearch.saveSearch;
    
    //Configure Pagination
    var pages = Math.ceil(objSearch.length / objCIconfig.invoicePerPage);
    pages = (pages < 0) ? 0 : pages;

    var intFirstPage = 0;
    var intLastPage = pages - 1;
    var intPrevPage = filters.page - 1;
    var intNextPage = filters.page + 1;
    intPrevPage = intPrevPage < 0 ? 0 : intPrevPage;
    intNextPage = intNextPage > pages ? pages : intNextPage


    var btnFirst = sublist.addButton('custpage_first_page', '<< First Page', 'gotoPage(' + intFirstPage + ');');
    var btnPrev = sublist.addButton('custpage_prev_page', '< Previous Page', 'gotoPage(' + intPrevPage + ');');
    var btnNext = sublist.addButton('custpage_next_page', 'Next Page >', 'gotoPage(' + intNextPage + ');');
    var btnLast = sublist.addButton('custpage_last_page', 'Last Page >>', 'gotoPage(' + intLastPage + ');');

    btnFirst.setDisabled(filters.page <= intFirstPage ? true : false);
    btnPrev.setDisabled(filters.page <= intFirstPage ? true : false);
    btnNext.setDisabled(filters.page > intLastPage - 1 ? true : false);
    btnLast.setDisabled(filters.page > intLastPage - 1 ? true : false);
    
    if(filters.page > intLastPage){
        filters.page = intLastPage;
    }
    //Configure Pagination End's Here!! 
    
    if (objSearch)
    {
        var arrColumns = saveSearch.getColumns()
        sublist.addField(FLD_SELECTINVOICE, "checkbox", "Consolidate");
        sublist.addField(FLD_SELECTEDINVOICES, "text", "selectedData").setDisplayType('hidden');
        var stColName = "";
        var stColLabel = "";
        var customerFieldId = "entity";
        var customerFieldIdJoin = null;
        
        if(objCIconfig.includeSubCustomers == "T")
        {
            
            customerFieldId = "parent";
            if(objCIconfig.isProjectEnabled)
            {
                customerFieldJoin = "customer"; //"customermain";
                
            }else{
                customerFieldJoin = "customer";
            }
        }
        
        var objCustomerInfo = {
            name : customerFieldId ,
            join : customerFieldIdJoin ,
            summary : null ,
        };

        for (var i = 0; i < arrColumns.length; i++)
        {
            stColName = arrColumns[i].getName();
            var objJoin = arrColumns[i].getJoin();
            var objSummary = arrColumns[i].getSummary();
            stColLabel = arrColumns[i].getLabel();
            

            if (stColName == customerFieldId)
            {
                objCustomerInfo.join    = objJoin;// arrColumns[i].getJoin();
                objCustomerInfo.summary = objSummary;// arrColumns[i].getSummary();
                objCustomerInfo.join    = objJoin;
                sublist.addField(stColName + "_{0}".format(i), "select", stColLabel, "customer").setDisplayType("inline");
                objFldEntity.setDefaultValue(stColName + "_{0}".format(i));
            }
            else if (stColLabel.toLocaleLowerCase() == "project")
            {
                sublist.addField(stColName + "_{0}".format(i), "select", stColLabel, "job").setDisplayType("inline");
            }
            else
            {
                sublist.addField(stColName + "_{0}".format(i), "textarea", stColLabel).setDisplayType("inline");
            }
        }
        sublist.addField(FLD_SELECTINVOICEDATA, "textarea", "data").setDisplayType('hidden');

        var arrSSResults = objSearch.gotoPage(filters.page, objCIconfig.invoicePerPage);
        var arrValues = [];
        if (arrSSResults)
        {
            for (var ind = 0; ind < arrSSResults.length; ind++)
            {
                var objBind = {};
                var objData = {};
                var intEntityId = 0;
                var isToPush = true;
                var rec = arrSSResults[ind];

                for (var i = 0; i < arrColumns.length; i++)
                {
                    var stColName = arrColumns[i].getName();
                    var stColLabel = arrColumns[i].getLabel();
                    
                    stColLabel = stColLabel.toLocaleLowerCase();
                    var _stColName = stColName;

                    var objJoin = arrColumns[i].getJoin();
                    var objSummary = arrColumns[i].getSummary();
                    var stColType = arrColumns[i].getType();

                    var stValue = rec.getValue(stColName, objJoin, objSummary);
                    var stValueText = rec.getText(stColName, objJoin, objSummary);
                    if (stColType == "select")
                    {
                        if (stColName.toLowerCase() == "internalid" && objSummary.toLowerCase() == 'count'){
                            stValue = (isEmpty(stValueText)) ? stValue : stValueText;
                            var entity = rec.getValue(objCustomerInfo.name, objCustomerInfo.join, objCustomerInfo.summary);

                            var url = objCIconfig.suiteLetURL;
                            filters.duedate = (isEmpty(filters.duedate))? "" : filters.duedate;
                            filters.asofdate = (isEmpty(filters.asofdate))? "" : filters.asofdate;
                            
                            url += "&loadType=details";
                            if (isEmpty(entity)) url += "&custpage_customer=" + entity;
                            if (!isEmpty(filters.asofdate)) url += "&custpage_asofdate=" + filters.asofdate;
                            if (!isEmpty(filters.duedate)) url += "&custpage_duedate=" + filters.duedate;
                            url += "&line=" + (ind + 1);
                              
                            stValue = "<a id='link_tranid_{2}' rel='{0}' style='cursor:pointer;' class='dottedlink uir-hoverable-anchor'>{1}</a>".format(url ,stValue ,(ind + 1));
                            objBind[stColName + "_{0}".format(i)] = stValue;
                        }else if (stColName == customerFieldId){
                            
                            intEntityId = rec.getValue(stColName, objJoin, objSummary);
                            objBind[stColName + "_{0}".format(i)] = intEntityId; 

                        }
                        else
                        {
                            objBind[stColName + "_{0}".format(i)] = rec.getText(stColName, objJoin, objSummary);
                        }
                    }
                    else
                    {
                        /*var stValue = rec.getValue(stColName, objJoin, objSummary);
                        var stValueText = rec.getText(stColName, objJoin, objSummary);*/
                        if(stColType == "currency"){
                            stValue = (isEmpty(stValue))? 0 : stValue;
                            stValue = nlapiFormatCurrency(stValue);
                        }
                        
                        if (stColName.toLowerCase() == "internalid" && objSummary == 'count')
                        {
                            stValue = (isEmpty(stValueText)) ? stValue : stValueText;
                            var entity = rec.getValue(objCustomerInfo.name, objCustomerInfo.join, objCustomerInfo.summary);

                            var url = objCIconfig.suiteLetURL;
                            filters.duedate = (isEmpty(filters.duedate))? "" : filters.duedate;
                            filters.asofdate = (isEmpty(filters.asofdate))? "" : filters.asofdate;
                            
                            url += "&loadType=details";
                            if (isEmpty(entity)) url += "&custpage_customer=" + entity;
                            if (!isEmpty(filters.asofdate)) url += "&custpage_asofdate=" + filters.asofdate;
                            if (!isEmpty(filters.duedate)) url += "&custpage_duedate=" + filters.duedate;
                            url += "&line=" + (ind + 1);
                            //url += "&customfilters=" + JSON.stringify(filters.customFilters);
             
                            //stValue = "<a href='#' onclick=\"showDetails('{0}',{2})\" style='cursor:pointer;' class='dottedlink uir-hoverable-anchor'>{1}</a>".format(url ,stValue ,(ind + 1));
                            
                            stValue = "<a id='link_tranid_{2}' rel='{0}' style='cursor:pointer;' class='dottedlink uir-hoverable-anchor'>{1}</a>".format(url ,stValue ,(ind + 1));
                        }
                        objBind[stColName + "_{0}".format(i)] = stValue;
                    }

                    if (arrColumns[i].getSummary().toLowerCase() == "group")
                    {
                        if (stColLabel == "project")
                        {
                            _stColName = "internalid"; //"jobMain";
                        }
                        
                        var val = rec.getValue(stColName, objJoin, objSummary);
                        var txt = rec.getText(stColName, objJoin, objSummary);
                        objData[_stColName] = {
                            id : stColName ,
                            value : val ,
                            text : txt ,
                            type : stColType ,
                            join : objJoin
                        };
                    }
                }

                var data = JSON.stringify(objData);
                var isSelected = "F";
                for (var pgDataInd = 0; pgDataInd < filters.selectedData.length; pgDataInd++)
                {
                    var obj = filters.selectedData[pgDataInd];
                    if (obj.customerid == intEntityId && obj.data == data)
                    {
                        isSelected = "T";
                    }
                }

                objBind[FLD_SELECTINVOICE] = isSelected;
                objBind[FLD_SELECTINVOICEDATA] = data;

                objBind[stColName + "_{0}".format(i)]
                arrValues.push(objBind);
            }
        }
        sublist.setLineItemValues(arrValues);
    }

    var stSelectedVal = isEmpty(filters.selectedData) ? "[]" : JSON.stringify(filters.selectedData);
    var custpage_selected_ci = objCIform.addField(FLD_CUSTPAGE_SELECTED_CI, "longtext", "selected ci");
    custpage_selected_ci.setDefaultValue(stSelectedVal);
    custpage_selected_ci.setDisplayType("hidden");

    log("debug", stLogTitle, "End", 1);
    return objCIform;
}

/**
 * A Sub function used in online CI Screen this function will generate detailed screen
 * @param filters : {
 *      customer        : customer ,
 *      location        : location ,
 *      billaddress     : billaddress ,
 *      duedate         : dueDate ,
 *      contract        : contract ,
 *      project         : project,
 *      asofdate        : asofdate ,
 *      currency        : currency ,
 *      source          : source ,
 *      customFilters   : customFilters ,
 *      defaultlayout   : defaultlayout ,
 *      subsidiary      : subsidiary ,      
 *      customerscreen  : customerscreen,
 *  };
 * @returns nlobjForm
 */
function generateDetailedCIFrom(filters)
{
    var stLogTitle = "GENERATEDETAILEDCIFROM";
    log("debug", stLogTitle, "Start")
    
    var objCIconfig = getCISetup();
    var stTitle             = "Invoice Details";
    var objCIform           = nlapiCreateForm(stTitle, true);
    var arrSelectedinvoices = [];
    var intInvoiceId        = "";

    var stCustomer          = filters.customer;
    var stSelectedinvoices  = filters.selectedinvoices;
    var stLine              = filters.line;

    stSelectedinvoices      = isEmpty(stSelectedinvoices) ? "" : stSelectedinvoices;
    arrSelectedinvoices     = stSelectedinvoices.split(",");

    var sublist             = objCIform.addSubList(SUBLIST_CUSTPAGE_CI_INVOICES_DETAIL, "list", "Invoices");
    var objLine             = objCIform.addField("custpage_invoice_line", "text", "line");
        objLine.setDisplayType("hidden");
        objLine.setDefaultValue(stLine);
    
    // v2.0 Enhancement - Process CI per Customer - Don't include parents with CI in process 
    //var arrSelectedInvoices = getConsolidatedInvoices(stCustomer);
    var arrFilters          = [];
    var arrColumns          = [];
    
    /*if(objCIconfig.includeSubCustomers == "T") {
        var arrCustFilter = getCustomerCIsInProcess();
        var customerFieldId = "parent";
        var customerFieldJoin = 'customer';
        
        if(objCIconfig.isProjectEnabled)
        {
            customerFieldJoin = "customermain"; //"customermain";
            
        }else{
            customerFieldJoin = "customer";
        }
        
        if (!isEmpty(arrCustFilter)) {
            arrFilters.push(new nlobjSearchFilter(customerFieldId, customerFieldJoin, 'noneof', arrCustFilter));
        }
    }*/
    
    arrFilters              = setFilters(objCIconfig, filters, arrFilters);
    arrColumns              = setColumns(objCIconfig, filters, arrColumns,false);
    
    var objSaveSearch       = getAllResults(null,objCIconfig.sourceSavedSearchDetail, arrFilters);
    if (objSaveSearch)
    {
        var saveSearch      = objSaveSearch.saveSearch;
        
        var arrSrchColumns  = saveSearch.getColumns();
        sublist.addField("internalid", "text", "internalid").setDisplayType("hidden");
        sublist.addField("linenumner", "text", "#").setDisplaySize(5);
        
        for (var i = 0; i < arrSrchColumns.length; i++)
        {
            sublist.addField(arrSrchColumns[i].getName() + "_{0}".format(i), "text", arrSrchColumns[i].getLabel());// .setDisplayType('entry');
            if (arrSrchColumns[i].getName() == "internalid")
            {
                intInvoiceId = arrSrchColumns[i].getName() + "_{0}".format(i);
            }
        }

        var arrSSResults = objSaveSearch.results;
        if (arrSSResults)
        {
            var arrValues = [];
            for (var ind = 0; ind < arrSSResults.length; ind++)
            {
                var objBind = {};
                var rec = arrSSResults[ind];
                var internalid = rec.getId();
                objBind["internalid"] = internalid;
                objBind["linenumner"] = (ind+1) + "";
                
                (arrSelectedinvoices.indexOf(internalid) >= 0) ? objBind["selectinvoice"] = "T" : 
                                                                 objBind["selectinvoice"] = "F";
                
                for (var i = 0; i < arrSrchColumns.length; i++)
                {
                    var stColName = arrSrchColumns[i].getName();
                    var objJoin = arrSrchColumns[i].getJoin();
                    var objSummary = arrSrchColumns[i].getSummary();
                    
                    var stColType = arrSrchColumns[i].getType();

                    if (stColType == "select")
                    {
                        if (stColName == "internalid")
                        {
                            var stValue = rec.getValue(stColName, objJoin, objSummary);
                            var stValueText = rec.getText(stColName, objJoin, objSummary);
                            
                            stValue = (isEmpty(stValueText)) ? stValue : stValueText;
                            stValueText = (isEmpty(stValueText)) ? stValue : stValueText;

                            stValue = nlapiResolveURL("record", rec.getRecordType(), rec.getId());
                            stValue = "<a id='qsTarget_" + ind + "' onmouseover='linkMouseover(\"qsTarget_" + ind + "\"," + rec.getId() + ",event)' href=" + stValue + " target='_blank' style='cursor:pointer;' class='dottedlink uir-hoverable-anchor'>" + stValueText + "</a>";
                            objBind[stColName + "_{0}".format(i)] = stValue;
                        }else{
                            objBind[stColName + "_{0}".format(i)] = rec.getText(stColName, objJoin, objSummary);
                        }
 
                        
                    }
                    else
                    {
                        var stValue = rec.getValue(stColName, objJoin, objSummary);
                        var stValueText = rec.getText(stColName, objJoin, objSummary);

                        if(stColType == "currency"){
                            stValue = (isEmpty(stValue))? 0 : stValue;
                            stValue = nlapiFormatCurrency(stValue);
                        }
                        
                        if (stColName == "internalid" || stColName == 'tranid' || stColName == 'transactionnumber')
                        {
                            stValue = (isEmpty(stValueText)) ? stValue : stValueText;
                            stValueText = (isEmpty(stValueText)) ? stValue : stValueText;

                            stValue = nlapiResolveURL("record", rec.getRecordType(), rec.getId());
                            stValue = "<a id='qsTarget_" + ind + "' onmouseover='linkMouseover(\"qsTarget_" + ind + "\"," + rec.getId() + ",event)' href=" + stValue + " target='_blank' style='cursor:pointer;' class='dottedlink uir-hoverable-anchor'>" + stValueText + "</a>";
                        }
                        objBind[stColName + "_{0}".format(i)] = stValue;
                    }
                }
                arrValues.push(objBind);
            }
            sublist.setLineItemValues(arrValues);
        }
    }
    return objCIform;
}

/**
 * this function is called when the Send Email button is clicked on the CI Record
 * @param request : nlobjRequest
 * @param response : nlobjResponse
 * @returns void
 */
function resendCommunicationCIForm(request, response)
{
    var stLogTitle  = "RESENDCOMMUNICATION";
    
    var type        = request.getParameter("type");
    var ciId        = request.getParameter("ciId");
    
    if(isEmpty(ciId)){
        return "";
    }
    
    var objContext = nlapiGetContext();
    var userid = objContext.getUser();
    var ciConfig = getCISetup();
    
    var recCI = nlapiLoadRecord(RECTYPE_CUSTOMRECORDSS_NSTS_CI_CONSOLIDATE_INVOICE, ciId); //nlapiLookupField(RECTYPE_CUSTOMRECORD_SS_CI_CONSOLIDATE_INVOICE, ciId, [FLD_CUSTRECORD_NSTS_CI_CUSTOMER , FLD_CUSTRECORD_NSTS_CI_PDFFILE]);
    var stCustomerId = recCI.getFieldValue(FLD_CUSTRECORD_NSTS_CI_CUSTOMER);
    var recCustomer = nlapiLoadRecord("customer",stCustomerId);
    ciConfig = getCustomerRef(recCustomer);
    
    var stPDFId = recCI.getFieldValue(FLD_CUSTRECORD_NSTS_CI_PDFFILE);
    /*performance issue change*/
    var stCIName = recCI.getFieldValue('name');
    
    var filePDF;
    if(!isEmpty(stPDFId)){
        filePDF = nlapiLoadFile(stPDFId)
    }

    var arrRecord = [];
    arrRecord['recordtype'] = RECTYPE_CUSTOMRECORDSS_NSTS_CI_CONSOLIDATE_INVOICE;
    arrRecord['record'] = ciId;
    
    var stCompName = recCustomer.getFieldValue("entityid");
    if (recCustomer.getFieldValue('isperson') == 'T') {
        stCompName = recCustomer.getFieldValue("firstname") + ' ' + recCustomer.getFieldValue("lastname");
    }
    
    var stFileName = "RE: CI_{0}_#{1} {2}".format(stCompName, recCI.getFieldValue("id"),nlapiDateToString(new Date()));

    if (type == "email")
    {
        var stEmail = [recCustomer.getFieldValue("email")];
        // v2.0 Enhancement - Include contacts with AR Contact category in email
        var arrContactCategory = ciConfig.contactCategory.split(',');
        var arrContactEmail = [];
        if (!isEmpty(arrContactCategory)) {
            arrContactEmail = getARContacts(stCustomerId,arrContactCategory);
        }
        arrContactEmail = arrContactEmail['comp:'+stCustomerId];
        if (!isEmpty(arrContactEmail)) {
            if (!isEmpty(stEmail)) {
                stEmail.push(arrContactEmail);
            } else {
                stEmail = arrContactEmail;
            }
        }
        stEmail = stEmail.join(',');
        
        if (!isEmpty(stEmail) && !isEmpty(ciConfig.emailTemplate))
        {

            /*var stEmailMsg = nlapiMergeRecord(ciConfig.emailTemplate, "customer", stCustomerId).getValue();
            var emailRender = nlapiCreateTemplateRenderer();
            emailRender.setTemplate(stEmailMsg);
            emailRender.addRecord("customer", recCustomer);
            emailRender.addRecord("customrecord", recCI);*/
            
            // v2.0 Enhancement - CI Email Subject - Use subjet in template
            var objMerger = nlapiCreateEmailMerger(ciConfig.emailTemplate);
            objMerger.setEntity('customer', stCustomerId);
            objMerger.setCustomRecord('customrecord_nsts_ci_consolidate_invoice', ciId);
            
            var objMergeResult = objMerger.merge();
            var stEmailMsg = objMergeResult.getBody();
            var stEmailSubj = objMergeResult.getSubject();
            if (isEmpty(stEmailSubj)) {
                stEmailSubj = stFileName;
            }

            /*performance issue change*/
            if(filePDF.getSize() <= 5000000){
                nlapiSendEmail(userid, stEmail, stEmailSubj, stEmailMsg, null, null, arrRecord, filePDF);
            }else{
                stEmailMsg = isEmpty(stEmailMsg)? "" : stEmailMsg;
                
                stEmailMsg += "\n\n the PDF file is morethan 5MB!";
                stEmailMsg += "\nPlease check the Consolidated Invoice Record " + stCIName +" to locate your file";
                nlapiSendEmail(userid, stEmail, stEmailSubj, stEmailMsg, null, null, arrRecord);
            }
            /*performance issue change*/

        }
    }
    else if (type == "fax")
    {
        var stFax = recCustomer.getFieldValue("fax");
        if (!isEmpty(stFax) && !isEmpty(ciConfig.faxTemplate))
        {
            /*var stFaxMsg = nlapiMergeRecord(ciConfig.faxTemplate, "customer", stCustomerId).getValue();
            var faxRender = nlapiCreateTemplateRenderer();
            faxRender.setTemplate(stFaxMsg);
            faxRender.addRecord("customer", recCustomer);
            faxRender.addRecord("customrecord", recCI);*/
            
            var objMerger = nlapiCreateEmailMerger(ciConfig.faxTemplate);
            objMerger.setEntity('customer', stCustomerId);
            objMerger.setCustomRecord('customrecord_nsts_ci_consolidate_invoice', ciId);
            
            var objMergeResult = objMerger.merge();
            var stFaxMsg = objMergeResult.getBody();
            var stFaxSubj = objMergeResult.getSubject();
            
            //stFaxMsg = faxRender.renderToString();
            //nlapiSendFax(userid, stFax, stFileName, stFaxMsg, arrRecord, filePDF);
            nlapiSendFax(userid, stFax, stFaxSubj, stFaxMsg, arrRecord, filePDF);
        }
    }
    
    response.write("<script>window.close()</script>")
}

/**
 * This is used in Conline Consolidation if the submit CI is completed
 * @param details
 * @returns
 */
function confirmationText(details)
{
    if (!isEmpty(details))
    {
        var stConfirmation = '<div width="100%" class="uir-alert-box confirmation session_confirmation_alert" style=""><div class="icon confirmation"><img alt="" src="/images/icons/messagebox/icon_msgbox_confirmation.png"></div><div class="content"><div class="title">Confirmation</div><div class="descr">{0}</div></div></div>'.format(details);
        return stConfirmation;
    }
    return "";
}
