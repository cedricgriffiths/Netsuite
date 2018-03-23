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
			
			var salesEntity = salesOrderRecord.getFieldText('entity');
			var salesEntityId = salesOrderRecord.getFieldValue('entity');
			var salesShipAddress = salesOrderRecord.getFieldValue('shipaddress');
			var salesSalesRep = salesOrderRecord.getFieldText('salesrep');
			var salesProjectNo = salesOrderRecord.getFieldValue('custbody_cseg_bbs_project_no');
			var salesProjectTitle = salesOrderRecord.getFieldValue('custbody_bbs_so_project_text');
			var salesCustOrderNo = salesOrderRecord.getFieldValue('otherrefnum');
			var salesOrderDate = salesOrderRecord.getFieldValue('trandate');
			var salesShipDate = salesOrderRecord.getFieldValue('shipdate');
			var salesNotes = salesOrderRecord.getFieldValue('memo');
					
			var entityRecord = nlapiLoadRecord('customer', salesEntityId);
					
		
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
			xml += "</macrolist>";
			xml += "</head>";
							
			//Body
			//
			xml += "<body footer=\"nlfooter\" footer-height=\"1%\" padding=\"0.5in 0.5in 0.5in 0.5in\" size=\"A4\">";
					
			//Project header data
			//
			xml += "<table style=\"width: 100%\">";
			xml += "<tr>";
			xml += "<td align=\"left\" style=\"font-size:16px;\"><b>Date:&nbsp;01/01/2018</b></td>";
			xml += "<td align=\"left\" style=\"font-size:16px;\"><b></b></td>";
			xml += "<td align=\"left\" style=\"font-size:16px;\">&nbsp;</td>";
			xml += "</tr>";
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
