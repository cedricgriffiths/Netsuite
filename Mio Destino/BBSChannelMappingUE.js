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
	//Find the n/a channel record
	//
	var noChannel = null;
	
	var filters = new Array();
	filters[0] = new nlobjSearchFilter( 'name', null, 'is', 'N/A');
	
	var columns = new Array();
	columns[0] = new nlobjSearchColumn( 'name' );
	
	var channels = nlapiSearchRecord('customrecord_cseg_bbs_channel', null, filters, columns);
	
	if(channels && channels.length == 1)
		{
			noChannel = channels[0].getId();
		}
	
	//Find the channel downloaded from channel advisor
	//
	var caChannel = nlapiGetFieldValue('custbody_ca_sales_source');
	
	//Do we have a channel from ca?
	//
	if(caChannel != null && caChannel != '')
		{
			var filters = new Array();
			filters[0] = new nlobjSearchFilter( 'name', null, 'is', caChannel);
			
			var columns = new Array();
			columns[0] = new nlobjSearchColumn( 'name' );
			
			var channels = nlapiSearchRecord('customrecord_cseg_bbs_channel', null, filters, columns);
			
			//Have we found a match in the channels custom segment?
			//
			if(channels && channels.length == 1)
				{
						var channelId = channels[0].getId();
						
						var itemCount = nlapiGetLineItemCount('item');
						
						for (var int = 1; int <= itemCount; int++) 
							{
								nlapiSetLineItemValue('item', 'custcol_cseg_bbs_channel', int, channelId);
							}
				}
			else
				{
					//If not, then use the n/a channel
					//
					var itemCount = nlapiGetLineItemCount('item');
					
					for (var int = 1; int <= itemCount; int++) 
						{
							nlapiSetLineItemValue('item', 'custcol_cseg_bbs_channel', int, noChannel);
						}
				}
		}
	else
		{
			//If not, then use the n/a channel
			//
			var itemCount = nlapiGetLineItemCount('item');
			
			for (var int = 1; int <= itemCount; int++) 
				{
					nlapiSetLineItemValue('item', 'custcol_cseg_bbs_channel', int, noChannel);
				}
		}
}
