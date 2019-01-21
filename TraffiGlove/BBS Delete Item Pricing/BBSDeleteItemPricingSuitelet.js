/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       03 Mar 2017     cedricgriffiths
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function deleteItemPricing(request, response)
{
	
	//=====================================================================
	// Get request - so return a form for the user to process
	//=====================================================================
	//
	
	if (request.getMethod() == 'GET') 
		{
			//=====================================================================
			// Parameters passed to the suitelet
			//=====================================================================
			//
			var customerIdParam = request.getParameter('customerid');
			var customerNameParam = request.getParameter('customername');
			
			
			//=====================================================================
			// Form creation
			//=====================================================================
			//
			var form = nlapiCreateForm('Delete Customer Item Pricing', false);
			form.setTitle('Delete Customer Item Pricing');
			
			
			//=====================================================================
			// Hidden fields to pass data to the POST section
			//=====================================================================
			//
			
			//Customer Id
			//
			var customerIdField = form.addField('custpage_cust_id', 'text', 'customer id');
			customerIdField.setDisplayType('hidden');
			customerIdField.setDefaultValue(customerIdParam);
			
	
			//=====================================================================
			// Field groups creation
			//=====================================================================
			//
	
			//Add a field group 
			//
			var fieldGroupHeader = form.addFieldGroup('custpage_grp_info', 'Information');
					
					
			//=====================================================================
			// Fields creation
			//=====================================================================
			//
	
			//Add a field for the customer
			//
			var customerNameField = form.addField('custpage_cust_name', 'text', 'Customer Name', null, 'custpage_grp_info');
			customerNameField.setDisplayType('disabled');
			customerNameField.setDefaultValue(customerNameParam);
					
			var messageField = form.addField('custpage_info_message', 'label', 'The routine will delete all item pricing for the selected customer', null, 'custpage_grp_info');
			messageField.setLayoutType('outsidebelow', 'startrow');
			
			
			form.addSubmitButton('Delete Item Pricing Data');
			
					
			//Write the response
			//
			response.writePage(form);
		}
	else
		{
			//=====================================================================
			// Post request - so process the returned form
			//=====================================================================
			//
			
			
			//Get the customer id
			//
			var customerId = request.getParameter('custpage_cust_id');
			
			var customerRecord = null;
			
			try
				{
					customerRecord = nlapiLoadRecord('customer', customerId);
				}
			catch(err)
				{
					customerRecord = null;
				}
			
			var itemPrices = customerRecord.getLineItemCount('itempricing');
			
			if(itemPrices != null)
				{
					for (var int = itemPrices; int >=1; int--) 
						{
							customerRecord.removeLineItem('itempricing', int, false);
						}
					
					try
						{
							nlapiSubmitRecord(customerRecord, false, true);
						}
					catch(err)
						{
							
						}
				}
			
			//link back to the calling record
			//
			nlapiSetRedirectURL('RECORD', 'customer', customerId, true, null);
		}
}

