/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       27 Dec 2017     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function itemPricingMaintScheduled(type) 
{
	
	//Read in the parameter containing the parent child object
	//
	var context = nlapiGetContext();
	var parentChildString = context.getSetting('SCRIPT', 'custscript_bbs_cipm_parent_child');
	var customerId = context.getSetting('SCRIPT', 'custscript_bbs_cipm_customer_id');

	//Debugging
	//
	nlapiLogExecution('DEBUG', 'parentChildString', parentChildString);
	nlapiLogExecution('DEBUG', 'customerId', customerId);
		
	//Initialise local variables
	//
	var usersEmail = context.getUser();
	var emailText = '';
	
	//Re-hydrate the parent & child object
	//
	var parentAndChild = JSON.parse(parentChildString);
	
	//Read the customer record
	//
	var customerRecord = null;
	
	try
		{
			customerRecord = nlapiLoadRecord('customer', customerId);
		}
	catch(err)
		{
			customerRecord = null;
			emailText = 'An error occured reading the customer record with id = ' + customerId + ' the error was - ' + err.message + '\n';
		}
	
	if(customerRecord != null)
		{
			var customerName = customerRecord.getFieldValue('entityid'); 
		
			emailText = 'The following items have been updated in Customer Item Pricing for customer "' + customerName + ';\n';
			
			//Have we got everything we need so far?
			//
			if(parentAndChild)
				{
					var itemPricingCount = customerRecord.getLineItemCount('itempricing');
					
					//Loop through all the parent objects
					//
					for ( var parent in parentAndChild) 
						{
							//Get the child items for this parent
							//
							var children = parentAndChild[parent];
								
							//Check to see if we have a parent & it also has children
							//
							if(children.length > 0)
								{
									//=====================================================================
									//Process the child items
									//=====================================================================
									//
												
									//Loop through the child items
									//
									for (var int = 0; int < children.length; int++) 
										{
											var data = children[int];
																
											var child = data[0];
											var price = data[1];
											var name = data[2];
											
											//Loop through the item pricing sublist
											//
											for (var int2 = 1; int2 <= itemPricingCount; int2++) 
												{
													var itemPricingItemId = customerRecord.getLineItemValue('itempricing', 'item', int2);
													var itemPricingPrice = customerRecord.getLineItemValue('itempricing', 'price', int2);
												
													//Have we found a matching item
													//
													if(itemPricingItemId == child)
														{
															//Has the price changed
															//
															if(itemPricingPrice != price)
																{
																	customerRecord.setLineItemValue('itempricing', 'price', int2, price);
																	emailText += 'Item Updated : ' + name + ' Old Price : ' + itemPricingPrice + ' New Price : ' + price + '\n';
																}
															else
																{
																	emailText += 'Item Skipped - No Price Change : ' + name + ' Old Price : ' + itemPricingPrice + ' New Price : ' + price + '\n';
																}
															
															break;
														}
												}
										}
								}
						}
					
					try
						{
							nlapiSubmitRecord(customerRecord, false, true);
						}
					catch(err)
						{
							emailText += 'Error saving Customer Item Pricing record, message is "' + err.message +'"\n';
						}
				}
		}
	
	//Send the email to the user to say that we have finished
	//
	nlapiSendEmail(usersEmail, usersEmail, 'Customer Item Pricing Maintenance', emailText);
}


//=====================================================================
//Functions
//=====================================================================
//



