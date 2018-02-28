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

var CURRECTYPE                                      = nlapiGetRecordType();

var CUSTOMSCRIPT_NSTS_CI_SL_CS                      = "customscript_nsts_ci_sl_cs";
var FLD_CUSTRECORD_NSTS_CI_CUSTOMER_SCREEN          = "custrecord_nsts_ci_customer_screen";
var RECTYPE_CUSTOMRECORD_SS_CI_CONSOLIDATE_INVOICE = "customrecord_nsts_ci_consolidate_invoice";
var FLD_CUSTRECORD_SS_CI_CUSTOMER                  = 'custrecord_nsts_ci_customer'; // "custrecordss_ci_customer";
var FLD_CUSTRECORD_SS_CI_SELECTED_INV              = 'custrecord_nsts_ci_selected_inv';
var FLD_CUSTRECORD_SS_CI_NUMBER                    = 'custrecord_nsts_ci_number';
var FLD_CUSTRECORD_SS_CI_PDF_URL                   = 'custrecord_nsts_ci_pdf_url';

var SCRIPTID                                    = "customscript_nsts_ci_sl";
var DEPLOYMENTID                                = "customdeploy_nsts_ci_sl";

//SUitelet Filed
var FLD_CUSTPAGE_CUSTOMER                           = "custpage_customer";

//custom records used
var RECTYPE_CUSTOMRECORDSS_NSTS_CI_CONSOLIDATE_INVOICE  = "customrecord_nsts_ci_consolidate_invoice";
var RECTYPE_CUSTOMRECORD_NSTS_CI_SETUP                  = "customrecord_nsts_ci_setup"; // "customrecord_ss_ci_setup";
var RECTYPE_CUSTOMRECORD_NSTS_CI_LAYOUT                 = "customrecord_nsts_ci_layout";
var RECTYPE_CUSTOMRECORD_NSTS_CI_TASK                   = 'customrecord_nsts_ci_task';
var RECTYPE_CUSTOMRECORD_NSTS_CI_LOG                    = 'customrecord_nsts_ci_log';
var RECTYPE_CUSTOMRECORD_CONTRACTS                      = "customrecord_contracts";
var RECTYPE_CUSTOMRECORD_NSTS_CI_GEN_CI_LINKS           = 'customrecord_nsts_ci_gen_ci_links';

//Consolidated Invoice Record Fields
var CUSTOMSCRIPT_NSTS_CI_ONLINE_SUITELET_CS     = "customscript_nsts_ci_online_suitelet_cs";
var FLD_CUSTRECORD_NSTS_CI_ENABLE_FOR           = "custrecord_nsts_ci_enable_for";
var FLD_CUSTRECORD_NSTS_CI_ENABLE_CI            = "custrecord_nsts_ci_enable_ci";
var FLD_CUSTRECORD_NSTS_CI_MAX_NO               = "custrecord_nsts_ci_max_no";
var FLD_CUSTRECORD_NSTS_CI_MIN_NO               = "custrecord_nsts_ci_min_no";
var FLD_CUSTRECORD_NSTS_CI_CREATE_ONLINE        = "custrecord_nsts_ci_create_online";
var FLD_CUSTRECORD_NSTS_CI_SCHEDULE             = "custrecord_nsts_ci_schedule";
var FLD_CUSTRECORD_NSTS_CI_SEARCH               = "custrecord_nsts_ci_search";
var FLD_CUSTRECORD_NSTS_CI_SEARCH_DTL           = "custrecord_nsts_ci_search_dtl";
var FLD_CUSTRECORD_NSTS_CI_INCLUDE_SUBCUST      = "custrecord_nsts_ci_include_subcust";
var FLD_CUSTRECORD_NSTS_CI_BILLINGADDRESS       = "custrecord_nsts_ci_billingaddress";
var FLD_CUSTRECORD_NSTS_CI_CURRENCY             = "custrecord_nsts_ci_currency";
var FLD_CUSTRECORD_NSTS_CI_FILTERS_NOTE         = "custrecord_nsts_ci_filters_note";
var FLD_CUSTRECORD_NSTS_CI_CONTRACT             = "custrecord_nsts_ci_contract";
var FLD_CUSTRECORD_NSTS_CI_PROJECT              = "custrecord_nsts_ci_project";
var FLD_CUSTRECORD_NSTS_CI_SOURCE               = "custrecord_nsts_ci_source";
var FLD_CUSTRECORD_NSTS_CI_LOCATION             = "custrecord_nsts_ci_location";
var FLD_CUSTRECORD_NSTS_CI_DUEDATE              = "custrecord_nsts_ci_duedate";
var FLD_CUSTRECORD_NSTS_CI_TYPE                 = "custrecord_nsts_ci_type";
var FLD_CUSTRECORD_NSTS_CI_PER_PAGE             = 'custrecord_nsts_ci_per_page';
var FLD_CUSTRECORD_NSTS_CI_LAYOUT               = "custrecord_nsts_ci_layout";
var FLD_CUSTRECORD_NSTS_CI_EMAIL_ATTACHMENT     = 'custrecord_nsts_ci_email_attachment';
var FLD_CUSTRECORD_NSTS_CI_EMAIL_SENDER         = "custrecord_nsts_ci_email_sender";
var FLD_CUSTRECORD_NSTS_CI_EMAIL_TEMPLATE       = "custrecord_nsts_ci_email_template";
var FLD_CUSTRECORD_NSTS_CI_AS_FILE_IN_FOLDER    = 'custrecord_nsts_ci_as_file_in_folder';
var FLD_CUSTRECORD_NSTS_CI_FAX_ATTACHMENT       = "custrecord_nsts_ci_fax_attachment";
var FLD_CUSTRECORD_NSTS_CI_FAX_SENDER           = "custrecord_nsts_ci_fax_sender";
var FLD_CUSTRECORD_NSTS_CI_FAX_TEMPLATE         = "custrecord_nsts_ci_fax_template";
var FLD_CUSTRECORD_NSTS_CI_ADMIN_EMAIL         = "custrecord_nsts_ci_admin_email";
var FLD_CUSTRECORD_NSTS_CI_CONTACT_CATEGORY        = "custrecord_nsts_ci_contact_category";
var FLD_CUSTRECORD_NSTS_CI_TERM                 = "custrecord_nsts_ci_term";
var FLD_CUSTRECORD_NSTS_CI_UPDATE_DUEDATE       = "custrecord_nsts_ci_update_duedate";
var FLD_CUSTRECORD_NSTS_CI_CLD_INV_DUEDATE_UPD  = "custrecord_nsts_ci_cld_inv_duedate_upd";
var FLD_CUSTRECORD_NSTS_CI_RESULT_PER_CHUCK     = "custrecord_nsts_ci_result_per_chuck";
var FLD_CUSTRECORD_NSTS_CI_TRAN_AGE_BY_DAY      = 'custrecord_nsts_ci_tran_age_by_day';

var FLD_CUSTRECORD_NSTS_CI_CUSTOMER             = "custrecord_nsts_ci_customer";
var FLD_CUSTRECORD_NSTS_CI_SELECTED_INV         = "custrecord_nsts_ci_selected_inv";
var FLD_CUSTRECORD_NSTS_CI_ISPROCESSED          = 'custrecord_nsts_ci_isprocessed';
var FLD_CUSTRECORD_NSTS_CI_DATE                 = "custrecord_nsts_ci_date";
var FLD_CUSTRECORD_NSTS_CI_PDFFILE              = "custrecord_nsts_ci_pdffile";
var FLD_CUSTRECORD_NSTS_CI_PREFERENCES          = "custrecord_nsts_ci_preferences";
var FLD_CUSTRECORD_NSTS_CI_SAVED_IN_SERVERSIDE  = "custrecord_nsts_ci_saved_in_serverside";
var FLD_CUSTRECORD_NSTS_CI_PDF_SUBTOTAL             = "custrecord_nsts_ci_pdf_subtotal";
var FLD_CUSTRECORD_NSTS_CI_PDF_DISCOUNT             = "custrecord_nsts_ci_pdf_discount";
var FLD_CUSTRECORD_NSTS_CI_PDF_TAX                  = "custrecord_nsts_ci_pdf_tax";
var FLD_CUSTRECORD_NSTS_CI_PDF_SHIPPING_HANDLING    = "custrecord_nsts_ci_pdf_shipping_handling";
var FLD_CUSTRECORD_NSTS_CI_PDF_TOTAL_DUE            = "custrecord_nsts_ci_pdf_total_due";
var FLD_CUSTRECORD_NSTS_CI_PDF_ITEMTOTAL            = "custrecord_nsts_ci_pdf_itemtotal";
var FLD_CUSTRECORD_NSTS_CI_PDF_AMOUNTPAID           = "custrecord_nsts_ci_pdf_amountpaid";
var FLD_CUSTRECORD_NSTS_CI_COUNT_INVOICES           = "custrecord_nsts_ci_count_invoices";
var FLD_CUSTRECORDNSTS_CI_TASK                  = 'custrecordnsts_ci_task';

var FLD_CUSTRECORD_NSTS_CI_SUBSIDIARY               = "custrecord_nsts_ci_subsidiary";
var FLD_CUSTRECORD_NSTS_CI_PREF_CURRENCY            = "custrecord_nsts_ci_pref_currency";
var FLD_CUSTRECORD_NSTS_CI_PREF_BILLADDRESS         = "custrecord_nsts_ci_pref_billaddress";
var FLD_CUSTRECORD_NSTS_CI_PREF_LOCATION            = "custrecord_nsts_ci_pref_location";
var FLD_CUSTRECORD_NSTS_CI_PREF_DUEDATE             = "custrecord_nsts_ci_pref_duedate";
var FLD_CUSTRECORD_NSTS_CI_PREF_CONTRACT            = "custrecord_nsts_ci_pref_contract";
var FLD_CUSTRECORD_NSTS_CI_PREF_PROJECT             = "custrecord_nsts_ci_pref_project";
var FLD_CUSTRECORD_NSTS_CI_PREF_SOURCE              = "custrecord_nsts_ci_pref_source";
var FLD_CUSTRECORD_NSTS_CI_STATUS_LIST              = 'custrecord_nsts_ci_status_list';
var FLD_CUSTRECORD_NSTS_CI_TRAN_DUEDATE             = 'custrecord_nsts_ci_tran_duedate';

//CI Task Fields
var FLD_CUSTRECORD_NSTS_CI_TASK_TYPE       = 'custrecord_nsts_ci_task_type';
var FLD_CUSTRECORD_NSTS_CI_INITIATED_BY    = 'custrecord_nsts_ci_initiated_by';
var FLD_CUSTRECORD_NSTS_CI_TASK_START      = 'custrecord_nsts_ci_task_start';
var FLD_CUSTRECORD_NSTS_CI_TASK_ENDED      = 'custrecord_nsts_ci_task_ended';
var FLD_CUSTRECORD_NSTS_CI_TASK_STATUS     = 'custrecord_nsts_ci_task_status';
var FLD_CUSTRECORD_NSTS_CI_ERROR_DETAILS   = 'custrecord_nsts_ci_error_details';
var FLD_CUSTRECORD_NSTS_CI_RECORDS         = 'custrecord_nsts_ci_records';
var FLD_CUSTRECORD_NSTS_CI_RECORDS_CREATED = 'custrecord_nsts_ci_records_created';

//CIL Fields
var FLD_CUSTRECORD_NSTS_CIL_INVOICE         = 'custrecord_nsts_cil_invoice';
var FLD_CUSTRECORD_NSTS_CIL_CI_NUMBER       = 'custrecord_nsts_cil_ci_number';

//CI Task Statuses
var CI_STARTED    = '1';     
var IN_PROCESS    = '2';
var COMPLETED     = '3'; //PDF Complte
var FAILED        = '4';
var COMPLETEWERR  = '5';
var OVERALLCOMPLETE  = '6';
 
//CI Task Types
var ONLINE    = '1';     
var SCHEDULED = '2';     
var CUSTOMER  = '3';

//CI Status
var CI_STATUS_PENDING = '1';
var CI_STATUS_COMPLETE = '2';
var CI_STATUS_FAILED = '3';


//CI Log Fields
var FLD_CUSTRECORD_NSTS_CI_TASK_ID      = 'custrecord_nsts_ci_task_id';
var FLD_CUSTRECORD_NSTS_CI_SCRIPT_NAME  = 'custrecord_nsts_ci_script_name';
var FLD_CUSTRECORD_NSTS_CI_LOG_MSG      = 'custrecord_nsts_ci_log_msg';
var FLD_CUSTRECORD_NSTS_CI_CUSTOMERS    = 'custrecord_nsts_ci_customers';
var FLD_CUSTRECORD_NSTS_CI_NUMBERS      = 'custrecord_nsts_ci_numbers';
var FLD_CUSTRECORD_NSTS_CI_LOG_NUMBERS = "custrecord_nsts_ci_log_numbers";
var FLD_CUSTRECORD_NSTS_CI_TASK_DEPLOYMENTID = "custrecord_nsts_ci_task_deploymentid";

// Custom Filters
var FLD_CUSTRECORD_NSTS_CI_CUSTOM_FIELD   = "custrecord_nsts_ci_custom_field{0}";
var FLD_CUSTRECORD_NSTS_CUSTOM_FIELD_TYPE = "custrecord_nsts_custom_field{0}_type";
var FLD_CUSTRECORD_NSTS_CUSTOM_FIELD_ID   = "custrecord_nsts_custom_field{0}_id";
var FLD_CUSTRECORD_NSTS_CUSTOM_FIELD2_SRC = "custrecord_nsts_custom_field{0}_src";


//Layout
var FLD_CUSTRECORD_NSTS_CI_PDF_TEMPLATE_FILE    = "custrecord_nsts_ci_pdf_template_file";
var FLD_CUSTRECORD_NSTS_CI_GEN_PDF_SEARCH_1     = "custrecord_nsts_ci_gen_pdf_search_1";
var FLD_CUSTRECORD_NSTS_CI_GEN_PDF_SEARCH_2     = "custrecord_nsts_ci_gen_pdf_search_2";
var SUBLIST_CUSTPAGE_CI_INVOICES_DETAIL         = "custpage_ci_invoices_detail";
var SUBLIST_CUSTPAGE_CI_INVOICES                = "custpage_ci_invoices";
var FLD_CUSTPAGE_SELECTED_CI                    = 'custpage_selected_ci';
var FLD_CUSTRECORD_NSTS_CI_IS_LANDSCAPE         = "custrecord_nsts_ci_is_landscape";
var FLD_CUSTRECORD_NSTS_CI_TITLE_FONT_SIZE      = "custrecord_nsts_ci_title_font_size";
var FLD_CUSTRECORD_NSTS_CI_SUB_TITLE_FONT_SIZE  = "custrecord_nsts_ci_sub_title_font_size";
var FLD_CUSTRECORD_NSTS_CI_TH_FONT_SIZE         = "custrecord_nsts_ci_th_font_size";
var FLD_CUSTRECORD_NSTS_CI_TR_FONT_SIZE         = "custrecord_nsts_ci_tr_font_size";
var FLD_CUSTRECORD_NSTS_CI_BODY_FONT_SIZE       = "custrecord_nsts_ci_body_font_size";
var FLD_CUSTRECORDNSTS_CI_HEADER_HEIGHT         = "custrecordnsts_ci_header_height";
var FLD_CUSTRECORD_NSTS_CI_BILLSHIP_FONT_SIZE   = "custrecord_nsts_ci_billship_font_size";
var FLD_CUSTRECORD_NSTS_CI_BILLSHIP_TBL_HEIGHT  = "custrecord_nsts_ci_billship_tbl_height";

var FLD_CUSTPAGE_CIDATE_FLAG                   = "custpage_cidate_flag";
var FLD_CUSTPAGE_CIDATE                        = "custpage_cidate";
var FLD_SELECTINVOICE                          = "selectinvoice";
var FLD_SELECTEDINVOICES                       = "selectedinvoices";
var FLD_SELECTINVOICEDATA                      = "selectinvoicedata";
var ENABLELOG                                  = true;
var SCRIPTID_ONLINE                            = "customscript_nsts_ci_online_sl";
var DEPLOYMENTID_ONLINE                        = "customdeploy_nsts_ci_online_sl";
var SCHED_SCRIPT_DEPLOYMENTID                  = "customdeploy_nsts_ci_sched_batch_ss";


//scripts ids and deployments
var SCRIPTID_SCHED                                     = "customscript_nsts_ci_online_batch_ss";
var DEPLOYMENTID_SCHED                                 = "customdeploy_nsts_cs_generate_pdf_ss";
var SCRIPTID_ASYNC_PROC                                = 'customscript_nsts_ci_ss_async_process';
var SCRIPTPARAM_CUSTSCRIPT_NSTS_CI_KEYS_TO_GENERATE    = "custscript_nsts_ci_keys_to_generate";
var SCRIPTPARAM_CUSTSCRIPT_NSTS_CI_FILTERS_TO_GENERATE = "custscript_nsts_ci_filters_to_generate";
var SCRIPTPARAM_CUSTSCRIPT_NSTS_CI_TASK_ID             = "custscript_nsts_ci_task_id";
var SCRIPTPARAM_CUSTSCRIPT_NSTS_CI_ARRPAGE_VALUES      = 'custscript_nsts_ci_arrpage_values';
var SCRIPTPARAM_CUSTSCRIPT_NSTS_CI_OTHERVARIABLE       = 'custscript_nsts_ci_othervariable';

var CUSTSCRIPTNSTS_CI_IS_FOR_SCHED_CI                  = "custscriptnsts_ci_is_for_sched_ci";
var CUSTSCRIPT_NSTS_CI_CUSTOMER_CI_PARAM               = "custscript_nsts_customer_ci_param";
var CUSTSCRIPT_NSTS_SUBSIDIARY_CI_PARAM                = "custscript_nsts_subsidiary_ci_param";
var CUSTSCRIPTNSTS_CI_ENABLE_FOR                       = "custscriptnsts_ci_enable_for";
var CUSTSCRIPTNSTS_CI_BILLING                          = "custscriptnsts_ci_billing";
var CUSTSCRIPTNSTS_CI_IS_FOR_SCHED_CI                  = "custscriptnsts_ci_is_for_sched_ci";
var CUSTSCRIPT_NSTS_INV_CUTOFF_DT_CI_PARAM             = "custscript_nsts_inv_cutoff_dt_ci_param";
var CUSTSCRIPT_NSTS_CI_OFFSET_DAYS                     = "custscript_nsts_ci_offset_days";
var CUSTSCRIPT_NSTS_CI_DATE_OPT_CI_PARAM               = "custscript_nsts_ci_date_opt_ci_param";
var CUSTSCRIPT_NSTS_SPEC_DATE_CI_PARAM                 = "custscript_nsts_spec_date_ci_param";

// custom page
var FLD_CUSTPAGE_ENTITY                     = "custpage_entity";

//Custom Body entity
var FLD_CUSTBODY_NSTS_CI_EXCLUDE =           "custbody_nsts_ci_exclude";
var FLD_CUSTENTITY_NSTS_CI_EXCLUDE_CI       = "custentity_nsts_ci_exclude_ci";
var FLD_CUSTBODY_NSTS_CI_NUMBER             = "custbody_nsts_ci_number";
var FLD_CUSTENTITY_NSTS_CI_EMAIL_ATTACHMENT = "custentity_nsts_ci_email_attachment";
var FLD_CUSTENTITY_NSTS_CI_EMAIL_TEMPLATE   = "custentity_nsts_ci_email_template";
var FLD_CUSTENTITY_NSTS_CI_FAX_ATTACHMENT   = "custentity_nsts_ci_fax_attachment";
var FLD_CUSTENTITY_NSTS_CI_FAX_TEMPLATE     = "custentity_nsts_ci_fax_template";
var FLD_CUSTENTITY_NSTS_CI_EMAIL_SENDER     = "custentity_nsts_ci_email_sender";
var FLD_CUSTENTITY_NSTS_CI_FAX_SENDER       = "custentity_nsts_ci_fax_sender";
var FLD_CUSTENTITY_NSTS_CI_IN_PROCESS       = "custentity_nsts_ci_in_process";
var FLD_CUSTENTITY_NSTS_CI_LOCK_INUI        = 'custentity_nsts_ci_lock_inui';
var FLD_CUSTBODY_NSTS_CI_LINK               = 'custbody_nsts_ci_link';

//Contacts
var FLD_CUSTBODY_CONTRACT_NAME              = "custbody_contract_name";

//Contact Category List
var HC_AR_CONTACT = 'AR Contact';

//global variable declaration
var GLOBAL_USAGE_UNIT      = 0;
var PAGINATION_ROWS        = 10;
var GLOBAL_CI_SETUP_CONFIG = null; 


var arrHelpText = {
        customer : "The customer associated with this transaction",
        subsidiary : "The subsidiary associated with this transaction.",
        currency : "Invoice Currency",
        cutoffdate : "Defaulted to Current Date in MM/DD/YYYY format. Field to specify cut-off date of open Invoices for consolidation and is compared against Invoice Date",
        cidate : "Date associated with CI is defaulted to Invoice Cut-off Date other options are \nCurrent Date\nSpecified Date\nLast Invoice Date"
};

var HC_TASK_ID = null;
var HC_TASK_OBJ = null;


//Currency Definition
var CURRENCY_LOCALIZATION = {
/*    'USD' : '$' , // US Dollar
    'EUR' : 'â‚¬' , // Euro
    'CRC' : 'â‚¡' , // Costa Rican ColÃ³n
    'GBP' : 'Â£' , // British Pound Sterling
    'ILS' : 'â‚ª' , // Israeli New Sheqel
    'INR' : 'â‚¹' , // Indian Rupee
    'JPY' : 'Â¥' , // Japanese Yen
    'KRW' : 'â‚©' , // South Korean Won
    'NGN' : 'â‚¦' , // Nigerian Naira
//    'PHP' : '₽' , // Philippine Peso
    'PLN' : 'zÅ‚' , // Polish Zloty
    'PYG' : 'â‚²' , // Paraguayan Guarani
    'THB' : 'à¸¿' , // Thai Baht
    'UAH' : 'â‚´' , // Ukrainian Hryvnia
    'VND' : 'â‚«' , // Vietnamese Dong
    'CAD' : '$'*/
};

var HC_CI_LINK = {
    ID: 'customrecord_nsts_ci_to_invoice_link',
    FIELDS: {
        CUSTRECORD_NSTS_LINK_CI_NUMBER: 'custrecord_nsts_link_ci_number',
        CUSTRECORDINVOICE_LINK_INVOICE: 'custrecordinvoice_link_invoice'
    }
}

var USAGE_LIMIT = 1000;
var USAGE_STARTTIME = new Date().getTime();
var USAGE_MAXTIMEINTERVALINMS = 1000000;
