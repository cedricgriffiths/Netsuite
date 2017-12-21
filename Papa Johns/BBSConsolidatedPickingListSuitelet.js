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

		var routeField = form.addField('custpage_route_code', 'text', 'Route Code', null, 'custpage_grp_filters');
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
		var routeCode = request.getParameter('custpage_route_code');
		var deliveryDateFrom = nlapiStringToDate(request.getParameter('custpage_delivery_date_from'));
		var deliveryDateTo = nlapiStringToDate(request.getParameter('custpage_delivery_date_to'));

		var today = new Date();
		var searchesDone = Number(0);
		
		//Start the xml off with the basic header info 
		//
		var xml = "<?xml version=\"1.0\"?>\n<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n";
		xml += "<pdfset>";
		
		//Loop through the delivery days
		//
		var queryDate = deliveryDateFrom;
		
		while (queryDate <= deliveryDateTo) 
		{
			var queryDateString = nlapiDateToString(queryDate);
			
			//Run the query to get the transaction data
			//
			var salesorderSearch = nlapiSearchRecord("salesorder",null,
					[
					   ["type","anyof","SalesOrd"], 
					   "AND", 
					   ["status","anyof","SalesOrd:D","SalesOrd:E","SalesOrd:B"], 
					   "AND", 
					   ["mainline","is","F"], 
					   "AND", 
					   ["taxline","is","F"], 
					   //"AND", 
					   //["formulanumeric: {quantitycommitted} ","greaterthan","0"], 
					   "AND", 
					   ["formulanumeric: {quantity} - {quantityshiprecv}","greaterthan","0"], 
					   "AND", 
					   ["custbody_pj_routeno","is",routeCode], 
					   "AND", 
					   ["shipdate","on",queryDateString,queryDateString]
					], 
					[
					   new nlobjSearchColumn("custbody_pj_routeno",null,"GROUP").setSort(false), 
					   new nlobjSearchColumn("shipdate",null,"GROUP").setSort(false), 
					   new nlobjSearchColumn("custitemcustitem_pj_pickloc","item","GROUP"), 
					   new nlobjSearchColumn("custitem_pj_binlocation","item","GROUP").setSort(false), 
					   new nlobjSearchColumn("item",null,"GROUP").setSort(false), 
					   new nlobjSearchColumn("displayname","item","GROUP"), 
					   new nlobjSearchColumn("quantity",null,"SUM"), 
					   new nlobjSearchColumn("quantitycommitted",null,"SUM"), 
					   new nlobjSearchColumn("quantityshiprecv",null,"SUM"), 
					   new nlobjSearchColumn("custitem_pj_grossweight","item","MIN"),
					   new nlobjSearchColumn("custitem_palletequiv","item","MIN")
					   
					]
					);
			
			if (salesorderSearch)
				{
					searchesDone++;
					
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
				    xml += "<table class=\"header\" style=\"width: 100%;\">"
				    xml += "<tr><td>&nbsp;</td></tr>";
				    xml += "<tr><td>&nbsp;</td></tr>";
					xml += "<tr style=\"height: 30px;\">"
					xml += "<td style=\"vertical-align: middle; border-left: 1px solid black; border-bottom: 1px solid black; border-top: 1px solid black; border-collapse: collapse;\" align=\"left\">Route Number: </td>"
					xml += "<td style=\"vertical-align: middle; border-right: 1px solid black; border-bottom: 1px solid black; border-top: 1px solid black; border-collapse: collapse;\" align=\"left\">" + nlapiEscapeXML(routeCode) + "</td>"
					xml += "<td align=\"right\">&nbsp;</td>"
					xml += "<td style=\"vertical-align: middle; border-left: 1px solid black; border-bottom: 1px solid black; border-top: 1px solid black; border-collapse: collapse;\" align=\"left\">Date &amp; Time of Picking:</td>"
					xml += "<td style=\"vertical-align: middle; border-right: 1px solid black; border-bottom: 1px solid black; border-top: 1px solid black; border-collapse: collapse;\" align=\"right\">&nbsp;</td>"
					xml += "</tr>"
						
					xml += "<tr><td>&nbsp;</td></tr>"
							
					xml += "<tr style=\"height: 30px;\">";
					xml += "<td style=\"vertical-align: middle; border-left: 1px solid black; border-bottom: 1px solid black; border-top: 1px solid black; border-collapse: collapse;\" align=\"left\">Delivery Date: </td>";
					xml += "<td style=\"vertical-align: middle; border-right: 1px solid black; border-bottom: 1px solid black; border-top: 1px solid black; border-collapse: collapse;\" align=\"left\">" + nlapiEscapeXML(queryDateString) + "</td>";
					xml += "<td align=\"right\">&nbsp;</td>";
					xml += "<td style=\"vertical-align: middle; border-left: 1px solid black; border-bottom: 1px solid black; border-top: 1px solid black; border-collapse: collapse;\" align=\"left\">PJ Staff Name &amp; Signature:</td>";
					xml += "<td style=\"vertical-align: middle; border-right: 1px solid black; border-bottom: 1px solid black; border-top: 1px solid black; border-collapse: collapse;\" align=\"right\">&nbsp;</td>"
					xml += "</tr>";
							
					xml += "</table>";
                  
                  
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
					xml += "<p></p>";
				    xml += "</macro>";

					xml += "</macrolist>";
					xml += "</head>";
					
					//Body
					//
					xml += "<body header=\"nlheader\" header-height=\"180px\" footer=\"nlfooter\" footer-height=\"2%\" padding=\"0.5in 0.5in 0.5in 0.5in\" size=\"A4-LANDSCAPE\">";

					//Header data
					//
					
					
					//Item data
					//
					xml += "<table class=\"itemtable\" style=\"width: 100%;\">";
					xml += "<thead >";
					xml += "<tr>";
					xml += "<th class=\"item1\" align=\"center\" colspan=\"2\">Storage</th>";
					xml += "<th class=\"item2\" align=\"center\" colspan=\"2\">Bin<br/>Loc</th>";
					xml += "<th class=\"item2\" align=\"center\" colspan=\"2\">Product<br/>Code</th>";
					xml += "<th class=\"item2\" align=\"center\" colspan=\"12\">Product Description</th>";
					xml += "<th class=\"item2\" align=\"center\" colspan=\"2\">Ordered<br/>Quantity</th>";
					xml += "<th class=\"item2\" align=\"center\" colspan=\"2\">Picked<br/>Quantity</th>";
					xml += "<th class=\"item2\" align=\"center\" colspan=\"8\">Use By / Best Before /<br/>Batch Code</th>";
					xml += "<th class=\"item2\" align=\"center\" colspan=\"4\">Total<br/>Gross Weight</th>";
					xml += "<th class=\"item2\" align=\"center\" colspan=\"2\">Pallet<br/>Equiv.</th>";

					xml += "</tr>";
					xml += "</thead>";

					
					//Loop through the results
					//
					var totalQuantity = Number(0);
					var totalWeight = Number(0);
					var totalPallet = Number(0);
					
					for (var int3 = 0; int3 < salesorderSearch.length; int3++) 
					{
						var storage = salesorderSearch[int3].getValue("custitemcustitem_pj_pickloc", "item","GROUP");
						var binLoc = salesorderSearch[int3].getValue("custitem_pj_binlocation","item","GROUP");
						var productCode = salesorderSearch[int3].getText("item",null,"GROUP");
						var productDecsription = salesorderSearch[int3].getValue("displayname","item","GROUP");
						var qty = Number(salesorderSearch[int3].getValue("quantity",null,"SUM"))
						var qtyFulfilled = Number(salesorderSearch[int3].getValue("quantityshiprecv",null,"SUM"))
						var palletQty = Number(salesorderSearch[int3].getValue("custitem_palletequiv","item","MIN"));
						var gross = Number(salesorderSearch[int3].getValue("custitem_pj_grossweight","item","MIN"));
						
						var quantityOrdered = qty - qtyFulfilled;
						var palletEquiv = quantityOrdered * palletQty;
						var grossWeight = quantityOrdered * gross;
						
						totalQuantity += quantityOrdered;
						totalWeight += grossWeight;
						totalPallet += palletEquiv;
							
						xml += "<tr style=\"height: 20px;\">";
						xml += "<td class=\"item1\" align=\"center\" colspan=\"2\">" + nlapiEscapeXML(storage) + "</td>";
						xml += "<td class=\"item2\" align=\"center\" colspan=\"2\">" + nlapiEscapeXML(binLoc) + "</td>";
						xml += "<td class=\"item2\" align=\"center\" colspan=\"2\">" + nlapiEscapeXML(productCode) +"</td>";
						xml += "<td class=\"item2\" style=\"padding-left: 2px;\" align=\"left\" colspan=\"12\">" + nlapiEscapeXML(productDecsription) + "</td>";
						xml += "<td class=\"item2\" style=\"padding-right: 2px;\" align=\"right\" colspan=\"2\">" + nlapiEscapeXML(quantityOrdered.toFixed(2)) + "</td>";
						xml += "<td class=\"item2\" align=\"left\" colspan=\"2\">&nbsp;</td>";
						xml += "<td class=\"item2\" align=\"left\" colspan=\"8\">&nbsp;</td>";
						xml += "<td class=\"item2\" style=\"padding-right: 2px;\" align=\"right\" colspan=\"4\">" + nlapiEscapeXML(grossWeight.toFixed(2)) + "</td>";
						xml += "<td class=\"item2\" style=\"padding-right: 2px;\" align=\"right\" colspan=\"2\">" + nlapiEscapeXML(palletEquiv.toFixed(3)) + "</td>";
						xml += "</tr>";
					}
					
					//Finish the item table
					//
					xml += "</table>";

					
					//Totals & confirmation 
					//
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
					
					
					//Finish the body
					//
					xml += "</body>";
					
					//Finish the pdf
					//
					xml += "</pdf>";
				}
			
			queryDate = nlapiAddDays(queryDate, 1);
		}
		
		//If no data has been found then make a dummy pdf to say that there is no data
		//
		if(searchesDone == 0)
			{
				xml += '<pdf><body>No data to print</body></pdf>'
			}
		
		//
		//Finish the pdfset
		//
		xml += "</pdfset>";
					
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