/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       01 Sep 2017     cedricgriffiths
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
function clientFieldChanged(type, name, linenum)
{
	if (name == 'custpage_so_commit_select')
		{
			nlapiSetFieldValue('custpage_so_com_text', nlapiGetFieldText(name), false, true)
		}
	
	if (name == 'custpage_wo_commit_select')
	{
		nlapiSetFieldValue('custpage_wo_com_text', nlapiGetFieldText(name), false, true)
	}

	if (name == 'custpage_so_select')
	{
		nlapiSetFieldValue('custpage_so_text', nlapiGetFieldText(name), false, true)
	}
}

function clientSaveRecord()
{
	var stage = nlapiGetFieldValue('custpage_stage');
	var returnStatus = false;
	var message = '';
	
	switch (Number(stage))
		{
			case 1:
				returnStatus = true;
				break;
				
			case 2:
				var count = nlapiGetLineItemCount('custpage_sublist_items');
				message = 'Please select one or more works orders to continue';
				
				for (var int = 1; int <= count; int++) 
					{
						var tick = nlapiGetLineItemValue('custpage_sublist_items', 'custpage_sublist_tick', int);
						
						if(tick == 'T')
							{
								returnStatus = true;
								break;
							}
					}
				
				break;
				
			case 3:
				var count = nlapiGetLineItemCount('custpage_sublist_items');
				message = 'Please refresh the list until all works orders are allocated before continuing';
				returnStatus = true;
				
				for (var int = 1; int <= count; int++) 
					{
						var tick = nlapiGetLineItemValue('custpage_sublist_items', 'custpage_sublist_updated', int);
						
						if(tick == 'F')
							{
								returnStatus = false;
								break;
							}
					}
				
				break;
		}
	
	if(!returnStatus)
		{	
			alert(message);
		}
	
    return returnStatus;
}














