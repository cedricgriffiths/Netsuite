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
function printManPackSuitelet(request, response)
{
	//=====================================================================
	// Parameters passed to the suitelet
	//=====================================================================
	//
	var salesOrderParam = request.getParameter('salesorder');
			
	if (salesOrderParam != null && salesOrderParam != '') 
		{
			// Build the output
			//	
			var file = buildOutput(salesOrderParam);
	
			// Send back the output in the response message
			//
			response.setContentType('PDF', 'Man Pack Documents', 'inline');
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
					var form = nlapiCreateForm('Print Man Pack Documents', false);
					form.setTitle('Print Man Pack Documents');
					
			
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
							
					form.addSubmitButton('Print Man Pack Documents');
							
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
					response.setContentType('PDF', 'Man Pack Documents', 'inline');
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
	
	//Read the sales order lines that have a contact on them
	//
	var salesorderSearch = nlapiSearchRecord("salesorder",null,
			[
			   ["type","anyof","SalesOrd"], 
			   "AND", 
			   ["mainline","is","F"], 
			   "AND", 
			   ["taxline","is","F"], 
			   "AND", 
			   ["shipping","is","F"], 
			   "AND", 
			   ["custcol_bbs_sales_line_contact","noneof","@NONE@"], 
			   "AND", 
			   ["numbertext","is",salesOrderNumber]
			], 
			[
			   new nlobjSearchColumn("tranid",null,null), 
			   new nlobjSearchColumn("entity",null,null), 
			   new nlobjSearchColumn("item",null,null), 
			   new nlobjSearchColumn("quantitycommitted",null,null), 
			   new nlobjSearchColumn("quantity",null,null), 
			   new nlobjSearchColumn("custcol_bbs_sales_line_contact",null,null).setSort(false), 
			   new nlobjSearchColumn("salesdescription","item",null),
			   new nlobjSearchColumn("entityid","custcol_bbs_sales_line_contact",null),
			   new nlobjSearchColumn("custentity_bbs_contact_employee_number","custcol_bbs_sales_line_contact",null),
			   new nlobjSearchColumn("shipaddress",null,null),
			   new nlobjSearchColumn("custbodycustomer_notes_1",null,null)
			]
			);

	if(salesorderSearch)
		{
			//Start of a pdfset
			//
			xml += "<pdfset>";
		
			var lastContact = '';
			var today = new Date();
			var todayString = ('0' + today.getDate()).slice(-2) + '/' + ('0' + today.getMonth()).slice(-2) + '/' + today.getFullYear();
			
			//Loop through the results
			//
			for (var int = 0; int < salesorderSearch.length; int++) 
				{
					var salesId = salesorderSearch[int].getId();
					var salesItem = salesorderSearch[int].getText('item');
					var salesItemDesc = salesorderSearch[int].getValue('salesdescription','item');
					var salesQtyShip = salesorderSearch[int].getValue('quantitycommitted');
					var salesQty = salesorderSearch[int].getValue('quantity');
					var salesContact = salesorderSearch[int].getText('custcol_bbs_sales_line_contact');
					var salesContactName = salesorderSearch[int].getValue('entityid','custcol_bbs_sales_line_contact');
					var salesContactEmpNo = salesorderSearch[int].getValue('custentity_bbs_contact_employee_number','custcol_bbs_sales_line_contact');
					var salesContactId = salesorderSearch[int].getValue('custcol_bbs_sales_line_contact');
					var salesEntity = salesorderSearch[int].getText('entity');
					var salesEntityId = salesorderSearch[int].getValue('entity');
					var salesOrder = salesorderSearch[int].getValue('tranid');
					var salesShipAddress = salesorderSearch[int].getValue('shipaddress');
					var notes = salesorderSearch[int].getValue('custbodycustomer_notes_1');
					
					var entityRecord = nlapiLoadRecord('customer', salesEntityId);
					
					var salesEntityName = entityRecord.getFieldValue('altname');
					
					if (notes)
					{
						notes = nlapiEscapeXML(notes);
						notes = notes.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />');
					}
					
					if (salesShipAddress)
					{
						salesShipAddress = nlapiEscapeXML(salesShipAddress);
						salesShipAddress = salesShipAddress.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />');
					}
					
					if(lastContact != salesContactId)
						{
							//If the last contact is not blank, then we need to finish off the previous person's output
							//
							if(lastContact != '')
								{
									//Finish the item table
									//
									xml += "</table>";
									
									//Finish the body
									//
									xml += "</body>";
									
									//Finish the pdf
									//
									xml += "</pdf>";
								}
							
							//Set the last contact to be this contact
							//
							lastContact = salesContactId;
						
							//Start a new pdf for the new contact
							//
							
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
							xml += "</macrolist>";
							xml += "</head>";
							
							//Body
							//
							xml += "<body footer=\"nlfooter\" footer-height=\"1%\" padding=\"0.5in 0.5in 0.5in 0.5in\" size=\"A4\">";
					
							//Manpack header data
							//
							xml += "<table style=\"width: 100%\">";
							xml += "<tr>";
							xml += "<td align=\"left\" style=\"font-size:14px;\">Account:</td>";
							xml += "<td colspan=\"2\" align=\"left\" style=\"font-size:14px;\">" + nlapiEscapeXML(salesEntityName) + "</td>";
							xml += "<td align=\"left\" style=\"font-size:14px;\">&nbsp;</td>";
							xml += "<td align=\"left\" style=\"font-size:14px;\">Order No:</td>";
							xml += "<td align=\"right\" style=\"font-size:14px;\">" + nlapiEscapeXML(salesOrder) + "</td>";
							xml += "</tr>";
						
							xml += "<tr>";
							xml += "<td align=\"left\" style=\"font-size:14px;\">&nbsp;</td>";
							xml += "</tr>";
							
							xml += "<tr>";
							xml += "<td align=\"left\" style=\"font-size:14px;\">Employee:</td>";
							xml += "<td colspan=\"2\" align=\"left\" style=\"font-size:14px;\"><b>" + nlapiEscapeXML(salesContactName) + "</b></td>";
							xml += "</tr>";
							
							xml += "<tr>";
							xml += "<td align=\"left\" style=\"font-size:14px;\">&nbsp;</td>";
							xml += "</tr>";
							
							xml += "<tr>";
							xml += "<td align=\"left\" style=\"font-size:14px;\">Employee No:</td>";
							xml += "<td colspan=\"2\" align=\"left\" style=\"font-size:14px;\"><b>" + nlapiEscapeXML(salesContactEmpNo) + "</b></td>";
							xml += "<td align=\"left\" style=\"font-size:14px;\">&nbsp;</td>";
							xml += "<td align=\"left\" style=\"font-size:14px;\">Date:</td>";
							xml += "<td align=\"right\" style=\"font-size:14px;\">" + todayString + "</td>";
							xml += "</tr>";
							
							xml += "<tr>";
							xml += "<td align=\"left\" style=\"font-size:14px;\">&nbsp;</td>";
							xml += "</tr>";
							
							xml += "<tr>";
							xml += "<td align=\"left\" style=\"font-size:14px;\">Del Address:</td>";
							xml += "<td rowspan=\"5\" colspan=\"2\" align=\"left\" style=\"font-size:14px;\">" + salesShipAddress + "</td>";
							xml += "</tr>";
							xml += "</table>\n";
							
							xml += "<hr/>";
							
							xml += "<table style=\"width: 100%\">";
							xml += "<tr>";
							xml += "<td align=\"left\" style=\"font-size:14px;\">Notes</td>";
							xml += "<td colspan=\"5\" align=\"left\" style=\"font-size:10px;\">" + notes + "</td>";
							xml += "</tr>";
							xml += "</table>";
							
							xml += "<hr/>";
							
							//Item data
							//
							xml += "<table class=\"itemtable\" style=\"width: 100%;\">";
							xml += "<thead >";
							xml += "<tr >";
							xml += "<th colspan=\"6\">Item Code</th>";
							xml += "<th align=\"left\" colspan=\"12\">Item Description</th>";
							xml += "<th align=\"left\" colspan=\"2\">Qty Packed</th>";
							xml += "</tr>";
							xml += "</thead>";
						}
					
					//Do the detail lines output here
					//
					xml += "<tr>";
					xml += "<td colspan=\"6\">" + nlapiEscapeXML(salesItem) + "</td>";
					xml += "<td align=\"left\" colspan=\"12\">" + nlapiEscapeXML(salesItemDesc)  +  "</td>";
					xml += "<td align=\"left\" colspan=\"2\">" + salesQtyShip + "</td>";
					xml += "</tr>";
					
					xml += "<tr>";
					xml += "<td align=\"left\">&nbsp;</td>";
					xml += "</tr>";
					
				}
			
			//Finish the item table
			//
			xml += "</table>";
			
			//Finish the body
			//
			xml += "</body>";
			
			//Finish the pdf
			//
			xml += "</pdf>";
	
			//Finish the pdfset
			//
			xml += "</pdfset>";
		}
	
	//Convert to pdf using the BFO library
	//
	var pdfFileObject = nlapiXMLToPDF(xml);
	
	return pdfFileObject;
}
