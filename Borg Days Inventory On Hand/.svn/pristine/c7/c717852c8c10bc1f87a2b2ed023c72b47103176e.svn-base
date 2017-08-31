/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       06 May 2016     cedric
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
{
	var FORM_HEADER = 'Days Inventory On Hand';
	var FORM_VERSION_FIELD = 'custpage_version';
	var FORM_VERSION_LABEL = 'Select Version';
	var FORM_SUBMIT_LABEL = 'Export Data';

	var PRDGRP_DAYS_INVENTORY_STOCK_VALUE_ENTITY = 'item';
	var PRDGRP_DAYS_INVENTORY_STOCK_VALUE_SEARCH = 'customsearch_bbs_dio_pg_value';

	var ITEM_DAYS_INVENTORY_STOCK_VALUE_ENTITY = 'item';
	var ITEM_DAYS_INVENTORY_STOCK_VALUE_SEARCH = 'customsearch_bbs_dio_items_value';

	var PRDGRP_DAYS_INVENTORY_COGS_ENTITY = 'transaction';
	var PRDGRP_DAYS_INVENTORY_COGS_SEARCH = 'customsearch_bbs_dio_pg_cogs';

	var ITEM_DAYS_INVENTORY_COGS_ENTITY = 'transaction';
	var ITEM_DAYS_INVENTORY_COGS_SEARCH = 'customsearch_bbs_dio_item_cogs';

	var PRDGRP_KEY_FIELD = 'custitem_bbs_product_group';
	var ITEM_KEY_FIELD = 'itemid';
	var ITEM_KEY_FIELD2 = 'item';
	var ITEM_DESCRIPTION_FIELD = 'salesdescription';

	var COLS_ITEM = Number(0);
	var COLS_ITEMVAL = Number(1);
	var COLS_DAYS = Number(2);
	var COLS_COGS = Number(3);
	var COLS_DIOH = Number(4);
	var COLS_ITEMDESC = Number(5);
	var COLS_ITEMPRDGRP = Number(6);

}

function getFullResults(entity, search) {

	//Copy the existing saved search so we can page through it
	//
	var origSearch = nlapiLoadSearch(entity, search);
	var newSearch = nlapiCreateSearch(origSearch.getSearchType(), origSearch.getFilters(), origSearch.getColumns());
	var searchResult = newSearch.runSearch();

	//Get the initial set of results
	//
	var start = 0;
	var end = 1000;
	var searchResultSet = searchResult.getResults(start, end);
	var resultlen = searchResultSet.length;

	//If there is more than 1000 results, page through them
	//
	while (resultlen == 1000) {

		start += 1000;
		end += 1000;

		var moreSearchResultSet = searchResult.getResults(start, end);
		resultlen = moreSearchResultSet.length;

		searchResultSet = searchResultSet.concat(moreSearchResultSet);
	}

	return searchResultSet;

}

function DaysInventoryOnHandSuitelet(request, response) {

	if (request.getMethod() == 'GET') {

		var form = nlapiCreateForm(FORM_HEADER);

		var versionField = form.addField(FORM_VERSION_FIELD, 'select', FORM_VERSION_LABEL);
		versionField.addSelectOption('1', 'Analysis By Product Group', true);
		versionField.addSelectOption('2', 'Analysis By Item Code', false);

		form.addSubmitButton(FORM_SUBMIT_LABEL);

		response.writePage(form);
	}
	else {

		//Get the version of the extract
		//
		var versionNumber = request.getParameter(FORM_VERSION_FIELD);
		var ITEM_RESULTSET_ENTITY = '';
		var ITEM_RESULTSET_SEARCH = '';

		var COGS_RESULTSET_ENTITY = '';
		var COGS_RESULTSET_SEARCH = '';

		var ITEM_RESULTSET_KEY_FIELD = '';
		var COGS_RESULTSET_KEY_FIELD = '';

		switch (versionNumber) {

			case '1':
				ITEM_RESULTSET_ENTITY = PRDGRP_DAYS_INVENTORY_STOCK_VALUE_ENTITY;
				ITEM_RESULTSET_SEARCH = PRDGRP_DAYS_INVENTORY_STOCK_VALUE_SEARCH;
				COGS_RESULTSET_ENTITY = PRDGRP_DAYS_INVENTORY_COGS_ENTITY;
				COGS_RESULTSET_SEARCH = PRDGRP_DAYS_INVENTORY_COGS_SEARCH;
				ITEM_RESULTSET_KEY_FIELD = PRDGRP_KEY_FIELD;
				COGS_RESULTSET_KEY_FIELD = PRDGRP_KEY_FIELD;

				break;

			case '2':
				ITEM_RESULTSET_ENTITY = ITEM_DAYS_INVENTORY_STOCK_VALUE_ENTITY;
				ITEM_RESULTSET_SEARCH = ITEM_DAYS_INVENTORY_STOCK_VALUE_SEARCH;
				COGS_RESULTSET_ENTITY = ITEM_DAYS_INVENTORY_COGS_ENTITY;
				COGS_RESULTSET_SEARCH = ITEM_DAYS_INVENTORY_COGS_SEARCH;
				ITEM_RESULTSET_KEY_FIELD = ITEM_KEY_FIELD;
				COGS_RESULTSET_KEY_FIELD = ITEM_KEY_FIELD2;

				break;
		}

		var rows = {};

		//Get the data for the items/product groups here
		//
		var productsResultSet = getFullResults(ITEM_RESULTSET_ENTITY, ITEM_RESULTSET_SEARCH);

		if (productsResultSet) {

			//Loop round all of the products in the result set
			//
			for (var int = 0; int < productsResultSet.length; int++) {

				//Product key is the item/product group
				//
				var productKey = '';

				switch (versionNumber) {
					case '1':
						productKey = productsResultSet[int].getText(ITEM_RESULTSET_KEY_FIELD, null, 'group');
						break;

					case '2':
						productKey = productsResultSet[int].getValue(ITEM_RESULTSET_KEY_FIELD);
						break;
				}

				//Some dummy data for the data element of the key/value pair
				//
				var cols = [ 0, 0, 0, 0, 0, '', '' ]; //Need to define how many columns we need (item, itemval, days, cogs, dioh, item description, item product group)

				cols[COLS_ITEM] = productKey;

				switch (versionNumber) {
					case '1':
						cols[COLS_ITEMVAL] = productsResultSet[int].getValue('formulacurrency', null, 'sum');
						break;

					case '2':
						cols[COLS_ITEMVAL] = productsResultSet[int].getValue('formulacurrency');
						cols[COLS_ITEMDESC] = productsResultSet[int].getValue(ITEM_DESCRIPTION_FIELD);
						cols[COLS_ITEMPRDGRP] = productsResultSet[int].getText(PRDGRP_KEY_FIELD);
						break;
				}

				//Add the empty column data as the 'value' element to the key-value pair
				//
				rows[productKey] = cols;

			}
		}

		//Process COGS
		//
		var cogsResultSet = getFullResults(COGS_RESULTSET_ENTITY, COGS_RESULTSET_SEARCH);

		if (cogsResultSet) {

			for (var int = 0; int < cogsResultSet.length; int++) {

				// Get the required fields
				//
				switch (versionNumber) {
					case '1':
						productKey = cogsResultSet[int].getText(COGS_RESULTSET_KEY_FIELD, 'Item', 'group');
						break;

					case '2':
						productKey = cogsResultSet[int].getText(COGS_RESULTSET_KEY_FIELD, null, 'group');
						break;
				}

				var days = cogsResultSet[int].getValue('formulanumeric', null, 'min');
				var amount = Number(cogsResultSet[int].getValue('amount', null, 'sum'));

				//Try to find the product/date in the key-value pair & update the due in
				//
				if (rows[productKey]) {

					rows[productKey][COLS_DAYS] = days;
					rows[productKey][COLS_COGS] = amount;
				}
			}
		}

		//Calculate the DIOH by looping through the array
		//

		for ( var key in rows) {

			var daysInMonth = Number(rows[key][COLS_DAYS]);
			var cogsValue = Number(rows[key][COLS_COGS]);
			var itemValue = Number(rows[key][COLS_ITEMVAL]);
			var diohValue = Number(0);

			if (daysInMonth != 0 && itemValue != 0 && cogsValue != 0) {

				diohValue = parseFloat(daysInMonth / (cogsValue / itemValue)).toFixed(2);
				rows[key][COLS_DIOH] = diohValue;
			}
		}

		//Extract out the data array to a string & then return as a csv
		//
		var contents = '';

		switch (versionNumber) {
			case '1':
				contents = 'Product Group,Days,COGS,Product Group Value,Days Stock\r\n';
				break;

			case '2':
				contents = 'Item,Item Description,Item Product Group,Days,COGS,Item Value,Days Stock\r\n';
				break;
		}

		for ( var key in rows) {
			var keyString = key;

			switch (versionNumber) {
				case '1':

					contents += quote(rows[key][COLS_ITEM]) + ',' + rows[key][COLS_DAYS] + ',' + rows[key][COLS_COGS] + ',' + rows[key][COLS_ITEMVAL] + ',' + rows[key][COLS_DIOH] + '\r\n';
					break;

				case '2':

					contents += quote(rows[key][COLS_ITEM]) + ',' + quote(rows[key][COLS_ITEMDESC]) + ',' + quote(rows[key][COLS_ITEMPRDGRP]) + ',' + rows[key][COLS_DAYS] + ',' + rows[key][COLS_COGS] + ',' + rows[key][COLS_ITEMVAL] + ',' + rows[key][COLS_DIOH] + '\r\n';
					break;
			}

		}

		// Send back the output in the respnse message
		//
		response.setContentType('CSV', 'DaysInventoryOnHand.csv', 'attachment');
		response.write(contents);
	}
}

function quote(input) {

	return '"' + input.replace(new RegExp('"', 'g'), ' ') + '"';
}