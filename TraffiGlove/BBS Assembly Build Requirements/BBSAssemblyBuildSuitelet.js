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
			var itemsParam = request.getParameter('items');
			var mode = request.getParameter('mode');
				
			//Re-hydrate the json object
			//
			var items = JSON.parse(itemsParam);
			
			// Create a form
			//
			var form = nlapiCreateForm('Assembly Build Requirements', true);
			form.setTitle('Assembly Build Checking For Sales Order');
			
			var tab = form.addTab('custpage_tab_components', 'Assembly Components');
			tab.setLabel('Assembly Components');
			
			var subList2 = form.addSubList('custpage_sublist_summary', 'list', 'Components Summary', 'custpage_tab_components');
			subList2.setLabel('Base Item Summary');
			
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
			var sublist2ItemStocked = subList2.addField('custpage_sublist2_item_stocked', 'checkbox', 'Stocked', null);
			var sublist2Qty = subList2.addField('custpage_sublist2_qty', 'float', 'Qty Required', null);
			var sublist2QtyAvail = subList2.addField('custpage_sublist2_qty_avail', 'float', 'Qty Available', null);
			var sublist2QtyOnOrder = subList2.addField('custpage_sublist2_qty_onord', 'float', 'Qty On Order', null);
			var sublist2QtyBackOrder = subList2.addField('custpage_sublist2_qty_back', 'float', 'Qty Back Ordered', null);
			var sublist2QtyInTransit = subList2.addField('custpage_sublist2_qty_intran', 'float', 'Qty In Transit', null);
			
			sublist2ItemStocked.setDisplayType('disabled');
			
			var bomList = new Array();
			var lineNo = Number(0);
			var level = Number(1);
			var componentSummary = {};
	
			//Loop round the assembly items
			//
			
			for ( var itemId in items) 
				{
					var itemQty = Number(items[itemId]);
					
					level = Number(1);
					explodeBom(itemId, bomList, componentSummary, level, itemQty, true, itemId, itemQty) ;		
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
			var itemIdArray = [];
			
			/*
			
			var ordered = {};
			Object.keys(componentSummary).sort().forEach(function(key) {
			  ordered[key] = componentSummary[key];
			});
					
				
			for ( var memberItem in ordered) 
				{
					itemIdArray.push(ordered[memberItem][0]);
				}
			*/
			
			for ( var memberItem in componentSummary) 
				{
					itemIdArray.push(componentSummary[memberItem][0]);
				}
				
			var itemSearch = null;
					
			if(itemIdArray.length > 0)
				{
					itemSearch = nlapiSearchRecord("item",null,
							[
							   ["internalid","anyof",itemIdArray], 
							   "AND", 
							   ["inventorylocation.makeinventoryavailable","is","T"]
							], 
							[
							   new nlobjSearchColumn("internalid",null,"GROUP"), 
							   new nlobjSearchColumn("custitem_bbs_item_stocked",null,"GROUP"), 
							   new nlobjSearchColumn("locationquantityavailable",null,"SUM"), 
							   new nlobjSearchColumn("locationquantitybackordered",null,"SUM"), 
							   new nlobjSearchColumn("locationquantitycommitted",null,"SUM"), 
							   new nlobjSearchColumn("locationquantityintransit",null,"SUM"), 
							   new nlobjSearchColumn("locationquantityonhand",null,"SUM"), 
							   new nlobjSearchColumn("locationquantityonorder",null,"SUM")
							]
							);
				}
				
			var itemQtyData = {};
				
			if(itemSearch && itemSearch.length > 0)
				{
					for (var int2 = 0; int2 < itemSearch.length; int2++) 
						{
							var resultItemId = itemSearch[int2].getValue("internalid",null,"GROUP");
							var resultItemStocked = itemSearch[int2].getValue("custitem_bbs_item_stocked",null,"GROUP");
							var resultQtyAvail = itemSearch[int2].getValue("locationquantityavailable",null,"SUM");
							var resultQtyBack = itemSearch[int2].getValue("locationquantitybackordered",null,"SUM");
							var resultQtyCommit = itemSearch[int2].getValue("locationquantitycommitted",null,"SUM");
							var resultQtyInTran = itemSearch[int2].getValue("locationquantityintransit",null,"SUM");
							var resultQtyOnHand = itemSearch[int2].getValue("locationquantityonhand",null,"SUM");
							var resultQtyOnOrder = itemSearch[int2].getValue("locationquantityonorder",null,"SUM");
								
							itemQtyData[resultItemId] = [resultQtyAvail,resultQtyBack,resultQtyCommit,resultQtyInTran,resultQtyOnHand,resultQtyOnOrder,resultItemStocked];
						}
				}
					
			//for ( var memberItem in ordered) 
			for ( var memberItem in componentSummary) 
				{
					var memberData = componentSummary[memberItem];
						
					//Determine the qty available in stock
					//
					var qtyAvailable = Number(0);
						
					//qtyAvailable = Number(itemQtyData[ordered[memberItem][0]][0]);
					qtyAvailable = Number(itemQtyData[componentSummary[memberItem][0]][0]);
						
					if (Number(memberData[2]) > qtyAvailable)
						{
							subList2.setLineItemValue('custpage_sublist2_status', linenum, 'Insufficient Stock');
						}
					else
						{
							subList2.setLineItemValue('custpage_sublist2_status', linenum, 'Ok');
						}
					subList2.setLineItemValue('custpage_sublist2_item', linenum, memberData[1]);
					//subList2.setLineItemValue('custpage_sublist2_item_txt', linenum, nlapiLookupField('item', memberData[0], 'description', false));
					subList2.setLineItemValue('custpage_sublist2_item_txt', linenum, memberData[3]);
					subList2.setLineItemValue('custpage_sublist2_qty', linenum, memberData[2]);
					subList2.setLineItemValue('custpage_sublist2_qty_avail', linenum, qtyAvailable);
						
					//subList2.setLineItemValue('custpage_sublist2_qty_onord', linenum, Number(itemQtyData[ordered[memberItem][0]][5]));
					//subList2.setLineItemValue('custpage_sublist2_qty_back', linenum, Number(itemQtyData[ordered[memberItem][0]][1]));
					//subList2.setLineItemValue('custpage_sublist2_qty_intran', linenum, Number(itemQtyData[ordered[memberItem][0]][3]));
					//subList2.setLineItemValue('custpage_sublist2_item_stocked', linenum, itemQtyData[ordered[memberItem][0]][6]);
					
					subList2.setLineItemValue('custpage_sublist2_qty_onord', linenum, Number(itemQtyData[componentSummary[memberItem][0]][5]));
					subList2.setLineItemValue('custpage_sublist2_qty_back', linenum, Number(itemQtyData[componentSummary[memberItem][0]][1]));
					subList2.setLineItemValue('custpage_sublist2_qty_intran', linenum, Number(itemQtyData[componentSummary[memberItem][0]][3]));
					subList2.setLineItemValue('custpage_sublist2_item_stocked', linenum, itemQtyData[componentSummary[memberItem][0]][6]);
					
					linenum++;
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
function explodeBom(topLevelAssemblyId, bomList, componentSummary, level, requiredQty, topLevel, itemId, itemQty)
{
	
	//var assemblyRecord = nlapiLoadRecord('assemblyitem', topLevelAssemblyId);
	
	nlapiLogExecution('DEBUG', topLevelAssemblyId + ' Remaining Usage', nlapiGetContext().getRemainingUsage());
	
	var assemblyitemSearch = nlapiSearchRecord("assemblyitem",null,
			[
			   ["type","anyof","Assembly"], 
			   "AND", 
			   ["internalid","anyof",topLevelAssemblyId]
			], 
			[
			   new nlobjSearchColumn("itemid").setSort(false), 
			   new nlobjSearchColumn("description"),
			   new nlobjSearchColumn("itemid","memberItem",null), 
			   new nlobjSearchColumn("description","memberItem",null), 
			   new nlobjSearchColumn("internalid","memberItem",null), 
			   new nlobjSearchColumn("memberquantity"), 
			   new nlobjSearchColumn("memberitemsource"), 
			   new nlobjSearchColumn("type","memberItem",null)
			]
			);

	if(topLevel)
		{
			//var topLevelDescription = assemblyRecord.getFieldValue('description');
			//var topLevelItemId = assemblyRecord.getFieldValue('itemid');
		
			var topLevelDescription = assemblyitemSearch[0].getValue("description");
			var topLevelItemId = assemblyitemSearch[0].getValue("itemid");
		
			var topLevelData = [0,itemId,topLevelItemId,topLevelDescription,'',itemQty,'Assembly',''];
		
			bomList.push(topLevelData);
		
		}
	
	for (var int = 0; int < assemblyitemSearch.length; int++) 
		{
			var memberItem = assemblyitemSearch[int].getValue("internalid","memberItem");
			var memberItemText = assemblyitemSearch[int].getValue("itemid","memberItem");
			var memberDesc = assemblyitemSearch[int].getValue("description","memberItem");
			var memberUnit = '';
			var memberQty = Number(assemblyitemSearch[int].getValue("memberquantity")) * requiredQty;
			var memberType = assemblyitemSearch[int].getValue("type","memberItem");
			var memberSource = assemblyitemSearch[int].getValue("memberitemsource");
	
			var lineData = [level,memberItem,memberItemText,memberDesc,memberUnit,memberQty,memberType,memberSource];
			
			bomList.push(lineData);
			
			//We only want inventory items in the component summary
			//
			if (memberType == 'InvtPart')
				{
					if(!componentSummary[memberItem])
						{
							componentSummary[memberItemText] = [memberItem,memberItemText,memberQty,memberDesc];
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
					explodeBom(memberItem, bomList, componentSummary, level + 1, requiredQty, false, null, null);
				}
		}
	
	/*
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
					explodeBom(memberItem, bomList, componentSummary, level + 1, requiredQty, false, null, null);
				}
		}
		*/
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
