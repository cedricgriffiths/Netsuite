/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       22 Feb 2017     cedricgriffiths
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
function userEventAfterSubmit(type){
  
	if (type == 'delete')
		{
			var oldRecord = nlapiGetOldRecord();
			var poId = oldRecord.getFieldValue('custrecord_bbs_con_det_po_id');
			var poLine = oldRecord.getFieldValue('custrecord_bbs_con_det_po_line');
			var poAllocated = oldRecord.getFieldValue('custrecord_bbs_con_det_allocated');
			
			if (poId && poLine)
				{
					var poRecord = nlapiLoadRecord('purchaseorder', poId);
					
					if (poRecord)
						{
							//Find the correct line on the po
							//
							var poSublistLineNo = libFindLine(poRecord, 'item', Number(poLine));
						
							//Get the current on consignment value
							//
							var onConsignment = Number(poRecord.getLineItemValue('item', 'custcol_bbs_consignment_allocated', poSublistLineNo));
							
							//Calculate the new value
							//
							var newAlloc = onConsignment - poAllocated;
							
							//Update the po with the new on consignment value
							//
							poRecord.setLineItemValue('item', 'custcol_bbs_consignment_allocated', poSublistLineNo, newAlloc);
							
							//Save the po
							//
							nlapiSubmitRecord(poRecord, false, true);
						}
				}
		}
}
