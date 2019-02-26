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
			
			//Remove any items from the select list
			//
			nlapiRemoveSelectOption('custpage_base_parent_select', null);
			nlapiSetFieldValue('custpage_base_parent_count', 'No Items Found', false, true);
			
			if(customerId != null && customerId != '')
				{
					//Get the customer record
					//
					var custRecord = nlapiLoadRecord('customer', customerId);
		
					var itemPricingLines = custRecord.getLineItemCount('itempricing');
					var items = [];
					var parents = {};
					
					//Get all of the item pricing items
					//
					for (var int = 1; int <= itemPricingLines; int++) 
						{
							var itemId = custRecord.getLineItemValue('itempricing', 'item', int);
							
							items.push(itemId);
						}
					
					if(items.length > 0)
						{
							//Search for the item parents
							//
							var itemSearch = getResults(nlapiCreateSearch("item",
									[
									   ["internalid","anyof",items],
									   "AND",
									   ["parent", "noneof", "@NONE@"]
									], 
									[
									   new nlobjSearchColumn("itemid").setSort(false), 
									   new nlobjSearchColumn("displayname"), 
									   new nlobjSearchColumn("salesdescription"), 
									   new nlobjSearchColumn("parent"), 
									   new nlobjSearchColumn("displayname","parent"), 
									   new nlobjSearchColumn("itemid","parent")
									]
									));
							
							//Accumulate the parent records
							//
							if(itemSearch != null && itemSearch.length > 0)
								{
									for (var int2 = 0; int2 < itemSearch.length; int2++) 
										{
											var itemCode = itemSearch[int2].getValue('itemid');
											var parentId = itemSearch[int2].getValue('parent');
											var parentName = itemSearch[int2].getValue("displayname",'parent');
											var parentCode = itemSearch[int2].getValue("itemid",'parent');
											parentName = parentCode + ' - ' + parentName;
											
											parents[parentName] = parentId;
										}
								}
							
							//Sort the parents by name
							//
							const orderedParents = {};
							Object.keys(parents).sort().forEach(function(key) {
								orderedParents[key] = parents[key];
							});
							
							
							//Add the parents to the list
							//
							for ( var orderedParent in orderedParents) 
								{
									var baseParentId = orderedParents[orderedParent];
									var baseParentText = orderedParent;
									nlapiInsertSelectOption('custpage_base_parent_select', baseParentId, baseParentText, false);
								}
						
							nlapiSetFieldValue('custpage_base_parent_count', 'Items Returned = ' + Object.keys(orderedParents).length, false, true);
						}
					else
						{
							nlapiSetFieldValue('custpage_base_parent_count', 'No Items Found', false, true);
						}
				}
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

//Function called by the update prices button
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