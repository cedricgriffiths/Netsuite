/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       14 Sep 2018     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function invoiceSaveRecord()
{
	var createdFrom = nlapiGetFieldValue('createdfrom');
	
	if(createdFrom == null || createdFrom == '')
		{
			alert('You cannot create invoices without a link to a sales order');
			
			return false;
		}
	else
		{
			return true;
		}
    
}
