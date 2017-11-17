/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 Nov 2017     cedricgriffiths
 *
 */

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
function calculateBaseParentBS(type)
{
	if(type == 'create' || type == 'edit')
		{
			var currentId = nlapiGetRecordId();
			
			var currentType = nlapiGetFieldValue('itemtype');

			if(currentType == 'Assembly')
				{
					var members = nlapiGetLineItemCount('member');
					
					for (var int = 1; int <= members; int++) 
						{
							var memberType = nlapiGetLineItemValue('member', 'sitemtype', int);
							
							if(memberType == 'InvtPart')
								{
									var memberItemId = nlapiGetLineItemValue('member', 'item', int);
									
									var memberItemRecord = nlapiLoadRecord('inventoryitem', memberItemId);
									
									if(memberItemRecord)
										{
											var parent = memberItemRecord.getFieldValue('parent');
											
											nlapiSetFieldValue('custitem_sw_base_parent', parent, false, true);
										}
										
									break;
								}
						}
				}
		}
}
