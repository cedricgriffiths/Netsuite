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
function itemAfterSubmit(type)
{
	if(type == 'create' || type == 'edit')
		{
			var newRecord = nlapiGetNewRecord();
			var currentId = newRecord.getId();
			var currentType = newRecord.getRecordType();
			
			var itemRecord = null;
			
			try
				{
					itemRecord = nlapiLoadRecord(currentType, currentId);
				}
			catch(err)
				{
					itemRecord = null;
				}
			
			if(itemRecord != null)
				{
					var name = itemRecord.getFieldValue('itemid');
					
					itemRecord.setFieldValue('externalid', name);
					
					try
						{
							nlapiSubmitRecord(itemRecord, false, true);
						}
					catch(err)
						{
						
						}
				}
		}
}


