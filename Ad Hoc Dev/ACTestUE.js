/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       21 Jun 2017     cedricgriffiths
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
function acTestUE(type){
  
	var newRec = nlapiGetNewRecord();
	
	var recId = newRec.getId();
	
	var record = nlapiLoadRecord('salesorder', recId);
	
	var currentdate = new Date(); 
	var datetime = "Last Sync: " + currentdate.getDate() + "/"
	                + (currentdate.getMonth()+1)  + "/" 
	                + currentdate.getFullYear() + " @ "  
	                + currentdate.getHours() + ":"  
	                + currentdate.getMinutes() + ":" 
	                + currentdate.getSeconds();
	
	record.setFieldValue('custbody_bbs_ac_test', datetime);
	
	nlapiSubmitRecord(record, false, true);
	
	
}
