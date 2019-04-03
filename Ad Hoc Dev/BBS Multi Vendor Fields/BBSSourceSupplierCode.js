/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       11 Jan 2017     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to continue line item insert, false to abort insert
 */
function clientValidateLine(type){
  
	var itemId = nlapiGetCurrentLineItemValue('item', 'item');
	var supplierId = nlapiGetFieldValue('entity');
	
	if(itemId != null && itemId != '' && supplierId != null && supplierId != '')
		{
		
		//Search the bbs multi vendor table to get the reference
		//
		var cols = new Array();
		cols[0] = new nlobjSearchColumn('custrecord_bbs_multi_item');
		cols[1] = new nlobjSearchColumn('custrecord_bbs_multi_vendor');
		cols[2] = new nlobjSearchColumn('custrecord_bbs_custom_field_1');

		var searchFilters = new Array();
		searchFilters[0] = new nlobjSearchFilter('custrecord_bbs_multi_item', null, 'is', itemId);
		searchFilters[1] = new nlobjSearchFilter('custrecord_bbs_multi_vendor', null, 'is', supplierId);
		
		// Create the search
		//
		var mvfSearch = nlapiCreateSearch('customrecord_bbs_multi_vendor_fields', searchFilters, cols);

		// Run the search
		//
		var mvfSearchResults = mvfSearch.runSearch();

		// Get the result set from the search
		//
		var mvfSearchResultSet = mvfSearchResults.getResults(0, 100);

		// See if there are any results to process
		//
		if (mvfSearchResultSet != null) 
			{
			
			if (mvfSearchResultSet.length == 1)
				{
				
				var suppRef = mvfSearchResultSet[0].getValue(cols[2]);
				
				nlapiSetCurrentLineItemValue('item', 'custcol_bbs_supplier_ref', suppRef, false, true);
					
				}
			}
		}
	
    return true;
}


