/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       26 Sep 2017     cedricgriffiths
 * 1.01       21 Sep 2018     suceen		   Before submit(Set duedate)
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
function poDateChangeUE(type)
{
	if(type == 'edit')
		{
			//Get old & new records
			//
			var poOldRecord = nlapiGetOldRecord();
			var poNewRecord = nlapiGetNewRecord();
			
			//Get old & new due dates
			//
			var oldDueDate = poOldRecord.getFieldValue('duedate');
			var newDueDate = poNewRecord.getFieldValue('duedate');
			
			var poNumber = poNewRecord.getFieldValue('tranid');
			
			//Has the due date changed
			//
			if(oldDueDate != newDueDate)
				{
					var itemLines = poNewRecord.getLineItemCount('item');
					
					var itemArray = {};
					
					//Get a list of all the products on the po
					//
					for (var int = 1; int <= itemLines; int++) 
					{
						var itemId = poNewRecord.getLineItemValue('item', 'item', int);
						var itemText = poNewRecord.getLineItemText('item', 'item', int);
						
						//Build the item array
						//
						if(!itemArray[itemId])
							{
								itemArray[itemId] = itemText;
							}
					}
					
					//Search for sales orders that have the products on them
					//
					var items = [];
					
					for ( var itemId in itemArray) 
					{
						items.push(itemId);
					}
					
					if(items.length > 0)
						{
							var salesorderSearch = nlapiSearchRecord("salesorder",null,
									[
									   ["type","anyof","SalesOrd"], 
									   "AND", 
									   ["mainline","is","F"], 
									   "AND", 
									   ["item","anyof",items], 
									   "AND", 
									   ["status","anyof","SalesOrd:E","SalesOrd:B"], //Partially Fulfilled, Pending Fulfillment
									   "AND", 
									   ["formulanumeric: {quantity} - {quantitycommitted}","greaterthan","0"]
									], 
									[
									   new nlobjSearchColumn("tranid",null,null)
									]
									);
							
							var soArray = {};
							
							//Process the search results
							//
							if(salesorderSearch)
								{
									for (var int2 = 0; int2 < salesorderSearch.length; int2++) 
										{
											var soId = salesorderSearch[int2].getId();
											var soText = salesorderSearch[int2].getValue('tranid');
											
											//Accumulate a list of sales order id's
											//
											if(!soArray[soId])
												{
													soArray[soId] = soText;
												}
										}
									
									var bodyText = "The following sales order(s) are affected by a change in due date on purchase order " + poNumber + "\r\n\r\n";
									
									for ( var soId in soArray) 
										{
											bodyText += soArray[soId] + "\t\t\thttps://system.eu2.netsuite.com/" + nlapiResolveURL('RECORD', 'salesorder', soId, 'VIEW') + "\r\n";
										}
									
									bodyText += "\r\nPlease check the sales orders & inform customers accordingly\r\n\r\n\r\nRegards,\r\n\r\nNetsuite.";
									
									var poAlertEmailTo = nlapiGetContext().getPreference('custscript_bbs_po_alert_email_to');
									var poAlertEmailFrom = nlapiGetContext().getPreference('custscript_bbs_po_alert_email_from');
									
									if(poAlertEmailTo != null && poAlertEmailTo != '' && poAlertEmailFrom != null && poAlertEmailFrom != '')
										{
											nlapiSendEmail(poAlertEmailFrom, poAlertEmailTo, 'Sales Orders Affected By Purchase Order Due Date Change', bodyText, null, null, null, null, false, true, null);
										}
								}
						}
				}
		}
}

// set the field duedate on the purchase order to be today’s date + supplier led time
//
function poBeforeSubmit(type){
  
	if(type == 'create'){
      
		var supplierId = nlapiGetFieldValue('entity');
		var today = new Date();
      	// get supplier led time
		//
		if (!CK_UTILS.isNullOrEmpty(supplierId)) {
			var suppLedTime = nlapiLookupField('vendor', supplierId, 'custentity_bbs_supleadtime');
			nlapiLogExecution('DEBUG', 'Supplier Led Time:-', suppLedTime);
		}
		
		if(suppLedTime != null && suppLedTime != '')
			{
				var dueDate = nlapiAddDays(today, parseInt(suppLedTime));
				nlapiSetFieldValue('duedate', nlapiDateToString(dueDate));
			}
	}
}

var CK_UTILS = {};
CK_UTILS.isNullOrEmpty = function(stValue) {
	return (stValue == '') || (stValue == null) || (stValue == undefined);
};
