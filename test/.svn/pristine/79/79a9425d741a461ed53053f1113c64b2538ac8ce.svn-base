/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       12 Apr 2017     cedricgriffiths
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
function userEventBeforeLoad(type, form, request){
 
	if (type == 'create' || type == 'edit')
		{
			var userId = nlapiGetContext().getUser();
			
			if (userId == 1810)  //1810 Davin
				{		
					var custField = nlapiGetField('customer');
					
					nlapiSetFieldValue('employee', userId, true, true);
					nlapiSetFieldValue('customer', '1814', true, true);  // Accora Project
					
					custField.setDisplayType('disabled');
				}
		}
}
