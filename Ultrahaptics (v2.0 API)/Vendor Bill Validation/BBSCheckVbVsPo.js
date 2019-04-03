/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */


define(['N/record','N/ui/dialog','N/search'],

function(record, dialog, search) 
{
	var DIALOGMODULE = dialog;
	
	//This global is used to detect if user has pressed "OK" in the prompt box
	//
	var IS_CONFIRMED; 

	//Function called on record save
	//
    function saveRecord(scriptContext) 
    {
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
		
    	debugger;
    	
    	
    	//Check the current VB + all other VB's against the related PO
    	//
    	
		//Get the current vendor bill record
		//
		var vendorBillRecord = scriptContext.currentRecord;
		var currentLines = Number(vendorBillRecord.getLineCount({sublistId: 'item'}));
		var currentId = vendorBillRecord.getValue({fieldId: 'id'});
			
		//Save the current record's values & quantities to the arrays
		//
		for (var int = 0; int < currentLines; int++) 
			{
				currentLineItem = vendorBillRecord.getSublistValue({sublistId: 'item', fieldId: 'item', line: int});
				currentLineQty = Number(vendorBillRecord.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: int}));
				currentLineVal = Number(vendorBillRecord.getSublistValue({sublistId: 'item', fieldId: 'amount', line: int}));
				
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
	    var lines = Number(vendorBillRecord.getLineCount({sublistId: 'purchaseorders'}));
	    var poId = '';
	    
	    //Find the first purchase order in the sublist
	    //
	    for (var int = 0; int < lines; int++) 
	    	{
				poId = vendorBillRecord.getSublistValue({sublistId: 'purchaseorders', fieldId: 'id', line: int});
				
				if (poId != null && poId != '')
					{
						break;
					}
	    	}
	    
	    //If we are on a new vendor bill then there will not be any related records as yet
	    //
	    if(poId == '' && currentId == '')
	    	{
	    		poId = vendorBillRecord.getValue({fieldId: 'podocnum'});
	    	}
	    
	    //If we have a purchase order, we can procede
	    //
	    if 	(poId != null && poId != '')
	    	{
	    		var poRecord = null;
	    		var errCode = '';
	    		
	    		//Load the purchase order record
	    		//
	    		try
		    		{
		    			poRecord = record.load({type: record.Type.PURCHASE_ORDER, id: poId});
		    		}
	    		catch(err)
		    		{
		    			errCode = err.code;
		    			
		    			if(errCode == 'RCRD_LOCKED_BY_WF')
		    				{
		    					warnings += '<p style="color:RED;">The associated Purchase Order is locked pending approval, please cancel this transaction until the Purchase Order is approved<p/><br/><br/>';
		    				}
		    		}
	    		
	    		if(poRecord)
	    			{
	    				//Get the PO currency
	    				//
	    				var poCurrencyId = poRecord.getValue({fieldId: 'currency'}); 
	    				var currencySymbol = '';
	    				
	    				if(poCurrencyId != null && poCurrencyId != '')
	    					{
	    						var currencyRecord = record.load({type: record.Type.CURRENCY, id: poCurrencyId}); 
	    						
	    						if(currencyRecord)
	    							{
	    								currencySymbol = currencyRecord.getValue({fieldId: 'displaysymbol'});
	    							}
	    					}
	    				
	    				//Build a list of items on the po and their quantities etc
	    				//
	    				var items = poRecord.getLineCount({sublistId: 'item'});
	    				
	    				for (var int2 = 0; int2 < items; int2++) 
		    				{
		    					var lineItem = poRecord.getSublistValue({sublistId: 'item', fieldId: 'item', line: int2});
		    					var lineItemDesc = poRecord.getSublistText({sublistId: 'item', fieldId: 'item', line: int2});
		    					
		    					var lineQty = Number(poRecord.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: int2}));
		    					var lineQtyRec = Number(poRecord.getSublistValue({sublistId: 'item', fieldId: 'quantityreceived', line: int2}));
		    					var lineQtyBil = Number(poRecord.getSublistValue({sublistId: 'item', fieldId: 'quantitybilled', line: int2}));
		    					var lineQtyRate = Number(poRecord.getSublistValue({sublistId: 'item', fieldId: 'rate', line: int2}));
		    					
		    					var lineVal = Number(poRecord.getSublistValue({sublistId: 'item', fieldId: 'amount', line: int2}));
		    					
		    					//Accumulate the to be billed quantities
		    					//
		    					if(!poItemsTbbQty[lineItem])
		    						{
		    							poItemsTbbQty[lineItem] = (lineQtyRec - lineQtyBil);
		    						}
		    					else
		    						{
		    							poItemsTbbQty[lineItem] += (lineQtyRec - lineQtyBil);
		    						}
		    					
		    					//Accumulate the to be billed values
		    					//
		    					if(!poItemsTbbVal[lineItem])
		    						{
		    							poItemsTbbVal[lineItem] = ((lineQtyRec - lineQtyBil) * lineQtyRate);
		    						}
		    					else
		    						{
		    							poItemsTbbVal[lineItem] += ((lineQtyRec - lineQtyBil) * lineQtyRate);
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
	    				var links = poRecord.getLineCount({sublistId: 'links'});
	    				
	    				for (var int2 = 0; int2 < links; int2++) 
		    				{
		    					var linkType = poRecord.getSublistValue({sublistId: 'links', fieldId: 'type', line: int2});
		    					var linkId = poRecord.getSublistValue({sublistId: 'links', fieldId: 'id', line: int2});
								
									if(linkType == 'Purchase Invoice')
										{
											//Process the vendor bill records on the po as long as it is not the current record on screen
											//
											if(linkId != currentId)
												{
													//var vbRecord = nlapiLoadRecord('vendorbill', linkId);
													var vbRecord = record.load({type: record.Type.VENDOR_BILL, id: linkId});
													
													if(vbRecord)
														{
															//Find all the items on the vendor bill
															//
															var items = vbRecord.getLineCount({sublistId: 'item'});
															
															for (var int3 = 0; int3 < items; int3++) 
																{
																	var lineItem = vbRecord.getSublistValue({sublistId: 'item', fieldId: 'item', line: int3});
																	var lineQty = Number(vbRecord.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: int3}));
																	var lineVal = Number(vbRecord.getSublistValue({sublistId: 'item', fieldId: 'amount', line: int3}));
											    					
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
	    						if(Number(vbQty) > Number(poQty))
	    							{
	    								var qtyDiff = Number(vbQty) - Number(poQty);
	    								
	    								warnings += '<p style="color:RED;"> Item "' + poItemsDesc[poItem] + '" : Total invoiced quantity (' + vbQty.toFixed(2) + ') exceeds the PO quantity (' + poQty.toFixed(2) + ') by ' + qtyDiff.toFixed(2) + '<p/><br/><br/>';
	    							}
	    						
	    						//Compare the vb val with the po val, if the vb val > po val then we need to highlight it
	    						//
	    						if(Number(vbVal) > Number(poVal))
	    							{
	    								var valDiff = Number(vbVal) - Number(poVal);
    								
	    								warnings += '<p style="color:RED;"> Item "' + poItemsDesc[poItem] + '" : Total invoiced value (' + currencySymbol + vbVal.toFixed(2) + ') exceeds the PO value (' + currencySymbol + poVal.toFixed(2) + ') by ' + currencySymbol + valDiff.toFixed(2) + '<p/><br/><br/>';
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
	    						if(Number(vbQty) > Number(poTbbQty))
	    							{
	    								var qtyDiff = Number(vbQty) - Number(poTbbQty);
	    								
	    								warnings += '<p style="color:DARKSALMON;"> Item "' + poItemsDesc[poItem] + '" : Total invoice quantity (' + vbQty.toFixed(2) + ') exceeds the quantity received not invoiced (' + poTbbQty.toFixed(2) + ') by ' + qtyDiff.toFixed(2) + '<p/><br/><br/>';
	    							}
	    						
	    						//Compare the vb val with the po to be billed val
	    						//
	    						if(Number(vbVal) > Number(poTbbVal))
	    							{
	    								var valDiff = Number(vbVal) - Number(poTbbVal);
    								
	    								warnings += '<p style="color:DARKSALMON;"> Item "' + poItemsDesc[poItem] + '" : Total invoice value (' + currencySymbol + vbVal.toFixed(2) + ') exceeds the value received not invoiced (' + currencySymbol + poTbbVal.toFixed(2) + ') by '+ currencySymbol + valDiff.toFixed(2) +'<p/><br/><br/>';
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
		    							var fieldLookUp = search.lookupFields({type: search.Type.ITEM, id: vbItem, columns: ['itemid']});
		    							
		    							warnings += '<p style="color:DARKRED;"> Item "' + fieldLookUp['itemid'] + '" Does not Exist on The Purchase Order<p/><br/><br/>';
		    						}
		    				}
	    			}
	    	}

      	//If we have clicked ok on the dialogue or there are no customer actions, then return true
      	//
    	if(IS_CONFIRMED || (warnings == null || warnings == ''))
    	  	{
    	  		return true;
    	  	}
    	else
    	  	{
    			//Set up the options for the dialogue box
    			//
    			warnings += '<p style="color:DarkGreen;">Click \"Ok\" to Save, \"Cancel\" to Amend<p/>';
    			var titleText = 'Please Verify The Following Issues Before Saving';
	      		var options = {
		      				title: titleText,
		      				message: warnings
		      					};
		  
	      		//Function that is called when the dialogue box completes
	      		//
		      	function success(result) 
		      	{ 
		      		//See if we have clicked ok in the dialogue
		      		//
		      		if (result)
		      			{
		      				//Update the global variable to show that we have clicked ok
		      				//
		      				IS_CONFIRMED = true;
		      				
		      				//Spoof pressing the save button on the form
		      				//
		      				getNLMultiButtonByName('multibutton_submitter').onMainButtonClick(this); 
		      			}
		      	}

		      	//Display the dialogue box
		      	//
		      	dialog.confirm(options).then(success);

    	  	}
    }

    return 	{
        		saveRecord: saveRecord
    		};
});
