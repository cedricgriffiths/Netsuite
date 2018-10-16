/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 Oct 2018     cedricgriffiths
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
function entityFieldChanged(type, name, linenum)
{
	if(name == 'entity')
		{
			var entityId = nlapiGetFieldValue('entity');
			
			if(entityId != null && entityId != '')
				{
					var entityActions = nlapiLookupField('vendor', entityId, 'custentity_bbsbuyeralert', false);
					
					if(entityActions != null && entityActions != '')
						{
							alert(entityActions);
						}
				}
		}
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function purchasePageInit(type)
{
   if (type == 'edit')
	   {
		   var entityId = nlapiGetFieldValue('entity');
			
			if(entityId != null && entityId != '')
				{
					var entityActions = nlapiLookupField('vendor', entityId, 'custentity_bbsbuyeralert', false);
					
					if(entityActions != null && entityActions != '')
						{
							alert(entityActions);
						}
				}
	   }
}