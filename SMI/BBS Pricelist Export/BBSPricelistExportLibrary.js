/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       23 Aug 2017     cedricgriffiths
 *
 */
function libPricelistExport()
{
	var customerId = nlapiGetRecordId();
	
	// Get the relative url of the suitelet 
	//
	var url = nlapiResolveURL('SUITELET', 'customscript_bbs_pricelist_suitelet', 'customdeploy_bbs_pricelist_suitelet');

	url = url + '&customerid=' + customerId;
	
	// Open a new window
	//
	window.open(url, '_blank', 'Schedule Customer Pricelist Generation', 'height=100, width=100, menubar=no, titlebar=no, toolbar=no, scrollbars=no, resizable=yes');
	
	alert('Pricelist generation has been submitted & will be attached to the customer record. You will receive an email when this is completed.');

}