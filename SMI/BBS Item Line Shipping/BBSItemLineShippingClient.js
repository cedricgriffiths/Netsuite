/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       31 Jul 2018     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function itemLineShippingFieldChanged(type, name, linenum)
{
	if(type == 'item' && name == 'custcol_bbs_contact_sales_lines')
		{
			var lineShippingEnabled = nlapiGetFieldValue('ismultishipto');
			
			if(lineShippingEnabled == 'T')
				{
					var lineContact = nlapiGetCurrentLineItemValue('item', 'custcol_bbs_contact_sales_lines');
					
					if(lineContact != null && lineContact != '')
						{
							var contactDepotAddress = nlapiLookupField('contact', lineContact, 'custentity1', false);
							
							if(contactDepotAddress != null && contactDepotAddress != '')
								{							
									nlapiSetCurrentLineItemValue('item','shipaddress', contactDepotAddress);

								}
						}
				}
		}
}
