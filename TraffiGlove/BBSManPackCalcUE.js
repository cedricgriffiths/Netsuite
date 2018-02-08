/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       08 Feb 2018     cedricgriffiths
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
function calcManPackMsgAS(type)
{
  if(type == 'create' || type == 'edit')
	  {
	  	var newRecord = nlapiGetNewRecord();
	  	var newRecordId = newRecord.getId();
	  	
	  	var salesOrderRecord = nlapiLoadRecord('salesorder', newRecordId);
	  	
	  	if(salesOrderRecord)
	  		{
	  			var manpackItemCount = Number(0);
	  			var manpackPeople = {};
	  			
	  			var items = salesOrderRecord.getLineItemCount('item');
	  			var currentManpackInfo = salesOrderRecord.getFieldValue('custbody_bbs_manpack_info');
	  			
	  			for (var int = 1; int <= items; int++) 
		  			{
						var manpackPerson = salesOrderRecord.getLineItemValue('item', 'custcol_bbs_sales_line_contact', int);
						var manpackItemQty = Number(salesOrderRecord.getLineItemValue('item', 'quantitycommitted', int));
						
						if(manpackItemQty > 0 && manpackPerson != null && manpackPerson != '')
							{
								manpackItemCount += manpackItemQty;
								manpackPeople[manpackPerson] = manpackPerson;
							}
					}
	  			
	  			var manpackInfo = 'MANPACK ' + (Object.keys(manpackPeople).length).toString() + ' (' + manpackItemCount.toString() + ')';
	  			
	  			if(manpackInfo != currentManpackInfo)
	  				{
	  					salesOrderRecord.setFieldValue('custbody_bbs_manpack_info', manpackInfo);
	  			
	  					nlapiSubmitRecord(salesOrderRecord, false, true);
	  				}
	  		}
	  }
}
