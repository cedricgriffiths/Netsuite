/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       31 Mar 2017     cedricgriffiths
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


function clientValidateLine(type){
	 
	if (type == 'item')
	{
		var context = nlapiGetContext();
		var versaSubsidiary = context.getSetting('SCRIPT', 'custscript_bbs_versa_subsidiary');
		var spellBeautySubsidiary = context.getSetting('SCRIPT', 'custscript_bbs_spell_beauty_subsidiary');

		var subsiduary = nlapiGetFieldValue('subsidiary');
		
		//If subsidiary is Versa & Spell Beauty then set the Drop Ship flag
		//
		if (subsiduary == versaSubsidiary || subsiduary == spellBeautySubsidiary)
			{
				nlapiSetCurrentLineItemValue('item', 'createpo', 'DropShip', true, true);
			}
	
	}
    return true;
}

