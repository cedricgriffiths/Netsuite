/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       20 Mar 2018     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{
	var salesOrders = {};
	
	//Search for works orders that are in process, planned or released & the commitment status is not fully committed
	//
	var woSearch = nlapiCreateSearch("workorder",
			[
			   ["type","anyof","WorkOrd"], 
			   "AND", 
			   ["mainline","is","T"], 
			   "AND", 
			   ["status","anyof","WorkOrd:B","WorkOrd:A","WorkOrd:D"],
			   "AND", 
			   ["custbody_bbs_commitment_status","noneof","2"]
			], 
			[
			   new nlobjSearchColumn("trandate",null,null).setSort(false), 
			   new nlobjSearchColumn("tranid",null,null), 
			   new nlobjSearchColumn("entity",null,null), 
			   new nlobjSearchColumn("custbody_bbs_commitment_status",null,null)
			]
			);
	
	//Run the search
	//
	var searchResult = woSearch.runSearch();
	
	//Get the initial set of results
	//
	var start = 0;
	var end = 1000;
	var workorderSearch = searchResult.getResults(start, end);
	var resultlen = workorderSearch.length;

	//If there is more than 1000 results, page through them
	//
	while (resultlen == 1000) 
		{
				start += 1000;
				end += 1000;

				var moreSearchResultSet = searchResult.getResults(start, end);
				resultlen = moreSearchResultSet.length;

				workorderSearch = workorderSearch.concat(moreSearchResultSet);
		}
	
	//Search for works orders that are in process, planned or released & the commitment status is fully committed & there are items on back order
	//
	var workorderSearch2 = nlapiSearchRecord("workorder",null,
			[
			   ["type","anyof","WorkOrd"], 
			   "AND", 
			   ["mainline","is","F"], 
			   "AND", 
			   ["status","anyof","WorkOrd:D","WorkOrd:A","WorkOrd:B"], 
			   "AND", 
			   ["formulanumeric: {quantity}-{quantitycommitted}-{quantityshiprecv}","greaterthan","0"], 
			   "AND", 
			   ["custbody_bbs_commitment_status","anyof","2"]
			], 
			[
			   new nlobjSearchColumn("trandate").setSort(false), 
			   new nlobjSearchColumn("tranid"), 
			   new nlobjSearchColumn("entity"), 
			   new nlobjSearchColumn("custbody_bbs_commitment_status")
			]
			);
	
	if(workorderSearch2 != null && workorderSearch2.length > 0)
		{
			if(workorderSearch)
				{
					workorderSearch = workorderSearch.concat(workorderSearch2);
				}
			else
				{
					workorderSearch = workorderSearch2;
				}
		}
	
	if(workorderSearch)
		{
			nlapiLogExecution('DEBUG', 'W/O to process', workorderSearch.length);
			
			for (var int2 = 0; int2 < workorderSearch.length; int2++) 
				{
					var woSearchId = workorderSearch[int2].getId();
					
					checkResources();
					
					//nlapiLogExecution('DEBUG', 'W/O id to process', woSearchId);
					//nlapiLogExecution('DEBUG', 'W/O count', int2);
					
					//Get the new record & also its status
					//
					var newRecord = null;
					
					try
						{
							newRecord = nlapiLoadRecord('workorder', woSearchId );
						}
					catch(err)
						{
							newRecord = null;
						}
					
					if(newRecord)
						{
							var newStatus = newRecord.getFieldValue('status');
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
									var lineItemUsedInBuild = Number(newRecord.getLineItemValue('item', 'quantityfulfilled', int));
									var lineItemItemId = newRecord.getLineItemValue('item', 'item', int);
									var lineItemType = newRecord.getLineItemValue('item', 'itemtype', int);
									
									lineItemCommitted = (lineItemCommitted == null ? Number(0) : lineItemCommitted);
									lineItemUsedInBuild = (lineItemUsedInBuild == null ? Number(0) : lineItemUsedInBuild);
									
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
											if(lineItemQuantity == (lineItemCommitted + lineItemUsedInBuild) || newStatus == 'Built')
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
										
										var newCreatedFrom = newRecord.getFieldValue('createdfrom');
										
										if(newCreatedFrom != null && newCreatedFrom != '')
											{
												salesOrders[newCreatedFrom] = newCreatedFrom;
											}
									}
							
							nlapiSubmitRecord(newRecord, false, true);
						}
				}
		}
	
	
	
	//=============================================================================================
	//Code to check status of associated sales order
	//=============================================================================================
	//
	//nlapiLogExecution('DEBUG', 'S/O to process', Object.keys(salesOrders).length);
	nlapiLogExecution('DEBUG', 'S/O to process', JSON.stringify(salesOrders));
	var counter = Number(0);
	
	for ( var newCreatedFrom in salesOrders) 
		{
			counter++;
	
			//Have we got a created from?
			//
			if(newCreatedFrom != null && newCreatedFrom != '')
				{
					var salesOrderRecord = null;
								
					//nlapiLogExecution('DEBUG', 'S/O id processing', newCreatedFrom);
					//nlapiLogExecution('DEBUG', 'S/O count', counter);
									
					checkResources();
									
					try
						{
							salesOrderRecord = nlapiLoadRecord('salesorder', newCreatedFrom);
						}
					catch(error)
						{
							salesOrderRecord = null;
						}
									
					if(salesOrderRecord)
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
												//salesOrderRecord.setFieldValue('custbody_bbs_commitment_status', 2);
												nlapiSubmitField('salesorder', newCreatedFrom, 'custbody_bbs_commitment_status', 2, false);
												break;
																
											case false:
												if(committedWorksOrders == 0)
													{
														//salesOrderRecord.setFieldValue('custbody_bbs_commitment_status', 3);
														nlapiSubmitField('salesorder', newCreatedFrom, 'custbody_bbs_commitment_status', 3, false);
													}
												else
													{
														//salesOrderRecord.setFieldValue('custbody_bbs_commitment_status', 1);
														nlapiSubmitField('salesorder', newCreatedFrom, 'custbody_bbs_commitment_status', 1, false);
													}
												break;
										}
															
									//nlapiSubmitRecord(salesOrderRecord, false, true);
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

function checkResources()
{
	var remaining = parseInt(nlapiGetContext().getRemainingUsage());
	
	if(remaining < 200)
		{
			nlapiYieldScript();
		}
}
