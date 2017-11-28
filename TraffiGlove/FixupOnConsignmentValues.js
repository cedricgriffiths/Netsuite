/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       24 Nov 2017     cedricgriffiths
 *
 */
var purchaseorderSearch = nlapiSearchRecord("purchaseorder",null,
[
   ["type","anyof","PurchOrd"], 
   "AND", 
   ["mainline","is","F"], 
   "AND", 
   ["custcol_bbs_consignment_allocated","greaterthan","0"], 
   "AND", 
   ["quantityshiprecv","greaterthan","0"], 
   "AND", 
   ["formulanumeric: {quantityshiprecv} - {custcol_bbs_consignment_allocated}","equalto","0"]
], 
[
   new nlobjSearchColumn("trandate",null,null), 
   new nlobjSearchColumn("tranid",null,null), 
   new nlobjSearchColumn("entity",null,null), 
   new nlobjSearchColumn("amount",null,null), 
   new nlobjSearchColumn("quantityshiprecv",null,null), 
   new nlobjSearchColumn("custcol_bbs_consignment_allocated",null,null), 
   new nlobjSearchColumn("internalid",null,null).setSort(false), 
   new nlobjSearchColumn("line",null,null)
]
);

var lastId = '';
var poRecord = null;

for (var int = 0; int < purchaseorderSearch.length; int++) 
{
	var id = purchaseorderSearch[int].getId();
	var line = purchaseorderSearch[int].getValue('line');
	
	if(lastId != id)
		{
			if(poRecord)
				{
					nlapiSubmitRecord(poRecord, false, true);
				}
			
			lastId = id;
			poRecord = nlapiLoadRecord('purchaseorder', id);
		}
	
	var lineCount = poRecord.getLineItemCount('item');
	
	for (var int2 = 1; int2 <= lineCount; int2++) 
	{
		lineLine = poRecord.getLineItemValue('item', 'line', int2);
		
		if(lineLine == line)
			{
			poRecord.setLineItemValue('item', 'custcol_bbs_consignment_allocated', int2, 0);
			break;
			}
	}
}

nlapiSubmitRecord(poRecord, false, true);





