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
 * 1.00       18 Feb 2016     Roxanne Audette   Initial version.
 * 
 */

//RECORDS
var REC_CONTACT = 'contact',
    REC_CUSTOMER = 'customer',
    REC_ITEM = 'item',
    REC_INVOICE = 'invoice',
    REC_CONSOLIDATED_INVOICE = 'customrecord_nsts_ci_consolidate_invoice',
    REC_CONTRACT = 'customrecord_contracts',
    REC_CONTRACT_ITEM = 'customrecord_contract_item',
    REC_CONTRACT_PREF = 'customrecord_swe_preferences';

//TRANSACTION FIELDS
var FLD_CUSTBODY_RENEWAL_WAS_RESET = 'custbody_nsts_swva_renewalwasreset',
    FLD_CUSTBODY_ATLAS_EMAIL_TEMP = 'custbody_nsts_swva_emailtemplate',
    FLD_CUSTBODY_FROM_CONTRACT = 'custbody_swe_from_contract',
    FLD_CUSTBODY_CLEARED_CONTRACT = 'custbody_swe_cleared_contract',
    FLD_CUSTBODY_DUNNING_LEVEL = 'custbody_dunning_level',
    FLD_CUSTBODY_DUNNING_SENDER = 'custbody_nsts_swva_dunning_sender',
    FLD_CUSTBODY_LAST_COLLECTION_DATE = 'custbody_nsts_swva_last_col_email_date';

//CONTRACT
var FLD_CUSTRECORD_DATE_RENEWED = 'custrecord_contract_date_renewed',
    FLD_CUSTRECORD_RENEW_TRANS = 'custrecord_contract_renewal_tran',
    FLD_CUSTRECORD_RENEW_OPPOR = 'custrecord_contract_renewal_opp',
    FLD_CUSTRECORD_RENEW_VAL_GROSS = 'custrecord_swe_term_renew_val_gross',
    FLD_CUSTRECORD_RENEW_VAL_NET = 'custrecord_swe_term_renew_val_net';

//CONTRACT ITEM
var FLD_CUSTRECORD_CI_CONTRACT_ID = 'custrecord_ci_contract_id',
    FLD_CUSTRECORD_CI_RENEWAL_PROC_ON = 'custrecord_ci_renewal_processed_on';

//CONTRACT RENEWAL PREFERENCE
var FLD_CUSTRECORD_PREF_ID = 'custrecord_swe_pref_id',
    FLD_CUSTRECORD_PREF_VALUE = 'custrecord_swe_pref_value';

//CI
var FLD_CUSTRECORD_CI_AR_EMAILS = 'custrecord_nsts_ci_ar_contact_emails',
    FLD_CUSTRECORD_CI_CUSTOMER = 'custrecord_nsts_ci_customer';

//SCRIPT PARAMETERS
var SPARAM_CONTACT_ROLE_UE = 'custscript_nsts_swva_contactrole_ue',
    SPARAM_CONTACT_ROLE_CS = 'custscript_nsts_swva_contactrole_cs', 
    SPARAM_CONTACT_ROLE_WF = 'custscript_nsts_swva_contactrole_wf',
    SPARAM_CONTACT_ROLE_CI = 'custscript_nsts_swva_contactrole_ci';

//SCRIPTS
var SCRIPT_RESET_RENEWAL_DATES = 'customscript_nsts_swva_contractrenew_cs';
    
//OTHER HARD CODED FIELDS
var HC_BTN_RESET_RENEWAL_DATES = 'custpage_nsts_swva_reset_renewal';

//OTHER NATIVE FIELDS
var HC_EMAIL = 'email',
    HC_TO_BE_EMAILED = 'tobeemailed',
    HC_CONTACT_ROLE = 'contactrole',
    HC_ENTITY = 'entity',
    HC_INTERNAL_ID = 'internalid',
    HC_IS_CLOSED = 'isclosed';

var HC_CONTEXT = {
    UserInterface : 'userinterface',
    Scheduled : 'scheduled',
    CSVImport : 'csvimport'
};

var HC_TRANS_ID = {
    Opportuniy : '1',
    Quote : '2',
    SalesOrder : '3'
};
