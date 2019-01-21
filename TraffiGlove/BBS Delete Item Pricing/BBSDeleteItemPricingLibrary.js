/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       23 Aug 2017     cedricgriffiths
 *
 */
function libDeleteItemPricing()
{
	var recordId = nlapiGetRecordId();
	var custName = nlapiGetFieldValue('altname');
	
	// Get the relative url of the suitelet 
	//
	var url = nlapiResolveURL('SUITELET', 'customscript_bbs_delete_item_pricing', 'customdeploy_bbs_delete_item_pricing');

	url = url + '&customerid=' + recordId + '&customername=' + custName;
	
	// Open a new window
	//
	window.open(url, '_self', 'Delete Item Pricing Data', 'menubar=yes, titlebar=yes, toolbar=yes, scrollbars=yes, resizable=yes');

}