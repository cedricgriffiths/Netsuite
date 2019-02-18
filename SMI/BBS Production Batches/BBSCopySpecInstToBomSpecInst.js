/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       18 Feb 2019     cedricgriffiths
 *
 */

var itemSearch = nlapiSearchRecord("item",null,
[
   ["custitem_bbs_special_instructions","isnotempty",""],
   "AND",
   ["custitem_bbs_special_instructions_item","isempty",""]
], 
[
   new nlobjSearchColumn("itemid").setSort(false), 
   new nlobjSearchColumn("displayname"), 
   new nlobjSearchColumn("salesdescription"), 
   new nlobjSearchColumn("type"), 
   new nlobjSearchColumn("custitem_bbs_special_instructions"), 
   new nlobjSearchColumn("custitem_bbs_special_instructions_item")
]
);

if(itemSearch != null && itemSearch.length > 0)
	{
		for (var int = 0; int < itemSearch.length; int++) 
			{
				var itemId = itemSearch[int].getId();
				var itemInst = itemSearch[int].getValue('custitem_bbs_special_instructions');
				var itemType = itemSearch[int].getValue('type');
				
				nlapiSubmitField(getItemRecType(itemType), itemId, 'custitem_bbs_special_instructions_item', itemInst, false);
			}
	}

function getItemRecType(ItemType)
{
	var itemType = '';
	
	switch(ItemType)
	{
		case 'InvtPart':
			itemType = 'inventoryitem';
			break;
			
		case 'Assembly':
			itemType = 'assemblyitem';
			break;
			
		case 'NonInvtPart':
			itemType = 'noninventoryitem';
			break;
	}

	return itemType;
}