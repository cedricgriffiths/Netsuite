/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       30 Nov 2018     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function soLineSummaryBeforeLoad(type, form, request)
{
	if(type == 'view')
		{
			var tabList = form.getTabs();
		
			var summaryGroup = form.addFieldGroup('custpage_summary_group', 'Order Lines Summary', 'items');
			summaryGroup.setShowBorder(true);
			
			var summaryQuantityField = form.addField('custpage_summary_quantity', 'integer', 'Quantity', null, 'custpage_summary_group');
			summaryQuantityField.setDisplayType('disabled');
			
			var summaryCommittedField = form.addField('custpage_summary_committed', 'integer', 'Committed', null, 'custpage_summary_group');
			summaryCommittedField.setDisplayType('disabled');
			summaryCommittedField.setLayoutType('normal', 'startcol');

			var summaryFulfilledField = form.addField('custpage_summary_fulfilled', 'integer', 'Fulfilled', null, 'custpage_summary_group');
			summaryFulfilledField.setDisplayType('disabled');
			summaryFulfilledField.setLayoutType('normal', 'startcol');

			var summaryInvoicedField = form.addField('custpage_summary_invoiced', 'integer', 'Invoiced', null, 'custpage_summary_group');
			summaryInvoicedField.setDisplayType('disabled');
			summaryInvoicedField.setLayoutType('normal', 'startcol');
			
			var summaryBackorderedField = form.addField('custpage_summary_backorder', 'integer', 'Backordered', null, 'custpage_summary_group');
			summaryBackorderedField.setDisplayType('disabled');
			summaryBackorderedField.setLayoutType('normal', 'startcol');
			
			//var summaryAvailableField = form.addField('custpage_summary_available', 'integer', 'Available ', null, 'custpage_summary_group');
			//summaryAvailableField.setDisplayType('disabled');
			//summaryAvailableField.setLayoutType('normal', 'startcol');
			
			var otherGroup = form.addFieldGroup('custpage_other_group', 'Other', 'items');
			otherGroup.setShowBorder(true);
			otherGroup.setCollapsible(false, false);
			
			var otherDummyField = form.addField('custpage_other_dummy', 'label', '', null, 'custpage_other_group');
			
			var lineCommitted = Number(0);
			var lineFulfilled = Number(0);
			var lineInvoiced = Number(0);
			var lineBackordered = Number(0);
			//var lineAvailable = Number(0);
			var lineQuantity = Number(0);
			
			var lineCount = nlapiGetLineItemCount('item');
			
			for (var int = 1; int <= lineCount; int++) 
				{
					lineCommitted += Number(nlapiGetLineItemValue('item', 'quantitycommitted', int));
					lineFulfilled += Number(nlapiGetLineItemValue('item', 'quantityfulfilled', int));
					lineInvoiced += Number(nlapiGetLineItemValue('item', 'quantitybilled', int));
					lineBackordered += Number(nlapiGetLineItemValue('item', 'quantitybackordered', int));
					//lineAvailable += Number(nlapiGetLineItemValue('item', 'quantityavailable', int));
					lineQuantity += Number(nlapiGetLineItemValue('item', 'quantity', int));
				}
			
			summaryCommittedField.setDefaultValue(lineCommitted);
			summaryFulfilledField.setDefaultValue(lineFulfilled);
			summaryInvoicedField.setDefaultValue(lineInvoiced);
			summaryBackorderedField.setDefaultValue(lineBackordered);
			//summaryAvailableField.setDefaultValue(lineAvailable);
			summaryQuantityField.setDefaultValue(lineQuantity);
		}
}
