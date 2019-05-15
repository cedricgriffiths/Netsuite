/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 May 2019     cedricgriffiths
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
function copyManifestFieldChanged(type, name, linenum)
{
	if(name == 'custrecord_sector_copy_manifest')
		{
			var fieldValue = nlapiGetFieldValue(name);
			
			if(fieldValue == 'T')
				{
					Ext.Msg.alert('Warning', 'If ticked, then any manifest records associated to this sector will be copied to all other sectors related to this sector\'s fixture when this sector is saved. Any existing manifest records on the other sectors will be replaced.', Ext.emptyFn);
				}
		
		}
}
