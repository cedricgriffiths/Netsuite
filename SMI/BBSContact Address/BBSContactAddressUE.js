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
			var fieldGroup = form.addFieldGroup('custpage_cust_address', 'Office Address', 'main');
			
			var companyAddressField = form.addField('custpage_bbs_comp_address', 'textarea', 'Office Address', null, 'custpage_cust_address');
			companyAddressField.setDisplayType('readonly');
			
			
			var companyId = nlapiGetFieldValue('company');
			
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
		}
}
