/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       21 Aug 2018     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */
function quoteBeforeSubmit(type)
{
	if(type == 'editforecast')
		{
			var quoteNewRecord = nlapiGetNewRecord();
			var allowedProbabilities = ['1.0','10.0','25.0','50.0','75.0','99.0'];
			
			var newProbability = quoteNewRecord.getFieldValue('probability');
			var newQuoteNumber = quoteNewRecord.getFieldValue('tranid');
			
			if(allowedProbabilities.indexOf(newProbability) == -1)
				{
					
					throw nlapiCreateError('BBS_INVALID_PROBABILITY', 'Invalid Probability (' + newProbability + ') on ' + newQuoteNumber + '. Valid values are 1.0%, 10.0%, 25.0%, 50.0%, 75.0% & 99.0%', true);
				}
			
		}
}
