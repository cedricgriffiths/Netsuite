/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       27 Jun 2018     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Void}
 */
function salesOrderLineInit(type) 
{
     var mainLocation = nlapiGetFieldValue('location');
     
     if(mainLocation != null && mainLocation != '')
    	 {
    	 	nlapiSetCurrentLineItemValue('item', 'location', mainLocation, true, true);
    	 }
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to save line item, false to abort save
 */
function SalesOrderValidateLine(type)
{
	var lineLocation = nlapiGetCurrentLineItemValue('item', 'location');
	
	if(lineLocation == null || lineLocation == '')
		{
			alert("Please enter a value for location");
			return false;
		}
	else
		{
			return true;
		}
}
