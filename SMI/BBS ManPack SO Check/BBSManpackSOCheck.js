/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       19 Nov 2018     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function manpackCheckSaveRecord()
{
	//Get the order type
	//
	var orderType = nlapiGetFieldValue('custbody_bbs_salesorder_type');
	
	//Only interested in Manpack orders
	//
	if(orderType == '1')
		{
			var orderLines = nlapiGetLineItemCount('item');
			var counter = Number(0);
			var message = 'ManPack Order Save Errors:-\n';
			
			//Loop through the item lines
			//
			for (var int = 1; int <= orderLines; int++) 
				{
					var manpackContact = nlapiGetLineItemValue('item', 'custcol_bbs_contact_sales_lines', int);
					var manpackLineNo = nlapiGetLineItemValue('item', 'line', int);
				
					//Line without a contact?
					//
					if(manpackContact == null || manpackContact == '')
						{
							counter++;
							
							if(manpackLineNo == null || manpackLineNo == '')
								{
									switch(int)
										{
											case 1:
												message += int + 'st Line - No ManPack Contact Supplied\n';
												break;
												
											case 2:
												message += int + 'nd Line - No ManPack Contact Supplied\n';
												break;
												
											case 3:
												message += int + 'rd Line - No ManPack Contact Supplied\n';
												break;
												
											default:
												message += int + 'th Line - No ManPack Contact Supplied\n';
												break;
										}
								}
							else
								{
									message += 'Line No ' + manpackLineNo + ' - No ManPack Contact Supplied\n';
								}
						}
				}
			
			//If we have lines with no contact the fail the validation
			//
			if(counter > 0)
				{
					alert(message);
					return false;				
				}
			else
				{
					return true;
				}
		}
	else
		{
			return true;
		}
}
