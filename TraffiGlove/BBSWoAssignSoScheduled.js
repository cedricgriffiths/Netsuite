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
	
	//Load up the sales order record
	//
	var salesOrderRecord = nlapiLoadRecord('salesorder', salesOrderId); //10GU's
	var itemLineCount = salesOrderRecord.getLineItemCount('item');
	
	//Get the customer and the subsidiary
	//
	var salesOrderEntity = salesOrderRecord.getFieldValue('entity');
	var salesOrderSubsidiary = salesOrderRecord.getFieldValue('subsidiary');
	
	//Loop round the item lines
	//
	for (var int = 1; int <= itemLineCount; int++) 
	{
		var itemType = salesOrderRecord.getLineItemValue('item', 'itemtype', int);
		var itemId = salesOrderRecord.getLineItemValue('item', 'item', int);
		var itemBackorder = Number(salesOrderRecord.getLineItemValue('item', 'quantitybackordered', int));
		var itemWorksOrder = salesOrderRecord.getLineItemValue('item', 'woid', int);
	
		//See if we have any assemblies that are on backorder that do not have a works order assigned to them
		//
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
				
				//Save the works order
				//
				var worksOrderId = nlapiSubmitRecord(worksOrderRecord, true, true); //20GU's
				
				//Update the order line with the works order id
				//
				salesOrderRecord.setLineItemValue('item', 'woid', int, worksOrderId);
			}
	}
	
	//Save the sales order
	//
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
