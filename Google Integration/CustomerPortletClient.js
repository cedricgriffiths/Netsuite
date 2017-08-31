/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       14 Apr 2016     cedric
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
function clientFieldChanged(type, name, linenum) {

	var CUSTOM_SCRIPT = 'customscript_bbs_cust_googlemap_suitelet';
	var CUSTOM_DEPLOY = 'customdeploy_bbs_cust_googlemap_suitelet';

	var SUITELET = 'SUITELET';

	if (name == 'custpage_select') {

		// Get the field value
		//
		var selectSearch = nlapiGetFieldValue(name);

		// See if we have actually picked a search
		//
		if (selectSearch != null && selectSearch != '') {

			//Read the google search record to find the value of the saved search
			//
			var googleSearchRecord = nlapiLoadRecord('customrecord_bbs_cust_google_searches', selectSearch);

			if (googleSearchRecord != null) {

				//Get the id of the saved search
				//
				var searchId = googleSearchRecord.getFieldValue('custrecord_bbs_cust_saved_search');

				if (searchId != null && searchId != '') {

					//Launch the google maps iframe
					//
					var height = 350;
					var serverUrl = nlapiResolveURL(SUITELET, CUSTOM_SCRIPT, CUSTOM_DEPLOY);
					var html = '<iframe src="' + serverUrl + '&searchid=' + searchId + '" width="100%" align="center"  height="' + (height + 4) + 'px" style="margin:0px; border:0px; padding:0px"></iframe>';

					nlapiSetFieldValue('custpage_text2', html, true, true);
				}
			}
		}
		else {
			var height = 350;
			var serverUrl = nlapiResolveURL(SUITELET, CUSTOM_SCRIPT, CUSTOM_DEPLOY);
			var html = '<iframe src="' + serverUrl + '&searchid=0 " width="100%" align="center"  height="' + (height + 4) + 'px" style="margin:0px; border:0px; padding:0px"></iframe>';

			nlapiSetFieldValue('custpage_text2', html, true, true);
		}
	}
}
