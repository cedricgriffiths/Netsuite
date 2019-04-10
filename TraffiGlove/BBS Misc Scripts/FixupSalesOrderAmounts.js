/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 Mar 2018     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{
	
	var salesorderSearch = nlapiSearchRecord("salesorder",null,
			[
			   ["formulanumeric: ({quantity}*{rate})-{amount}","notequalto","0"], 
			   "AND", 
			   ["type","anyof","SalesOrd"], 
			   "AND", 
			   ["subsidiary","anyof","6"], 
			   "AND", 
			   ["taxline","is","F"], 
			   "AND", 
			   ["mainline","is","F"], 
			   "AND", 
			   ["status","noneof","SalesOrd:G"]
			], 
			[
			   new nlobjSearchColumn("internalid",null,"GROUP")
			]
			);
	
	for (var int = 0; int < salesorderSearch.length; int++) 
		{
			var orderId = salesorderSearch[int].getValue("internalid",null,"GROUP");
			var salesRecord = nlapiLoadRecord('salesorder', orderId);
			
			var orderLines = salesRecord.getLineItemCount('item');
			
			for (var int2 = 1; int2 <= orderLines; int2++) 
				{
					var quantity = Number(salesRecord.getLineItemValue('item', 'quantity', int2));
					var rate = Number(salesRecord.getLineItemValue('item', 'rate', int2));
					var amount = Number(salesRecord.getLineItemValue('item', 'amount', int2));
					var newAmount = quantity * rate;
					
					if(newAmount != amount)
						{
							salesRecord.setLineItemValue('item', 'amount', int2, newAmount);
						}
				}
			
			nlapiSubmitRecord(salesRecord, false, true);
		}
}
