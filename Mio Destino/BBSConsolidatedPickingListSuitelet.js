/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       03 Mar 2017     cedricgriffiths
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function consolidatedPickingSuitelet(request, response)
{
	//=============================================================================================
	//Start of main code
	//=============================================================================================
	//
	
	if (request.getMethod() == 'GET') 
	{
		//Get request - so return a form for the user to process
		//

		// Create a form
		//
		var form = nlapiCreateForm('Generate Consolidated Picking List');
		form.setTitle('Generate Consolidated Picking List');
		form.setScript('customscript_bbs_cons_pick_client')
		
		//Add a field group for optional filters
		//
		var fieldGroupFilters = form.addFieldGroup('custpage_grp_filters', 'Filters');

		var deliveryDateFieldFrom = form.addField('custpage_delivery_date_from', 'date', 'Delivery Date (From)', null,'custpage_grp_filters');
		var deliveryDateFieldTo = form.addField('custpage_delivery_date_to', 'date', 'Delivery Date (To)', null,'custpage_grp_filters');
		
		var today = nlapiDateToString(new Date());
		deliveryDateFieldFrom.setDefaultValue(today);
		deliveryDateFieldTo.setDefaultValue(today);
		deliveryDateFieldFrom.setBreakType('startcol');
		
		//Add a submit button to the form
		//
		form.addSubmitButton('Generate Picking List');
		
		//Write the response
		//
		response.writePage(form);
	}
	else
	{
		//Post request - so process the returned form
		//

		//Read the company config
		//
		var companyInfo = nlapiLoadConfiguration('companyinformation');
		var companyLogo = companyInfo.getFieldValue("pagelogo");
		var formLogo = companyInfo.getFieldValue("formlogo");
		var logoFile = nlapiLoadFile(formLogo);
		var logoURL = nlapiEscapeXML(logoFile.getURL());
		
		//Get the input data
		//
		var deliveryDateFrom = request.getParameter('custpage_delivery_date_from');
		var deliveryDateTo = request.getParameter('custpage_delivery_date_to');

		//Start the xml off with the basic header info 
		//
		var xml = "<?xml version=\"1.0\"?>\n<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n";
	
		//Run the query to get the transaction data
		//
		var salesorderSearch = nlapiSearchRecord("salesorder",null,
				[
				   ["type","anyof","SalesOrd"], 
				   "AND", 
				   ["status","anyof","SalesOrd:B"], 
				   "AND", 
				   ["mainline","is","F"], 
				   "AND", 
				   ["taxline","is","F"], 
				   "AND", 
				   ["shipping","is","F"], 
				   "AND", 
				   ["item.type","anyof","InvtPart"], 
				   "AND", 
				   ["sum(formulanumeric: {quantity} - NVL({quantitycommitted},0) + NVL({quantitypicked},0))","equalto","0"],
				   "AND", 
				   ["shipdate","within",deliveryDateFrom,deliveryDateTo],
				   "AND",
				   ["custbody_bbs_consolidated_pick_printed","is","F"]
				], 
				[
				   new nlobjSearchColumn("internalid",null,"GROUP"), 
				   new nlobjSearchColumn("formulanumeric",null,"SUM").setFormula("{quantity} - NVL({quantitycommitted},0)")
				]
				);
		
		if (salesorderSearch)
			{
				var salesOrders = [];
				
				for (var int = 0; int < salesorderSearch.length; int++) 
					{
						salesOrders.push(salesorderSearch[int].getValue('internalid', null, 'GROUP'));
					}
				
				//Create a scheduled job to update the printed flag on the sales orders
				//
				var params = {custscript_bbs_orders: JSON.stringify(salesOrders)};
				
				nlapiScheduleScript('customscript_bbs_cpl_schedule', 'customdeploy_bbs_cpl_schedule', params);
				
				
				//Perform the detail search
				//
				var salesorderDetailSearch = nlapiSearchRecord("salesorder",null,
						[
						   ["type","anyof","SalesOrd"], 
						   "AND", 
						   ["internalid","anyof",salesOrders], 
						   "AND", 
						   ["mainline","is","F"], 
						   "AND", 
						   ["item.type","anyof","InvtPart"]
						], 
						[
						   new nlobjSearchColumn("custitem_cseg_bbs_brand","item",null).setSort(false), 
						   new nlobjSearchColumn("tranid",null,null), 
						   new nlobjSearchColumn("custbody_ca_order_id",null,null), 
						   new nlobjSearchColumn("item",null,null).setSort(false), 
						   new nlobjSearchColumn("itemid","item",null), 
						   new nlobjSearchColumn("quantity",null,null), 
						   new nlobjSearchColumn("quantitycommitted",null,null), 
						   new nlobjSearchColumn("custcol_bbs_country_specific_size",null,null), 
						   new nlobjSearchColumn("custcol_bbs_brand_size_chart",null,null), 
						   new nlobjSearchColumn("custcol_bbs_exact_colour",null,null), 
						   new nlobjSearchColumn("salesdescription","item",null)
						]
						);
				
					var today = new Date();

					//Header & style sheet
					//
					xml += "<pdf>"
					xml += "<head>";
					xml += "<style type=\"text/css\">table {font-family: Calibri, Candara, Segoe, \"Segoe UI\", Optima, Arial, sans-serif;font-size: 9pt;table-layout: fixed;}";
					xml += "th {font-weight: bold; font-size: 8pt; padding: 0px; }";
					xml += "td {padding: 0px; vertical-align: top; font-size:10px;  }";
					xml += "b {font-weight: bold;color: #333333;}";
			        xml += "table.header td {padding: 0px;font-size: 10pt;}";
			        xml += "table.footer td {padding: 0;font-size: 6pt;}";
			        xml += "table.itemtable th {padding-bottom: 0px;padding-top: 0px;} ";
			        xml += "table.body td {padding-top: 0px;}";
			        xml += "table.total {page-break-inside: avoid;}";
			        xml += "table.message{border: 1px solid #dddddd;}";
			        xml += "tr.totalrow {line-height: 200%;}";
			        xml += "tr.messagerow{font-size: 6pt;}";
			        xml += "td.totalboxtop {font-size: 12pt;background-color: #e3e3e3;}";
			        xml += "td.addressheader {font-size: 10pt;padding-top: 0px;padding-bottom: 0px;}";
			        xml += "td.address {padding-top: 0;font-size: 10pt;}";
			        xml += "td.totalboxmid {font-size: 28pt;padding-top: 20px;background-color: #e3e3e3;}";
			        xml += "td.totalcell {border-bottom: 1px solid black;border-collapse: collapse;}";
			        xml += "td.message{font-size: 8pt;}";
			        xml += "td.totalboxbot {background-color: #e3e3e3;font-weight: bold;}";
			        //xml += "td.itemtable {border: 1px solid black; border-collapse: collapse; border-spacing: 0}";
			        xml += "span.title {font-size: 28pt;}";
			        xml += "span.number {font-size: 16pt;}";
			        xml += "span.itemname {font-weight: bold;line-height: 150%;}";
			        xml += "hr {width: 100%; color: #d3d3d3; background-color: #d3d3d3; height: 1px;}";
			        xml += "th.item1 {vertical-align: middle; border-top: 1px solid black; border-left: 1px solid black; border-right: 1px solid black; border-bottom: 1px solid black; border-collapse: collapse;}";
			        xml += "th.item2 {vertical-align: middle; border-top: 1px solid black; border-right: 1px solid black; border-bottom: 1px solid black;  border-collapse: collapse;}";
			        xml += "td.item1 {vertical-align: middle; border-left: 1px solid black; border-right: 1px solid black; border-bottom: 1px solid black; border-collapse: collapse;}";
			        xml += "td.item2 {vertical-align: middle; border-right: 1px solid black; border-bottom: 1px solid black;  border-collapse: collapse;}";
			        xml += "</style>";

			        //Macros
			        //
					xml += "<macrolist>";
					xml += "<macro id=\"nlfooter\">";
					xml += "<table class=\"footer\" style=\"width: 100%;\"><tr><td align=\"left\">" + today.toUTCString() + "</td><td align=\"right\">Page <pagenumber/> of <totalpages/></td></tr></table>";
					xml += "</macro>";
					
				    xml += "<macro id=\"nlheader\">"
				    xml += "<table class=\"header\" style=\"width: 100%;\">"
				    xml += "<tr>"
					xml += "<td><span style=\"font-size:24px;\"><b>Consolidated Picking Sheet</b></span></td>"
					xml += "<td align=\"right\">&nbsp;</td>"
					xml += "<td align=\"right\"><img src=\"" + logoURL + "\" style=\"float: right; width:200px; height:50px;\" /></td>"
				    xml += "</tr>"
				    xml += "</table>"
				    xml += "</macro>";
				    
					xml += "</macrolist>";
					
					//End of header
					//
					xml += "</head>";
					
					//Body
					//
					xml += "<body header=\"nlheader\" header-height=\"10%\" footer=\"nlfooter\" footer-height=\"1%\" padding=\"0.5in 0.5in 0.5in 0.5in\" size=\"A4-LANDSCAPE\">";

					//Header data
					//
					/*
					xml += "<table style=\"width: 100%\">";
					
					xml += "<tr>";
					xml += "<td align=\"center\" style=\"font-size:20px;\">&nbsp;</td>";
					xml += "<td align=\"center\" style=\"font-size:20px;\">&nbsp;</td>";
					xml += "</tr>";

					xml += "<tr>";
					xml += "<td align=\"center\" style=\"font-size:20px;\">&nbsp;</td>";
					xml += "<td align=\"center\" style=\"font-size:20px;\">&nbsp;</td>";
					xml += "</tr>";

					xml += "</table>\n";
					*/
					
					xml += "<p></p>";
					
					//Item data
					//
					xml += "<table class=\"itemtable\" style=\"width: 100%;\">";
					xml += "<thead >";
					xml += "<tr>";
					xml += "<th class=\"item1\" align=\"center\" colspan=\"4\">Brand</th>";
					xml += "<th class=\"item2\" align=\"center\" colspan=\"2\">Order</th>";
					xml += "<th class=\"item2\" align=\"center\" colspan=\"5\">Channel Order Id</th>";
					xml += "<th class=\"item2\" align=\"center\" colspan=\"2\">Qty</th>";
					xml += "<th class=\"item2\" align=\"center\" colspan=\"3\">Product Code</th>";
					xml += "<th class=\"item2\" align=\"center\" colspan=\"4\">Exact Colour</th>";
					xml += "<th class=\"item2\" align=\"center\" colspan=\"3\">Brand Size</th>";
					xml += "<th class=\"item2\" align=\"center\" colspan=\"3\">Country Size</th>";
					xml += "<th class=\"item2\" align=\"center\" colspan=\"10\">Product Description</th>";
					xml += "<th class=\"item2\" align=\"center\" colspan=\"2\">Picked</th>";


					xml += "</tr>";
					xml += "</thead>";

					
					//Loop through the results
					//
					if(salesorderDetailSearch)
						{
							for (var int2 = 0; int2 < salesorderDetailSearch.length; int2++) 
								{
									var brand = salesorderDetailSearch[int2].getText("custitem_cseg_bbs_brand", "item", null);
									var order = salesorderDetailSearch[int2].getValue("tranid", null, null);
									var channelOrder = salesorderDetailSearch[int2].getValue("custbody_ca_order_id", null, null);
									var qty = Number(salesorderDetailSearch[int2].getValue("quantity", null, null))
									var item = salesorderDetailSearch[int2].getValue("itemid", "item", null);
									var exactColour = salesorderDetailSearch[int2].getValue("custcol_bbs_exact_colour", null, null);
									var brandSize = salesorderDetailSearch[int2].getText("custcol_bbs_brand_size_chart", null, null);
									var countrySize = salesorderDetailSearch[int2].getValue("custcol_bbs_country_specific_size", null, null);
									var productDecsription = salesorderDetailSearch[int2].getValue("salesdescription", "item", null);
									
									var colon = item.indexOf(':');
									
									if(colon != -1)
										{
											item = item.substr(colon + 1);
										}
									
									xml += "<tr style=\"height: 20px;\">";
									xml += "<td class=\"item1\" style=\"padding-left: 2px;\" align=\"left\" colspan=\"4\">" + nlapiEscapeXML(brand) + "</td>";
									xml += "<td class=\"item2\" style=\"padding-left: 2px;\" align=\"center\" colspan=\"2\">" + nlapiEscapeXML(order) + "</td>";
									xml += "<td class=\"item2\" style=\"padding-left: 2px;\" align=\"left\" colspan=\"5\">" + nlapiEscapeXML(channelOrder) +"</td>";
									xml += "<td class=\"item2\" style=\"padding-right: 2px;\" align=\"right\" colspan=\"2\">" + nlapiEscapeXML(qty.toFixed(2)) + "</td>";
									xml += "<td class=\"item2\" style=\"padding-left: 2px;\" align=\"left\" colspan=\"3\">" + nlapiEscapeXML(item) + "</td>";
									xml += "<td class=\"item2\" style=\"padding-left: 2px;\" align=\"left\" colspan=\"4\">" + nlapiEscapeXML(exactColour) + "</td>";
									xml += "<td class=\"item2\" style=\"padding-left: 2px;\" align=\"left\" colspan=\"3\">" + nlapiEscapeXML(brandSize) + "</td>";
									xml += "<td class=\"item2\" style=\"padding-left: 2px;\" align=\"left\" colspan=\"3\">" + nlapiEscapeXML(countrySize) + "</td>";
									xml += "<td class=\"item2\" style=\"padding-left: 2px;\" align=\"left\" colspan=\"10\">" + nlapiEscapeXML(productDecsription) + "</td>";
									xml += "<td class=\"item2\" style=\"padding-left: 2px;\" align=\"right\" colspan=\"2\">&nbsp;</td>";
									xml += "</tr>";
								
								}
						
						}

					//Finish the item table
					//
					xml += "</table>";

					
					//Totals & confirmation 
					//
					/*
					xml += "<table class=\"total\" style=\"width: 100%;\">";
					xml += "<tr style=\"height: 30px; margin-top: 10px;\">";
					xml += "<td align=\"left\" colspan=\"2\">&nbsp;</td>";
					xml += "<td colspan=\"2\">&nbsp;</td>";
					xml += "<td align=\"left\" colspan=\"2\">&nbsp;</td>";
					xml += "<td style=\"vertical-align: middle;\" align=\"right\" colspan=\"12\"><b>TOTALS</b>&nbsp;&nbsp;</td>";
					xml += "<td style=\"vertical-align: middle; border: 1px solid black; padding-right: 2px;\" align=\"right\" colspan=\"2\"><b>" + nlapiEscapeXML(totalQuantity.toFixed(2)) + "</b></td>";
					xml += "<td align=\"left\" colspan=\"2\">&nbsp;</td>";
					xml += "<td align=\"left\" colspan=\"8\">&nbsp;</td>";
					xml += "<td style=\"vertical-align: middle; border: 1px solid black; padding-right: 2px;\" align=\"right\" colspan=\"4\"><b>" + nlapiEscapeXML(totalWeight.toFixed(2)) + "</b></td>";
					xml += "<td style=\"vertical-align: middle; border-top: 1px solid black; border-bottom: 1px solid black; border-right: 1px solid black; padding-right: 2px;\" align=\"right\" colspan=\"2\"><b>" + nlapiEscapeXML(totalPallet.toFixed(3)) + "</b></td>";
					xml += "</tr>";
					
					xml += "<tr style=\"height: 30px; margin-top: 10px;\">";
					xml += "<td style=\"vertical-align: middle;\" align=\"right\" colspan=\"18\"><b>Driver's Confirmation of Products &amp; Quantities (Name &amp; Sign):</b></td>";
					xml += "<td style=\"vertical-align: middle; border: 1px solid black;\" align=\"left\" colspan=\"12\">&nbsp;</td>";
					xml += "<td align=\"left\" colspan=\"6\">&nbsp;</td>";
					xml += "</tr>";
					xml += "</table>";
					*/
					
					//Finish the body
					//
					xml += "</body>";
					
					//Finish the pdf
					//
					xml += "</pdf>";
				
			}		
		else
			{
				xml += '<pdf><body>No data to print</body></pdf>'
			}
					
		//Convert to pdf using the BFO library
		//
		var file = nlapiXMLToPDF(xml);

		//Send back the output in the response message
		//
		response.setContentType('PDF', 'Consolidated Picking List', 'inline');
		response.write(file.getValue());
	}
}

function dateDiffInDays(a, b) 
{
	var _MS_PER_DAY = 1000 * 60 * 60 * 24;

	// Discard the time and time-zone information.
	var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
	var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

	return Math.floor((utc2 - utc1) / _MS_PER_DAY);
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
	}

	return itemType;
}