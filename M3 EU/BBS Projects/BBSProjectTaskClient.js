/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       24 Jan 2019     cedricgriffiths
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
function projectTaskFieldChanged(type, name, linenum)
{
	if(name == 'custevent2')
		{
			var goLiveTickBox = nlapiGetFieldValue('custevent2');
			
			if(goLiveTickBox == 'F')
				{
					alert('WARNING - Unticking the "Estimated Go Live Project Task" box will clear out the dates in the project "Estimated Project Go Live Date" fields');
				}
		}
}
