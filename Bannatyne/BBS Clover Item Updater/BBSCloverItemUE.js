/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 Oct 2018     cedricgriffiths
 *
 */

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
function cloverItemAfterSubmit(type)
{
	var context = nlapiGetContext();
	var executionContext = context.getExecutionContext();
	
	if (type == 'create')
	{
		var itemId = nlapiGetRecordId();
		var newRecord = nlapiGetNewRecord();
		var itemName = newRecord.getFieldValue('itemid');
		var cloverItem = newRecord.getFieldValue('custitem_bbs_clover_item');
		var recordType = newRecord.getRecordType();
		
		if(cloverItem == 'T')
			{
				var params = new Array();
				
				params['itemid'] = itemId;
				params['itemname'] = itemName;
				params['recordtype'] = recordType;
				
				nlapiSetRedirectURL('SUITELET', 'customscript_bbs_clover_item_suitelet', 'customdeploy_bbs_clover_item_suitelet', null, params);
			}
	}
	
	if (type == 'edit' && executionContext == 'userinterface')
		{
			var itemId = nlapiGetRecordId();
			var newRecord = nlapiGetNewRecord();
			var oldRecord = nlapiGetOldRecord();
			
			var oldModifierGroup = oldRecord.getFieldValue('custitembbs_modifier_group');
			var oldCategory = oldRecord.getFieldValue('custitembbs_clover_category_list');
			var oldRetailPrice = getRetailPrice(oldRecord);
			
			var newModifierGroup = newRecord.getFieldValue('custitembbs_modifier_group');
			var newCategory = newRecord.getFieldValue('custitembbs_clover_category_list');
			var newRetailPrice = getRetailPrice(newRecord);
			
			if(oldModifierGroup != newModifierGroup || oldCategory != newCategory || oldRetailPrice != newRetailPrice)
				{
					var parameterObject = {};
					
					parameterObject['itemid'] = itemId;
					parameterObject['oldmodifiergroup'] = oldModifierGroup;
					parameterObject['oldcategory'] = oldCategory;
					parameterObject['oldretailprice'] = oldRetailPrice;
					parameterObject['newmodifiergroup'] = newModifierGroup;
					parameterObject['newcategory'] = newCategory;
					parameterObject['newretailprice'] = newRetailPrice;
					
					var scheduleParams = {
								custscript_bbs_param_object_matrix: JSON.stringify(parameterObject)
							};
			
					nlapiScheduleScript('customscript_bbs_clover_matrix_update', null, scheduleParams);
				}
		}
}

function getRetailPrice(_itemRecord)
{
	var retailPrice = Number(0);
	
	//Read the price sublist based on the currency code
	//
	var priceSublist = 'price1';
	
	var priceLineCount = _itemRecord.getLineItemCount(priceSublist);
	var quantityLevels = _itemRecord.getMatrixCount(priceSublist, 'price');
	
	for (var int2 = 1; int2 <= priceLineCount; int2++) 
	{
		var pricePriceLevel = _itemRecord.getLineItemValue(priceSublist, 'pricelevel', int2);
		
		if (pricePriceLevel == '1')
			{
				retailPrice = Number(_itemRecord.getLineItemMatrixValue(priceSublist, 'price', int2, 1));

				break;
			}
	}

	return retailPrice;
}