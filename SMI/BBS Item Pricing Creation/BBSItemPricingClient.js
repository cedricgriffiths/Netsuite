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
function customerItemsFieldChanged(type, name, linenum)
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
	
	
	//If the customer has been changed, then save the selected value
	//
	if (name == 'custpage_customer_select')
		{
			//Get the selected customer
			//
			var customerId = nlapiGetFieldValue('custpage_customer_select');
			var customerTxt = nlapiGetFieldText('custpage_customer_select');
			
			//Save the selected customer for later retrieval in the POST section
			//
			nlapiSetFieldValue('custpage_cust_id_param', customerId, false, true);
			nlapiSetFieldValue('custpage_cust_txt_param', customerTxt, false, true);
		}
	
	//If the parent item has been changed, then save the selected value
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
	if (name == 'custpage_base_parent_filter' || name == 'custpage_base_parent_filter2' || name == 'custpage_customer_select' || name == 'custpage_item_type_select')
		{
			var filterValue = nlapiGetFieldValue('custpage_base_parent_filter');
			var filterValue2 = nlapiGetFieldValue('custpage_base_parent_filter2');
			var customerValue = nlapiGetFieldValue('custpage_customer_select');
			var itemValue = nlapiGetFieldValue('custpage_item_type_select');
			
			nlapiRemoveSelectOption('custpage_base_parent_select', null);
			
			if(customerValue != null && customerValue != '' && itemValue != '0')
				{
					var filterArray = [
									   ["matrix","is","T"], 
									   "AND", 
									   ["isinactive","is","F"]
									];
					
					if(filterValue != null && filterValue != '')
						{
							filterArray.push("AND");
							filterArray.push(["description","contains",filterValue]);
						}
						
					if(filterValue2 != null && filterValue2 != '')
						{
							filterArray.push("AND");
							//filterArray.push(["itemid","startswith",filterValue2]);
							filterArray.push(["formulatext: {itemid}","startswith",filterValue2]);
						}
						
					switch(itemValue)	
						{
							case '3': //Both
								filterArray.push("AND");
								filterArray.push([[["type","anyof","Assembly"],"AND",["custitem_bbs_item_customer","anyof",customerValue]], 
										   			"OR", 
										   			["type","anyof","InvtPart"]]);
								
								break;
							
							case '1': //Inventory
								filterArray.push("AND");
								filterArray.push(["type","anyof","InvtPart"]);
								break;
								
							case '2': //Assemblies
								filterArray.push("AND");
								filterArray.push(["type","anyof","Assembly"]);
								filterArray.push("AND");
								filterArray.push(["custitem_bbs_item_customer","anyof",customerValue]);
								
								break;
								
						}
					
					var inventoryitemSearch = nlapiCreateSearch("item",
							filterArray, 
							[
							   new nlobjSearchColumn("type",null,null).setSort(false), 
							   new nlobjSearchColumn("itemid",null,null).setSort(false), 
							   new nlobjSearchColumn("description",null,null)
							]
							);
							
							
					var searchResultSet = getResults(inventoryitemSearch);
						
					//Copy the results to the select field
					//
					var line = 1;
						
					var baseParentField = nlapiGetField('custpage_base_parent_select');
					
					if(searchResultSet !=  null)
						{
							for (var int = 0; int < searchResultSet.length && int < 400; int++) 
								{
									var baseParentId = searchResultSet[int].getId();
									var baseParentText = searchResultSet[int].getValue('type') + ' - ' + searchResultSet[int].getValue('itemid') + ' - ' + searchResultSet[int].getValue('description');
									
									//baseParentField.addSelectOption(baseParentId, baseParentText, false);
									nlapiInsertSelectOption('custpage_base_parent_select', baseParentId, baseParentText, false);
								}
							
							nlapiSetFieldValue('custpage_base_parent_count', 'Items Returned = ' + int, false, true);
						}
				}
		}
	
}

function getResults(search)
{
	var searchResult = search.runSearch();
	
	//Get the initial set of results
	//
	var pageSize = 100;
	var start = 0;
	var end = pageSize;
	var searchResultSet = searchResult.getResults(start, end);
	
	if(searchResultSet != null)
		{
			var resultlen = searchResultSet.length;
		
			//If there is more than 1000 results, page through them
			//
			while (resultlen == pageSize) 
				{
						start += pageSize;
						end += pageSize;
		
						var moreSearchResultSet = searchResult.getResults(start, end);
						resultlen = moreSearchResultSet.length;
		
						searchResultSet = searchResultSet.concat(moreSearchResultSet);
				}
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

//Function called by the update points button
//
function updatePrices(baseParentId)
{
	var sublistId = 'custpage_sublist_' + baseParentId.toString();
	var lines = nlapiGetLineItemCount(sublistId);
	var fieldId = 'custpage_def_price_' + baseParentId.toString();
	
	var allocType = nlapiGetFieldValue(fieldId);
	
	for (var int = 1; int <= lines; int++) 
		{
			var ticked = nlapiGetLineItemValue(sublistId, sublistId + '_tick', int);
			
			if(ticked == 'T')
				{
					nlapiSetLineItemValue(sublistId, sublistId + '_price', int, allocType);
				}	
		}
}