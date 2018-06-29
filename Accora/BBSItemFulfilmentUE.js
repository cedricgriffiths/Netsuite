/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       29 Jun 2018     cedricgriffiths
 *
 */


function itemFulfilmentBeforeLoad(type, form, request) 
{
	// Add a print button to the form in view mode
	if (type == 'view') 	
		{
			// Add the global client script to the form manually as this is where
			// the 'on-click' function for the button is held
			form.setScript('customscript_bbs_fulfillment_global');

			// Add the actual print button & call the print function in the global
			// script
			var customButton1 = form.addButton('custpage_printbutton', 'Print Serial Number Labels', 'GlbPrintLabels');
		}
}

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
function itemFulfilmentAfterSubmit(type)
{
	if(type == 'create' || type == 'edit')
		{
			var newRecord = nlapiGetNewRecord();
			var newRecordId = newRecord.getId();
			
			var record = nlapiLoadRecord('itemfulfillment', newRecordId);
			var updated = false;
			
			if(record)
				{
					var lines = record.getLineItemCount('item');
					var salesOrderId = record.getFieldValue('createdfrom');
					
					if(salesOrderId != null && salesOrderId != '')
						{
							var salesOrderNo = nlapiLookupField('salesorder', salesOrderId, 'tranid', false);
							
							for (var int = 1; int <= lines; int++) 
								{
									var item = record.getLineItemValue('item', 'item', int);
									var itemType = record.getLineItemValue('item', 'itemtype', int);
									
									var isSerialItem = nlapiLookupField(getItemRecordType(itemType), item, 'custitem_serial_numbered', false);
								
									if(isSerialItem == 'T')
										{
											var serialNumber = salesOrderNo + padding_left(int.toString(), '0', 6);
											
											record.setLineItemValue('item', 'custcol_serial_numbers_udi', int, serialNumber);
										
											updated = true;
										}
								}
							
							if(updated)
								{
									nlapiSubmitRecord(record, false, true);
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
			
		case 'NonInvtPart':
			girtItemRecordType = 'noninventoryitem';
			break;
	}

	return girtItemRecordType;
}

//left padding s with c to a total of n chars
//
function padding_left(s, c, n) 
{
	if (! s || ! c || s.length >= n) 
	{
		return s;
	}
	
	var max = (n - s.length)/c.length;
	
	for (var i = 0; i < max; i++) 
	{
		s = c + s;
	}
	
	return s;
}

