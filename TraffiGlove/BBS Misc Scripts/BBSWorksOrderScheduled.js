/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       09 Oct 2017     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{
	//Get the parameters
	//
	var context = nlapiGetContext();
	var woId = context.getSetting('SCRIPT', 'custscript_bbs_woid');
	
	//=============================================================================================
	//Code to check the w/o commitment status & set the ffi & finish
	//=============================================================================================
	//
	
	//Get the new record & also its status
	//
	var newRecord = nlapiLoadRecord('workorder', woId );
	var newStatus = newRecord.getFieldValue('status');
	
	//If the status is release, then we need to work out the commitment status
	//
	if(newStatus == 'Released' || newStatus == 'Built')
	{
		var itemCount = newRecord.getLineItemCount('item');
		var linesToCommit = Number(0);
		var linesFullyCommitted = Number(0);
		var woFullFinishItem = '';
		var woFinish = '';
		var originalCommitmentStatus = newRecord.getFieldValue('custbody_bbs_commitment_status');
		
		//Loop through the items on the works order
		//
		for (var int = 1; int <= itemCount; int++) 
		{
			var lineItemSource = newRecord.getLineItemValue('item', 'itemsource', int);
			var lineItemQuantity = Number(newRecord.getLineItemValue('item', 'quantity', int));
			var lineItemCommitted = Number(newRecord.getLineItemValue('item', 'quantitycommitted', int));
			var lineItemItemId = newRecord.getLineItemValue('item', 'item', int);
			var lineItemType = newRecord.getLineItemValue('item', 'itemtype', int);
			
			lineItemCommitted = (lineItemCommitted == null ? Number(0) : lineItemCommitted);
			
			//Get the process type from the item record
			//
			var itemProcessType = nlapiLookupField(getItemRecType(lineItemType), lineItemItemId, 'custitem_bbs_item_process_type', false);
			
			//If the process type is Full Finish Set then we want to find the finish
			//
			if (itemProcessType == 3)
				{
					//Save the full finish item id
					//
					woFullFinishItem = lineItemItemId;
					
					//Now read the FFI record to find the finish on it
					//
					var ffiRecord = nlapiLoadRecord(getItemRecType(lineItemType), lineItemItemId);
					
					if(ffiRecord)
					{
						var ffiComponents = ffiRecord.getLineItemCount('member');
						
						if(ffiComponents > 0)
						{
							var memberItemId = ffiRecord.getLineItemValue('member', 'item', 1);
							var memberItemType = ffiRecord.getLineItemValue('member', 'sitemtype', 1);
							
							var memberItemRecord = null;
							
							if (memberItemId)
								{
									memberItemRecord = nlapiLoadRecord(getItemRecType(memberItemType), memberItemId);
									
									if(memberItemRecord)
										{
											woFinish = memberItemRecord.getFieldValue('custitem_bbs_item_process_type');
										}
								}
						}								
					}
				
				}
			
			//Only stock items will have a commitment quantity
			//
			if(lineItemSource == 'STOCK' && lineItemType == 'InvtPart')
				{
					//Increment the number of lines that should be committed
					//
					linesToCommit++;
					
					//Increment the number of lines that are actually committed
					//
					if(lineItemQuantity == lineItemCommitted || newStatus == 'Built')
						{
							linesFullyCommitted++;
						}
					
				}
		}
		
		//Set the w/o commitment status
		//
		var newCommitmentStatus = '';
		
		if(linesToCommit == linesFullyCommitted)
			{
				newRecord.setFieldValue('custbody_bbs_commitment_status', 2 );
				newCommitmentStatus = '2';
			}
		else
			{
				if(linesFullyCommitted == 0)
					{
						newRecord.setFieldValue('custbody_bbs_commitment_status', 3 );
						newCommitmentStatus = '3';
					}
				else
					{
						newRecord.setFieldValue('custbody_bbs_commitment_status', 1 );
						newCommitmentStatus = '1';
					}
			}
		
		//Set the full finish item & finish to the works order
		//
		if(woFullFinishItem != '')
			{
				newRecord.setFieldValue('custbody_bbs_wo_ffi', woFullFinishItem);
			}
		
		if(woFinish != '')
			{
				newRecord.setFieldValue('custbody_bbs_wo_finish', woFinish);
			}
		
		if(originalCommitmentStatus != newCommitmentStatus)
				{
					nlapiSubmitRecord(newRecord, false, true);
				}
		
		
		//=============================================================================================
		//Code to check status of associated sales order
		//=============================================================================================
		//
		var newCreatedFrom = newRecord.getFieldValue('createdfrom');
		
		//Have we got a created from?
		//
		if(newCreatedFrom != null && newCreatedFrom != '')
			{
				var salesOrderRecord = null;
				
				try
				{
					salesOrderRecord = nlapiLoadRecord('salesorder', newCreatedFrom);
				}
				catch(error)
				{
					salesOrderRecord = null;
				}
				
				//Was the wo created from a sales order?
				//
				if(salesOrderRecord)
					{
						//Get the sales order commitment status & the current works order committment status
						//
						var salesOrderCommittmentStatus = salesOrderRecord.getFieldValue('custbody_bbs_commitment_status');
						var newWorksOrderStatus = newRecord.getFieldValue('custbody_bbs_commitment_status');
						
						//Work out if we need to check the other works orders or not
						//if s/o status is 'not fully committed' & the new w/o status is 'fully committed' OR if the s/o status is unset & the new w/o status is 'fully committed'
						//we need to check the other works orders that may link to the s/o
						//
						if((salesOrderCommittmentStatus == 1 && newWorksOrderStatus == 2) || (salesOrderCommittmentStatus == null && newWorksOrderStatus == 2))
							{
								//We need to check the other works orders
								//
								var workorderSearch = nlapiCreateSearch("workorder",
										[
										   ["mainline","is","T"], 
										   "AND", 
										   ["type","anyof","WorkOrd"], 
										   "AND", 
										   ["createdfrom","anyof",newCreatedFrom]
										], 
										[
										   new nlobjSearchColumn("createdfrom",null,null), 
										   new nlobjSearchColumn("custbody_bbs_commitment_status",null,null)
										]
										);
								
								if(workorderSearch)
									{
										var searchResult = workorderSearch.runSearch();
										
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
										
										var committedWorksOrders = Number(0);
										
										for (var int = 0; int < searchResultSet.length; int++) 
										{
											var woCommittmentStatus = searchResultSet[int].getValue('custbody_bbs_commitment_status');
											
											if(woCommittmentStatus == 2)
												{
													committedWorksOrders++;
												}
										}
										
										var allWorksOrdersCommitted = (searchResultSet.length == committedWorksOrders ? true : false);
										
										switch(allWorksOrdersCommitted)
										{
										case true:
											salesOrderRecord.setFieldValue('custbody_bbs_commitment_status', 2);
											break;
											
										case false:
											salesOrderRecord.setFieldValue('custbody_bbs_commitment_status', 1);
											break;
										}
										
										nlapiSubmitRecord(salesOrderRecord, false, true);
									}
							}
						else
							//
							//if s/o status is 'fully committed' & the new w/o status is 'not fully committed' OR if the s/o status is unset & the new w/o status is 'not fully committed'
							//then we can set the s/o to be 'not fully committed'
							//
							if((salesOrderCommittmentStatus == 2 && newWorksOrderStatus == 1) || (salesOrderCommittmentStatus == null && newWorksOrderStatus == 1))
								{
									//We need to set the sales order status to be not fully committed
									//
									salesOrderRecord.setFieldValue('custbody_bbs_commitment_status', 1);
									nlapiSubmitRecord(salesOrderRecord, false, true);
								}
					}
			}
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
			
		case 'OthCharge':
			itemType = 'otherchargeitem';
			break;
	}

	return itemType;
}
