/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       05 Mar 2017     cedricgriffiths
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
function createAssembliesFieldChanged(type, name, linenum)
{
	//If any of the colour, size1, size2 filters are changed, then get the data from all of those filters for 
	//all of the parent/children & store the data in the session data
	//
	if(name.startsWith('custpage_filter_'))
		{
			var baseParentsString = nlapiGetFieldValue('custpage_baseparents_param');
			var baseParents = JSON.parse(baseParentsString);
			var filters = {};
			
			for ( var baseParentId in baseParents) 
				{
					var coloursSelected = nlapiGetFieldValues('custpage_filter_colour_' + baseParentId.toString());
					var size1sSelected = nlapiGetFieldValues('custpage_filter_size1_' + baseParentId.toString());
					var size2sSelected = nlapiGetFieldValues('custpage_filter_size2_' + baseParentId.toString());
					
					filters[baseParentId] = [coloursSelected,size1sSelected,size2sSelected];
				}
			
			var filtersString = JSON.stringify(filters);
			
			var session = nlapiGetFieldValue('custpage_session_param');
			
			libSetSessionData(session, filtersString);
		}
	
	//If the sales price is changed, then update the margin calculation
	//
	if(type != null && type.startsWith('custpage_sublist') && name.endsWith('_sales'))
		{
			var costFieldName = type + '_cost';
			var marginFieldName = type + '_margin';
		
			var sales = nlapiGetLineItemValue(type, name, linenum);
			var cost = nlapiGetLineItemValue(type, costFieldName, linenum);
			
			if(!isNaN(sales) && !isNaN(cost))
				{
					sales = Number(sales);
					cost = Number(cost);
					
					var margin = (((sales - cost) / sales) * 100.00).toFixed(2) + '%';
					
					nlapiSetLineItemValue(type, marginFieldName, linenum, margin);
				}
		}
	
	
	//If the customer is changed, then generate the list of finish items to select from
	//Also get the list of finish refs that are applicable
	//
	if (name == 'custpage_customer_select')
		{
			//Get the selected customer
			//
			var customerId = nlapiGetFieldValue('custpage_customer_select');
			var customerTxt = nlapiGetFieldText('custpage_customer_select');
			
			//Get the customer's price level & currency
			//
			var customerPriceLevel = nlapiLookupField('customer', customerId, 'pricelevel', false);
			var customerCurrency = nlapiLookupField('customer', customerId, 'currency', false);
			
			//Save the selected customer for later retrieval in the POST section
			//
			nlapiSetFieldValue('custpage_cust_id_param', customerId, false, true);
			nlapiSetFieldValue('custpage_cust_txt_param', customerTxt, false, true);
			nlapiSetFieldValue('custpage_cust_pricel_param', customerPriceLevel, false, true);
			nlapiSetFieldValue('custpage_cust_currency_param', customerCurrency, false, true);

			//Remove any existing finish items
			//
			nlapiRemoveSelectOption('custpage_finish_item_select', null);
			
			//Add a blank finish item
			//
			nlapiInsertSelectOption('custpage_finish_item_select', 0, '', true);
			
			var finishList = {};
			
			if (customerId != null && customerId != '')
				{
					var search = nlapiCreateSearch("assemblyitem",
							[
							   ["type","anyof","Assembly"], 
							   "AND", 
							   ["isphantom","is","T"], 
							   "AND", 
							   ["custitem_bbs_item_customer","anyof",customerId],
							   "AND", 
							   ["isinactive","is","F"]
							], 
							[
							   new nlobjSearchColumn("itemid",null,null).setSort(false), 
							   new nlobjSearchColumn("description",null,null), 
							   new nlobjSearchColumn("description","memberItem",null)
							]
							);
					
					assemblyitemSearch = getResults(search);
					
					var lastId = '';
					var accumulatedDescription = '';
					
					if(assemblyitemSearch)
						{
							for (var int = 0; int < assemblyitemSearch.length; int++) 
								{
									var thisId = assemblyitemSearch[int].getId();
										
									if(lastId != thisId)
										{
											if(lastId != '')
											{
												accumulatedDescription = accumulatedDescription.slice(0, accumulatedDescription.length - 3);
												accumulatedDescription += ')';
													
												//add the previous finish to the select list
												//
												//nlapiInsertSelectOption('custpage_finish_item_select', lastId, accumulatedDescription, false);
												var posHyphen = accumulatedDescription.indexOf('-') + 2;
												var posColon = accumulatedDescription.indexOf(' :');
												var prefix = accumulatedDescription.substring(posHyphen - 1,posColon - 1);
												var prefixValue = Number(prefix.charCodeAt(0)) * 1000;
												var indexer = Number(accumulatedDescription.substring(posHyphen,posColon));
												indexer = indexer + prefixValue;
												
												finishList[indexer] = [lastId,accumulatedDescription];
											}
												
											lastId = thisId;
												
											accumulatedDescription = assemblyitemSearch[int].getValue('itemid') + ' : ' + '(' + assemblyitemSearch[int].getValue('description', 'memberitem') + ' + ';
										}
									else
										{
											accumulatedDescription += assemblyitemSearch[int].getValue('description', 'memberitem') + ' + ';
										}
										
								}
				
							if(lastId != '')
								{
									accumulatedDescription = accumulatedDescription.slice(0, accumulatedDescription.length - 3);
									accumulatedDescription += ')';
											
									//add the last finish to the select list
									//
									//nlapiInsertSelectOption('custpage_finish_item_select', thisId, accumulatedDescription, false);
									
									var posHyphen = accumulatedDescription.indexOf('-') + 2;
									var posColon = accumulatedDescription.indexOf(' :');
									var prefix = accumulatedDescription.substring(posHyphen - 1,posColon - 1);
									var prefixValue = Number(prefix.charCodeAt(0)) * 1000;
									var indexer = Number(accumulatedDescription.substring(posHyphen,posColon));
									indexer = indexer + prefixValue;
									
									finishList[indexer] = [thisId,accumulatedDescription];
								}
						}
				}
			
			//Sort the list of finishes
			//
			const orderedTemp = {};
			Object.keys(finishList).sort().forEach(function(key) {
				orderedTemp[key] = finishList[key];
			});
			
			for ( var tempKey in orderedTemp) 
				{
					var tempData = orderedTemp[tempKey];
					nlapiInsertSelectOption('custpage_finish_item_select', tempData[0], tempData[1], false);
				}
			
			
			//Remove any existing finish refs
			//
			nlapiRemoveSelectOption('custpage_finish_ref_select', null);
			
			//Add a blank finish ref
			//
			nlapiInsertSelectOption('custpage_finish_ref_select', 0, '', true);
			
			//Find assembly items that are not a matrix parent or child & that belong to the customer
			//
			if(customerId != null && customerId != '')
				{
					var search = nlapiCreateSearch("assemblyitem",
							[
							   ["matrix","is","F"], 
							   "AND", 
							   ["matrixchild","is","F"], 
							   "AND", 
							   ["custitem_bbs_item_customer","anyof",customerId], 
							   "AND", 
							   ["type","anyof","Assembly"],
							   "AND", 
							   ["isinactive","is","F"]
							], 
							[
							   new nlobjSearchColumn("formulatext",null,null).setFormula("SUBSTR({name},INSTR({name}, '-' )+1)")
							]
							);
					
					var assemblyitemSearch = getResults(search);
					
					//Add the results to an object
					//
					var finishRefs = {};
					
					if(assemblyitemSearch)
						{
							for (var int2 = 0; int2 < assemblyitemSearch.length; int2++) 
								{
									var finishRefText = assemblyitemSearch[int2].getValue('formulatext');
									finishRefs[finishRefText] = finishRefText;
								}
						}
					
					//Search the custom list of finishes
					//
					var finishRefSearch = nlapiCreateSearch("customlist_bbs_item_finish_ref",
							[
							], 
							[
							   new nlobjSearchColumn("name",null,null)
							]
							);
					
					var searchResult = getResults(finishRefSearch);
					
					//Read through the list & add any rows that match the previous search to the select list
					//
					if(searchResultSet !=  null)
						{
							for (var int = 0; int < searchResultSet.length; int++) 
								{
									var finishRefId = searchResultSet[int].getId();
									var finishRefName = searchResultSet[int].getValue('name');
									
									if(finishRefs[finishRefName])
										{
											nlapiInsertSelectOption('custpage_finish_ref_select', finishRefId, finishRefName, false);
										}
								}
						}
				}
		}
	
	//If the finish item is selected then pre-select the corresponding finish ref in the list of finish ref's
	//
	if (name == 'custpage_finish_item_select')
		{
			//Get the selected finish item
			//
			var finishId = nlapiGetFieldValue('custpage_finish_item_select');
			var finishTxt = nlapiGetFieldText('custpage_finish_item_select');
			
			//Save the selected finish item for later retrieval in the POST section
			//
			nlapiSetFieldValue('custpage_finish_id_param', finishId, false, true);
			nlapiSetFieldValue('custpage_finish_txt_param', finishTxt, false, true);
			
			var dash = finishTxt.indexOf('-');
			var colon = finishTxt.indexOf(' : ');
			
			if(dash > 0 && colon > 0)
				{
					var impliedFinishRef = finishTxt.substr(dash + 1, colon - dash - 1);
					var customerId = nlapiGetFieldValue('custpage_customer_select');
					
					//Remove any existing finish refs
					//
					nlapiRemoveSelectOption('custpage_finish_ref_select', null);
					
					//Add a blank finish ref
					//
					nlapiInsertSelectOption('custpage_finish_ref_select', 0, '', true);
					
					//Find assembly items that are not a matrix parent or child & that belong to the customer
					//
					var search = nlapiCreateSearch("assemblyitem",
							[
							   ["matrix","is","F"], 
							   "AND", 
							   ["matrixchild","is","F"], 
							   "AND", 
							   ["custitem_bbs_item_customer","anyof",customerId], 
							   "AND", 
							   ["type","anyof","Assembly"],
							   "AND", 
							   ["isinactive","is","F"]
							], 
							[
							   new nlobjSearchColumn("formulatext",null,null).setFormula("SUBSTR({name},INSTR({name}, '-' )+1)")
							]
							);
					
					var assemblyitemSearch = getResults(search);
					
					//Add the results to an object
					//
					var finishRefs = {};
					
					for (var int2 = 0; int2 < assemblyitemSearch.length; int2++) 
						{
							var finishRefText = assemblyitemSearch[int2].getValue('formulatext');
							finishRefs[finishRefText] = finishRefText;
						}
					
					//Search the custom list of finishes
					//
					var finishRefSearch = nlapiCreateSearch("customlist_bbs_item_finish_ref",
							[
							], 
							[
							   new nlobjSearchColumn("name",null,null)
							]
							);
					
					var searchResultSet = getResults(finishRefSearch);
					
					//Read through the list & add any rows that match the previous search to the select list
					//
					if(searchResultSet !=  null)
						{
							for (var int = 0; int < searchResultSet.length; int++) 
								{
									var finishRefId = searchResultSet[int].getId();
									var finishRefName = searchResultSet[int].getValue('name');
									
									if(finishRefs[finishRefName])
										{
											if(finishRefName == impliedFinishRef)
												{
													nlapiInsertSelectOption('custpage_finish_ref_select', finishRefId, finishRefName, true);
													
													//Save the selected finish item for later retrieval in the POST section
													//
													nlapiSetFieldValue('custpage_finishref_id_param', finishRefId, false, true);
													nlapiSetFieldValue('custpage_finishref_txt_param', finishRefName, false, true);
												}
											else
												{
													nlapiInsertSelectOption('custpage_finish_ref_select', finishRefId, finishRefName, false);
												}
											
										}
								}
						}
				}
			
		}

	//If the finish ref has been changed, then save the selected value
	//
	if (name == 'custpage_finish_ref_select')
	{
		//Get the selected finish item
		//
		var finishRefId = nlapiGetFieldValue('custpage_finish_ref_select');
		var finishRefTxt = nlapiGetFieldText('custpage_finish_ref_select');
		
		//Save the selected finish item for later retrieval in the POST section
		//
		nlapiSetFieldValue('custpage_finishref_id_param', finishRefId, false, true);
		nlapiSetFieldValue('custpage_finishref_txt_param', finishRefTxt, false, true);
	}

	
	//If the finish parent item has been changed, then save the selected value
	//
	if (name == 'custpage_base_parent_select')
		{
			//Get the selected base parent
			//
			var baseParentId = nlapiGetFieldValues('custpage_base_parent_select');
			var baseParentTxt = nlapiGetFieldTexts('custpage_base_parent_select');
			
			//Save the selected base parent for later retrieval in the POST section
			//
			var baseParents = {};
			
			for (var int2 = 0; int2 < baseParentId.length; int2++) 
				{
					baseParents[baseParentId[int2]] = baseParentTxt[int2];
				}
			
			nlapiSetFieldValue('custpage_baseparents_param', JSON.stringify(baseParents), false, true);
		}
	
	//If the parent filter has changed, then apply the filter to the parent items
	//
	if (name == 'custpage_base_parent_filter' || name == 'custpage_base_parent_filter2')
	{
		var filterValue = nlapiGetFieldValue('custpage_base_parent_filter');
		var filterValue2 = nlapiGetFieldValue('custpage_base_parent_filter2');
		
		if((filterValue != null && filterValue != '') || (filterValue2 != null && filterValue2 != ''))
			{
				nlapiRemoveSelectOption('custpage_base_parent_select', null);
				
				var filterArray = [
						   ["type","anyof","InvtPart"], 
						   "AND", 
						   ["matrix","is","T"], 
						   "AND", 
						   ["custitem_bbs_item_category","anyof","1","2","3"],
						   "AND", 
						   ["isinactive","is","F"]
						];
				
				
				if(filterValue != null && filterValue != '')
					{
						filterArray.push("AND");
						filterArray.push(["salesdescription","contains",filterValue]);
					}
			
				if(filterValue2 != null && filterValue2 != '')
					{
						filterArray.push("AND");
						filterArray.push(["itemid","startswith",filterValue2]);
					}
			
				var inventoryitemSearch = nlapiCreateSearch("inventoryitem",
						filterArray, 
						[
						   new nlobjSearchColumn("itemid",null,null).setSort(false), 
						   new nlobjSearchColumn("salesdescription",null,null)
						]
						);
				
				
				var searchResult = inventoryitemSearch.runSearch();
				
				//Get the initial set of results
				//
				var start = 0;
				var end = 1000;
				var searchResultSet = searchResult.getResults(start, end);
				var resultlen = (searchResultSet == null ? 0 :  searchResultSet.length);
		
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
					
				//Copy the results to the select field
				//
				var line = 1;
				
				if(searchResultSet !=  null)
					{
						for (var int = 0; int < searchResultSet.length; int++) 
							{
								var baseParentId = searchResultSet[int].getId();
								var baseParentText = searchResultSet[int].getValue('itemid') + ' - ' + searchResultSet[int].getValue('salesdescription');
								
								nlapiInsertSelectOption('custpage_base_parent_select', baseParentId, baseParentText, false);
							}
					}
			}
		else
			{
				alert('Blank filter ignored - Base Parent list will be too long to process');
			}
	}
	
}


//Function called by the update sales price button
//
function calculateSalesPrice(baseParentId)
{
	//Get the customer price level & the selected finish
	//
	var custPriceLevel = nlapiGetFieldValue('custpage_cust_pricel_param');
	var custCurrency = nlapiGetFieldValue('custpage_cust_currency_param');
	var finishId = nlapiGetFieldValue('custpage_finish_id_param');
	
	var newSalesPrice = Number(0);
	
	//Get the price from the finish
	//
	var assemblyRecord = nlapiLoadRecord('assemblyitem', finishId);
	
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
			
			var priceSublistByCurrency = 'price' + custCurrency;
					
			var priceLineCount = componentRecord.getLineItemCount(priceSublistByCurrency);
			var quantityBreakCount = componentRecord.getMatrixCount(priceSublistByCurrency, 'price');
					
			for (var int3 = 1; int3 <= priceLineCount; int3++) 
				{
					var pricePriceLevel = componentRecord.getLineItemValue(priceSublistByCurrency, 'pricelevel', int3);
	
					if(pricePriceLevel == custPriceLevel)
						{
							
							var matrixPrice = componentRecord.getLineItemMatrixValue(priceSublistByCurrency, 'price', int3, 1);
							matrixPrice = Number((matrixPrice == '' ? 0 : matrixPrice));
									
							newSalesPrice += matrixPrice;
							
							break;
						}
				}
		}

	
	//Get the price from the base item
	//
	var baseParentRecord = nlapiLoadRecord('inventoryitem', baseParentId);
	
	if(baseParentRecord)
		{
			var priceSublistByCurrency = 'price' + custCurrency;
			
			var priceLineCount = baseParentRecord.getLineItemCount(priceSublistByCurrency);
			var quantityBreakCount = baseParentRecord.getMatrixCount(priceSublistByCurrency, 'price');
			
			for (var int3 = 1; int3 <= priceLineCount; int3++) 
				{
					var pricePriceLevel = baseParentRecord.getLineItemValue(priceSublistByCurrency, 'pricelevel', int3);
	
					if(pricePriceLevel == custPriceLevel)
						{							
							var matrixPrice = baseParentRecord.getLineItemMatrixValue(priceSublistByCurrency, 'price', int3, 1);
							matrixPrice = Number((matrixPrice == '' ? 0 : matrixPrice));
									
							newSalesPrice += matrixPrice;
							
							break;
						}
				}
		}
	
	//Update the sublist with the new price
	//
	var sublistId = 'custpage_sublist_' + baseParentId.toString();
	var lines = nlapiGetLineItemCount(sublistId);
	
	for (var int = 1; int <= lines; int++) 
		{
			var ticked = nlapiGetLineItemValue(sublistId, sublistId + '_tick', int);
			
			if(ticked == 'T')
				{
					nlapiSetLineItemValue(sublistId, sublistId + '_sales', int, newSalesPrice.toFixed(2));
				}
		}
}

//Function called by the update sales price button
//
function updateSalesPrice(baseParentId)
{
	var sublistId = 'custpage_sublist_' + baseParentId.toString();
	var lines = nlapiGetLineItemCount(sublistId);
	var fieldId = 'custpage_def_sales_' + baseParentId.toString();
	
	var salesPrice = nlapiGetFieldValue(fieldId);
	
	for (var int = 1; int <= lines; int++) 
		{
			var ticked = nlapiGetLineItemValue(sublistId, sublistId + '_tick', int);
			
			if(ticked == 'T')
				{
					nlapiSetLineItemValue(sublistId, sublistId + '_sales', int, salesPrice);
					
					var costFieldName = sublistId + '_cost';
					var marginFieldName = sublistId + '_margin';
						
					var sales = salesPrice;
					var cost = nlapiGetLineItemValue(sublistId, costFieldName, int);
							
					if(!isNaN(sales) && !isNaN(cost))
						{
							sales = Number(sales);
							cost = Number(cost);
								
							var margin = null;
							
							if(sales != null && sales != '' && sales != 0)
								{
									margin = (((sales - cost) / sales) * 100.00).toFixed(2) + '%';
								}
							
							nlapiSetLineItemValue(sublistId, marginFieldName, int, margin);
						}
				}	
		}
}

function createAssembliesPageInit(type)
{
	
	
}

function getResults(search)
{
	var searchResult = search.runSearch();
	
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