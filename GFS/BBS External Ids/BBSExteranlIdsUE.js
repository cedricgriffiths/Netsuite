/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       14 Sep 2018     cedricgriffiths
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
function externalIdsAfterSubmit(type)
{
	var context = nlapiGetContext();
	
	if(context.getExecutionContext() == 'userinterface')
		{
			if(type == 'create' || type == 'edit')
				{
					var newRecord = nlapiGetNewRecord();
					var currentId = newRecord.getId();
					var currentType = newRecord.getRecordType();
					
					var thisRecord = null;
					
					try
						{
							thisRecord = nlapiLoadRecord(currentType, currentId);
						}
					catch(err)
						{
							thisRecord = null;
							nlapiLogExecution('ERROR', 'Error trying to read record (' + currentType + ') (' + currentId + ')', err.message);
						}
					
					if(thisRecord != null)
						{
							var externalId = '';
							
							switch(currentType)
								{
									case 'customer':
									case 'vendor':
										
										externalId = isNull(thisRecord.getFieldValue('accountnumber'),'');
										
										break;
								}
							
							thisRecord.setFieldValue('externalid', externalId);
							
							try
								{
									nlapiSubmitRecord(thisRecord, false, true);
								}
							catch(err)
								{
									nlapiLogExecution('ERROR', 'Error saving record after updating externalid (' + currentType + ') (' + currentId + ')', err.message);
									
									throw nlapiCreateError('BBS_DUPLICATE_EXTERNAL_ID', 'ERROR - Duplicate External Id Detected', true);
								}
						}
				}
		}
}

function isNull(_string, _replacer)
{
	if(_string == null)
		{
			return _replacer;
		}
	else
		{
			return _string;
		}
}

