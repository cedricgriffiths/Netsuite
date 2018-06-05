/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       18 Oct 2017     cedricgriffiths
 *
 */



/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Void}
 */
function clientRecalc(type)
{
	var assemblyId = nlapiGetFieldValue('assemblyitem');
	var itemLines = nlapiGetLineItemCount('item');
	var lastLevelOneItem = '';
	
	for (var int = 1; int <= itemLines; int++) 
		{
			var woItem = nlapiGetLineItemValue('item', 'item', int);
			var woLevel = Number(nlapiGetLineItemValue('item', 'assemblylevel', int));
			
			if(woLevel == 1)
				{
					lastLevelOneItem = woItem;
				}
			
			if(woItem)
				{
					//See if there is a special instruction record for the bom/component
					//
					var cols = new Array();
					cols[0] = new nlobjSearchColumn('custrecord_bbs_custom_field_1');
	
					var searchFilters = new Array();
					searchFilters[0] = new nlobjSearchFilter('custrecord_bbs_bom_member', null, 'is', woItem);
					
					if(woLevel == 1)
						{
							searchFilters[1] = new nlobjSearchFilter('custrecord_bbs_bom_item', null, 'is', assemblyId);
						}
					
					if(woLevel == 2)
						{
							searchFilters[1] = new nlobjSearchFilter('custrecord_bbs_bom_item', null, 'is', lastLevelOneItem);
						}
				
				
					// Create the search
					//
					var mvfSearch = nlapiCreateSearch('customrecord_bbs_bom_fields', searchFilters, cols);
	
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
									var specInst = mvfSearchResultSet[0].getValue(cols[0]);
									nlapiSetLineItemValue('item', 'custcol_bbs_bom_spec_inst', int, specInst);
								}
						}
				}
		}
}