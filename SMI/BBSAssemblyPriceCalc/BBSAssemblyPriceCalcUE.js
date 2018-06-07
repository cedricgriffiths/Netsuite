/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       07 Jun 2018     cedricgriffiths
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
function assyPriceCalcAS(type)
{
	if(type == 'create')
		{
		  	var newRecord = nlapiGetNewRecord();
		  	var newRecordId = newRecord.getId();
		  	var itemType = newRecord.getFieldValue('itemtype');
		  	var matrixType = newRecord.getFieldValue('matrixtype');
		  	
		  	if(itemType == 'Assembly' && (matrixType == null || matrixType == ''))
		  		{
		  			calculatePricing(newRecordId);
		  		}
		}
}
