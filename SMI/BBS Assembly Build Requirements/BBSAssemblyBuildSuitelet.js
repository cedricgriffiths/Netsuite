/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       12 Jul 2017     cedricgriffiths
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response)
{
	if (request.getMethod() == 'GET') 
	{
		String.prototype.repeat = function(count) {
		    if (count < 1) return '';
		    var result = '', pattern = this.valueOf();
		    while (count > 1) {
		      if (count & 1) result += pattern;
		      count >>>= 1, pattern += pattern;
		    }
		    return result + pattern;
		  };
		  
		//Get request - so return a form for the user to process
		//
		
		//Get parameters
		//
		//var itemId = request.getParameter('itemid');
		//var itemQty = request.getParameter('itemqty');
		var salesOrderId = request.getParameter('salesorderid');
		
		// Create a form
		//
		var form = nlapiCreateForm('Assembly Build Checking');
		form.setTitle('Assembly Build Checking');

		//var fieldGroup1 = form.addFieldGroup('custpage_grp1', 'Assembly Item');
		//var formItem = form.addField('custpage_form_assembly', 'text', 'Assembly Item', null, 'custpage_grp1');
		//formItem.setDisplayType('disabled');
		
		var tab = form.addTab('custpage_tab_components', 'Assembly Components');
		tab.setLabel('Assembly Components');
		
		var subList1 = form.addSubList('custpage_sublist_comps', 'list', 'Assembly Components', 'custpage_tab_components');
		subList1.setLabel('Assembly Components');
		
		var subList2 = form.addSubList('custpage_sublist_summary', 'list', 'Components Summary', 'custpage_tab_components');
		subList2.setLabel('Components Summary');
		
		var sublist1Level = subList1.addField('custpage_sublist1_level', 'text', 'Level', null);
		var sublist1ItemUrl = subList1.addField('custpage_sublist1_item_url', 'url', 'View', null);
		var sublist1Item = subList1.addField('custpage_sublist1_item', 'text', 'Item', null);
		var sublist1ItemText = subList1.addField('custpage_sublist1_item_txt', 'text', 'Description', null);
		var sublist1Unit = subList1.addField('custpage_sublist1_unit', 'text', 'Unit', null);
		var sublist1Qty = subList1.addField('custpage_sublist1_qty', 'float', 'Qty Req', null);
		
		sublist1ItemUrl.setLinkText('View');

		var sublist2Item = subList2.addField('custpage_sublist2_item', 'text', 'Item', null);
		var sublist2ItemText = subList2.addField('custpage_sublist2_item_txt', 'text', 'Description', null);
		var sublist2Qty = subList2.addField('custpage_sublist2_qty', 'float', 'Qty Req', null);
		var sublist2QtyAvail = subList2.addField('custpage_sublist2_qty_avail', 'float', 'Qty Avail', null);
		
		var bomList = new Array();
		var lineNo = Number(0);
		var level = Number(1);
		var componentSummary = {};

		//Load the sales order
		//
		salesOrderRecord = nlapiLoadRecord('salesorder', salesOrderId);
		
		//Loop round the order lines
		//
		var itemCount = salesOrderRecord.getLineItemCount('item');
		
		for (var int = 1; int <= itemCount; int++) 
		{
			var itemType = salesOrderRecord.getLineItemValue('item', 'itemtype', int);
			
			//Look for assemblies only
			//
			if (itemType == 'Assembly')
				{
					//Get the item id
					//
				var itemId = salesOrderRecord.getLineItemValue('item', 'item', int);
				var itemQty = Number(salesOrderRecord.getLineItemValue('item', 'quantity', int));
				
					//Get the item text
					//
					//var itemText = nlapiLookupField('item', itemId, 'itemid', false);
					//formItem.setDefaultValue(itemText);
					
					level = Number(1);
					
					explodeBom(itemId, bomList, componentSummary, level, itemQty);

				}
		}

		//Fill out the bom components sublist
		//
		var linenum = 1;
		
		for (var int = 0; int < bomList.length; int++) 
		{ 
			subList1.setLineItemValue('custpage_sublist1_level', linenum, Number(bomList[int][0]).toString());			
			subList1.setLineItemValue('custpage_sublist1_item', linenum, bomList[int][2]);
			subList1.setLineItemValue('custpage_sublist1_item_url', linenum, getItemUrl(bomList[int][1], bomList[int][6]));
			subList1.setLineItemValue('custpage_sublist1_item_txt', linenum, nlapiLookupField('item', bomList[int][1], 'description', false));
			subList1.setLineItemValue('custpage_sublist1_unit', linenum, bomList[int][4]);
			subList1.setLineItemValue('custpage_sublist1_qty', linenum, bomList[int][5]);
			
			linenum++;
		}
		
		//Fill out the component summary sublist
		//
		linenum = 1;
		
		for ( var memberItem in componentSummary) 
		{
			var memberData = componentSummary[memberItem];
			
			//Determine the qty available in stock
			//
			var qtyAvailable = Nmber(0);
			
			//Read the item
			//
			itemRecord = nlapiLoadRecord('inventoryitem', memberData[0]);
			
			if (itemRecord)
				{
					//Loop through the locations
					//
					var locationsCount = itemRecord.getLineItemCount('locations');
					
					for (var int2 = 1; int2 <= locationsCount; int2++) 
					{
						var locationId = itemRecord.getLineItemValue('locations', 'locationid', int2);
						
						var locationRecord = nlapiLoadRecord('location', locationId);
						
						var locationAvail = locationRecord.getFieldValue('makeinventoryavailable');
						
						if (locationAvail == 'T')
							{
								qtyAvailable += itemRecord.getLineItemValue('locations', 'quantityavailable', int2);
							}
					}
				}
			
			subList2.setLineItemValue('custpage_sublist2_item', linenum, memberData[1]);
			subList2.setLineItemValue('custpage_sublist2_item_txt', linenum, nlapiLookupField('item', memberData[0], 'description', false));
			subList2.setLineItemValue('custpage_sublist2_qty', linenum, memberData[2]);
			subList2.setLineItemValue('custpage_sublist2_qty_avail', linenum, qtyAvailable);
			
			linenum++;
		}

		response.writePage(form);
	}
	else
	{
		
	}
}

function explodeBom(topLevelAssemblyId, bomList, componentSummary, level, requiredQty)
{
	var assemblyRecord = nlapiLoadRecord('assemblyitem', topLevelAssemblyId);
	
	var memberCount = assemblyRecord.getLineItemCount('member');
	
	for (var int = 1; int <= memberCount; int++) 
	{
		var memberItem = assemblyRecord.getLineItemValue('member', 'item', int);
		var memberItemText = assemblyRecord.getLineItemText('member', 'item', int);
		var memberDesc = assemblyRecord.getLineItemValue('member', 'memberdescr', int);
		var memberUnit = assemblyRecord.getLineItemValue('member', 'memberunit', int);
		var memberQty = Number(assemblyRecord.getLineItemValue('member', 'quantity', int)) * requiredQty;
		var memberType = assemblyRecord.getLineItemValue('member', 'itemtype', int);
		var memberSource = assemblyRecord.getLineItemValue('member', 'itemsource', int);

		var lineData = [level,memberItem,memberItemText,memberDesc,memberUnit,memberQty,memberType,memberSource];
		
		bomList.push(lineData);
		
		if (memberType == 'inventoryitem')
			{
				if(!componentSummary[memberItem])
					{
						componentSummary[memberItem] = [memberItem,memberItemText,memberQty];
					}
				else
					{
						componentSummary[memberItem][2] = componentSummary[memberItem][2] + memberQty;
					}
			}
		
		if(memberType == 'Assembly')
			{
				explodeBom(memberItem, bomList, componentSummary, level + 1);
			}
	}
}

function getItemUrl(itemId, ItemType)
{
	var itemType = '';
	var itemURL = '';
	
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
	
	try
	{
		itemURL = nlapiResolveURL('RECORD', itemType, itemId, 'VIEW');
	}
	catch(err)
	{
		itemURL = '';
	}
	
	return itemURL;
}
