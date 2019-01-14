/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       14 Jan 2019     cedricgriffiths
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function poNosuitelet(request, response)
{
	//=====================================================================
	// Get request - so return a form for the user to process
	//=====================================================================
	//
	
	if (request.getMethod() == 'GET') 
		{
			//Get parameters
			//
			var recordIdParam = request.getParameter('recordid');
			
			// Create a form
			//
			var form = nlapiCreateForm('Update Purchase Order Number', true);
			form.setTitle('Update Purchase Order Number');
			
			//Add a hidden field to hold the order id
			//
			var orderIdField = form.addField('custpage_order_id', 'text', 'Order Number', null, null);
			orderIdField.setDisplayType('hidden');
			orderIdField.setDefaultValue(recordIdParam);
			
			//Add a field for the po number
			//
			var purchaseOrderNumberField = form.addField('custpage_po_no', 'text', 'Purchase Order Number', null, null);
			
			//Add a submit button
			//
			form.addSubmitButton('Update Order');
		}
	else
		{
			//POST request
			//
		
			//Get the field data 
			//
			var orderId = request.getParameter('custpage_order_id');
			var purchaseOrderNo = request.getParameter('custpage_po_no');
		
			//Update the sales order with the po number
			//
			if(orderId != null && orderId != '')
				{
					//Try to update the po field on the sales order
					//
					try
						{
							nlapiSubmitField('salesorder', orderId, 'otherrefnum', purchaseOrderNo, false);
						}
					catch(err)
						{
							//Report any errors
							//
							nlapiLogExecution('ERROR', 'Error updating sale sorder with new po number', err.message);
						}
				}
		}
}
