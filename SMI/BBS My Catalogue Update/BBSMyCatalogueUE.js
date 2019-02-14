/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       29 Jan 2019     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function myCatalogueAfterSubmit(type)
{
	var executionContext = nlapiGetContext().getExecutionContext();
	
	if((type == 'create' || type == 'edit') && (executionContext == 'userinterface' || executionContext == 'scheduled'))
		{
			var newRecord = nlapiGetNewRecord();
			var customerId = nlapiGetRecordId();
			var itemPricingArray = {};
			var myCatalogueArray = {};
			
			//Get an array of all the items inthe customers item pricing sublist
			//
			var items = newRecord.getLineItemCount('itempricing');
			
			for (var int = 1; int <= items; int++) 
				{
					var itemId = newRecord.getLineItemValue('itempricing', 'item', int);
					var itemName = newRecord.getLineItemText('itempricing', 'item', int);
				
					itemPricingArray[itemId] = itemName;
				}
		
			//Get an array of all the items that are in the my catalogue for the customer, but excluding assembley items
			//
			var customrecord_bbs_customer_web_productSearch = getResults(nlapiCreateSearch("customrecord_bbs_customer_web_product",
					[
					   ["custrecord_bbs_web_product_customer","anyof",customerId], 
					   "AND", 
					   ["custrecord_bbs_web_product_item.type","noneof","Assembly"]
					], 
					[
					   new nlobjSearchColumn("id").setSort(false), 
					   new nlobjSearchColumn("custrecord_bbs_web_product_item")
					]
					));
			
			if(customrecord_bbs_customer_web_productSearch != null && customrecord_bbs_customer_web_productSearch.length > 0)
				{
					for (var int2 = 0; int2 < customrecord_bbs_customer_web_productSearch.length; int2++) 
						{
							var myCatalogueItemId = customrecord_bbs_customer_web_productSearch[int2].getValue("custrecord_bbs_web_product_item");
							var myCatalogueId = customrecord_bbs_customer_web_productSearch[int2].getId();
							
							myCatalogueArray[myCatalogueItemId] = myCatalogueId;
						}
				}
			
			//Work out what is missing and where
			//
			
			//Remove any items from the customer items array that already exist in the my catalogue
			//Also then remove the same item from the my catalogue array
			//So what is left in the item pricing array will be records to add to the my catalogue
			//And anything left in the my catalogue array will need deleting from my catalogue as they 
			//do not exist in the item array
			//
			for ( var myCatalogueKey in myCatalogueArray) 
				{
					if(itemPricingArray.hasOwnProperty(myCatalogueKey))
						{
							delete itemPricingArray[myCatalogueKey];
							delete myCatalogueArray[myCatalogueKey];
						}
				}
			
			//If there is any work to do i.e we have items to add or delete from the my catalogue, the submit a script to do the work
			//
			if(Object.keys(myCatalogueArray).length > 0 || Object.keys(itemPricingArray).length > 0)
				{
					var myCatalogueString = JSON.stringify(myCatalogueArray);
					var itemPricingString = JSON.stringify(itemPricingArray);
					
					var scheduleParams = {
							custscript_bbs_my_cat_string: myCatalogueString, 
							custscript_bbs_item_string: itemPricingString,
							custscript_bbs_item_customer_id: customerId
							};
				
					nlapiScheduleScript('customscript_bbs_my_catalogue_sch', null, scheduleParams);
				}
			
			
		}
}

function getResults(search)
{
	var searchResult = search.runSearch();
	
	//Get the initial set of results
	//
	var start = 0;
	var end = 1000;
	var searchResultSet = searchResult.getResults(start, end);
	
	if(searchResultSet != null)
		{
			var resultlen = searchResultSet.length;
		
			//If there is more than 1000 results, page through them
			//
			while (resultlen == 1000) 
				{
						start += 1000;
						end += 1000;
						
						var moreSearchResultSet = searchResult.getResults(start, end);
						resultlen = moreSearchResultSet.length;
		
						searchResultSet = searchResultSet.concat(moreSearchResultSet);
				}
		}
	return searchResultSet;
}