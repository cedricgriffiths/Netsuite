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
function cloverCategoryAndModifierAfterSubmit(type)
{
	var context = nlapiGetContext();
	var executionContext = context.getExecutionContext();
	
	if (type == 'create')
		{
			var recordId = nlapiGetRecordId();
			var newRecord = nlapiGetNewRecord();
			var recordName = newRecord.getFieldValue('name');
			var recordType = newRecord.getRecordType();
			
	
			var params = new Array();
					
			params['itemid'] = recordId;
			params['itemname'] = recordName;
			params['recordtype'] = recordType;
					
			nlapiSetRedirectURL('SUITELET', 'customscript_bbs_clover_item_suitelet', 'customdeploy_bbs_clover_item_suitelet', null, params);
	
		}
}
