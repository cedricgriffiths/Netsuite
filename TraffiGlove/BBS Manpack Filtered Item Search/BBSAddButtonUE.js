/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       03 Mar 2017     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function userEventBeforeLoad(type, form, request){
 
	//Add the ManPack button to the Items sublist
	//
	if (type == 'create' || type == 'edit')
		{
			var itemSublist = form.getSubList('item');
			
			if(itemSublist)
				{
					itemSublist.addButton('custpage_bbs_button1', 'Filtered Item Search', 'manPackProcessing()');
				}
		}
}

function soLineNoUE(type)
{
	if(type == 'edit' || type == 'create')
		{
			//Get old & new records
			//
			var soNewRecord = nlapiGetNewRecord();
			var newId = soNewRecord.getId();
			var recType = soNewRecord.getRecordType();
			
			var soRecord = nlapiLoadRecord(recType, newId);
			
			var lines = soRecord.getLineItemCount('item');
			
			for (var int = 1; int <= lines; int++) 
			{
				var lineNo = soRecord.getLineItemValue('item', 'line', int);
				soRecord.setLineItemValue('item', 'custcol_sw_line_no', int, lineNo);
			}
			
			nlapiSubmitRecord(soRecord, false, true);
		}
	
}
