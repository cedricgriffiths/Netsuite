/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       20 Feb 2017     cedricgriffiths
 *
 */

function libFindLine(record, sublist, lineNo)
{
	var lines = record.getLineItemCount(sublist);
	var returnLine = 0;
	
	for (var int = 1; int <= lines; int++) 
	{
		var thisLineNo = Number(record.getLineItemValue(sublist, 'line', int));
		
		if(thisLineNo == Number(lineNo))
			{
				returnLine = int;
				break;
			}
	}
	
	return returnLine;
}


function libFindPurchaseOrders(supplier, poNo, item) {
	
	//Run a search to find purchase orders
	//
	var filters = new Array();
	filters[0] = new nlobjSearchFilter('mainline', null, 'is', 'F');
	filters[1] = new nlobjSearchFilter('type', null, 'anyof', 'PurchOrd');

	//Search for Partial Receipt or Pending Receipt
	//
	var statusArray = new Array();
    statusArray[0] = 'PurchOrd:E';
    statusArray[1] = 'PurchOrd:B';
    statusArray[2] = 'PurchOrd:D';
     
    filters[2] = new nlobjSearchFilter('status', null, 'anyof', statusArray);
	
    //Filter on quantity on container
    //
    var qtyFilter = new nlobjSearchFilter('formulanumeric', null, 'greaterthan', '0');
    qtyFilter.setFormula('NVL({quantity},0) - (NVL({quantityshiprecv},0) + NVL({custcol_bbs_consignment_allocated},0))');
    filters[3] = qtyFilter;
    
    //If we are searching by supplier then add this to the filters
    //
	if (supplier)
		{
			filters[filters.length] = new nlobjSearchFilter('entity', null, 'anyof', supplier);
		}
	
	//If we are searching by purchase order then add this to the filters
    //
	if (poNo)
		{
			filters[filters.length] = new nlobjSearchFilter('internalid', null, 'anyof', poNo);
		}
	
	if (item)
		{
			filters[filters.length] = new nlobjSearchFilter('itemid', 'item', 'contains', item);
		}

	var columns = new Array();
	columns[0] = new nlobjSearchColumn('tranid').setSort(false);
	columns[1] = new nlobjSearchColumn('line').setSort(false);
	columns[2] = new nlobjSearchColumn('trandate');
	columns[3] = new nlobjSearchColumn('rate');
	columns[4] = new nlobjSearchColumn('quantity');
	columns[5] = new nlobjSearchColumn('amount');
	columns[6] = new nlobjSearchColumn('item');
	columns[7] = new nlobjSearchColumn('quantityshiprecv');
	columns[8] = new nlobjSearchColumn('custcol_bbs_consignment_allocated');
	columns[9] = new nlobjSearchColumn('entityid','vendor');
	
	var colRemaining = new nlobjSearchColumn('formulanumeric');
	colRemaining.setFormula('NVL({quantity},0) - (NVL({quantityshiprecv},0) + NVL({custcol_bbs_consignment_allocated},0))');
	
	columns[10] = colRemaining;
	columns[11] = new nlobjSearchColumn('memo');
	columns[12] = new nlobjSearchColumn('weight','item');
	columns[13] = new nlobjSearchColumn('internalid','vendor');
	columns[14] = new nlobjSearchColumn('exchangerate');
	columns[15] = new nlobjSearchColumn('currency');
	
	//var results = nlapiSearchRecord('transaction', null, filters, columns);
	
	//return results;
	
	var poSearch = nlapiCreateSearch('transaction', filters, columns);
	var searchResult = poSearch.runSearch();
	
	//Get the initial set of results
	//
	var start = 0;
	var end = 1000;
	var searchResultSet = searchResult.getResults(start, end);
	var resultlen = searchResultSet.length;

	//If there is more than 1000 results, page through them
	//
	while (resultlen == 1000) 
		{
				start += 1000;
				end += 1000;

				var moreSearchResultSet = searchResult.getResults(start, end);
				resultlen = moreSearchResultSet.length;

				searchResultSet = searchResultSet.concat(moreSearchResultSet);
		}
	
	return searchResultSet;

	
	/*
	var suppliers = {};
	var pos = {};
	
	if (results)
		{
			//Copy the results to the sublist
			//
			for (var int = 0; int < results.length; int++) 
			{
				var line = int + 1;
				var poId = results[int].getId();
				
				var supplier = results[int].getValue('entityid','vendor');
				var supplierId = results[int].getValue('internalid','vendor');
				var tranid = 'Purchase Order ' + results[int].getValue('tranid');
				var lineNo = results[int].getValue('line');
				var tranDate = results[int].getValue('trandate');
				var rate = results[int].getValue('rate');
				var qty = results[int].getValue('quantity');
				var amount = results[int].getValue('amount');
				var item = results[int].getText('item');
				var itemDesc = results[int].getValue('memo');
				var recv = results[int].getValue('quantityshiprecv');
				var onCont = results[int].getValue('custcol_bbs_consignment_allocated');
				var rem = results[int].getValue('formulanumeric');
				var weight = results[int].getValue('weight','item');
				
				var poURL = nlapiResolveURL('RECORD', 'purchaseorder', poId, 'VIEW');
				
				if(!suppliers[supplier])
				{
					suppliers[supplier] = [supplier,supplierId]
				}
				
				if(!pos[poId])
				{
					pos[poId] = [results[int].getValue('tranid'),poId]
				}
			
				list1.setLineItemValue('custpage_col2', line, tranid); 
				list1.setLineItemValue('custpage_col3', line, lineNo); 
				list1.setLineItemValue('custpage_col4', line, tranDate); 
				list1.setLineItemValue('custpage_col5', line, rate); 
				list1.setLineItemValue('custpage_col6', line, qty); 
				list1.setLineItemValue('custpage_col7', line, amount); 
				list1.setLineItemValue('custpage_col8', line, item); 
				list1.setLineItemValue('custpage_col9', line, poURL);
				list1.setLineItemValue('custpage_col10', line, poId);
				list1.setLineItemValue('custpage_col11', line, recv);
				list1.setLineItemValue('custpage_col12', line, onCont);
				list1.setLineItemValue('custpage_col13', line, supplier);
				list1.setLineItemValue('custpage_col14', line, rem);
				list1.setLineItemValue('custpage_col16', line, itemDesc);
				list1.setLineItemValue('custpage_col17', line, weight);
			}
			
			if(supplierField)
				{
					supplierField.addSelectOption('0', '', true);
	
					for ( var supplier in suppliers) 
					{
						var suppData = suppliers[supplier];
						
						supplierField.addSelectOption(suppData[1], suppData[0], false);
					}
				}
			
			if(poField)
			{
				poField.addSelectOption('0', '', true);

				for ( var po in pos) 
				{
					var poData = pos[po];
					
					poField.addSelectOption(poData[1], poData[0], false);
				}
			}

		}
		*/
}

function libFindConsToDespatch(list1) 
{
	
	//Run a search to find consignments with a status of Open
	//
	var filters = new Array();
	filters[0] = new nlobjSearchFilter('custrecord_bbs_consignment_status', null, 'anyof', '1');
	
	var columns = new Array();
	columns[0] = new nlobjSearchColumn('name');
	columns[1] = new nlobjSearchColumn(getAltName());
	columns[2] = new nlobjSearchColumn('custrecord_bbs_consignment_edd');
	
	var results = nlapiSearchRecord('customrecord_bbs_consignment', null, filters, columns);
	
	if (results)
		{
			//Copy the results to the sublist
			//
			for (var int = 0; int < results.length; int++) 
			{
				var line = int + 1;
				var Id = results[int].getId();
				
				var name = results[int].getValue('name');
				var altname = results[int].getValue(getAltName());
				var expDespDate = results[int].getValue('custrecord_bbs_consignment_edd');
				
				var consURL = nlapiResolveURL('RECORD', 'customrecord_bbs_consignment', Id, 'VIEW');
				
				list1.setLineItemValue('custpage_col2', line, consURL); 
				list1.setLineItemValue('custpage_col3', line, name); 
				list1.setLineItemValue('custpage_col4', line, altname); 
				list1.setLineItemValue('custpage_col5', line, expDespDate); 
				list1.setLineItemValue('custpage_col7', line, Id); 
		
			}
		}
}

function libStockAdjustInTransit(consignmentId, direction, locationId, accountId)
{
	//Read the consignment record
	//
	var consignmentRecord = nlapiLoadRecord('customrecord_bbs_consignment', consignmentId);
	
	if (consignmentRecord)
		{
			//Get the number of lines on the consignment
			//
			var lines = consignmentRecord.getLineItemCount('recmachcustrecord_bbs_consignment_header_id');
			
			if(lines > 0)
				{
					for (var linenum = 1; linenum <= lines; linenum++) 
					{
						//Get the line values
						//
						var linePoId = consignmentRecord.getLineItemValue('recmachcustrecord_bbs_consignment_header_id', 'custrecord_bbs_con_det_po_id', linenum);
						var linePoLine = consignmentRecord.getLineItemValue('recmachcustrecord_bbs_consignment_header_id', 'custrecord_bbs_con_det_po_line', linenum);
						var lineAllocated = consignmentRecord.getLineItemValue('recmachcustrecord_bbs_consignment_header_id', 'custrecord_bbs_con_det_allocated', linenum);
						
						//Read the purchase order from the consignment line
						//
						var poRecord = nlapiLoadRecord('purchaseorder', linePoId);
						
						if (poRecord)
							{
								//Get the item from the relevant po line
								//
								var item = poRecord.getLineItemValue('item', 'item', linePoLine);
								
								if(item)
									{
										//Create a stock adjustment for the item
										//
										var invAdjRecord = nlapiCreateRecord('inventoryadjustment', {recordmode: 'dynamic'});
										
										invAdjRecord.setFieldValue('account', accountId);
										invAdjRecord.setFieldValue('adjlocation', locationId);
										
										//sublist is 'inventory'
										invAdjRecord.selectNewLineItem('inventory');
										invAdjRecord.setCurrentLineItemValue('inventory', 'item', item);
										invAdjRecord.setCurrentLineItemValue('inventory', 'location', locationId);
										
										switch (direction)
										{
										case 'IN':
											lineAllocated = lineAllocated * 1.0;
											break;
											
										case 'OUT':
											lineAllocated = lineAllocated * -1.0;
											break;
										}
										
										invAdjRecord.setCurrentLineItemValue('inventory', 'adjustqtyby', lineAllocated);
										
										invAdjRecord.commitLineItem('inventory');
										var invTranId = nlapiSubmitRecord(invAdjRecord, true, true);
										
										switch (direction)
										{
										case 'IN':
											consignmentRecord.setLineItemValue('recmachcustrecord_bbs_consignment_header_id', 'custrecord_bbs_cons_det_it_in', linenum, invTranId);
											break;
											
										case 'OUT':
											consignmentRecord.setLineItemValue('recmachcustrecord_bbs_consignment_header_id', 'custrecord_bbs_cons_det_it_out', linenum, invTranId);
											break;
										}
									}
							}
					}
				}
			
			nlapiSubmitRecord(consignmentRecord, false, true);
		}
}

function libFindConsignments(list1) {
	
	//Run a search to find open consignments
	//
	var filters = new Array();
	filters[0] = new nlobjSearchFilter('custrecord_bbs_consignment_status', null, 'anyof', '1');

	
	var columns = new Array();
	columns[0] = new nlobjSearchColumn('name');
	columns[1] = new nlobjSearchColumn(getAltName());
	columns[2] = new nlobjSearchColumn('custrecordbbs_consignment_container_no');
	
	var results = nlapiSearchRecord('customrecord_bbs_consignment', null, filters, columns);
	
	if (results)
		{
			//Copy the results to the sublist
			//
			for (var int = 0; int < results.length; int++) 
			{
				var line = int + 1;
				
				var conId = results[int].getId();
				var id = results[int].getValue('name');
				var shipRef = results[int].getValue(getAltName());
				var containerNo = results[int].getValue('custrecordbbs_consignment_container_no');
			
				list1.setLineItemValue('custpage_cons_id', line, id); 
				list1.setLineItemValue('custpage_cons_shipref', line, shipRef); 
				list1.setLineItemValue('custpage_cons_container', line, containerNo); 
				list1.setLineItemValue('custpage_cons_int_id', line, conId); 

			}
		}
}

function libFindInTransitConsignments(list1) {
	
	//Run a search to find in transit consignments
	//
	var filters = new Array();
	filters[0] = new nlobjSearchFilter('custrecord_bbs_consignment_status', null, 'anyof', '2');

	
	var columns = new Array();
	columns[0] = new nlobjSearchColumn('name');
	columns[1] = new nlobjSearchColumn(getAltName());
	columns[2] = new nlobjSearchColumn('custrecordbbs_consignment_container_no');
	columns[3] = new nlobjSearchColumn('custrecord_bbs_consignment_ead');
	
	var results = nlapiSearchRecord('customrecord_bbs_consignment', null, filters, columns);
	
	if (results)
		{
			//Copy the results to the sublist
			//
			for (var int = 0; int < results.length; int++) 
			{
				var line = int + 1;
				
				var conId = results[int].getId();
				var id = results[int].getValue('name');
				var shipRef = results[int].getValue(getAltName());
				var containerNo = results[int].getValue('custrecordbbs_consignment_container_no');
				var ead = results[int].getValue('custrecord_bbs_consignment_ead');
				
				list1.setLineItemValue('custpage_col2', line, id); 
				list1.setLineItemValue('custpage_col3', line, shipRef); 
				list1.setLineItemValue('custpage_col4', line, containerNo); 
				list1.setLineItemValue('custpage_col5', line, conId); 
				list1.setLineItemValue('custpage_col6', line, ead); 
			}
		}
}

function libFindLandedCostCategories() {
	
	//Run a search to find cost categories of type Landed Cost
	//
	var filters = new Array();
	filters[0] = new nlobjSearchFilter('itemcosttype', null, 'anyof', 'LANDED');
    filters[1] = new nlobjSearchFilter('isinactive', null, 'is', 'F');

	var columns = new Array();
	columns[0] = new nlobjSearchColumn('name');
	columns[1] = new nlobjSearchColumn('account');
	columns[2] = new nlobjSearchColumn('internalid').setSort(false);

	var results = nlapiSearchRecord('costcategory', null, filters, columns);
	var returnData = {};
	
	if (results)
		{
			for (var int = 0; int < results.length; int++) 
			{
				var lcId = results[int].getId();
				var lcName = results[int].getValue('name');
				var lcAccountId = results[int].getValue('account');
				var lcAccountTxt = results[int].getText('account');
				
				if(!returnData[lcName])
					{
						returnData[lcName] = [lcId, lcName, lcAccountId, lcAccountTxt];
					}
			}
		}
	
	return returnData;
}

function libFindNotClosedConsignments(list1) {
	
	//Run a search to find open consignments
	//
	var filters = new Array();
	filters[0] = new nlobjSearchFilter('custrecord_bbs_consignment_status', null, 'noneof', '5');

	
	var columns = new Array();
	columns[0] = new nlobjSearchColumn('name');
	columns[1] = new nlobjSearchColumn(getAltName());
	columns[2] = new nlobjSearchColumn('custrecordbbs_consignment_container_no');
	columns[3] = new nlobjSearchColumn('custrecord_bbs_consignment_status');
	
	var results = nlapiSearchRecord('customrecord_bbs_consignment', null, filters, columns);
	
	if (results)
		{
			//Copy the results to the sublist
			//
			for (var int = 0; int < results.length; int++) 
			{
				var line = int + 1;
				
				var conId = results[int].getId();
				var id = results[int].getValue('name');
				var shipRef = results[int].getValue(getAltName());
				var containerNo = results[int].getValue('custrecordbbs_consignment_container_no');
				var status = results[int].getText('custrecord_bbs_consignment_status');
				
				list1.setLineItemValue('custpage_col2', line, id); 
				list1.setLineItemValue('custpage_col3', line, shipRef); 
				list1.setLineItemValue('custpage_col4', line, containerNo); 
				list1.setLineItemValue('custpage_col5', line, conId); 
				list1.setLineItemValue('custpage_col6', line, status); 

			}
		}
}

function libFindReceivedConsignments(list1) {
	
	//Run a search to find in transit consignments
	//
	var filters = new Array();
	filters[0] = new nlobjSearchFilter('custrecord_bbs_consignment_status', null, 'anyof', '3');

	
	var columns = new Array();
	columns[0] = new nlobjSearchColumn('name');
	columns[1] = new nlobjSearchColumn(getAltName());
	columns[2] = new nlobjSearchColumn('custrecordbbs_consignment_container_no');
	columns[3] = new nlobjSearchColumn('custrecord_bbs_consignment_ead');
	columns[4] = new nlobjSearchColumn('custrecord_bbs_consignment_aad');
	
	var results = nlapiSearchRecord('customrecord_bbs_consignment', null, filters, columns);
	
	if (results)
		{
			//Copy the results to the sublist
			//
			for (var int = 0; int < results.length; int++) 
			{
				var line = int + 1;
				
				var conId = results[int].getId();
				var id = results[int].getValue('name');
				var shipRef = results[int].getValue(getAltName());
				var containerNo = results[int].getValue('custrecordbbs_consignment_container_no');
				var ead = results[int].getValue('custrecord_bbs_consignment_ead');
				var aad = results[int].getValue('custrecord_bbs_consignment_aad');
				
				list1.setLineItemValue('custpage_col2', line, id); 
				list1.setLineItemValue('custpage_col3', line, shipRef); 
				list1.setLineItemValue('custpage_col4', line, containerNo); 
				list1.setLineItemValue('custpage_col5', line, conId); 
				list1.setLineItemValue('custpage_col6', line, ead); 
				list1.setLineItemValue('custpage_col7', line, aad); 
			}
		}
}

//Function used to check to see if the "altname" field is present, which it will be if we are using auto numbering
//If it is not present then we will have to use "name" instead
//
function getAltName()
{
	var returnFieldName = 'altname';
	var newConsignmentRec = nlapiCreateRecord('customrecord_bbs_consignment');
	var allFields = newConsignmentRec.getAllFields();
	
	if(allFields.indexOf('altname') == -1)
		{
			returnFieldName = 'name';
		}
	
	return returnFieldName;
}
