/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       14 Dec 2018     cedricgriffiths
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
function assemblyGlassSpecAfterSubmit(type)
{
	if(type == 'create' || type == 'edit')
		{
			//Get the current assembly record & it's id
			//
			var assemblyRecord = nlapiGetNewRecord();
			var assemblyId = assemblyRecord.getId();
			var assemblyType = assemblyRecord.getRecordType();
			
			//Get the count of components
			//
			var members = assemblyRecord.getLineItemCount('member');
			
			//Loop through the components
			//
			for (var int = 1; int <= members; int++) 
				{
					//Get the component id & type
					//
					var memberItem = assemblyRecord.getLineItemValue('member', 'item', int);
					var memberItemType = assemblyRecord.getLineItemValue('member', 'sitemtype', int);
					
					//If the component is a non inventory part then we need to see if it has a product type of glass spec
					//
					if(memberItemType == 'NonInvtPart')
						{
							var memberItemProductType = nlapiLookupField('noninventoryitem', memberItem, 'custitem_bbs_item_product_type', false);
							
							//If the component does have a product type of glass psec, then copy this up to the assembly header
							//
							if(memberItemProductType == '5')
								{
									nlapiSubmitField(assemblyType, assemblyId, 'custitem_bbs_glass_spec', memberItem, false);
									break;
								}
						}
				}
		}
}
