/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       27 Feb 2019     cedricgriffiths
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
function nonStockedItemAS(type)
{
	//Works only for edit mode
	//
	if(type == 'edit')
		{
			var emailText = 'The following Purchase Orders for non stocked items need to be reviewed as Sales Order quantities have changed\n\n';
			var compPrefs = nlapiLoadConfiguration('companypreferences');
			var poEmails = compPrefs.getFieldValue('custscript_bbs_po_email_receive');
			var sendersEmail = compPrefs.getFieldValue('custscript_bbs_po_email_send');
			
			//Get old & new records
			//
			var oldRecord = nlapiGetOldRecord();
			var newRecord = nlapiGetNewRecord();
			
			//Get old & new non stocked items
			//
			var oldNonStockedItems = getNonStockedItems(oldRecord);
			var newNonStockedItems = getNonStockedItems(newRecord);
			
			//Compare old with new
			//
			var differences = [];
			
			//See if we have any non stocked items to process
			//
			if(Object.keys(oldNonStockedItems).length > 0)
				{
					for ( var oldNonStockedItem in oldNonStockedItems) 
						{
							//If the old id exists in the list of new id's but the quantity is different, then save the id
							//
							if(newNonStockedItems[oldNonStockedItem] && oldNonStockedItems[oldNonStockedItem] != newNonStockedItems[oldNonStockedItem])
								{
									differences.push(oldNonStockedItem);
								}
							
							//If the old id does not exist in the list of new id's then save the id
							//
							if(!newNonStockedItems[oldNonStockedItem])
								{
									differences.push(oldNonStockedItem);
								}
						}
					
					if(differences.length > 0)
						{
							//Now see if these id's exist on any open purchase orders
							//
							var purchaseorderSearch = nlapiSearchRecord("purchaseorder",null,
									[
									   ["type","anyof","PurchOrd"], 
									   "AND", 
									   ["mainline","is","F"], 
									   "AND", 
									   ["status","anyof","PurchOrd:A","PurchOrd:B","PurchOrd:E","PurchOrd:D"], //Pending Approval, Pending Receipt, Pending Billing/Partially Received, Partially Received
									   "AND", 
									   ["quantityshiprecv","equalto","0"], 
									   "AND", 
									   ["item","anyof",differences]
									], 
									[
									   new nlobjSearchColumn("tranid"), 
									   new nlobjSearchColumn("item")
									]
									);
							
							if(purchaseorderSearch != null && purchaseorderSearch.length > 0)
								{
									for (var int = 0; int < purchaseorderSearch.length; int++) 
										{
											var poNumber = purchaseorderSearch[int].getValue('tranid');
											var poItem = purchaseorderSearch[int].getText('item');
										
											emailText += 'Purchase Order: ' + poNumber + ' - Item: ' + poItem + '\n';
										}
									
									//Send email
									//
									if(poEmails != null && poEmails != '' && sendersEmail != null && sendersEmail != '')
										{
											nlapiSendEmail(sendersEmail, poEmails, 'Purchase Orders That May Need Amending', emailText);
										}
								}
						}
				}
		}
}

function getNonStockedItems(_record)
{
	//Get item counts
	//
	var oldRecordItemCount = _record.getLineItemCount('item');
	
	//Get a list of all the inventory parts on the old record
	//
	var oldItemsArray = {};
	
	for (var int=1; int <= oldRecordItemCount; int++) 
		{
			var oldItemType = _record.getLineItemValue('item', 'itemtype', int);
			
			if(oldItemType == 'InvtPart')
				{
					var oldItemId = _record.getLineItemValue('item', 'item', int);
					
					if(!oldItemsArray[oldItemId])
						{
							oldItemsArray[oldItemId] = Number(_record.getLineItemValue('item', 'quantity', int));
						}
					else
						{
							oldItemsArray[oldItemId] += Number(_record.getLineItemValue('item', 'quantity', int));
						}
				}
		}
	
	
	//See which of the old items are actually not stocked
	//
	var tempOldItems = [];
	for ( var oldItem in oldItemsArray) 
		{
			tempOldItems.push(oldItem);
		}
	
	var inventoryitemSearch = null;
	
	if(tempOldItems.length > 0)
		{
			inventoryitemSearch = nlapiSearchRecord("inventoryitem",null,
					[
					   ["type","anyof","InvtPart"], 
					   "AND", 
					   ["custitem_bbs_item_stocked","is","F"], 
					   "AND", 
					   ["internalid","anyof",tempOldItems]
					], 
					[
					   new nlobjSearchColumn("itemid").setSort(false)
					]
					);
		}
	
	var foundOldItems = [];
	
	//Copy the id's of the found items into an array
	//
	if(inventoryitemSearch != null && inventoryitemSearch.length > 0)
		{
			for (var int2 = 0; int2 < inventoryitemSearch.length; int2++) 
				{
					foundOldItems.push(inventoryitemSearch[int2].getId());
				}
		}
	
	//Now remove from the old items array any items which are not "non stocked"
	//
	for ( var oldItem in oldItemsArray) 
		{
			if(foundOldItems.indexOf(oldItem) == -1)
				{
					delete oldItemsArray[oldItem];
				}
		}
	
	return oldItemsArray;
}