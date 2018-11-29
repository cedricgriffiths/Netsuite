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
function cbcScheduled(type) 
{
	
	//Read in the parameter containing the parent child object
	//
	var context = nlapiGetContext();
	var parentChildString = context.getSetting('SCRIPT', 'custscript_bbs_cbc_parent_child');
	var customerId = context.getSetting('SCRIPT', 'custscript_bbs_cbc_customer_id');
	var gradeId = context.getSetting('SCRIPT', 'custscript_bbs_cbc_grade_id');
	
	var gradeName = nlapiLookupField('customlist_cbc_grade', gradeId, 'name', false);
	var customerName = nlapiLookupField('customer', customerId, 'entityid', false);
	
	
	//Debugging
	//
	nlapiLogExecution('DEBUG', 'parentChildString', parentChildString);
	nlapiLogExecution('DEBUG', 'customerId', customerId);
	nlapiLogExecution('DEBUG', 'gradeId', gradeId);
		
	//Initialise local variables
	//
	var usersEmail = context.getUser();
	var emailText = 'The following items have been added to CBC Customer Items for customer "' + customerName + '" with grade "' + gradeName + '";\n';
	
	//Re-hydrate the parent & child object
	//
	var parentAndChild = JSON.parse(parentChildString);
	
	//Have we got everything we need so far?
	//
	if (parentAndChild)
		{
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
									var allocationType = data[1];
									var points = data[2];
									var name = data[3];

									//Check the remaining governance units available & yield if required
									//
									if(context.getRemainingUsage() < 100)
										{
											nlapiYieldScript();
										}
									else
										{	
											try
												{
													var itemRecord = nlapiCreateRecord('customrecord_cbc_item_record');
													
													itemRecord.setFieldValue('custrecord_cbc_item_customer', customerId);
													itemRecord.setFieldValue('custrecord_cbc_item_grade', gradeId);
													itemRecord.setFieldValue('custrecord_cbc_item_item', child);
													itemRecord.setFieldValue('custrecord_cbc_item_allocation_type', allocationType);
													itemRecord.setFieldValue('custrecord_cbc_item_points', points);
													itemRecord.setFieldValue('custrecord_cbc_web_product', 'T');
													
													nlapiSubmitRecord(itemRecord, false, true);
													
													emailText += 'Item (' + child.toString() + ') - ' + name + ' ' + '\n';
												}
											catch(err)
												{
													emailText += 'Error creating CBC Customer Items record (' + name + '), message is "' + err.message +'"\n';
												}
										}										
								}
						}
				}
		}
	
	//Send the email to the user to say that we have finished
	//
	nlapiSendEmail(usersEmail, usersEmail, 'CBC Customer Items Creation', emailText);
}


//=====================================================================
//Functions
//=====================================================================
//



