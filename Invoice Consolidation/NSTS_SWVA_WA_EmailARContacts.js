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

/**
 * @return {String|Number|Object|void} Any or no return value
 */
function sendEmailToARContacts() {
    var stRecordType = nlapiGetRecordType().toLowerCase();
    var stEmail = getARContacts((nlapiGetRecordType().toLowerCase() == REC_INVOICE) ? SPARAM_CONTACT_ROLE_WF : SPARAM_CONTACT_ROLE_CI);
    if(!isEmpty(stEmail))
        nlapiSetFieldValue((stRecordType == REC_INVOICE) ? HC_EMAIL : FLD_CUSTRECORD_CI_AR_EMAILS, stEmail);
}
