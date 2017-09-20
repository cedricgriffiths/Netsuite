/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       20 Sep 2017     cedricgriffiths
 *
 */

/**
 * @param {String} recType Record type internal id
 * @param {Number} recId Record internal id
 * @returns {Void}
 */
function massUpdate(recType, recId) 
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