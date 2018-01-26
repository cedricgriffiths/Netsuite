/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       26 Jan 2018     cedricgriffiths
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
function addresseeChangedBS(type)
{
	if(type == 'edit')
		{
			var oldRecord = nlapiGetOldRecord();
			var oldName = oldRecord.getFieldValue('companyname');
			var newName = nlapiGetFieldValue('companyname');
			
			if(oldName != newName)
				{
					var lines = nlapiGetLineItemCount('addressbook');
					
					for (var int = 1; int <= lines; int++) 
						{
							nlapiSelectLineItem('addressbook', int);
							var addressSubrecord = nlapiEditCurrentLineItemSubrecord('addressbook','addressbookaddress');
							
							if(addressSubrecord)
								{
									addressSubrecord.setFieldValue('addressee', newName);
									addressSubrecord.commit();
									
									nlapiCommitLineItem('addressbook');
								}
						}
				}
		}
}
