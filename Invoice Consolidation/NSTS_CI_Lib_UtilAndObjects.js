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

if (!String.prototype.format)
{
    String.prototype.format = function()
    {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number)
        {
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    };
}

if (!Array.prototype.gotoPage)
{
    Array.prototype.gotoPage = function(page, displayItemCount)
    {
        var arrResults = this;
        displayItemCount = parseInt(displayItemCount);
        var len = arrResults.length;
        var cntPages = Math.ceil(len / displayItemCount);
        if (page > cntPages) return null;

        var pageResults = null;
        var start = 0;
        var end = displayItemCount;
        if (page <= 0)
        {
            pageResults = arrResults.slice(start, end);
        }
        else
        {
            start = (page * displayItemCount); // + (page -1);
            end = start + displayItemCount;

            log("debug", "getAllResults", "start:" + start + " end:" + end);
            pageResults = arrResults.slice(start, end);
        }

        return pageResults;
    }
}

/**
 * check if the account is a Software if it is a software then the Crontract record is available
 * @returns {Boolean} if nlapiSearchRecord(RECTYPE_CUSTOMRECORD_CONTRACTS); Doesn’t return an error then 
 * return true else false
 */
function isContractFeatureEnabled()
{
    try
    {
        nlapiSearchRecord(RECTYPE_CUSTOMRECORD_CONTRACTS);
        return true;
    }catch(e){
        return false;
    }
    return true;
}

/**
 * fetch more than 1000 save Search Result
 * @param type : RecordType id this is optional if the "id" is givent
 * @param id : internal id of the save search this is optional if the "type" is Given
 * @param arrFilters nlobjSearchFileter[]
 * @param arrColumns nlobjSearchColumn[]
 * @param currencyFilters : {
 *          subsidiary : subsidiary,
 *          subCurrency : subCurrency,
 *          currency : currency,
 *          baseCurrency : ciConfig.baseCurrency
 *  } (optional) if this param is given. on the formula {exchangerate} will be replace with
 * the value of "nlapiExchangeRate"
 */
function getAllResults(type, id, arrFilters, arrColumns,currencyFilters,bturnOnResultLimit,callback)
{ 
    var dtStartDate = new Date();
    
    bturnOnResultLimit = isEmpty(bturnOnResultLimit)? false: bturnOnResultLimit;
    var stLoggerTitle = 'GETALLRESULTS';
    if(isEmpty(type) && isEmpty(id))
    {
        return null;
    }
    
    var exchangeRate = null;
    
    log("debug", stLoggerTitle, "type:{0},id{1}".format(type, id));
    
    var arrResults = [];
    var count = 1000;
    var init = true;
    var min = 0;
    var max = 1000;
    var search;
    
    var func_reinitSearch = function(){
        if (!isEmpty(id))
        {
            search = nlapiLoadSearch(type, id);
            if (arrFilters) search.addFilters(arrFilters);
            if (arrColumns) search.addColumns(arrColumns);
            
            var arrCols = [];
            var arrGetCols = search.getColumns();
            
            var intFormulaCOunt = 0;
            for(var col = 0; col < arrGetCols.length; col++)
            {
                var objGetCol   = arrGetCols[col];
                var stName      = objGetCol.getName();
                var stJoin      = objGetCol.getJoin();
                var stSummary   = objGetCol.getSummary();
                var stFormula   = objGetCol.getFormula();
                var stLabel     = objGetCol.getLabel();
                var objSetCol   = null;
                if(!isEmpty(stFormula)){
                    if(intFormulaCOunt > 0){
                        stName += intFormulaCOunt;
                    }
                    
                    objSetCol = new nlobjSearchColumn(stName, stJoin, stSummary);

                    objSetCol.setFormula(stFormula);
                    intFormulaCOunt++;
                }
                else
                {
                    objSetCol = new nlobjSearchColumn(stName, stJoin, stSummary);
                }
                objSetCol.setLabel(stLabel);
                arrCols.push(objSetCol);
            }
            search.setColumns(arrCols);
            
        }
        else
        {
            log("debug", stLoggerTitle, "Creating Save Search");
            search = nlapiCreateSearch(type, arrFilters, arrColumns);
            
        }
        
        return search;
    }
    
    search = func_reinitSearch();
    
    var rs = search.runSearch();
    var resultSet = null;
    
    if(!bturnOnResultLimit){
        while (count == 1000 || init)
        {
            log("debug", stLoggerTitle, "Getting data from:" + min + " To:" + max);
            var intInterVal = getInterval(dtStartDate, new Date());
            
            try{
                NSUtil.rescheduleScript(USAGE_LIMIT);
            }catch(e){}
            
            if(intInterVal >= 50){
                dtStartDate = new Date();
                search = func_reinitSearch();
                rs = search.runSearch();
            }
                        
            try{
                resultSet = rs.getResults(min, max);
                arrResults = arrResults.concat(resultSet);
            }catch(e){
                dtStartDate = new Date();
                search = func_reinitSearch();
                rs = search.runSearch();
                
                resultSet = rs.getResults(min, max);
                arrResults = arrResults.concat(resultSet);
            }

            min = max;
            max += 1000;
            init = false;
            count = resultSet.length;
            
            if(!isEmpty(callback) && typeof(callback) == 'function' && !isEmpty(resultSet)){
                callback(resultSet);
            }
        }
    }else{
        resultSet  = rs.getResults(0, 1000);
        arrResults = resultSet;
        log("debug", stLoggerTitle, "limited result");
    }

    
    var retVal = {
        length : arrResults.length ,
        saveSearch : search ,
        results : arrResults ,
        getResults : function(start, end)
        {
            return arrResults.slice(start, start + end);
        } ,
        gotoPage : function(page, displayItemCount)
        {
            displayItemCount = parseInt(displayItemCount);
            var len = resultSet.length;
            var cntPages = Math.ceil(len / displayItemCount);
            if (page > cntPages) return null;

            var pageResults = null;
            var start = 0;
            var end = displayItemCount;
            if (page <= 0)
            {
                pageResults = arrResults.slice(start, end);
            }
            else
            {
                start = (page * displayItemCount); // + (page -1);
                end = start + displayItemCount;

                log("debug", "getAllResults", "start:" + start + " end:" + end);
                pageResults = arrResults.slice(start, end);
            }

            return pageResults;
        }
    };
    
    
    log('DEBUG', stLoggerTitle, "Save Search Is returning a values");
    return (retVal);
}

/**
 * identify if the account in One world or non-one world
 * @returns {String}
 */
function isOneWorld()
{
    var companyInfo = nlapiLoadConfiguration('userpreferences');
    var a = companyInfo.getFieldValue('subsidiary');
    if (a != null)
    {
        return "T";
    }
    else
    {
        return "F";
    }
}

/**
 * check if the value is empty or not
 * @param value 
 * @returns {Boolean}
 */
function isEmpty(value)
{
    if (value == null || value == undefined || value == '' || value.length <= 0) { return true; }
    return false;
}

/**
 * if the value is empty the replace with the other value
 * @param value
 * @param replaceWith
 * @returns
 */
function isEmptyReplaceWith(value, replaceWith)
{
    if (value == null || value == undefined || value == '' || value.length <= 0)
    {
        value = replaceWith;
    }
    return value;
}

/**
 * print execution log 
 * @param {String} type [required] - One of the following log types:
 * <ul>
 *     <li>DEBUG</li>
 *     <li>AUDIT</li>
 *     <li>ERROR</li>
 *     <li>EMERGENCY</li>
 * </ul>
 * @param {String} title [optional] - A title used to organize log entries (max length: 99 characters). If you set title to null or empty string (''), you will see the word "Untitled" appear in your log entry.
 * @param {String} details [optional] - The details of the log entry (max length: 3999 characters)
 * @param indent [optional] level of indention
 */
function log(logType, title, details,indent)
{
    indent = isEmpty(indent)? 0 : indent;
    indent = parseInt(indent);
    indent = indent ? indent : 0;
    
    var stIndent = "";
    for (var i = 0; i < indent; i++)
    {
        stIndent+= (i==0)? ". " : "";
    }
    
    if (ENABLELOG) nlapiLogExecution(logType, title, stIndent + details);
}

/**
 * replace the given expression
 * @param xmlReport
 * @param arrSubstitute
 * @returns
 */
function findReplaceExpression(xmlReport, arrSubstitute)
{
    var stXMLReport = xmlReport;
    var arrSubs = arrSubstitute;
    var subCount = arrSubs.length;

    for (var i = 0; i < subCount; i++)
    {
        var quest = arrSubs[i][0];
        var substitute = arrSubs[i][1];

        var count = (quest != null && quest != undefined && quest != '') ? quest.length : 0;
        var charac = '';
        var newQuest = '';

        for (var x = 0; x < count; x++)
        {
            charac = quest.substring(x, x + 1);

            if (charac == '$' || charac == '?' || charac == '|' || charac == '(' || charac == ')' || charac == '!')
            {
                charac = '\\' + charac;
            }

            newQuest = newQuest + charac;
        }

        stXMLReport = stXMLReport.replace(new RegExp(newQuest, 'g'), substitute);
    }

    return stXMLReport;
}

/**
 * Get the CI Setup configuration information and reference for CI consolidation
 * @returns {
 *          enableFor,enable_Consolidated_Invoicing,enable_Online_Consolidation,
 *          enable_Scheduled_Consolidation,maximumNumberChildInvoices,minimumNumberChildInvoices,
 *          sourceSavedSearch,sourceSavedSearchDetail,includeSubCustomers,subsidiary,
 *          billaddress,currency,filtersNote,contract,project,source,location,
 *          dueDate,invoiceType,suiteLetURL,arrCustomFilter, isAttachToEmail,
 *          emailSenderUserId,emailTemplate,isAttachToFax,faxSenderUserId,
 *          faxTemplate,isToFileCabInFolder,isAttachToEmailDefault,emailSenderUserIdDefault,
 *          emailTemplateDefault,isAttachToFaxDefault,faxSenderUserIdDefault,
 *          faxTemplateDefault,isToFileCabInFolderDefault,invoicePerPage,
 *          templateid,pdfCISaveSearch1,pdfCISaveSearch2,layoutIslandscape,
 *          layoutTitleFontSize,layoutSubTitleFontSize,layoutTHFontSize,layoutTRFontSize,
 *          layoutBodyFontSize,headerHeight,billshipFontSize,billshipTableHeight,
 *          defaultLayoutId,baseCurrency,
 *      }
 */
function getCISetup(blFromCS)
{
    var stLogTitle = "GETCISETUP";
    log("debug", stLogTitle, "START");
    
    var companyInfo = null;
    var currency = "";
    var isOW = null;

    if (blFromCS != true) {
        companyInfo = nlapiLoadConfiguration('companyinformation');
        currency = "";
    }
    
    if (isEmpty(GLOBAL_CI_SETUP_CONFIG))
    {
        if (blFromCS != true) {
            GLOBAL_USAGE_UNIT += 10;
            isOW = isOneWorld();
        }

        var arrFils = [];
        var arrCols = [];
        arrFils.push(new nlobjSearchFilter("isinactive", null, "is", "F"));
        
        arrCols.push(new nlobjSearchColumn(FLD_CUSTRECORD_NSTS_CI_ENABLE_FOR));
        arrCols.push(new nlobjSearchColumn(FLD_CUSTRECORD_NSTS_CI_ENABLE_CI));
        arrCols.push(new nlobjSearchColumn(FLD_CUSTRECORD_NSTS_CI_MIN_NO));
        arrCols.push(new nlobjSearchColumn(FLD_CUSTRECORD_NSTS_CI_MAX_NO));
        arrCols.push(new nlobjSearchColumn(FLD_CUSTRECORD_NSTS_CI_CREATE_ONLINE));
        arrCols.push(new nlobjSearchColumn(FLD_CUSTRECORD_NSTS_CI_SCHEDULE));
        arrCols.push(new nlobjSearchColumn(FLD_CUSTRECORD_NSTS_CI_SEARCH));
        arrCols.push(new nlobjSearchColumn(FLD_CUSTRECORD_NSTS_CI_SEARCH_DTL));
        arrCols.push(new nlobjSearchColumn(FLD_CUSTRECORD_NSTS_CI_INCLUDE_SUBCUST));
        arrCols.push(new nlobjSearchColumn(FLD_CUSTRECORD_NSTS_CI_BILLINGADDRESS));
        arrCols.push(new nlobjSearchColumn(FLD_CUSTRECORD_NSTS_CI_CURRENCY));
        arrCols.push(new nlobjSearchColumn(FLD_CUSTRECORD_NSTS_CI_CONTRACT));
        arrCols.push(new nlobjSearchColumn(FLD_CUSTRECORD_NSTS_CI_PROJECT));
        arrCols.push(new nlobjSearchColumn(FLD_CUSTRECORD_NSTS_CI_SOURCE));
        arrCols.push(new nlobjSearchColumn(FLD_CUSTRECORD_NSTS_CI_LOCATION));
        arrCols.push(new nlobjSearchColumn(FLD_CUSTRECORD_NSTS_CI_DUEDATE));
        arrCols.push(new nlobjSearchColumn(FLD_CUSTRECORD_NSTS_CI_TYPE));
        
        arrCols.push(new nlobjSearchColumn(FLD_CUSTRECORD_NSTS_CI_PER_PAGE));
        
        arrCols.push(new nlobjSearchColumn(FLD_CUSTRECORD_NSTS_CI_EMAIL_ATTACHMENT));
        arrCols.push(new nlobjSearchColumn(FLD_CUSTRECORD_NSTS_CI_EMAIL_TEMPLATE));
        arrCols.push(new nlobjSearchColumn(FLD_CUSTRECORD_NSTS_CI_EMAIL_SENDER));
        arrCols.push(new nlobjSearchColumn(FLD_CUSTRECORD_NSTS_CI_FAX_ATTACHMENT));
        arrCols.push(new nlobjSearchColumn(FLD_CUSTRECORD_NSTS_CI_FAX_SENDER));
        arrCols.push(new nlobjSearchColumn(FLD_CUSTRECORD_NSTS_CI_FAX_TEMPLATE));       
        arrCols.push(new nlobjSearchColumn(FLD_CUSTRECORD_NSTS_CI_CONTACT_CATEGORY));
        
        arrCols.push(new nlobjSearchColumn(FLD_CUSTRECORD_NSTS_CI_AS_FILE_IN_FOLDER));
        arrCols.push(new nlobjSearchColumn(FLD_CUSTRECORD_NSTS_CI_LAYOUT));
        arrCols.push(new nlobjSearchColumn(FLD_CUSTRECORD_NSTS_CI_ADMIN_EMAIL));
        arrCols.push(new nlobjSearchColumn(FLD_CUSTRECORD_NSTS_CI_EMAIL_SENDER));
        arrCols.push(new nlobjSearchColumn(FLD_CUSTRECORD_NSTS_CI_CONTACT_CATEGORY));
        arrCols.push(new nlobjSearchColumn(FLD_CUSTRECORD_NSTS_CI_UPDATE_DUEDATE));
        arrCols.push(new nlobjSearchColumn(FLD_CUSTRECORD_NSTS_CI_RESULT_PER_CHUCK));
        arrCols.push(new nlobjSearchColumn(FLD_CUSTRECORD_NSTS_CI_TRAN_AGE_BY_DAY));
        
        for (var i = 1; i <= 3; i++)
        {
            var _stFldTxtVal = FLD_CUSTRECORD_NSTS_CI_CUSTOM_FIELD.format(i);
            var _stFldType = FLD_CUSTRECORD_NSTS_CUSTOM_FIELD_TYPE.format(i);
            var _stFldSrc = FLD_CUSTRECORD_NSTS_CUSTOM_FIELD2_SRC.format(i);
            var _stFldId = FLD_CUSTRECORD_NSTS_CUSTOM_FIELD_ID.format(i);

            arrCols.push(new nlobjSearchColumn(_stFldTxtVal));
            arrCols.push(new nlobjSearchColumn(_stFldType));
            arrCols.push(new nlobjSearchColumn(_stFldSrc));
            arrCols.push(new nlobjSearchColumn(_stFldId));
        }

        var results = nlapiSearchRecord(RECTYPE_CUSTOMRECORD_NSTS_CI_SETUP, null, arrFils, arrCols);
        
        if (isEmpty(results)) { 
            //return null;
            throw nlapiCreateError(99999, 'No active CI Setup. Please check the CI Setup Record');
         }

        var stSuiteLet = "";
        if (blFromCS != true) {
            stSuiteLet = nlapiResolveURL("suitelet", SCRIPTID_ONLINE, DEPLOYMENTID_ONLINE);
        }

        var rec = results[0];
        var arrCustomFilter = [];
        var isCurrency = null;
        var stLayoutPDFTemplate = null;
        var stLayoutItemSaveSearch = null;
        var stLayoutSummaryBySearch = null;
        var stLayoutIslandscape = null; 
        var stLayoutTitleFontSize = null; 
        var stLayoutSubTitleFontSize = null;
        var stLayoutTHFontSize = null;
        var stLayoutTRFontSize = null;
        var stLayoutBodyFontSize = null;
        var stHeaderHeight = null;
        var stBillShipFontSize = null;
        var stBillShipTableHeight = null;
        var defaultLayoutId = null;
        
        var intNumberOfInvoucePerChuck = 2000;
        
        for (var i = 1; i <= 3; i++)
        {
            var _stFldTxtVal = FLD_CUSTRECORD_NSTS_CI_CUSTOM_FIELD.format(i);
            var _stFldType = FLD_CUSTRECORD_NSTS_CUSTOM_FIELD_TYPE.format(i);
            var _stFldSrc = FLD_CUSTRECORD_NSTS_CUSTOM_FIELD2_SRC.format(i);
            var _stFldId = FLD_CUSTRECORD_NSTS_CUSTOM_FIELD_ID.format(i);

            arrCustomFilter.push({
                value : rec.getValue(_stFldTxtVal) ,
                label : rec.getText(_stFldTxtVal) ,
                type : rec.getValue(_stFldType) ,
                src : rec.getValue(_stFldSrc) ,
                id : rec.getValue(_stFldId).toLowerCase() ,
            });
        }

        if (blFromCS != true) {
            defaultLayoutId = rec.getValue(FLD_CUSTRECORD_NSTS_CI_LAYOUT);
            
            var objLayout = nlapiLookupField(RECTYPE_CUSTOMRECORD_NSTS_CI_LAYOUT, defaultLayoutId, 
                    [
                    FLD_CUSTRECORD_NSTS_CI_PDF_TEMPLATE_FILE ,
                    FLD_CUSTRECORD_NSTS_CI_GEN_PDF_SEARCH_1 , 
                    FLD_CUSTRECORD_NSTS_CI_GEN_PDF_SEARCH_2 ,
                    
                    FLD_CUSTRECORD_NSTS_CI_IS_LANDSCAPE ,
                    FLD_CUSTRECORD_NSTS_CI_TITLE_FONT_SIZE ,
                    FLD_CUSTRECORD_NSTS_CI_SUB_TITLE_FONT_SIZE,
                    FLD_CUSTRECORD_NSTS_CI_TH_FONT_SIZE ,
                    FLD_CUSTRECORD_NSTS_CI_TR_FONT_SIZE ,
                    FLD_CUSTRECORD_NSTS_CI_BODY_FONT_SIZE,
                    
                    FLD_CUSTRECORDNSTS_CI_HEADER_HEIGHT,
                    FLD_CUSTRECORD_NSTS_CI_BILLSHIP_FONT_SIZE,
                    FLD_CUSTRECORD_NSTS_CI_BILLSHIP_TBL_HEIGHT,
                    
            ]);
            
            stLayoutPDFTemplate     = objLayout[FLD_CUSTRECORD_NSTS_CI_PDF_TEMPLATE_FILE];
            stLayoutItemSaveSearch  = objLayout[FLD_CUSTRECORD_NSTS_CI_GEN_PDF_SEARCH_1];
            stLayoutSummaryBySearch = objLayout[FLD_CUSTRECORD_NSTS_CI_GEN_PDF_SEARCH_2];
            
            stLayoutIslandscape         = objLayout[FLD_CUSTRECORD_NSTS_CI_IS_LANDSCAPE]; 
            stLayoutTitleFontSize       = objLayout[FLD_CUSTRECORD_NSTS_CI_TITLE_FONT_SIZE]; 
            stLayoutSubTitleFontSize    = objLayout[FLD_CUSTRECORD_NSTS_CI_SUB_TITLE_FONT_SIZE];
            stLayoutTHFontSize          = objLayout[FLD_CUSTRECORD_NSTS_CI_TH_FONT_SIZE];
            stLayoutTRFontSize          = objLayout[FLD_CUSTRECORD_NSTS_CI_TR_FONT_SIZE];
            stLayoutBodyFontSize        = objLayout[FLD_CUSTRECORD_NSTS_CI_BODY_FONT_SIZE];
            
            stHeaderHeight              = objLayout[FLD_CUSTRECORDNSTS_CI_HEADER_HEIGHT];
            stBillShipFontSize          = objLayout[FLD_CUSTRECORD_NSTS_CI_BILLSHIP_FONT_SIZE];
            stBillShipTableHeight       = objLayout[FLD_CUSTRECORD_NSTS_CI_BILLSHIP_TBL_HEIGHT];
            
            stLayoutTitleFontSize           = (isEmpty(stLayoutTitleFontSize))? 10 : stLayoutTitleFontSize;
            stLayoutSubTitleFontSize        = (isEmpty(stLayoutSubTitleFontSize))? 9 : stLayoutSubTitleFontSize;
            stLayoutTHFontSize              = (isEmpty(stLayoutTHFontSize))? 9 : stLayoutTHFontSize;
            stLayoutTRFontSize              = (isEmpty(stLayoutTRFontSize))? 8 : stLayoutTRFontSize;
            stLayoutBodyFontSize            = (isEmpty(stLayoutBodyFontSize))? 9 : stLayoutBodyFontSize;
            
            stHeaderHeight                  = (isEmpty(stHeaderHeight))? "35%" : stHeaderHeight;
            stBillShipFontSize              = (isEmpty(stBillShipFontSize))? 8 : stBillShipFontSize;
            stBillShipTableHeight           = (isEmpty(stBillShipTableHeight))? 100 : stBillShipTableHeight;
            
            log("debug", stLogTitle, "rec.getValue(FLD_CUSTRECORD_NSTS_CI_LAYOUT)" + rec.getValue(FLD_CUSTRECORD_NSTS_CI_LAYOUT) +  " ,stLayoutPDFTemplate:" + stLayoutPDFTemplate + " ,stLayoutItemSaveSearch" + stLayoutItemSaveSearch + " ,stLayoutSummaryBySearch" + stLayoutSummaryBySearch);

            isCurrency          = rec.getValue(FLD_CUSTRECORD_NSTS_CI_CURRENCY);
        }
        nlapiLogExecution('debug', 'layout:', 'default:' + defaultLayoutId + ' layoutid:' + stLayoutPDFTemplate);
        
        var contract            = rec.getValue(FLD_CUSTRECORD_NSTS_CI_CONTRACT);
        var project             = rec.getValue(FLD_CUSTRECORD_NSTS_CI_PROJECT);
        var location            = rec.getValue(FLD_CUSTRECORD_NSTS_CI_LOCATION);
        var includeSubCustomers = rec.getValue(FLD_CUSTRECORD_NSTS_CI_INCLUDE_SUBCUST);
        var uom                 = 'T';
        var intTranAge          = rec.getValue(FLD_CUSTRECORD_NSTS_CI_TRAN_AGE_BY_DAY);
        intTranAge              = isEmpty(intTranAge)? 0 : parseInt(intTranAge);
        
        intNumberOfInvoucePerChuck = rec.getValue(FLD_CUSTRECORD_NSTS_CI_RESULT_PER_CHUCK);
        intNumberOfInvoucePerChuck = isEmpty(intNumberOfInvoucePerChuck)? 2000: parseInt(intNumberOfInvoucePerChuck);
            
        var isProject;
        var isProjectEnable;
        var isLocation;
        var isContract = false;
        var iSMultiCur = null;

        var objContext  = nlapiGetContext();
        isProject       = objContext.getSetting("FEATURE", "jobs");
        isProjectEnable = isProject;
        if(project == "T")
        {

            if (blFromCS != true) {
                var isConsolidateJob    = nlapiLoadConfiguration("accountingpreferences").getFieldValue("CONSOLINVOICES");
                isConsolidateJob        = (isEmpty(isConsolidateJob))? "F" : isConsolidateJob;
                isProject               = (isProject == "T"  && isConsolidateJob == "F")? "T" : "F";
            }
        }
        else
        {
            isProject = "F";
        }
        
        isLocation              = (location == "T")? objContext.getSetting("FEATURE", "locations") : "F";
        isIncludeSubCustomers   = (includeSubCustomers == "T")? objContext.getSetting("FEATURE", "consolpayments") : "F";
        isContract              = (contract == "T")? isContractFeatureEnabled() : false;
        uom             = (objContext.getSetting('FEATURE', 'unitsofmeasure') == 'T')? 'T' : 'F';
        
        if (blFromCS != true) {
            iSMultiCur          = objContext.getSetting("FEATURE", "multicurrency");
            isCurrency              = (iSMultiCur != "T")? "F" : isCurrency;
            if(iSMultiCur == "T"){
                currency = companyInfo.getFieldValue("basecurrency");
            }
        }
        
        //Force Disable Feature if ever the Feature is On or OFF while not Updating The CI Setup Record
        if(isEmpty(isProject) || isProject == "F"){
            project = "F";
        }
        if(isEmpty(isLocation) || isLocation == "F"){
            location    = "F";
        }
        if(isEmpty(isIncludeSubCustomers) || isIncludeSubCustomers == "F"){
            includeSubCustomers = "F";
        }
        if(!isContract){
            contract = "F";
        }

        GLOBAL_CI_SETUP_CONFIG = {
            enableFor                     : parseInt(rec.getValue(FLD_CUSTRECORD_NSTS_CI_ENABLE_FOR)) ,
            enable_Consolidated_Invoicing : rec.getValue(FLD_CUSTRECORD_NSTS_CI_ENABLE_CI) ,
            enable_Online_Consolidation     : rec.getValue(FLD_CUSTRECORD_NSTS_CI_CREATE_ONLINE) ,
            enable_Scheduled_Consolidation  : rec.getValue(FLD_CUSTRECORD_NSTS_CI_SCHEDULE) ,

            maximumNumberChildInvoices      : rec.getValue(FLD_CUSTRECORD_NSTS_CI_MAX_NO) ,
            minimumNumberChildInvoices      : rec.getValue(FLD_CUSTRECORD_NSTS_CI_MIN_NO) ,
            sourceSavedSearch               : rec.getValue(FLD_CUSTRECORD_NSTS_CI_SEARCH) ,
            sourceSavedSearchDetail         : rec.getValue(FLD_CUSTRECORD_NSTS_CI_SEARCH_DTL) ,
            includeSubCustomers             : includeSubCustomers ,

            billaddress     : rec.getValue(FLD_CUSTRECORD_NSTS_CI_BILLINGADDRESS) ,
            filtersNote     : rec.getValue(FLD_CUSTRECORD_NSTS_CI_FILTERS_NOTE) ,
            contract        : contract ,
            project         : project ,
            source          : rec.getValue(FLD_CUSTRECORD_NSTS_CI_SOURCE) ,
            location        : location ,
            dueDate         : rec.getValue(FLD_CUSTRECORD_NSTS_CI_DUEDATE) ,
            invoiceType     : rec.getValue(FLD_CUSTRECORD_NSTS_CI_TYPE) ,
            suiteLetURL     : stSuiteLet ,          
            arrCustomFilter : arrCustomFilter ,
            uom                 : uom,
            
            adminEmail      : rec.getValue(FLD_CUSTRECORD_NSTS_CI_ADMIN_EMAIL),
            contactCategory : rec.getValue(FLD_CUSTRECORD_NSTS_CI_CONTACT_CATEGORY),
            updateDueDate   : rec.getValue(FLD_CUSTRECORD_NSTS_CI_UPDATE_DUEDATE),
            //Comunication
            isAttachToEmail     : rec.getValue(FLD_CUSTRECORD_NSTS_CI_EMAIL_ATTACHMENT) ,
            emailSenderUserId   : rec.getValue(FLD_CUSTRECORD_NSTS_CI_EMAIL_SENDER) ,
            emailTemplate       : rec.getValue(FLD_CUSTRECORD_NSTS_CI_EMAIL_TEMPLATE) ,
            isAttachToFax       : rec.getValue(FLD_CUSTRECORD_NSTS_CI_FAX_ATTACHMENT) ,
            faxSenderUserId     : rec.getValue(FLD_CUSTRECORD_NSTS_CI_FAX_SENDER) ,
            faxTemplate         : rec.getValue(FLD_CUSTRECORD_NSTS_CI_FAX_TEMPLATE) ,
            isToFileCabInFolder : rec.getValue(FLD_CUSTRECORD_NSTS_CI_AS_FILE_IN_FOLDER) ,
            isProjectEnabled    : isProjectEnable,
            //end Comunication
            invoicePerPage      : rec.getValue(FLD_CUSTRECORD_NSTS_CI_PER_PAGE) ,
            //Layout
            templateid              : stLayoutPDFTemplate ,
            pdfMainItemSaveSearch   : "" ,
            pdfSummaryBy            : "",
            
            numberOfInvoucePerChuck : intNumberOfInvoucePerChuck,
            tranAge                 : intTranAge
        };

        if (blFromCS != true) {
            GLOBAL_CI_SETUP_CONFIG.subsidiary = isOW;
            GLOBAL_CI_SETUP_CONFIG.currency = isCurrency;
            GLOBAL_CI_SETUP_CONFIG.ismultiCurrency = iSMultiCur;

            GLOBAL_CI_SETUP_CONFIG.isAttachToEmailDefault = rec.getValue(FLD_CUSTRECORD_NSTS_CI_EMAIL_ATTACHMENT);
            GLOBAL_CI_SETUP_CONFIG.emailSenderUserIdDefault = rec.getValue(FLD_CUSTRECORD_NSTS_CI_EMAIL_SENDER);
            GLOBAL_CI_SETUP_CONFIG.emailTemplateDefault = rec.getValue(FLD_CUSTRECORD_NSTS_CI_EMAIL_TEMPLATE);
            GLOBAL_CI_SETUP_CONFIG.isAttachToFaxDefault = rec.getValue(FLD_CUSTRECORD_NSTS_CI_FAX_ATTACHMENT);
            GLOBAL_CI_SETUP_CONFIG.faxSenderUserIdDefault = rec.getValue(FLD_CUSTRECORD_NSTS_CI_FAX_SENDER);
            GLOBAL_CI_SETUP_CONFIG.faxTemplateDefault = rec.getValue(FLD_CUSTRECORD_NSTS_CI_FAX_TEMPLATE);
            GLOBAL_CI_SETUP_CONFIG.isToFileCabInFolderDefault = rec.getValue(FLD_CUSTRECORD_NSTS_CI_AS_FILE_IN_FOLDER);
            GLOBAL_CI_SETUP_CONFIG.pdfCISaveSearch1 = stLayoutItemSaveSearch;
            GLOBAL_CI_SETUP_CONFIG.pdfCISaveSearch2 = stLayoutSummaryBySearch;
            GLOBAL_CI_SETUP_CONFIG.layoutIslandscape = stLayoutIslandscape;
            GLOBAL_CI_SETUP_CONFIG.layoutTitleFontSize = stLayoutTitleFontSize;
            GLOBAL_CI_SETUP_CONFIG.layoutSubTitleFontSize = stLayoutSubTitleFontSize;
            GLOBAL_CI_SETUP_CONFIG.layoutTHFontSize = stLayoutTHFontSize;
            GLOBAL_CI_SETUP_CONFIG.layoutTRFontSize = stLayoutTRFontSize;
            GLOBAL_CI_SETUP_CONFIG.layoutBodyFontSize = stLayoutBodyFontSize;
            GLOBAL_CI_SETUP_CONFIG.headerHeight = stHeaderHeight;
            GLOBAL_CI_SETUP_CONFIG.billshipFontSize = stBillShipFontSize;
            GLOBAL_CI_SETUP_CONFIG.billshipTableHeight = stBillShipTableHeight;
            GLOBAL_CI_SETUP_CONFIG.defaultLayoutId = defaultLayoutId;
            GLOBAL_CI_SETUP_CONFIG.baseCurrency = currency;
        }
    }
    
    log("debug", stLogTitle, "END");
    return GLOBAL_CI_SETUP_CONFIG;
}

var OBJRESENDCOMMUNICATION;
function resendCommunication(url)
{
    OBJRESENDCOMMUNICATION = window.open(url, "Consolidate Customer Invoices", "height=" + (screen.height - 250) + ",width=" + (screen.width - 200) +",scrollbars=yes");
    OBJRESENDCOMMUNICATION.focus();
}

/**
 * this function is a client Side function for CI on Customer Screen. 
 * this function is injected on beforeload of Customer record
 * @param url
 */
function customerOnScreenCI(url)
{
    OBJCICUSTOMERONSCREENWINDOW = window.open(url, "Consolidate Customer Invoices", "height=" + (screen.height - 250) + ",width=" + (screen.width - 200) +",scrollbars=yes");
    OBJCICUSTOMERONSCREENWINDOW.focus();
}

/**
 * =================================================
 * NS Lib by MTS
 * =================================================
 */

var NSUtil = (typeof NSUtil === 'undefined') ? {} : NSUtil;

/**
 * Pauses the scheduled script either if the remaining usage is less than
 * the specified governance threshold usage amount or the allowed time is
 * @param {Number} intGovernanceThreshold - The value of the governance threshold  usage units before the script will be rescheduled.
 * @param {Number} intStartTime - The time when the scheduled script started
 * @param {Number} intMaxTime - The maximum time (milliseconds) for the script to reschedule. Default is 1 hour.
 * @param {Number} flPercentOfAllowedTime - the percent of allowed time based from the maximum running time. The maximum running time is 3600000 ms.
 * @returns {Number} - intCurrentTime
 * @author memeremilla
 */
NSUtil.rescheduleScript = function(intGovernanceThreshold, intStartTime, intMaxTime, flPercentOfAllowedTime)
{
    if (intGovernanceThreshold == null && intStartTime == null)
    {
        throw nlapiCreateError('SSS_MISSING_REQD_ARGUMENT', 'rescheduleScript: Missing a required argument. Either intGovernanceThreshold or intStartTime should be provided.');
    }

    var stLoggerTitle = 'rescheduleScript';
    nlapiLogExecution('DEBUG', stLoggerTitle, 'Script State : ' + JSON.stringify(
        {
            'Remaining usage' : nlapiGetContext().getRemainingUsage()
        }));

    if (intMaxTime == null)
    {
        intMaxTime = 3600000;
    }

    var intRemainingUsage = nlapiGetContext().getRemainingUsage();
    var intRequiredTime = 900000; // 25% of max time
    if ((flPercentOfAllowedTime))
    {
        var flPercentRequiredTime = 100 - flPercentOfAllowedTime;
        intRequiredTime = intMaxTime * (flPercentRequiredTime / 100);
    }

    // check if there is still enough usage units
    if ((intGovernanceThreshold))
    {
        nlapiLogExecution('DEBUG', stLoggerTitle, 'Script State : ' + 'Checking if there is still enough usage units.');

        if (intRemainingUsage < (parseInt(intGovernanceThreshold, 10) + parseInt(20, 10)))
        {
            nlapiLogExecution('DEBUG', stLoggerTitle, 'Script State : ' + JSON.stringify(
                {
                    'Remaining usage' : nlapiGetContext().getRemainingUsage()
                }));
            nlapiLogExecution('DEBUG', stLoggerTitle, 'Script State : ' + 'Rescheduling script.');

            var objYield = null;
            try
            {
                nlapiLogExecution('DEBUG', stLoggerTitle, 'Script State : nlapiYieldScript');
                objYield = nlapiYieldScript();
                nlapiLogExecution('DEBUG', stLoggerTitle, 'Script State : nlapiYieldScript is Done!');
            }
            catch (e)
            {
                if (e.getDetails != undefined)
                {
                    throw e;
                }
                else
                {
                    if (e.toString().indexOf('NLServerSideScriptException') <= -1)
                    {
                        throw e;
                    }
                    else
                    {
                        objYield =
                            {
                                'Status' : 'FAILURE',
                                'Reason' : e.toString(),
                            };
                    }
                }
            }

            if (objYield.status == 'FAILURE')
            {
                nlapiLogExecution('DEBUG', stLoggerTitle, 'f : ' + 'Unable to Yield.');
                nlapiLogExecution('DEBUG', stLoggerTitle, 'Script State : ' + JSON.stringify(
                    {
                        'Status' : objYield.status,
                        'Information' : objYield.information,
                        'Reason' : objYield.reason
                    }));
            }
            else
            {
                nlapiLogExecution('DEBUG', stLoggerTitle, 'Script State : ' + 'Successfully reschedule the script.');
                nlapiLogExecution('DEBUG', stLoggerTitle, 'Script State : ' + JSON.stringify(
                    {
                        'After resume with' : intRemainingUsage,
                        'Remaining vs governance threshold' : intGovernanceThreshold
                    }));
            }
        }
    }

    if ((intStartTime != null && intStartTime != 0))
    {
        // get current time
        var intCurrentTime = new Date().getTime();

        // check if elapsed time is near the arbitrary value
        nlapiLogExecution('DEBUG', stLoggerTitle, 'Script State : ' + 'Check if elapsed time is near the arbitrary value.');

        var intElapsedTime = intMaxTime - (intCurrentTime - intStartTime);
        nlapiLogExecution('DEBUG', stLoggerTitle, 'Script State : ' + 'Remaining time is ' + intElapsedTime + ' ms.');

        if (intElapsedTime < intRequiredTime)
        {
            nlapiLogExecution('AUDIT', stLoggerTitle, 'Script State : ' + 'Rescheduling script.');

            // check if we are not reaching the max processing time which is 3600000 secondsvar objYield = null;
            try
            {
                nlapiLogExecution('DEBUG', stLoggerTitle, 'Script State : nlapiYieldScript by time');
                objYield = nlapiYieldScript();
                nlapiLogExecution('DEBUG', stLoggerTitle, 'Script State : nlapiYieldScript by time Done!');
            }
            catch (e)
            {
                if (e.getDetails != undefined)
                {
                    throw e;
                }
                else
                {
                    if (e.toString().indexOf('NLServerSideScriptException') <= -1)
                    {
                        throw e;
                    }
                    else
                    {
                        objYield =
                            {
                                'Status' : 'FAILURE',
                                'Reason' : e.toString(),
                            };
                    }
                }
            }

            if (objYield.status == 'FAILURE')
            {
                nlapiLogExecution('DEBUG', stLoggerTitle, 'Script State : ' + 'Unable to Yield.');
                nlapiLogExecution('DEBUG', stLoggerTitle, 'Script State : ' + JSON.stringify(
                    {
                        'Status' : objYield.status,
                        'Information' : objYield.information,
                        'Reason' : objYield.reason
                    }));
            }
            else
            {
                nlapiLogExecution('DEBUG', stLoggerTitle, 'Script State : ' + 'Successfully reschedule the script.');
                nlapiLogExecution('DEBUG', stLoggerTitle, 'Script State : ' + JSON.stringify(
                    {
                        'After resume with' : intRemainingUsage,
                        'Remaining vs governance threshold' : intGovernanceThreshold
                    }));

                // return new start time
                intStartTime = new Date().getTime();
            }
        }
    }
    nlapiLogExecution('DEBUG', stLoggerTitle, 'Script State : DONE!');
    return intStartTime;
};

/**
 * (DEPRECATED, use NSUtil.reschedule instead) Checks governance then calls yield
 * @param   {Integer} intGovernanceThreshold     *
 * @returns {Void}
 * @author memeremilla
 */
NSUtil.checkGovernance = function(intGovernanceThreshold)
{
    if (intGovernanceThreshold == null)
    {
        throw nlapiCreateError('SSS_MISSING_REQD_ARGUMENT', 'checkGovernance: Missing a required argument "intGovernanceThreshold".');
    }

    var objContext = nlapiGetContext();

    if (objContext.getRemainingUsage() < intGovernanceThreshold)
    {
        var objState = nlapiYieldScript();
        if (objState.status == 'FAILURE')
        {
            nlapiLogExecution("ERROR", "Failed to yield script, exiting: Reason = " + objState.reason + " / Size = " + objState.size);
            throw "Failed to yield script";
        }
        else if (objState.status == 'RESUME')
        {
            nlapiLogExecution("AUDIT", "Resuming script because of " + objState.reason + ".  Size = " + objState.size);
        }
    }
};

/**
 * This dived the
 * @param array
 * @param size
 * @returns {Array}
 */
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

/**
 * get the time interval in seconds
 * @param dt1
 * @param dt2
 * @returns {Number}
 */
function getInterval(dt1,dt2){
    return (((dt2 - dt1)/1000)/60);
}