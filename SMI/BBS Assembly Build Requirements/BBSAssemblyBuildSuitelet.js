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
		//=============================================================================================
		//Prototypes
		//=============================================================================================
		//
		String.prototype.repeat = function(count) 
			{
		    	if (count < 1) return '';
		    	
		    	var result = '', pattern = this.valueOf();
		    	
		    	while (count > 1) 
		    	{
		    		if (count & 1) result += pattern;
		    		
		    		count >>>= 1, pattern += pattern;
		    	}
		    	
		    	return result + pattern;
			};
		  

		//=============================================================================================
		//Start of main code
		//=============================================================================================
		//
		  
		  
		//Get request - so return a form for the user to process
		//
		
		//Get parameters
		//
		var salesOrderId = request.getParameter('salesorderid');
		var mode = request.getParameter('mode');
			
		//Load the sales order
		//
		salesOrderRecord = nlapiLoadRecord('salesorder', salesOrderId);
		var salesOrder = salesOrderRecord.getFieldValue('tranid');
		
		// Create a form
		//
		var form = nlapiCreateForm('Assembly Build Requirements', (mode == 'showmenu' ? false : true));
		form.setTitle('Assembly Build Checking For Sales Order ' + salesOrder);
		
		var salesOrderField = form.addField('custpage_sales_order_id', 'text', 'Sales Order Id', null, null);
		salesOrderField.setDisplayType('hidden');
		salesOrderField.setDefaultValue(salesOrderId);
		
		var modeField = form.addField('custpage_mode', 'text', 'mode', null, null);
		modeField.setDisplayType('hidden');
		modeField.setDefaultValue(mode);
		
		var tab = form.addTab('custpage_tab_components', 'Assembly Components');
		tab.setLabel('Assembly Components');
		
		var subList2 = form.addSubList('custpage_sublist_summary', 'list', 'Components Summary', 'custpage_tab_components');
		subList2.setLabel('Components Summary');
		
		var subList1 = form.addSubList('custpage_sublist_comps', 'list', 'Assembly Components', 'custpage_tab_components');
		subList1.setLabel('Assembly Components');
		
		var sublist1Level = subList1.addField('custpage_sublist1_level', 'text', 'Level', null);
		var sublist1ItemUrl = subList1.addField('custpage_sublist1_item_url', 'url', 'View', null);
		var sublist1Item = subList1.addField('custpage_sublist1_item', 'text', 'Item', null);
		var sublist1ItemText = subList1.addField('custpage_sublist1_item_txt', 'text', 'Description', null);
		var sublist1Type = subList1.addField('custpage_sublist1_type', 'text', 'Type', null);
		var sublist1Unit = subList1.addField('custpage_sublist1_unit', 'text', 'Unit', null);
		var sublist1Qty = subList1.addField('custpage_sublist1_qty', 'float', 'Qty Required', null);
		
		sublist1ItemUrl.setLinkText('View');

		var sublist2Status = subList2.addField('custpage_sublist2_status', 'text', 'Status', null);
		var sublist2Item = subList2.addField('custpage_sublist2_item', 'text', 'Item', null);
		var sublist2ItemText = subList2.addField('custpage_sublist2_item_txt', 'text', 'Description', null);
		var sublist2Qty = subList2.addField('custpage_sublist2_qty', 'float', 'Qty Required', null);
		var sublist2QtyAvail = subList2.addField('custpage_sublist2_qty_avail', 'float', 'Qty Available', null);
		
		if(mode == 'showmenu')
			{
				form.addSubmitButton('Return to Sales Order');
			}
		
		var bomList = new Array();
		var lineNo = Number(0);
		var level = Number(1);
		var componentSummary = {};

		//Load the sales order
		//
		salesOrderRecord = nlapiLoadRecord('salesorder', salesOrderId);
		
		if (salesOrderRecord)
			{
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

							//Output the top level assembly item, then explode the BOM
							//
							var assemblyRecord = nlapiLoadRecord('assemblyitem', itemId);
							var topLevelDescription = assemblyRecord.getFieldValue('description');
							var topLevelItemId = assemblyRecord.getFieldValue('itemid');
							var topLevelData = [0,itemId,topLevelItemId,topLevelDescription,'',itemQty,'Assembly',''];
							
							bomList.push(topLevelData);
							
							level = Number(1);
							explodeBom(itemId, bomList, componentSummary, level, itemQty);
		
						}
				}
		
				//Fill out the bom components sublist on the suitelet form
				//
				var linenum = 1;
				var filler = '__';
				
				for (var int = 0; int < bomList.length; int++) 
				{ 
					subList1.setLineItemValue('custpage_sublist1_level', linenum, filler.repeat(Number(bomList[int][0])) + Number(bomList[int][0]).toString());			
					subList1.setLineItemValue('custpage_sublist1_item', linenum, bomList[int][2]);
					subList1.setLineItemValue('custpage_sublist1_item_url', linenum, getItemUrl(bomList[int][1], bomList[int][6]));
					subList1.setLineItemValue('custpage_sublist1_item_txt', linenum, bomList[int][3]);
					subList1.setLineItemValue('custpage_sublist1_unit', linenum, bomList[int][4]);
					subList1.setLineItemValue('custpage_sublist1_type', linenum, bomList[int][6]);
					subList1.setLineItemValue('custpage_sublist1_qty', linenum, bomList[int][5]);
					
					linenum++;
				}
				
				//Fill out the component summary sublist
				//
				linenum = 1;
				
				var ordered = {};
				Object.keys(componentSummary).sort().forEach(function(key) {
				  ordered[key] = componentSummary[key];
				});
				
				//for ( var memberItem in componentSummary) 
				for ( var memberItem in ordered) 
				{
					var memberData = componentSummary[memberItem];
					
					//Determine the qty available in stock
					//
					var qtyAvailable = Number(0);
					
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
								
								//Is the location available to sell from?
								//
								if (locationAvail == 'T')
									{
										qtyAvailable += Number(itemRecord.getLineItemValue('locations', 'quantityavailable', int2));
									}
							}
						}
					
					if (Number(memberData[2]) > qtyAvailable)
						{
							subList2.setLineItemValue('custpage_sublist2_status', linenum, 'Insufficient Stock');
						}
					else
						{
							subList2.setLineItemValue('custpage_sublist2_status', linenum, 'Ok');
						}
					
					subList2.setLineItemValue('custpage_sublist2_item', linenum, memberData[1]);
					subList2.setLineItemValue('custpage_sublist2_item_txt', linenum, nlapiLookupField('item', memberData[0], 'description', false));
					subList2.setLineItemValue('custpage_sublist2_qty', linenum, memberData[2]);
					subList2.setLineItemValue('custpage_sublist2_qty_avail', linenum, qtyAvailable);
					
					linenum++;
				}
		}
		response.writePage(form);
	}
	else
	{
		var paramMode = request.getParameter('custpage_mode');
		
		if(paramMode == 'showmenu')
		{
			var paramSalesOrderId = request.getParameter('custpage_sales_order_id');
			nlapiSetRedirectURL('RECORD', 'salesorder', paramSalesOrderId, false, null);
		}
	}
}


//=============================================================================================
//Functions
//=============================================================================================
//
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
		var memberType = assemblyRecord.getLineItemValue('member', 'sitemtype', int);
		var memberSource = assemblyRecord.getLineItemValue('member', 'itemsource', int);

		var lineData = [level,memberItem,memberItemText,memberDesc,memberUnit,memberQty,memberType,memberSource];
		
		bomList.push(lineData);
		
		//We only want inventory items in the component summary
		//
		if (memberType == 'InvtPart')
			{
				if(!componentSummary[memberItem])
					{
						componentSummary[memberItemText] = [memberItem,memberItemText,memberQty];
					}
				else
					{
						componentSummary[memberItemText][2] += memberQty;
					}
			}
		
		//If we have found another assembly, then explode that as well
		//
		if(memberType == 'Assembly')
			{
				explodeBom(memberItem, bomList, componentSummary, level + 1, requiredQty);
			}
	}
}

//Get the url of the item record
//
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
