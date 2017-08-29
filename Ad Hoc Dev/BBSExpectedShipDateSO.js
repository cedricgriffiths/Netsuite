/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       24 Aug 2017     cedricgriffiths
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
function expectedShipDateChanged(type, name, linenum)
{
	if (type == 'item' && name == 'expectedshipdate')
		{
			var expectedShip = nlapiStringToDate(nlapiGetCurrentLineItemValue(type, name));
			
			if (expectedShip != null)
				{
					var today = new Date();
					
					var todayPlusSixty = nlapiAddDays(today, 60);
					
					if (expectedShip.getTime() > todayPlusSixty.getTime())
						{
							alert('Expected Ship Date Is More Than 60 Days Away!')
						}
				}
		}
}


/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to save line item, false to abort save
 */
function clientValidateLine(type){
 
    return true;
}
