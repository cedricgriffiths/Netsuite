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
function clientFieldChanged(type, name, linenum)
{
	if (name == 'custpage_finish_item_select')
	{
		var finishId = nlapiGetFieldValue('custpage_finish_item_select');
		var finishText = nlapiGetFieldText('custpage_finish_item_select');
		
		//Find the actual lookup id relating to the finish suffix
		//
		var dash = finishText.indexOf('-');
		var colon = finishText.indexOf(' : ');
		var impliedFinishRef = finishText.substr(dash + 1, colon - dash - 1);
		
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
		
		if(searchResultSet != null)
			{
				for (var int = 0; int < searchResultSet.length; int++) 
					{
						var finishRefId = searchResultSet[int].getId();
						var finishRefName = searchResultSet[int].getValue('name');
	
						if(finishRefName == impliedFinishRef)
							{
								nlapiSetFieldValue('custpage_finishid', finishRefId, false, true);
								nlapiSetFieldValue('custpage_finish_name', finishText, false, true);
								
								break;
							}
					}
			}
	}
	
	
	if (name == 'custpage_finish_select')
	{
		var finishId = nlapiGetFieldValue('custpage_finish_select');
		var finishText = nlapiGetFieldText('custpage_finish_select');
		
		nlapiSetFieldValue('custpage_finishid', finishId, false, true);
		nlapiSetFieldValue('custpage_finish_name', finishText, false, true);
	}
	
	if (name == 'custpage_dept_select')
	{
		var deptId = nlapiGetFieldValue('custpage_dept_select');
		var deptText = nlapiGetFieldText('custpage_dept_select');
		
		nlapiSetFieldValue('custpage_deptid', deptId, false, true);
		nlapiSetFieldValue('custpage_dept_name', deptText, false, true);

		//Remove all entries from the select list
		//
		nlapiRemoveSelectOption('custpage_contact_select', null);
		
		//And add the employees to the select list 
		//
		var contacts = null;
		
		var depotId = nlapiGetFieldValue('custpage_depotid');
		
		if(depotId != null && depotId != '')
			{
				var contactFilters = new Array();
				contactFilters[0] = new nlobjSearchFilter( 'custentity_bbs_contact_depot', null, 'anyof', depotId);
				
				if (deptId != '0')
					{
						contactFilters[1] = new nlobjSearchFilter( 'custentity_bbs_contact_department', null, 'anyof', deptId);
					}
				
				var contactColumns = new Array();
				contactColumns[0] = new nlobjSearchColumn( 'entityid' );
				
				contacts = nlapiSearchRecord('contact', null, contactFilters, contactColumns);
			}
		
		nlapiInsertSelectOption('custpage_contact_select', 0, '', true);
		
		if(contacts)
			{
				for (var int = 0; int < contacts.length; int++) 
				{
					var contactName = contacts[int].getValue('entityid');
					var contactId = contacts[int].getId();
					
					nlapiInsertSelectOption('custpage_contact_select', contactId, contactName, false);
				}
			}
		
		
	}
	
	if (name == 'custpage_contact_select')
		{
			var empId = nlapiGetFieldValue('custpage_contact_select');
			var empText = nlapiGetFieldText('custpage_contact_select');
		
			var empGrade = '';
			var empGradeId = '';
			
			if (empId != 0)
				{
					empGrade = nlapiLookupField('contact', empId, 'custentity_bbs_contact_grade', true);
					empGradeId = nlapiLookupField('contact', empId, 'custentity_bbs_contact_grade', false);
				}
			
			nlapiSetFieldValue('custpage_grade_select', empGrade, false, true);
			nlapiSetFieldValue('custpage_employee_name', empText, false, true);
			nlapiSetFieldValue('custpage_employee_id', empId, false, true);
			nlapiSetFieldValue('custpage_grade_name', empGrade, false, true);
			nlapiSetFieldValue('custpage_grade_id', empGradeId, false, true);

		}
	
	if (type == 'custpage_sublist_items') 
		{
			//See if the item quantity has changed
			//
			if (name == 'custpage_sublist_qty')
				{
					var qty = nlapiGetLineItemValue(type, 'custpage_sublist_qty', linenum);
					
					if (qty)
						{
							//If the quantity is non-blank then set the tick on the line
							//
							nlapiSetLineItemValue(type, 'custpage_sublist_tick', linenum, 'T');
						}
					else
						{
							//If the quantity is blank then un-set the tick on the line
							//
							nlapiSetLineItemValue(type, 'custpage_sublist_tick', linenum, 'F');
						}
				}
			
			if (name == 'custpage_sublist_tick')
			{
				var ticked = nlapiGetLineItemValue(type, 'custpage_sublist_tick', linenum);
				
				if (ticked == 'F')
					{
						//If the tick box on the line as been un-checked, then set the quantity to null
						//
						nlapiSetLineItemValue(type, 'custpage_sublist_qty', linenum, null);
					}
			}
		}
}

function updateItemQuantity() 
{
	//Update all the item lines with a global quantity
	//
	var quantity = nlapiGetFieldValue('custpage_update_qty');
	var lines = nlapiGetLineItemCount('custpage_sublist_items');
	
	for (var int = 1; int <= lines; int++) 
	{	
		var ticked = nlapiGetLineItemValue('custpage_sublist_items', 'custpage_sublist_tick', int);
		
		if(ticked == 'T')
			{
				nlapiSetLineItemValue('custpage_sublist_items', 'custpage_sublist_qty', int, quantity);
				nlapiSetLineItemValue('custpage_sublist_items', 'custpage_sublist_tick', int, 'T');
			}
	}
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
