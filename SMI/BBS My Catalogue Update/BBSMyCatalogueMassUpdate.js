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
	
	var itemSearch = getResults(nlapiCraeteSearch("item",
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