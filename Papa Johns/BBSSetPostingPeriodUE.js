/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       25 Sep 2018     cedricgriffiths
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
function userEventBeforeSubmit(type)
{
	if(type == 'edit')
		{
			var oldRecord = nlapiGetOldRecord();
			var newRecord = nlapiGetNewRecord();
			
			var oldStatus = oldRecord.getFieldValue('');
			var newStatus = newRecord.getFieldValue('');
			
			if(oldStatus != newStatus && newStatus == '')
				{
				
				}
		}
}

function setPostingPeriod()
{

	try
		{
			var stType = nlapiGetRecordType();
			stType = stType.toUpperCase();
			
			if(stType == 'VENDORBILL')
				{  
					var stpostPeriod = nlapiGetFieldValue('postingperiod');
					var stSubsidiary = nlapiGetFieldValue('subsidiary');
					
					if(!stpostPeriod)
						{
							var objRec = nlapiLoadRecord(stType, nlapiGetRecordId());
							stpostPeriod = objRec.getFieldValue('postingperiod');
							stSubsidiary = objRec.getFieldValue('subsidiary');
						}
							
					var objResults = nlapiSearchRecord('accountingperiod', null,
							[
							 new nlobjSearchFilter( 'internalidnumber', null, 'greaterthanorequalto', stpostPeriod ),
							 new nlobjSearchFilter( 'aplocked', null, 'is', 'F' ),
							 new nlobjSearchFilter( 'isquarter', null, 'is', 'F' )
							],
							new nlobjSearchColumn( 'internalid' ).setSort());
					
					for(var i=0; i < objResults.length; i++)
						{
							var stPeriod = objResults[i].getId();
							var arrFilters = [];
							
							arrFilters.push(new nlobjSearchFilter( 'itemtype', null, 'anyof', ['PCP_LOCK_AP']));   
							arrFilters.push(new nlobjSearchFilter( 'period', null, 'abs', stPeriod));
							
							if(stSubsidiary)
								{
									arrFilters.push(new nlobjSearchFilter( 'subsidiary', null, 'anyof', [stSubsidiary]));
								}
							
							var objSearchPeriod = nlapiSearchRecord('taskitemstatus', null,arrFilters,
									new nlobjSearchColumn( 'complete' ));
							
							var bResultFound = false;
							
							if(objSearchPeriod)
								{
									if(objSearchPeriod.length > 0)
										{      
											var bComplete = objSearchPeriod[0].getValue('complete');
											
											if(bComplete != 'T')
												{
													nlapiSetFieldValue('postingperiod',stPeriod);
													return stPeriod;
												}
											
											bResultFound = true;
										}
								}
							
							if(!bResultFound)
								{
									nlapiSetFieldValue('postingperiod',stPeriod);
									return stPeriod;
								}
						}
				}
		}
	catch(error)
		{ 
			
		}
	
	  return '';
}

