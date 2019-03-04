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
										
										externalId = isNull(thisRecord.getFieldValue('custentity_ext_id'),'');
										
										break;
										
									case 'account':
		
										externalId = isNull(thisRecord.getFieldValue('custrecord_acc_ext_id'),'');
										
										break;
										
									case 'customrecord_csegdm':
		
										externalId = isNull(thisRecord.getFieldValue('custrecord_dm_ext_id'),'');
										
										break;
										
									case 'customrecord_csegsm':
		
										externalId = isNull(thisRecord.getFieldValue('custrecord_sm_ext_id'),'');
										
										break;
										
									case 'subsidiary':
		
										externalId = isNull(thisRecord.getFieldValue('custrecord_sub_ext_id'),'');
										
										break;
										
									case 'noninventoryitem':
		
										externalId = isNull(thisRecord.getFieldValue('custitem_ite_ext_id'),'');
										
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

