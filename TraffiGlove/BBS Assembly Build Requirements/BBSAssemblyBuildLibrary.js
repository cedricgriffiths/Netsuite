/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       23 Aug 2017     cedricgriffiths
 *
 */
function libCheckAssembly()
{
	var itemCount = nlapiGetLineItemCount('item');
	var assemblyItems = {};
	
	for (var int = 1; int <= itemCount; int++) 
		{
			var itemType = nlapiGetLineItemValue('item', 'itemtype', int);
			
			if(itemType == 'Assembly')
				{
					var itemId = nlapiGetLineItemValue('item', 'item', int);
					var itemQty = nlapiGetLineItemValue('item', 'quantity', int);
				
					if(!assemblyItems[itemId])
						{
							assemblyItems[itemId] = Number(itemQty);
						}
					else
						{
							assemblyItems[itemId] += Number(itemQty);
						}
				}
		}
	
	// Get the relative url of the suitelet 
	//
	var url = nlapiResolveURL('SUITELET', 'customscript_bbs_chk_assm_suitelet', 'customdeploy_bbs_chk_assm_suitelet');

	url = url + '&items=' + JSON.stringify(assemblyItems);
	
	// Open a new window
	//
	window.open(url, '_blank', 'Assembly Build Requirements', 'menubar=no, titlebar=no, toolbar=no, scrollbars=no, resizable=yes');

}