/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       09 Feb 2017     cedricgriffiths
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
function userEventBeforeLoad(type, form, request)
{
 
	// Add a print button to the form in view mode
	//
	if (type == 'view') 
	{
		// Add the global client script to the form manually as this is where
		// the 'on-click' function for the button is held
		//
		form.setScript('customscript_bbs_clone_quote_global');

		// Add the actual print button & call the print function in the global
		// script
		//
		var customButton1 = form.addButton('custpage_clonebutton', 'Clone Quote', 'GlbCloneQuote');
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
function userEventAfterSubmit(type)
{
	if (type == 'create')
		{
		var referenceFieldName = 'custbody_bbs_quote_ref';
		var newRecord = nlapiGetNewRecord();
		var newId = newRecord.getId();
		
		newRecord = nlapiLoadRecord('estimate', newId);
		
		var newQuoteRef = newRecord.getFieldValue(referenceFieldName);
		
		if (newQuoteRef == null || newQuoteRef == '')
			{
			var newReference = newRecord.getFieldValue('tranid');
			newRecord.setFieldValue(referenceFieldName, newReference);
			
			nlapiSubmitRecord(newRecord, false, true);
			}
		
		}
}