/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       01 Mar 2019     cedricgriffiths
 *
 */
var vendorBillRecord = nlapiCreateRecord('vendorbill',{recordmode: 'dynamic'});

vendorBillRecord.setFieldValue('entity', '142'); 

for (var int = 0; int < 1000; int++) 
	{
		if(int%100 == 0)
			{
				alert('int = ' + int);
				nlapiLogExecution('DEBUG', 'Loop Count = ', int);
			}
		
		vendorBillRecord.selectNewLineItem('item');
		vendorBillRecord.setCurrentLineItemValue('item', 'item', '2068'); 
		vendorBillRecord.setCurrentLineItemValue('item', 'quantity', '1'); 
		
		vendorBillRecord.setCurrentLineItemValue('item', 'rate', '10'); 
		vendorBillRecord.setCurrentLineItemValue('item', 'location', '10'); 
		//vendorBillRecord.setCurrentLineItemValue('item', 'vendorname', poLineVendorName); 
		vendorBillRecord.commitLineItem('item', false);
	}

var vendorBillId = nlapiSubmitRecord(vendorBillRecord, true, false);

