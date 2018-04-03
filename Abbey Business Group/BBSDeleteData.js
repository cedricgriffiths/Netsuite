/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       03 Apr 2018     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{
	var a = deleteAll('T');

	var z = '';


	function deleteAll(mode,subsidiaryId,bespokeRecordType)
	{
		var recordTypes = [];
		
		switch(mode)
		{
			case 'B':
				recordTypes = [];
				recordTypes.push(bespokeRecordType);
				
				break;
				
			case 'C':
			case 'A':
				recordTypes = []
		
				break;
				
			case 'c':
			case 'T':
				recordTypes = ["creditmemo",
				               "invoice",
				               "itemfulfillment",
				               "itemreceipt",
				               "message",
				               "vendorcredit",
				               "vendorbill",
				               "purchaseorder",
				               "salesorder"
				               ]
				break;
		}
		
		var filters = [];
		var columns = [];
		var results = {};
		
		if(subsidiaryId != null)
			{
			filters = [["subsidiary","anyof",subsidiaryId]]
			}
			
		for (var int = 0; int < recordTypes.length; int++) 
		{
			var recordType = recordTypes[int];
			var search = null;
			var searchResult = null;
			
			try
			{
				search = nlapiCreateSearch(recordType, filters, columns);
				searchResult = search.runSearch();
			}
			catch(err)
			{
				var error = err;
				search = null;
				searchResult = null;
				alert(err);
			}
			
			if (searchResult)
				{
					//Get the initial set of results
					//
					var start = 0;
					var end = 1000;
					var resultlen = 0;
					var searchResultSet = null;
					
					try
					{
						searchResultSet = searchResult.getResults(start, end);
						resultlen = searchResultSet.length;
					}
					catch(err)
					{
						var error = err;
						resultlen = 0;
						alert(err);
					}
					
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
					
					if(searchResultSet && searchResultSet.length > 0)
						{
							var lastId = '';

							var recordCount = searchResultSet.length;
							results[recordType] = recordCount;
							
							if(mode.toUpperCase() != 'C')
								{
									for (var int2 = 0; int2 < searchResultSet.length; int2++) 
									{
										var recType = searchResultSet[int2].getRecordType();
										var recId = searchResultSet[int2].getId();
										
										if(lastId != recId)
										{
											lastId = recId;
										
											var remaining = parseInt(nlapiGetContext().getRemainingUsage());
											
											if(remaining < 20)
												{
													nlapiYieldScript();
												}
											else
												{
													try
														{
															nlapiDeleteRecord(recType, recId);
														}
													catch(err)
														{
															var error = err.message;
															var dummy = '';
															
														}
												}
										}	
									}
								}
						}
				}
		}

		return results;
	}
}
