/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       17 Apr 2018     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function clientPageInit(type)
{
   
}


function receiptDateProcessing()
{
	var lines = nlapiGetLineItemCount('item');
	
	var deliveryDate = nlapiGetFieldValue('duedate');
	
	if(deliveryDate != null && deliveryDate != '')
		{
			for (var line = 1; line <= lines; line++) 
				{
					nlapiSelectLineItem('item', line);
					
					var orderedQty = Number(nlapiGetCurrentLineItemValue('item', 'quantity'));
					var receivedQty = Number(nlapiGetCurrentLineItemValue('item', 'quantityreceived'));
					
					if(receivedQty < orderedQty)
						{
							nlapiSetCurrentLineItemValue('item', 'expectedreceiptdate', deliveryDate, true, true);
							nlapiCommitLineItem('item');
						}
				}
		}
}