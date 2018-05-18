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
 * A common function used in both online CI and Scheduled CI this 
 * function helps to translated the data came from the online and Scheduled CI in order to
 * complete the process of consolidation Invoices.
 * @param objKeys : {
 *          arrSelectedInvoices,
 *          customer,
 *          data,
 *          ciId,
 *          stCIDateFlag,
 *          stCIDate,
 *          stAsOfDate,
 *      }
 * @param objciRecord nlobjRecord
 * @param objLogs : {
 *          search : [],
 *          cicreate : [],
 *          pdf : [],
 *          email : [],
 *          fax : [],
 *          inv : [],
 *          ci : [],
 *          err : []
 *      }
 * @param ciConfig : getCIConfig()
 * @param objCIFilters
 * @returns internal id of CI Record
 */
function processMainCITransaction(objKeys,objciRecord,objLogs,ciConfig,objCIFilters,arrAREmails,objTerm)
{
    var arrSelectedInvoices = objKeys.arrSelectedInvoices;
    var customerId          = objKeys.customer;
    var ciId                = objKeys.ciId;
    var updateDueDate       = objKeys.updateDueDate;
    var hasErrors = false;
    var origCiId = null;
    
    var stLogTitle = "PROCESSMAINCITRANSACTION";

    /**
     * @TODO: CI v2.5
     * remove this in CI V2.5
     * nlapiSubmitField(RECTYPE_CUSTOMRECORD_NSTS_CI_TASK,HC_TASK_ID,FLD_CUSTRECORD_NSTS_CI_TASK_STATUS,IN_PROCESS);
     */
    if(updateDueDate == 'T'){
        getCITask({
            taskid: objCIFilters.taskid,
            fields:{
            custrecord_nsts_ci_tasl_updt_due_date: 'T'
        }})
        log('DEBUG',stLogTitle,"getCITask #1 ID:" + HC_TASK_ID);
    }

    if (isEmpty(arrSelectedInvoices))
    {
        arrSelectedInvoices = [];
        objCIFilters.customer = customerId;
        arrSelectedInvoices = getInvoiceIdwithFilter(objCIFilters,objKeys.data);
    }

    
    var stCIDate = getCIDate(objKeys,arrSelectedInvoices,ciConfig);
    stCIDate = isEmpty(stCIDate) ? nlapiDateToString(new Date) : stCIDate;
    
    var currency    = isEmpty(objKeys.data["currency"])? null : objKeys.data["currency"].value;
    var billaddress = isEmpty(objKeys.data["billaddress"])? null : objKeys.data["billaddress"].value;
    var location    = isEmpty(objKeys.data["location"])? null : objKeys.data["location"].value;
    var duedate     = isEmpty(objKeys.data["duedate"])? null :  objKeys.data["duedate"].value;
    var contract    = isEmpty(objKeys.data[FLD_CUSTBODY_CONTRACT_NAME])? null : objKeys.data[FLD_CUSTBODY_CONTRACT_NAME].text;
    var jobmain     = isEmpty(objKeys.data["internalid"])? null : objKeys.data["internalid"].value;
    var source      = isEmpty( objKeys.data["source"])? null : objKeys.data["source"].text;
    
    var subsidiary  = null;
    var subCurrency = null;
    if(isOneWorld() == "T"){
        subsidiary = nlapiLookupField("customer", customerId, "subsidiary");
        subCurrency = nlapiLookupField("subsidiary", subsidiary, "currency");
    }

    var currencyFilters = {
            subsidiary : subsidiary,
            subCurrency : subCurrency,
            currency : currency,
            baseCurrency : ciConfig.baseCurrency
    };
    
    var ciSummary = getCISummaryTotals(arrSelectedInvoices,ciConfig,currencyFilters);
    
    // ATLAS Enhancement - Use customer/preferred term to populate CI due date
    var stCIDueDate = stCIDate;
    var objCustTerm = getTerm(customerId);
    var stTerm = '';
    objCustTerm = (!isEmpty(objCustTerm)) ? objCustTerm : objTerm;
    
    if (!isEmpty(objCustTerm)) {
        if(updateDueDate == "T"){
            var dtCIDueDate = nlapiStringToDate(stCIDueDate);
            dtCIDueDate = nlapiAddDays(dtCIDueDate, (isEmpty(objCustTerm.termDays) ? 0 : objCustTerm.termDays));
            stCIDueDate = nlapiDateToString(dtCIDueDate);
        }
        stTerm = objCustTerm.id;
    }
    
    log("debug", stLogTitle,"currency:"+ currency + " currencyFilters:" + JSON.stringify(currencyFilters) +  " ciSummary:" +JSON.stringify(ciSummary));
    
    if (isEmpty(objciRecord))
    {
        
        var intTskId = getCITask({taskid: objCIFilters.taskid}).getId();

        var arrCIFields = [
                FLD_CUSTRECORD_NSTS_CI_ISPROCESSED,
                FLD_CUSTRECORD_NSTS_CI_SELECTED_INV,
                FLD_CUSTRECORD_NSTS_CI_DATE,

                FLD_CUSTRECORD_NSTS_CI_PDF_SUBTOTAL,
                FLD_CUSTRECORD_NSTS_CI_PDF_ITEMTOTAL,
                FLD_CUSTRECORD_NSTS_CI_PDF_DISCOUNT,
                FLD_CUSTRECORD_NSTS_CI_PDF_TAX,
                FLD_CUSTRECORD_NSTS_CI_PDF_SHIPPING_HANDLING,
                FLD_CUSTRECORD_NSTS_CI_PDF_AMOUNTPAID,
                FLD_CUSTRECORD_NSTS_CI_PDF_TOTAL_DUE,
                
                FLD_CUSTRECORD_NSTS_CI_PREF_BILLADDRESS,
                FLD_CUSTRECORD_NSTS_CI_PREF_LOCATION,
                FLD_CUSTRECORD_NSTS_CI_PREF_DUEDATE,
                FLD_CUSTRECORD_NSTS_CI_PREF_CONTRACT,
                FLD_CUSTRECORD_NSTS_CI_PREF_PROJECT,
                FLD_CUSTRECORD_NSTS_CI_PREF_SOURCE,
                FLD_CUSTRECORD_NSTS_CI_STATUS_LIST,
                FLD_CUSTRECORD_NSTS_CI_TRAN_DUEDATE,
                FLD_CUSTRECORD_NSTS_CI_TERM,
                FLD_CUSTRECORDNSTS_CI_TASK
        ];
        var arrCIValues = [
                "T",
                arrSelectedInvoices,
                stCIDate ,

                ciSummary.subtotal,
                ciSummary.itemtotal,
                ciSummary.discount,
                ciSummary.tax,
                ciSummary.shippingamount,
                ciSummary.amountpaid,
                ciSummary.totaldue,
                
                billaddress,
                location,
                duedate,
                contract,
                jobmain,
                source,
                CI_STATUS_COMPLETE,
                stCIDueDate,
                stTerm,
                intTskId
        ];

        if(ciConfig.ismultiCurrency == "T"){
            arrCIFields.push(FLD_CUSTRECORD_NSTS_CI_PREF_CURRENCY);
            arrCIValues.push(currency);
        }
        
        if (updateDueDate == true || updateDueDate =='T') {
            arrCIFields.push(FLD_CUSTRECORD_NSTS_CI_CLD_INV_DUEDATE_UPD);
            arrCIValues.push('T');
        }
        
        try
        {
            nlapiSubmitField(RECTYPE_CUSTOMRECORDSS_NSTS_CI_CONSOLIDATE_INVOICE, ciId, arrCIFields, arrCIValues);
            arrCIFields = null;
            arrCIValues = null;
            //USAGE_STARTTIME = NSUtil.rescheduleScript(USAGE_LIMIT, USAGE_STARTTIME, USAGE_MAXTIMEINTERVALINMS)
            var objLog = {
                    intId: ciId, 
                    msg:'CI Update Success: CI ID - ' + ciId + ' Set To "Processed".'
            };
            objLogs.ci.push(objLog);
        }
        catch(e)
        {
            //objLogs.ci.push('CI Update Error: Error Updating CI ID - ' + ciId + '. Details: ' + e.toString());
            //objLogs.err.push('CI Update Error: Error Updating CI ID - ' + ciId + '.  Details: ' + e.toString());
            var objLog = {
                    intId: ciId, 
                    msg:'CI Update Error: Error Updating CI ID - ' + ciId + '. Details: ' + e.toString()
            };
            objLogs.ci.push(objLog);
            objLogs.err.push(objLog);
            
            log("error", "error", e.toString());
            hasErrors = true;
            
            
            getCITask({taskid: objCIFilters.taskid});
            appendCILog({
                taskid: objCIFilters.taskid,
                message: 'ERROR: ' + e
            });
            getCITask({taskid: objCIFilters.taskid, doSave: true });
            
        }finally{
            objciRecord = nlapiLoadRecord(RECTYPE_CUSTOMRECORDSS_NSTS_CI_CONSOLIDATE_INVOICE, ciId);
            USAGE_STARTTIME = NSUtil.rescheduleScript(USAGE_LIMIT, USAGE_STARTTIME, USAGE_MAXTIMEINTERVALINMS)
        }

    }
    else
    {       
        if(ciId <= 0)
        {
            try
            {
                var ciCount = (isEmpty(arrSelectedInvoices))? 0: arrSelectedInvoices.length;
                objciRecord.setFieldValues(FLD_CUSTRECORD_NSTS_CI_SELECTED_INV, arrSelectedInvoices);
                objciRecord.setFieldValue(FLD_CUSTRECORD_NSTS_CI_CUSTOMER, customerId);
                objciRecord.setFieldValue(FLD_CUSTRECORD_NSTS_CI_SAVED_IN_SERVERSIDE, "T");
                objciRecord.setFieldValue(FLD_CUSTRECORD_NSTS_CI_ISPROCESSED, "T");
                objciRecord.setFieldValue(FLD_CUSTRECORD_NSTS_CI_PDF_SUBTOTAL, ciSummary.subtotal);
                objciRecord.setFieldValue(FLD_CUSTRECORD_NSTS_CI_PDF_ITEMTOTAL, ciSummary.itemtotal);
                objciRecord.setFieldValue(FLD_CUSTRECORD_NSTS_CI_PDF_DISCOUNT, ciSummary.discount);
                objciRecord.setFieldValue(FLD_CUSTRECORD_NSTS_CI_PDF_TAX, ciSummary.tax);
                objciRecord.setFieldValue(FLD_CUSTRECORD_NSTS_CI_PDF_SHIPPING_HANDLING, ciSummary.shippingamount);
                objciRecord.setFieldValue(FLD_CUSTRECORD_NSTS_CI_PDF_AMOUNTPAID, ciSummary.amountpaid); 
                objciRecord.setFieldValue(FLD_CUSTRECORD_NSTS_CI_PDF_TOTAL_DUE, ciSummary.totaldue);            
                objciRecord.setFieldValue(FLD_CUSTRECORD_NSTS_CI_DATE, stCIDate);
                objciRecord.setFieldValue(FLD_CUSTRECORD_NSTS_CI_COUNT_INVOICES, ciCount);
                
                objciRecord.setFieldValue(FLD_CUSTRECORD_NSTS_CI_PREF_BILLADDRESS, billaddress);
                objciRecord.setFieldValue(FLD_CUSTRECORD_NSTS_CI_PREF_LOCATION, location);
                objciRecord.setFieldValue(FLD_CUSTRECORD_NSTS_CI_PREF_DUEDATE, duedate);
                objciRecord.setFieldValue(FLD_CUSTRECORD_NSTS_CI_PREF_CONTRACT, contract);
                objciRecord.setFieldValue(FLD_CUSTRECORD_NSTS_CI_PREF_PROJECT, jobmain);
                objciRecord.setFieldValue(FLD_CUSTRECORD_NSTS_CI_PREF_SOURCE, source);
                objciRecord.setFieldValue(FLD_CUSTRECORD_NSTS_CI_STATUS_LIST, CI_STATUS_COMPLETE);
                objciRecord.setFieldValue(FLD_CUSTRECORD_NSTS_CI_TRAN_DUEDATE, stCIDueDate);
                objciRecord.setFieldValue(FLD_CUSTRECORD_NSTS_CI_TERM, stTerm);
                
                
                if (updateDueDate == true || updateDueDate =='T') {
                    objciRecord.setFieldValue(FLD_CUSTRECORD_NSTS_CI_CLD_INV_DUEDATE_UPD, "T");
                }
                
                if(ciConfig.ismultiCurrency == "T"){
                    objciRecord.setFieldValue(FLD_CUSTRECORD_NSTS_CI_PREF_CURRENCY, currency);
                }
                

                ciId = nlapiSubmitRecord(objciRecord, true, true);
                objciRecord = nlapiLoadRecord(RECTYPE_CUSTOMRECORDSS_NSTS_CI_CONSOLIDATE_INVOICE, ciId);
                var objLog = {
                    intId: ciId, 
                    msg:'CI Create Record Success: CI ID - ' + ciId + ' for Customer ID - ' + customerId
                };
                objLogs.cicreate.push(objLogs);
                USAGE_STARTTIME = NSUtil.rescheduleScript(USAGE_LIMIT, USAGE_STARTTIME, USAGE_MAXTIMEINTERVALINMS)
            }
            catch (e)
            {
                var objLog = {
                        intId: ciId, 
                        msg:'CI Create Error: Customer ID - ' + customerId + '. Details: ' + e.toString()
                };
                objLogs.cicreate.push(objLog);
                objLogs.err.push(objLog);
                
                getCITask({taskid: objCIFilters.taskid});
                appendCILog({
                    taskid: objCIFilters.taskid,
                    message: 'ERROR: ' + e
                });
                getCITask({taskid: objCIFilters.taskid, doSave: true });
            }
        }
    }
    
    try
    {
        
        processGeneratePDF(ciId, objciRecord, ciConfig, objLogs.pdf, objLogs.email, objLogs.fax, objLogs.err, arrAREmails);
    }
    catch(e)
    {
        log('error', stLogTitle, "Deleting CI Custom Record " + ciId + " Due to Error Generating PDF : " + e.toString());                
        var objLog = {
                intId: ciId, 
                msg:"PDF Error: Deleting CI Custom Record " + ciId + " Due to Error Generating PDF - " + e.toString()
        };
        objLogs.pdf.push(objLog);
        objLogs.err.push(objLog);
        objLog = null;
        getCITask({taskid: objCIFilters.taskid});
        appendCILog({
            taskid: objCIFilters.taskid,
            message: 'ERROR: ' + e
        });

        
        try{
            nlapiDeleteRecord(RECTYPE_CUSTOMRECORDSS_NSTS_CI_CONSOLIDATE_INVOICE, ciId);
            origCiId = ciId;
            ciId = -1;
            hasErrors = true;
        }catch(e){
            getCITask({taskid: objCIFilters.taskid});
            appendCILog({
                taskid: objCIFilters.taskid,
                message: 'ERROR: ' + e
            });
        }
        getCITask({taskid: objCIFilters.taskid, doSave: true });
    }
    
    var arrInvoices = objciRecord.getFieldValues(FLD_CUSTRECORD_NSTS_CI_SELECTED_INV);      
    log("debug",stLogTitle, "generatePDF arrInvoices" + arrInvoices.toString());
    
    //objLogs.inv.push("Customer ID: " + customerId + " CI No: " + ciId + "  ---Start: Update Child Invoice Process---");            
    var objLog = {
            intId: ciId, 
            msg:"Customer ID: " + customerId + " CI No: " + ciId + "  ---Start: Update Child Invoice Process---"
    };
    objLogs.inv.push(objLog);
    
    if (hasErrors) {
        if (ciId > 0) {
            try {
                nlapiSubmitField(RECTYPE_CUSTOMRECORDSS_NSTS_CI_CONSOLIDATE_INVOICE, ciId, FLD_CUSTRECORD_NSTS_CI_STATUS_LIST, CI_STATUS_FAILED);
            } catch(e) {}
        } else if (!isEmpty(origCiId)) {
            // Remove reference to deleted CI
            for(var logtype in objLogs)
            {
                if(objLogs[logtype].length > 0)
                {
                    var arrCiLogMsg = [];
                    var arrCiNum = [];
                    for (var intLogEntry = 0; intLogEntry < objLogs[logtype].length; intLogEntry++) {
                        var objLog = objLogs[logtype][intLogEntry];
                        
                        if (!isEmpty(objLog['intId']) && objLog['intId'] == origCiId) {
                            objLogs[logtype][intLogEntry]['intId'] = null;
                        }
                    }
                }        
            }        
        }
        
        try{
            nlapiSubmitField('customer', customerId, [FLD_CUSTENTITY_NSTS_CI_IN_PROCESS,FLD_CUSTENTITY_NSTS_CI_LOCK_INUI], ['F','F']);
        }catch(ex){
            var objLog = {
                    intId: ciId, 
                    msg:"Customer ID: " + customerId + " CI No: " + ciId + "  ---Complete: Update Child Invoice Process---"
            };
        }
    }
    
    //objLogs.inv.push("Customer ID: " + customerId + " CI No: " + ciId + "  ---Complete: Update Child Invoice Process---");
    var objLog = {
            intId: ciId, 
            msg:"Customer ID: " + customerId + " CI No: " + ciId + "  ---Complete: Update Child Invoice Process---"
    };
    
    objLogs.inv.push(objLog);

    ciId = parseInt(ciId);
    ciId = ciId? ciId : 0;
    
    objciRecord = null
    objLog = null;
    arrInvoices = null;
    ciSummary = null
    objCustTerm = null;
    
    USAGE_STARTTIME = NSUtil.rescheduleScript(USAGE_LIMIT, USAGE_STARTTIME, USAGE_MAXTIMEINTERVALINMS)
    return ciId;
}

/**
 * this function will generate the PDF file and store it on the file cabinet
 * defending on the Configuration this function will aso distribute the PDF via Email or Fax 
 * @param ciId internalid of the CI Record
 * @param recCI nlobjRecord
 * @param ciConfig getCISetup()
 * @param arrPDFLog array
 * @param arrEmailLog array
 * @param arrFaxLog array
 * @param arrErrors array
 */
function processGeneratePDF(ciId, recCI, ciConfig, arrPDFLog, arrEmailLog, arrFaxLog, arrErrors, arrAREmails)
{
    var stLogTitle = "PROCESSGENERATEPDF";
    /*performance issue change*/
    if(isEmpty(ciConfig)){
        ciConfig = getCISetup();
    }
    
    //USAGE_STARTTIME = NSUtil.rescheduleScript(USAGE_LIMIT, USAGE_STARTTIME, USAGE_MAXTIMEINTERVALINMS)
    var stCIName = recCI.getFieldValue('name');/*performance issue change*/
    var stCustomerId = recCI.getFieldValue(FLD_CUSTRECORD_NSTS_CI_CUSTOMER);
    var arrSelectInvoice = recCI.getFieldValues(FLD_CUSTRECORD_NSTS_CI_SELECTED_INV);
    
    nlapiLogExecution('debug', 'customer', stCustomerId);
    var objCustomer = nlapiLoadRecord("customer", stCustomerId);
    var objCompany = nlapiLoadConfiguration('companyinformation');

    var FLD_CUSTENTITY_NSTS_CI_DEFAULT_LAYOUT = "custentity_nsts_ci_default_layout";
    var layoutId = objCustomer.getFieldValue(FLD_CUSTENTITY_NSTS_CI_DEFAULT_LAYOUT);
    ciConfig = getLayout(layoutId);
    
    nlapiLogExecution('debug', 'template', ciConfig.templateid + ' default:' + ciConfig.defaultLayoutId + ' layout:' + layoutId);
    var objCITemplate;
    if(ciConfig.defaultLayoutId != layoutId){
        objCITemplate = nlapiLoadFile(ciConfig.templateid);//3541
    }
    else
    {
        objCITemplate = (isEmpty(ciConfig.objTemplatePDFFile))? nlapiLoadFile(ciConfig.templateid) : ciConfig.objTemplatePDFFile;
    }

    var xml = null;
    var filePDF = null;
    var arrCi1 = null;
    var arrCi2 = null;
    var renderer = null;
    var xmlContent = null;
    var arrRecord = null;
    if (objCITemplate)
    {
        xml = objCITemplate.getValue();
        objCITemplate = null;
        xml = isEmpty(xml)? "": xml;
        ciConfig = getCustomerRef(objCustomer);
        var emailSenderUserId = ciConfig.emailSenderUserId;
        var faxSenderUserId = ciConfig.faxSenderUserId;
        
        log("debug", stLogTitle, "ciConfig.customerscreen:" + ciConfig.customerscreen);

        var subsidiary = objCustomer.getFieldValue("subsidiary");
        var currency = recCI.getFieldValue(FLD_CUSTRECORD_NSTS_CI_PREF_CURRENCY);
        var subCurrency = null;
        if(isOneWorld() == "T"){
            subCurrency = nlapiLookupField("subsidiary", subsidiary, "currency");
        }
        
        var currencyFilters = null;
        if(ciConfig.ismultiCurrency == "T"){
            currencyFilters = {
                    subsidiary : subsidiary,
                    subCurrency : subCurrency,
                    currency : currency,
                    baseCurrency : ciConfig.baseCurrency
            };
        }

        log('DEBUG', stLogTitle, "INVOKING getInvoiceLines");
        arrCi1 = getInvoiceLines(ciConfig.pdfCISaveSearch1, arrSelectInvoice, ciConfig,currencyFilters);
        arrCi2 = getInvoiceLines(ciConfig.pdfCISaveSearch2, arrSelectInvoice, ciConfig,currencyFilters);
        arrCi1 = isEmpty(arrCi1)? []: arrCi1;
        arrCi2 = isEmpty(arrCi2)? []: arrCi2;
        log('DEBUG', stLogTitle, "END INVOKING getInvoiceLines");
        
        xml = processSearchExpression(xml,arrCi1,"invoiceline");
        xml = processSearchExpression(xml,arrCi2,"invoiceline2");

        xml = xml.replace(/\{bodyFontSize\}/g,ciConfig.layoutBodyFontSize);
        xml = xml.replace(/\{titleFontSize\}/g,ciConfig.layoutTitleFontSize);
        xml = xml.replace(/\{subTitleFontSize\}/g,ciConfig.layoutSubTitleFontSize);
        xml = xml.replace(/\{thFontSize\}/g,ciConfig.layoutTHFontSize);
        xml = xml.replace(/\{trFontSize\}/g,ciConfig.layoutTRFontSize);
        xml = xml.replace(/\{headerHeight\}/g,ciConfig.headerHeight);
        xml = xml.replace(/\{billshipFontSize\}/g,ciConfig.billshipFontSize);
        xml = xml.replace(/\{billshipTBLHeight\}/g,ciConfig.billshipTableHeight);
        
        var landscape = (ciConfig.layoutIslandscape=="T")? 'size="letter-landscape"' : "";
        xml = xml.replace(/\{isLandscape\}/g,landscape);

        try
        {
            var stLogoUrl = "";         
            var intLogoid = objCompany.getFieldValue("formlogo");
                        
            if(!isEmpty(intLogoid))
            {
                var objLogo = nlapiLoadFile(intLogoid);
                if(objLogo)
                {
                    stLogoUrl = objLogo.getURL();
                    log("debug", stLogTitle, "setting Logo : stLogoUrl: " + stLogoUrl);
                    stLogoUrl = nlapiEscapeXML(stLogoUrl);
                }
            }
            
            var stCompAddress = objCompany.getFieldValue("mainaddress_text");
                stCompAddress = isEmpty(stCompAddress)? "" : stCompAddress;
                stCompAddress = stCompAddress.replace(/\n/g,"<br/>");
            
                var currencySymbol = "";
                if(ciConfig.ismultiCurrency == "T"){
                    currencySymbol = recCI.getFieldValue(FLD_CUSTRECORD_NSTS_CI_PREF_CURRENCY);
                    
                    if(!isEmpty(currencySymbol)){
                        //USAGE_STARTTIME = NSUtil.rescheduleScript(USAGE_LIMIT, USAGE_STARTTIME, USAGE_MAXTIMEINTERVALINMS);
                        var recCurr = nlapiLoadRecord('currency', currencySymbol);
                        var currencySymbol_temp = (!isEmpty(recCurr)) ? recCurr.getFieldValue('displaysymbol') : null;
                        currencySymbol = (!isEmpty(recCurr)) ? recCurr.getFieldValue('symbol') : null;
                        currencySymbol = (!isEmpty(currencySymbol_temp)) ? currencySymbol_temp : currencySymbol;
                        nlapiLogExecution('debug', 'symbol temp ' + currencySymbol_temp, 'symbol ' + currencySymbol);
                    }
                } else {
                    var objCompInfo = nlapiLoadConfiguration('companyinformation');

                    currencySymbol = objCompInfo.getFieldValue('displaysymbol');
                }

                xml = xml.replace(/\{currencySymbol\}/g,currencySymbol);
                xml = xml.replace(/\$\{company.name\}/g,objCompany.getFieldValue("companyname"));
                xml = xml.replace(/\$\{company.address1\}/g,stCompAddress);
                xml = xml.replace(/\$\{company.logo\}/g, stLogoUrl);
            
            var filename = objCustomer.getFieldValue("companyname");
            if (objCustomer.getFieldValue('isperson') == 'T') {
                filename = objCustomer.getFieldValue("firstname") + ' ' + objCustomer.getFieldValue("lastname");
            }
            
            filename = isEmpty(filename)? "" : filename;
            filename = filename.replace(/\\|\/|:|\"|\?|\*|<|>|\|/g,'');
            
            log("debug", stLogTitle,"setting the XML");
            var stEmail = [objCustomer.getFieldValue("email")];
            var stFax = objCustomer.getFieldValue("fax");
            var stFileName = "CI_{0}_#{1}.pdf".format(filename, ciId);
            
            // v2.0 Enhancement - Include contacts with AR Contact category in email
            var arrContactEmail = arrAREmails['comp:'+stCustomerId];
            if (!isEmpty(arrContactEmail)) {
                if (!isEmpty(stEmail)) {
                    stEmail.push(arrContactEmail);
                } else {
                    stEmail = arrContactEmail;
                }
            }
            stEmail = stEmail.join(',');
            
            renderer = nlapiCreateTemplateRenderer();           
            renderer.setTemplate(xml);
            log("debug", stLogTitle,"arrCi1:" + JSON.stringify(arrCi2));
            log("debug", stLogTitle,"arrCi1:" + JSON.stringify(arrCi1));
            log("debug", stLogTitle,"recCI:" + JSON.stringify(recCI));
            log("debug", stLogTitle,"objCustomer:" + JSON.stringify(objCustomer));
            
            renderer.addRecord("ci", recCI);
            renderer.addRecord('customer', objCustomer);
            renderer.addSearchResults("invoiceline", arrCi1);
            renderer.addSearchResults("invoiceline2", arrCi2);
            log("debug", 'processGeneratePDF', "renderer.renderToString");
            xmlContent = renderer.renderToString();
            
            filePDF = nlapiXMLToPDF(xmlContent);
            xmlContent = null;
            log("debug", 'processGeneratePDF', "generate end, stFileName:" + stFileName);

            var objLog = {
                    intId: ciId, 
                    msg:"PDF Success: PDF Created for Customer ID: " + stCustomerId + " with CI ID: " + ciId
            };
            arrPDFLog.push(objLog);
            objLog = null;
        }
        catch(e)
        {
            var objLog = {
                    intId: ciId, 
                    msg:"PDF Error: Consolidated Invoice PDF Error for Customer ID: " + stCustomerId + " with CI ID: " + ciId + ". Details: " + e.toString()
            };
            arrPDFLog.push(objLog);
            arrErrors.push(objLog);
            objLog = null;
            
            xml = null;
            recCI = null;
            objCustomer = null;
            objCompany = null;
            arrCi1 = null;
            arrCi2 = null;
            
            filePDF = null;
            arrRecord = null;
            renderer = null;
            USAGE_STARTTIME = NSUtil.rescheduleScript(USAGE_LIMIT, USAGE_STARTTIME, USAGE_MAXTIMEINTERVALINMS);
            throw nlapiCreateError('Error', 'Error Creating PDF - ' + e.toString());
        }
        
        filePDF.setName(stFileName);
        
        if (!isEmpty(ciConfig.isToFileCabInFolder))
        {
            filePDF.setFolder(ciConfig.isToFileCabInFolder);
            var fileId = nlapiSubmitFile(filePDF);

            //USAGE_STARTTIME = NSUtil.rescheduleScript(USAGE_LIMIT, USAGE_STARTTIME, USAGE_MAXTIMEINTERVALINMS);
            nlapiSubmitField(RECTYPE_CUSTOMRECORDSS_NSTS_CI_CONSOLIDATE_INVOICE, ciId, FLD_CUSTRECORD_NSTS_CI_PDFFILE, fileId);
        }
        
        arrRecord = [];
        arrRecord['recordtype'] = RECTYPE_CUSTOMRECORDSS_NSTS_CI_CONSOLIDATE_INVOICE;
        arrRecord['record'] = ciId;
        
        if (ciConfig.isAttachToEmail == 'T')
        {
            log("debug", "isOnScheduleScript", "userId:" + emailSenderUserId + ",stEmail:" + stEmail + " CIconfig.emailTemplate:" + ciConfig.emailTemplate);
            if (!isEmpty(stEmail) && !isEmpty(ciConfig.emailTemplate))
            {
                try
                {
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
                    log("debug", stLogTitle,"stEmailMsg: " + stEmailMsg + " stCustomerId:" + stCustomerId);
                    
                    /*performance issue change*/
                    var stmsg = "Email Success: Email Sent to " + stEmail + " for Customer ID: " + stCustomerId + " with CI ID: " + ciId
                    if(filePDF.getSize() <= 5000000){
                        nlapiSendEmail(emailSenderUserId, stEmail, stEmailSubj, stEmailMsg, null , null, arrRecord, filePDF);

                    }else{
                        stEmailMsg = isEmpty(stEmailMsg)? "" : stEmailMsg;
                        
                        stEmailMsg += "\n\n the PDF file is morethan 5MB!";
                        stEmailMsg += "\nPlease check the Consolidated Invoice Record " + stCIName +" to locate your file";
                        
                        nlapiSendEmail(emailSenderUserId, stEmail, stEmailSubj, stEmailMsg, null , null, arrRecord);
                        stmsg += ", note that the generated PDF file is not available as file attachment due to the file size it exceeds more than 5mb."
                    }

                    //arrEmailLog.push("Email Success: Email Sent to " + stEmail + " for Customer ID: " + stCustomerId + " with CI ID: " + ciId);
                    var objLog = {
                            intId: ciId, 
                            msg: stmsg,
                    };
                    arrEmailLog.push(objLog);
                    objLog = null;
                }
                catch(e)
                {
                    //arrEmailLog.push("Email Error: Error Sending to " + stEmail + " for Customer ID: " + stCustomerId + " with CI ID: " + ciId + ".  Details: " + e.toString());
                    //arrErrors.push("Email Error: Error Sending to " + stEmail + " for Customer ID: " + stCustomerId + " with CI ID: " + ciId + ".  Details: " + e.toString());
                    var objLog = {
                            intId: ciId, 
                            msg:"Email Error: Error Sending to " + stEmail + " for Customer ID: " + stCustomerId + " with CI ID: " + ciId + ".  Details: " + e.toString()
                    };
                    arrEmailLog.push(objLog);
                    arrErrors.push(objLog);
                    
                    objLog = null;
                    
                }
            }
        }
        
        if (ciConfig.isAttachToFax == "T")
        {
            log("debug", "isOnScheduleScript", "userId:" + emailSenderUserId + ",stEmail:" + stEmail + " CIconfig.faxTemplate:" + ciConfig.faxTemplate);
            if (!isEmpty(stFax) && !isEmpty(ciConfig.faxTemplate))
            {
                try
                {
                    
                    var objMerger = nlapiCreateEmailMerger(ciConfig.faxTemplate);
                    objMerger.setEntity('customer', stCustomerId);
                    objMerger.setCustomRecord('customrecord_nsts_ci_consolidate_invoice', ciId);
                    
                    var objMergeResult = objMerger.merge();
                    var stFaxMsg = objMergeResult.getBody();
                    var stFaxSubj = objMergeResult.getSubject();
                    log("debug", stLogTitle,"stFaxMsg: " + stFaxMsg + " stCustomerId:" + stCustomerId);
                    
                    nlapiSendFax(faxSenderUserId, stFax, stFaxSubj, stFaxMsg, arrRecord, filePDF);
                    //arrFaxLog.push("Fax Success: Fax Sent to " + stFax + " for Customer ID: " + stCustomerId + " with CI ID: " + ciId);
                    var objLog = {
                            intId: ciId, 
                            msg:"Fax Success: Fax Sent to " + stFax + " for Customer ID: " + stCustomerId + " with CI ID: " + ciId
                    };
                    arrFaxLog.push(objLog);
                }
                catch(e)
                {
                    //arrFaxLog.push("Fax Error: Fax Error Sending to " + stFax + " for Customer ID: " + stCustomerId + " with CI ID: " + ciId + ". Details: " + e.toString());
                    //arrErrors.push("Fax Error: Fax Error Sending to " + stFax + " for Customer ID: " + stCustomerId + " with CI ID: " + ciId + ". Details: " + e.toString());
                    var objLog = {
                            intId: ciId, 
                            msg:"Fax Error: Fax Error Sending to " + stFax + " for Customer ID: " + stCustomerId + " with CI ID: " + ciId + ". Details: " + e.toString()
                    };
                    arrFaxLog.push(objLog);
                    arrErrors.push(objLog);
                }
            }
        }
        
        
        xml = null;
        recCI = null;
        objCustomer = null;
        objCompany = null;
        arrCi1 = null;
        arrCi2 = null;
        
        filePDF = null;
        arrRecord = null;
        USAGE_STARTTIME = NSUtil.rescheduleScript(USAGE_LIMIT, USAGE_STARTTIME, USAGE_MAXTIMEINTERVALINMS);
    }

}

/**
 * Returns a list of Customers with CI currently in process
 * @param arrSpecificCustomer
 * @returns
 */
function getCustomerCIsInProcess(arrSpecificCustomer) {
    var arrCust = [];
    var arrFilter = [new nlobjSearchFilter(FLD_CUSTENTITY_NSTS_CI_IN_PROCESS, null, 'is', 'T'),
                     new nlobjSearchFilter('isinactive', null, 'is', 'F')];
    
    if (!isEmpty(arrSpecificCustomer)) {
        arrFilter.push(new nlobjSearchFilter('internalid', null, 'anyof', arrSpecificCustomer));
    }
    
    var arrCol = [new nlobjSearchColumn('internalid', null, 'group')];
    
    var arrResultSet = getAllResults('customer', null, arrFilter, arrCol);
    
    if (!isEmpty(arrResultSet)) {
        var arrResult = arrResultSet.results;
        
        if (!isEmpty(arrResult)) {
            var intLen = arrResult.length;
            
            for (var i = 0; i < intLen; i++) {
                var stCust = arrResult[i].getValue('internalid', null, 'group');
                
                if (!isEmpty(stCust)) {
                    arrCust.push(stCust);
                }
            }
        }
    }
    
    return arrCust;
}

/**
 * Returns an array of the AR Contacts for the given customers
 * @param arrCustId
 * @returns
 */
function getARContacts(arrCustId,arrContactCategory) {
    var arrEmails = [];
    var arrFilter = [new nlobjSearchFilter('contactrole', null, 'anyof', arrContactCategory),
                     new nlobjSearchFilter('company', null, 'anyof', arrCustId)];

     var arrCols = [new nlobjSearchColumn('email'),
                    new nlobjSearchColumn('fax'),
                    new nlobjSearchColumn('company').setSort()];

     var arrResultSet = getAllResults('contact', null, arrFilter, arrCols);
     
     if (!isEmpty(arrResultSet)) {
         var arrResult = arrResultSet.results;
         
         if (!isEmpty(arrResult)) {
             var intLen = arrResult.length;
             for (var i = 0; i < intLen; i++) {
                 var stEmail = arrResult[i].getValue('email');
                 var stFax = arrResult[i].getValue('fax');
                 var stComp = arrResult[i].getValue('company');
                 
                 if (!isEmpty(stEmail) && !isEmpty(stComp)) {
                     var arrEm = arrEmails['comp:'+stComp];
                     if (isEmpty(arrEm)) {
                         arrEm = [];
                         arrEm.push(stEmail);
                     } else {
                         arrEm.push(stEmail);
                     }
                     arrEmails['comp:'+stComp] = arrEm;
                 }
             }
         }
     }
     
     return arrEmails;
}

/**
 * Sets the CI In Process flag to false for the indicated customers
 * @param arrUniqCust
 */
function unmarkCustomerCIInProcess(arrUniqCust) {
    for (var i = 0; i < arrUniqCust.length; i++) {
        var intCust = arrUniqCust[i];
        var intCurrentUsage = nlapiGetContext().getRemainingUsage();
        nlapiSubmitField('customer', intCust, [FLD_CUSTENTITY_NSTS_CI_IN_PROCESS,FLD_CUSTENTITY_NSTS_CI_LOCK_INUI], ['F','F']);
        USAGE_STARTTIME = NSUtil.rescheduleScript(USAGE_LIMIT, USAGE_STARTTIME, USAGE_MAXTIMEINTERVALINMS);
    }
}

/**
 * Sends the error emails to the administrators
 * @param intSender
 * @param stAdminEmail
 * @param intCiTaskId
 * @param error
 */
function sendErrorEmail(intSender, stAdminEmail, intCiTaskId, error) {
    var stSubject = 'An error was encountered when processing CI';
    var stBody = generateErrorEmailBody(intCiTaskId, error);
    var objRecord = null;
    if (!isEmpty(intCiTaskId)) {
        objRecord = [];
        objRecord['recordtype'] = 'customrecord_nsts_ci_task';
        objRecord['record'] = intCiTaskId;
    }
    
    nlapiSendEmail(intSender, stAdminEmail, stSubject, stBody, null, null, objRecord);
    nlapiLogExecution('debug', 'Error Email Sent', 'Sender:' + intSender + ' Recipient:' + stAdminEmail + 'body:' + stBody);
}

/**
 * Generates the body of the error email to be sent to the administrators
 * @param intCiId
 * @returns {String}
 */
function generateErrorEmailBody(intCiTaskId, error) {
    var stBody = 'An error was encountered when creating CI Record/s. ';
    /*performance issue change*/
    try{
        if (!isEmpty(intCiTaskId)) {
            var stEnvironment = nlapiGetContext().getEnvironment();
            var stEnv = 'https://system.na1.netsuite.com';
            
            switch(stEnvironment){
                case 'SANDBOX':
                    stEnv = 'https://system.sandbox.netsuite.com';
                    break;
                case 'BETA':
                    stEnv = 'https://system.na1.beta.netsuite.com';
                    break;
            }
            
            /*
            var stSuiteletURL = nlapiResolveURL("suitelet", SCRIPTID_ONLINE, DEPLOYMENTID_ONLINE, true);
            var stEnv = /^.*\.com/g.exec(stSuiteletURL);
             */
            var stRecordUrl = stEnv + nlapiResolveURL('RECORD', RECTYPE_CUSTOMRECORD_NSTS_CI_TASK, intCiTaskId);    
            stBody += 'To view details, see CI Task '+ intCiTaskId +' <a href ="'+stRecordUrl+'">here</a>';
        } else {
            stBody += 'Details are as follows: <br/> ' + error.toString();
        }
    }catch(e){
        stBody += "<br/>" + e;
    }
    /*performance issue change*/
    
    return stBody;
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
 * Construct the searchFilter base on the objfilters
 * @param objCIConfig getCISetup
 * @param objfilters : {
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
 * @param arrFilters (Array or array on nlobjSearchFilters)
 * @param arrSelectedInvoices : internal id of the invoices selected for CI
 * @returns nlobjSearchFilters[]
 */
function setFilters(objCIConfig, objfilters, arrFilters/*, arrSelectedInvoices*/)
{
    var stLogTitle = "SETFILTERS";

    var arrAlreadyAdded = [];
    var customerFieldId = "entity";
    var customerFieldJoin = null;
    

    if(objCIConfig.includeSubCustomers == "T")
    {
        
        customerFieldId = "parent";
        customerFieldJoin = "customer";
        if(objCIConfig.isProjectEnabled)
        {
            customerFieldJoin = "customer"; //"customermain";
            
        }else{
            customerFieldJoin = "customer";
        }
        
        //arrFilters.push(new nlobjSearchFilter(FLD_CUSTENTITY_NSTS_CI_IN_PROCESS, customerFieldJoin, "is", 'F'));
    }
    
    //v2.0 enhancement - Process CI per Customer - only process CI for customers with no CI being processed
    arrFilters.push(new nlobjSearchFilter(FLD_CUSTENTITY_NSTS_CI_IN_PROCESS, "customer", "is", 'F'));
    //arrFilters.push(nlobjSearchFilter(FLD_CUSTBODY_NSTS_CI_NUMBER, null, "anyof", '@NONE@'));
    
    if(!isEmpty(objCIConfig.tranAge)){

        var objFilTranAge = null;
        if(objCIConfig.tranAge < 0) {
            objFilTranAge = new nlobjSearchFilter('formulanumeric', null, 'equalto', 1);
            objFilTranAge.setFormula('CASE WHEN {trandate} BETWEEN TO_DATE(TO_DATE(TO_DATE(\'' + objfilters.asofdate + '\',\'MM/DD/YY\'))' + objCIConfig.tranAge + ') AND TO_DATE(TO_DATE(\'' + objfilters.asofdate + '\',\'MM/DD/YY\')) THEN 1 ELSE 0 END');
            log("DEBUG","setFilters", "negative days as of date" + objfilters.asofdate);
        }

        if(!isEmpty(objFilTranAge)){
            arrFilters.push(objFilTranAge);
        }
    }
    
    if (!isEmpty(objfilters.customer)) 
    {
        arrAlreadyAdded.push(customerFieldId);
        var objFilterCustomer = new nlobjSearchFilter(customerFieldId, customerFieldJoin, "anyof", objfilters.customer);
        arrFilters.push(objFilterCustomer);
    }
    
    if(objCIConfig.currency == "T"){
        if (!isEmpty(objfilters.currency)){
            arrFilters.push(new nlobjSearchFilter("currency", null, "is", objfilters.currency));
            arrAlreadyAdded.push("currency");
        }
    }
    
    if (objCIConfig.subsidiary == "T")
    {
        if (!isEmpty(objfilters.subsidiary))
        {
            arrFilters.push(new nlobjSearchFilter("subsidiary", null, "is", objfilters.subsidiary));
            arrAlreadyAdded.push("subsidiary");
        }
    }
    
    if (!isEmpty(objfilters.billaddress)) arrFilters.push(new nlobjSearchFilter("billaddress", null, "contains", objfilters.billaddress));
    if (!isEmpty(objfilters.location)) arrFilters.push(new nlobjSearchFilter("location", null, "is", objfilters.location));
    if (!isEmpty(objfilters.duedate)) arrFilters.push(new nlobjSearchFilter("dueDate", null, "on", objfilters.duedate));
    if (!isEmpty(objfilters.contract)) arrFilters.push(new nlobjSearchFilter(FLD_CUSTBODY_CONTRACT_NAME, null, "is", objfilters.contract));
    if (!isEmpty(objfilters.project)) arrFilters.push(new nlobjSearchFilter("internalid", "jobMain", "anyof", objfilters.project));
    if (!isEmpty(objfilters.asofdate)) arrFilters.push(new nlobjSearchFilter("trandate", null, "onorbefore", objfilters.asofdate));
    
    if (!isEmpty(objfilters.source)) {
        var sourceFilter = new nlobjSearchFilter("formulatext", null, "contains", objfilters.source)
        sourceFilter.setFormula("LOWER({source})");
        arrFilters.push(sourceFilter);
    }
    
    arrFilters.push(new nlobjSearchFilter(FLD_CUSTBODY_NSTS_CI_EXCLUDE, null, "is", "F"));
    if (objCIConfig.enableFor == "2")
    {
        arrFilters.push(new nlobjSearchFilter(FLD_CUSTENTITY_NSTS_CI_EXCLUDE_CI, 'customer', "is", "F"));
    }

    // Setup Custom Filters
    var stCFOperator = "is";

    
    if (!isEmpty(objfilters.customFilters))
    {
        for (var i = 0; i < objfilters.customFilters.length; i++)
        {
    
            var objCustomFilters = objfilters.customFilters[i];
            if (arrAlreadyAdded.indexOf(objCustomFilters.field) >= 0)
            {
                continue;
            }
    
            log("debug", stLogTitle, JSON.stringify(objCustomFilters));
            if (!isEmpty(objCustomFilters.value))
            {
                switch (objCustomFilters.type)
                {
                    case "date":
                        stCFOperator = "on";
                        break;
                    case "text":
                        stCFOperator = "contains";
                        break;
                    default:
                        stCFOperator = "is";
                }
    
                log("debug", stLogTitle, "objCustomFilters.field: " + objCustomFilters.field + " ,stCFOperator: " + stCFOperator + " ,objCustomFilters.value: " + objCustomFilters.value);
                
                arrAlreadyAdded.push(objCustomFilters.field);
                arrFilters.push(new nlobjSearchFilter(objCustomFilters.field, null, stCFOperator, objCustomFilters.value));
            }
        }
    }

    for ( var prop in objfilters.data)
    {
        var objPropVals = objfilters.data[prop];
        var val         = objPropVals.value;
        var type        = objPropVals.type;
        var join        = objPropVals.join;
        var id          = objPropVals.id;
        var text        = objPropVals.text;
        var stOperand   = "is";
        val             = (val.toLowerCase() == "- none -")? null: val;
        
        if(arrAlreadyAdded.indexOf(id) >=0){
            continue;
        }
        
        switch(type){
            case "select":
                stOperand = "anyof";
                break
            case "date":
                stOperand = "on";
                break;
            case "text":
                stOperand = "is";
                if(id == "source"){
                    stOperand = "anyof";
                }
                if(id == "otherrefnum"){
                    stOperand = "equalto";
                }
                break;
            default:
                stOperand="is";
        }
        
        if (isEmpty(val))
        {
            log("debug", stLogTitle,"type:" + type + " ,prop:" + prop + " ,id:" + id + " nlobjSearchFilter(id, join, 'isempty')");
            if(type == "select")
            {
                arrFilters.push(new nlobjSearchFilter(id, join, 'anyof',["@NONE@"]));
            }
            else
            {
                arrFilters.push(new nlobjSearchFilter(id, join, 'isempty'));
            }
        }
        else
        {
            /*if(id == "billaddress"){
                val = nlapiEscapeXML(val);
            }*/
            log("debug", stLogTitle,"type:" + type + " ,prop" + prop + " ,id:" + id + " stOperand:" + stOperand + " ,val:" + val);
            arrFilters.push(new nlobjSearchFilter(id, join, stOperand, val));
        }

    }
    
    return arrFilters;
}


/**
 * Construct the searchColumn base on the objCIConfig
 * @param objCIConfig : getCISetup()
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
 *  }
 * @param arrColumns (Array or nlobjSearchColumn[])
 * @param isGroup if this is true the summary group will be added on the searchColumns
 * @returns nlobjSearchColumn[]
 */
function setColumns(objCIConfig, filters,arrColumns,isGroup){
    var summary = "group";
    if(isGroup == false){
        summary = null;
    }
    
    var customerFieldId = "entity";
    var customerFieldJoin = null;
    
    if(objCIConfig.includeSubCustomers == "T")
    {
        customerFieldId = "parent";
        if(objCIConfig.isProjectEnabled)
        {
            customerFieldJoin = "customer"; //"customermain";
            
        }else{
            customerFieldJoin = "customer";
        }
    }
    
    if (objCIConfig.includeSubCustomers == "T"){
        arrColumns.push(new nlobjSearchColumn(customerFieldId, customerFieldJoin, summary).setLabel("Customer").setSort());
        if(objCIConfig.subsidiary == "T"){
            arrColumns.push(new nlobjSearchColumn("subsidiary", null, summary).setLabel("subsidiary"));
        }
    }
    else
    {
        arrColumns.push(new nlobjSearchColumn(customerFieldId, customerFieldJoin, summary).setLabel("Customer").setSort());
        if(objCIConfig.subsidiary == "T"){
            arrColumns.push(new nlobjSearchColumn("subsidiary", "customer", summary).setLabel("subsidiary"));
        }
    }
    
    if(objCIConfig.currency == "T"){
        arrColumns.push(new nlobjSearchColumn("currency", null, summary).setLabel("Currency"));
    }

    if (objCIConfig.billaddress == "T"){
        arrColumns.push(new nlobjSearchColumn("billaddress", null, summary).setLabel("billing Address"));       
    }
    if (objCIConfig.location == "T")
    {
        arrColumns.push(new nlobjSearchColumn("location", null, summary).setLabel("Location")); 
    }
    if (objCIConfig.dueDate == "T")
    {
        arrColumns.push(new nlobjSearchColumn("duedate", null, summary).setLabel("Due Date"));  
    }
    
    if (objCIConfig.contract == "T"){
        arrColumns.push(new nlobjSearchColumn(FLD_CUSTBODY_CONTRACT_NAME, null, summary).setLabel("Contract")); 
    }
    
    if (objCIConfig.project == "T")
    {
        arrColumns.push(new nlobjSearchColumn("internalid", "jobMain", summary).setLabel("Project"));
    }
    
    if (objCIConfig.source == "T")
    {
        arrColumns.push(new nlobjSearchColumn("source", null, summary).setLabel("Source")); 
    }

    for (var i = 0; i < objCIConfig.arrCustomFilter.length; i++)
    {
        var objCustFilter = objCIConfig.arrCustomFilter[i];
        
        if (!isEmpty(objCustFilter.value))
        {
            arrColumns.push(new nlobjSearchColumn(objCustFilter.id , null, summary).setLabel(objCustFilter.label));
        }
    }
    
    return arrColumns;
}

/**
 * this is for dev and Tes
 * @param request : nlobjRequest
 * @param response : nlobjResponse
 */
function generateOndemandPDF(request, response)
{
    var stLogTitle = "generateOndemandPDF";
    log("debug", "generatePDF", "start");
    var ciId = request.getParameter("ciID");
    var ciConfig = getCISetup();
    
    var arrPDFLog = []
    var arrErrors = []

    
    var recCI = nlapiLoadRecord(RECTYPE_CUSTOMRECORDSS_NSTS_CI_CONSOLIDATE_INVOICE, ciId);
    var arrSelectInvoice = recCI.getFieldValues(FLD_CUSTRECORD_NSTS_CI_SELECTED_INV);
    
    var subsidiary = recCI.getFieldValue(FLD_CUSTRECORD_NSTS_CI_SUBSIDIARY)
    var currency = recCI.getFieldValue(FLD_CUSTRECORD_NSTS_CI_PREF_CURRENCY)
    
    var subCurrency = null;
    if(isOneWorld() == "T"){
        if(ciConfig.ismultiCurrency == "T"){
            subCurrency = nlapiLookupField("subsidiary", subsidiary, "currency");   
        }
    }

    
    var currencyFilters = null
    if(ciConfig.ismultiCurrency == "T"){
        currencyFilters = {
                subsidiary : subsidiary,
                subCurrency : subCurrency,
                currency : currency,
                baseCurrency : ciConfig.baseCurrency
        };
    }
    
    var ciSummary = getCISummaryTotals(arrSelectInvoice,ciConfig,currencyFilters);
    var arrCIFields = [
                    FLD_CUSTRECORD_NSTS_CI_PDF_SUBTOTAL,
                    FLD_CUSTRECORD_NSTS_CI_PDF_ITEMTOTAL,
                    FLD_CUSTRECORD_NSTS_CI_PDF_DISCOUNT,
                    FLD_CUSTRECORD_NSTS_CI_PDF_TAX,
                    FLD_CUSTRECORD_NSTS_CI_PDF_SHIPPING_HANDLING,
                    FLD_CUSTRECORD_NSTS_CI_PDF_AMOUNTPAID,
                    FLD_CUSTRECORD_NSTS_CI_PDF_TOTAL_DUE
            ];
            var arrCIValues = [
                    ciSummary.subtotal,
                    ciSummary.itemtotal,
                    ciSummary.discount,
                    ciSummary.tax,
                    ciSummary.shippingamount,
                    ciSummary.amountpaid,
                    ciSummary.totaldue
            ];

    nlapiSubmitField(RECTYPE_CUSTOMRECORDSS_NSTS_CI_CONSOLIDATE_INVOICE, ciId, arrCIFields, arrCIValues);
    
    USAGE_STARTTIME = NSUtil.rescheduleScript(USAGE_LIMIT, USAGE_STARTTIME, USAGE_MAXTIMEINTERVALINMS);
    
    var recCI = nlapiLoadRecord(RECTYPE_CUSTOMRECORDSS_NSTS_CI_CONSOLIDATE_INVOICE, ciId);
    stCustomerId = recCI.getFieldValue(FLD_CUSTRECORD_NSTS_CI_CUSTOMER);

    var objCustomer = nlapiLoadRecord("customer", stCustomerId);
    var objCompany = nlapiLoadConfiguration('companyinformation');

    var FLD_CUSTENTITY_NSTS_CI_DEFAULT_LAYOUT = "custentity_nsts_ci_default_layout";
    var layoutId = objCustomer.getFieldValue(FLD_CUSTENTITY_NSTS_CI_DEFAULT_LAYOUT);
    ciConfig = getLayout(layoutId);
    
    var objCITemplate = nlapiLoadFile(ciConfig.templateid);//3541
    if (objCITemplate)
    {
        ciConfig = getCustomerRef(objCustomer);
        
        var emailSenderUserId = ciConfig.emailSenderUserId;
        var faxSenderUserId = ciConfig.faxSenderUserId;
        
        var xml = objCITemplate.getValue();     
        
        var arrCi1 = getInvoiceLines(ciConfig.pdfCISaveSearch1, arrSelectInvoice, ciConfig,currencyFilters);
        var arrCi2 = getInvoiceLines(ciConfig.pdfCISaveSearch2, arrSelectInvoice, ciConfig,currencyFilters);
        
        xml = processSearchExpression(xml,arrCi1,"invoiceline1");
        xml = processSearchExpression(xml,arrCi2,"invoiceline2");
        

        xml = xml.replace(/\{bodyFontSize\}/g,ciConfig.layoutBodyFontSize);
        xml = xml.replace(/\{titleFontSize\}/g,ciConfig.layoutTitleFontSize);
        xml = xml.replace(/\{subTitleFontSize\}/g,ciConfig.layoutSubTitleFontSize);
        xml = xml.replace(/\{thFontSize\}/g,ciConfig.layoutTHFontSize);
        xml = xml.replace(/\{trFontSize\}/g,ciConfig.layoutTRFontSize);
        
        xml = xml.replace(/\{headerHeight\}/g,ciConfig.headerHeight);
        xml = xml.replace(/\{billshipFontSize\}/g,ciConfig.billshipFontSize);
        xml = xml.replace(/\{billshipTBLHeight\}/g,ciConfig.billshipTableHeight);
        
        var landscape = (ciConfig.layoutIslandscape=="T")? 'size="letter-landscape"' : "";
        xml = xml.replace(/\{isLandscape\}/g,landscape);
        
        
        try
        {
            var stLogoUrl = "";
            var intLogoid = objCompany.getFieldValue("formlogo");
            if(!isEmpty(intLogoid))
            {
                stLogoUrl = nlapiLoadFile(intLogoid).getURL();
                stLogoUrl = nlapiEscapeXML(stLogoUrl);
            }
                        
            var stCompAddress = objCompany.getFieldValue("mainaddress_text");
            stCompAddress = stCompAddress.replace(/\n/g,"<br/>")
            
            var currencySymbol = "";
            
            if(ciConfig.ismultiCurrency == "T"){
                currencySymbol = recCI.getFieldValue(FLD_CUSTRECORD_NSTS_CI_PREF_CURRENCY);
                
                if(!isEmpty(currencySymbol)){
                    currencySymbol_temp = nlapiLookupField("currency", currencySymbol, "symbol");
                    currencySymbol = nlapiLookupField("currency", currencySymbol, "symbol");
                    currencySymbol = isEmpty(currencySymbol)? "" : currencySymbol.toUpperCase();
                    currencySymbol = CURRENCY_LOCALIZATION[currencySymbol];
                    currencySymbol = isEmpty(currencySymbol)? currencySymbol_temp : currencySymbol;
                }
            }

            xml = xml.replace(/\{currencySymbol\}/g,currencySymbol);
            
            xml = xml.replace(/\$\{company.name\}/g,objCompany.getFieldValue("companyname"));
            xml = xml.replace(/\$\{company.address1\}/g,stCompAddress);
            xml = xml.replace(/\$\{company.logo\}/g, stLogoUrl)
            
            //find and replace the saved search with the table
            var renderer = nlapiCreateTemplateRenderer();
            var stEmail = objCustomer.getFieldValue("email");
            var stFax = objCustomer.getFieldValue("fax");
            var stCompName = objCustomer.getFieldValue("companyname");
            if (objCustomer.getFieldValue('isperson') == 'T') {
                filename = objCustomer.getFieldValue("firstname") + ' ' + objCustomer.getFieldValue("lastname");
            }
            
            var stFileName = "CI_{0}_#{1}.pdf".format(stCompName, ciId);
            renderer.setTemplate(xml);
            renderer.addRecord("ci", recCI);
            renderer.addRecord('customer', objCustomer);
            
            renderer.addRecord('customer', objCustomer);
            if(arrCi1)
                renderer.addSearchResults("invoiceline", arrCi1);

            if(arrCi2)
                renderer.addSearchResults("invoiceline2", arrCi2);

            var xmlContent = renderer.renderToString();
            var filePDF = nlapiXMLToPDF(xmlContent);

            arrPDFLog.push("PDF Success: Consolidated Invoice PDF Successfully Created for CI ID: " + ciId + ". \n");
        }
        catch(e)
        {
            arrPDFLog.push("PDF Error: Consolidated Invoice PDF Error for CI ID: " + ciId + " Details: " + e.toString() + ". \n");
            arrErrors.push("PDF Error: Consolidated Invoice PDF Error for CI ID: " + ciId + " Details: " + e.toString() + ". \n");
            throw nlapiCreateError('Error', 'Error Creating PDF - ' + e.toString());
        }
        log("debug", stLogTitle, "Sending PDF xmlContent");
        filePDF.setName(stFileName);
        response.setContentType('PDF', 'Consolidated_Invoice_number_{0}.pdf'.format(ciId));
        response.write(filePDF.getValue());
    }
    
}

/**
 * generate date for CI Dates base on ciKeys.stCIDateFlag
 * if ciKeys.stCIDateFlag is 1 current date
 * if ciKeys.stCIDateFlag is 2 specific date the date value came from user input (iKeys.stCIDate)
 * if ciKeys.stCIDateFlag is 3 get the last invoice date base on the ciKeys.arrSelectedInvoices
 * if ciKeys.stCIDateFlag is 4 cut of date
 * @param ciKeys {
 *          arrSelectedInvoices,
 *          customer,
 *          data,
 *          ciId,
 *          stCIDateFlag,
 *          stCIDate,
 *          stAsOfDate,
 *      }
 * @param arrSelectedInvoices internalid of the invoices associated in CI
 * @param ciConfig getCISetup()
 * @returns string
 */
function getCIDate(ciKeys,arrSelectedInvoices,ciConfig)
{
    var stLogTitle = "GETCIDATE";
    log("debug", stLogTitle, "START");

    var returnVal = null;

    ciKeys.stCIDateFlag = parseInt(ciKeys.stCIDateFlag);
    switch (ciKeys.stCIDateFlag)
    {
        case 1:
            returnVal = null;
            break;
        case 2:
            returnVal = ciKeys.stCIDate;
            break;
        case 3:
            
            var arrFilter = [];
            var arrCol = []
            var customerFieldId = "entity";
            var customerFieldJoin = null;
            if(ciConfig.includeSubCustomers == "T")
            {
                customerFieldId = "parent";
                customerFieldJoin = "customer";
            }

            if(!isEmpty(arrSelectedInvoices)){
                arrSelectedInvoices = arrSelectedInvoices.reverse();
                var arrChuckRes = chuckArray(arrSelectedInvoices,ciConfig.numberOfInvoucePerChuck);
                arrFilter.push(new nlobjSearchFilter("internalid", null, "anyof", arrChuckRes[0]));
            }
            
            arrCol.push(new nlobjSearchColumn("trandate").setSort(true));
            var results = nlapiSearchRecord("invoice", null, arrFilter, arrCol);
            if (results)
            {
                returnVal = results[0].getValue("trandate");
            }
            
            log("debug", stLogTitle, "LAST Invoice Date returnVal:" + returnVal);
            break;
        case 4:
            if(isEmpty(ciKeys.stAsOfDate)){
                returnVal = nlapiDateToString(new Date());  
            }else{
                returnVal = ciKeys.stAsOfDate;
            }
            break;
    }
    log("debug", stLogTitle,"filters.stCIDateFlag:" + ciKeys.stCIDateFlag + " ,returnVal:" + returnVal)
    return returnVal;
}

/**
 * this function handle the creation of the CI Task Record both from Online CI and Scheduled CI
 * @param type : ONLINE = '1'; SCHEDULED = '2'; CUSTOMER  = '3';
 * @param intCICount int
 * @returns
 */
function createCITask(type,intCICount)
{
    //create CI Task for this online trigger
    var recCITask = nlapiCreateRecord(RECTYPE_CUSTOMRECORD_NSTS_CI_TASK);
    recCITask.setFieldValue(FLD_CUSTRECORD_NSTS_CI_TASK_TYPE,type);
    if (nlapiGetUser() != -4) 
        recCITask.setFieldValue(FLD_CUSTRECORD_NSTS_CI_INITIATED_BY,nlapiGetUser());
    
    recCITask.setFieldValue(FLD_CUSTRECORD_NSTS_CI_TASK_START,nlapiDateToString(new Date(),'datetimetz'));
    recCITask.setFieldValue(FLD_CUSTRECORD_NSTS_CI_TASK_STATUS,CI_STARTED);
    recCITask.setFieldValue(FLD_CUSTRECORD_NSTS_CI_RECORDS,intCICount);
    var stCITaskId = nlapiSubmitRecord(recCITask,false,true);
    log("debug", "createCITask", "stCITaskId=" + stCITaskId);
    
    return stCITaskId;
}


/**
 * this function handle the creation of the CI Logs Record both from Online CI and Scheduled CI
 * @param stTaskId internal id of the created ci task createCITask()
 * @param stMessage log Message
 */
function createCILog(stTaskId,stMessage,arrCiNums)
{    
    /*performance issue change*/
    if(!isEmpty(stMessage) && stMessage.length >= 1000000){
        stMessage = stMessage.substring(0,1000000);
    }
    
    var recCILog = nlapiCreateRecord('customrecord_nsts_ci_log');
        recCILog.setFieldValue(FLD_CUSTRECORD_NSTS_CI_TASK_ID,stTaskId);
        recCILog.setFieldValue(FLD_CUSTRECORD_NSTS_CI_SCRIPT_NAME,nlapiGetContext().getDeploymentId());
        recCILog.setFieldValue(FLD_CUSTRECORD_NSTS_CI_LOG_MSG,stMessage);
        if (!isEmpty(arrCiNums)) {
            recCILog.setFieldValues(FLD_CUSTRECORD_NSTS_CI_LOG_NUMBERS, arrCiNums);
        }
    var stCILogId = nlapiSubmitRecord(recCILog,false,true);
    log("debug", "createCILog", "stLogId=" + stCILogId);
}

/**
 * translated the array of logs to be push in the CI Log Record
 * @param stCITaskId internal id of the created ci task createCITask()
 * @param objCILogs {
 *          search : [],
 *          cicreate : [],
 *          pdf : [],
 *          email : [],
 *          fax : [],
 *          inv : [],
 *          ci : [],
 *          err : []
 *      }
 */
function createCIProcessLogs(stCITaskId,objCILogs)
{
    for(var logtype in objCILogs)
    {
        if(objCILogs[logtype].length > 0)
        {
            var arrCiLogMsg = [];
            var arrCiNum = [];
            for (var intLogEntry = 0; intLogEntry < objCILogs[logtype].length; intLogEntry++) {
                var objLog = objCILogs[logtype][intLogEntry];
                
                arrCiLogMsg.push(objLog['msg']);
                if (!isEmpty(objLog['intId']) && objLog['intId'] > 0) {
                    arrCiNum.push(objLog['intId']);
                }
            }
            //createCILog(stCITaskId,objCILogs[logtype].join('\n'));
            createCILog(stCITaskId,arrCiLogMsg.join('\n'),arrCiNum);
        }        
    }        
}


/**
 * @noto: for CI v2
 * this function handle the creation of the CI Task Record both from Online CI and Scheduled CI
 * @param options.type : ONLINE = '1'; SCHEDULED = '2'; CUSTOMER  = '3';
 * @param options.intCICount int
 * @param options.fields [{<field>: value ...}]
 * @param options.doSave (boolean);
 * @returns {record}
 */
function getCITask(options)
{
    var stLogTitle = "GETCITASK";
    //create CI Task for this online trigger
    if(isEmpty(options)){
        options = {};
    }
    
    var type = options.type;
    var intCICount = options.intCICount;
    var stDeploymentId = nlapiGetContext().getDeploymentId();
    
    if(!isEmpty(options.taskid)){
        HC_TASK_ID = options.taskid;
    }
    log('DEBUG', stLogTitle, "PARAM SCRIPTPARAM_CUSTSCRIPT_NSTS_CI_TASK_ID:" + nlapiGetContext().getSetting("script", SCRIPTPARAM_CUSTSCRIPT_NSTS_CI_TASK_ID));
    if(isEmpty(HC_TASK_ID)){
        HC_TASK_ID      = nlapiGetContext().getSetting("script", SCRIPTPARAM_CUSTSCRIPT_NSTS_CI_TASK_ID);
    }
    
    var func_papulateCITask = function(){
        if(isEmpty(HC_TASK_ID) && isEmpty(HC_TASK_OBJ)){
            var stCIUser = nlapiGetUser();
            HC_TASK_OBJ = nlapiCreateRecord(RECTYPE_CUSTOMRECORD_NSTS_CI_TASK);
            if(isEmpty(HC_TASK_OBJ.getFieldValue(FLD_CUSTRECORD_NSTS_CI_TASK_TYPE))){
                if(!isEmpty(type)){
                    HC_TASK_OBJ.setFieldValue(FLD_CUSTRECORD_NSTS_CI_TASK_TYPE,type);
                }
            }

            if (stCIUser != -4){
                if(isEmpty(HC_TASK_OBJ.getFieldValue(FLD_CUSTRECORD_NSTS_CI_INITIATED_BY))){
                    HC_TASK_OBJ.setFieldValue(FLD_CUSTRECORD_NSTS_CI_INITIATED_BY,stCIUser);
                }
            }

            if(isEmpty(HC_TASK_OBJ.getFieldValue(FLD_CUSTRECORD_NSTS_CI_TASK_START))){
                HC_TASK_OBJ.setFieldValue(FLD_CUSTRECORD_NSTS_CI_TASK_START,nlapiDateToString(new Date(),'datetimetz'));
            }
            
            if(isEmpty(HC_TASK_OBJ.getFieldValue(FLD_CUSTRECORD_NSTS_CI_TASK_STATUS))){
                HC_TASK_OBJ.setFieldValue(FLD_CUSTRECORD_NSTS_CI_TASK_STATUS,CI_STARTED);
            }

            if(isEmpty(HC_TASK_OBJ.getFieldValue(FLD_CUSTRECORD_NSTS_CI_RECORDS))){
                if(!isEmpty(intCICount)){
                    HC_TASK_OBJ.setFieldValue(FLD_CUSTRECORD_NSTS_CI_RECORDS,intCICount);
                }
            }
            
            if(isEmpty(HC_TASK_OBJ.getFieldValue(FLD_CUSTRECORD_NSTS_CI_TASK_DEPLOYMENTID))){
                HC_TASK_OBJ.setFieldValue(FLD_CUSTRECORD_NSTS_CI_TASK_DEPLOYMENTID,stDeploymentId);
            }
            
            //Force Saving
            options.doSave == true;
        }else if(isEmpty(HC_TASK_OBJ) && !isEmpty(HC_TASK_ID)){
            HC_TASK_OBJ = nlapiLoadRecord(RECTYPE_CUSTOMRECORD_NSTS_CI_TASK, HC_TASK_ID);
        }
        

        
        if(!isEmpty(options.fields)){
            for(var fld in options.fields){
                if(options.fields[fld] instanceof Array){
                    HC_TASK_OBJ.setFieldValues(fld, options.fields[fld]);
                }else{
                    HC_TASK_OBJ.setFieldValue(fld, options.fields[fld]);
                }

            }
        }
    }
    
    func_papulateCITask();

    if(options.doSave == true){
    	try{
            HC_TASK_ID = nlapiSubmitRecord(HC_TASK_OBJ, true,true);
            if(isEmpty(HC_TASK_OBJ.getId())){
                HC_TASK_OBJ = nlapiLoadRecord(RECTYPE_CUSTOMRECORD_NSTS_CI_TASK, HC_TASK_ID);
            }
    	}catch(e){
    		HC_TASK_OBJ = nlapiLoadRecord(RECTYPE_CUSTOMRECORD_NSTS_CI_TASK, HC_TASK_ID);
    		func_papulateCITask();
    		 
    	}
    }
    return HC_TASK_OBJ;
}

/**
 * CI v2.5
 * this function handle the creation of the CI Logs Record both from Online CI and Scheduled CI
 * @param options.message internal id of the created ci task createCITask()
 * @param options.arrCiNums log Message
 */
function appendCILog(options){
    var stMessage = options.message;
    var arrCiNums = options.arrCiNums
    var stLogTitle = 'APPENDCILOG';
    
    /*performance issue change*/
    if(!isEmpty(stMessage) && stMessage.length >= 1000000){
        stMessage = stMessage.substring(0,1000000);
    }
    
    /*performance issue change*/
    if(!isEmpty(stMessage) && stMessage.length >= 1000000){
        stMessage = stMessage.substring(0,1000000);
    }

    if(isEmpty(HC_TASK_OBJ)){
        HC_TASK_OBJ = getCITask({
            taskid: options.taskid
        });
        log('DEBUG',stLogTitle,"getCITask #1 ID:" + HC_TASK_ID);
    }
    
    var HC_SUBLIST_LOG = 'recmachcustrecord_nsts_ci_task_id'
    HC_TASK_OBJ.selectNewLineItem(HC_SUBLIST_LOG);
    HC_TASK_OBJ.setCurrentLineItemValue(HC_SUBLIST_LOG, FLD_CUSTRECORD_NSTS_CI_SCRIPT_NAME, nlapiGetContext().getDeploymentId());
    HC_TASK_OBJ.setCurrentLineItemValue(HC_SUBLIST_LOG, FLD_CUSTRECORD_NSTS_CI_LOG_MSG, stMessage);
    
    if (!isEmpty(arrCiNums)) {
        HC_TASK_OBJ.setCurrentLineItemValue(HC_SUBLIST_LOG, FLD_CUSTRECORD_NSTS_CI_LOG_NUMBERS, arrCiNums);
    }
    HC_TASK_OBJ.commitLineItem(HC_SUBLIST_LOG);
}

/**
 * translated the array of logs to be push in the CI Log Record
 * @param stCITaskId internal id of the created ci task createCITask()
 * @param objCILogs {
 *          search : [],
 *          cicreate : [],
 *          pdf : [],
 *          email : [],
 *          fax : [],
 *          inv : [],
 *          ci : [],
 *          err : []
 *      }
 */
function appendBulkCILog(objCILogs,options)
{
    log('DEBUG', 'APPENDBULKCILOG', JSON.stringify(options));
    for(var logtype in objCILogs)
    {
        if(objCILogs[logtype].length > 0)
        {
            var arrCiLogMsg = [];
            var arrCiNum = [];
            for (var intLogEntry = 0; intLogEntry < objCILogs[logtype].length; intLogEntry++) {
                var objLog = objCILogs[logtype][intLogEntry];
                
                arrCiLogMsg.push(objLog['msg']);
                if (!isEmpty(objLog['intId']) && objLog['intId'] > 0) {
                    arrCiNum.push(objLog['intId']);
                }
            }
            appendCILog({
                taskid: options.taskid,
                message: arrCiLogMsg.join('\n'),
                arrCiNums: arrCiNum
            })
        }        
    }        
}


/**
 * this function is Used in processGeneratePDF this will fetch the associated result for the CI from
 * save searched that are in the CI Layout
 * @param saveSearch : internal id of the save search
 * @param arrInvoiceId : array of INvoice Internal Id
 * @param objCIconfig : getCISetup()
 * @param currencyFilters : {baseCurrency: "",currency: "", subCurrency}
 * @returns {Array}  nlobjSearchResult[]
 */
function getInvoiceLines(saveSearch,arrInvoiceId,objCIconfig,currencyFilters)
{
    
    if(isEmpty(saveSearch)){
        return null;
    }
    
    var arrFilters = [];
    var results = [];
    if (!isEmpty(arrInvoiceId)) 
    {
        var arrTempInvId = arrInvoiceId;
        log('DEBUG', 'objCIconfig.numberOfInvoucePerChuck', objCIconfig.numberOfInvoucePerChuck);
        var arrChuckRes = chuckArray(arrTempInvId,objCIconfig.numberOfInvoucePerChuck);
        
        if (!isEmpty(arrChuckRes)){
            var bIsFirst = true;
            for(var i = 0;i < arrChuckRes.length; i++){
                var arrChuck = arrChuckRes[i];
                
                if(!isEmpty(arrChuck)){
                    arrFilters = []
                    if (objCIconfig.enableFor == "2")
                    {
                        arrFilters.push(new nlobjSearchFilter(FLD_CUSTENTITY_NSTS_CI_EXCLUDE_CI, "customer", "is", "F"));
                    }
                    arrFilters.push(new nlobjSearchFilter(FLD_CUSTBODY_NSTS_CI_EXCLUDE, null, "is", "F"));
                    arrFilters.push(new nlobjSearchFilter('internalid', null, 'anyof', arrChuck));
                    var objSearch = getAllResults(null, saveSearch, arrFilters,null,currencyFilters);
                    
                    if(!isEmpty(objSearch))
                    {
                        if(!isEmpty(objSearch.results)){
                            results = results.concat(objSearch.results) //objSearch.results;
                        }
                    }
                }
                                
            }
            
        }
        
    }
    
    
    log("DEBUG","getInvoiceLines","results: " + JSON.stringify(results));
    return results;
}

/**
 * @param arrInvoices : array of INvoice Internal Id
 * @param ciConfig : getCISetup()
 * @param currencyFilters : {baseCurrency: "",currency: "", subCurrency}
 * @returns {
 *      subtotal        : subtotal,
 *      itemtotal       : itemtotal,
 *      discount        : -discount,
 *      tax             : tax,
 *      shippingamount  : shippingamount,
 *      amountpaid      : -amountpaid,
 *      totaldue        : totaldue
 *  }
 */
function getCISummaryTotals(arrInvoices,ciConfig,currencyFilters){
   var stLogTitle = "GETCISUMMARYTOTALS";


   var intsubtotal        = 0
   var intgrossamount     = 0;
   var intamount          = 0;
   var intitemtotal       = 0;
   var intdiscount        = 0;
   var inttax             = 0;
   var intshippingamount  = 0;
   var intamountpaid      = 0;
   var inttotaldue        = 0;
   
    var arrChuckRes = chuckArray(arrInvoices,ciConfig.numberOfInvoucePerChuck);
    
    if (!isEmpty(arrChuckRes)){
        var bIsFirst = true;
        for(var i = 0;i < arrChuckRes.length; i++){
            var arrColumns = [];
            var arrFilters = [];
            var arrFiltersMainline = [];
            
            var subtotal        = 0
            var grossamount     = 0;
            var amount          = 0;
            var itemtotal       = 0;
            var discount        = 0;
            var tax             = 0;
            var shippingamount  = 0;
            var amountpaid      = 0;
            var totaldue        = 0;
            
            arrFilters.push(new nlobjSearchFilter("mainline", null, "is", "F"));
            arrFilters.push(new nlobjSearchFilter("cogs", null, "is", "F"));
            arrFilters.push(new nlobjSearchFilter("taxline", null, "is", "F"));
            arrFilters.push(new nlobjSearchFilter("shipping", null, "is", "F"));
            arrFilters.push(new nlobjSearchFilter("internalid", null, "anyof", arrChuckRes[i]));
            arrFilters.push(new nlobjSearchFilter(FLD_CUSTBODY_NSTS_CI_EXCLUDE, null, "is", "F"));
            
            var stfld_fxamounr = "fxamount";
            if(ciConfig.ismultiCurrency == "F"){
                stfld_fxamounr = "amount";
            }
            
            
            if (ciConfig.enableFor == "2")
            {
                arrFilters.push(new nlobjSearchFilter(FLD_CUSTENTITY_NSTS_CI_EXCLUDE_CI, "customer", "is", "F"));
            }
            
            var objCol = new nlobjSearchColumn("formulacurrency_discount",null,"sum");
            objCol.setFormula("CASE WHEN {item.type} = 'Discount' THEN {discountamount}/{exchangerate} ELSE 0 END")
            
            arrColumns.push(objCol);
            arrColumns.push(new nlobjSearchColumn("formulacurrency_grossamount",null,"sum").setFormula("NVL({grossamount},0)/{exchangerate}"));
            arrColumns.push(new nlobjSearchColumn("formulacurrency_taxamount",null,"sum").setFormula("NVL({taxamount},0)/{exchangerate}"));
            
            var results = nlapiSearchRecord(null, 'customsearch_nsts_get_ci_summary_total', arrFilters, arrColumns);

            //this second search is in order to get the mainline Data
            var arrColumnsMainLine = [];

            arrFiltersMainline.push(new nlobjSearchFilter("mainline", null, "is", "T"));
            arrFiltersMainline.push(new nlobjSearchFilter("internalid", null, "anyof", arrChuckRes[i]));
            
            var exchangeRate = null;
            
            if(ciConfig.ismultiCurrency == "T"){
				exchangeRate = nlapiExchangeRate(currencyFilters.currency,currencyFilters.baseCurrency , nlapiDateToString(new Date())); 
                arrColumnsMainLine.push(new nlobjSearchColumn("formulacurrency_amountpaid",null,"sum").setFormula("NVL({fxamountpaid},0)"));
                arrColumnsMainLine.push(new nlobjSearchColumn("formulacurrency_amountremaining",null,"sum").setFormula("NVL({fxamountremaining},0)"));
				arrColumnsMainLine.push(new nlobjSearchColumn("formulacurrency_taxtotal",null,"sum").setFormula("NVL({taxtotal},0)/" + exchangeRate));
            }else{
                arrColumnsMainLine.push(new nlobjSearchColumn("formulacurrency_amountpaid",null,"sum").setFormula("NVL({amountpaid},0)"));
                arrColumnsMainLine.push(new nlobjSearchColumn("formulacurrency_amountremaining",null,"sum").setFormula("NVL({amountremaining},0)"));
				arrColumnsMainLine.push(new nlobjSearchColumn("formulacurrency_taxtotal",null,"sum").setFormula("NVL({taxtotal},0)"));
            }

            arrColumnsMainLine.push(new nlobjSearchColumn("formulacurrency_shippingamount",null,"sum").setFormula("NVL({handlingcost},0)+NVL({shippingcost},0)"));
            arrColumnsMainLine.push(new nlobjSearchColumn(stfld_fxamounr,null,"sum"));
            
            log("debug",stLogTitle,"exec Savesearch for total");
            //var resultsMainLine = nlapiSearchRecord("invoice", null, arrFiltersMainline, arrColumnsMainLine);
            
            var objSrchMainLine = nlapiLoadSearch(null, 'customsearch_nsts_get_ci_summary_total');
            objSrchMainLine.addColumns(arrColumnsMainLine);
            objSrchMainLine.addFilters(arrFiltersMainline);
            var resultsMainLine = objSrchMainLine.runSearch().getResults(0, 1000);
            
            log("debug",stLogTitle,"End exec Savesearch for total");
            

            
            
            if(results){
                
                grossamount     = parseFloat(results[0].getValue("formulacurrency_grossamount", null, "sum"));
                discount        = parseFloat(results[0].getValue("formulacurrency_discount", null, "sum"));
                tax             = parseFloat(results[0].getValue("formulacurrency_taxamount", null, "sum"));
                
                grossamount     = (grossamount)? grossamount : 0;
                discount        = (discount)? -discount : 0;
                tax             = (tax)? tax : 0;

            }

            if(resultsMainLine)
            {
                amountpaid      = parseFloat(resultsMainLine[0].getValue("formulacurrency_amountpaid", null, "sum"));
                totaldue        = parseFloat(resultsMainLine[0].getValue("formulacurrency_amountremaining", null, "sum"));
                shippingamount  = parseFloat(resultsMainLine[0].getValue("formulacurrency_shippingamount", null, "sum"));
				tax             = parseFloat(resultsMainLine[0].getValue("formulacurrency_taxtotal", null, "sum"));
                amount          = parseFloat(resultsMainLine[0].getValue(stfld_fxamounr, null, "sum"));
                
                amountpaid      = (amountpaid)? amountpaid : 0;
                totaldue        = (totaldue)? totaldue : 0;
                shippingamount  = (shippingamount)? shippingamount : 0;
                
                
                subtotal        = (amount + discount) - (tax + shippingamount);
                itemtotal       = amount; 
            }
            
            intsubtotal        += subtotal;
            intgrossamount     += grossamount;
            intamount          += amount;
            intitemtotal       += itemtotal;
            intdiscount        += discount;
            inttax             += tax;
            intshippingamount  += shippingamount;
            intamountpaid      += amountpaid;
            inttotaldue        += totaldue;
            
        }// for
    }
    

    

    
    return{
        subtotal        : intsubtotal,
        itemtotal       : intitemtotal,
        discount        : -intdiscount,
        tax             : inttax,
        shippingamount  : intshippingamount,
        amountpaid      : -intamountpaid,
        totaldue        : inttotaldue
    };
}

/**
 * Retrieve the internal id's of the invoices that are associated in the consolidation
 * @param filter : {
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
 * @param data : object addition filters
 * @returns {Array} : array on Invoices Internal Id Associated in the CI
 */
function getInvoiceIdwithFilter(filter, data)
{
    var stLogTitle = "getInvoiceIdwithFilter";
    log("debug", stLogTitle, "START");

    var objCIconfig = getCISetup();
    var arrFilter = [];
    filter.data = data;

    arrFilter = setFilters(objCIconfig, filter, arrFilter);
    var results = getAllResults(null, objCIconfig.sourceSavedSearchDetail, arrFilter, null).results; //pdfCISaveSearch1
    var retResults = [];
    if (results)
    {
        log("debug", "getInvoiceIdwithFilter", "results.legnth:" + results.length);
        for (var i = 0; i < results.length; i++)
        {
            retResults.push(results[i].getId());
        }
    }

    log("debug", stLogTitle, "END");
    return retResults;
}

/**
 * get the Layout Information and updated in CI Setup Configuration variable 
 * @param layoutId
 * @returns {GLOBAL_CI_SETUP_CONFIG}
 */
function getLayout(layoutId)
{
    var stLogTitle = "GETLAYOUT";
    
    if(isEmpty(GLOBAL_CI_SETUP_CONFIG)){
        getCISetup();
    }
    
    layoutId = isEmpty(layoutId)? GLOBAL_CI_SETUP_CONFIG.defaultLayoutId : layoutId;
    
    if (!isEmpty(layoutId))
    {
        var objLayout = nlapiLookupField(RECTYPE_CUSTOMRECORD_NSTS_CI_LAYOUT, layoutId, [
                FLD_CUSTRECORD_NSTS_CI_PDF_TEMPLATE_FILE ,
                FLD_CUSTRECORD_NSTS_CI_GEN_PDF_SEARCH_1 , 
                FLD_CUSTRECORD_NSTS_CI_GEN_PDF_SEARCH_2 ,
                
                FLD_CUSTRECORD_NSTS_CI_IS_LANDSCAPE ,
                FLD_CUSTRECORD_NSTS_CI_TITLE_FONT_SIZE ,
                FLD_CUSTRECORD_NSTS_CI_SUB_TITLE_FONT_SIZE,
                FLD_CUSTRECORD_NSTS_CI_TH_FONT_SIZE ,
                FLD_CUSTRECORD_NSTS_CI_TR_FONT_SIZE ,
                FLD_CUSTRECORD_NSTS_CI_BODY_FONT_SIZE ,
                
                FLD_CUSTRECORDNSTS_CI_HEADER_HEIGHT,
                FLD_CUSTRECORD_NSTS_CI_BILLSHIP_FONT_SIZE,
                FLD_CUSTRECORD_NSTS_CI_BILLSHIP_TBL_HEIGHT,
        ]);

        var stLayoutPDFTemplate = objLayout[FLD_CUSTRECORD_NSTS_CI_PDF_TEMPLATE_FILE];
        var stLayoutItemSaveSearch = objLayout[FLD_CUSTRECORD_NSTS_CI_GEN_PDF_SEARCH_1];
        var stLayoutSummaryBySearch = objLayout[FLD_CUSTRECORD_NSTS_CI_GEN_PDF_SEARCH_2];

        var stLayoutIslandscape         = objLayout[FLD_CUSTRECORD_NSTS_CI_IS_LANDSCAPE]; 
        var stLayoutTitleFontSize       = objLayout[FLD_CUSTRECORD_NSTS_CI_TITLE_FONT_SIZE]; 
        var stLayoutSubTitleFontSize    = objLayout[FLD_CUSTRECORD_NSTS_CI_SUB_TITLE_FONT_SIZE];
        var stLayoutTHFontSize          = objLayout[FLD_CUSTRECORD_NSTS_CI_TH_FONT_SIZE];
        var stLayoutTRFontSize          = objLayout[FLD_CUSTRECORD_NSTS_CI_TR_FONT_SIZE];
        var stLayoutBodyFontSize        = objLayout[FLD_CUSTRECORD_NSTS_CI_BODY_FONT_SIZE];
        var stHeaderHeight              = objLayout[FLD_CUSTRECORDNSTS_CI_HEADER_HEIGHT];
        var stBillShipFontSize          = objLayout[FLD_CUSTRECORD_NSTS_CI_BILLSHIP_FONT_SIZE];
        var stBillShipTableHeight       = objLayout[FLD_CUSTRECORD_NSTS_CI_BILLSHIP_TBL_HEIGHT];
        
        stLayoutTitleFontSize           = (isEmpty(stLayoutTitleFontSize))? 10 : stLayoutTitleFontSize;
        stLayoutSubTitleFontSize        = (isEmpty(stLayoutSubTitleFontSize))? 9 : stLayoutSubTitleFontSize;
        stLayoutTHFontSize              = (isEmpty(stLayoutTHFontSize))? 9 : stLayoutTHFontSize;
        stLayoutTRFontSize              = (isEmpty(stLayoutTRFontSize))? 8 : stLayoutTRFontSize;
        stLayoutBodyFontSize            = (isEmpty(stLayoutBodyFontSize))? 9 : stLayoutBodyFontSize
        stHeaderHeight                  = (isEmpty(stHeaderHeight))? "35%" : stHeaderHeight;
        stBillShipFontSize              = (isEmpty(stBillShipFontSize))? 8 : stBillShipFontSize;
        stBillShipTableHeight           = (isEmpty(stBillShipTableHeight))? "100" : stBillShipTableHeight;
        
        GLOBAL_CI_SETUP_CONFIG.templateid = stLayoutPDFTemplate;
        GLOBAL_CI_SETUP_CONFIG.pdfCISaveSearch1 = stLayoutItemSaveSearch;
        GLOBAL_CI_SETUP_CONFIG.pdfCISaveSearch2 = stLayoutSummaryBySearch;
        
        GLOBAL_CI_SETUP_CONFIG.layoutIslandscape        = stLayoutIslandscape;
        GLOBAL_CI_SETUP_CONFIG.layoutTitleFontSize      = stLayoutTitleFontSize;
        GLOBAL_CI_SETUP_CONFIG.layoutSubTitleFontSize   = stLayoutSubTitleFontSize;
        GLOBAL_CI_SETUP_CONFIG.layoutTHFontSize     = stLayoutTHFontSize;
        GLOBAL_CI_SETUP_CONFIG.layoutTRFontSize     = stLayoutTRFontSize;
        GLOBAL_CI_SETUP_CONFIG.layoutBodyFontSize   = stLayoutBodyFontSize;
        
        GLOBAL_CI_SETUP_CONFIG.headerHeight         = stHeaderHeight;
        GLOBAL_CI_SETUP_CONFIG.billshipFontSize     = stBillShipFontSize;
        GLOBAL_CI_SETUP_CONFIG.billshipTableHeight  = stBillShipTableHeight;
        
        log("debug", stLogTitle, "stLayoutPDFTemplate:" + stLayoutPDFTemplate + " ,stLayoutItemSaveSearch:" + stLayoutItemSaveSearch + " ,stLayoutSummaryBySearch:" +stLayoutSummaryBySearch);
    }
    return GLOBAL_CI_SETUP_CONFIG;
}

/**
 * get the Customer Preference for the layout Fax and email configuration
 * this will updated the CI Setup Coonfiguration Valirable
 * @param objCustomer nlobjRecord Customer Record
 * @returns {GLOBAL_CI_SETUP_CONFIG}
 */
function getCustomerRef(objCustomer){
    var stLogTitle = "GETCUSTOMERREF"
    
    GLOBAL_CI_SETUP_CONFIG.isAttachToEmail = objCustomer.getFieldValue(FLD_CUSTENTITY_NSTS_CI_EMAIL_ATTACHMENT);
    GLOBAL_CI_SETUP_CONFIG.emailSenderUserId = objCustomer.getFieldValue(FLD_CUSTENTITY_NSTS_CI_EMAIL_SENDER);
    GLOBAL_CI_SETUP_CONFIG.emailTemplate = objCustomer.getFieldValue(FLD_CUSTENTITY_NSTS_CI_EMAIL_TEMPLATE);
    
    GLOBAL_CI_SETUP_CONFIG.isAttachToFax = objCustomer.getFieldValue(FLD_CUSTENTITY_NSTS_CI_FAX_ATTACHMENT);
    GLOBAL_CI_SETUP_CONFIG.faxSenderUserId = objCustomer.getFieldValue(FLD_CUSTENTITY_NSTS_CI_FAX_SENDER);
    GLOBAL_CI_SETUP_CONFIG.faxTemplate = objCustomer.getFieldValue(FLD_CUSTENTITY_NSTS_CI_FAX_TEMPLATE);
    
    if(isEmpty(GLOBAL_CI_SETUP_CONFIG.isAttachToEmail) || GLOBAL_CI_SETUP_CONFIG.isAttachToEmail == "F")
    {
        GLOBAL_CI_SETUP_CONFIG.isAttachToEmail      = GLOBAL_CI_SETUP_CONFIG.isAttachToEmailDefault;
        GLOBAL_CI_SETUP_CONFIG.emailSenderUserId    = GLOBAL_CI_SETUP_CONFIG.emailSenderUserIdDefault;
        GLOBAL_CI_SETUP_CONFIG.emailTemplate        = GLOBAL_CI_SETUP_CONFIG.emailTemplateDefault;
    }
    
    if(isEmpty(GLOBAL_CI_SETUP_CONFIG.isAttachToFax) || GLOBAL_CI_SETUP_CONFIG.isAttachToFax == "F")
    {
        GLOBAL_CI_SETUP_CONFIG.isAttachToFax        = GLOBAL_CI_SETUP_CONFIG.isAttachToFaxDefault;
        GLOBAL_CI_SETUP_CONFIG.faxSenderUserId  = GLOBAL_CI_SETUP_CONFIG.faxSenderUserIdDefault;
        GLOBAL_CI_SETUP_CONFIG.faxTemplate      = GLOBAL_CI_SETUP_CONFIG.faxTemplateDefault;
    }
    
    
    log("debug", stLogTitle, "GLOBAL_CI_SETUP_CONFIG.isAttachToEmail:" + GLOBAL_CI_SETUP_CONFIG.isAttachToEmail + " ,GLOBAL_CI_SETUP_CONFIG.emailSenderUserId:" + GLOBAL_CI_SETUP_CONFIG.emailSenderUserId)
    
    return GLOBAL_CI_SETUP_CONFIG;
}

/**
 * genarate the Table Structure this function is used in generating PDF
 * @param stXMLReport
 * @param searchArr
 * @param key
 */
function processSearchExpression(stXMLReport, searchArr, key)
{
    log('DEBUG', 'processSearchExpression', '---Started---');
    if (!isEmpty(searchArr))
    {
        var quest = '';
        var arrSubs = new Array();
        var table = '';
        quest = '${?' + key + '?}';
        table += buildSearchHeader(searchArr);
        table += buildSearchBody(searchArr, false);

        var index = arrSubs.length;
        arrSubs[index] = new Array();
        arrSubs[index][0] = quest;
        arrSubs[index][1] = table;

        stXMLReport = findReplaceExpression(stXMLReport, arrSubs);
    }
    log('DEBUG', 'processSearchExpression', '---Finished---');
    return stXMLReport;
}

/**
 * this function will generated the TR and TH tags for the table
 * @param saveSearch
 * @returns {String}
 */
function buildSearchHeader(saveSearch)
{
    var htmlHeader = '';

    if (saveSearch)
    {
        var allColumn = saveSearch[0].getAllColumns();//getColumns();

        htmlHeader += '<tr>';
        for (var i = 0; i < allColumn.length; i++)
        {
            var stLabel = allColumn[i].getLabel();
            stLabel = (stLabel != null) ? stLabel.toUpperCase() : '';
            htmlHeader += '<th>' + nlapiEscapeXML(stLabel) + '</th>';
        }
        htmlHeader += '</tr>';
    }

    return htmlHeader;
}

/**
 * this function will generated the TR and TD tags for the table
 * @param searchResult
 * @param isSummary
 * @returns {String}
 */
function buildSearchBody(searchResult, isSummary)
{
    var htmlBody = '';

    for (var i = 0; i < searchResult.length; i++)
    {
        htmlBody += '<tr>';
        var cols = searchResult[i].getAllColumns();

        if (cols)
        {
            for (var x = 0; x < cols.length; x++)
            {
                var body = searchResult[i].getValue(cols[x]);
                var fldType = cols[x].type;
                
                
                if(fldType == "currency"){
                    body = (!isEmpty(body)) ? body : 0;
                    htmlBody += '<td align="right">';
                    htmlBody += '${toCurrency({0})}'.format(nlapiEscapeXML(body));
                    htmlBody += '</td>';
                }else{
                    body = (body != null) ? body : '';
                    htmlBody += '<td>';
                    htmlBody += nlapiEscapeXML(body);
                    htmlBody += '</td>';
                }
            }
        }

        htmlBody += '</tr>';
    }

    return htmlBody;
}

/**
 * Gets the term to be used when computing the due date from the customer 
 * 
 * @param intCustomerId
 */
function getTerm(intCustomerId) {
    var objTerm = null;
    var stTerm = null;
    if (!isEmpty(intCustomerId)) {
        stTerm = nlapiLookupField('customer', intCustomerId, 'terms');
    }
    
    if (!isEmpty(stTerm)) {
        var termDays = nlapiLookupField('term', stTerm, 'daysuntilnetdue');
        
        objTerm = {
                id : stTerm,
                termDays : termDays
        };
    }
    
    return objTerm;
}

/**
 * Gets the preferred term and days
 * 
 * @returns {___anonymous75741_75816}
 */
function getPreferredTerm() {
    var objTerm = null;
    var arrFil = [new nlobjSearchFilter('preferred', null, 'is', 'T')];
    
    var arrCol = [new nlobjSearchColumn('internalid'),
                  new nlobjSearchColumn('daysuntilnetdue')];
    
    var arrRes = nlapiSearchRecord('term', null, arrFil, arrCol);
    
    if (!isEmpty(arrRes)) {
        var stTerm = arrRes[0].getValue('internalid');
        var termDays = arrRes[0].getValue('daysuntilnetdue');

        objTerm = {
                id : stTerm,
                termDays : termDays
        };
    }
    
    return objTerm;
}