/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       30 Jan 2019     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function myCatalogueScheduled(type) 
{
	//Read in the parameters
	//
	var context = nlapiGetContext();
	var myCatalogueString = context.getSetting('SCRIPT', 'custscript_bbs_my_cat_string');
	var itemPricingString = context.getSetting('SCRIPT', 'custscript_bbs_item_string');
	var customerId = context.getSetting('SCRIPT', 'custscript_bbs_item_customer_id');
	
	var myCatalogueArray = JSON.parse(myCatalogueString);
	var itemPricingArray = JSON.parse(itemPricingString);
	
	
	//Delete from my catalogue
	//
	for ( var myCatalogueKey in myCatalogueArray) 
		{
			checkResources();
			
			try
				{
					nlapiDeleteRecord('customrecord_bbs_customer_web_product', myCatalogueArray[myCatalogueKey]);
				}
			catch(err)
				{
					nlapiLogExecution('ERROR', 'Error deleting from My Catalogue', err.message);
				}
		}
	
	//Insert into my catalogue
	//
	for ( var itemPricingKey in itemPricingArray) 
		{
			checkResources();
			
			var myCatalogueRecord = nlapiCreateRecord('customrecord_bbs_customer_web_product');
			myCatalogueRecord.setFieldValue('custrecord_bbs_web_product_customer', customerId);
			myCatalogueRecord.setFieldValue('custrecord_bbs_web_product_item', itemPricingKey);
			
			try
				{
					nlapiSubmitRecord(myCatalogueRecord, true, true);
				}
			catch(err)
				{
					nlapiLogExecution('ERROR', 'Error inserting into My Catalogue', err.message);
				}
		}
}

function checkResources()
{
	var remaining = parseInt(nlapiGetContext().getRemainingUsage());
	
	if(remaining < 100)
		{
			var yieldState = nlapiYieldScript();
			//nlapiLogExecution('DEBUG', 'Yield Status', yieldState.status + ' ' + yieldState.size + ' ' +  yieldState.reason + ' ' + yieldState.information);
		}
}
