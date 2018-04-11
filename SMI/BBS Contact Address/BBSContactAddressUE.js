/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       22 Feb 2018     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function contactAddressBRL(type, form, request)
{
	if(type == 'edit' || type == 'view')
		{
			var addresssText = '';
			var addresssDepotText = '';
		
			var fieldGroup = form.addFieldGroup('custpage_cust_address', 'Office Address', 'main');
			var fieldGroup = form.addFieldGroup('custpage_cust_depot_address', 'Depot Address', 'main');
			
			var companyAddressField = form.addField('custpage_bbs_comp_address', 'textarea', 'Office Address', null, 'custpage_cust_address');
			companyAddressField.setDisplayType('readonly');
			
			var depotAddressField = form.addField('custpage_bbs_depot_address', 'textarea', 'Depot Address', null, 'custpage_cust_depot_address');
			depotAddressField.setDisplayType('readonly');
			
			var companyId = nlapiGetFieldValue('company');
			var depotId = nlapiGetFieldValue('custentity1');
			
			//Company address sourcing
			//
			if(companyId != null && companyId != '')
				{
					var companyRecord = nlapiLoadRecord('customer', companyId);
					
					if(companyRecord)
						{
							var addressLines = companyRecord.getLineItemCount('addressbook');
							
							for (var int = 1; int <= addressLines; int++) 
								{
									var isDefaultShipping = companyRecord.getLineItemValue('addressbook', 'defaultshipping', int);
									
									if(isDefaultShipping == 'T')
										{
											addresssText = companyRecord.getLineItemValue('addressbook', 'addressbookaddress_text', int);
											
											if(type == 'view')
												{
													addresssText = addresssText.replace(/\r\n/g, "<br/>");
												}
											
											companyAddressField.setDefaultValue(addresssText);
											
											break;
										}
								}
						}
				}
			
			//Depot address sourcing
			//
			if(depotId != null && depotId != '' && companyId != null && companyId != '')
			{
				var companyRecord = nlapiLoadRecord('customer', companyId);
				
				if(companyRecord)
					{
						var addressLines = companyRecord.getLineItemCount('addressbook');
						
						for (var int = 1; int <= addressLines; int++) 
							{
								var addressId = companyRecord.getLineItemValue('addressbook', 'addressid', int);
								
								if(addressId == depotId)
									{
										addresssDepotText = companyRecord.getLineItemValue('addressbook', 'addressbookaddress_text', int);
										
										if(type == 'view')
											{
												addresssDepotText = addresssDepotText.replace(/\r\n/g, "<br/>");
											}
										
										depotAddressField.setDefaultValue(addresssDepotText);
										
										break;
									}
							}
					}
			}
		}
}
