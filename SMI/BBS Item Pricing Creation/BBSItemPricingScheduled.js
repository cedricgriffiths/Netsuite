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
function citemPricingScheduled(type) 
{
	
	//Read in the parameter containing the parent child object
	//
	var context = nlapiGetContext();
	var parentChildString = context.getSetting('SCRIPT', 'custscript_bbs_cip_parent_child');
	var customerId = context.getSetting('SCRIPT', 'custscript_bbs_cip_customer_id');
	
	var customerName = nlapiLookupField('customer', customerId, 'entityid', false);
	
	
	//Debugging
	//
	nlapiLogExecution('DEBUG', 'parentChildString', parentChildString);
	nlapiLogExecution('DEBUG', 'customerId', customerId);
		
	//Initialise local variables
	//
	var usersEmail = context.getUser();
	var emailText = 'The following items have been added to Customer Item Pricing for customer "' + customerName + ';\n';
	
	//Re-hydrate the parent & child object
	//
	var parentAndChild = JSON.parse(parentChildString);
	
	//Have we got everything we need so far?
	//
	if(parentAndChild)
		{
			//Load the customer record
			//
			var customerRecord = null;
			
			try
				{
					customerRecord = nlapiLoadRecord('customer', customerId);
				}
			catch(err)
				{
					customerRecord = null;
					nlapiLogExecution('ERROR', 'Error loading customer record', err.message);
				}
			
			if(customerRecord != null)
				{
					//Get a list of all the items currently in the customer item pricing
					//
					var existingItemPricing = [];
					var itemPricingCount = customerRecord.getLineItemCount('itempricing');
					
					for (var int = 1; int <= itemPricingCount; int++) 
						{
							var itemPricingItemId = customerRecord.getLineItemValue('itempricing', 'item', int);
							existingItemPricing.push(itemPricingItemId);
						}
					
					//Get the customer currency
					//
					var customerCurrency = customerRecord.getFieldValue('currency');
					
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
		
											if(existingItemPricing.indexOf(child) == -1)
												{
													try
														{
															customerRecord.selectNewLineItem('itempricing');
															
															customerRecord.setCurrentLineItemValue('itempricing', 'item', child);
															customerRecord.setCurrentLineItemValue('itempricing', 'level', '-1');
															customerRecord.setCurrentLineItemValue('itempricing', 'currency', customerCurrency);
															customerRecord.setCurrentLineItemValue('itempricing', 'price', price);
															
															customerRecord.commitLineItem('itempricing', false);
															
															emailText += 'Item (' + child.toString() + ') - ' + name + ' ' + price + '\n';
														}
													catch(err)
														{
															emailText += 'Error adding Customer Item Pricing record (' + name + '), message is "' + err.message +'"\n';
														}
												}
											else
												{
													emailText += 'Customer Item Pricing record (' + name + ') already exists - skipped\n';
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
	nlapiSendEmail(usersEmail, usersEmail, 'Customer Item Pricing Creation', emailText);
}


//=====================================================================
//Functions
//=====================================================================
//



