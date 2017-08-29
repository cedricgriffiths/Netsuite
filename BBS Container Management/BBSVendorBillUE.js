/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       29 Jun 2017     cedricgriffiths
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
function vendorBillAfterSubmit(type){
  
	if(type == 'edit')
		{
			var newRecord = nlapiGetNewRecord();
			var canx = newRecord.getFieldValue('cancelvendbill');
			
			if(canx == 'T')
				{
					var consignmentId = newRecord.getFieldValue('custbody_bbs_cons_related_consignment');
					var vendBIllId = newRecord.getId();
					
					if(vendBIllId && consignmentId)
						{
							var consRecord = nlapiLoadRecord('customrecord_bbs_consignment', consignmentId);
							
							var lines = consRecord.getLineItemCount('recmachcustrecord_bbs_consignment_header_id');
							
							for (var int = 1; int <= lines; int++) 
							{
								var lineVendorBill = consRecord.getLineItemValue('recmachcustrecord_bbs_consignment_header_id', 'custrecord_bbs_cons_det_vendor_bill', int);
								
								if(lineVendorBill == vendBIllId)
									{
										consRecord.setLineItemValue('recmachcustrecord_bbs_consignment_header_id', 'custrecord_bbs_cons_det_vendor_bill', int, null);
									}
							}
							
							nlapiSubmitRecord(consRecord, false, true);
						}
				}
		}
}
