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
function createAssembliesScheduled(type) 
{

	//Read in the parameter containing the parent child object
	//
	var context = nlapiGetContext();
	var parentChildString = context.getSetting('SCRIPT', 'custscript_bbs_parent_child');
	var customerId = context.getSetting('SCRIPT', 'custscript_bbs_customer_id');
	var finishId = context.getSetting('SCRIPT', 'custscript_bbs_finish_id');
	var finishrefId = context.getSetting('SCRIPT', 'custscript_bbs_finishref_id');
	
	//nlapiLogExecution('DEBUG', 'Parent And Child Object', parentChildString);
	//nlapiLogExecution('DEBUG', 'Customer Id', customerId);
	//nlapiLogExecution('DEBUG', 'Finish Id', finishId);
	//nlapiLogExecution('DEBUG', 'Finishref Id', finishrefId);
	
	var parentAndChild = JSON.parse(parentChildString);
	
	if (parentAndChild)
		{
			for ( var parent in parentAndChild) 
				{
					var children = parentAndChild[parent];
					
					for (var int = 0; int < children.length; int++) 
						{
							
						}
				}
		}
}
