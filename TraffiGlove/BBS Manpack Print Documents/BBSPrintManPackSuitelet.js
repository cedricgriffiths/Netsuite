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

	//=============================================================================================
	//Prototypes
	//=============================================================================================
	//
	
	//Date & time formatting prototype 
	//
	(function() {

		Date.shortMonths = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];
		Date.longMonths = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];
		Date.shortDays = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ];
		Date.longDays = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ];

		// defining patterns
		var replaceChars = {
		// Day
		d : function() {
			return (this.getDate() < 10 ? '0' : '') + this.getDate();
		},
		D : function() {
			return Date.shortDays[this.getDay()];
		},
		j : function() {
			return this.getDate();
		},
		l : function() {
			return Date.longDays[this.getDay()];
		},
		N : function() {
			return (this.getDay() == 0 ? 7 : this.getDay());
		},
		S : function() {
			return (this.getDate() % 10 == 1 && this.getDate() != 11 ? 'st' : (this.getDate() % 10 == 2 && this.getDate() != 12 ? 'nd' : (this.getDate() % 10 == 3 && this.getDate() != 13 ? 'rd' : 'th')));
		},
		w : function() {
			return this.getDay();
		},
		z : function() {
			var d = new Date(this.getFullYear(), 0, 1);
			return Math.ceil((this - d) / 86400000);
		}, // Fixed now
		// Week
		W : function() {
			var target = new Date(this.valueOf());
			var dayNr = (this.getDay() + 6) % 7;
			target.setDate(target.getDate() - dayNr + 3);
			var firstThursday = target.valueOf();
			target.setMonth(0, 1);
			if (target.getDay() !== 4) {
				target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
			}
			var retVal = 1 + Math.ceil((firstThursday - target) / 604800000);

			return (retVal < 10 ? '0' + retVal : retVal);
		},
		// Month
		F : function() {
			return Date.longMonths[this.getMonth()];
		},
		m : function() {
			return (this.getMonth() < 9 ? '0' : '') + (this.getMonth() + 1);
		},
		M : function() {
			return Date.shortMonths[this.getMonth()];
		},
		n : function() {
			return this.getMonth() + 1;
		},
		t : function() {
			var year = this.getFullYear(), nextMonth = this.getMonth() + 1;
			if (nextMonth === 12) {
				year = year++;
				nextMonth = 0;
			}
			return new Date(year, nextMonth, 0).getDate();
		},
		// Year
		L : function() {
			var year = this.getFullYear();
			return (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0));
		}, // Fixed now
		o : function() {
			var d = new Date(this.valueOf());
			d.setDate(d.getDate() - ((this.getDay() + 6) % 7) + 3);
			return d.getFullYear();
		}, //Fixed now
		Y : function() {
			return this.getFullYear();
		},
		y : function() {
			return ('' + this.getFullYear()).substr(2);
		},
		// Time
		a : function() {
			return this.getHours() < 12 ? 'am' : 'pm';
		},
		A : function() {
			return this.getHours() < 12 ? 'AM' : 'PM';
		},
		B : function() {
			return Math.floor((((this.getUTCHours() + 1) % 24) + this.getUTCMinutes() / 60 + this.getUTCSeconds() / 3600) * 1000 / 24);
		}, // Fixed now
		g : function() {
			return this.getHours() % 12 || 12;
		},
		G : function() {
			return this.getHours();
		},
		h : function() {
			return ((this.getHours() % 12 || 12) < 10 ? '0' : '') + (this.getHours() % 12 || 12);
		},
		H : function() {
			return (this.getHours() < 10 ? '0' : '') + this.getHours();
		},
		i : function() {
			return (this.getMinutes() < 10 ? '0' : '') + this.getMinutes();
		},
		s : function() {
			return (this.getSeconds() < 10 ? '0' : '') + this.getSeconds();
		},
		u : function() {
			var m = this.getMilliseconds();
			return (m < 10 ? '00' : (m < 100 ? '0' : '')) + m;
		},
		// Timezone
		e : function() {
			return /\((.*)\)/.exec(new Date().toString())[1];
		},
		I : function() {
			var DST = null;
			for (var i = 0; i < 12; ++i) {
				var d = new Date(this.getFullYear(), i, 1);
				var offset = d.getTimezoneOffset();

				if (DST === null)
					DST = offset;
				else
					if (offset < DST) {
						DST = offset;
						break;
					}
					else
						if (offset > DST)
							break;
			}
			return (this.getTimezoneOffset() == DST) | 0;
		},
		O : function() {
			return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + Math.floor(Math.abs(this.getTimezoneOffset() / 60)) + (Math.abs(this.getTimezoneOffset() % 60) == 0 ? '00' : ((Math.abs(this.getTimezoneOffset() % 60) < 10 ? '0' : '')) + (Math
					.abs(this.getTimezoneOffset() % 60)));
		},
		P : function() {
			return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + Math.floor(Math.abs(this.getTimezoneOffset() / 60)) + ':' + (Math.abs(this.getTimezoneOffset() % 60) == 0 ? '00' : ((Math.abs(this.getTimezoneOffset() % 60) < 10 ? '0' : '')) + (Math
					.abs(this.getTimezoneOffset() % 60)));
		}, // Fixed now
		T : function() {
			return this.toTimeString().replace(/^.+ \(?([^\)]+)\)?$/, '$1');
		},
		Z : function() {
			return -this.getTimezoneOffset() * 60;
		},
		// Full Date/Time
		c : function() {
			return this.format("Y-m-d\\TH:i:sP");
		}, // Fixed now
		r : function() {
			return this.toString();
		},
		U : function() {
			return this.getTime() / 1000;
		}
		};

		// Simulates PHP's date function
		Date.prototype.format = function(format) {
			var date = this;
			return format.replace(/(\\?)(.)/g, function(_, esc, chr) {
				return (esc === '' && replaceChars[chr]) ? replaceChars[chr].call(date) : chr;
			});
		};

	}).call(this);
	
	
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
//			   "AND", 
//			   ["custcol_bbs_sales_line_contact","noneof","@NONE@"], 
			   "AND", 
			   ["numbertext","is",salesOrderNumber],
			   "AND",
			   ["quantitycommitted","greaterthan","0"]
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
			   new nlobjSearchColumn("custbody_sw_order_notes",null,null),
			   new nlobjSearchColumn("custbody_sw_on_manpack",null,null),
			   new nlobjSearchColumn("companyname","customer",null)
			]
			);

	if(salesorderSearch)
		{
			//Start of a pdfset
			//
			xml += "<pdfset>";
		
			var lastContact = '';
			var today = new Date();
			//var todayString = ('0' + today.getDate()).slice(-2) + '/' + ('0' + today.getMonth()).slice(-2) + '/' + today.getFullYear();
			var todayString = today.format('d/m/Y');
			var salesOrderRecord = null;
			
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
					var notes = salesorderSearch[int].getValue('custbody_sw_order_notes');
					var printNotes = salesorderSearch[int].getValue('custbody_sw_on_manpack');
					var salesEntityName = salesorderSearch[int].getValue("companyname","customer");
					
					if(salesContact == null || salesContact == '')
						{
							salesContact = 'Bulk';
							salesContactName = 'Bulk';
							salesContactEmpNo = '';
							salesContactId = '99999999';
						}
					
					var colon = salesItem.indexOf(' : ');
					
					if(colon > -1)
						{
							salesItem = salesItem.substr(colon + 2);
						}
					
					if (printNotes == 'T')
						{
							
							notes = (notes == null ? '' : notes);
							notes = nlapiEscapeXML(notes);
							notes = notes.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />');
						}
					else
						{
							notes = '';
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
							
							xml += "<macro id=\"nlheader\">";
							
							//Manpack header data
							//
							xml += "<table style=\"width: 100%\">";
							xml += "<tr>";
							xml += "<td align=\"left\" style=\"font-size:16px;\">Account:</td>";
							xml += "<td colspan=\"3\" align=\"left\" style=\"font-size:16px;\">" + nlapiEscapeXML(salesEntityName) + "</td>";
							xml += "<td align=\"left\" style=\"font-size:16px;\">&nbsp;</td>";
							xml += "<td align=\"left\" style=\"font-size:16px;\">Order No:</td>";
							xml += "<td align=\"right\" style=\"font-size:16px;\">" + nlapiEscapeXML(salesOrder) + "</td>";
							xml += "</tr>";
						
							xml += "<tr>";
							xml += "<td align=\"left\" style=\"font-size:16px;\">&nbsp;</td>";
							xml += "</tr>";
							
							xml += "<tr>";
							xml += "<td align=\"left\" style=\"font-size:16px;\">Employee:</td>";
							xml += "<td colspan=\"3\" align=\"left\" style=\"font-size:16px;\"><b>" + nlapiEscapeXML(salesContactName) + "</b></td>";
							xml += "</tr>";
							
							xml += "<tr>";
							xml += "<td align=\"left\" style=\"font-size:16px;\">&nbsp;</td>";
							xml += "</tr>";
							
							xml += "<tr>";
							xml += "<td align=\"left\" style=\"font-size:16px;\">Empl. No:</td>";
							xml += "<td colspan=\"3\" align=\"left\" style=\"font-size:16px;\"><b>" + nlapiEscapeXML(salesContactEmpNo) + "</b></td>";
							xml += "<td align=\"left\" style=\"font-size:16px;\">&nbsp;</td>";
							xml += "<td align=\"left\" style=\"font-size:16px;\">Date:</td>";
							xml += "<td align=\"right\" style=\"font-size:16px;\">" + todayString + "</td>";
							xml += "</tr>";
							
							xml += "<tr>";
							xml += "<td align=\"left\" style=\"font-size:16px;\">&nbsp;</td>";
							xml += "</tr>";
							
							xml += "<tr>";
							xml += "<td align=\"left\" style=\"font-size:16px;\">Del Address:</td>";
							xml += "<td rowspan=\"5\" colspan=\"4\" align=\"left\" style=\"font-size:16px;\">" + salesShipAddress + "</td>";
							xml += "</tr>";
							xml += "</table>\n";
							
							xml += "<hr/>";
							
							xml += "<table style=\"width: 100%\">";
							xml += "<tr>";
							xml += "<td align=\"left\" style=\"font-size:16px;\">Notes</td>";
							//xml += "<td colspan=\"5\" align=\"left\" style=\"font-size:12px;\">" + notesText + "</td>";
							xml += "<td colspan=\"5\" align=\"left\" style=\"font-size:12px;\">" + notes + "</td>";
							xml += "</tr>";
							xml += "</table>";
							xml += "<hr/>";
							
							
							xml += "</macro>";
							xml += "</macrolist>";
							xml += "</head>";
							
							//Body
							//
							xml += "<body header=\"nlheader\" header-height=\"320px\" footer=\"nlfooter\" footer-height=\"20px\" padding=\"0.5in 0.5in 0.5in 0.5in\" size=\"A4\">";
					
							
							
							//Item data
							//
							xml += "<table class=\"itemtable\" style=\"width: 100%;\">";
							xml += "<thead >";
							xml += "<tr >";
							xml += "<th style=\"font-size:12px;\" colspan=\"6\">Item Code</th>";
							xml += "<th style=\"font-size:12px;\" align=\"left\" colspan=\"12\">Item Description</th>";
							xml += "<th style=\"font-size:12px;\" align=\"center\" colspan=\"2\">&nbsp;&nbsp;Qty<br/>Packed</th>";
							xml += "<th style=\"font-size:12px;\" align=\"center\" >Tick</th>";
							xml += "</tr>";
							xml += "</thead>";
						}
					
					//Do the detail lines output here
					//
					xml += "<tr>";
					xml += "<td style=\"font-size:12px;\" colspan=\"6\">" + nlapiEscapeXML(salesItem) + "</td>";
					xml += "<td style=\"font-size:12px; padding-right: 5px;\" align=\"left\" colspan=\"12\">" + nlapiEscapeXML(salesItemDesc)  +  "</td>";
					xml += "<td style=\"font-size:12px;\" align=\"center\" colspan=\"2\">" + salesQtyShip + "</td>";
					xml += "<td style=\"font-size:12px; border: 1px solid black;\" height=\"5px\" width=\"3px\" align=\"center\">&nbsp;<br/>&nbsp;</td>";
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
