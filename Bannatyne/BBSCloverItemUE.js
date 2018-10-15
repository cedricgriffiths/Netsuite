/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 Oct 2018     cedricgriffiths
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
function cloverItemAfterSubmit(type)
{
	if (type == 'create')
	{
		var itemId = nlapiGetRecordId();
		var newRecord = nlapiGetNewRecord();
		var itemName = newRecord.getFieldValue('itemid');
		var cloverItem = newRecord.getFieldValue('custitem_bbs_clover_item');
		
		if(cloverItem == 'T')
			{
				var params = new Array();
				
				params['itemid'] = itemId;
				params['itemname'] = itemName;
				
				nlapiSetRedirectURL('SUITELET', 'customscript_bbs_clover_item_suitelet', 'customdeploy_bbs_clover_item_suitelet', null, params);
			}
	}
	
	
}
