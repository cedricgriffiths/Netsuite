/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       19 Apr 2018     cedricgriffiths
 *
 */
function customizeGlImpact(transactionRecord, standardLines, customLines, book)
{
	//Get the source record type & id
	//
	var rectype = transactionRecord.getRecordType();
	var recid   = transactionRecord.getId();
	
	//Get the configuration record
	//
	var customrecord_bbs_custom_gl_configSearch = nlapiSearchRecord("customrecord_bbs_custom_gl_config",null,
			[
			   ["name","is","default"]
			], 
			[
			   new nlobjSearchColumn("name").setSort(false), 
			   new nlobjSearchColumn("custrecord_bbs_custom_gl_to_acc"), 
			   new nlobjSearchColumn("custrecord_bbs_custom_gl_from_acc"), 
			   new nlobjSearchColumn("custrecord_bbs_custom_gl_disc_item")
			]
			);
	
	//Procede if we have a config
	//
	if(customrecord_bbs_custom_gl_configSearch)
		{
			//Make sure we have something from the search
			//
			if(customrecord_bbs_custom_gl_configSearch.length > 0)
				{
					//Get the config values
					//
					var configDiscountId = customrecord_bbs_custom_gl_configSearch[0].getValue('custrecord_bbs_custom_gl_disc_item');
					var configFromAccId = customrecord_bbs_custom_gl_configSearch[0].getValue('custrecord_bbs_custom_gl_from_acc');
					var configToAccId = customrecord_bbs_custom_gl_configSearch[0].getValue('custrecord_bbs_custom_gl_to_acc');
					
					
					//Where was the item fulfilment created from 
					//
					var createdfrom = transactionRecord.getFieldValue('createdfrom');
					
					if(createdfrom != null && createdfrom != '')
						{
							//Get the count of standard lines
							//
							var linecount = standardLines.getCount();
							
							//Loop round the lines
							//
							if(linecount > 0)
								{
									//Load the sales order record & get the count of lines
									//
									var soRecord = nlapiLoadRecord('salesorder', createdfrom);
									var lines = soRecord.getLineItemCount('item');
									
									var shippingCost = Number(0);
									
									//Find the shipping cost on the sales order lines
									//
									for (var int = 1; int <= lines; int++) 
										{
											var itemType = soRecord.getLineItemValue('item', 'itemtype', int);
											var itemId = soRecord.getLineItemValue('item', 'item', int);
										
											if(itemType == 'OthCharge' && itemId == configDiscountId)
												{
													shippingCost = Number(soRecord.getLineItemValue('item', 'amount', int));
												}
										}
									
									//Loop through the standard GL lines
									//
									for (var i=0; i<linecount; i++) 
										{
											//Get the line object
											//
											var line =  standardLines.getLine(i);
											
											//Ignore the summary line or any non-posting lines
											//
											if(line.isPosting() && line.getId() != 0)
												{
													var account = line.getAccountId();
													var debit = line.getDebitAmount();
													var credit = line.getCreditAmount();
													
													//Find the relevant posting line by looking at the account id
													//
													if(account == '1234')
														{
															//Add new posting lines here
															//
															var newLine = customLines.addNewLine();
															newLine.setAccountId(parseInt(from_acc));
															newLine.setDebitAmount(????);
															newLine.setMemo('Warranty adjustment');
															
															var newLine = customLines.addNewLine();
															newLine.setAccountId(parseInt(from_acc));
															newLine.setCreditAmount(????);
															newLine.setMemo('Warranty adjustment');
															
														}
												}
										}
								}
						}
				}
		}
}