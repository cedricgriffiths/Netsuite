/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       29 Aug 2017     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{
	//=============================================================================================
	//=============================================================================================
	//Start of main code
	//=============================================================================================
	//=============================================================================================
	//

	//Get the parameters
	//
	var context = nlapiGetContext();
	var parameters = context.getSetting('SCRIPT', 'custscript_bbs_pricelist_params');
	var usersEmail = context.getUser();
	var parameterObject = JSON.parse(parameters);
	
	nlapiLogExecution('DEBUG', 'Parameters', parameters);
	
	var messageParam = parameterObject['message'];
	var last12MonthsParam = parameterObject['12Months'];
	var consolidatedParam = parameterObject['consolidated'];
	var internalParam = parameterObject['internal'];
	var customerIds = parameterObject['custids'];
	
	var emailMessage = '';
	
	//Get number of quantity price breaks
	//
	//var maxQtyBreaks = Number(context.getPreference('QTYPRICECOUNT'));
		
	//Loop round the customers
	//
	for (var custInt = 0; custInt < customerIds.length; custInt++) 
	{
		var customerId = customerIds[custInt];
		var fileName = '';
		var fileContents = '';
		var stylesLastYear = {}; //Styles that were sold last year (parent or base parent of item)
		var priceListArray = {}; //The output array with all the pricing data in it
		var itemsToReportOn = {}; //The list of items to generate a price list for
		
		var today = new Date();
		
		//See if we have a customer id
		//
		if (customerId != null && customerId != '')
			{
				checkResources();
				
				//Read the customer record
				//
				var customerRecord = nlapiLoadRecord('customer', customerId);
				
				//Check to see if we have a customer record
				//
				if (customerRecord)
					{
						//Get the price level & name from the customer
						//
						var customerPriceLevel = customerRecord.getFieldValue('pricelevel');
						var customerName = customerRecord.getFieldValue('companyname');
						var customerNo = customerRecord.getFieldValue('entityid');
						var customerParent = customerRecord.getFieldValue('parent');
						var customerSubsidiary = customerRecord.getFieldValue('subsidiary');
						
						emailMessage += 'Processing price list for ' + customerName;
						
						if (customerPriceLevel == null || customerPriceLevel == '')
							{
								customerPriceLevel = 1;
							}
						
						//Get the currency from the customer
						//
						var customerCurrencyId = customerRecord.getFieldValue('currency');
						var currencyRecord = nlapiLoadRecord('currency', customerCurrencyId);
						var currencyName = currencyRecord.getFieldValue('name');
						var currencySymbol = currencyRecord.getFieldValue('symbol');

						var todaysDate = new Date(today);
						var lastYearsDate = new Date(today);
						lastYearsDate.setFullYear(todaysDate.getFullYear() - 1);
																
						var lastYearsDateString = lastYearsDate.getDate() + "/" + (lastYearsDate.getMonth() + 1) + "/" + lastYearsDate.getFullYear();
						var todaysDateString = todaysDate.getDate() + "/" + (todaysDate.getMonth() + 1) + "/" + todaysDate.getFullYear();
						
						//Set the export file name 
						//
						fileName = customerNo + '-Price List-' + todaysDate.getDate() + (todaysDate.getMonth() + 1)  + todaysDate.getFullYear() + '-' + (internalParam == 'T' ? 'INTERNAL' : 'CUSTOMER') + '-' + (consolidatedParam == 'T' ? 'CONSOLIDATED' : 'SKU') + '.csv';
						

						
						//=============================================================================================
						//=============================================================================================
						//
						//Section that deals with building the list of items we want prices for
						//
						//=============================================================================================
						//=============================================================================================
						//	
						
						
						//=============================================================================================
						//List of styles sold in the last 12 months
						//(Style is actually the Parent or Base Parent of the item)
						//=============================================================================================
						//
						checkResources();
						
						if(last12MonthsParam == 'T')
							{							
								var salesorderSearch = nlapiSearchRecord("salesorder",null,
										[
										   ["type","anyof","SalesOrd"], 
										   "AND", 
										   ["mainline","is","F"], 
										   "AND", 
										   ["taxline","is","F"], 
										   "AND", 
										   ["trandate","within",lastYearsDateString,todaysDateString], 
										   "AND", 
										   ["item.type","anyof","Assembly","InvtPart"],
										   "AND", 
										   ["customer.internalid","anyof",customerId]
										], 
										[
										   new nlobjSearchColumn("formulatext",null,"GROUP").setFormula("case {item.type} when 'Inventory Item' then {item.parent.id} else {item.custitem_sw_base_parent.id} end")
										]
										);
								
								if(salesorderSearch)
									{
										//Build up a list of style id's sold in the last year
										//
										for (var int = 0; int < salesorderSearch.length; int++) 
											{
												var itemStyle = salesorderSearch[int].getValue("formulatext","null","GROUP");

												stylesLastYear[itemStyle] = itemStyle;
											}
									}
							}
						
						
						//=============================================================================================
						//See if the customer has web pricing
						//=============================================================================================
						//
						checkResources();
						
						var hasWebCat = false;
						
						var webProductSearch = nlapiCreateSearch("customrecord_bbs_customer_web_product",
								[
								   ["custrecord_bbs_web_product_customer","anyof",customerId]
								], 
								[
								   new nlobjSearchColumn("custrecord_bbs_web_product_item",null,null), 
								   new nlobjSearchColumn("formulatext",null,null).setFormula("CASE {custrecord_bbs_web_product_item.type} when 'Inventory Item' then  {custrecord_bbs_web_product_item.parent.id} else {custrecord_bbs_web_product_item.custitem_sw_base_parent.id} end"),
								   new nlobjSearchColumn("salesdescription","CUSTRECORD_BBS_WEB_PRODUCT_ITEM",null), 
								   new nlobjSearchColumn("type","CUSTRECORD_BBS_WEB_PRODUCT_ITEM",null),
								   new nlobjSearchColumn("parent","CUSTRECORD_BBS_WEB_PRODUCT_ITEM",null),
								   new nlobjSearchColumn("custitem_sw_base_parent","CUSTRECORD_BBS_WEB_PRODUCT_ITEM",null)
								]
								);

						//Get all the results from the search (i.e. > 1000 lines)
						//
						var webProductSearchResult = getResults(webProductSearch);
						
						if (webProductSearchResult != null && webProductSearchResult.length > 0)
							{
								//We are using the web catalogue to get our list of items to report on
								//
								hasWebCat = true;
								
								for (var int2 = 0; int2 < webProductSearchResult.length; int2++) 
									{
										var webCatProduct = webProductSearchResult[int2].getValue("custrecord_bbs_web_product_item",null,null);
										var webCatProductTxt = webProductSearchResult[int2].getText("custrecord_bbs_web_product_item",null,null);
										var webCatStyle = webProductSearchResult[int2].getValue("formulatext",null,null);
										var webCatDescription = webProductSearchResult[int2].getValue("salesdescription","CUSTRECORD_BBS_WEB_PRODUCT_ITEM",null);
										var webCatType = webProductSearchResult[int2].getValue("type","CUSTRECORD_BBS_WEB_PRODUCT_ITEM",null);
										var webCatInvParent = webProductSearchResult[int2].getText("parent","CUSTRECORD_BBS_WEB_PRODUCT_ITEM",null);
										var webCatBaseParent = webProductSearchResult[int2].getText("custitem_sw_base_parent","CUSTRECORD_BBS_WEB_PRODUCT_ITEM",null);
										
										var webCatParent = '';
										
										if(webCatType == 'InvtPart')
											{
												webCatParent = webCatInvParent;
											}
										else
											{
												webCatParent = webCatBaseParent;
											}
											
											
										//Copy the web cat products to the array of items to generate the pricelist for
										//
										if(last12MonthsParam == 'T')
											{
												//Filter the list by styles sold in the last 12 months
												//
												if(stylesLastYear[webCatStyle])
													{
														itemsToReportOn[webCatProduct] = [webCatProductTxt,webCatStyle,webCatParent,webCatDescription,webCatType]; //Item, Style Id, Style Text, Item Description, Item Type 
													}
											}
										else
											{
												//Don't filter, just copy all the web catalogue items
												//
												itemsToReportOn[webCatProduct] = [webCatProductTxt,webCatStyle,webCatParent,webCatDescription,webCatType];
											}
									}
							}	
						else
							{
								//=============================================================================================
								//We are going to have to search for products that the customer or its parent owns, 
								//or products where there is no owner
								//=============================================================================================
								//
								checkResources();
							
								var filterArray = [];
							
								if(customerParent != null && customerParent != '')
									{
										filterArray = [
										               ["isinactive","is","F"], 
										               "AND",
										               ["subsidiary","anyof",customerSubsidiary],
										               "AND",
										               ["custitem_sw_not_on_web","is","F"],
										               "AND",
										               [["type","anyof","InvtPart"],"OR",[["type","anyof","Assembly"],"AND",["parent","noneof","@NONE@"],"AND",["isphantom","is","F"]]],
											           "AND", 
										               [[["custitem_bbs_item_customer","anyof","@NONE@"],"OR",["custitem_bbs_item_customer","anyof",customerId]],"OR",[["custitem_bbs_item_customer","anyof",customerParent],"AND",["custitem_bbs_item_finish_type","anyof","1"]]]
										               ];
									}
								else
									{
										filterArray = [
									               ["isinactive","is","F"], 
									               "AND",
									               ["subsidiary","anyof",customerSubsidiary],
									               "AND",
									               ["custitem_sw_not_on_web","is","F"],
									               "AND",
									               [["type","anyof","InvtPart"],"OR",[["type","anyof","Assembly"],"AND",["parent","noneof","@NONE@"],"AND",["isphantom","is","F"]]],
									               "AND", 
									               [["custitem_bbs_item_customer","anyof","@NONE@"],"OR",["custitem_bbs_item_customer","anyof",customerId]]
									               ];
									}
								
								//Get the actual results back
								//
								var itemSearchResults = getItems(filterArray);
								
								//Loop through the results
								//
								for (var int3 = 0; int3 < itemSearchResults.length; int3++) 
									{
										var itemProduct = itemSearchResults[int3].getId();
										var itemProductTxt = itemSearchResults[int3].getValue("itemid",null,null);
										var itemStyle = itemSearchResults[int3].getValue("formulatext",null,null);
										var itemDescription = itemSearchResults[int3].getValue("salesdescription",null,null);
										var itemType = itemSearchResults[int3].getValue("type",null,null);
										var itemInvParent = itemSearchResults[int3].getText("parent",null,null);
										var itemBaseParent = itemSearchResults[int3].getText("custitem_sw_base_parent",null,null);
										
										var itemParent = '';
										
										if(itemType == 'InvtPart')
											{
												itemParent = itemInvParent;
											}
										else
											{
												itemParent = itemBaseParent;
											}
											
										//Copy the items to the array of items to generate the pricelist for
										//
										if(last12MonthsParam == 'T')
											{
												//Filter the list by styles sold in the last 12 months
												//
												if(stylesLastYear[itemStyle])
													{
														itemsToReportOn[itemProduct] = [itemProductTxt,itemStyle,itemParent,itemDescription,itemType]; //Item, Style Id, Style Text, Item Description, Item Type 
													}
											}
										else
											{
												//Don't filter, just copy all the items
												//
												itemsToReportOn[itemProduct] = [itemProductTxt,itemStyle,itemParent,itemDescription,itemType];
											}
									}
							}
						
						
						//=============================================================================================
						//=============================================================================================
						//
						//Section that deals with getting the prices for the items we want to report on
						//
						//=============================================================================================
						//=============================================================================================
						//						

						//=============================================================================================
						//First get any customer specific item pricing, but filter by the list of items we want to report on
						//=============================================================================================
						//
						checkResources();
						
						var customerItemsCount = customerRecord.getLineItemCount('itempricing');
						
						for (var int = 1; int <= customerItemsCount; int++) 
						{
							//Get the values from the item pricing
							//
							var itemId = customerRecord.getLineItemValue('itempricing', 'item', int);
							var itemText = customerRecord.getLineItemText('itempricing', 'item', int);
							var itemPrice = customerRecord.getLineItemValue('itempricing', 'price', int);
							var itemLevel = customerRecord.getLineItemValue('itempricing', 'level', int);
							
							//Check to see if the item in the item pricing is in our list of items to process
							//
							if(itemsToReportOn[itemId])
								{
									if (!priceListArray[itemId])
										{
											//See if we are using a custom price
											//
											if (itemLevel == -1)
												{
													priceListArray[itemId] = [itemId,itemText,itemsToReportOn[itemId][2],itemsToReportOn[itemId][3],itemPrice,0,0,0,0,0,0,0,0,0,0,0] //itemId, ItemText, Style, ItemDescription, ItemPrice*6, BreakQty*6 
							
												}
											else
												{
													//If not then we need to go & get the item & then look at the price level that is relevant
													//
													priceListArray[itemId] = getItemPricingData(itemId, customerCurrencyId, itemLevel, itemsToReportOn[itemId][2], itemsToReportOn[itemId][3]);
												}
											
											priceListArray[itemId].push('Customer Item Pricing');
										}
								}
						}
						
						//=============================================================================================
						//Then get the pricing from the item record based on price level, but filter by the list of 
						//items we want to report on
						//=============================================================================================
						//
						checkResources();
						
						var reportItemArray = [];
						for ( var reportItem in itemsToReportOn) 
							{
								reportItemArray.push(reportItem);
							}
						
						//Only get the pricing data if we have any items to report on
						//
						if(reportItemArray.length > 0)
							{
								var filterArray = [
									               ["internalid","anyof",reportItemArray]
									               ];
									
								var searchResultSet = getItems(filterArray);
									
								//Process the returned item data 
								//
								processItemResults(searchResultSet, priceListArray, customerCurrencyId, customerPriceLevel, itemsToReportOn);
							}
						
						//=============================================================================================
						//Add to the priceListArray, the value of last 12 months sales
						//=============================================================================================
						//
						checkResources();
						
						if(reportItemArray.length > 0)
							{
								var salesorderSearch = nlapiSearchRecord("salesorder",null,
										[
										   ["type","anyof","SalesOrd"], 
										   "AND", 
										   ["mainline","is","F"], 
										   "AND", 
										   ["taxline","is","F"], 
										   "AND", 
										   ["trandate","within",lastYearsDateString,todaysDateString], 
										   "AND", 
										   ["customer.internalid","anyof",customerId]
										], 
										[
										   new nlobjSearchColumn("item",null,"GROUP").setSort(false), 
										   new nlobjSearchColumn("quantity",null,"SUM")
										]
										);
								
								var ytdSales = {};
								
								if(salesorderSearch)
									{
										for (var int4 = 0; int4 < salesorderSearch.length; int4++) 
											{
												var salesItemId = salesorderSearch[int4].getValue("item",null,"GROUP");
												var salesItemQty = salesorderSearch[int4].getValue("quantity",null,"SUM");
												
												ytdSales[salesItemId] = Number(salesItemQty).toFixed(2);
											}
									}
								
								for (var priceList in priceListArray) 
									{
										if(ytdSales[priceList])
											{
												priceListArray[priceList].push(ytdSales[priceList]);
											}
										else
											{
												priceListArray[priceList].push('0.00');
											}
								}
							}
						
						//=============================================================================================
						//Add to the priceListArray, the cost price of the items, the matrix sequence number,
						//the base parent & the finish
						//=============================================================================================
						//
						
						checkResources();
						
						//Get the list of available colours into an object
						//
						var colourArray = {};
						
						var colourSearchResultSet = nlapiSearchRecord("customlist_bbs_item_colour",null,[], 
								[
								  new nlobjSearchColumn("abbreviation",null,null) 	
								]
								);

						if(colourSearchResultSet)
							{
								for (var int5 = 0; int5 < colourSearchResultSet.length; int5++) 
									{
										var colourId = colourSearchResultSet[int5].getId();
										var colourAbbr = colourSearchResultSet[int5].getValue('abbreviation');	
										
										colourArray[colourId] = colourAbbr;
									}
							}
						
						
						if(reportItemArray.length > 0)
							{
								//Search the items based on the reportItemArray
								//
								var itemSearch = nlapiCreateSearch("item",
										[
										   ["type","anyof","InvtPart","Assembly"], 
										   "AND", 
										   ["internalid","anyof",reportItemArray], 
										   "AND", 
										   ["matrixchild","is","T"], 
										   "AND", 
										   //[[["type","anyof","InvtPart"],"AND",["ispreferredvendor","is","T"]],"OR",["type","anyof","Assembly"]]
										  [[["type","anyof","InvtPart"],"AND",["ispreferredvendor","is","T"],"AND",["vendor.subsidiary","anyof",customerSubsidiary]],"OR",["type","anyof","Assembly"]]
										], 
										[
										   	new nlobjSearchColumn("itemid",null,null), 
										   	new nlobjSearchColumn("type",null,null), 
										   	new nlobjSearchColumn("vendorcost",null,null),
										   	new nlobjSearchColumn("custitem_bbs_item_cost",null,null),
										   	new nlobjSearchColumn("custitem_bbs_matrix_item_seq",null,null),
										   	new nlobjSearchColumn("custitemfinish_type",null,null),
										   	new nlobjSearchColumn("custitem_bbs_item_colour",null,null),
										   	new nlobjSearchColumn("description","parent",null),
										   	new nlobjSearchColumn("custitem_bbs_item_category",null,null)
										]
										);
										
								var itemSearchResultSet = getResults(itemSearch);
										
								if(itemSearchResultSet)
									{
										for (var int5 = 0; int5 < itemSearchResultSet.length; int5++) 
											{
												var theCost = Number(0);
												var itemId = itemSearchResultSet[int5].getId();
												var itemCost = Number(itemSearchResultSet[int5].getValue('vendorcost'));
												var itemAssmbCost = Number(itemSearchResultSet[int5].getValue('custitem_bbs_item_cost'));
												var itemType = itemSearchResultSet[int5].getValue('type');
												var itemSeq = itemSearchResultSet[int5].getValue('custitem_bbs_matrix_item_seq');
												var itemFinish = itemSearchResultSet[int5].getText('custitemfinish_type');
												var itemColour = itemSearchResultSet[int5].getValue('custitem_bbs_item_colour');
												var itemParentDesc = itemSearchResultSet[int5].getValue('description','parent');
												var itemCategory = itemSearchResultSet[int5].getValue('custitem_bbs_item_category');
												
												itemColour = colourArray[itemColour];
												
												if(itemType == 'InvtPart')
													{
														theCost = itemCost;
													}
												else
													{
														theCost = itemAssmbCost;
														/*
																checkResources();
																
																var assemblyRecord = nlapiLoadRecord('assemblyitem', itemId);
																var topLevelDescription = assemblyRecord.getFieldValue('description');
																var topLevelItemId = assemblyRecord.getFieldValue('itemid');
																var topLevelData = [0,itemId,topLevelItemId,topLevelDescription,'',itemQty,'Assembly','', 0]; //Level, ItemId, Item, item Desc, Item Unit, Item Qty, Item Type, Item Source, Item Cost
																var itemQty = Number(1);
																var level = Number(1);
																
																bomList.push(topLevelData);
																
																explodeBom(itemId, bomList, level, itemQty);
											
																for (var int7 = 0; int7 < bomList.length; int7++) 
																	{ 
																		theCost += Number(bomList[int7][8]);
																	}
																*/
													}
														
												priceListArray[itemId].push(theCost);
												priceListArray[itemId].push(itemType);
												priceListArray[itemId].push(itemSeq);
												priceListArray[itemId].push((itemFinish == null ? '' : itemFinish));
												priceListArray[itemId].push((itemColour == null ? '' : itemColour));
												priceListArray[itemId].push((itemParentDesc == null ? '' : itemParentDesc));
												priceListArray[itemId].push((itemCategory == null ? '' : itemCategory));
												
											}
									}
										
								//Calculate the margin & combine the style, colour & finish
								//
								for ( var priceListItem in priceListArray) 
									{
										var sales = Number(priceListArray[priceListItem][4]);
										var cost = Number(priceListArray[priceListItem][18]);
										var style = priceListArray[priceListItem][2];
										var finish = priceListArray[priceListItem][21];
										var colour = priceListArray[priceListItem][22];
												
										var margin = '';
												
										if(sales > 0.0)
											{
												margin = (((sales - cost) / sales) * 100.0).toFixed(2) + '%';
											}
										else
											{
												margin = 'n/a';
											}
											
										priceListArray[priceListItem].push(margin);
										priceListArray[priceListItem].push(style + '-' + colour + ' ' + finish);
									}
							}						
					}
				
				//=============================================================================================
				//=============================================================================================
				//
				//Section that deals with outputting the price list to a file
				//
				//=============================================================================================
				//=============================================================================================
				//	
				//Column Numbers in output data:-
				//
				//0  = Item Id
				//1  = Item Name
				//2  = Item Style
				//3  = Item Description
				//4  = Item Price 1
				//5  = Item Price 2
				//6  = Item Price 3
				//7  = Item Price 4
				//8  = Item Price 5
				//9  = Item Price 6
				//10 = Item Qty 1
				//11 = Item Qty 2
				//12 = Item Qty 3
				//13 = Item Qty 4
				//14 = Item Qty 5
				//15 = Item Qty 6
				//16 = Pricing Source
				//17 = Sales Qty Ytd
				//18 = Item Cost
				//19 = Item Type
				//20 = Matrix Sequence
				//21 = Finish
				//22 = Item Colour
				//23 = Item Parent Description
				//24 = Item Category
				//25 = Margin
				//26 = Style + Colour + Finish
				//
				
				
				//Remove any entries that have a zero price
				//
				for ( var key in priceListArray) 
					{
						if(Number(priceListArray[key][4]) == 0)
							{
								delete priceListArray[key];
							}
					}
				
				
				//Define the column headings that are available
				//
				var columsToPrint = [];
				var columnHeadings = [];
				
				if(consolidatedParam == 'T')
					{
						//=============================================================================================
						//Consolidated output
						//=============================================================================================
						//
						
						//Build up a list of the finishes and their descriptions
						//
						var finishList = {};
	
						var assemblyitemSearch = nlapiSearchRecord("assemblyitem",null,
											[
											   ["type","anyof","Assembly"], 
											   "AND", 
											   ["isphantom","is","T"], 
											   "AND", 
											   ["custitem_bbs_item_customer","anyof",customerId]
											], 
											[
											   new nlobjSearchColumn("itemid",null,null).setSort(false), 
											   new nlobjSearchColumn("description",null,null),
											   new nlobjSearchColumn("formulatext",null,null).setFormula("SUBSTR({name},INSTR({name}, '-' )+1)")
											]
											);

						if(assemblyitemSearch)
							{
								for (var int = 0; int < assemblyitemSearch.length; int++) 
									{
										var finishId = assemblyitemSearch[int].getId();
										var assemblyRecord = nlapiLoadRecord('assemblyitem', finishId);
										var finishDescription = assemblyitemSearch[int].getValue('description');
										var finishShortId = assemblyitemSearch[int].getValue('formulatext');
	
										if(assemblyRecord)
											{
												var members = assemblyRecord.getLineItemCount('member');
												var memberDescription = '';
															
												for (var int2 = 1; int2 <= members; int2++) 
													{
														memberDescription += assemblyRecord.getLineItemValue('member', 'memberdescr', int2) + ' + ';
													}
															
												finishDescription = memberDescription.slice(0, memberDescription.length - 3);
											}

										finishList[finishShortId] = finishDescription;
									}
								}

						//Build up a list of styles & finishes
						//
						var styleAndFinish = {};
						
						for ( var priceListItem in priceListArray) 
							{
								var sAndFData = priceListArray[priceListItem][26];
								var ParentData = priceListArray[priceListItem][23];
								var PriceData = Number(priceListArray[priceListItem][4]);
								var ytdData = Number(priceListArray[priceListItem][17]);
								var costData = Number(priceListArray[priceListItem][18]);
								var finishData = priceListArray[priceListItem][21];
								
								//Add the finish description if available
								//
								if(finishList[finishData])
									{
										ParentData += ' (with ' + finishList[finishData] + ')';
									}
								
								if(!styleAndFinish[sAndFData])
									{
										styleAndFinish[sAndFData] = [sAndFData,ParentData,9999999,0,0,0,0,'']; //Style Colour & Finish, Parent Description, min price, ytd sales, sum of cost, # of costs, avg cost, margin
									}
								
								//If this price is less that the current stored price, save it
								//
								if(PriceData < styleAndFinish[sAndFData][2])
									{
										styleAndFinish[sAndFData][2] = PriceData;
									}
								
								//Average cost price
								//
								styleAndFinish[sAndFData][4] = Number(styleAndFinish[sAndFData][4]) + costData;
								styleAndFinish[sAndFData][5] = Number(styleAndFinish[sAndFData][5]) + Number(1);
								
								if(Number(styleAndFinish[sAndFData][5]) != 0)
									{
										styleAndFinish[sAndFData][6] = Number(styleAndFinish[sAndFData][4]) / Number(styleAndFinish[sAndFData][5]);
									}
								
								//Sum up the ytd values
								//
								styleAndFinish[sAndFData][3] = Number(styleAndFinish[sAndFData][3]) + Number(ytdData);
								
								//Calculate the margin
								//
								var sales = Number(styleAndFinish[sAndFData][2]);
								var cost = Number(styleAndFinish[sAndFData][6]);
								var margin = '';
								
								if(sales > 0.0)
									{
										margin = (((sales - cost) / sales) * 100.0).toFixed(2) + '%';
									}
								else
									{
										margin = 'n/a';
									}
								
								styleAndFinish[sAndFData][7] = margin;
							}
						
						//Sort the output
						//
						const orderedStyleAndFinish = {};
						Object.keys(styleAndFinish).sort().forEach(function(key) {
							orderedStyleAndFinish[key] = styleAndFinish[key];
						});
						
						//Headings are based on price list type (internal / external)
						//
						columnHeadings = ["Style Colour Finish","Description","Min Price","Ytd Sales","Sum of Cost","# of Costs","Avg Cost","Margin"];
						
						if(internalParam == 'T')
							{
								fileContents = '"****CONSOLIDATED PRICE LIST FOR INTERNAL USE ONLY****"' + '\r\n\r\n';
								fileContents += messageParam + '\r\n\r\n';
								
								columsToPrint = [0,1,2,3,6,7];
							}
						else
							{		
								fileContents = '"Price List Consolidated By Style & Finish"' + '\r\n\r\n';
								fileContents = messageParam + '\r\n\r\n';
							
								columsToPrint = [0,1,2,3];
							}
						
						//Output the required headings
						//
						for (var int6 = 0; int6 < columsToPrint.length; int6++) 
							{
								fileContents += '"' + columnHeadings[columsToPrint[int6]] + '",';
							}
						
						fileContents += '\r\n';
						
						//Loop through the keys
						//
						for ( var key in orderedStyleAndFinish) 
							{
								var priceData = orderedStyleAndFinish[key];
	
								for (var int2 = 0; int2 < priceData.length; int2++) 
									{
										if(columsToPrint.indexOf(int2) > -1)
											{
												var temp = priceData[int2];
												
												if(temp)
													{
														temp = (temp.toString()).replace(/"/g, '');
													}
												else
													{
														temp = '';
													}
												
												fileContents += '"' + temp + '",';
											}
									}
								
								fileContents += '\r\n';
							}
					}
				else
					{
						//=============================================================================================
						//Non consolidated output
						//=============================================================================================
						//
						
						//Headings are based on price list type (internal / external)
						//
						columnHeadings = ["Item Id","Item Name","Style","Description","Price 1","Price 2","Price 3","Price 4","Price 5","Price 6","Qty Break 1","Qty Break 2","Qty Break 3","Qty Break 4","Qty Break 5","Qty Break 6","Pricing Source","Sales Qty Ytd","Item Cost","Item Type","Matrix Sequence","Finish","Item Colour","Parent Description","Category","Margin","Style-Colour Finish"];
					
						if(internalParam == 'T')
							{
								fileContents = '"****PRICE LIST FOR INTERNAL USE ONLY****"' + '\r\n\r\n';
								fileContents += messageParam + '\r\n\r\n';
								
								columsToPrint = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,25];
							}
						else
							{		
								fileContents = '"Price List By SKU"' + '\r\n\r\n';
								fileContents = messageParam + '\r\n\r\n';
							
								columsToPrint = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17];
							}
						
						//Output the required headings
						//
						for (var int6 = 0; int6 < columsToPrint.length; int6++) 
							{
								fileContents += '"' + columnHeadings[columsToPrint[int6]] + '",';
							}
						
						fileContents += '\r\n';
						
						//Order the output list by the matrix sequence number
						//
						var tempObject = {};
						
						for ( var key in priceListArray) 
							{
							var sortKeyOne = priceListArray[key][24]; //Category
							var sortKeyTwo = priceListArray[key][20]; //Matrix sequence number
							var sortKeyThree = priceListArray[key][21]; //Finish
							
								tempObject[sortKeyOne + sortKeyTwo + sortKeyThree] = key;
								
								//tempObject[priceListArray[key][19]] = key;
							}
						
						const orderedTemp = {};
						Object.keys(tempObject).sort().forEach(function(key) {
							orderedTemp[key] = tempObject[key];
						});
						
						//Loop through the keys
						//
						for ( var key in orderedTemp) 
							{
								var priceData = priceListArray[orderedTemp[key]];

								for (var int2 = 0; int2 < priceData.length; int2++) 
									{
										if(columsToPrint.indexOf(int2) > -1)
											{
												var printString = '';
											
												if(int2 == 1)
													{
														printString = (priceData[int2].toString()).replace(/"/g, '');
														var colon = printString.indexOf(' : ');
														
														if(colon > -1)
															{
																printString = printString.substr(colon + 2);
															}
													}
												else
													{
														printString = (priceData[int2].toString()).replace(/"/g, '');
													}
												
												fileContents += '"' + printString + '",';
											}
									}
								
								fileContents += '\r\n';
							}
					}
				
				
				//=============================================================================================
				//Build the output file
				//=============================================================================================
				//
				
				//Create the file
				//
				var fileObject = nlapiCreateFile(fileName, 'CSV', fileContents);
				
				//Set the folder
				//
				fileObject.setFolder(-10);
				
				//Save the file to the filing cabinet
				//
				var fileId = nlapiSubmitFile(fileObject);
				
				//Attach the file to the customer
				//
				nlapiAttachRecord('file', fileId, 'customer', customerId, null);
				
				emailMessage += ' - ' + fileName + '\n';
			}
	}
	
	//Send the email to the user to say that we have finished
	//
	emailMessage += '\n';
	emailMessage += 'Price list export has completed - please check customer records for attached price list files\n';
	nlapiSendEmail(usersEmail, usersEmail, 'Price List Export', emailMessage);
}

//=============================================================================================
//=============================================================================================
//Functions
//=============================================================================================
//=============================================================================================
//
function getItems(giFilterArray)
{
	var itemSearch = nlapiCreateSearch("item", giFilterArray, 
			[
			new nlobjSearchColumn("itemid",null,null), 
			new nlobjSearchColumn("displayname",null,null), 
			new nlobjSearchColumn("salesdescription",null,null),
			new nlobjSearchColumn("type",null,null),
			new nlobjSearchColumn("parent",null,null),
			new nlobjSearchColumn("custitem_sw_base_parent",null,null),
			new nlobjSearchColumn("formulatext",null,null).setFormula("case {type} when 'Inventory Item' then {parent} else {custitem_sw_base_parent} end")
			]
			);
	
	var searchResult = itemSearch.runSearch();
	
	//Get the initial set of results
	//
	var start = 0;
	var end = 1000;
	var searchResultSet = searchResult.getResults(start, end);
	var resultlen = searchResultSet.length;

	//If there is more than 1000 results, page through them
	//
	checkResources();
	
	while (resultlen == 1000) 
		{
				start += 1000;
				end += 1000;

				var moreSearchResultSet = searchResult.getResults(start, end);
				resultlen = moreSearchResultSet.length;

				searchResultSet = searchResultSet.concat(moreSearchResultSet);
		}
	
	return searchResultSet;
}

function getItemRecordType(girtItemType)
{
	var girtItemRecordType = '';
	
	switch(girtItemType)
	{
		case 'InvtPart':
			girtItemRecordType = 'inventoryitem';
			break;
		
		case 'NonInvtPart':
			girtItemRecordType = 'noninventoryitem';
			break;
		
		case 'Assembly':
			girtItemRecordType = 'assemblyitem';
			break;
			
		case 'NonInvtPart':
			girtItemRecordType = 'noninventoryitem';
			break;
	}

	return girtItemRecordType;
}

function getItemPricingData(gipdItemId, gipdItemType, gipdItemDisplayName, gipdCurrencyId, gipdPriceLevel, gipdStyle, gipdDecription)
{
	checkResources();
	
	var priceArray = null;
	
	//Load the item record
	//
	var itemRecord = nlapiLoadRecord(getItemRecordType(gipdItemType), gipdItemId);
	
	//Get the quantity breaks based on the currency code of the customer
	//
	var itemQtyBreak1 = itemRecord.getFieldValue('price' + gipdCurrencyId.toString() + 'quantity1');
	var itemQtyBreak2 = itemRecord.getFieldValue('price' + gipdCurrencyId.toString() + 'quantity2');
	var itemQtyBreak3 = itemRecord.getFieldValue('price' + gipdCurrencyId.toString() + 'quantity3');
	var itemQtyBreak4 = itemRecord.getFieldValue('price' + gipdCurrencyId.toString() + 'quantity4');
	var itemQtyBreak5 = itemRecord.getFieldValue('price' + gipdCurrencyId.toString() + 'quantity5');
	var itemQtyBreak6 = itemRecord.getFieldValue('price' + gipdCurrencyId.toString() + 'quantity6');
	
	itemQtyBreak1 = (itemQtyBreak1 == null ? 0 : itemQtyBreak1);
	itemQtyBreak2 = (itemQtyBreak2 == null ? 0 : itemQtyBreak2);
	itemQtyBreak3 = (itemQtyBreak3 == null ? 0 : itemQtyBreak3);
	itemQtyBreak4 = (itemQtyBreak4 == null ? 0 : itemQtyBreak4);
	itemQtyBreak5 = (itemQtyBreak5 == null ? 0 : itemQtyBreak5);
	itemQtyBreak6 = (itemQtyBreak6 == null ? 0 : itemQtyBreak6);
	
	//Read the price sublist based on the customer's currency code
	//
	var priceSublist = 'price' + gipdCurrencyId.toString();
	
	var priceLineCount = itemRecord.getLineItemCount(priceSublist);
	var quantityLevels = itemRecord.getMatrixCount(priceSublist, 'price');
	
	priceArray = [gipdItemId,gipdItemDisplayName,gipdStyle, gipdDecription];
	
	for (var int2 = 1; int2 <= priceLineCount; int2++) 
	{
		var pricePriceLevel = itemRecord.getLineItemValue(priceSublist, 'pricelevel', int2);
		
		if (pricePriceLevel == gipdPriceLevel)
			{
				for ( j=1; j<=quantityLevels; j++)
					{
						var matrixPrice = itemRecord.getLineItemMatrixValue(priceSublist, 'price', int2, j);
						matrixPrice = (matrixPrice == '' ? 0 : matrixPrice);
						priceArray.push(matrixPrice);
					}

				priceArray.push(itemQtyBreak1);
				priceArray.push(itemQtyBreak2);
				priceArray.push(itemQtyBreak3);
				priceArray.push(itemQtyBreak4);
				priceArray.push(itemQtyBreak5);
				priceArray.push(itemQtyBreak6);

				break;
			}
	}
	return priceArray
}

function getResults(grSearch)
{
	checkResources();
	
	var searchResult = grSearch.runSearch();
	
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
}

function processItemResults(pirSearchResultSet, priceListArray, pirCurrencyId, pirPriceLevel, pirItemsToReportOn)
{
	checkResources();
	
	for (var int = 0; int < pirSearchResultSet.length; int++) 
	{
		//Get the item id & type
		//
		var pirItemId = pirSearchResultSet[int].getId();
		var pirItemType = pirSearchResultSet[int].getValue('type');
		var pirItemDisplayName = pirSearchResultSet[int].getValue('itemid');
		
		//Filter based on our list of items to report on
		//
		if(pirItemsToReportOn[pirItemId])
			{
				//Now see if we already have the item in the output array
				//
				if (!priceListArray[pirItemId])
				{
					//Call the routine to get the item price details
					//
					var pirPriceData = getItemPricingData(pirItemId, pirItemType, pirItemDisplayName, pirCurrencyId, pirPriceLevel, pirItemsToReportOn[pirItemId][2], pirItemsToReportOn[pirItemId][3]);
					
					priceListArray[pirItemId] = pirPriceData;
		
					priceListArray[pirItemId].push('Item Pricing');
				}
			}
	}

}

function checkResources()
{
	var remaining = parseInt(nlapiGetContext().getRemainingUsage());
	
	if(remaining < 100)
		{
			nlapiYieldScript();
		}
}

function explodeBom(topLevelAssemblyId, bomList, level, requiredQty)
{
	var assemblyRecord = nlapiLoadRecord('assemblyitem', topLevelAssemblyId);
	var memberCount = assemblyRecord.getLineItemCount('member');
	
	for (var int = 1; int <= memberCount; int++) 
	{
		var memberItem = assemblyRecord.getLineItemValue('member', 'item', int);
		var memberItemText = assemblyRecord.getLineItemText('member', 'item', int);
		var memberDesc = assemblyRecord.getLineItemValue('member', 'memberdescr', int);
		var memberUnit = assemblyRecord.getLineItemValue('member', 'memberunit', int);
		var memberQty = Number(assemblyRecord.getLineItemValue('member', 'quantity', int)) * requiredQty;
		var memberType = assemblyRecord.getLineItemValue('member', 'sitemtype', int);
		var memberSource = assemblyRecord.getLineItemValue('member', 'itemsource', int);
		var itemCost = Number(0);
		
		
		//We only want inventory items in the component summary
		//
		if (memberType == 'InvtPart')
			{
				var itemSearchResultSet = nlapiSearchRecord("item", null,
						[
						   ["internalid","anyof",memberItem]
						], 
						[
						   new nlobjSearchColumn("itemid",null,null), 
						   new nlobjSearchColumn("type",null,null), 
						   new nlobjSearchColumn("vendorcost",null,null)
						]
						);

				if(itemSearchResultSet)
					{
						for (var int6 = 0; int6 < itemSearchResultSet.length; int6++) 
							{
								itemCost = Number(itemSearchResultSet[int6].getValue('vendorcost'));
							}
					}
			}
		
		var lineData = [level,memberItem,memberItemText,memberDesc,memberUnit,memberQty,memberType,memberSource,itemCost];
		
		bomList.push(lineData);
		
		//If we have found another assembly, then explode that as well
		//
		if(memberType == 'Assembly')
			{
				explodeBom(memberItem, bomList, level + 1, requiredQty);
			}
	}
}

//left padding s with c to a total of n chars
//
function padding_left(s, c, n) 
{
	if (! s || ! c || s.length >= n) 
	{
		return s;
	}
	
	var max = (n - s.length)/c.length;
	
	for (var i = 0; i < max; i++) 
	{
		s = c + s;
	}
	
	return s;
}

