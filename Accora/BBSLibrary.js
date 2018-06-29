/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       21 Aug 2017     cedricgriffiths
 *
 */
function libExportOrderAck()
{
	var url = nlapiResolveURL('SUITELET', 'customscript_bbs_ord_export', 'customdeploy_bbs_ord_export');
	
	var invId = nlapiGetRecordId();

	// Add the invoice id to the url
	//
	url += '&orderid=' + invId;

	// Open the suitelet in the current window
	//
	window.open(url, '_self', 'Export Order Ack', 'toolbar=no, scrollbars=no, resizable=no');
}

function libExportDSSI(recType)
{
	var url = nlapiResolveURL('SUITELET', 'customscript_bbs_inv_export', 'customdeploy_bbs_inv_export');
	
	var invId = nlapiGetRecordId();

	// Add the invoice id to the url
	//
	url += '&invoiceid=' + invId;
	
	url += '&rectype=' + recType;

	// Open the suitelet in the current window
	//
	window.open(url, '_self', 'Export Invoice', 'toolbar=no, scrollbars=no, resizable=no');;
}

function LibPrintLabels()
{
	var url = nlapiResolveURL('SUITELET', 'customscript_bbs_print_sn_label', 'customdeploy_bbs_print_sn_label');
	
	var Id = nlapiGetRecordId();

	// Add the invoice id to the url
	//
	url += '&fulfillmentid=' + Id;

	// Open the suitelet in the current window
	//
	window.open(url, '_blank', 'Print Serial Number Labels', 'toolbar=no, scrollbars=no, resizable=no');
}