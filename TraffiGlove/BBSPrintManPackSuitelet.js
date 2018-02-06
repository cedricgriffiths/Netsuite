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
	// Get request - so return a form for the user to process
	//=====================================================================
	//
	
	if (request.getMethod() == 'GET') 
	{
		//=====================================================================
		// Parameters passed to the suitelet
		//=====================================================================
		//
		var salesOrderParam = Number(request.getParameter('salesorder'));
		
		
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
		var salesOrderNumber = request.getParameter('custpage_salesorder_select');

		//Read the sales order
		//
		var salesorderSearch = nlapiSearchRecord("salesorder",null,
				[
				   ["type","anyof","SalesOrd"], 
				   "AND", 
				   ["mainline","is","T"], 
				   "AND", 
				   ["numbertext","is",salesOrderNumber]
				], 
				[
				   new nlobjSearchColumn("tranid",null,null), 
				   new nlobjSearchColumn("entity",null,null)
				]
				);
		
		if(salesorderSearch)
			{
				var salesOrderId = salesorderSearch[0].getId();
			
			
				//Start the xml off with the basic header info 
				//
				var xml = "<?xml version=\"1.0\"?>\n<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n";
				
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
		
				//Header data
				//
				xml += "<table style=\"width: 100%\">";
				xml += "<tr>";
				xml += "<td colspan=\"2\" align=\"left\" style=\"font-size:12px;\">&nbsp;</td>";
				xml += "<td colspan=\"12\" align=\"center\" style=\"font-size:20px;\"><b>Man Pack - Sales Order " +  salesOrderNumber + "</b></td>";
				xml += "<td colspan=\"2\" align=\"right\" style=\"font-size:12px;\">&nbsp;</td>";
				xml += "</tr>";
				
				xml += "</table>\n";
				xml += "<p></p>";
				
				//Finish the body
				//
				xml += "</body>";
				
				//Finish the pdf
				//
				xml += "</pdf>";
		
				//Convert to pdf using the BFO library
				//
				var pdfFileObject = nlapiXMLToPDF(xml);
				
				//Send back the output in the response message
				//
				response.setContentType('PDF', 'Man Pack Documents', 'inline');
				response.write(pdfFileObject.getValue());
		
			}

	}
}

//=====================================================================
// Functions
//=====================================================================
//

