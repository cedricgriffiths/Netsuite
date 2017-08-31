/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       13 Jul 2017     cedricgriffiths
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
function userEventAfterSubmit(type)
{
	if(type == 'create' || type == 'edit')
		{
			var newId = nlapiGetNewRecord().getId();
			
			var rec = nlapiLoadRecord('itemfulfillment', newId);
			var countryCode = rec.getFieldValue('shipcountry');
			rec.setFieldValue('custbody_bbs_ship_country_code', countryCode);
			
			nlapiSubmitRecord(rec, false, true);
		}
}
