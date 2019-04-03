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
	
	//Look at the channel advisor account id to determine what country specific description & size to use
	//on forms such as the packing slip
	//
	var channelAccountId = nlapiGetFieldValue('custbody_ca_account_id');
	
	if(channelAccountId != null && channelAccountId != '')
		{
			//Loop through all of the lines on the sales order
			//
			var lines = nlapiGetLineItemCount('item');
			
			for (var int2 = 1; int2 <= lines; int2++) 
				{
					var countryDescription = '';
					var countrySize = '';
					
					//Get the item type & id
					//
					var itemType = nlapiGetLineItemValue('item', 'itemtype', int2);
					var itemId = nlapiGetLineItemValue('item', 'item', int2);
				
					//We only want to work with inventory items
					//
					if(itemType == 'InvtPart')
						{
							//Load up the inventory record
							//
							var itemRecord = nlapiLoadRecord('inventoryitem', itemId);
							var brandSizeId = itemRecord.getFieldValue('custitem_bbs_brand_size_chart');
							
							//Load up the brand size record
							//
							var brandsizeRecord = null;
							
							if(brandSizeId != null && brandSizeId != '')
								{
									brandsizeRecord = nlapiLoadRecord('customrecordbbs_gisela_size_chart', brandSizeId);
								}
							
							switch(channelAccountId)
								{
									case '72001294':	//United States	
										countryDescription = itemRecord.getFieldValue('custitem_mio_ca_namerica');
										countrySize = (brandsizeRecord == null ? '' : brandsizeRecord.getFieldValue('custrecord_bbs_us_size'));
										
										break;
										
									case '72001295':	//Germany		
										countryDescription = itemRecord.getFieldValue('custitem_bbs_channel_advisor_de');
										countrySize = (brandsizeRecord == null ? '' : brandsizeRecord.getFieldValue('custrecord_bbs_de_size'));
										
										break;
												
									case '12026110':	//Australia		
										countryDescription = itemRecord.getFieldValue('custitem_bbs_channel_title_aa');
										countrySize = (brandsizeRecord == null ? '' : brandsizeRecord.getFieldValue('custrecord_bbs_au_size'));
										
										break;
											
									case '12027738':	//Canada		
										countryDescription = itemRecord.getFieldValue('custitem_bbs_channel_advisor_title');
										countrySize = (brandsizeRecord == null ? '' : brandsizeRecord.getFieldValue('custrecord_bbs_ca_size'));
										
										break;
												
									case '12033030':	//China		
										countryDescription = itemRecord.getFieldValue('custitem_mio_ca_chinese');
										countrySize = (brandsizeRecord == null ? '' : brandsizeRecord.getFieldValue('custrecord_bbs_size_cn'));
										
										break;
												
									case '72001762':	//France		
										countryDescription = itemRecord.getFieldValue('custitem_bbs_channel_advisor_title_fr');
										countrySize = (brandsizeRecord == null ? '' : brandsizeRecord.getFieldValue('custrecord_bbs_fr_size'));
										
										break;
												
									case '12014748':	//Hong Kong		
										countryDescription = itemRecord.getFieldValue('custitem_bbs_channel_advisor_title');
										countrySize = (brandsizeRecord == null ? '' : brandsizeRecord.getFieldValue('custrecord_bbs_hk_size'));
										
										break;
											
									case '12014747':	//Italy		
										countryDescription = itemRecord.getFieldValue('custitem_mio_ca_italian');
										countrySize = (brandsizeRecord == null ? '' : brandsizeRecord.getFieldValue('custrecord_bbs_it_size'));
										
										break;
												
									case '12012739':	//Japan		
										countryDescription = itemRecord.getFieldValue('custitem_bbs_channel_advisor_title');
										countrySize = (brandsizeRecord == null ? '' : brandsizeRecord.getFieldValue('custrecord_bbs_jp_size'));
										
										break;
												
									case '72001223':	//United Kingdom		
										countryDescription = itemRecord.getFieldValue('custitem_bbs_channel_advisor_title');
										countrySize = (brandsizeRecord == null ? '' : brandsizeRecord.getFieldValue('custrecord_bbs_uk_size'));
										
										break;
										
									case '12032391':	//Malaysia		
										countryDescription = itemRecord.getFieldValue('custitem_bbs_channel_advisor_title');
										countrySize = (brandsizeRecord == null ? '' : brandsizeRecord.getFieldValue('custrecord_bbs_my_size'));
										
										break;
											
									case '12015950':	//New Zealand	
										countryDescription = itemRecord.getFieldValue('custitem_bbs_channel_advisor_title');
										countrySize = (brandsizeRecord == null ? '' : brandsizeRecord.getFieldValue('custrecord_bbs_nz_size'));
										
										break;
												
									case '12014746':	//Spain		
										countryDescription = itemRecord.getFieldValue('custitem_mio_ca_spanish');
										countrySize = (brandsizeRecord == null ? '' : brandsizeRecord.getFieldValue('custrecord_bbs_es_size'));
										
										break;
								}
							
							//Update the fields on the sales order
							//
							nlapiSetLineItemValue('item', 'custcol_bbs_country_specific_desc', int2, countryDescription);
							nlapiSetLineItemValue('item', 'custcol_bbs_country_specific_size', int2, countrySize);

						}
				}
		}
}
