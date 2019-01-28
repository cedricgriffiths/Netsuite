/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       28 Jan 2019     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function clearSerialNoPageInit(type)
{
   if(type == 'copy')
	   {
	   		var lines = nlapiGetLineItemCount('item');
	   		
	   		for (var int = 1; int <= lines; int++) 
		   		{
					nlapiSetLineItemValue('item', 'custcol_serial_numbers_udi', int, '');
				}
	   }
}


/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Void}
 */
function serialNoLineInit(type) 
{
     var serialNo = nlapiGetCurrentLineItemValue('item', 'custcol_serial_numbers_udi');
     
     if(serialNo != null && serialNo != '')
    	 {
    	 	setFieldAndLabelVisibility("tbl_item_copy", false);
    	 }
     else
    	 {
    	 	setFieldAndLabelVisibility("tbl_item_copy", true);
    	 }
}