/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 Dec 2017     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{

	var itemSearch = nlapiCreateSearch("item",
			[
			   ["pricinggroup","noneof","@NONE@"]
			], 
			[
				new nlobjSearchColumn("itemid",null,null), 
				new nlobjSearchColumn("type",null,null)
			]
			);
	
	var searchResult = itemSearch.runSearch();
	
	//Get the initial set of results
	//
	var start = 0;
	var end = 1000;
	var searchResultSet = searchResult.getResults(start, end);
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
	
	for (var int = 0; int < searchResultSet.length; int++) 
		{
			var itemId = searchResultSet[int].getId();
			var itemType = searchResultSet[int].getValue('type');
			
			var itemRecord = nlapiLoadRecord(getItemRecordType(itemType), itemId);
			
			if(itemRecord)
				{
					itemRecord.setFieldValue('pricinggroup', null);
					
					nlapiSubmitRecord(itemRecord, false, true);
				}
		
		}
}


function getItemRecordType(girtItemType)
{
	var girtItemRecordType = '';
	
	switch(girtItemType)
	{
		case 'InvtPart':
		girtItemRecordType = 'inventoryitem';
		break;
		
		case 'NonInvtPart':
		girtItemRecordType = 'noninventoryitem';
		break;
		
		case 'Assembly':
		girtItemRecordType = 'assemblyitem';
		break;
		
		case 'NonInvtPart':
		girtItemRecordType = 'noninventoryitem';
		break;
	}

	return girtItemRecordType;
}

