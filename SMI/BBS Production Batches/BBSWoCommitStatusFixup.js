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
			   new nlobjSearchColumn("custbody_bbs_commitment_status",null,null), 
			   new nlobjSearchColumn("statusref",null,null)
			]
			);
	
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
					
					//Get the new record & also its status
					//
					var newRecord = null;
					
					try
						{
							newRecord = nlapiLoadRecord('workorder', woSearchId );
						}
					catch(err)
						{
							nlapiLogExecution('ERROR', 'Error loading works order', err.message)
							newRecord = null;
						}
					
					if(newRecord != null)
						{
							var newStatus = newRecord.getFieldValue('status');
							var assemblyId = newRecord.getFieldValue('assemblyitem');
							var itemCount = newRecord.getLineItemCount('item');
							var woQuantity = Number(newRecord.getFieldValue('quantity'));
							var linesToCommit = Number(0);
							var linesFullyCommitted = Number(0);
							var woFullFinishItem = '';
							var woFinish = '';
							var woLogo = '';
							var woLogoType = '';
							var machine = '';
							var lastLevelOneItem = '';
							var totalQuantity = Number(0);
							var totalCommitted = Number(0);
							var totalUsedInBuild = Number(0);
							var lowestCommitted = Number(99999);
							var logoQuantity = Number(0);
							
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
									var lineItemsource = newRecord.getLineItemValue('item', 'itemsource', int);
									var lineItemLevel = Number(newRecord.getLineItemValue('item', 'assemblylevel', int));
									
									lineItemCommitted = (lineItemCommitted == null ? Number(0) : lineItemCommitted);
									lineItemUsedInBuild = (lineItemUsedInBuild == null ? Number(0) : lineItemUsedInBuild);
									
									if(lineItemsource == 'PHANTOM')
										{
											woLogo = lineItemItemId;
											woLogoType = nlapiLookupField(getItemRecType(lineItemType), lineItemItemId, 'custitem_bbs_item_process_type', false);
											machine = nlapiLookupField(getItemRecType(lineItemType), lineItemItemId, 'custitem_bbs_item_machine', true);
											//logoQuantity += lineItemQuantity;
										}
									
									//Work out the logo quantities by looking for items at assembly level 2
									//
									if(lineItemLevel == 2)
										{
											logoQuantity += lineItemQuantity;
										}
									
		//SMI						//Get the process type from the item record
		//							//
		//							var itemProcessType = nlapiLookupField(getItemRecType(lineItemType), lineItemItemId, 'custitem_bbs_item_process_type', false);
		//							
		//							//If the process type is Full Finish Set then we want to find the finish
		//							//
		//							if (itemProcessType == 3)
		//								{
		//									//Save the full finish item id
		//									//
		//									woFullFinishItem = lineItemItemId;
		//									
		//									//Now read the FFI record to find the finish on it
		//									//
		//									var ffiRecord = nlapiLoadRecord(getItemRecType(lineItemType), lineItemItemId);
		//									
		//									if(ffiRecord)
		//										{
		//											var ffiComponents = ffiRecord.getLineItemCount('member');
		//										
		//											if(ffiComponents > 0)
		//												{
		//													var memberItemId = ffiRecord.getLineItemValue('member', 'item', 1);
		//													var memberItemType = ffiRecord.getLineItemValue('member', 'sitemtype', 1);
		//												
		//													var memberItemRecord = null;
		//												
		//													if (memberItemId)
		//														{
		//															memberItemRecord = nlapiLoadRecord(getItemRecType(memberItemType), memberItemId);
		//															
		//															if(memberItemRecord)
		//																{
		//																	woFinish = memberItemRecord.getFieldValue('custitem_bbs_item_process_type');
		//																}
		//														}
		//												}								
		//										}
		//								}
									
									//Only stock items will have a commitment quantity
									//
									if(lineItemSource == 'STOCK' && lineItemType == 'InvtPart')
										{
											//Find the lowest quantity that can be built
											//
											if(lineItemCommitted < lowestCommitted)
												{
													lowestCommitted = lineItemCommitted;
												}
											
											//Increment the number of lines that should be committed
											//
											linesToCommit++;
											
											//Increment the number of lines that are actually committed
											//
											if(lineItemQuantity == (lineItemCommitted + lineItemUsedInBuild) || newStatus == 'Built')
												{
													linesFullyCommitted++;
												}
											
											//Total up the total quantity, committed quantity & the used in build quantity
											//
											totalQuantity += lineItemQuantity;
											totalCommitted += (lineItemCommitted + lineItemUsedInBuild);
											totalUsedInBuild += lineItemUsedInBuild;
										}
									
									//Process the assembly special instructions
									//
									if(lineItemLevel == 1)
									{
										lastLevelOneItem = lineItemItemId;
									}
								
									/*
									//See if there is a special instruction record for the bom/component
									//
									var cols = new Array();
									cols[0] = new nlobjSearchColumn('custrecord_bbs_custom_field_1');
					
									var searchFilters = new Array();
									searchFilters[0] = new nlobjSearchFilter('custrecord_bbs_bom_member', null, 'is', lineItemItemId);
									
									if(lineItemLevel == 1)
										{
											searchFilters[1] = new nlobjSearchFilter('custrecord_bbs_bom_item', null, 'is', assemblyId);
										}
									
									if(lineItemLevel == 2)
										{
											searchFilters[1] = new nlobjSearchFilter('custrecord_bbs_bom_item', null, 'is', lastLevelOneItem);
										}
								
									// Create the search
									//
									var mvfSearch = nlapiCreateSearch('customrecord_bbs_bom_fields', searchFilters, cols);
					
									// Run the search
									//
									var mvfSearchResults = mvfSearch.runSearch();
					
									// Get the result set from the search
									//
									var mvfSearchResultSet = mvfSearchResults.getResults(0, 100);
					
									// See if there are any results to process
									//
									if (mvfSearchResultSet != null) 
										{
											if (mvfSearchResultSet.length == 1)
												{
													var specInst = mvfSearchResultSet[0].getValue(cols[0]);
													newRecord.setLineItemValue('item', 'custcol_bbs_bom_spec_inst', int, specInst);
												}
										}
										
										*/
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
								
		//SMI					//Set the full finish item & finish to the works order
		//						//
		//						if(woFullFinishItem != '')
		//							{
		//								newRecord.setFieldValue('custbody_bbs_wo_ffi', woFullFinishItem);
		//							}
		//						
		//						if(woFinish != '')
		//							{
		//								newRecord.setFieldValue('custbody_bbs_wo_finish', woFinish);
		//							}
		//						
								if(originalCommitmentStatus != newCommitmentStatus)
										{									
											var newCreatedFrom = newRecord.getFieldValue('createdfrom');
											
											if(newCreatedFrom != null && newCreatedFrom != '')
												{
													salesOrders[newCreatedFrom] = newCreatedFrom;
												}
										}
								
								if(machine != '')
									{
										newRecord.setFieldValue('custbody_bbs_wo_machine', machine);
									}
							
								if(woLogo != '')
									{
										newRecord.setFieldValue('custbody_bbs_wo_logo', woLogo);
									}
							
								if(woLogoType != '')
									{
										newRecord.setFieldValue('custbody_bbs_wo_logo_type', woLogoType);
									}
								
								newRecord.setFieldValue('custbody_bbs_wo_logo_qty', logoQuantity);
								
							
								//Set the lowest committed value
								//
								lowestCommitted = (lowestCommitted == 99999 ? 0 : lowestCommitted);
								newRecord.setFieldValue('custbody_bbs_wo_qty_can_build', lowestCommitted);
								
								//Set the commitment percentage
								//
								var commitPercent = Number(0);
								
								//if((totalQuantity - totalCommitted) >= 0)
								//{
								//	commitPercent = Number((totalCommitted / totalQuantity) * 100.00).toFixed();
								//}
							
								if((totalQuantity - totalUsedInBuild) >= 0)
								{
									//commitPercent = Number((lowestCommitted / (totalQuantity - totalUsedInBuild)) * 100.00).toFixed();
									commitPercent = Number((lowestCommitted / (woQuantity - totalUsedInBuild)) * 100.00).toFixed();
								}
								
								var percentListValue = null;
								
								if (commitPercent >= 0 && commitPercent <= 25)
								{
									percentListValue = 1;
								}
							
								if (commitPercent >= 26 && commitPercent <= 50)
								{
									percentListValue = 2;
								}
							
								if (commitPercent >= 51 && commitPercent <= 75)
								{
									percentListValue = 3;
								}
								
								if (commitPercent >= 76 && commitPercent <= 90)
								{
									percentListValue = 4;
								}
							
								if (commitPercent >= 91 && commitPercent <= 99)
								{
									percentListValue = 5;
								}
							
								if (commitPercent == 100)
								{
									percentListValue = 6;
								}
							
								newRecord.setFieldValue('custbody_bbs_wo_percent_can_build', percentListValue);
								
								//Finally submit the works order
								//
								try
									{
										nlapiSubmitRecord(newRecord, false, true);	
									}
								catch(err)
									{
										nlapiLogExecution('ERROR', 'Error updating works order', err.message);
									}
								
						}			
				}
		}
	
	
	
	//=============================================================================================
	//Code to check status of associated sales order
	//=============================================================================================
	//
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
							var lines = salesOrderRecord.getLineItemCount('item');
							
							for (var int = 1; int <= lines; int++) 
								{
									var woId = salesOrderRecord.getLineItemValue('item', 'woid', int);
									salesOrderRecord.setLineItemValue('item', 'custcol_bbs_wo_id', int, woId);
								}
							
							try
								{
									nlapiSubmitRecord(salesOrderRecord, false, true);
								}
							catch(err)
								{
									nlapiLogExecution('ERROR', 'Error updating sales order', err.message);
								}
						}
				}
		}
//							//We need to check the other works orders
//							//
//							var workorderSearch = nlapiCreateSearch("workorder",
//									[
//									   ["mainline","is","T"], 
//									   "AND", 
//									   ["type","anyof","WorkOrd"], 
//									   "AND", 
//									   ["createdfrom","anyof",newCreatedFrom]
//									], 
//									[
//									   new nlobjSearchColumn("createdfrom",null,null), 
//									   new nlobjSearchColumn("custbody_bbs_commitment_status",null,null)
//									]
//									);
//													
//							if(workorderSearch)
//								{
//									var searchResult = workorderSearch.runSearch();
//															
//									//Get the initial set of results
//									//
//									var start = 0;
//									var end = 1000;
//									var searchResultSet = searchResult.getResults(start, end);
//									var resultlen = searchResultSet.length;
//													
//									//If there is more than 1000 results, page through them
//									//
//									while (resultlen == 1000) 
//										{
//											start += 1000;
//											end += 1000;
//													
//											var moreSearchResultSet = searchResult.getResults(start, end);
//											resultlen = moreSearchResultSet.length;
//													
//											searchResultSet = searchResultSet.concat(moreSearchResultSet);
//										}
//															
//									var committedWorksOrders = Number(0);
//															
//									for (var int = 0; int < searchResultSet.length; int++) 
//										{
//											var woCommittmentStatus = searchResultSet[int].getValue('custbody_bbs_commitment_status');
//																
//											if(woCommittmentStatus == 2)
//												{
//													committedWorksOrders++;
//												}
//										}
//															
//									var allWorksOrdersCommitted = (searchResultSet.length == committedWorksOrders ? true : false);
//															
//									switch(allWorksOrdersCommitted)
//										{
//											case true:
//												nlapiSubmitField('salesorder', newCreatedFrom, 'custbody_bbs_commitment_status', 2, false);
//												break;
//																
//											case false:
//												if(committedWorksOrders == 0)
//													{
//														nlapiSubmitField('salesorder', newCreatedFrom, 'custbody_bbs_commitment_status', 3, false);
//													}
//												else
//													{
//														nlapiSubmitField('salesorder', newCreatedFrom, 'custbody_bbs_commitment_status', 1, false);
//													}
//												break;
//										}
//								}			
//						}
//				}
//		}
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
