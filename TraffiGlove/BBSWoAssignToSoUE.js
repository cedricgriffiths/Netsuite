/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       20 Mar 2018     cedricgriffiths
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
function assignWoToSoARS(type)
{
	var salesOrderRecord = nlapiGetNewRecord();
	
	var itemLineCount = salesOrderRecord.getLineItemCount('item');
	
	var woNeeded = false;
	var woCount = Number(0);
	
	for (var int = 1; int <= itemLineCount; int++) 
		{
			var itemType = salesOrderRecord.getLineItemValue('item', 'itemtype', int);
			var itemBackorder = Number(salesOrderRecord.getLineItemValue('item', 'quantitybackordered', int));
			var itemWorksOrder = salesOrderRecord.getLineItemValue('item', 'woid', int);
		
			if(itemType == 'Assembly' && itemBackorder > 0 && (itemWorksOrder == null || itemWorksOrder == ''))
				{
					woNeeded = true;
					woCount++;
				}
		}
	
	if(woNeeded)
		{
			if(woCount <= 30)
				{
					var salesOrderId = salesOrderRecord.getId();
					salesOrderRecord = nlapiLoadRecord('salesorder', salesOrderId); //10GU's
					itemLineCount = salesOrderRecord.getLineItemCount('item');
					var salesOrderEntity = salesOrderRecord.getFieldValue('entity');
					var salesOrderSubsidiary = salesOrderRecord.getFieldValue('subsidiary');
					
					for (var int = 1; int <= itemLineCount; int++) 
					{
						var itemType = salesOrderRecord.getLineItemValue('item', 'itemtype', int);
						var itemId = salesOrderRecord.getLineItemValue('item', 'item', int);
						var itemBackorder = Number(salesOrderRecord.getLineItemValue('item', 'quantitybackordered', int));
						var itemWorksOrder = salesOrderRecord.getLineItemValue('item', 'woid', int);
					
						if(itemType == 'Assembly' && itemBackorder > 0 && (itemWorksOrder == null || itemWorksOrder == ''))
							{
								//Create a works order 
								//
								var worksOrderRecord = nlapiCreateRecord('workorder', {recordmode: 'dynamic'}); //10GU's
								worksOrderRecord.setFieldValue('subsidiary', salesOrderSubsidiary);
								worksOrderRecord.setFieldValue('entity', salesOrderEntity);
								worksOrderRecord.setFieldValue('assemblyitem', itemId);
								worksOrderRecord.setFieldValue('quantity', itemBackorder);
								
								var worksOrderId = nlapiSubmitRecord(worksOrderRecord, true, true); //20GU's
								
								salesOrderRecord.setLineItemValue('item', 'woid', int, worksOrderId);
							}
					}
					
					nlapiSubmitRecord(salesOrderRecord, false, true); //20GU's
				}
			else
				{
					var scheduleParams = {custscript_bbs_so_id: salesOrderId};
					nlapiScheduleScript('customscript_bbs_assign_wo_so_sched', null, scheduleParams);

				}
		}
}
