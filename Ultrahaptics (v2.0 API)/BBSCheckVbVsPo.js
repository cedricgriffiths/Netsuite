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
        var poItemsQty = {};
        var vbItemsQty = {};
        var poItemsVal = {};
        var vbItemsVal = {};
        var poItemsDesc = {};
        
    	debugger;
    	
    	
    	//Check the current VB + all other VB's against the related PO
    	//
    	
		//Get the current vendor bill record
		//
		var vendorBillRecord = scriptContext.currentRecord;
		var currentLines = vendorBillRecord.getLineCount({sublistId: 'item'});
		var currentId = vendorBillRecord.getValue({fieldId: 'id'});
			
		//Save the current record's values & quantities to the arrays
		//
		for (var int = 0; int < currentLines; int++) 
			{
				var currentLineItem = vendorBillRecord.getSublistValue({sublistId: 'item', fieldId: 'item', line: int});
				var currentLineQty = vendorBillRecord.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: int});
				var currentLineVal = vendorBillRecord.getSublistValue({sublistId: 'item', fieldId: 'amount', line: int});
				
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
	    var lines = vendorBillRecord.getLineCount({sublistId: 'purchaseorders'});
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
	    
	    //If we have a purchase order, then we need to find the associated vendor bills
	    //
	    if 	(poId != null && poId != '')
	    	{
	    		//Load the purchase order record
	    		//
	    		//var poRecord = nlapiLoadRecord('purchaseorder', poId);
	    		var poRecord = record.load({type: record.Type.PURCHASE_ORDER, id: poId});
	    		
	    		if(poRecord)
	    			{
	    				//Build a list of items on the po and their quantities
	    				//
	    				var items = poRecord.getLineCount({sublistId: 'item'});
	    				
	    				for (var int2 = 0; int2 < items; int2++) 
		    				{
		    					var lineItem = poRecord.getSublistValue({sublistId: 'item', fieldId: 'item', line: int2});
		    					var lineQty = poRecord.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: int2});
		    					var lineVal = poRecord.getSublistValue({sublistId: 'item', fieldId: 'amount', line: int2});
		    					var lineItemDesc = poRecord.getSublistText({sublistId: 'item', fieldId: 'item', line: int2});
		    					
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
																	var lineQty = vbRecord.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: int3});
																	var lineVal = vbRecord.getSublistValue({sublistId: 'item', fieldId: 'amount', line: int3});
											    					
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
	    								warnings += '<p style="color:DarkRed;"> Item ' + poItemsDesc[poItem] + ' : Total Vendor Bill Qty of ' + vbQty.toFixed(2) + ' Exceeds Purchase Order Qty of ' + poQty.toFixed(2) + '<p/><br/><br/>';
	    							}
	    						
	    						//Compare the vb val with the po val, if the vb val > po val then we need to highlight it
	    						//
	    						if(vbVal > poVal)
	    							{
	    								warnings += '<p style="color:DarkRed;"> Item ' + poItemsDesc[poItem] + ' : Total Vendor Bill Value of ' + vbVal.toFixed(2) + ' Exceeds Purchase Order Value of ' + poVal.toFixed(2) + '<p/><br/><br/>';
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
