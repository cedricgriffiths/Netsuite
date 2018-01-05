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
			
			//Find the finish items belonging to the customer
			//
			var assemblyitemSearch = nlapiSearchRecord("assemblyitem",null,
					[
					   ["type","anyof","Assembly"], 
					   "AND", 
					   ["isphantom","is","T"], 
					   "AND", 
					   ["custitem_bbs_item_customer","anyof",customerId]
					], 
					[
					   new nlobjSearchColumn("itemid",null,null).setSort(false), 
					   new nlobjSearchColumn("description",null,null)
					]
					);
			
			//Remove any existing finish items
			//
			nlapiRemoveSelectOption('custpage_finish_item_select', null);
			
			//Add a blank finish item
			//
			nlapiInsertSelectOption('custpage_finish_item_select', 0, '', true);
			
			//Add in the finish items into the select list
			//
			if(assemblyitemSearch)
				{
					for (var int = 0; int < assemblyitemSearch.length; int++) 
						{
							var finishId = assemblyitemSearch[int].getId();
							var assemblyRecord = nlapiLoadRecord('assemblyitem', finishId);
							var finishDescription = assemblyitemSearch[int].getValue('description');
							
							if(assemblyRecord)
								{
									var members = assemblyRecord.getLineItemCount('member');
									var memberDescription = '';
									
									for (var int2 = 1; int2 <= members; int2++) 
										{
											memberDescription += assemblyRecord.getLineItemValue('member', 'memberdescr', int2) + ' + ';
										}
									
									finishDescription = memberDescription.slice(0, memberDescription.length - 3);
								}
							
							var finishText = assemblyitemSearch[int].getValue('itemid') + ' : ' + finishDescription;
							
							nlapiInsertSelectOption('custpage_finish_item_select', finishId, finishText, false);
						}
				}
			
			
			//Remove any existing finish refs
			//
			nlapiRemoveSelectOption('custpage_finish_ref_select', null);
			
			//Add a blank finish ref
			//
			nlapiInsertSelectOption('custpage_finish_ref_select', 0, '', true);
			
			//Find assembly items that are not a matrix parent or child & that belong to the customer
			//
			var assemblyitemSearch = nlapiSearchRecord("assemblyitem",null,
					[
					   ["matrix","is","F"], 
					   "AND", 
					   ["matrixchild","is","F"], 
					   "AND", 
					   ["custitem_bbs_item_customer","anyof",customerId], 
					   "AND", 
					   ["type","anyof","Assembly"]
					], 
					[
					   new nlobjSearchColumn("formulatext",null,null).setFormula("SUBSTR({name},INSTR({name}, '-' )+1)")
					]
					);
			
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
			
			var searchResult = finishRefSearch.runSearch();
			
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
					var assemblyitemSearch = nlapiSearchRecord("assemblyitem",null,
							[
							   ["matrix","is","F"], 
							   "AND", 
							   ["matrixchild","is","F"], 
							   "AND", 
							   ["custitem_bbs_item_customer","anyof",customerId], 
							   "AND", 
							   ["type","anyof","Assembly"]
							], 
							[
							   new nlobjSearchColumn("formulatext",null,null).setFormula("SUBSTR({name},INSTR({name}, '-' )+1)")
							]
							);
					
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
					
					var searchResult = finishRefSearch.runSearch();
					
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
	
	if (name == 'custpage_base_parent_filter')
	{
		var filterValue = nlapiGetFieldValue('custpage_base_parent_filter');
		
		if(filterValue != null && filterValue != '')
			{
				nlapiRemoveSelectOption('custpage_base_parent_select', null);
				
				var filterArray = [
						   ["type","anyof","InvtPart"], 
						   "AND", 
						   ["matrix","is","T"], 
						   "AND", 
						   ["custitem_bbs_item_category","anyof","1","2","3"]
						];
				
				
				if(filterValue != null && filterValue != '')
					{
					filterArray.push("AND");
					filterArray.push(["salesdescription","contains",filterValue]);
					}
				
				var inventoryitemSearch = nlapiCreateSearch("inventoryitem",
						filterArray, 
						[
						   new nlobjSearchColumn("itemid",null,null), 
						   new nlobjSearchColumn("salesdescription",null,null).setSort(false)
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

function updateSalesPrice(baseParentId)
{
	var sublistId = 'custpage_sublist_' + baseParentId.toString();
	var lines = nlapiGetLineItemCount(sublistId);
	var fieldId = 'custpage_def_sales_' + baseParentId.toString();
	
	var salesPrice = nlapiGetFieldValue(fieldId);
	
	for (var int = 1; int <= lines; int++) 
		{
			//var ticked = nlapiGetLineItemValue(sublistId, sublistId + '_tick', int);
			
			//if(ticked == 'T')
			//	{
					nlapiSetLineItemValue(sublistId, sublistId + '_sales', int, salesPrice);
					
					var costFieldName = sublistId + '_cost';
					var marginFieldName = sublistId + '_margin';
				
					var sales = salesPrice;
					var cost = nlapiGetLineItemValue(sublistId, costFieldName, int);
					
					if(!isNaN(sales) && !isNaN(cost))
						{
							sales = Number(sales);
							cost = Number(cost);
							
							var margin = (((sales - cost) / sales) * 100.00).toFixed(2) + '%';
							
							nlapiSetLineItemValue(sublistId, marginFieldName, int, margin);
						}
			//	}
		}
}

function createAssembliesPageInit(type)
{
	
	
}