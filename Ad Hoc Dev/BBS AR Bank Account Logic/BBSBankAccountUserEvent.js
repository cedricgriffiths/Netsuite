/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       03 Aug 2016     cedric		   Function that gets called after save of a bank account record
 * 											   to make sure there is only ever one default for that currency
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function userEventAfterSubmit(type) {

	//Are we in create or edit mode?
	//
	if (type == 'create' || type == 'edit') {

		//Get the 'after image' version of the saved bank account record
		//
		var bankRecord = nlapiGetNewRecord();

		//Get the currency, a/r bank & default for a/r fields, as well as the id of the saved record
		//
		var bankCurrency = bankRecord.getFieldValue('custrecord_bbs_bank_currency');
		var bankAR = bankRecord.getFieldValue('custrecord_bbs_ar_bank');
		var bankDefaultAR = bankRecord.getFieldValue('custrecord_bbs_default_ar');
		var bankSubsidiary = bankRecord.getFieldValue('custrecord_bbs_bank_subsidiary');
		var bankID = bankRecord.getId();

		//Has the default for a/r been set on this record?
		//
		if (bankDefaultAR == 'T') {

			//Build a search on the bank account records
			//
			var cols = new Array();
			cols[0] = new nlobjSearchColumn('custrecord_bbs_bank_currency');
			cols[1] = new nlobjSearchColumn('custrecord_bbs_ar_bank');
			cols[2] = new nlobjSearchColumn('custrecord_bbs_default_ar');
			cols[3] = new nlobjSearchColumn('custrecord_bbs_bank_subsidiary');

			//Filter the search by currency, a/r bank = y & default for a/r = y
			//
			var filters = new Array();
			filters[0] = new nlobjSearchFilter('custrecord_bbs_bank_currency', null, 'is', bankCurrency);
			filters[1] = new nlobjSearchFilter('custrecord_bbs_ar_bank', null, 'is', bankAR);
			filters[2] = new nlobjSearchFilter('custrecord_bbs_default_ar', null, 'is', bankDefaultAR);
			filters[3] = new nlobjSearchFilter('custrecord_bbs_bank_subsidiary', null, 'is', bankSubsidiary);

			//Create, run & get the results for the search
			//
			var bankSearches = nlapiCreateSearch('customrecord_bbs_bank_list', filters, cols);
			var bankResults = bankSearches.runSearch();
			var bankResultset = bankResults.getResults(0, 100);

			//Did we get any results?
			//
			if (bankResultset != null && bankResultset.length > 0) {

				//Loop through the results
				//
				for (var int = 0; int < bankResultset.length; int++) {

					//Get the id of the record we are currently working on
					//
					var foundBankId = bankResultset[int].getId();

					//If the record we are working on is not the same as the one we have just saved, then proceed
					//
					if (foundBankId != bankID) {

						//Load the bank account record
						//
						var foundBankRecord = nlapiLoadRecord('customrecord_bbs_bank_list', foundBankId)

						//Set the default for a/r to false
						//
						foundBankRecord.setFieldValue('custrecord_bbs_default_ar', 'F');

						//Save the bank account record
						//
						nlapiSubmitRecord(foundBankRecord, false, true);
					}
				}
			}
		}
	}
}
