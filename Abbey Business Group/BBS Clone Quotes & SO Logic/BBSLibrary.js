/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       09 Feb 2017     cedricgriffiths
 *
 */
function LibPrintProject()
{
	// Get the relative url of the suitelet 
	//
	var url = nlapiResolveURL('SUITELET', 'customscript_bbs_print_proj_docs', 'customdeploy_bbs_print_proj_docs');

	// Get the id of the current record
	//
	var recordId = nlapiGetRecordId();

	// Add the id as a query param to the url
	//
	url += '&salesorderid=' + recordId;

	// Open the print in a new window
	//
	window.open(url, '_blank', 'Project Print', 'toolbar=no, scrollbars=no, resizable=no');
}

function LibCloneQuote() {
	
	//Variable definitions
	//
	var newReference = '';
	var thisRecordType = nlapiGetRecordType();
	var thisRecordId = nlapiGetRecordId();
	var referenceFieldName = 'custbody_bbs_quote_ref';
	var parentFieldName = 'custbody_bbs_parent_id';

	if (thisRecordId != null && thisRecordId != '')
		{
	var thisRecord = nlapiLoadRecord('estimate', thisRecordId);
	
	// Get the current reference
	//
	var thisReference = thisRecord.getFieldValue(referenceFieldName);
	
	// Only process records where there is something in the reference
	//
	if (thisReference.length > 0) {
		
		// See if the reference contains a slash
		//
		var slashPosition = thisReference.indexOf('/', 0);

		// If there is no full slash, then the new ref will be the old ref + '/1'
		//
		if (slashPosition == -1) {
			
			newReference = thisReference.concat('/1');
		}
		else {
			// If there is a slash, then find what is after it
			//

			// Get the suffix
			//
			var suffix = thisReference.slice(slashPosition + 1, thisReference.length);

			// Is the suffix a number?
			//
			if (isNaN(suffix)) {
				
				// The suffix is not a number
				//
				alert('Cannot clone as reference has a non numeric suffix');

				return;
			}
			else {
				// The suffix is a number
				//

				// Increment the suffix number
				//
				suffix++;

				// Build up the new reference
				//
				newReference = thisReference.slice(0, slashPosition + 1) + suffix.toString();
			}
		}

		//Search to see if the new reference already exists
		//
		var cols = new Array();
		cols[0] = new nlobjSearchColumn(referenceFieldName);

		//Filter the search 
		//
		var filters = new Array();
		filters[0] = new nlobjSearchFilter(referenceFieldName, null, 'is', newReference);

		//Create, run & get the results for the search
		//
		var recordSearches = nlapiCreateSearch(thisRecordType, filters, cols);
		var recordResults = recordSearches.runSearch();
		var recordResultset = recordResults.getResults(0, 100);

		//Did we get any results?
		//
		if (recordResultset != null && recordResultset.length > 0) {

			alert('This record has already been cloned to ' + newReference + ' - Clone aborted!');
		}
		else {

				// Copy the record
				var newRecord = nlapiCopyRecord(thisRecordType, thisRecordId);

				// Set the new reference
				//
				newRecord.setFieldValue(referenceFieldName, newReference);

				// Set the new status
				//
				newRecord.setFieldValue('entitystatus', '10');

				//Set the parent id
				//
				newRecord.setFieldValue(parentFieldName, thisRecordId);
				
				// Commit the clone
				//
				var newRecordId = nlapiSubmitRecord(newRecord, false, false);

				// Notify the user the copy has completed
				//
				alert('Record has been cloned to ' + newReference);
			}
		}
	else
		{
		alert('Record has no reference number - Clone aborted!');
		
		}
	}
	else
		{
		alert('Cannot clone an unsaved record - Clone aborted!');
		}
}

function LibProcessFieldChanges(type, name, linenum, unitCostField, soFlag)
{
	// Make sure we are working with items
	//
	if (type == 'item')
	{
		// Get the item from the line
		//
		var itemItem = nlapiGetCurrentLineItemValue(type, 'item');

		// We only want to continue if we have a line item entered
		//
		if (itemItem != null && itemItem != '')
		{
			//Has the currency code changed on the item line
			//
			if (name == 'custcol_bbs_quote_cost_currency')
			{
				//Get the value of the currency on the line
				//
				var itemCurrencyCode = nlapiGetCurrentLineItemValue(type, 'custcol_bbs_quote_cost_currency');
				
				//Get the value of the quote currency
				//
				var quoteCurrencyCode = nlapiGetFieldValue('currency');
				
				//Now get the conversion rate between the quote currency & the item currency
				//
				//var itemCurrencyRate = LibGetCurrencyRate(quoteCurrencyCode, itemCurrencyCode);
				
				var itemCurrencyRate = Number(1.0);
				
				if (quoteCurrencyCode != '' && itemCurrencyCode != '')
				{
					itemCurrencyRate = Number(nlapiExchangeRate(quoteCurrencyCode, itemCurrencyCode, nlapiDateToString(new Date())));
					itemCurrencyRate = Number(itemCurrencyRate.toFixed(5));
				}
				
				//Update the item's currency rate
				//
				nlapiSetCurrentLineItemValue(type, 'custcol_bbs_quote_curr_rate', itemCurrencyRate, true, true);
				
			}
			
			//Now calculate the purchase price
			//
			var supplierUnitCost = Number(nlapiGetCurrentLineItemValue(type, 'custcol_bbs_quote_cost'));
			var supplierDiscount = Number(nlapiGetCurrentLineItemValue(type, 'custcol_bbs_quote_discount'));
			var itemPurchasePrice = Number(0);
			
			if (supplierDiscount != 0)
			{
				itemPurchasePrice = supplierUnitCost + ((supplierUnitCost / 100.0) * (supplierDiscount * -1.0));
			}
			else
			{
				itemPurchasePrice = supplierUnitCost; 
			}
			
			nlapiSetCurrentLineItemValue(type, 'custcol_bbs_quote_purchase_price', itemPurchasePrice, false, true);
			
			if (soFlag)
			{
				nlapiSetCurrentLineItemValue(type, 'porate', itemPurchasePrice, false, true);
			}
			
			//Now calculate the total line cost
			//
			var itemQuantity = Number(nlapiGetCurrentLineItemValue(type, 'quantity'));
			//var itemPurchasePrice = Number(nlapiGetCurrentLineItemValue(type, 'custcol_bbs_quote_purchase_price'));
			var itemCurrencyRate = Number(nlapiGetCurrentLineItemValue(type, 'custcol_bbs_quote_curr_rate'));
			
			if (itemCurrencyRate == 0)
			{
				itemCurrencyRate = Number(1.0);
			}
			
			var itemTotalCost = itemQuantity * itemPurchasePrice * itemCurrencyRate;
			
			nlapiSetCurrentLineItemValue(type, 'custcol_bbs_line_cost', itemTotalCost, false, true);
			
			//Calculate the sales margin
			//
			if (name != 'custcol_bbs_sales_margin')
			{
				var itemAmount = Number(nlapiGetCurrentLineItemValue(type, 'amount'));
				var itemTotalCost = Number(nlapiGetCurrentLineItemValue(type, 'custcol_bbs_line_cost'));
				var itemAltPrice = Number(nlapiGetCurrentLineItemValue(type, 'custcol_bbs_quote_altprice'));
				
				var itemMargin = Number(0);
				
				if (itemTotalCost != 0)
					{
						if (itemAltPrice != 0)
							{
								itemMargin = (itemAltPrice - itemTotalCost) / itemAltPrice;
							}
						
						if (itemAmount != 0)
							{
								itemMargin = (itemAmount - itemTotalCost) / itemAmount;
							}
					
				
						itemMargin = itemMargin * 100.0;
				
						nlapiSetCurrentLineItemValue(type, 'custcol_bbs_sales_margin', itemMargin, false, true);
					}
			}
			
			//If the margin has been changed manually, then re-calculate
			//
			if (name == 'custcol_bbs_sales_margin')
			{
				var itemTotalCost = Number(nlapiGetCurrentLineItemValue(type, 'custcol_bbs_line_cost'));
				var itemMargin = Number(nlapiGetCurrentLineItemValue(type, 'custcol_bbs_sales_margin')) / 100.0;
				var itemAltPrice = Number(nlapiGetCurrentLineItemValue(type, 'custcol_bbs_quote_altprice'));
				var itemQuantity = Number(nlapiGetCurrentLineItemValue(type, 'quantity'));
				var itemAmount = Number(nlapiGetCurrentLineItemValue(type, 'amount'));
				
				
				if (itemAltPrice != 0)
				{
					var newPrice = itemTotalCost / (1.0 - itemMargin);
					nlapiSetCurrentLineItemValue(type, 'custcol_bbs_quote_altprice', newPrice, false, true);
				}

				if(itemAmount != 0)
				{
					var newPrice = itemTotalCost / (1.0 - itemMargin);
					var newUnitPrice = newPrice / itemQuantity;
				
					nlapiSetCurrentLineItemValue(type, 'rate', newUnitPrice, false, true);
				}
			}
		}
	}
}

function LibGetCurrencyRate(baseCurrency, transactionCurrency) 
{
	var exchangeRate = Number(1);
	
	var cols = new Array();
	cols[0] = new nlobjSearchColumn('basecurrency');
	cols[1] = new nlobjSearchColumn('transactioncurrency');
	cols[2] = new nlobjSearchColumn('exchangerate');

	var dateCol = new nlobjSearchColumn('effectivedate');
	dateCol.setSort(true);
	cols[3] = dateCol;

	var today = new Date();
	var todayStr = nlapiDateToString(today);

	var filters = new Array();
	filters[0] = new nlobjSearchFilter('basecurrency', null, 'is', baseCurrency);
	filters[1] = new nlobjSearchFilter('transactioncurrency', null, 'is', transactionCurrency);
	filters[2] = new nlobjSearchFilter('effectivedate', null, 'onorbefore', todayStr);

	var recordSearches = nlapiCreateSearch('currencyrate', filters, cols);
	var recordResults = recordSearches.runSearch();
	var recordResultset = recordResults.getResults(0, 1);
	
	if (recordResultset != null && recordResultset.length > 0)
		{
			exchangeRate = Number(recordResultset[0].getValue('exchangerate'));
		}
	
	return exchangeRate;
}

function LibSalesOrderInit()
{
	// Find out where the sales order was created from
	//
	var createdFrom = nlapiGetFieldValue('createdfrom');

	// If we were created from something, find out what
	//
	if (createdFrom != null && createdFrom != '')
	{
		var originalRecord = null;

		try
		{
			// Were we from a quote (estimate)
			//
			originalRecord = nlapiLoadRecord('estimate', createdFrom);

		}
		catch (err)
		{	
				originalRecord = null;
		}

		// Have we found where we have come from?
		//
		if (originalRecord != null)
		{
			// Get the record type that we have come from
			//
			var originalType = originalRecord.getRecordType();

			// How many lines are on the sales order
			//
			var lineCount = nlapiGetLineItemCount('item');

			// Loop through all the lines
			//
			for (var lineNo = 1; lineNo <= lineCount; lineNo++)
			{
				// Set the current line
				//
				nlapiSelectLineItem('item', lineNo);

				// Get the supplier from the original record
				//
				var originalSupplier = originalRecord.getLineItemValue('item', 'custcol_bbs_quote_supplier', lineNo);

				// Get the supplier from the sales order
				//
				var salesOrderSupplier = nlapiGetLineItemValue('item', 'povendor', lineNo);

				// Compare the two suppliers
				//
				if (originalSupplier != salesOrderSupplier)
				{
					nlapiSetCurrentLineItemValue('item', 'povendor', originalSupplier, false, true);
				}
				
				// Get the supplier unit cost from the original record
				//
				var originalSupplierUnitCost = Number(originalRecord.getLineItemValue('item', 'custcol_bbs_quote_purchase_price', lineNo));

				// Update the po rate with the new supplier cost
				//
				if (originalSupplierUnitCost != NaN && originalSupplierUnitCost != 0)
				{
					nlapiSetCurrentLineItemValue('item', 'porate', originalSupplierUnitCost, false, true);
				}

				
				
				// Commit the current line
				//
				nlapiCommitLineItem('item');
			}
		}
	}
}
