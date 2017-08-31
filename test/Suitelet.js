/**
 * Module Description
 * 
 * Version Date Author Remarks 1.00 30 Nov 2015 cedric
 * 
 */

// Global variables
var pdfName = "";

/**
 * @param {nlobjRequest}
 *            request Request object
 * @param {nlobjResponse}
 *            response Response object
 * @returns {Void} Any output is written via response object
 */
function generate_OLD_VERSION(request, response) {

	if (request.getMethod() == 'GET') {
		var form = nlapiCreateForm('Contract Print');

		var search = nlapiLoadSearch('customrecord_bbs_con_header', 'customsearch_bbs_contract_header');
		var searchResultSet = search.runSearch();
		var searchResults = searchResultSet.getResults(0, 100);

		var len = searchResults.length;

		var contractField = form.addField('custpage_f0', 'select', 'Select Contract', 'customrecord_bbs_con_header');

		form.addSubmitButton('Generate Report');

		response.writePage(form);
	}
	else {
		// Get selected contract id from the field on the form via the request
		var selectedContract = request.getParameter('custpage_f0');

		// Load the contract header record
		var contractHeader = nlapiLoadRecord('customrecord_bbs_con_header', selectedContract);

		// Load up the search on the contract detail records
		var search = nlapiLoadSearch('customrecord_bbs_con_detail', 'customsearch_bbs_contract_detail');

		// Add a filter to return only records for the current contract
		var detailFilter = new nlobjSearchFilter('custrecord_bbs_con_detail_contract', null, 'is', selectedContract);
		search.addFilter(detailFilter);

		// Run the serach & get the results back
		var searchResultSet = search.runSearch();
		var searchResults = searchResultSet.getResults(0, 100);

		var renderer = nlapiCreateTemplateRenderer();
		var templateFile = nlapiLoadFile('SuiteScripts/test/ContractTest.xml');
		var template = templateFile.getValue();

		// Passes in raw string of template to be transformed by FreeMarker
		renderer.setTemplate(template);

		// Binds the record object to the variable used in the template
		renderer.addRecord('contract', contractHeader);
		renderer.addSearchResults('contractitems', searchResults);

		// Returns template content interpreted by FreeMarker as XML string that
		// can be passed to the nlapiXMLToPDF function.
		var xml = renderer.renderToString();

		// Convert to pdf using the BFO library
		var file = nlapiXMLToPDF(xml);

		// Send back the output in the respnse message
		response.setContentType('PDF', 'sample.pdf', 'inline');
		response.write(file.getValue());

	}
}

/**
 * @param {nlobjRequest}
 *            request Request object
 * @param {nlobjResponse}
 *            response Response object
 * @returns {Void} Any output is written via response object
 */
function generate(request, response) {
	// See if we have been passed a contract id in the query params of the url,
	// if so this is being run directly from the contract header form
	var contractIdParam = request.getParameter('contractid');

	if (contractIdParam != null && contractIdParam != '') {
		// Build the report
		var file = buildReport(contractIdParam);

		// Send back the output in the response message
		response.setContentType('PDF', pdfName, 'inline');
		response.write(file.getValue());
	}
	else {
		// If we have a GET request, the build a form to ask the user to pick a
		// contract to print
		if (request.getMethod() == 'GET') {
			// Create a form
			var form = nlapiCreateForm('Contract Print');

			// Set the client side script to be used with this form
			form.setScript('customscript_bbs_suitlet_client');

			// Add a field to let the user select which contract to print
			var contractField = form.addField('custpage_f0', 'select', 'Select Contract', 'customrecord_bbs_con_header');

			// Add a submit button to generate the report
			var submitButton = form.addSubmitButton('Generate Report');

			// Send the form back to the caller
			response.writePage(form);
		}
		else {
			// We must be processing a POST request, so generate the report from
			// the selected contract id

			// Get selected contract id from the field on the form via the
			// request
			var selectedContract = request.getParameter('custpage_f0');

			if (selectedContract != null && selectedContract != '') {
				var file = buildReport(selectedContract);

				// Send back the output in the respnse message
				response.setContentType('PDF', pdfName, 'inline');
				response.write(file.getValue());
			}
		}
	}
}

function buildReport(selectedContract) {
	var maxRows = 30;
	var headerRows = 20;

	// Get the configuration record
	// Won't work as this required privs to access the company config
	//
	var companyConfig = nlapiLoadConfiguration("companyinformation");
	var CompanyName = companyConfig.getFieldValue("companyname");
	var CompanyLogo = companyConfig.getFieldValue("pagelogo");
	var FormLogo = companyConfig.getFieldValue("formlogo");
	var LogoFile = nlapiLoadFile(FormLogo);
	var LogoURL = nlapiEscapeXML(LogoFile.getURL());
	var currencySymbol = companyConfig.getFieldValue("displaysymbol");

	var bbAddress = "BrightBridge Solutions Limited<br/>Fosseway Suite<br/>High Cross Business Park<br/>Coventry Road<br/>Sharnford<br/>LE10 3PG<br/>United Kingdom<br/>VAT Number 213 9382 13";

	// Load the contract header record
	var contractHeader = nlapiLoadRecord('customrecord_bbs_con_header', selectedContract);
	var contractReference = nlapiEscapeXML(contractHeader.getFieldValue("name"));

	// Load the customer record found on the contract header
	var customerId = contractHeader.getFieldValue("custrecord_bbs_con_customer");
	var customerRecord = nlapiLoadRecord("customer", customerId);

	// Get the account manager & the customer name
	var accountManager = nlapiEscapeXML(customerRecord.getFieldValue("salesrep"));
	var customerName = nlapiEscapeXML(customerRecord.getFieldValue("companyname"));

	// Get the customer address
	var customerAddress = nlapiEscapeXML(customerRecord.getLineItemValue("addressbook", "addrtext", 1));
	customerAddress = customerAddress.replace(new RegExp("\r\n", 'g'), "<br/>");

	// Load the employee record to get the name of the account manager
	var employeeRecord = nlapiLoadRecord("employee", accountManager);
	var accountManagerName = nlapiEscapeXML(employeeRecord.getFieldValue("firstname") + " " + employeeRecord.getFieldValue("lastname"));

	// Get the contract header start & end dates
	var contractHeaderStartDate = contractHeader.getFieldValue("custrecord_bbs_con_start_date");
	var contractHeaderEndDate = contractHeader.getFieldValue("custrecord_bbs_con_end_date");

	// Construct the header information
	var strName = "<table style=\"width: 100%\"><tr>";
	strName += "<td colspan=\"2\" rowspan=\"6\">" + bbAddress + "</td>";

	strName += "<td><b>" + contractHeader.getField("custrecord_bbs_con_customer").getLabel() + "</b></td><td>" + nlapiEscapeXML(contractHeader.getFieldText("custrecord_bbs_con_customer")) + "</td></tr>";
	strName += "<tr><td><b>" + contractHeader.getField("name").getLabel() + "</b></td><td>" + nlapiEscapeXML(contractHeader.getFieldValue("name")) + "</td></tr>";
	strName += "<tr><td><b>" + contractHeader.getField("custrecord_bbs_con_reference").getLabel() + "</b></td><td>" + nlapiEscapeXML(contractHeader.getFieldValue("custrecord_bbs_con_reference")) + "</td></tr>";

	strName += "<tr><td><b>" + contractHeader.getField("custrecord_bbs_con_start_date").getLabel() + "</b></td><td>" + contractHeaderStartDate + " (";
	strName += contractHeader.getFieldText("custrecord_bbs_con_start_month") + ")</td></tr>";

	strName += "<tr><td><b>" + contractHeader.getField("custrecord_bbs_con_end_date").getLabel() + "</b></td><td>" + contractHeaderEndDate + " (";
	strName += contractHeader.getFieldText("custrecord_bbs_con_end_month") + ")</td></tr>";

	strName += "<tr><td><b>Account Manager</b></td><td>" + accountManagerName + "</td></tr>";

	strName += "<tr><td>&nbsp;</td></tr>";

	strName += "<tr><td colspan=\"2\" rowspan=\"6\">" + customerAddress + "</td></tr>";

	strName += "</table><br />";

	// Load up the search on the contract item records
	var search = nlapiLoadSearch('customrecord_bbs_con_detail', 'customsearch_bbs_contract_detail');

	// Add a filter to return only records for the current contract
	var detailFilter = new nlobjSearchFilter('custrecord_bbs_con_detail_contract', null, 'is', selectedContract);
	search.addFilter(detailFilter);

	// Run the serach & get the results back
	var searchResultSet = search.runSearch();
	var searchResults = searchResultSet.getResults(0, 100);

	// Initialise the row count
	var rowcount = 0;

	// See if we have any item lines to show
	if (searchResults.length > 0) {
		// Create a table header for the contract items
		strName += "<table style=\"width: 100%; margin-top: 10px; border: 1px solid black;\"><thead><tr><th style=\"background-color:#AAAAAA;color:#FFFFFF\" align=\"left\" colspan=\"5\">Item Description</th><th style=\"background-color:#AAAAAA;color:#FFFFFF\" align=\"left\" width=\"65px\">Start</th><th style=\"background-color:#AAAAAA;color:#FFFFFF\" align=\"left\" width=\"65px\">End</th><th style=\"background-color:#AAAAAA;color:#FFFFFF\" align=\"right\" width=\"70px\"  colspan=\"1\">Value</th><th style=\"background-color:#AAAAAA;color:#FFFFFF\" align=\"right\" width=\"70px\"  colspan=\"1\">Annualised</th></tr></thead>";

		// Loop through all of the items
		for (var int = 0; int < searchResults.length; int++) {
			rowcount++;

			var contractDetailStartDate = searchResults[int].getValue("custrecord_bbs_con_detail_start_date");
			var contractDetailEndDate = searchResults[int].getValue("custrecord_bbs_con_detail_end_date");

			if (contractDetailStartDate != contractHeaderStartDate || contractDetailEndDate != contractHeaderEndDate) {
			}
			else {
				contractDetailStartDate = "";
				contractDetailEndDate = "";
			}
			/*
			if (contractDetailStartDate == contractHeaderStartDate)
			{
			contractDetailStartDate = "";
			}

			if (contractDetailEndDate == contractHeaderEndDate)
			{
			contractDetailEndDate = "";
			}
			*/

			strName += "<tr><td  style=\"border-right: 1px solid black \" align=\"left\" colspan=\"5\">" + nlapiEscapeXML(searchResults[int].getValue("custrecord_bbs_con_detail_description")) + "</td><td style=\"border-right: 1px solid black \">" + contractDetailStartDate + "</td><td style=\"border-right: 1px solid black \">" + contractDetailEndDate + "</td><td style=\"border-right: 1px solid black \" align=\"right\" colspan=\"1\">" + nlapiEscapeXML(currencySymbol);

			var annualValue = searchResults[int].getValue("custrecord_bbs_con_detail_annual_value");
			var prorataValue = searchResults[int].getValue("custrecord_bbs_con_detail_prorata_value");

			// Use annual value or prorata value as appropriate
			if (prorataValue != "") {
				strName += CommaFormatted(prorataValue);
			}
			else {
				strName += CommaFormatted(annualValue);
			}

			strName += "</td><td align=\"right\" colspan=\"1\">" + nlapiEscapeXML(currencySymbol) + CommaFormatted(annualValue) + "</td></tr>";

			// Load up the search on the contract detail item records
			var searchItems = nlapiLoadSearch('customrecord_bbs_con_detail_items', 'customsearch_bbs_contract_detail_items');

			// Add a filter to return only records for the current item
			var detailId = searchResults[int].getId();
			var detailItemsFilter = new nlobjSearchFilter('custrecord_bbs_con_detail_item_detail_id', null, 'is', detailId);
			searchItems.addFilter(detailItemsFilter);

			// Run the serach & get the results back
			var searchItemsResultSet = searchItems.runSearch();
			var searchItemsResults = searchItemsResultSet.getResults(0, 100);

			if (searchItemsResults.length > 0) {
				// Loop through all of the contract item details
				for (var intItems = 0; intItems < searchItemsResults.length; intItems++) {
					rowcount++;

					strName += "<tr><td align=\"left\" colspan=\"5\" style=\"padding-left: 20px;border-right: 1px solid black\">" + nlapiEscapeXML(searchItemsResults[intItems].getValue("custrecord_bbs_con_detail_item_desc")) + "</td><td style=\"border-right: 1px solid black\"></td><td style=\"border-right: 1px solid black\"></td><td style=\"border-right: 1px solid black\"></td><td></td></tr>";
				}
			}
		}

		// Find out how big the customer address is, we have allowed a max of 7
		// lines
		var splitAddress = customerAddress.match(new RegExp("<br/>", "g"));
		var rowsInAddress = 0;

		if (splitAddress != null && splitAddress != "") {
			rowsInAddress = customerAddress.match(new RegExp("<br/>", "g")).length + 1;
		}
		else {
			rowsInAddress = 1;
		}
		// If there is less then we need to change the header size that we
		// calculate the page length with
		if (rowsInAddress < 7) {
			maxRows += 7 - rowsInAddress;
		}

		// If we have gone over a page then add the length of the header to the
		// count of blank rows to output
		if (rowcount > maxRows) {
			rowcount -= maxRows;
			maxRows += headerRows;
		}

		// Expand the table to its max size
		for (var int2 = rowcount; int2 < maxRows; int2++) {
			strName += "<tr><td  style=\"border-right: 1px solid black \" align=\"left\" colspan=\"5\">&nbsp;</td><td style=\"border-right: 1px solid black\"></td><td style=\"border-right: 1px solid black\"></td><td style=\"border-right: 1px solid black\"></td><td align=\"right\" colspan=\"1\"></td></tr>";
		}

		// Finish the contract items table
		strName += "</table>";

		strName += "<table style=\"width: 100%\"><tr><td  align=\"left\" colspan=\"5\">&nbsp;</td><td>&nbsp;</td><td align=\"right\"><b>Total</b></td><td align=\"right\" colspan=\"1\"><b>" + nlapiEscapeXML(currencySymbol) + CommaFormatted(contractHeader
				.getFieldValue("custrecord_bbs_con_total_sales_value")) + "</b></td><td align=\"right\" colspan=\"1\">" + nlapiEscapeXML(currencySymbol) + CommaFormatted(contractHeader.getFieldValue("custrecord_bbs_con_annualised_value")) + "</td></tr></table>";

		// strName += "<p style=\"font-size:90%;\"><b><i>BrightBridge Solutions
		// Limited. Registered in England, Number 09552788</i></b></p>"
	}

	// build up BFO-compliant XML using well-formed HTML
	var xml = "<?xml version=\"1.0\"?>\n<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n";
	xml += "<pdf>\n"
	xml += "<head><style type=\"text / css\">";
	xml += "table {font-family: helvetica; font-size: 8pt; table-layout:fixed; } ";
	xml += "th {font-weight: bold; font-size: 8pt; vertical-align: middle; padding: 5px 6px 3px; background-color: #e3e3e3; color: #333333; }";
	xml += "p {font-family: helvetica; font-size: 8pt;} </style>"
	// xml += "<macrolist><macro id=\"myfooter\"><p align=\"right\">Page
	// <pagenumber/> of <totalpages/></p></macro></macrolist>\n";

	xml += "<macrolist><macro id=\"myfooter\"><table style=\"width: 100%; \"><tr><td align=\"left\" style=\"font-size:60%;\" colspan=\"5\"><i>BrightBridge Solutions Limited. Registered in England, Number 09552788</i></td><td>&nbsp;</td><td align=\"right\">Page <pagenumber size=\"1\"/> of <totalpages size=\"1\"/></td></tr></table></macro></macrolist>\n";

	xml += "</head><body footer=\"myfooter\" font-size=\"9\">\n";
	xml += "<table style=\"width: 100%\"><tr>";
	xml += "<td ><img src=\"" + LogoURL + "\" style=\"float: left;width:180px;height:50px;\"/></td>";
	xml += "<td align=\"left\" style=\"font-size:16px; padding-top:30px;\"><b>Support Contract</b></td></tr></table>\n";
	xml += "<p></p>";
	xml += strName;
	xml += "</body>\n</pdf>";

	// Convert to pdf using the BFO library
	var file = nlapiXMLToPDF(xml);

	// Set the global variable with the name of the pdf file
	if (customerName && contractReference) {
		pdfName = [ customerName, contractReference ].join("-") + ".pdf";
	}
	else {
		pdfName = "SupportContract.pdf";
	}

	return file;

}

function CommaFormatted(amount) {
	if (amount != null && amount != '' && Number(amount) != 0) {
		var delimiter = ","; // replace comma if desired
		var a = amount.split('.', 2)
		var d = a[1];
		var i = parseInt(a[0]);

		if (isNaN(i)) {
			return '0.00';
		}

		var minus = '';

		if (i < 0) {
			minus = '-';
		}

		i = Math.abs(i);

		var n = new String(i);
		var a = [];

		while (n.length > 3) {
			var nn = n.substr(n.length - 3);
			a.unshift(nn);
			n = n.substr(0, n.length - 3);
		}

		if (n.length > 0) {
			a.unshift(n);
		}

		n = a.join(delimiter);

		if (d.length < 1) {
			amount = n;
		}
		else {
			amount = n + '.' + d;
		}

		amount = minus + amount;
	}
	else {
		amount = '0.00';
	}

	return amount;
}
