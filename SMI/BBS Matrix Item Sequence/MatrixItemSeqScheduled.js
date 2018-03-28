/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       09 Oct 2017     cedricgriffiths
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
			   ["matrixchild","is","T"], 
			   "AND", 
			   ["custitem_bbs_matrix_item_seq","isempty",""]
			], 
			[
			   new nlobjSearchColumn("itemid",null,null)
			]
			);
	
	var itemSearchResult = itemSearch.runSearch();
	
	if (itemSearchResult)
		{
			//Get the initial set of results
			//
			var start = 0;
			var end = 1000;
			var resultlen = 0;
			var itemSearchResultSet = null;
			
			try
			{
				itemSearchResultSet = itemSearchResult.getResults(start, end);
				resultlen = itemSearchResultSet.length;
			}
			catch(err)
			{
				var error = err;
				resultlen = 0;
			}
			
			//If there is more than 1000 results, page through them
			//
			while (resultlen == 1000) 
				{
						start += 1000;
						end += 1000;
	
						var moreSearchResultSet = itemSearchResult.getResults(start, end);
						resultlen = moreSearchResultSet.length;
	
						itemSearchResultSet = itemSearchResultSet.concat(moreSearchResultSet);
				}
			
			if(itemSearchResultSet && itemSearchResultSet.length > 0)
				{
					for (var int2 = 0; int2 < itemSearchResultSet.length; int2++) 
						{
							var recType = itemSearchResultSet[int2].getRecordType();
							var recId = itemSearchResultSet[int2].getId();
							
							var remaining = parseInt(nlapiGetContext().getRemainingUsage());
							
							if(remaining < 50)
								{
									nlapiYieldScript();
								}
							else
								{
									resequence(recType, recId);
								}
						}
				}
		}
}

function resequence(recType, recId) 
{
	//Local Variables
	//
	var parentSequence = '000000';
	var colourSequence = '000000';
	var size1Sequence = '000000';
	var size2Sequence = '000000';
	var fullSequence = '';
	
	//Get the item record
	//
	var itemRecord = nlapiLoadRecord(recType, recId);
	
	//Get the matrix options
	//
	var itemColour = itemRecord.getFieldValue('custitem_bbs_item_colour');
	var itemSize1 = itemRecord.getFieldValue('custitem_bbs_item_size1');
	var itemSize2 = itemRecord.getFieldValue('custitem_bbs_item_size2');
	var itemParent = itemRecord.getFieldValue('parent');
	
	//Set the parent sequence number
	//
	parentSequence = padding_left(itemParent,'0', 6);
	
	//Set the colour sequence number
	//
	if(itemColour != null && itemColour != '')
		{
			var filterArray = [["custrecord_bbs_colour_colour","anyof",itemColour]];
			
			var searchResultSet = nlapiSearchRecord("customrecord_bbs_item_colour_seq", null, filterArray, 
					[
					   new nlobjSearchColumn("custrecord_bbs_colour_sequence",null,null)
					]
					);
			
			if(searchResultSet)
				{
					var sequence = searchResultSet[0].getValue('custrecord_bbs_colour_sequence');
					
					if(sequence)
						{
						colourSequence = padding_left(sequence,'0', 6);
						}
				}
		}
	
	//Set the size 1 sequence number
	//
	if(itemSize1 != null && itemSize1 != '')
		{
			var filterArray = [["custrecord_bbs_item_size1_size","anyof",itemSize1]];
			
			var searchResultSet = nlapiSearchRecord("customrecord_bbs_item_size1_seq", null, filterArray, 
					[
					   new nlobjSearchColumn("custrecord_bbs_item_size1_seq",null,null)
					]
					);
			
			if(searchResultSet)
				{
					var sequence = searchResultSet[0].getValue('custrecord_bbs_item_size1_seq');
					
					if(sequence)
						{
						size1Sequence = padding_left(sequence,'0', 6);
						}
				}
		}
	
	//Set the size 2 sequence number
	//
	if(itemSize2 != null && itemSize2 != '')
		{
			var filterArray = [["custrecord_bbs_item_size2_size","anyof",itemSize2]];
			
			var searchResultSet = nlapiSearchRecord("customrecord_bbs_item_size2_seq", null, filterArray, 
					[
					   new nlobjSearchColumn("custrecord_bbs_item_size2_seq",null,null)
					]
					);
			
			if(searchResultSet)
				{
					var sequence = searchResultSet[0].getValue('custrecord_bbs_item_size2_seq');
					
					if(sequence)
						{
						size2Sequence = padding_left(sequence,'0', 6);
						}
				}
		}
	
	
	//Set the full sequence number
	//
	fullSequence = parentSequence + colourSequence + size1Sequence + size2Sequence;

	//Update the item record with the full sequence number
	//
	itemRecord.setFieldValue('custitem_bbs_matrix_item_seq', fullSequence);
	
	//Submit the item record for update
	//
	nlapiSubmitRecord(itemRecord, false, true);
	
	nlapiLogExecution('DEBUG', 'Item Updated', itemRecord.getId());
}


//left padding s with c to a total of n chars
//
function padding_left(s, c, n) 
{
	if (! s || ! c || s.length >= n) 
	{
		return s;
	}
	
	var max = (n - s.length)/c.length;
	
	for (var i = 0; i < max; i++) 
	{
		s = c + s;
	}
	
	return s;
}