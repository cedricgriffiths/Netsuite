/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       19 Oct 2017     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */
function channelMappingUE(type)
{
	var caChannel = nlapiGetFieldValue('custbody_ca_sales_source');
	
	if(caChannel != null && caChannel != '')
		{
			var filters = new Array();
			filters[0] = new nlobjSearchFilter( 'name', null, 'is', caChannel);
			
			var columns = new Array();
			columns[0] = new nlobjSearchColumn( 'name' );
			
			var channels = nlapiSearchRecord('customrecord_cseg_bbs_channel', null, filters, columns);
			
			if(channels && channels.length == 1)
				{
						var channelId = channels[0].getId();
						
						var itemCount = nlapiGetLineItemCount('item');
						
						for (var int = 1; int <= itemCount; int++) 
							{
								nlapiSetLineItemValue('item', 'custcol_cseg_bbs_channel', int, channelId);
							}
				}
		}
}
