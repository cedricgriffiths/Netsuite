/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       16 Jul 2018     cedricgriffiths
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
function lineNumbersAfterSubmit(type)
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
					soRecord.setLineItemValue('item', 'custcol_bbs_line_no', int, lineNo);
				}
			
			nlapiSubmitRecord(soRecord, false, true);
		}
}
