/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       11 Jan 2017     cedricgriffiths
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
 
	var sublist = form.getSubList('item');
  
    if (sublist != null && sublist != '')
    {
      var field = sublist.getField('vendorname');
      
      if (field != null && field != '')
      {
        field.setDisplayType('hidden'); 
      }
    }
}

