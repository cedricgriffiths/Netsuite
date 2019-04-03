/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       30 Mar 2017     cedricgriffiths
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
function salesOrderAfterSubmit(type)
{
	//Get the subsidiaries
	//
	var context = nlapiGetContext();
	var versaSubsidiary = context.getSetting('SCRIPT', 'custscript_bbs_versa_subsidiary');
	var spellBeautySubsidiary = context.getSetting('SCRIPT', 'custscript_bbs_spell_beauty_subsidiary');
	var femeUkSubsidiary = context.getSetting('SCRIPT', 'custscript_bbs_uk_subsidiary');
	
	
	//Copy the sales order number to the new 'Original Order Number' field
	//
	if (type == 'create')
		{
			//Get the saved record
			//
			var salesOrder = nlapiGetNewRecord();
			
			//See what subsidiary we are in
			//
			subsidiaryId = salesOrder.getFieldValue('subsidiary');
			
			//Logic only needed for Versa & Spell Beauty
			//
			if (subsidiaryId == versaSubsidiary || subsidiaryId == spellBeautySubsidiary)
				{		
					//Get the id of the saved record
					//
					var salesOrderId = salesOrder.getId();
					
					//Load the saved record so it can be edited
					//
					salesOrder = nlapiLoadRecord('salesorder', salesOrderId);
					
					//Get the auto generated order number
					//
					var orderNumber = salesOrder.getFieldValue('tranid');
					
					//Save the order number to the custom field
					//
					salesOrder.setFieldValue('custbody_bbs_so_original_so', orderNumber);
					salesOrder.setFieldValue('custbody_bbs_so_origin', subsidiaryId);
					
					//Submit the record
					//
					nlapiSubmitRecord(salesOrder, false, true);
				}
			

			//Logic only needed for Feme Ltd
			//
			if (subsidiaryId == femeUkSubsidiary)
				{
					//Get the id of the saved record
					//
					var salesOrderId = salesOrder.getId();
					
					//Load the saved record so it can be edited
					//
					salesOrder = nlapiLoadRecord('salesorder', salesOrderId);
					
					//See if we have an intercompany order that links to this sales order
					//
					var intercoId = salesOrder.getFieldValue('intercotransaction');
					
					if (intercoId != null && intercoId != '')
						{
							//See if this is interco order is a purchase order
							//
							var intercoOrder = null;
							
							try
								{
									intercoOrder = nlapiLoadRecord('purchaseorder', intercoId);
								}
							catch(err)
								{
									intercoOrder = null;
								}
							
							//We have a purchase order as the source of the intercompany order
							//
							if (intercoOrder != null)
								{
									//Get the original order no from the interco order
									//
									var originalOrder = intercoOrder.getFieldValue('custbody_bbs_so_original_so');
									
									//Get the subsidiary from the original order
									//
									var originalSubsidiary = intercoOrder.getFieldValue('subsidiary');
									
									//Set the field on the current sales order
									//
									salesOrder.setFieldValue('custbody_bbs_so_original_so', originalOrder);
									salesOrder.setFieldValue('custbody_bbs_so_origin', originalSubsidiary);
									
									//Submit the record
									//
									nlapiSubmitRecord(salesOrder, false, true);
								}
						}
				}
		}
}
