/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 Nov 2018     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to save line item, false to abort save
 */
function classificationsValidateLine(type)
{
	var lineBusinessLine = nlapiGetCurrentLineItemValue(type, 'department');
	var lineServiceType = nlapiGetCurrentLineItemValue(type, 'class');
	var lineSourceMarket = nlapiGetCurrentLineItemValue(type, 'custcol_csegsm');
	var lineDestinationMarket = nlapiGetCurrentLineItemValue(type, 'custcol_csegdm');
	var lineBookingReference = nlapiGetCurrentLineItemValue(type, 'custcol_csegbkref');
	var message = '';
	
	message += (lineBusinessLine == null || lineBusinessLine == '' ? 'Please enter a value for Business Line\n' : '');
	message += (lineServiceType == null || lineServiceType == '' ? 'Please enter a value for Service Type\n' : '');
	message += (lineSourceMarket == null || lineSourceMarket == '' ? 'Please enter a value for Source Market\n' : '');
	
	var recordType = nlapiGetRecordType();
	if(recordType == 'salesorder' || recordType == 'invoice' || recordType == 'creditmemo')
		{
			
		}
	else
		{
			message += (lineDestinationMarket == null || lineDestinationMarket == '' ? 'Please enter a value for Destination Market\n' : '');
		}
	
	message += (lineBookingReference == null || lineBookingReference == '' ? 'Please enter a value for Project\n' : '');
	
	if(message != '')
		{
			alert(message);
			return false;
		}
	else
		{
			return true;
		}
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function classificationsSaveRecord()
{
	var message = '';
	var lines = nlapiGetLineItemCount('item');
	var recordType = nlapiGetRecordType();
	
	for (var int = 1; int <= lines; int++) 
		{
			var lineBusinessLine = nlapiGetLineItemValue('item', 'department', int);
			var lineServiceType = nlapiGetLineItemValue('item', 'class', int);
			var lineSourceMarket = nlapiGetLineItemValue('item', 'custcol_csegsm', int);
			var lineDestinationMarket = nlapiGetLineItemValue('item', 'custcol_csegdm', int);
			var lineBookingReference = nlapiGetLineItemValue('item', 'custcol_csegbkref', int);
		
			message += (lineBusinessLine == null || lineBusinessLine == '' ? 'Line ' + int + ': Please enter a value for Business Line\n' : '');
			message += (lineServiceType == null || lineServiceType == '' ? 'Line ' + int + ': Please enter a value for Service Type\n' : '');
			message += (lineSourceMarket == null || lineSourceMarket == '' ? 'Line ' + int + ': Please enter a value for Source Market\n' : '');
			
			if(recordType == 'salesorder' || recordType == 'invoice' || recordType == 'creditmemo')
				{
					
				}
			else
				{
					message += (lineDestinationMarket == null || lineDestinationMarket == '' ? 'Line ' + int + ': Please enter a value for Destination Market\n' : '');
				}
			
			message += (lineBookingReference == null || lineBookingReference == '' ? 'Line ' + int + ': Please enter a value for Project\n' : '');
		}
	
	if(message != '')
		{
			alert(message);
			return false;
		}
	else
		{
			return true;
		}
}







