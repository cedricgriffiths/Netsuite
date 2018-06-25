/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       01 Sep 2017     cedricgriffiths
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
function clientFieldChanged(type, name, linenum)
{
	if (name == 'custpage_wo_build_percent_select')
		{
			nlapiSetFieldValue('custpage_wo_build_percent_text', nlapiGetFieldText(name), false, true)
		}

	if (name == 'custpage_sales_order_select')
		{
			nlapiSetFieldValue('custpage_sales_order_text', nlapiGetFieldText(name), false, true)
		}

	if (name == 'custpage_so_commit_select')
		{
			nlapiSetFieldValue('custpage_so_com_text', nlapiGetFieldText(name), false, true)
		}

	if (name == 'custpage_wo_commit_select')
		{
			nlapiSetFieldValue('custpage_wo_com_text', nlapiGetFieldText(name), false, true)
		}

	if (name == 'custpage_so_select')
		{
			nlapiSetFieldValue('custpage_so_text', nlapiGetFieldText(name), false, true)
		}
	
	if (name == 'custpage_logo_type_select')
		{
			nlapiSetFieldValue('custpage_logo_type_text', nlapiGetFieldText(name), false, true)
		}

	if (name == 'custpage_logo_select')
		{
			nlapiSetFieldValue('custpage_logo_text', nlapiGetFieldText(name), false, true)
		}

	if (name == 'custpage_asym_belongs_select')
		{
			nlapiRemoveSelectOption('custpage_logo_select', null);
			
			var belongsTo = nlapiGetFieldValue('custpage_asym_belongs_select');
			
			var filters = [
						   ["type","anyof","Assembly"], 
						   "AND", 
						   ["matrix","is","F"], 
						   "AND", 
						   ["matrixchild","is","F"], 
						   "AND", 
						   ["isphantom","is","T"]
						];
			
			if(belongsTo != null && belongsTo != '')
				{
					filters.push("AND",["custitem_bbs_item_customer","anyof",belongsTo]);
				}
			
			var assemblyitemSearch = nlapiCreateSearch("assemblyitem",filters, 
					[
					   new nlobjSearchColumn("itemid").setSort(false), 
					   new nlobjSearchColumn("displayname")
					]
					);
			
			var assemblyitemSearchResults = getResults(assemblyitemSearch);
			
			nlapiInsertSelectOption('custpage_logo_select', '', '', true);

			if(assemblyitemSearchResults != null && assemblyitemSearchResults.length > 0)
				{
					for (var int = 0; int < assemblyitemSearchResults.length; int++) 
						{
							var assId = assemblyitemSearchResults[int].getId();
							var assName = assemblyitemSearchResults[int].getValue('itemid');
							nlapiInsertSelectOption('custpage_logo_select', assId, assName, false);

						}
				}
		}
}

function clientSaveRecord()
{
	var MAX_BATCH_SIZE = Number(nlapiGetContext().getPreference('custscript_bbs_prodbatch_size'));
	
	nlapiLogExecution('DEBUG', 'Batch Size', MAX_BATCH_SIZE);
	
	var stage = nlapiGetFieldValue('custpage_stage');
	var returnStatus = false;
	var message = '';
	
	switch (Number(stage))
		{
			case 1:
				returnStatus = true;
				break;
				
			case 2:
				var count = nlapiGetLineItemCount('custpage_sublist_items');
				var mode = nlapiGetFieldValue('custpage_mode');
				var soLink = nlapiGetFieldValue('custpage_solink');
				
				message = 'Please select one or more works orders to continue';
				
				for (var int = 1; int <= count; int++) 
					{
						var tick = nlapiGetLineItemValue('custpage_sublist_items', 'custpage_sublist_tick', int);
						
						if(tick == 'T')
							{
								returnStatus = true;
								break;
							}
					}
				
				if(!returnStatus)
				{	
					alert(message);
				}
				
				//If we have passed the test to make sure we have selected some works orders, then check the number of batches we are going to create
				//
				if(returnStatus && mode == 'C')
					{
						var woArray = {};
						var now = new Date();
						var nowFormatted = new Date(now.getTime() + (now.getTimezoneOffset() * 60000)).format('Ymd:Hi');
						var batchesCreated = [];
						
						//Loop round the sublist to find rows that are ticked
						//
						for (var int = 1; int <= count; int++) 
						{
							var ticked = nlapiGetLineItemValue('custpage_sublist_items', 'custpage_sublist_tick', int);
							
							if (ticked == 'T')
								{
									var woId = nlapiGetLineItemValue('custpage_sublist_items', 'custpage_sublist_id', int);
									var belongsTo = nlapiGetLineItemValue('custpage_sublist_items', 'custpage_sublist_belongs', int);
//SMI								var finish = nlapiGetLineItemValue('custpage_sublist_items', 'custpage_sublist_finish_type', int);
									var soTranId = nlapiGetLineItemValue('custpage_sublist_items', 'custpage_sublist_so_tranid', int);
									var custEntityId = nlapiGetLineItemValue('custpage_sublist_items', 'custpage_sublist_cust_entityid', int);
									var custEntity = nlapiGetLineItemValue('custpage_sublist_items', 'custpage_sublist_customer', int);
									
									//Build the batch key (which is used as the batch description)
									//
									var key = '';
									
									if (soLink == 'T')
										{
//SMI									 	key = custEntity + ':' + soTranId + ':' + finish;
										 	key = custEntity + ':' + soTranId;
										}
									else
										{
//SMI										key = belongsTo + ':' + finish + ':' + nowFormatted;
											key = belongsTo + ':' + nowFormatted;
										}
									
									if(!woArray[key])
										{
											woArray[key] = [woId];
										}
									else
										{
											woArray[key].push(woId);
										}
								}
						}
				
						var countOfBatches = Object.keys(woArray).length;
					
						if(countOfBatches > MAX_BATCH_SIZE)
							{
								message = 'Production batch count of ' + countOfBatches.toString() + ' is greater than the maximum of ' + MAX_BATCH_SIZE.toString() +', only the first ' + MAX_BATCH_SIZE.toString() +' will be processed';
								alert(message);
								
								returnStatus = true;
							}
					}
				
				break;
				
			case 3:
				var count = nlapiGetLineItemCount('custpage_sublist_items');
				message = 'Please refresh the list until all works orders are allocated before continuing';
				returnStatus = true;
				
				for (var int = 1; int <= count; int++) 
					{
						var tick = nlapiGetLineItemValue('custpage_sublist_items', 'custpage_sublist_updated', int);
						
						if(tick == 'F')
							{
								returnStatus = false;
								alert(message);
								break;
							}
					}
				
				break;
		}
	
    return returnStatus;
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













