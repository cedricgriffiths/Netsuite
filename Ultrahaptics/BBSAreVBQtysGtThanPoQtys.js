/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       12 Apr 2017     cedricgriffiths
 *
 */

/**
 * @returns {Void} Any or no return value
 */
function checkVbGtThanPo() 
{
	//Initialise the return value
	//
    var returnValue = '';
    var poItemsQty = {};
    var vbItemsQty = {};
    var poItemsVal = {};
    var vbItemsVal = {};
    var poItemsDesc = {};
    
	try
		{
			//Get the vendor bill record
			//
			var vendorBillRecord = nlapiGetNewRecord();
			
			//Get the number of lines in the purchase order sublist
			//
		    var lines = vendorBillRecord.getLineItemCount('purchaseorders');
		    var poId = '';
		    
		    //Find the first purchase order in the sublist
		    //
		    for (var int = 1; int <= lines; int++) 
		    	{
					poId = vendorBillRecord.getLineItemValue('purchaseorders', 'id', int);
					
					if (poId != null && poId != '')
						{
							break;
						}
		    	}
		    
		    //If we have a purchase order, then we need to find the associated vendor bills
		    //
		    if 	(poId != null && poId != '')
		    	{
		    		//Load the purchase order record
		    		//
		    		var poRecord = nlapiLoadRecord('purchaseorder', poId);
		    		
		    		if(poRecord)
		    			{
		    				//Build a list of items on the po and their quantities
		    				//
		    				var items = poRecord.getLineItemCount('item');
		    				
		    				for (var int2 = 1; int2 <= items; int2++) 
			    				{
			    					var lineItem = poRecord.getLineItemValue('item', 'item', int2);
			    					var lineQty = poRecord.getLineItemValue('item', 'quantity', int2);
			    					var lineVal = poRecord.getLineItemValue('item', 'amount', int2);
			    					var lineItemDesc = poRecord.getLineItemText('item', 'item', int2);
			    					
			    					//Accumulate the quantities
			    					//
			    					if(!poItemsQty[lineItem])
			    						{
			    							poItemsQty[lineItem] = lineQty;
			    							poItemsDesc[lineItem] = lineItemDesc;
			    						}
			    					else
			    						{
			    							poItemsQty[lineItem] += lineQty;
			    						}

			    					//Accumulate the values
			    					//
			    					if(!poItemsVal[lineItem])
			    						{
			    							poItemsVal[lineItem] = lineVal;
			    						}
			    					else
			    						{
			    							poItemsVal[lineItem] += lineVal;
			    						}
								}
		    				
		    				//Get the number of lines in the links sublist & filter out the vendor bills
		    				//
		    				var links = poRecord.getLineItemCount('links');
		    				
		    				for (var int2 = 1; int2 <= links; int2++) 
			    				{
			    					var linkType = poRecord.getLineItemValue('links', 'type', int2);
			    					var linkId = poRecord.getLineItemValue('links', 'id', int2);
									
										if(linkType == 'Purchase Invoice')
											{
												var vbRecord = nlapiLoadRecord('vendorbill', linkId);
												
												if(vbRecord)
													{
														//Find all the items on the vendor bill
														//
														var items = vbRecord.getLineItemCount('item');
														
														for (var int3 = 1; int3 <= items; int3++) 
															{
																var lineItem = vbRecord.getLineItemValue('item', 'item', int3);
																var lineQty = vbRecord.getLineItemValue('item', 'quantity', int3);
																var lineVal = vbRecord.getLineItemValue('item', 'amount', int3);
										    					
										    					//Accumulate the quantities
										    					//
										    					if(!vbItemsQty[lineItem])
										    						{
										    							vbItemsQty[lineItem] = lineQty;
										    						}
										    					else
										    						{
										    							vbItemsQty[lineItem] += lineQty;
										    						}
										    					
										    					//Accumulate the values
										    					//
										    					if(!vbItemsVal[lineItem])
										    						{
										    							vbItemsVal[lineItem] = lineVal;
										    						}
										    					else
										    						{
										    							vbItemsVal[lineItem] += lineVal;
										    						}
															}
													}
											}
									}
		    				
		    				//Compare the po to the vb quantities
		    				//
		    				for ( var poItem in poItemsQty) 
			    				{
		    						//Get the quantity from the po for this product
		    						//
		    						var poQty = Number(poItemsQty[poItem]);
		    						var poVal = Number(poItemsVal[poItem]);
	    						
		    						//See if we can find the same item in the list of items from vendor bills
		    						//
		    						var vbQty = Number(0);
		    						var vbVal = Number(0);
		    						
		    						if(vbItemsQty[poItem])
		    							{
		    								vbQty = Number(vbItemsQty[poItem]);
		    							}
		    						
		    						if(vbItemsVal[poItem])
		    							{
		    								vbVal = Number(vbItemsVal[poItem]);
		    							}
		    						
		    						//Compare the vb qty with the po qty, if the vb qty > po qty then we need to highlight it
		    						//
		    						if(vbQty > poQty)
		    							{
		    								returnValue += 'Item ' + poItemsDesc[poItem] + ' : Total Vendor Bill Qty of ' + vbQty.toString() + ' Exceeds Purchase Order Qty of ' + poQty.toString() + '\n';
		    							}
		    						
		    						//Compare the vb val with the po val, if the vb val > po val then we need to highlight it
		    						//
		    						if(vbVal > poVal)
		    							{
		    								returnValue += 'Item ' + poItemsDesc[poItem] + ' : Total Vendor Bill Value of ' + vbVal.toString() + ' Exceeds Purchase Order Value of ' + poVal.toString() + '\n';
		    							}
								}
		    			}
		    	}
		}
	catch(err)
		{
			nlapiLogExecution('DEBUG', 'Execution Error', err.message);
		}
	
	nlapiLogExecution('DEBUG', 'Result', returnValue);
	
    return returnValue;
}
