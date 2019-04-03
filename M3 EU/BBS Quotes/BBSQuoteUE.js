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
	
	if(type == 'editforecast' || type == 'edit')
		{
			//Get the current record
			//
			var quoteNewRecord = nlapiGetNewRecord();
			var recordType = quoteNewRecord.getRecordType();
			
			//Make sure we are working with a quote (estimate)
			//
			if(recordType == 'estimate')
				{
					//Get the related opportunity & the include in forecast flag
					//
					var opportunity = quoteNewRecord.getFieldValue('opportunity');
					var include =  quoteNewRecord.getFieldValue('includeinforecast');
					
					//If we have a related opportunity & 
					if(opportunity != null && opportunity != '' && include == 'T')
						{
							var opportunityDate = nlapiLookupField('opportunity', opportunity, 'expectedclosedate', false);
							var quoteDate = quoteNewRecord.getFieldValue('expectedclosedate');

							if(opportunityDate != quoteDate)
								{
									nlapiSubmitField('opportunity', opportunity, 'expectedclosedate', quoteDate, false)
								}
						}
				}
		}
}











