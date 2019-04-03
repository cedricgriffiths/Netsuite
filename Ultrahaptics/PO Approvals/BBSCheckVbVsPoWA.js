/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       27 Nov 2017     cedricgriffiths
 *
 */

/**
 * @returns {Void} Any or no return value
 */
function checkVbVsPoWA() 
{

	Number.prototype.round = function(places) 
	{
	  return +(Math.round(this + "e+" + places)  + "e-" + places);
	}
	
	var warnings = '';
	    	
	var poItemsDesc = {};		//Item description
	var poItemsQty = {};		//Item quantity
	var poItemsVal = {};		//Item value
	var poItemsTbbQty = {};		//Quantity to be billed
	var poItemsTbbVal = {};		//Value to be billed
	        
	var vbItemsQty = {};
	var vbItemsVal = {};
	        
	var thisVbItemsQty = {};
	var thisVbItemsVal = {};
	        
	var currentLineItem = '';
	var currentLineQty = Number(0);
	var currentLineVal = Number(0);
			
	try
		{    	
	    	//Check the current VB + all other VB's against the related PO
	    	//
	    	
			//Get the current vendor bill record
			//
			var vendorBillRecord = nlapiGetNewRecord();
			var currentLines = Number(vendorBillRecord.getLineItemCount('item'));
			var currentId = vendorBillRecord.getFieldValue('id');
				
			//Save the current record's values & quantities to the arrays
			//
			
			for (var int = 1; int <= currentLines; int++) 
				{
					currentLineItem = vendorBillRecord.getLineItemValue('item', 'item', int);
					currentLineQty = Number(vendorBillRecord.getLineItemValue('item', 'quantity', int));
					currentLineVal = Number(vendorBillRecord.getLineItemValue('item', 'amount', int));
					
					//Save this vb quantities
					//
					if(!thisVbItemsQty[currentLineItem])
						{
							thisVbItemsQty[currentLineItem] = currentLineQty;
						}
					else
						{
							thisVbItemsQty[currentLineItem] += currentLineQty;
						}
					
					//Save this vb values
					//
					if(!thisVbItemsVal[currentLineItem])
						{
							thisVbItemsVal[currentLineItem] = currentLineVal;
						}
					else
						{
							thisVbItemsVal[currentLineItem] += currentLineVal;
						}
					
					//Accumulate the quantities
					//
					if(!vbItemsQty[currentLineItem])
						{
							vbItemsQty[currentLineItem] = currentLineQty;
						}
					else
						{
							vbItemsQty[currentLineItem] += currentLineQty;
						}
					
					//Accumulate the values
					//
					if(!vbItemsVal[currentLineItem])
						{
							vbItemsVal[currentLineItem] = currentLineVal;
						}
					else
						{
							vbItemsVal[currentLineItem] += currentLineVal;
						}
				}
			
			
			//Get the number of lines in the purchase order sublist
			//
		    var lines = Number(vendorBillRecord.getLineItemCount('purchaseorders'));
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
		    
		    
		    //If we have a purchase order, we can procede
		    //
		    if 	(poId != null && poId != '')
		    	{
		    		//Load the purchase order record
		    		//
		    		var poRecord = null;
		    		
		    		try
			    		{
			    			poRecord = nlapiLoadRecord('purchaseorder', poId);
			    		}
		    		catch(err)
			    		{
		    				poRecord = null;
			    		}
		    		
		    		if(poRecord)
		    			{
			    			//Get the PO currency
		    				//
		    				var poCurrencyId = poRecord.getFieldValue('currency'); 
		    				var currencySymbol = '';
		    				
		    				if(poCurrencyId != null && poCurrencyId != '')
		    					{
		    						var currencyRecord = nlapiLoadRecord('currency', poCurrencyId); 
		    						
		    						if(currencyRecord)
		    							{
		    								currencySymbol = currencyRecord.getFieldValue('displaysymbol');
		    							}
		    					}
		    				
		    				//Build a list of items on the po and their quantities etc
		    				//
		    				var items = poRecord.getLineItemCount('item');
		    				
		    				for (var int2 = 1; int2 <= items; int2++) 
			    				{
			    					var lineItem = poRecord.getLineItemValue('item', 'item', int2);
			    					var lineItemDesc = poRecord.getLineItemText('item', 'item', int2);
			    					
			    					var lineQty = Number(poRecord.getLineItemValue('item', 'quantity', int2));
			    					var lineQtyRec = Number(poRecord.getLineItemValue('item', 'quantityreceived', int2));
			    					var lineQtyBil = Number(poRecord.getLineItemValue('item', 'quantitybilled', int2));
			    					var lineQtyRate = Number(poRecord.getLineItemValue('item', 'rate', int2));
			    					
			    					var lineVal = Number(poRecord.getLineItemValue('item', 'amount', int2));
			    					
			    					//Accumulate the to be billed quantities
			    					//
			    					if(!poItemsTbbQty[lineItem])
			    						{
			    							poItemsTbbQty[lineItem] = (lineQtyRec - (lineQtyBil - thisVbItemsQty[lineItem]));
			    						}
			    					else
			    						{
			    							poItemsTbbQty[lineItem] += (lineQtyRec - (lineQtyBil - thisVbItemsQty[lineItem]));
			    						}
			    					
			    					//Accumulate the to be billed values
			    					//
			    					if(!poItemsTbbVal[lineItem])
			    						{
			    							poItemsTbbVal[lineItem] = ((lineQtyRec - (lineQtyBil - thisVbItemsQty[lineItem])) * lineQtyRate).round(2);
			    						}
			    					else
			    						{
			    							poItemsTbbVal[lineItem] += ((lineQtyRec - (lineQtyBil - thisVbItemsQty[lineItem])) * lineQtyRate).round(2);
			    						}
			    					
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
		    				
		    				//Get the number of lines in the links sublist & filter out the vendor bills & item receipts
		    				//
		    				var links = poRecord.getLineItemCount('links');
		    				
		    				for (var int2 = 1; int2 <= links; int2++) 
			    				{
			    					var linkType = poRecord.getLineItemValue('links', 'type', int2);
			    					var linkId = poRecord.getLineItemValue('links', 'id', int2);
									
										if(linkType == 'Purchase Invoice')
											{
												//Process the vendor bill records on the po as long as it is not the current record on screen
												//
												if(linkId != currentId)
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
																		var lineQty = Number(vbRecord.getLineItemValue('item', 'quantity', int3));
																		var lineVal = Number(vbRecord.getLineItemValue('item', 'amount', int3));
												    					
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
									}
		    				
		    				//Compare the po to the vb quantities
		    				//
		    				for ( var poItem in poItemsQty) 
			    				{
		    						//Get the quantities/values from the po for this product
		    						//
			    					var poQty = Number(poItemsQty[poItem]);
		    						var poVal = Number(poItemsVal[poItem]);
		    						var poTbbQty = Number(poItemsTbbQty[poItem]);
		    						var poTbbVal = Number(poItemsTbbVal[poItem]);
								
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
		    						//if(vbQty > poQty)
		    						//	{
		    						//		warnings += 'Item "' + poItemsDesc[poItem] + '" : Total Vendor Bill Qty of ' + vbQty.toFixed(2) + ' Exceeds Purchase Order Qty of ' + poQty.toFixed(2) + '<br/><br/>';
		    						//	}
		    						
		    						//Compare the vb val with the po val, if the vb val > po val then we need to highlight it
		    						//
		    						//if(vbVal > poVal)
		    						//	{
		    						//		warnings += 'Item "' + poItemsDesc[poItem] + '" : Total Vendor Bill Value of ' + vbVal.toFixed(2) + ' Exceeds Purchase Order Value of ' + poVal.toFixed(2) + '<br/><br/>';
		    						//	}
		    						if(Number(vbQty) > Number(poQty))
	    							{
	    								var qtyDiff = Number(vbQty) - Number(poQty);
	    								
	    								warnings += 'Item "' + poItemsDesc[poItem] + '" : Total invoiced quantity (' + vbQty.toFixed(2) + ') exceeds the PO quantity (' + poQty.toFixed(2) + ') by ' + qtyDiff.toFixed(2) + '<br/><br/>';
	    							}
	    						
		    						//Compare the vb val with the po val, if the vb val > po val then we need to highlight it
		    						//
		    						if(Number(vbVal) > Number(poVal))
		    							{
		    								var valDiff = Number(vbVal) - Number(poVal);
	    								
		    								warnings += 'Item "' + poItemsDesc[poItem] + '" : Total invoiced value (' + currencySymbol + vbVal.toFixed(2) + ') exceeds the PO value (' + currencySymbol + poVal.toFixed(2) + ') by ' + currencySymbol + valDiff.toFixed(2) + '<br/><br/>';
		    							}
		    						
								}
		    				
		    				//Compare the po quantities & values of items received not billed to the current vb
		    				//
		    				for ( var poItem in poItemsQty) 
			    				{
		    						//Get the quantities/values from the po for this product
		    						//
			    					var poTbbQty = Number(poItemsTbbQty[poItem]);
		    						var poTbbVal = Number(poItemsTbbVal[poItem]);
								
		    						//See if we can find the same item in the list of items from this vendor bill
		    						//
		    						var vbQty = Number(0);
		    						var vbVal = Number(0);
		    						
		    						if(thisVbItemsQty[poItem])
		    							{
		    								vbQty = Number(thisVbItemsQty[poItem]);
		    							}
		    						
		    						if(thisVbItemsVal[poItem])
		    							{
		    								vbVal = Number(thisVbItemsVal[poItem]);
		    							}
		    						
		    						//Compare the vb qty with the po to be billed qty
		    						//
		    						//if(vbQty > poTbbQty)
		    						//	{
		    						//		warnings += 'Item "' + poItemsDesc[poItem] + '" : This Vendor Bill Qty of ' + vbQty.toFixed(2) + ' Exceeds Received not Billed Quantity of ' + poTbbQty.toFixed(2) + '<br/><br/>';
		    						//	}
		    						
		    						//Compare the vb val with the po to be billed val
		    						//
		    						//if(vbVal > poTbbVal)
		    						//	{
		    						//		warnings += 'Item "' + poItemsDesc[poItem] + '" : This Vendor Bill Value of ' + vbVal.toFixed(2) + ' Exceeds Received not Billed Value of ' + poTbbVal.toFixed(2) + '<br/><br/>';
		    						//	}
		    						if(Number(vbQty) > Number(poTbbQty))
	    							{
	    								var qtyDiff = Number(vbQty) - Number(poTbbQty);
	    								
	    								warnings += 'Item "' + poItemsDesc[poItem] + '" : Total invoice quantity (' + vbQty.toFixed(2) + ') exceeds the quantity received not invoiced (' + poTbbQty.toFixed(2) + ') by ' + qtyDiff.toFixed(2) + '<br/><br/>';
	    							}
	    						
		    						//Compare the vb val with the po to be billed val
		    						//
		    						if(Number(vbVal) > Number(poTbbVal))
		    							{
		    								var valDiff = Number(vbVal) - Number(poTbbVal);
	    								
		    								warnings += 'Item "' + poItemsDesc[poItem] + '" : Total invoice value (' + currencySymbol + vbVal.toFixed(2) + ') exceeds the value received not invoiced (' + currencySymbol + poTbbVal.toFixed(2) + ') by '+ currencySymbol + valDiff.toFixed(2) +'<br/><br/>';
		    							}
			    				}
		    				
		    				
		    				//Compare the items on the vb to those on the po & look for items that are not on the po
		    				//
		    				for ( var vbItem in vbItemsQty) 
			    				{
		    						//Is the item on the vb on the po?
		    						//
			    					if(!poItemsQty[vbItem])
			    						{
			    							//var fieldLookUp = search.lookupFields({type: search.Type.ITEM, id: vbItem, columns: ['itemid']});
			    							var fieldLookUp = null;
			    							
			    							try
			    								{
			    									fieldLookUp = nlapiLookupField('inventoryitem', vbItem, 'itemid', false);
			    								}
			    							catch(err)
			    								{
			    									fieldLookUp = null;
			    								}
			    							
			    							if(fieldLookUp == null)
			    								{
				    								try
					    								{
					    									fieldLookUp = nlapiLookupField('noninventoryitem', vbItem, 'itemid', false);
					    								}
					    							catch(err)
					    								{
					    									fieldLookUp = mull;
					    								}
			    								}
			    							
			    							if(fieldLookUp == null)
			    								{
				    								try
					    								{
					    									fieldLookUp = nlapiLookupField('assemblyitem', vbItem, 'itemid', false);
					    								}
					    							catch(err)
					    								{
					    									fieldLookUp = null;
					    								}
			    								}
			    								
			    							warnings += 'Item "' + (fieldLookUp == null ? vbItem : fieldLookUp) + '" Does not Exist on The Purchase Order<br/><br/>';
			    						}
			    				}
		    			}
		    	}
 
		}
	catch(err)
		{
			nlapiLogExecution('DEBUG', 'Execution Error', err.message);
		}
	
	nlapiLogExecution('DEBUG', 'Result', warnings);
	
	return warnings;  
}
