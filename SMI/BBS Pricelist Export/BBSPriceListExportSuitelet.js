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
				
				//See if we are using a custom price
				//
				if (itemLevel == -1)
					{
						if (!priceListArray[itemId])
							{
								priceListArray[itemId] = [itemId,itemText,itemPrice,0,0,0,0,0,0,0,0,0,0,0] //itemId, ItemText, ItemPrice*6,BreakQty*6 
							}
					}
				else
					{
						//If not then we need to go & get the item & then look at the price level that is relevant
						//
						priceListArray[itemId] = getItemPricingData(itemId, customerCurrencyId, itemLevel);
					
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
			
			//Now loop through the items found
			//
			for (var int = 0; int < searchResultSet.length; int++) 
			{
				//Get the item id & type
				//
				var itemId = searchResultSet[int].getId();
				var itemType = searchResultSet[int].getValue('type');
				var itemDisplayName = searchResultSet[int].getValue('salesdescription');
				
				//Now see if we already have the iutem in the output array
				//
				if (!priceListArray[itemId])
				{
					//Call the routine to get the item price details
					//
					var priceData = getItemPricingData(itemId, customerCurrencyId, customerPriceLevel);
					
					priceListArray[itemId] = priceData;

				}
			}
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


function getItemRecordType(itemType)
{
	var itemRecordType = '';
	
	switch(itemType)
	{
		case 'InvtPart':
			itemRecordType = 'inventoryitem';
			break;
		
		case 'NonInvtPart':
			itemRecordType = 'noninventoryitem';
			break;
		
		case 'Assembly':
			itemRecordType = 'assemblyitem';
			break;
			
		case 'NonInvtPart':
			itemRecordType = 'noninventoryitem';
			break;
	}

	return itemRecordType;
}

function getItemPricingData(itemId, customerCurrencyId, customerPriceLevel)
{
	var priceArray = null;
	
	//Load the item record
	//
	var itemRecord = nlapiLoadRecord(getItemRecordType(itemType), itemId);
	
	//Get the quantity breaks based on the currency code of the customer
	//
	var itemQtyBreak1 = itemRecord.getFieldValue('price' + customerCurrencyId.toString() + 'quantity1');
	var itemQtyBreak2 = itemRecord.getFieldValue('price' + customerCurrencyId.toString() + 'quantity2');
	var itemQtyBreak3 = itemRecord.getFieldValue('price' + customerCurrencyId.toString() + 'quantity3');
	var itemQtyBreak4 = itemRecord.getFieldValue('price' + customerCurrencyId.toString() + 'quantity4');
	var itemQtyBreak5 = itemRecord.getFieldValue('price' + customerCurrencyId.toString() + 'quantity5');
	var itemQtyBreak6 = itemRecord.getFieldValue('price' + customerCurrencyId.toString() + 'quantity6');
	
	itemQtyBreak1 = (itemQtyBreak1 == null ? 0 : itemQtyBreak1);
	itemQtyBreak2 = (itemQtyBreak2 == null ? 0 : itemQtyBreak2);
	itemQtyBreak3 = (itemQtyBreak3 == null ? 0 : itemQtyBreak3);
	itemQtyBreak4 = (itemQtyBreak4 == null ? 0 : itemQtyBreak4);
	itemQtyBreak5 = (itemQtyBreak5 == null ? 0 : itemQtyBreak5);
	itemQtyBreak6 = (itemQtyBreak6 == null ? 0 : itemQtyBreak6);
	
	//Read the price sublist based on the customer's currency code
	//
	var priceSublist = 'price' + customerCurrencyId.toString();
	
	var priceLineCount = itemRecord.getLineItemCount(priceSublist);
	
	for (var int2 = 1; int2 <= priceLineCount; int2++) 
	{
		var pricePriceLevel = itemRecord.getLineItemValue(priceSublist, 'pricelevel', int2);
		
		if (pricePriceLevel == customerPriceLevel)
			{
				var pricePrice1 = nlapiGetLineItemValue(priceSublist, 'price[1]', int2);
				var pricePrice2 = nlapiGetLineItemValue(priceSublist, 'price[2]', int2);
				var pricePrice3 = nlapiGetLineItemValue(priceSublist, 'price[3]', int2);
				var pricePrice4 = nlapiGetLineItemValue(priceSublist, 'price[4]', int2);
				var pricePrice5 = nlapiGetLineItemValue(priceSublist, 'price[5]', int2);
				var pricePrice6 = nlapiGetLineItemValue(priceSublist, 'price[6]', int2);
				
				pricePrice1 = (pricePrice1 == null ? 0 : pricePrice1);
				pricePrice2 = (pricePrice2 == null ? 0 : pricePrice2);
				pricePrice3 = (pricePrice3 == null ? 0 : pricePrice3);
				pricePrice4 = (pricePrice4 == null ? 0 : pricePrice4);
				pricePrice5 = (pricePrice5 == null ? 0 : pricePrice5);
				pricePrice6 = (pricePrice6 == null ? 0 : pricePrice6);
				
				priceArray = [itemId,itemDisplayName,pricePrice1,pricePrice2,pricePrice3,pricePrice4,pricePrice5,pricePrice6,itemQtyBreak1,itemQtyBreak2,itemQtyBreak3,itemQtyBreak4,itemQtyBreak5,itemQtyBreak6] //itemId, ItemText, ItemPrice*6,BreakQty*6 

				break;
			}
	}
	return priceArray
}

function getItems(filterArray)
{
	var itemSearch = nlapiCreateSearch("item", filterArray, 
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
