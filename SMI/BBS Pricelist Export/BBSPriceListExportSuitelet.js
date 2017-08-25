/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       25 Aug 2017     cedricgriffiths
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response)
{
	//=============================================================================================
	//Start of main code
	//=============================================================================================
	//
	
	//Local Variables
	//
	var fileName = '';
	var fileContents = '';
	var priceListArray = {};
	
	//Get the parameters
	//
	var customerId = request.getParameter('customerid');

	//Read the customer record
	//
	var customerRecord = nlapiLoadRecord('customer', customerId);
	
	//Check to see if we have a customer record
	//
	if (customerRecord)
		{
			//Get the price level & name from the customer
			//
			var customerPriceLevel = customerRecord.getFieldValue('pricelevel');
			var customerName = customerRecord.getFieldValue('companyname');
			
			if (customerPriceLevel == null || customerPriceLevel == '')
				{
					customerPriceLevel = 1;
				}
			
			//Get the currency from the customer
			//
			var customerCurrencyId = customerRecord.getFieldValue('currency');
			var currencyRecord = nlapiLoadRecord('currency', customerCurrencyId);
			var currencyName = currencyRecord.getFieldValue('name');
			var currencySymbol = currencyRecord.getFieldValue('symbol');
			
			//Set the export file name 
			//
			fileName = 'Price List ' + customerName + ' ' + currencySymbol + '.csv';
			
			//Now see if the customer has specific item pricing
			//
			var customerItemsCount = customerRecord.getLineItemCount('itempricing');
			
			for (var int = 1; int <= customerItemsCount; int++) 
			{
				//Get the values from the item pricing
				//
				var itemId = customerRecord.getLineItemValue('itempricing', 'item', int);
				var itemText = customerRecord.getLineItemText('itempricing', 'item', int);
				var itemPrice = customerRecord.getLineItemValue('itempricing', 'price', int);
				var itemLevel = customerRecord.getLineItemValue('itempricing', 'level', int);
				
				if (!priceListArray[itemId])
					{
						//See if we are using a custom price
						//
						if (itemLevel == -1)
							{
								priceListArray[itemId] = [itemId,itemText,itemPrice,0,0,0,0,0,0,0,0,0,0,0] //itemId, ItemText, ItemPrice*6,BreakQty*6 
		
							}
						else
							{
								//If not then we need to go & get the item & then look at the price level that is relevant
								//
								priceListArray[itemId] = getItemPricingData(itemId, customerCurrencyId, itemLevel);
							}
					}
			}
			
			//Now see if the customer has specific item group pricing
			//
			var customerGroupCount = customerRecord.getLineItemCount('grouppricing');
			
			for (var int = 1; int <= customerGroupCount; int++) 
			{
				var groupId = customerRecord.getLineItemValue('grouppricing', 'group', int);
				var levelId = customerRecord.getLineItemValue('grouppricing', 'level', int);
				
				//Now find all products that belong to that group
				//
				var filterArray = [
					               ["isinactive","is","F"], 
					               "AND", 
					               [["type","anyof","InvtPart"],"OR",[["type","anyof","Assembly"],"AND",["parent","noneof","@NONE@"],"AND",["isphantom","is","F"]]],
					               "AND", 
					               ["pricinggroup","anyof",groupId]
					               ];
					
				var searchResultSet = getItems(filterArray);
					
				//Process the returned item data 
				//
				processItemResults(searchResultSet, priceListArray, customerCurrencyId, levelId);
				
			}
			
			//Now look for items that belong to this customer
			//
			var filterArray = [
			               ["isinactive","is","F"], 
			               "AND", 
			               [["type","anyof","InvtPart"],"OR",[["type","anyof","Assembly"],"AND",["parent","noneof","@NONE@"],"AND",["isphantom","is","F"]]],
			               "AND", 
			               ["custitem_bbs_item_customer","anyof",customerId]
			               ];
			
			var searchResultSet = getItems(filterArray);
			
			//Process the returned item data 
			//
			//processItemResults(searchResultSet, priceListArray, customerCurrencyId, customerPriceLevel);
			
		}
	
	//Build the output file
	//
	fileContents = '"Item Id","Item Name","Price 1","Price 2","Price 3","Price 4","Price 5","Price 6","Qty Break 1","Qty Break 2","Qty Break 3","Qty Break 4","Qty Break 5","Qty Break 6"\r\n';
	
	for ( var key in priceListArray) 
	{
		var priceData = priceListArray[key];
		
		for (var int2 = 0; int2 < priceData.length; int2++) 
		{
			fileContents += priceData[int2] + (int2 < (priceData.length - 1) ? ',': '\r\n');
		}
	}
	
	//Return the output file as an attachment
	//
	response.setContentType('PLAINTEXT', fileName, 'attachment');
	response.write(fileContents);
}


function getItemRecordType(girtItemType)
{
	var girtItemRecordType = '';
	
	switch(girtItemType)
	{
		case 'InvtPart':
			girtItemRecordType = 'inventoryitem';
			break;
		
		case 'NonInvtPart':
			girtItemRecordType = 'noninventoryitem';
			break;
		
		case 'Assembly':
			girtItemRecordType = 'assemblyitem';
			break;
			
		case 'NonInvtPart':
			girtItemRecordType = 'noninventoryitem';
			break;
	}

	return girtItemRecordType;
}

function getItemPricingData(gipdItemId, gipdItemType, gipdItemDisplayName, gipdCurrencyId, gipdPriceLevel)
{
	var priceArray = null;
	
	//Load the item record
	//
	var itemRecord = nlapiLoadRecord(getItemRecordType(gipdItemType), gipdItemId);
	
	//Get the quantity breaks based on the currency code of the customer
	//
	var itemQtyBreak1 = itemRecord.getFieldValue('price' + gipdCurrencyId.toString() + 'quantity1');
	var itemQtyBreak2 = itemRecord.getFieldValue('price' + gipdCurrencyId.toString() + 'quantity2');
	var itemQtyBreak3 = itemRecord.getFieldValue('price' + gipdCurrencyId.toString() + 'quantity3');
	var itemQtyBreak4 = itemRecord.getFieldValue('price' + gipdCurrencyId.toString() + 'quantity4');
	var itemQtyBreak5 = itemRecord.getFieldValue('price' + gipdCurrencyId.toString() + 'quantity5');
	var itemQtyBreak6 = itemRecord.getFieldValue('price' + gipdCurrencyId.toString() + 'quantity6');
	
	itemQtyBreak1 = (itemQtyBreak1 == null ? 0 : itemQtyBreak1);
	itemQtyBreak2 = (itemQtyBreak2 == null ? 0 : itemQtyBreak2);
	itemQtyBreak3 = (itemQtyBreak3 == null ? 0 : itemQtyBreak3);
	itemQtyBreak4 = (itemQtyBreak4 == null ? 0 : itemQtyBreak4);
	itemQtyBreak5 = (itemQtyBreak5 == null ? 0 : itemQtyBreak5);
	itemQtyBreak6 = (itemQtyBreak6 == null ? 0 : itemQtyBreak6);
	
	//Read the price sublist based on the customer's currency code
	//
	var priceSublist = 'price' + gipdCurrencyId.toString();
	
	var priceLineCount = itemRecord.getLineItemCount(priceSublist);
	var quantityLevels = itemRecord.getMatrixCount(priceSublist, 'price');
	
	priceArray = [gipdItemId,gipdItemDisplayName];
	
	for (var int2 = 1; int2 <= priceLineCount; int2++) 
	{
		var pricePriceLevel = itemRecord.getLineItemValue(priceSublist, 'pricelevel', int2);
		
		if (pricePriceLevel == gipdPriceLevel)
			{
				for ( j=1; j<=quantityLevels; j++)
					{
						var matrixPrice = itemRecord.getLineItemMatrixValue(priceSublist, 'price', int2, j);
						matrixPrice = (matrixPrice == '' ? 0 : matrixPrice);
						priceArray.push(matrixPrice);
					}

				priceArray.push(itemQtyBreak1);
				priceArray.push(itemQtyBreak2);
				priceArray.push(itemQtyBreak3);
				priceArray.push(itemQtyBreak4);
				priceArray.push(itemQtyBreak5);
				priceArray.push(itemQtyBreak6);

				break;
			}
	}
	return priceArray
}

function getItems(giFilterArray)
{
	var itemSearch = nlapiCreateSearch("item", giFilterArray, 
			[
			new nlobjSearchColumn("itemid",null,null), 
			new nlobjSearchColumn("displayname",null,null), 
			new nlobjSearchColumn("salesdescription",null,null),
			new nlobjSearchColumn("type",null,null)
			]
			);
	
	var searchResult = itemSearch.runSearch();
	
	//Get the initial set of results
	//
	var start = 0;
	var end = 1000;
	var searchResultSet = searchResult.getResults(start, end);
	var resultlen = searchResultSet.length;

	//If there is more than 1000 results, page through them
	//
	while (resultlen == 1000) 
		{
				start += 1000;
				end += 1000;

				var moreSearchResultSet = searchResult.getResults(start, end);
				resultlen = moreSearchResultSet.length;

				searchResultSet = searchResultSet.concat(moreSearchResultSet);
		}
	
	return searchResultSet;
}

function processItemResults(pirSearchResultSet, priceListArray, pirCurrencyId, pirPriceLevel)
{
	for (var int = 0; int < pirSearchResultSet.length; int++) 
	{
		//Get the item id & type
		//
		var pirItemId = pirSearchResultSet[int].getId();
		var pirItemType = pirSearchResultSet[int].getValue('type');
		var pirItemDisplayName = pirSearchResultSet[int].getValue('salesdescription');
		
		//Now see if we already have the item in the output array
		//
		if (!priceListArray[pirItemId])
		{
			//Call the routine to get the item price details
			//
			var pirPriceData = getItemPricingData(pirItemId, pirItemType, pirItemDisplayName, pirCurrencyId, pirPriceLevel);
			
			priceListArray[pirItemId] = pirPriceData;

		}
	}
}

