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
	var subsidiaryId = nlapiGetFieldValue('subsidiary');
	var location_header_field = 'location';
	var location_detail_field = 'location';
	
	if(subsidiaryId == '7')
		{
			location_header_field = 'custpage_subsid_location';
			location_detail_field = 'inventorylocation';
		}
		
     var mainLocation = nlapiGetFieldValue(location_header_field);
     
     if(mainLocation != null && mainLocation != '')
    	 {
    	 	nlapiSetCurrentLineItemValue('item', location_detail_field, mainLocation, true, true);
    	 }
}

function salesOrderFieldChanged(type, name, linenum)
{
	 if(type == null && (name == 'location' || name == 'custpage_subsid_location'))
		 {
		 	var subsidiaryId = nlapiGetFieldValue('subsidiary');
			var location_header_field = 'location';
			var location_detail_field = 'location';
			
			if(subsidiaryId == '7')
				{
					location_header_field = 'custpage_subsid_location';
					location_detail_field = 'inventorylocation';
					
					nlapiSetFieldValue('custbody3', nlapiGetFieldText(location_header_field), false, true);
					
				}
				
		 	var mainLocation = nlapiGetFieldValue(location_header_field);
		 	
		 	var lines = Number(nlapiGetLineItemCount('item'));
		 	
		 	if(lines != 0)
		 		{
		 			for (var int = 1; int <= lines; int++) 
			 			{
							nlapiSelectLineItem('item', int);
							nlapiSetCurrentLineItemValue('item', location_detail_field, mainLocation, true, true);
							nlapiCommitLineItem('item');
						}
		 		}
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
	var subsidiaryId = nlapiGetFieldValue('subsidiary');
	var location_header_field = 'location';
	var location_detail_field = 'location';
	
	if(subsidiaryId == '7')
		{
			location_header_field = 'custpage_subsid_location';
			location_detail_field = 'inventorylocation';
		}
	
	var mainLocation = nlapiGetFieldValue(location_header_field);
    
	var lineLocation = nlapiGetCurrentLineItemValue('item', location_detail_field);
	
	if(lineLocation == null || lineLocation == '')
		{
			if(mainLocation != null && mainLocation != '')
			   	 {
			   	 	nlapiSetCurrentLineItemValue('item', location_detail_field, mainLocation, true, true);
			   	 	return true;
			   	 }
			else
				{
					alert("Please enter a value for location");
					return false;
				}
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
function salesOrderSaveRecord()
{
	var validated = true;
	
	var subsidiaryId = nlapiGetFieldValue('subsidiary');
	
	if(subsidiaryId == '7')
		{
			var lines = Number(nlapiGetLineItemCount('item'));
		 	
		 	if(lines != 0)
		 		{
		 			for (var int = 1; int <= lines; int++) 
			 			{
		 					var inventoryLocation = nlapiGetLineItemValue('item', 'inventorylocation', int)
							
		 					if(inventoryLocation == null || inventoryLocation == '')
		 						{
		 							validated = false;
		 							alert('Inventory Location is required for all item lines');
		 							break;
		 						}
						}
		 		}
		}

    return validated;
}