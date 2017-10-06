/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       06 Oct 2017     cedricgriffiths
 *
 */
function speficDelete(type)
{
	var filters = [["subsidiary","anyof",4]];
	var columns = [];
		
	var search = nlapiCreateSearch('customer', filters, columns);
	var searchResult = search.runSearch();
	var start = 0;
	var end = 1000;
	var resultlen = 0;
	
	var searchResultSet = searchResult.getResults(start, end);
	resultlen = searchResultSet.length;
	
	while (resultlen == 1000) 
	{
		start += 1000;
		end += 1000;
			
		var moreSearchResultSet = searchResult.getResults(start, end);
		resultlen = moreSearchResultSet.length;
			
		searchResultSet = searchResultSet.concat(moreSearchResultSet);
	}
	
	for (var int2 = 0; int2 < searchResultSet.length; int2++) 
	{
		var recId = searchResultSet[int2].getId();
		
		//Find contacts & delete
		//
		var contactSearch = nlapiSearchRecord("contact",null,
				[["company","anyof",recId]], [new nlobjSearchColumn("entityid",null,null).setSort(false)]);
		
		if(contactSearch)
			{
				for (var int3 = 0; int3 < contactSearch.length; int3++) 
				{
					var contactId = contactSearch[int3].getId();
					nlapiDeleteRecord('contact', contactId);
				}
			}
		
		var remaining = parseInt(nlapiGetContext().getRemainingUsage());
		if(remaining <= 20)
			{
				nlapiYieldScript();
			}
		//Load the customer & remove addresses
		//
		var record = nlapiLoadRecord('customer', recId, {recordmode: 'dynamic'});
		
		var addrLines = record.getLineItemCount('addressbook');
		for (var int = addrLines; int > 0; int--) 
		{
			record.selectLineItem('addressbook', int);
			record.removeCurrentLineItemSubrecord('addressbook', 'addressbookaddress'); 
			record.commitLineItem('addressbook');
		}
		
	
		var x = nlapiSubmitRecord(record);
		
		
	}									

}
