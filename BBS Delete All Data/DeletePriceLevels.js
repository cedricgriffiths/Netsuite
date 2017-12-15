
function scheduled(type) 
{

	var filterArray = [
		               ["isinactive","is","F"]
		               ];
		
	var itemSearch = nlapiCreateSearch("item", filterArray, 
		[
		new nlobjSearchColumn("itemid",null,null), 
		new nlobjSearchColumn("displayname",null,null), 
		new nlobjSearchColumn("salesdescription",null,null),
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
			//Get the item id & type
			//
			var pirItemId = searchResultSet[int].getId();
			var pirItemType = searchResultSet[int].getValue('type');
			
			var remaining = parseInt(nlapiGetContext().getRemainingUsage());
			
			if(remaining < 50)
				{
					nlapiYieldScript();
				}
			else
				{
					try
						{
							var itemRecord = nlapiLoadRecord(getItemRecordType(pirItemType), pirItemId);
							
							var priceLists = ['price1','price2','price4'];
							
							for (var int4 = 0; int4 < priceLists.length; int4++) 
								{
									var priceSublist = priceLists[int4];  //'price1';
					
									var priceLineCount = itemRecord.getLineItemCount(priceSublist);
									var quantityLevels = itemRecord.getMatrixCount(priceSublist, 'price');
									
									for (var int2 = 1; int2 <= priceLineCount; int2++) 
										{
											itemRecord.selectLineItem(priceSublist, int2);
										
											for ( j=1; j<=quantityLevels; j++)
												{
													//var matrixPrice = itemRecord.getLineItemMatrixValue(priceSublist, 'price', int2, j);
													itemRecord.setCurrentLineItemMatrixValue(priceSublist, 'price', j, null);
													
												}
											
											itemRecord.commitLineItem(priceSublist, false);
										}
								}
							
							nlapiSubmitRecord(itemRecord, false, true);
						}
					catch(err)
						{
							nlapiLogExecution('ERROR', 'Reset Pricing Levels', pirItemId.toString() + ' : ' + err.message);
						}
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
