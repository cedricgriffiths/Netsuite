/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       03 Aug 2016     cedric		   Function to hide the 'default' tick box if not an a/r bank account
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function clientPageInit(type) {

	//Get the value of the a/r bank tick box
	//
	var arBank = nlapiGetFieldValue('custrecord_bbs_ar_bank');

	//If the a/r bank field is unticked, then hide the 'default for a/r field'
	//
	if (arBank != null && arBank == 'F') {

		var defaultAR = nlapiGetField('custrecord_bbs_default_ar');
		defaultAR.setDisplayType('hidden');
	}
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function clientFieldChanged(type, name, linenum) {

	//Are we changing the a/r bank acc tick box?
	//
	if (name == 'custrecord_bbs_ar_bank') {

		//Get the value of the a/r bank field
		//
		var arBank = nlapiGetFieldValue('custrecord_bbs_ar_bank');

		//Get the definition of the 'default for a/r' field
		//
		var defaultAR = nlapiGetField('custrecord_bbs_default_ar');

		//Show or hide the 'default for a/r' field based on the 'a/r bank' tick box
		//
		switch (arBank) {

			case 'T':
				defaultAR.setDisplayType('normal');
				break;

			case 'F':
				defaultAR.setDisplayType('hidden');
				break;
		}
	}
}
