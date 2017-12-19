/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       21 Jul 2017     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function consHeaderBeforeLoad(type, form, request)
{
	var landedCosts = libFindLandedCostCategories();

	var fldGrp = form.addFieldGroup('custpage_grp_landed', 'Landed Costs');
	
	var lcText = nlapiGetFieldValue('custrecord_bbs_cons_lc_array')	;
	var lcArray = JSON.parse(lcText);
	
	var count = Number(0);
	var first = true;
	
	for ( var key in landedCosts) 
		{
			var lcData = landedCosts[key];
			var lcId = lcData[0];
			var lcName = lcData[1];
			var lcAccountId = lcData[2];
			var lcAccountTxt = lcData[3];
					
			var lcField = form.addField('custpage_lc_value_' + count.toString(), 'currency', lcName, null, 'custpage_grp_landed');
			var lcCurr = form.addField('custpage_lc_currency_' + count.toString(), 'select', lcName + ' Currency', 'currency', 'custpage_grp_landed');
			//lcField.setDisplayType('disabled');
			//lcCurr.setDisplayType('disabled');
			
			if (first)
				{
					first = false;
				}
			else
				{
					lcField.setBreakType('startcol');
				}
			
			if (lcArray != null && count < lcArray.length)
				{
					
					try
					{
						var lcValues = lcArray[count];
						lcField.setDefaultValue(lcValues[0]);
						
						lcCurr.setDefaultValue(lcValues[1]);
					}
					catch(errr)
					{
						lcField.setDefaultValue(lcArray[count]);
					}
					//lcField.setDefaultValue(lcArray[count]);
				}
			count++;
		}
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */
function consHeaderBeforeSubmit(type)
{
	var landedCosts = libFindLandedCostCategories();
	
	var count = Number(0);
	var lcArray = [];
	
	for ( var key in landedCosts) 
		{
			var lcValue = nlapiGetFieldValue('custpage_lc_value_' + count.toString());
			var lcCurr = nlapiGetFieldValue('custpage_lc_currency_' + count.toString());
			
			var lcData = [lcValue,lcCurr];
			
			if(lcValue != null)
				{
					//lcArray.push(lcValue);
					lcArray.push(lcData);
				}
			
			count++;
		}
	
	if(lcArray.length > 0)
		{
			var lcString = JSON.stringify(lcArray);
			
			nlapiSetFieldValue('custrecord_bbs_cons_lc_array', lcString, false, true);
		}
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function consHeaderAfterSubmit(type){
  
}
