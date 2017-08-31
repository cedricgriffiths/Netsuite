/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       13 Jul 2017     cedricgriffiths
 *
 */

/**
 * @param {String} recType Record type internal id
 * @param {Number} recId Record internal id
 * @returns {Void}
 */
function massUpdate(recType, recId) 
{
	var rec = nlapiLoadRecord(recType, recId);
	var countryCode = rec.getFieldValue('shipcountry');
	rec.setFieldValue('custbody_bbs_ship_country_code', countryCode);
	
	nlapiSubmitRecord(rec, false, true);
}
