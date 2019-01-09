/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       05 Mar 2017     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function woBuildFieldChanged(type, name, linenum)
{
	//If any of the filters are changed, then get the data from all of those filters & store the data in the session data
	//
	if(name == 'custpage_prod_batch_id')
		{
			var filters = {};
		
			var batchId = nlapiGetFieldValue('custpage_prod_batch_id');
			
			if(batchId != null && batchId != '')
				{
					var customrecord_bbs_assembly_batchSearch = nlapiSearchRecord("customrecord_bbs_assembly_batch",null,
							[
							   ["internalid","anyof",batchId]
							], 
							[
							   new nlobjSearchColumn("id").setSort(false), 
							   new nlobjSearchColumn("custrecord_bbs_bat_description")
							]
							);
					
					if(customrecord_bbs_assembly_batchSearch && customrecord_bbs_assembly_batchSearch.length == 1)
					{
						var batchName = customrecord_bbs_assembly_batchSearch[0].getValue("custrecord_bbs_bat_description");
						nlapiSetFieldValue('custpage_prod_batch_name', batchName, false, true);
						
						filters['batchid'] = batchId;
						
						var filtersString = JSON.stringify(filters);
						
						var session = nlapiGetFieldValue('custpage_session_param');
						
						libSetSessionData(session, filtersString);
					}
				else
					{
						alert('Invalid Batch Id, Please Re-Enter');
						nlapiSetFieldValue('custpage_prod_batch_name', '', false, true);
					}
				
					
				}
		}
	
	//Operator id changed
	//
	if(name == 'custpage_operator_id')
		{
			var operatorId = nlapiGetFieldValue('custpage_operator_id');
			
			if(operatorId != null && operatorId != '')
				{
					var employeeSearch = nlapiSearchRecord("employee",null,
							[
							   ["internalid","anyof",operatorId]
							], 
							[
							   new nlobjSearchColumn("entityid")
							]
							);
					
					if(employeeSearch && employeeSearch.length == 1)
						{
							var employeeName = employeeSearch[0].getValue("entityid");
							nlapiSetFieldValue('custpage_operator_name', employeeName, false, true);
						}
					else
						{
							alert('Invalid Operator Id, Please Re-Enter');
							nlapiSetFieldValue('custpage_operator_id', '', false, true);
						}
				}
		}
}	

function clientSaveRecord()
{
	var returnStatus = false;
	var message = '';

	var count = nlapiGetLineItemCount('custpage_sublist_wo');
	message = 'Please select one or more works orders to continue';
				
	for (var int = 1; int <= count; int++) 
		{
			var tick = nlapiGetLineItemValue('custpage_sublist_wo', 'custpage_sublist_tick', int);
						
			if(tick == 'T')
				{
					returnStatus = true;
					break;
				}
		}

	if(!returnStatus)
		{	
			alert(message);
		}
	
    return returnStatus;
}
