/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       11 Feb 2019     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function myCatalogueMassUpdateScheduled(type) 
{
	var customerArray = {};
	var lastCustomer = '';
	
	nlapiLogExecution('DEBUG', 'Starting....', '');
	
	//Search for all items that belong to customers
	//
	var itemSearch = getResults(nlapiCreateSearch("item",
			[
			   ["matrixchild","is","T"], 
			   "AND", 
			   ["isinactive","is","F"], 
			   "AND", 
			   ["custitem_bbs_item_customer","noneof","@NONE@"]
			], 
			[
			   new nlobjSearchColumn("custitem_bbs_item_customer").setSort(false)
			]
			));
	
	//Group all of the items by customer
	//
	if(itemSearch != null && itemSearch.length > 0)
		{
			for (var int = 0; int < itemSearch.length; int++) 
				{
					var itemId = itemSearch[int].getId();
					var itemBelongsTo = itemSearch[int].getValue("custitem_bbs_item_customer");
					
					if(lastCustomer != itemBelongsTo)
						{
							lastCustomer = itemBelongsTo;
							customerArray[itemBelongsTo] = [];
						}
					
					customerArray[itemBelongsTo].push(itemId);
				}
		}
	
	nlapiLogExecution('DEBUG', 'Number of customers with items', Object.keys(customerArray).length);
	
	//For each customer we need to remove any item id's that already exists in the my catalogue
	//
	for ( var customerId in customerArray) 
		{
			//Get the entries in my catalogue for the current customer
			//
			var customrecord_bbs_customer_web_productSearch = getResults(nlapiCreateSearch("customrecord_bbs_customer_web_product",
					[
					   ["custrecord_bbs_web_product_customer","anyof",customerId]
					], 
					[
					   new nlobjSearchColumn("custrecord_bbs_web_product_item").setSort(false)
					]
					));
			
			//Loop through the results
			//
			if(customrecord_bbs_customer_web_productSearch != null && customrecord_bbs_customer_web_productSearch.length > 0)
				{
					for (var int2 = 0; int2 < customrecord_bbs_customer_web_productSearch.length; int2++) 
						{
							var myCatalogueItemId = customrecord_bbs_customer_web_productSearch[int2].getValue("custrecord_bbs_web_product_item");
							
							//See if the product id from my catalogue is in the array of items for the customer
							//
							if(customerArray[customerId].indexOf(myCatalogueItemId) != -1)
								{
									customerArray[customerId] = arrayRemove(customerArray[customerId], myCatalogueItemId);
								}
						}
				}
		}
	
	//Tidy up & remove any customers that have no items to update
	//
	for ( var customerId in customerArray) 
		{
			if(customerArray[customerId].length == 0)
				{
					delete customerArray[customerId];
					
					//nlapiLogExecution('DEBUG', 'Removing customer with id', customerId);
				}
		}
	
	nlapiLogExecution('DEBUG', 'Remaining number of customers with items', Object.keys(customerArray).length);
	
	//For each customer we need to add the remaining items to the my catalogue
	//
	for ( var customerId in customerArray) 
		{
			nlapiLogExecution('DEBUG', 'Adding My Catalogue entries for customer with id', customerId);
		
			for (var int3 = 0; int3 < customerArray[customerId].length; int3++) 
				{
					checkResources();
					
					var itemId = customerArray[customerId][int3];
					
					var myCatalogueRecord = nlapiCreateRecord('customrecord_bbs_customer_web_product');
					myCatalogueRecord.setFieldValue('custrecord_bbs_web_product_customer', customerId);
					myCatalogueRecord.setFieldValue('custrecord_bbs_web_product_item', itemId);
					
					try
						{
							nlapiSubmitRecord(myCatalogueRecord, false, true);
						}
					catch(err)
						{
							nlapiLogExecution('ERROR', 'Error creating my catalogue record for customer ' + customerId + ' for item ' + itemId, err.message);
						}
				}
		}
}

//=====================================================================
//Functions
//=====================================================================
//
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
					checkResources();
					
					start += 1000;
					end += 1000;
						
					var moreSearchResultSet = searchResult.getResults(start, end);
					resultlen = moreSearchResultSet.length;
		
					searchResultSet = searchResultSet.concat(moreSearchResultSet);
				}
		}
	
	return searchResultSet;
}

function checkResources()
{
	var remaining = parseInt(nlapiGetContext().getRemainingUsage());
	
	if(remaining < 100)
		{
			var yieldState = nlapiYieldScript();
			//nlapiLogExecution('DEBUG', 'Yield Status', yieldState.status + ' ' + yieldState.size + ' ' +  yieldState.reason + ' ' + yieldState.information);
		}
}

function arrayRemove(arr, value) 
{
	   return arr.filter(function(ele){
	       return ele != value;
	   });
}