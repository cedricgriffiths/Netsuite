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
 * 1.00       10 Feb 2016     Roxanne Audette   Initial version.
 * 
 */

function getARContacts(stScriptParam, type){
    var arAREmail = [];
    
    var stRecordType = nlapiGetRecordType().toLowerCase();
    var stContactRole = nlapiGetContext().getSetting('SCRIPT', stScriptParam);
    var stCustomer = null;
    
    if(stRecordType == REC_INVOICE){
        stCustomer = !isEmpty(nlapiGetFieldValue(HC_ENTITY)) ? nlapiGetFieldValue(HC_ENTITY) : 
            (type == 'xedit') ? nlapiLookupField(stRecordType, nlapiGetRecordId(), HC_ENTITY) : '';
        nlapiLogExecution('DEBUG', 'RECORD TYPE/CONTACT ROLE/CUSTOMER', stRecordType+'/'+stContactRole+'/'+stCustomer);
    }else{
        stCustomer = !isEmpty(nlapiGetFieldValue(FLD_CUSTRECORD_CI_CUSTOMER)) ? nlapiGetFieldValue(FLD_CUSTRECORD_CI_CUSTOMER) : 
            (type == 'xedit') ? nlapiLookupField(stRecordType, nlapiGetRecordId(), FLD_CUSTRECORD_CI_CUSTOMER) : '';
        nlapiLogExecution('DEBUG', 'RECORD TYPE/CONTACT ROLE/CUSTOMER', stRecordType+'/'+stContactRole+'/'+stCustomer);
    }
    
    if(!isEmpty(stContactRole) && !isEmpty(stCustomer)){
        var arFilter = [new nlobjSearchFilter(HC_CONTACT_ROLE, null, 'anyof', stContactRole),
                        new nlobjSearchFilter(HC_INTERNAL_ID, REC_CUSTOMER, 'anyof', stCustomer)]
        var objSearch = getAllResults(REC_CONTACT, null, arFilter, new nlobjSearchColumn(HC_EMAIL));
        if(!isEmpty(objSearch)){
            var contactResult = objSearch.results;
            for (var i = 0; i < contactResult.length; i++){
                var stEmail = contactResult[i].getValue(HC_EMAIL);
                if(!isEmpty(stEmail)){
                    if(arAREmail.indexOf(stEmail) == -1)
                        arAREmail.push(stEmail);
                }
            }
        }
    }
    
    if(!isEmpty(stCustomer)){
        var stCustomerEmail = nlapiLookupField(REC_CUSTOMER, stCustomer, HC_EMAIL);
        if(!isEmpty(stCustomerEmail)){
            arAREmail.push(stCustomerEmail);
        }
    }
    
    return arAREmail.toString();
}

function getContractPref(){
    var objContractPref = null;
    var arFilter =  [new nlobjSearchFilter('isinactive', null, 'is', 'F'),
                     new nlobjSearchFilter(FLD_CUSTRECORD_PREF_ID, null, 'is', 'swe_r05_transaction_type')];
    var arColumn = [new nlobjSearchColumn(FLD_CUSTRECORD_PREF_VALUE)];
    var objContractPrefRes = nlapiSearchRecord(REC_CONTRACT_PREF, null, arFilter, arColumn);
    
    if(!isEmpty(objContractPrefRes)){
        var stPrefValue = objContractPrefRes[0].getValue(FLD_CUSTRECORD_PREF_VALUE);
        objContractPref = new objContractPreferences(stPrefValue);
    }else{
        objContractPref = new objContractPreferences('');
    }
    return objContractPref;
}

function objContractPreferences(stPrefValue){
    this.stPrefValue = stPrefValue;
}

function getTransStatusPref(){
    var objContractPref = null;
    var arFilter =  [new nlobjSearchFilter('isinactive', null, 'is', 'F'),
                     new nlobjSearchFilter(FLD_CUSTRECORD_PREF_ID, null, 'is', 'status_for_reset_renewal_transaction')];
    var arColumn = [new nlobjSearchColumn(FLD_CUSTRECORD_PREF_VALUE)];
    var objContractPrefRes = nlapiSearchRecord(REC_CONTRACT_PREF, null, arFilter, arColumn);
    
    if(!isEmpty(objContractPrefRes)){
        var stPrefValue = objContractPrefRes[0].getValue(FLD_CUSTRECORD_PREF_VALUE);
        objContractPref = new objTransPreferences(stPrefValue);
    }else{
        objContractPref = new objTransPreferences('');
    }
    return objContractPref;
}

function objTransPreferences(stPrefValue){
    this.stPrefValue = stPrefValue;
}

/**
 * fetch more than 1000 save Search Result
 * @param type RecordType id this is optional if the "id" is givent
 * @param id internal id of the save search this is optional if the "type" is Given
 * @param arrFilters nlobjSearchFileter[]
 * @param arrColumns nlobjSearchColumn[]
 * @returns {
 *      length int,
 *      saveSearch nlobjSearch,
 *      results nlobjSearchResult[] ,
 *      getResults function(start, end) nlobjSearchResult[],
 *      gotoPage function(page, displayItemCount) nlobjSearchResult[]
 *  }
 */
function getAllResults(type, id, arrFilters, arrColumns){
    var stLoggerTitle = 'GETALLRESULTS';
    if(isEmpty(type) && isEmpty(id))
    {
        return null;
    }
    
    //log("debug", stLoggerTitle, "type:{0},id{1}".format(type, id));
    
    var arrResults = [];
    var count = 0;
    var init = true;
    var min = 0;
    var max = 1000;
    var search;
    
    if (!isEmpty(id))
    {
        search = nlapiLoadSearch(type, id);
        if (arrFilters) search.addFilters(arrFilters);
        if (arrColumns) search.addColumns(arrColumns);
    }
    else
    {
        //log("debug", stLoggerTitle, "Creating Save Search");
        search = nlapiCreateSearch(type, arrFilters, arrColumns);
        //log("debug", stLoggerTitle, "New Save Search is Created");
    }
    
    var rs = search.runSearch();
    
    while (count == 1000 || init)
    {
        var resultSet = rs.getResults(min, max);
        if (!isEmpty(resultSet)) {
            arrResults = arrResults.concat(resultSet);
            min = max;
            max += 1000;
            count = resultSet.length;
        }
        init = false;
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

                //log("debug", "getAllResults", "start:" + start + " end:" + end);
                pageResults = arrResults.slice(start, end);
            }

            return pageResults;
        }
    };
    return (retVal);
}

function isEmpty(value){
    if (value == null || value == 'null' || value == undefined || value == '' || value == "" || value.length <= 0) { return true; }
    return false;
}
