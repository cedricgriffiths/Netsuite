/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       31 Aug 2017     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */
function userEventBeforeSubmit(type)
{
	if(type == 'edit' || type == 'create')
		{
			var newRecord = nlapiGetNewRecord();
			var newStatus = newRecord.getFieldValue('status');
			
			if(newStatus == 'Built')
			{
				nlapiSetFieldValue('custbody_bbs_commitment_status', 2, false, true);
			}	
			
			if(newStatus == 'Released')
			{
				var itemCount = newRecord.getLineItemCount('item');
				var linesToCommit = Number(0);
				var linesFullyCommitted = Number(0);
				
				for (var int = 1; int <= itemCount; int++) 
				{
					var lineItemSource = newRecord.getLineItemValue('item', 'itemsource', int);
					var lineItemQuantity = Number(newRecord.getLineItemValue('item', 'quantity', int));
					var lineItemCommitted = Number(newRecord.getLineItemValue('item', 'quantitycommitted', int));
					
					lineItemCommitted = (lineItemCommitted == null ? Number(0) : lineItemCommitted);
					
					if(lineItemSource == 'STOCK')
						{
							linesToCommit++;
							
							if(lineItemQuantity == lineItemCommitted)
								{
									linesFullyCommitted++;
								}
							
						}
				}
				
				if(linesToCommit == linesFullyCommitted)
					{
						nlapiSetFieldValue('custbody_bbs_commitment_status', 2, false, true);
					}
				else
					{
						nlapiSetFieldValue('custbody_bbs_commitment_status', 1, false, true);
					}
			}
		}
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function userEventAfterSubmit(type)
{
	//Only work when in edit or create mode
	//
	if(type == 'edit' || type == 'create')
	{
		//Get the new version of the wo record, the created from & the wo committment status
		//
		var newRecord = nlapiGetNewRecord();
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
						//
						if((salesOrderCommittmentStatus == 1 && newWorksOrderStatus == 2) || (salesOrderCommittmentStatus == null && newWorksOrderStatus == 2))
							{
								//We need to check the other works orders
								//
								var workorderSearch = nlapiSearchRecord("workorder",null,
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
						else
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
