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
	if (name == 'custpage_product_type_select')
		{
			nlapiSetFieldValue('custpage_prod_type_text', nlapiGetFieldText(name), false, true);
			
			var productType = nlapiGetFieldValue(name);
			
			//If we change chosen a product type of 'glass spec' then show the glass spec field
			//
			if(productType == '5')
				{
					nlapiSetFieldDisplay('custpage_glass_spec_select', true);
				}
			else
				{
					nlapiSetFieldValue('custpage_glass_spec_select', '0', true, true);
					nlapiSetFieldDisplay('custpage_glass_spec_select', false);
				}
		}

	if (name == 'custpage_glass_spec_select')
		{
			nlapiSetFieldValue('custpage_glass_spec_text', nlapiGetFieldText(name), false, true);
		}

	if (name == 'custpage_thickness_select')
		{
			nlapiSetFieldValue('custpage_thickness_text', nlapiGetFieldText(name), false, true);
		}

	if (name == 'custpage_stockflag_select')
		{
			nlapiSetFieldValue('custpage_stockflag_text', nlapiGetFieldText(name), false, true);
		}
}

function clientSaveRecord()
{
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













