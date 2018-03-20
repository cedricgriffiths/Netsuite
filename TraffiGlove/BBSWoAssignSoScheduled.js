/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       20 Mar 2018     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{
	//Get the parameters
	//
	var context = nlapiGetContext();
	var salesOrderId = context.getSetting('SCRIPT', 'custscript_bbs_so_id');
	
	var salesOrderRecord = nlapiLoadRecord('salesorder', salesOrderId); //10GU's
	var itemLineCount = salesOrderRecord.getLineItemCount('item');
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
				checkResources();
				
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

//=============================================================================================
//=============================================================================================
//Functions
//=============================================================================================
//=============================================================================================
//
function checkResources()
{
	var remaining = parseInt(nlapiGetContext().getRemainingUsage());
	
	if(remaining < 100)
		{
			nlapiYieldScript();
		}
}
