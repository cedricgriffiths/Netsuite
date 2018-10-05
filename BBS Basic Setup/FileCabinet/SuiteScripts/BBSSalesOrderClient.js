/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       03 Aug 2016     cedric		   Function to run when the customer is changed on a sales order
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function ARclientPageInit(type) {

	var entityField = nlapiGetFieldValue('entity');
	var bankAccField = nlapiGetFieldValue('custbody_bbs_bank_account');
	var subsidiaryField = nlapiGetFieldValue('subsidiary');

	if ((entityField != null && entityField != '') && (bankAccField == null || bankAccField == '')) {

		if (entityField != null) {

			//Get the customer record
			//
			var entityRecord = nlapiLoadRecord('customer', entityField);

			if (entityRecord != null) {

				//Get the currency field from the customer
				//
				var entityCurrency = entityRecord.getFieldValue('currency');

				if (entityCurrency != null && entityCurrency != '') {

					var defaultAcc = getDefaultAccount(entityCurrency,subsidiaryField);

					nlapiSetFieldValue('custbody_bbs_bank_account', defaultAcc, true, true);

				}
			}
		}
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
function ARclientFieldChanged(type, name, linenum) {

	//Are we changing the entity field?
	//
	if (name == 'entity') {

		var entityField = nlapiGetFieldValue('entity');

		//Does the entity field actually hold any data
		//
		if (entityField != null && entityField != '') {

			//Get the customer record
			//
			var entityRecord = nlapiLoadRecord('customer', entityField);

			if (entityRecord != null) {

				//Get the currency field from the customer
				//
				var entityCurrency = entityRecord.getFieldValue('currency');
				var entitySubsidiary = entityRecord.getFieldValue('subsidiary');

				if (entityCurrency != null && entityCurrency != '') {

					var defaultAcc = getDefaultAccount(entityCurrency, entitySubsidiary);

					nlapiSetFieldValue('custbody_bbs_bank_account', defaultAcc, true, true);

				}
			}
		}
	}

	if (name == 'currency') {

		var salesOrderCurrency = nlapiGetFieldValue('currency');

		if (salesOrderCurrency != null && salesOrderCurrency != '') {

			var subsidiaryField = nlapiGetFieldValue('subsidiary');
			
			var defaultAcc = getDefaultAccount(salesOrderCurrency,subsidiaryField);

			nlapiSetFieldValue('custbody_bbs_bank_account', defaultAcc, true, true);
		}
	}
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function ARclientSaveRecord() {

	var salesOrderCurrency = nlapiGetFieldValue('currency');

	var backAccountId = nlapiGetFieldValue('custbody_bbs_bank_account');

	if (salesOrderCurrency != null && salesOrderCurrency != '' && backAccountId != null && backAccountId != '') {

		var bankRecord = nlapiLoadRecord('customrecord_bbs_bank_list', backAccountId);

		if (bankRecord != null) {

			var bankCurrency = bankRecord.getFieldValue('custrecord_bbs_bank_currency');

			if (bankCurrency != null && bankCurrency != '') {

				if (bankCurrency != salesOrderCurrency) {

					alert('Error: A/R Bank Account Currency Does Not Match Sales Order Currency!');

					return false;
				}
			}
		}
	}

	return true;
}

function getDefaultAccount(searchCurrency, searchSubsidiary) {

	var foundBankId = '';

	//Build a search to find a bank account
	//
	var cols = new Array();
	cols[0] = new nlobjSearchColumn('custrecord_bbs_bank_currency');
	cols[1] = new nlobjSearchColumn('custrecord_bbs_ar_bank');
	cols[2] = new nlobjSearchColumn('custrecord_bbs_default_ar');
	cols[3] = new nlobjSearchColumn('custrecord_bbs_bank_subsidiary');

	//Filter the search by the currency from the customer, a/r bank acc = y & default a/c = y
	//
	var filters = new Array();
	filters[0] = new nlobjSearchFilter('custrecord_bbs_bank_currency', null, 'is', searchCurrency);
	filters[1] = new nlobjSearchFilter('custrecord_bbs_ar_bank', null, 'is', 'T');
	filters[2] = new nlobjSearchFilter('custrecord_bbs_default_ar', null, 'is', 'T');
	
	if (searchSubsidiary)
		{
			filters[3] = new nlobjSearchFilter('custrecord_bbs_bank_subsidiary', null, 'is', searchSubsidiary);
		}

	//Create the search, run it & get the result set 
	//
	var bankSearches = nlapiCreateSearch('customrecord_bbs_bank_list', filters, cols);
	var bankResults = bankSearches.runSearch();
	var bankResultset = bankResults.getResults(0, 100);

	//Did we get any results?
	//
	if (bankResultset != null && bankResultset.length > 0) {

		//Loop through the results (there should only be one anyway)
		//
		for (var int = 0; int < bankResultset.length; int++) {

			//Get the id of the record found
			//
			var foundBankId = bankResultset[int].getId();
		}
	}
	return foundBankId;
}