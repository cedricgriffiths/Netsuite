/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       07 Jun 2018     cedricgriffiths
 *
 */

function calculatePricing(assemblyId)
{
	//Variables
	//
	var currencyArray = [];
	var priceLevelArray = [];
	var quantityBreaks = '';
	var pricing = {};
	
	//Get a list of the currency id's
	//
	var currencySearch = nlapiSearchRecord("currency",null,
			[
			 ["isinactive","is","F"]
			],
			[
			 new nlobjSearchColumn("name",null,null),
			 new nlobjSearchColumn("internalid",null,null)
			]);
	
	for (var int = 0; int < currencySearch.length; int++) 
		{
			currencyArray.push(currencySearch[int].getId());
		}
	
	
	//Get a list of the price level id's
	//
	var priceLevelSearch = nlapiSearchRecord("pricelevel",null,
			[
			 ["isinactive","is","F"]
			],
			[
			 new nlobjSearchColumn("name",null,null),
			 new nlobjSearchColumn("internalid",null,null)
			]);
	
	for (var int = 0; int < priceLevelSearch.length; int++) 
		{
			priceLevelArray.push(priceLevelSearch[int].getId());
		}
	
	
	//Get the number of quantity price breaks
	//
	var configRecord = nlapiLoadConfiguration('accountingpreferences');
	quantityBreaks = configRecord.getFieldValue('qtypricecount')
	
	
	//Read the assembly record
	//
	var assemblyRecord = nlapiLoadRecord('assemblyitem', assemblyId);
	var componentCount = assemblyRecord.getLineItemCount('member');
	
	//Loop through the components
	//
	for (var componentLine = 1; componentLine <= componentCount; componentLine++) 
		{
			//Get the line details
			//
			var componentItem = assemblyRecord.getLineItemValue('member', 'item', componentLine);
			var componentItemType = assemblyRecord.getLineItemValue('member', 'sitemtype', componentLine);
			var componentItemQuantity = Number(assemblyRecord.getLineItemValue('member', 'quantity', componentLine));
			
			//Load up the component record
			//
			var componentRecord = nlapiLoadRecord(getItemRecordType(componentItemType), componentItem);
			
			//Process the pricing
			//
			for (var currencyCount = 0; currencyCount < currencyArray.length; currencyCount++) 
				{
					var priceSublistByCurrency = 'price' + currencyArray[currencyCount];
					
					var priceLineCount = componentRecord.getLineItemCount(priceSublistByCurrency);
					var quantityBreakCount = componentRecord.getMatrixCount(priceSublistByCurrency, 'price');
					
					for (var int3 = 1; int3 <= priceLineCount; int3++) 
						{
							var pricePriceLevel = componentRecord.getLineItemValue(priceSublistByCurrency, 'pricelevel', int3);
	
							for (var j=1; j<=quantityBreakCount; j++)
								{
									var matrixPrice = componentRecord.getLineItemMatrixValue(priceSublistByCurrency, 'price', int3, j);
									matrixPrice = (matrixPrice == '' ? 0 : matrixPrice);
									
									var priceKey = padding_left(currencyArray[currencyCount], '0', 6) + padding_left(pricePriceLevel, '0', 6) + padding_left(j.toString(), '0', 6);
									
									if(!pricing[priceKey])
										{
											pricing[priceKey] = (Number(matrixPrice) * componentItemQuantity);
										}
									else
										{
											pricing[priceKey] += (Number(matrixPrice) * componentItemQuantity);
										}
								}
						}
				}			
		}
	
	//Now we need to update the pricing on the assembly record
	//
	for (var currencyCount = 0; currencyCount < currencyArray.length; currencyCount++) 
		{
			var priceSublistByCurrency = 'price' + currencyArray[currencyCount];
			
			var priceLineCount = assemblyRecord.getLineItemCount(priceSublistByCurrency);
			var quantityBreakCount = assemblyRecord.getMatrixCount(priceSublistByCurrency, 'price');
			
			for (var int3 = 1; int3 <= priceLineCount; int3++) 
				{
					var pricePriceLevel = componentRecord.getLineItemValue(priceSublistByCurrency, 'pricelevel', int3);
				
					assemblyRecord.selectLineItem(priceSublistByCurrency, int3);
					
					for (var j=1; j<=quantityBreakCount; j++)
						{
							var priceKey = padding_left(currencyArray[currencyCount], '0', 6) + padding_left(pricePriceLevel, '0', 6) + padding_left(j.toString(), '0', 6);
						
							var newPrice = Number(pricing[priceKey]);
							
							var quantityBreakValue = assemblyRecord.getFieldValue(priceSublistByCurrency + 'quantity' + j.toString());
							
							if(quantityBreakValue != null)
								{
									assemblyRecord.setCurrentLineItemMatrixValue(priceSublistByCurrency, 'price', j, newPrice);
								}
						}
					
					assemblyRecord.commitLineItem(priceSublistByCurrency);
				}
		}
	
	nlapiSubmitRecord(assemblyRecord, false, true);
}



//left padding s with c to a total of n chars
//
function padding_left(s, c, n) 
{
	if (! s || ! c || s.length >= n) 
	{
		return s;
	}
	
	var max = (n - s.length)/c.length;
	
	for (var i = 0; i < max; i++) 
	{
		s = c + s;
	}
	
	return s;
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