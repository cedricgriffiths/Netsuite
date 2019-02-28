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
function printProjectSuitelet(request, response)
{
	//=====================================================================
	// Parameters passed to the suitelet
	//=====================================================================
	//
	var salesOrderParam = request.getParameter('salesorderid');
			
	if (salesOrderParam != null && salesOrderParam != '') 
		{
			// Build the output
			//	
			var file = buildOutput(salesOrderParam);
	
			// Send back the output in the response message
			//
			response.setContentType('PDF', 'Project Document', 'inline');
			response.write(file.getValue());
		}
	else
		{
			//=====================================================================
			// Get request - so return a form for the user to process
			//=====================================================================
			//
			if (request.getMethod() == 'GET') 
				{
					//=====================================================================
					// Form creation
					//=====================================================================
					//
					var form = nlapiCreateForm('Print Project Document', false);
					form.setTitle('Print Project Document');
					
			
					//=====================================================================
					// Field groups creation
					//=====================================================================
					//
							
					//Add a field group for header info
					//
					var fieldGroupHeader = form.addFieldGroup('custpage_grp_header', 'Selection');
					fieldGroupHeader.setSingleColumn(true);
							
			
					//=====================================================================
					// Fields creation
					//=====================================================================
					//
			
					//Add a select field to select the sales order
					//
					var salesOrderField = form.addField('custpage_salesorder_select', 'text', 'Sales Order', null, 'custpage_grp_header');
					salesOrderField.setMandatory(true);
							
					form.addSubmitButton('Print Project Documents');
					
					//Write the response
					//
					response.writePage(form);
				}
			else
				{
					//=====================================================================
					// Post request - so process the returned form
					//=====================================================================
					//
					
					
					//Get the sales order 
					//
					var salesOrder = request.getParameter('custpage_salesorder_select');
			
					// Build the output
					//	
					var file = buildOutput(salesOrder);
			
					//Send back the output in the response message
					//
					response.setContentType('PDF', 'Project Document', 'inline');
					response.write(file.getValue());
			
				}
		}
}

//=====================================================================
// Functions
//=====================================================================
//
function buildOutput(salesOrderNumber)
{
	//Start the xml off with the basic header info 
	//
	var xml = "<?xml version=\"1.0\"?>\n<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n";
	
	//Read the sales order
	//
	var salesOrderRecord = nlapiLoadRecord('salesorder', salesOrderNumber);

	if(salesOrderRecord)
		{
		
			var today = new Date();
			var todayString = ('0' + today.getDate()).slice(-2) + '/' + ('0' + today.getMonth()).slice(-2) + '/' + today.getFullYear();
			
			var salesEntity = nlapiEscapeXML(salesOrderRecord.getFieldText('entity'));
			var salesEntityId = salesOrderRecord.getFieldValue('entity');
			var salesShipAddress = salesOrderRecord.getFieldValue('shipaddress');
			var salesSalesRep = nlapiEscapeXML(salesOrderRecord.getFieldText('salesrep'));
			var salesProjectNo = nlapiEscapeXML(salesOrderRecord.getFieldText('custbody_cseg_bbs_project_no'))
			var salesProjectTitle = nlapiEscapeXML(salesOrderRecord.getFieldValue('custbody_bbs_so_project_text'));
			var salesCustOrderNo = nlapiEscapeXML(salesOrderRecord.getFieldValue('otherrefnum'));
			var salesOrderDate = salesOrderRecord.getFieldValue('trandate');
			var salesShipDate = salesOrderRecord.getFieldValue('shipdate');
			var salesShipWC = salesOrderRecord.getFieldValue('custbody_bbs_week_commencing');
			var salesShipInstr = salesOrderRecord.getFieldValue('custbody_bbs_dely_instructions');
			var salesNotes = salesOrderRecord.getFieldValue('memo');
			var salesPhone = salesOrderRecord.getFieldValue('custbody_bbs_so_order_phone');
			var salesPaymentStatus = nlapiEscapeXML(salesOrderRecord.getFieldValue('custbody_bbs_proj_pay_status'));
			var salesPaymentTerms = nlapiEscapeXML(salesOrderRecord.getFieldText('custbody_bbs_proj_pay_terms'));
			var salesSpecialInstr = salesOrderRecord.getFieldValue('custbody_bbs_access_restriction');
			
			
			salesPaymentStatus = (salesPaymentStatus == null ? '' : salesPaymentStatus);
			salesPaymentTerms = (salesPaymentTerms == null ? '' : salesPaymentTerms);
			salesShipDate = (salesShipDate == null ? '' : salesShipDate);
			salesProjectTitle = (salesProjectTitle == null ? '' : salesProjectTitle);
			
			var entityRecord = nlapiLoadRecord('customer', salesEntityId);
			
			salesSpecialInstr = (salesSpecialInstr == null ? '' : salesSpecialInstr);
			salesSpecialInstr = nlapiEscapeXML(salesSpecialInstr);
			salesSpecialInstr = salesSpecialInstr.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />');
			
			var newLineCount = (salesSpecialInstr.match(new RegExp("<br />", "g")) || []).length;
			var linesToAdd = 4 - newLineCount;
			
			for (var int = 0; int < linesToAdd; int++) 
				{
					salesSpecialInstr += '<br />';
				}
			
			
			salesShipInstr = (salesShipInstr == null ? '' : salesShipInstr);
			salesShipInstr = nlapiEscapeXML(salesShipInstr);
			salesShipInstr = salesShipInstr.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />');
			
			salesNotes = (salesNotes == null ? '' : salesNotes);
			salesNotes = nlapiEscapeXML(salesNotes);
			salesNotes = salesNotes.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />');
					
			salesShipAddress = nlapiEscapeXML(salesShipAddress);
			salesShipAddress = salesShipAddress.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />');
					

							
			//Header & style sheet
			//
			xml += "<pdf>"
			xml += "<head>";
			xml += "<style type=\"text/css\">table {font-family: Calibri, Candara, Segoe, \"Segoe UI\", Optima, Arial, sans-serif;font-size: 9pt;table-layout: fixed;}";
			xml += "th {font-weight: bold;font-size: 8pt;padding: 0px;border-bottom: 1px solid black;border-collapse: collapse;}";
			xml += "td {padding: 0px;vertical-align: top;font-size:10px;}";
			xml += "b {font-weight: bold;color: #333333;}";
			xml += "table.header td {padding: 0px;font-size: 10pt;}";
			xml += "table.footer td {padding: 0;font-size: 6pt;}";
			xml += "table.itemtable th {padding-bottom: 0px;padding-top: 0px;}";
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
			xml += "span.title {font-size: 28pt;}";
			xml += "span.number {font-size: 16pt;}";
			xml += "span.itemname {font-weight: bold;line-height: 150%;}";
			xml += "hr {width: 100%;color: #d3d3d3;background-color: #d3d3d3;height: 1px;}";
			xml += "</style>";
			
			
			//Macros
			//
			xml += "<macrolist>";
			xml += "<macro id=\"nlfooter\"><table class=\"footer\" style=\"width: 100%;\"><tr><td align=\"right\">Page <pagenumber/> of <totalpages/></td></tr></table></macro>";
			xml += "<macro id=\"nlheader\">";
			xml += "<table style=\"width: 100%;\">";
			xml += "<tr>";
			xml += "<td align=\"left\" colspan=\"2\" style=\"font-size:12px; background-color:#d6d6d7; color:#000000; border: 1px solid black; padding: 2px;\"><b>Date:&nbsp;" + salesOrderDate +"</b></td>";
			xml += "<td align=\"left\" colspan=\"2\" style=\"font-size:12px; background-color:#d6d6d7; color:#000000; border: 1px solid black; padding: 2px;\"><b>Estimator:&nbsp;" + salesSalesRep + "</b></td>";
			xml += "<td align=\"right\" colspan=\"2\" style=\"font-size:12px; background-color:#d6d6d7; color:#000000; border: 1px solid black; padding: 2px;\"><b>Project Sheet No:&nbsp;" + salesProjectNo + "</b></td>";
			xml += "</tr>";
			xml += "</table>";
			xml += "</macro>";
			xml += "</macrolist>";
			xml += "</head>";
							
			//Body
			//
			xml += "<body header=\"nlheader\" header-height=\"40px\"  footer=\"nlfooter\" footer-height=\"10px\" padding=\"0.5in 0.5in 0.5in 0.5in\" size=\"A4\">";
					
			//Project header data
			//		
			xml += "<table style=\"width: 100%;\">";
			xml += "<tr>";
			xml += "<td align=\"left\" rowspan=\"2\" colspan=\"2\" style=\"font-size:10px; border: 1px solid black; padding: 2px;\"><b>Job Name:</b>&nbsp;" + salesProjectTitle + "</td>";
			xml += "<td align=\"left\" colspan=\"2\" style=\"font-size:10px; border: 1px solid black; padding: 2px;\"><b>Designer/QS:</b>&nbsp;" + salesEntity + "</td>";
			xml += "</tr>";
			
			xml += "<tr>";
			xml += "<td align=\"left\" colspan=\"2\" style=\"font-size:10px; border: 1px solid black; padding: 2px;\"><b>Invoice:</b>&nbsp;" + salesEntity + "</td>";
			xml += "</tr>";
			
			xml += "<tr>";
			xml += "<td align=\"left\" rowspan=\"5\" colspan=\"2\" style=\"font-size:10px; border: 1px solid black; padding: 2px;\"><b>Delivery Address:</b><br/>" + salesShipAddress + "</td>";
			xml += "<td align=\"left\"  style=\"font-size:10px; border: 1px solid black; padding: 2px;\"><b>Delivery Date:</b></td>";
			xml += "<td align=\"left\"  style=\"font-size:10px; border: 1px solid black; padding: 2px;\"><b>" + (salesShipWC == 'T' && salesShipDate != '' ? 'w/c ' : '') + salesShipDate + "</b></td>";
			xml += "</tr>";
			
			xml += "<tr>";
			xml += "<td align=\"left\"  style=\"font-size:10px; border: 1px solid black; padding: 2px;\">Delivery Via:</td>";
			xml += "<td align=\"left\"  style=\"font-size:10px; border: 1px solid black; padding: 2px;\">" + salesShipInstr + "</td>";
			xml += "</tr>";
			
			xml += "<tr>";
			xml += "<td align=\"left\" style=\"font-size:10px; border: 1px solid black; padding: 2px;\">Special Instructions:</td>";
			xml += "<td align=\"left\" style=\"font-size:10px; border: 1px solid black; padding: 2px;\">" + salesNotes + "</td>";
			xml += "</tr>";
			
			xml += "<tr>";
			xml += "<td align=\"left\" style=\"font-size:10px; border: 1px solid black; padding: 2px;\">Payment Status:</td>";
			xml += "<td align=\"left\" style=\"font-size:10px; border: 1px solid black; padding: 2px;\">" + salesPaymentStatus + "</td>";
			xml += "</tr>";
			
			xml += "<tr>";
			xml += "<td align=\"left\" style=\"font-size:10px; border: 1px solid black; padding: 2px;\">Cust Order No:</td>";
			xml += "<td align=\"left\" style=\"font-size:10px; border: 1px solid black; padding: 2px;\">" + salesCustOrderNo + "</td>";
			xml += "</tr>";
			
			xml += "<tr>";
			xml += "<td align=\"left\" colspan=\"2\" style=\"font-size:10px; border: 1px solid black; padding: 2px;\"><b>Telephone:</b>&nbsp;" + salesPhone + "</td>";
			xml += "<td align=\"left\" style=\"font-size:10px; border: 1px solid black; padding: 2px;\">Payment Terms:</td>";
			xml += "<td align=\"left\" style=\"font-size:10px; border: 1px solid black; padding: 2px;\">" + salesPaymentTerms + "</td>";
			xml += "</tr>";
			xml += "<tr>";
			xml += "<td align=\"left\">&nbsp;</td>";
			xml += "</tr>";
			
			xml += "</table>";
			/*
			xml += "<table style=\"width: 100%;\">";
			xml += "<thead>";
	        xml += "<tr>";
	        xml += "<th align=\"center\" colspan=\"2\" style=\"font-size:10px; border: 1px solid black; padding: 2px;\"><b>Joinery</b></th>";
	        xml += "<th align=\"center\" colspan=\"2\" style=\"font-size:10px; border: 1px solid black; padding: 2px;\"><b>Polishing</b></th>";
	        xml += "<th align=\"center\" colspan=\"2\" style=\"font-size:10px; border: 1px solid black; padding: 2px;\"><b>Upholstery</b></th>";
	        xml += "</tr>";
			xml += "</thead>";
            xml += "<tr>";
            xml += "<td align=\"center\" style=\"font-size:10px; border: 1px solid black; padding: 2px;\">Start Date<br/>&nbsp;<br/>&nbsp;<br/>&nbsp;</td>";
            xml += "<td align=\"center\" style=\"font-size:10px; border: 1px solid black; padding: 2px;\">Finish Date<br/>&nbsp;<br/>&nbsp;<br/>&nbsp;</td>";
            xml += "<td align=\"center\" style=\"font-size:10px; border: 1px solid black; padding: 2px;\">Start Date<br/>&nbsp;<br/>&nbsp;<br/>&nbsp;</td>";
            xml += "<td align=\"center\" style=\"font-size:10px; border: 1px solid black; padding: 2px;\">Finish Date<br/>&nbsp;<br/>&nbsp;<br/>&nbsp;</td>";
            xml += "<td align=\"center\" style=\"font-size:10px; border: 1px solid black; padding: 2px;\">Start Date<br/>&nbsp;<br/>&nbsp;<br/>&nbsp;</td>";
            xml += "<td align=\"center\" style=\"font-size:10px; border: 1px solid black; padding: 2px;\">Finish Date<br/>&nbsp;<br/>&nbsp;<br/>&nbsp;</td>";
            xml += "</tr>";
            xml += "<tr>";
			xml += "<td align=\"left\">&nbsp;</td>";
			xml += "</tr>";
			
			xml += "</table>";
			*/
			
			xml += "<table style=\"width: 100%;\">";
			xml += "<thead>";
	        xml += "<tr>";
	        xml += "<th align=\"left\" style=\"font-size:10px; border: 1px solid black; padding: 2px;\"><b>Special Instructions</b></th>";
	        xml += "</tr>";
			xml += "</thead>";
            xml += "<tr>";
            xml += "<td align=\"left\" style=\"font-size:10px; border: 1px solid black; padding: 2px;\">" + salesSpecialInstr + "</td>";
            xml += "</tr>";
            xml += "<tr>";
			xml += "<td align=\"left\">&nbsp;</td>";
			xml += "</tr>";
			
			xml += "</table>";
			
			//Project item data
			//	
			xml += "<table style=\"width: 100%;\">";
			xml += "<thead>";
	        xml += "<tr>";
	        xml += "<th align=\"center\" colspan=\"1\" style=\"font-size:10px; border: 1px solid black; padding: 2px;\"><b>Qty</b></th>";
	        xml += "<th align=\"center\" colspan=\"2\" style=\"font-size:10px; border: 1px solid black; padding: 2px;\"><b>Code</b></th>";
	        xml += "<th align=\"left\" colspan=\"10\" style=\"font-size:10px; border: 1px solid black; padding: 2px;\"><b>Description</b></th>";
	        xml += "<th align=\"center\" colspan=\"4\" style=\"font-size:10px; border: 1px solid black; padding: 2px;\"><b>Base Code</b></th>";
	        xml += "<th align=\"center\" colspan=\"4\" style=\"font-size:10px; border: 1px solid black; padding: 2px;\"><b>Base PO</b></th>";
	        xml += "<th align=\"center\" colspan=\"4\" style=\"font-size:10px; border: 1px solid black; padding: 2px;\"><b>Top PO</b></th>";
	        xml += "<th align=\"center\" colspan=\"4\" style=\"font-size:10px; border: 1px solid black; padding: 2px;\"><b>Fabric PO</b></th>";
	        xml += "</tr>";
			xml += "</thead>";
            
			var itemCount = salesOrderRecord.getLineItemCount('item');
			
			for (var int = 1; int <= itemCount; int++) 
				{
					var itemQuantity = salesOrderRecord.getLineItemValue('item', 'quantity', int);
					var itemRate = Number(salesOrderRecord.getLineItemValue('item', 'rate', int));
					var itemCode = '';
					var itemGenericDescription = nlapiEscapeXML(salesOrderRecord.getLineItemValue('item', 'custcol_bbs_sales_generic_desc', int));
					var itemDescription = nlapiEscapeXML(salesOrderRecord.getLineItemValue('item', 'description', int));
					var itemBaseCode = nlapiEscapeXML(salesOrderRecord.getLineItemValue('item', 'custcol_bbs_proj_base_code', int));
					var itemBasePo = nlapiEscapeXML(salesOrderRecord.getLineItemValue('item', 'custcol_bbs_proj_base_po', int));
					var itemTopPo = nlapiEscapeXML(salesOrderRecord.getLineItemValue('item', 'custcol_bbs_proj_top_po', int));
					var itemFabricPo = nlapiEscapeXML(salesOrderRecord.getLineItemValue('item', 'custcol_bbs_proj_fabric_po', int));
					
					itemBaseCode = (itemBaseCode == null ? '' : itemBaseCode);
					itemBasePo = (itemBasePo == null ? '' : itemBasePo);
					itemTopPo = (itemTopPo == null ? '' : itemTopPo);
					itemFabricPo = (itemFabricPo == null ? '' : itemFabricPo);
					
					
					if(itemRate != 0)
						{
							xml += "<tr>";
							xml += "<td align=\"center\" colspan=\"1\" style=\"font-size:10px; border: 1px solid black; padding: 2px;\">" + itemQuantity + "</td>";
							xml += "<td align=\"center\" colspan=\"2\" style=\"font-size:10px; border: 1px solid black; padding: 2px;\">" + itemCode + "</td>";
							xml += "<td align=\"left\" colspan=\"10\" style=\"font-size:10px; border: 1px solid black; padding: 2px;\">" + itemGenericDescription + "</td>";
							xml += "<td align=\"left\" colspan=\"4\" style=\"font-size:10px; border: 1px solid black; padding: 2px;\">" + itemBaseCode + "</td>";
							xml += "<td align=\"left\" colspan=\"4\" style=\"font-size:10px; border: 1px solid black; padding: 2px;\">" + itemBasePo + "</td>";
							xml += "<td align=\"left\" colspan=\"4\" style=\"font-size:10px; border: 1px solid black; padding: 2px;\">" + itemTopPo + "</td>";
							xml += "<td align=\"left\" colspan=\"4\" style=\"font-size:10px; border: 1px solid black; padding: 2px;\">" + itemFabricPo + "</td>";
				            xml += "</tr>";
						}
				}
			
			xml += "</table>";
			
			
			//Finish the body
			//
			xml += "</body>";
			
			//Finish the pdf
			//
			xml += "</pdf>";
	

		}
	else
		{
			xml += "<pdf>"
			xml += "<head>";
			xml += "</head>";
			xml += "<body padding=\"0.5in 0.5in 0.5in 0.5in\" size=\"A4\">";
			xml += "<p>No Data To Print</p>";
			xml += "</body>";
			xml += "</pdf>";
		}
	
	//Convert to pdf using the BFO library
	//
	var pdfFileObject = nlapiXMLToPDF(xml);
	
	return pdfFileObject;
}
