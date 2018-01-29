
function scheduled(type) 
{
	var context = nlapiGetContext();
	
	var transactionSearch = nlapiSearchRecord("transaction",null,
			[
			   ["type","anyof","VendBill","VendCred","CashSale","CustCred","CustInvc","ItemShip","ItemRcpt","PurchOrd","RtnAuth","SalesOrd"], 
			   "AND", 
			   ["mainline","is","T"], 
			   "AND", 
			   ["trandate","within","1/1/2015","31/7/2017"]
			], 
			[
			   new nlobjSearchColumn("internalid",null,null), 
			   new nlobjSearchColumn("type",null,null), 
			   new nlobjSearchColumn("tranid",null,null), 
			   new nlobjSearchColumn("entity",null,null), 
			   new nlobjSearchColumn("department",null,null), 
			   new nlobjSearchColumn("class",null,null), 
			   new nlobjSearchColumn("custbody_cseg_bbs_segment",null,null), 
			   new nlobjSearchColumn("custbody_cseg_bbs_region",null,null), 
			   new nlobjSearchColumn("custentity_cseg_bbs_region","customer",null), 
			   new nlobjSearchColumn("custentity_cseg_bbs_segment","customer",null), 
			   new nlobjSearchColumn("custentity_cseg_bbs_segment","vendor",null), 
			   new nlobjSearchColumn("custentity_cseg_bbs_region","vendor",null)
			]
			);
	
	for (var int = 0; int < transactionSearch.length; int++) 
		{
			var recordId = transactionSearch[int].getId();
			var recordType = transactionSearch[int].getValue('type');
			var recordRegion = '';
			var recordSegment = '';
			var recordRealType = '';
			var recordDepartment = '';
			
			switch(recordType)
				{
					case "VendBill":
						recordRegion = transactionSearch[int].getValue("custentity_cseg_bbs_region","vendor");
						recordSegment = transactionSearch[int].getValue("custentity_cseg_bbs_segment","vendor");
						recordRealType = 'vendorbill';
						recordDepartment = 5;
						break;
						
					case "VendCred":
						recordRegion = transactionSearch[int].getValue("custentity_cseg_bbs_region","vendor");
						recordSegment = transactionSearch[int].getValue("custentity_cseg_bbs_segment","vendor");
						recordRealType = 'vendorcredit';
						recordDepartment = 5;
						break;
						
					case "PurchOrd":
						recordRegion = transactionSearch[int].getValue("custentity_cseg_bbs_region","vendor");
						recordSegment = transactionSearch[int].getValue("custentity_cseg_bbs_segment","vendor");
						recordRealType = 'purchaseorder';
						recordDepartment = 5;
						break;
								
					case "CashSale":
						recordRegion = transactionSearch[int].getValue("custentity_cseg_bbs_region","customer");
						recordSegment = transactionSearch[int].getValue("custentity_cseg_bbs_segment","customer");
						recordRealType = 'cashsale';
						recordDepartment = 2;
						break;
						
					case "CustCred":
						recordRegion = transactionSearch[int].getValue("custentity_cseg_bbs_region","customer");
						recordSegment = transactionSearch[int].getValue("custentity_cseg_bbs_segment","customer");
						recordRealType = 'creditmemo';
						recordDepartment = 2;
						break;
						
					case "CustInvc":
						recordRegion = transactionSearch[int].getValue("custentity_cseg_bbs_region","customer");
						recordSegment = transactionSearch[int].getValue("custentity_cseg_bbs_segment","customer");
						recordRealType = 'invoice';
						recordDepartment = 2;
						break;
						
					case "ItemShip":
						recordRegion = transactionSearch[int].getValue("custentity_cseg_bbs_region","customer");
						recordSegment = transactionSearch[int].getValue("custentity_cseg_bbs_segment","customer");
						recordRealType = 'itemfulfillment';
						recordDepartment = 2;
						break;
					
					case "ItemRcpt":
						recordRegion = transactionSearch[int].getValue("custentity_cseg_bbs_region","customer");
						recordSegment = transactionSearch[int].getValue("custentity_cseg_bbs_segment","customer");
						recordRealType = 'itemreceipt';
						recordDepartment = 2;
						break;
						
					case "RtnAuth":
						recordRegion = transactionSearch[int].getValue("custentity_cseg_bbs_region","customer");
						recordSegment = transactionSearch[int].getValue("custentity_cseg_bbs_segment","customer");
						recordRealType = 'returnauthorization';
						recordDepartment = 2;
						break;
						
					case "SalesOrd":
						recordRegion = transactionSearch[int].getValue("custentity_cseg_bbs_region","customer");
						recordSegment = transactionSearch[int].getValue("custentity_cseg_bbs_segment","customer");
						recordRealType = 'salesorder';
						recordDepartment = 2;
						break;
				}
			
			//Check limits
			//
			var remaining = context.getRemainingUsage();
			
			if(remaining < 100 )
				{
					nlapiYieldScript();
				}
			else
				{
					//Load the record
					//
					var theRecord = null;
					
					try
					{
						theRecord = nlapiLoadRecord(recordRealType, recordId);
					}
					catch(err)
					{
						theRecord = null;
					}
					
					if(theRecord)
						{
							try
								{
								//Set the header values
								//
								theRecord.setFieldValue('department', recordDepartment);
								theRecord.setFieldValue('class', recordSegment);
								theRecord.setFieldValue('custbody_cseg_bbs_segment', recordSegment);
								theRecord.setFieldValue('custbody_cseg_bbs_region', recordRegion);
								
								//Process the items on the record
								//
								var items = theRecord.getLineItemCount('item');
								
								for (var int2 = 1; int2 <= items; int2++) 
									{
										var itemId = theRecord.getLineItemValue('item', 'item', int2);
										var itemType = theRecord.getLineItemValue('item', 'itemtype', int2);
										var realItemType = getItemRecordType(itemType);
										
										var itemSegment = nlapiLookupField(realItemType, itemId, 'custitem_cseg_bbs_segment', false);
										var itemProdType = nlapiLookupField(realItemType, itemId, 'custitem_cseg_bbs_product_ty', false);
										
										theRecord.setLineItemValue('item', 'department', int2, recordDepartment);
										theRecord.setLineItemValue('item', 'class', int2, recordSegment);
										theRecord.setLineItemValue('item', 'custcol_cseg_bbs_segment', int2, itemSegment);
										theRecord.setLineItemValue('item', 'custcol_cseg_bbs_product_ty', int2, itemProdType);
										
									}
								
								//Submit the record
								//
								nlapiSubmitRecord(theRecord, false, true);
								}
							catch(err)
								{
									nlapiLogExecution('DEBUG', 'Error Occured', recordRealType + ':' + recordId + ' - ' + err.message);
								}
						}
				}
		}
}

function getItemRecordType(girtItemType)
{
	var girtItemRecordType = '';
	
	switch(girtItemType)
	{
		case 'InvtPart':
			girtItemRecordType = 'inventoryitem';
			break;
		
		case 'NonInvtPart':
			girtItemRecordType = 'noninventoryitem';
			break;
		
		case 'Assembly':
			girtItemRecordType = 'assemblyitem';
			break;
			
		case 'Service':
			girtItemRecordType = 'serviceitem';
			break;
			
		case 'Kit':
			girtItemRecordType = 'kititem';
			break;
	}

	return girtItemRecordType;
}
