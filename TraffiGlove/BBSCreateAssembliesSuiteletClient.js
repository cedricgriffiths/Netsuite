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
			
			nlapiRemoveSelectOption('custpage_finish_item_select', null);
			
			nlapiInsertSelectOption('custpage_finish_item_select', 0, '', true);
			
			if(assemblyitemSearch)
				{
					for (var int = 0; int < assemblyitemSearch.length; int++) 
						{
							var finishId = assemblyitemSearch[int].getId();
							var finishText = assemblyitemSearch[int].getValue('itemid') + ' ' + assemblyitemSearch[int].getValue('description');
							
							nlapiInsertSelectOption('custpage_finish_item_select', finishId, finishText, false);
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
}

function createAssembliesPageInit(type)
{
	
	
}
