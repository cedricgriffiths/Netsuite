/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       20 Feb 2019     cedricgriffiths
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response)
{
	var custRecord = nlapiLoadRecord('customer', 420);

	var itemPricingLines = custRecord.getLineItemCount('itempricing');
	var items = [];
	var parents = {};
	
	for (var int = 1; int <= itemPricingLines; int++) 
		{
			var itemId = custRecord.getLineItemValue('itempricing', 'item', int);
			
			items.push(itemId);
		}
	
	var itemSearch = nlapiSearchRecord("item",null,
			[
			   ["internalid","anyof",items],
			   "AND",
			   ["parent", "noneof", "@NONE@"]
			], 
			[
			   new nlobjSearchColumn("itemid").setSort(false), 
			   new nlobjSearchColumn("displayname"), 
			   new nlobjSearchColumn("salesdescription"), 
			   new nlobjSearchColumn("parent"), 
			   new nlobjSearchColumn("displayname","parent")
			]
			);
	
	if(itemSearch != null && itemSearch.length > 0)
		{
			for (var int2 = 0; int2 < itemSearch.length; int2++) 
				{
					var parentId = itemSearch[int2].getValue('parent');
					var parentName = itemSearch[int2].getValue("displayname",'parent');
				
					parents[parentName] = parentId;
				}
		}
	
	const orderedParents = {};
	Object.keys(parents).sort().forEach(function(key) {
		orderedParents[key] = parents[key];
	});
	
	
}
