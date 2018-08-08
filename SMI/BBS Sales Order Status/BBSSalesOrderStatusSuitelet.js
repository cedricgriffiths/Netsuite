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
function salesOrderStatusSuitelet(request, response)
{
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
			var form = nlapiCreateForm('Sales Order Status', false);
			form.setTitle('Sales Order Status');
					
			
			//=====================================================================
			// Field groups creation
			//=====================================================================
			//
							
			//Add a field group for header info
			//
			var fieldGroupHeader = form.addFieldGroup('custpage_grp_filters', 'Filters');
						
			
			//=====================================================================
			// Fields creation
			//=====================================================================
			//
			
			var soStartDateField = form.addField('custpage_so_start_date', 'date', 'Sales Order Date From', null,'custpage_grp_filters');
			var soEndDateField = form.addField('custpage_so_end_date', 'date', 'Sales Order Date To', null,'custpage_grp_filters');
			
			var shipStartDateField = form.addField('custpage_ship_start_date', 'date', 'Ship Date From', null,'custpage_grp_filters');
			var shipEndDateField = form.addField('custpage_ship_end_date', 'date', 'Ship Date To', null,'custpage_grp_filters');
			shipStartDateField.setLayoutType('normal', 'startcol');
			
			var today = new Date();
			var todayString = nlapiDateToString(today);
			
			soStartDateField.setDefaultValue(todayString);
			//soEndDateField.setDefaultValue(todayString);
			shipStartDateField.setDefaultValue(todayString);
			//shipEndDateField.setDefaultValue(todayString);
			
			//Add a select field to pick the wo percentage buildable from
			//
			var percentAvailableField = form.addField('custpage_pcent_avail_select', 'integer', '% Available', null, 'custpage_grp_filters');
			percentAvailableField.setLayoutType('normal', 'startcol');
			
			//Add a select field to pick the wo percentage buildable from
			//
			var woPercentageBuildableField = form.addField('custpage_wo_buildable_select', 'select', 'Works Order % Buildable', 'customlist_bbs_wo_percent_can_build', 'custpage_grp_filters');
			
			//Add a submit button
			//
			form.addSubmitButton('Generate Sales Order Status');
					
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
			var soStartDate = request.getParameter('custpage_so_start_date');
			var soEndDate = request.getParameter('custpage_so_end_date');
			var shipStartDate = request.getParameter('custpage_ship_start_date');
			var shipEndDate = request.getParameter('custpage_ship_end_date');
			var percentAvail = request.getParameter('custpage_pcent_avail_select');
			var woBuildable = request.getParameter('custpage_wo_buildable_select');
			
			// Build the output
			//	
			var file = buildOutput(soStartDate,soEndDate,shipStartDate,shipEndDate,percentAvail,woBuildable);
			
			//Send back the output in the response message
			//
			response.setContentType('PDF', 'Sales Order Status', 'inline');
			response.write(file.getValue());
			
		}
}


//=====================================================================
// Functions
//=====================================================================
//
function buildOutput(_soStartDate,_soEndDate,_shipStartDate,_shipEndDate,_percentAvail,_woBuildable)
{
	var salesOrderList = [];
	var salesOrderDetail = {};
	var itemsList = [];
	var itemsObject = {};
	
	//Search of sales orders based on transaction date & shipping date
	//
	var filters = [
				   ["type","anyof","SalesOrd"], 
				   "AND", 
				   ["mainline","is","T"]
				];
	
	if(_soStartDate != '')
		{
			filters.push("AND", ["trandate","onorafter",_soStartDate])
		}
	
	if(_soEndDate != '')
		{
			filters.push("AND", ["trandate","onorbefore",_soEndDate])
		}

	if(_shipStartDate != '')
		{
			filters.push("AND", ["shipdate","onorafter",_shipStartDate])
		}

	if(_shipEndDate != '')
		{
			filters.push("AND", ["shipdate","onorbefore",_shipEndDate])
		}

	var salesorderSearch = nlapiSearchRecord("salesorder",null,filters,
			[
			   new nlobjSearchColumn("trandate"), 
			   new nlobjSearchColumn("tranid").setSort(false), 
			   new nlobjSearchColumn("entity"), 
			   new nlobjSearchColumn("shipdate"),
			   new nlobjSearchColumn("entityid","customer",null)
			]
			);

	//Have we got any results
	//
	if(salesorderSearch)
		{
			//Loop through the results
			//
			for (var int = 0; int < salesorderSearch.length; int++) 
				{
					//Save the id of the sales order into an array for later use.
					var salesOrderId = salesorderSearch[int].getId();
					salesOrderList.push(salesOrderId);
					
					//Build up the sales order key which is order number + line number (0 for header line)
					//
					var orderAndLineKey = padding_left(salesOrderId,'0', 6) + '|' + '000000';
					
					//Save the header details away in an object
					//
					var searchOrderNumber = salesorderSearch[int].getValue("tranid");
					var searchOrderDate = salesorderSearch[int].getValue("trandate");
					var searchOrderShipDate = salesorderSearch[int].getValue("shipdate");
					var searchOrderCustomer = salesorderSearch[int].getValue("entityid","customer");
					
					salesOrderDetail[orderAndLineKey] = new salesOrderInfo(searchOrderNumber, searchOrderDate, searchOrderCustomer, searchOrderShipDate);
				}
		}
	
	//Search the sales order lines
	//
	var filters = [
				   ["type","anyof","SalesOrd"], 
				   "AND", 
				   ["mainline","is","F"], 
				   "AND", 
				   ["taxline","is","F"], 
				   "AND", 
				   ["shipping","is","F"],
				   "AND",
				   ["internalid","anyof",salesOrderList]
				];
	
	var salesorderLineSearch = nlapiSearchRecord("salesorder",null,filters,
			[
			   new nlobjSearchColumn("tranid").setSort(false), 
			   new nlobjSearchColumn("linesequencenumber").setSort(false),
			   new nlobjSearchColumn("item"), 
			   new nlobjSearchColumn("itemid","item",null), 
			   new nlobjSearchColumn("quantity"), 
			   new nlobjSearchColumn("quantitycommitted"), 
			   new nlobjSearchColumn("quantityshiprecv"), 
			   new nlobjSearchColumn("custcol_bbs_wo_id"), 
			   new nlobjSearchColumn("custbody_bbs_wo_percent_can_build","CUSTCOL_BBS_WO_ID",null), 
			   new nlobjSearchColumn("custbody_bbs_commitment_status","CUSTCOL_BBS_WO_ID",null)
			]
			);

	//Have we got any results
	//
	if(salesorderLineSearch)
		{
			//Loop through the results
			//
			for (var int = 0; int < salesorderLineSearch.length; int++) 
				{
					var salesOrderId = salesorderLineSearch[int].getId();
					var searchLineNumber = salesorderLineSearch[int].getValue("linesequencenumber");
					var searchLineItemId = salesorderLineSearch[int].getValue("item");
					var searchLineItemText = salesorderLineSearch[int].getValue("itemid","item");
					var searchLineQuantity = Number(salesorderLineSearch[int].getValue("quantity"));
					var searchLineCommitted = Number(salesorderLineSearch[int].getValue("quantitycommitted"));
					var searchLineShipped = Number(salesorderLineSearch[int].getValue("quantityshiprecv"));
					var searchLineWoId = salesorderLineSearch[int].getValue("custcol_bbs_wo_id");
					var searchLineWoText = salesorderLineSearch[int].getText("custcol_bbs_wo_id");
					var searchLineWoCanBuild = salesorderLineSearch[int].getText("custbody_bbs_wo_percent_can_build","CUSTCOL_BBS_WO_ID");
					var searchLineWoCommitStatus = salesorderLineSearch[int].getText("custbody_bbs_commitment_status","CUSTCOL_BBS_WO_ID");

					//Build up the sales order key which is order number + line number
					//
					var orderAndLineKey = padding_left(salesOrderId,'0', 6) + '|' + padding_left(searchLineNumber,'0', 6);
					
					//Save the line information to an object
					//
					var lineDetails = new salesOrderInfo();
					lineDetails.lineNumber = searchLineNumber;
					lineDetails.lineItemId = searchLineItemId;
					lineDetails.lineItemText = searchLineItemText;
					lineDetails.lineOrdered = searchLineQuantity;
					lineDetails.lineFulfilled = searchLineShipped;
					lineDetails.lineWoNo = searchLineWoText;
					lineDetails.lineWoPercentBuildable = searchLineWoCanBuild;
					lineDetails.lineWoCommitStatus = searchLineWoCommitStatus;
					
					//Add to the order details object
					//
					salesOrderDetail[orderAndLineKey] = lineDetails;
					
					//Save away the item to an object
					//
					itemsObject[searchLineItemId] = searchLineItemId;
					
				}
		}
	
	//Convert the items object to an array for use in a search
	//
	for ( var items in itemsObject) 
		{
			itemsList.push(items);
		}
	
	//We need to find any PO's for the items that are on the sales orders
	//
	
	
	
	
	//Sort the sales order object so that we are in sales order number / line number order
	//
	const orderedSalesOrderDetail = {};
	Object.keys(salesOrderDetail).sort().forEach(function(key) {
		orderedSalesOrderDetail[key] = salesOrderDetail[key];
	});
	
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
	xml += "<macro id=\"nlfooter\">";
	xml += "<table class=\"footer\" style=\"width: 100%;\">";
	xml += "<tr>";
	xml += "<td align=\"right\">Page <pagenumber/> of <totalpages/>";
	xml += "</td>";
	xml += "</tr>";
	xml += "</table>";
	xml += "</macro>";
					
	xml += "<macro id=\"nlheader\">";
	xml += "</macro>";
	xml += "</macrolist>";
	xml += "</head>";
							
	//Body
	//
	xml += "<body header=\"nlheader\" header-height=\"350px\" footer=\"nlfooter\" footer-height=\"20px\" padding=\"0.5in 0.5in 0.5in 0.5in\" size=\"A4\">";

	xml += "<p>No Data To Print</p>";
	
			
	//Finish the body
	//
	xml += "</body>";
			
	//Finish the pdf
	//
	xml += "</pdf>";
	
/*
			xml += "<pdf>"
			xml += "<head>";
			xml += "</head>";
			xml += "<body padding=\"0.5in 0.5in 0.5in 0.5in\" size=\"A4\">";
			xml += "<p>No Data To Print</p>";
			xml += "</body>";
			xml += "</pdf>";
*/
	
	//Convert to pdf using the BFO library
	//
	var pdfFileObject = nlapiXMLToPDF(xml);
	
	return pdfFileObject;
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

function salesOrderInfo(_orderNumber, _orderDate, _orderCustomer, _orderShipDate)
{
	this.orderNumber = _orderNumber;
	this.orderDate = _orderDate;
	this.orderCustomer = _orderCustomer;
	this.orderShipDate = _orderShipDate;
	this.orderItemsTotal = Number(0);
	this.orderItemsNotFulfillable = Number(0);
	this.orderPercentAvailable = Number(0);
	
	this.lineNumber = '';
	this.lineItemId = '';
	this.lineItemText = '';
	this.lineOrdered = Number(0);
	this.lineFulfilled = Number(0);
	this.lineWoNo = '';
	this.lineWoPercentBuildable = '';
	this.lineWoCommitStatus = '';
	this.linePoNo = '';
	this.linePoDueDate = '';
	
}









