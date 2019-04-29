/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       29 Apr 2019     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to save line item, false to abort save
 */
function returnAuthValidateLine(type)
{
	var serialNumbers = null;
	
	//Only look at items sublist
	//
	if(type == 'item')
		{
			//Get the current line item
			//
			var currentLineItemId = nlapiGetCurrentLineItemValue('item', 'item');
			var currentLineItemType = nlapiGetCurrentLineItemValue('item', 'itemtype');
		
			//Is the line item serialised?
			//
			var isSerialised = nlapiLookupField(getItemRecType(currentLineItemType), currentLineItemId, 'isserialitem', false);
		
			//Get the created from
			//
			var createdFromId = nlapiGetFieldValue('createdfrom');
			var createdFromText = nlapiGetFieldText('createdfrom');
		
			//If we have a created from & the item is serialised, then we can continue
			//
			if(createdFromId != null && createdFromId != '' && isSerialised == 'T')
				{
					//See if we were created from an invoice or a sales order
					//
				
					
					//If an invoice then just get all the serial numbers from that invoice
					//
					serialNumbers = getInvoiceSerialNumbers(createdFromId);
				
					//If a sales order then find all the serial numbers by looking at item fulfilments for that sales order
					//
					serialNumbers = getSalesOrderSerialNumbers(createdFromId);
					
				}
		
		}
	
    return true;
}

function getInvoiceSerialNumbers(_invoiceId)
{
	var returnedSerialNumbers = [];
	
	var transactionSearch = nlapiSearchRecord("transaction",null,
			[
			   ["type","anyof","CustInvc"], 
			   "AND", 
			   ["itemnumber.inventorynumber","isnotempty",""], 
			   "AND", 
			   ["mainline","is","F"], 
			   "AND", 
			   ["taxline","is","F"], 
			   "AND", 
			   ["shipping","is","F"], 
			   "AND", 
			   ["cogs","is","F"],
			   "AND",
			   ["internalid","anyof",_invoiceId]
			], 
			[
			   new nlobjSearchColumn("tranid"), 
			   new nlobjSearchColumn("entity"), 
			   new nlobjSearchColumn("item"), 
			   new nlobjSearchColumn("inventorynumber","itemNumber",null), 
			   new nlobjSearchColumn("type")
			]
			);

	if(transactionSearch != null && transactionSearch.length > 0)
		{
			for (var int = 0; int < transactionSearch.length; int++) 
				{
					var serialNumber = transactionSearch[int].getValue("inventorynumber","itemNumber");
					returnedSerialNumbers.push(serialNumber);
				}
		}
	
	return returnedSerialNumbers;

}

function getItemRecType(ItemType)
{
	var itemType = '';
	
	switch(ItemType)
	{
		case 'InvtPart':
			itemType = 'inventoryitem';
			break;
			
		case 'Assembly':
			itemType = 'assemblyitem';
			break;
			
		case 'NonInvtPart':
			itemType = 'noninventoryitem';
			break;
			
		case 'OthCharge':
			itemType = 'otherchargeitem';
			break;
	}

	return itemType;
}
