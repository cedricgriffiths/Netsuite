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
							
			//Add a field group for filter info
			//
			var fieldGroupHeader = form.addFieldGroup('custpage_grp_filters', 'Filters');
			
			//Add a field group for filter info
			//
			var fieldGroupOutput = form.addFieldGroup('custpage_grp_output', 'Output Formatting');
			
			
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
			var percentAvailableFromField = form.addField('custpage_pcent_avail_select_from', 'percent', '% Available From', null, 'custpage_grp_filters');
			percentAvailableFromField.setLayoutType('normal', 'startcol');
			
			var percentAvailableToField = form.addField('custpage_pcent_avail_select_to', 'percent', '% Available To', null, 'custpage_grp_filters');
			
			//Add a select field to pick the wo percentage buildable from
			//
			var woPercentageBuildableField = form.addField('custpage_wo_buildable_select', 'select', 'Works Order % Buildable', 'customlist_bbs_wo_percent_can_build', 'custpage_grp_filters');
			
			//Add an option to chnage the output format
			//
			var outputTypeField = form.addField('custpage_output_type', 'checkbox', 'Output As CSV', null, 'custpage_grp_output');
			
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
			var percentAvailFrom = Number(request.getParameter('custpage_pcent_avail_select_from').replace('%',''));
			var percentAvailTo = Number(request.getParameter('custpage_pcent_avail_select_to').replace('%',''));
			var woBuildable = request.getParameter('custpage_wo_buildable_select');
			var outputTypeCSV = request.getParameter('custpage_output_type');
			
			// Build the output
			//	
			var file = buildOutput(soStartDate,soEndDate,shipStartDate,shipEndDate,percentAvailFrom,percentAvailTo,woBuildable,outputTypeCSV);
			
			//Send back the output in the response message
			//
			if(outputTypeCSV == "T")
				{
					var fileName = 'Sales Order Status Report.csv';
					
					response.setContentType('CSV', fileName, 'attachment');
					response.write(file);
				}
			else
				{
					response.setContentType('PDF', 'Sales Order Status', 'inline');
					response.write(file.getValue());
				}
		}
}


//=====================================================================
// Functions
//=====================================================================
//
function buildOutput(_soStartDate,_soEndDate,_shipStartDate,_shipEndDate,_percentAvailFrom,_percentAvailTo,_woBuildable,_outputTypeCSV)
{
	var salesOrderList = [];
	var salesOrderDetail = {};
	var itemsList = [];
	var itemsObject = {};
	var purchaseOrderItems = {};
	var worksOrderItems = {};
	
	
	//
	//Process SALES ORDER HEADERS
	//
	
	//Search of sales orders based on transaction date & shipping date
	//
	var filters = [
				   ["type","anyof","SalesOrd"], 
				   "AND", 
				   ["mainline","is","T"], 
				   "AND", 
				   ["status","anyof","SalesOrd:D","SalesOrd:B","SalesOrd:E"] //Partially Fulilled, Pending Fulfillment, Pending Billing/Partially Fulfilled
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

	var salesorderSearch = getResults(nlapiCreateSearch("salesorder",filters,
			[
			   new nlobjSearchColumn("trandate").setSort(false), 
			   new nlobjSearchColumn("tranid"), 
			   new nlobjSearchColumn("entity"), 
			   new nlobjSearchColumn("shipdate"),
			   new nlobjSearchColumn("entityid","customer",null)
			]
			));

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
					var searchOrderId = salesorderSearch[int].getId();
					var searchOrderNumber = salesorderSearch[int].getValue("tranid");
					var searchOrderDate = salesorderSearch[int].getValue("trandate");
					var searchOrderShipDate = salesorderSearch[int].getValue("shipdate");
					var searchOrderCustomer = salesorderSearch[int].getValue("entityid","customer");
					
					salesOrderDetail[orderAndLineKey] = new salesOrderInfo(searchOrderId, searchOrderNumber, searchOrderDate, searchOrderCustomer, searchOrderShipDate);
				}
		}
	
	
	//
	//Process SALES ORDER LINES
	//
	if(salesOrderList.length > 0)
		{
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
			
			var salesorderLineSearch = getResults(nlapiCreateSearch("salesorder",filters,
					[
					   new nlobjSearchColumn("tranid").setSort(false), 
					   new nlobjSearchColumn("linesequencenumber").setSort(false),
					   new nlobjSearchColumn("item"), 
					   new nlobjSearchColumn("type","item"), 
					   new nlobjSearchColumn("itemid","item",null), 
					   new nlobjSearchColumn("quantity"), 
					   new nlobjSearchColumn("quantitycommitted"), 
					   new nlobjSearchColumn("quantityshiprecv"), 
					   new nlobjSearchColumn("custcol_bbs_wo_id"), 
					   new nlobjSearchColumn("custbody_bbs_wo_percent_can_build","CUSTCOL_BBS_WO_ID",null), 
					   new nlobjSearchColumn("custbody_bbs_commitment_status","CUSTCOL_BBS_WO_ID",null),
					   new nlobjSearchColumn("tranid","CUSTCOL_BBS_WO_ID",null),
					   new nlobjSearchColumn("mainline","CUSTCOL_BBS_WO_ID",null)
					]
					));
		
			//Have we got any results
			//
			if(salesorderLineSearch)
				{
					//Loop through the results
					//
					for (var int = 0; int < salesorderLineSearch.length; int++) 
						{
							var salesOrderId = salesorderLineSearch[int].getId();
							var searchOrderNumber = salesorderLineSearch[int].getValue("tranid");
							var searchLineNumber = salesorderLineSearch[int].getValue("linesequencenumber");
							var searchLineItemType = salesorderLineSearch[int].getValue("type","item");
							var searchLineItemId = salesorderLineSearch[int].getValue("item");
							var searchLineItemText = salesorderLineSearch[int].getValue("itemid","item");
							var searchLineQuantity = Number(salesorderLineSearch[int].getValue("quantity"));
							var searchLineCommitted = Number(salesorderLineSearch[int].getValue("quantitycommitted"));
							var searchLineFulfilled = Number(salesorderLineSearch[int].getValue("quantityshiprecv"));
							var searchLineWoId = salesorderLineSearch[int].getValue("custcol_bbs_wo_id");
							var searchLineWoText = salesorderLineSearch[int].getValue("tranid","CUSTCOL_BBS_WO_ID");
							var searchLineWoCanBuild = salesorderLineSearch[int].getText("custbody_bbs_wo_percent_can_build","CUSTCOL_BBS_WO_ID");
							var searchLineWoCanBuildId = salesorderLineSearch[int].getValue("custbody_bbs_wo_percent_can_build","CUSTCOL_BBS_WO_ID");
							var searchLineWoCommitStatus = salesorderLineSearch[int].getText("custbody_bbs_commitment_status","CUSTCOL_BBS_WO_ID");
							var searchLineWoMainLine = salesorderLineSearch[int].getValue("mainline","CUSTCOL_BBS_WO_ID");
							var searchLineWoCanBuildQty = Number(salesorderLineSearch[int].getValue("custbody_bbs_wo_qty_can_build","CUSTCOL_BBS_WO_ID"));
							
							//Filter out the multiple lines from the works order link
							//
							if(searchLineWoMainLine == '*' || (searchLineWoId == '' || searchLineWoId == null) )
								{
									//Build up the sales order key which is order number + line number
									//
									var orderAndLineKey = padding_left(salesOrderId,'0', 6) + '|' + padding_left(searchLineNumber,'0', 6);
									var orderHeaderKey = padding_left(salesOrderId,'0', 6) + '|' + '000000';
									
									//Update the total number of items ordered on the header
									//
									salesOrderDetail[orderHeaderKey].orderItemsTotal += searchLineQuantity;
									
									//Update the total number of items that have been fulfilled on the header
									//
									salesOrderDetail[orderHeaderKey].orderItemsFulfilled += searchLineFulfilled;
										
									//Update the number of items fulfillable
									//
									if(searchLineItemType == 'InvtPart')
										{
											salesOrderDetail[orderHeaderKey].orderItemsFulfillable += searchLineCommitted;
										}
								
									if(searchLineItemType == 'Assembly')
										{
											salesOrderDetail[orderHeaderKey].orderItemsFulfillable += searchLineWoCanBuildQty;
										}
								
								
									//Check to see if we need to filter by WO percentage buildable
									//
									var saveLine = false;
									
									if(_woBuildable != null && _woBuildable != '')
										{
											if(_woBuildable == searchLineWoCanBuildId)
												{
													saveLine = true;
												}
										}
									else
										{
											saveLine = true;
										}
									
									if(saveLine)
										{
											//Increment the number of lines that are on this sales order
											//
											salesOrderDetail[orderHeaderKey].orderLineCount ++;
											
											//Save the line information to an object
											//
											var lineDetails = new salesOrderInfo(salesOrderId, searchOrderNumber, null, null, null);
											lineDetails.lineNumber = searchLineNumber;
											lineDetails.lineItemId = searchLineItemId;
											lineDetails.lineItemText = searchLineItemText;
											lineDetails.lineOrdered = searchLineQuantity;
											lineDetails.lineFulfilled = searchLineFulfilled;
											lineDetails.lineCommitted = searchLineCommitted
											lineDetails.lineWoNo = searchLineWoText;
											lineDetails.lineWoId = searchLineWoId;
											lineDetails.lineWoPercentBuildable = searchLineWoCanBuildId;
											lineDetails.lineWoPercentBuildableText = searchLineWoCanBuild
											lineDetails.lineWoCommitStatus = searchLineWoCommitStatus;
										
											//Add to the order details object
											//
											salesOrderDetail[orderAndLineKey] = lineDetails;
											
											//Save away the item to an object
											//
											itemsObject[searchLineItemId] = searchLineItemId;
										}
								}
						}
				}
			
			//Convert the items object to an array for use in a search
			//
			for ( var items in itemsObject) 
				{
					itemsList.push(items);
				}
		}	
	
	//
	//Process PURCHASE ORDER LINES
	//
	
	if(itemsList.length > 0)
		{
			//We need to find any PO's for the items that are on the sales orders
			//
			var purchaseorderSearch = getResults(nlapiCreateSearch("purchaseorder",
					[
					   ["type","anyof","PurchOrd"], 
					   "AND", 
					   ["mainline","is","F"], 
					   "AND", 
					   ["taxline","is","F"], 
					   "AND", 
					   ["shipping","is","F"], 
					   "AND", 
					   ["status","anyof","PurchOrd:D","PurchOrd:E","PurchOrd:B"], //Partially Received, Pending Billing/Partially Received, Pending Receipt
					   "AND", 
					   ["quantityshiprecv","equalto","0"], 
					   "AND", 
					   ["item","anyof",itemsList], 
					   "AND", 
					   ["duedate","isnotempty",""]
					], 
					[
					   new nlobjSearchColumn("item").setSort(false), 
					   new nlobjSearchColumn("duedate").setSort(true), 
					   new nlobjSearchColumn("tranid")
					]
					));
			
			//Process the found purchase orders
			//
			if(purchaseorderSearch)
				{
					lastItemId = '';
					
					for (var int = 0; int < purchaseorderSearch.length; int++) 
						{
							var poItemId = purchaseorderSearch[int].getValue('item');
							var poDueDate = purchaseorderSearch[int].getValue('duedate');
							var poNumber = purchaseorderSearch[int].getValue('tranid');
							var poId = purchaseorderSearch[int].getId();
							
							if(lastItemId != poItemId)
								{
									lastItemId = poItemId;
									purchaseOrderItems[poItemId] = new purchaseOrderInfo(poNumber, poDueDate, poId);
								}
						}
				}
			
			//Loop through the sales orders looking at the lines & then see if there is a po for the item
			//if there is one, then update the sales order line with the po details
			//
			for ( var salesOrderKey in salesOrderDetail) 
				{
					//Look for keys that represent lines, not headers (headers have a line number = '000000')
					//
					if(salesOrderKey.split('|')[1] != '000000')
						{
							var salesOrderItemId = salesOrderDetail[salesOrderKey].lineItemId;
							
							var matchingPoDetail = purchaseOrderItems[salesOrderItemId];
							
							//See if we have found the po detail for the item
							//
							if(matchingPoDetail != null)
								{
									salesOrderDetail[salesOrderKey].linePoNo = matchingPoDetail.orderNumber;
									salesOrderDetail[salesOrderKey].linePoDueDate = matchingPoDetail.orderDueDate;
									salesOrderDetail[salesOrderKey].linePoId = matchingPoDetail.orderId;
								}
						}
				}
	
		}
	
	
	//Calculate the percentage available
	//
	for ( var soKey in salesOrderDetail) 
		{
			if(soKey.split('|')[1] == '000000')
				{
					try
						{
							salesOrderDetail[soKey].orderPercentAvailable = Math.round((salesOrderDetail[soKey].orderItemsFulfillable / (salesOrderDetail[soKey].orderItemsTotal - salesOrderDetail[soKey].orderItemsFulfilled) * 100));
						}
					catch(err)
						{
							salesOrderDetail[soKey].orderPercentAvailable = Number(0);
						}
				}
		}
	
	//Filter on percentage available & remove header line
	//
	for ( var soKey in salesOrderDetail) 
		{
			if(soKey.split('|')[1] == '000000' && ((_percentAvailFrom != 0 && salesOrderDetail[soKey].orderPercentAvailable < _percentAvailFrom) || (_percentAvailTo != 0 && salesOrderDetail[soKey].orderPercentAvailable > _percentAvailTo)))
				{
					delete salesOrderDetail[soKey];
				}
		}
	
	
	//Remove any headers that have no lines to show
	//
	for ( var soKey in salesOrderDetail) 
		{
			if(soKey.split('|')[1] == '000000' && salesOrderDetail[soKey].orderLineCount == 0)
				{
					delete salesOrderDetail[soKey];
				}
		}
	
	
	//Remove any lines that do not have a header
	//
	
	for ( var soKey in salesOrderDetail) 
		{
			if(soKey.split('|')[1] != '000000')
				{
					var headerKey = soKey.split('|')[0] + '|000000';
					
					if(!salesOrderDetail[headerKey])
						{
							delete salesOrderDetail[soKey];
						}
				}
		}
	
	//
	//Process the output document
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
	
	//Start the csv off
	//
	var csv = '';
	
	//Header & style sheet
	//
	xml += "<pdf>"
	xml += "<head>";
	xml += "<style type=\"text/css\">table {font-family: Calibri, Candara, Segoe, \"Segoe UI\", Optima, Arial, sans-serif;font-size: 9pt;table-layout: fixed;}";
	xml += "th {font-weight: bold;font-size: 8pt;padding: 0px;border-bottom: 1px solid black;border-collapse: collapse;}";
	xml += "td {padding: 0px;vertical-align: top; font-size:8px;}";
	xml += "b {font-weight: bold;color: #333333;}";
	xml += "table.header td {padding: 0px; font-size: 10pt;}";
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
	xml += "td.ordhead {padding-bottom: 10px;vertical-align: top;font-size:10px; }";
	xml += "td.orddet {padding-bottom: 0px;vertical-align: top;font-size:8px; border: 1px solid #d9d9d9; border-collapse: collapse; }";
	xml += "th.orddet {font-size:8px;}";
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
	xml += "<table class=\"header\" style=\"width: 100%;\">";
	xml += "<tr>";
	xml += "<td align=\"center\">Sales Order Status";
	xml += "</td>";
	xml += "</tr>";
	xml += "</table>";
	xml += "</macro>";
	xml += "</macrolist>";
	xml += "</head>";
							
	//Body
	//
	xml += "<body header=\"nlheader\" header-height=\"30px\" footer=\"nlfooter\" footer-height=\"10px\" padding=\"0.25cm 0.25cm 0.25cm 0.25cm\" size=\"A4-LANDSCAPE\">";

	if(Object.keys(orderedSalesOrderDetail).length > 0)
		{
			var firstHeader = true;
			var firstDetail = true;
			
			for ( var salesOrderKey in orderedSalesOrderDetail) 
				{
					//Order header
					//
					if(salesOrderKey.split('|')[1] == '000000')
						{
							if(firstHeader)
								{
									firstHeader = false;
								}
							else
								{	
									//End the detail table
									//
									if(!firstDetail)
										{
											xml += "</table>";
											
										}
									
									xml += "</div>";
								}
							
							firstDetail = true;
							
							xml += "<div style=\"page-break-inside: avoid; margin-top: 20px;\">";
							
							xml += "<table class=\"ordhead\" style=\"width: 100%;\">";
							xml += "<thead>";
							xml += "<tr style=\"background-color: #e3e3e3;\">";
							xml += "<th colspan=\"2\" align=\"left\">Sales<br/>Order</th>";
							xml += "<th colspan=\"2\" align=\"left\">Order<br/>Id</th>";
							xml += "<th colspan=\"4\" align=\"left\">Order<br/>Date</th>";
							xml += "<th colspan=\"4\" align=\"left\"><br/>Customer</th>";
							xml += "<th colspan=\"2\" align=\"left\">Ship<br/>Date</th>";
							xml += "<th colspan=\"2\" align=\"right\"># Items<br/>Ordered</th>";
							xml += "<th colspan=\"2\" align=\"right\"># Items<br/>Fulfillable</th>";
							xml += "<th colspan=\"2\" align=\"right\"><br/>% Available</th>";
							xml += "</tr>";
							xml += "</thead>";
							xml += "<tr>";
							xml += "<td class=\"ordhead\" colspan=\"2\" align=\"left\"><a href=\"/app/accounting/transactions/salesord.nl?id=" + orderedSalesOrderDetail[salesOrderKey].orderId + "\" target=\"_blank\">"   + nlapiEscapeXML(orderedSalesOrderDetail[salesOrderKey].orderNumber) + "</a></td>";
							xml += "<td class=\"ordhead\" colspan=\"2\" align=\"left\">" + orderedSalesOrderDetail[salesOrderKey].orderId + "</td>";
							xml += "<td class=\"ordhead\" colspan=\"4\" align=\"left\">" + orderedSalesOrderDetail[salesOrderKey].orderDate + "</td>";
							xml += "<td class=\"ordhead\" colspan=\"4\" align=\"left\">" + nlapiEscapeXML(orderedSalesOrderDetail[salesOrderKey].orderCustomer) + "</td>";
							xml += "<td class=\"ordhead\" colspan=\"2\" align=\"left\">" + orderedSalesOrderDetail[salesOrderKey].orderShipDate + "</td>";
							xml += "<td class=\"ordhead\" colspan=\"2\" align=\"right\">" + orderedSalesOrderDetail[salesOrderKey].orderItemsTotal.toFixed(2) + "</td>";
							xml += "<td class=\"ordhead\" colspan=\"2\" align=\"right\">" + orderedSalesOrderDetail[salesOrderKey].orderItemsFulfillable.toFixed(2) + "</td>";
							xml += "<td class=\"ordhead\" colspan=\"2\" align=\"right\">" + orderedSalesOrderDetail[salesOrderKey].orderPercentAvailable.toFixed(2) + "</td>";
							xml += "</tr>";
							
							xml += "</table>";
						
							csv += "\r\n";
							csv += '"Sales Order","Order Id","Order Date","Customer","Ship Date","# Items Ordered","# Items Fulfillable","% Available"\r\n';
							csv += '"' + orderedSalesOrderDetail[salesOrderKey].orderNumber + '",';
							csv += '"' + orderedSalesOrderDetail[salesOrderKey].orderId + '",';
							csv += '"' + orderedSalesOrderDetail[salesOrderKey].orderDate + '",';
							csv += '"' + orderedSalesOrderDetail[salesOrderKey].orderCustomer + '",';
							csv += '"' + orderedSalesOrderDetail[salesOrderKey].orderShipDate + '",';
							csv += '"' + orderedSalesOrderDetail[salesOrderKey].orderItemsTotal.toFixed(2) + '",';
							csv += '"' + orderedSalesOrderDetail[salesOrderKey].orderItemsFulfillable.toFixed(2) + '",';
							csv += '"' + orderedSalesOrderDetail[salesOrderKey].orderPercentAvailable.toFixed(2) + '"\r\n';
							
						}
					else
						{
							//Order detail
							//
							if(firstDetail)
								{
									firstDetail = false;
									
									xml += "<table class=\"orddet\" style=\"margin-left: 70px; width: 100%; \">";
									xml += "<thead>";
									xml += "<tr>";
									xml += "<th class=\"orddet\" colspan=\"1\" align=\"left\">Order<br/>Number</th>";
									xml += "<th class=\"orddet\" colspan=\"1\" align=\"left\">Line<br/>Number</th>";
									xml += "<th class=\"orddet\" colspan=\"3\" align=\"left\"><br/>Item</th>";
									xml += "<th class=\"orddet\" colspan=\"1\" align=\"right\"><br/>Ordered</th>";
									xml += "<th class=\"orddet\" colspan=\"1\" align=\"right\"><br/>Fulfilled</th>";
									xml += "<th class=\"orddet\" colspan=\"1\" align=\"right\"><br/>Committed</th>";
									xml += "<th class=\"orddet\" colspan=\"1\" align=\"right\">Works<br/>Order</th>";
									xml += "<th class=\"orddet\" colspan=\"1\" align=\"right\">Works Order<br/>% Buildable</th>";
									xml += "<th class=\"orddet\" colspan=\"1\" align=\"right\">Purchase<br/>Order</th>";
									xml += "<th class=\"orddet\" colspan=\"1\" align=\"right\">PO Due<br/>Date</th>";
									xml += "</tr>";
									xml += "</thead>";
									
									csv += "\r\n";
									csv += '"","Sales Order","Line Number","Item","Ordered","Fulfilled","Committed","Works Order","Works Order % Buildable","Purchase Order","PO Due Date"\r\n';
									
								}
		
							xml += "<tr>";
							xml += "<td class=\"orddet\" colspan=\"1\" align=\"left\">" + nlapiEscapeXML(orderedSalesOrderDetail[salesOrderKey].orderNumber) + "</td>";
							xml += "<td class=\"orddet\" colspan=\"1\" align=\"left\">" + orderedSalesOrderDetail[salesOrderKey].lineNumber + "</td>";
							xml += "<td class=\"orddet\" colspan=\"3\" align=\"left\">" + nlapiEscapeXML(removePrefix(orderedSalesOrderDetail[salesOrderKey].lineItemText)) + "</td>";
							xml += "<td class=\"orddet\" colspan=\"1\" align=\"right\">" + orderedSalesOrderDetail[salesOrderKey].lineOrdered.toFixed(2) + "</td>";
							xml += "<td class=\"orddet\" colspan=\"1\" align=\"right\">" + orderedSalesOrderDetail[salesOrderKey].lineFulfilled.toFixed(2) + "</td>";
							xml += "<td class=\"orddet\" colspan=\"1\" align=\"right\">" + orderedSalesOrderDetail[salesOrderKey].lineCommitted.toFixed(2) + "</td>";
							xml += "<td class=\"orddet\" colspan=\"1\" align=\"right\"><a href=\"/app/accounting/transactions/workord.nl?id=" + orderedSalesOrderDetail[salesOrderKey].lineWoId + "\" target=\"_blank\">"  + nlapiEscapeXML(orderedSalesOrderDetail[salesOrderKey].lineWoNo) + "</a></td>";
							xml += "<td class=\"orddet\" colspan=\"1\" align=\"right\">" + orderedSalesOrderDetail[salesOrderKey].lineWoPercentBuildableText + "</td>";
							xml += "<td class=\"orddet\" colspan=\"1\" align=\"right\"><a href=\"/app/accounting/transactions/purchord.nl?id=" + orderedSalesOrderDetail[salesOrderKey].linePoId + "\" target=\"_blank\">" + nlapiEscapeXML(orderedSalesOrderDetail[salesOrderKey].linePoNo) + "</a></td>";
							xml += "<td class=\"orddet\" colspan=\"1\" align=\"right\">" + orderedSalesOrderDetail[salesOrderKey].linePoDueDate + "</td>";
							xml += "</tr>";
							
							csv += '"","' + orderedSalesOrderDetail[salesOrderKey].orderNumber + '",';
							csv += '"' + orderedSalesOrderDetail[salesOrderKey].lineNumber + '",';
							csv += '"' + orderedSalesOrderDetail[salesOrderKey].lineItemText + '",';
							csv += '"' + orderedSalesOrderDetail[salesOrderKey].lineOrdered.toFixed(2) + '",';
							csv += '"' + orderedSalesOrderDetail[salesOrderKey].lineFulfilled.toFixed(2) + '",';
							csv += '"' + orderedSalesOrderDetail[salesOrderKey].lineCommitted.toFixed(2) + '",';
							csv += '"' + orderedSalesOrderDetail[salesOrderKey].lineWoNo + '",';
							csv += '"' + orderedSalesOrderDetail[salesOrderKey].lineWoPercentBuildableText + '",';
							csv += '"' + orderedSalesOrderDetail[salesOrderKey].linePoNo + '",';
							csv += '"' + orderedSalesOrderDetail[salesOrderKey].linePoDueDate + '"\r\n';
							
							
						}
				}
			
			
			
			
			//End the detail table
			//
			if(!firstDetail)
				{
					xml += "</table>";
					
				}
			
			//Finish the body
			//
			xml += "</div>";
			xml += "</body>";
					
			//Finish the pdf
			//
			xml += "</pdf>";
		}
	else
		{
			xml += "<p>No Data To Display</p>";
			xml += "</body>";
		
			//Finish the pdf
			//
			xml += "</pdf>";
		}
	
	if(_outputTypeCSV == 'T')
		{
			return csv;
		}
	else
		{
			//Convert to pdf using the BFO library
			//
			var pdfFileObject = nlapiXMLToPDF(xml);
			
			return pdfFileObject;
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

function getResults(_search)
{
	var searchResult = _search.runSearch();
	
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

function removePrefix(fullString)
{
	var returnString = fullString;
	
	var colon = fullString.indexOf(' : ');
	
	if(colon > -1)
		{
			returnString = fullString.substr(colon + 2);
		}
	
	return returnString;
}

//=====================================================================
//Objects
//=====================================================================
//
function salesOrderInfo(_orderId, _orderNumber, _orderDate, _orderCustomer, _orderShipDate)
{
	this.orderId = _orderId;
	this.orderNumber = _orderNumber;
	this.orderDate = _orderDate;
	this.orderCustomer = _orderCustomer;
	this.orderShipDate = _orderShipDate;
	this.orderItemsTotal = Number(0);
	this.orderItemsFulfilled = Number(0);
	this.orderItemsFulfillable = Number(0);
	this.orderPercentAvailable = Number(0);
	this.orderLineCount = Number(0);
	
	this.lineNumber = '';
	this.lineItemId = '';
	this.lineItemText = '';
	this.lineOrdered = Number(0);
	this.lineFulfilled = Number(0);
	this.lineCommitted = Number(0);
	this.lineWoNo = '';
	this.lineWoId = '';
	this.lineWoPercentBuildable = '';
	this.lineWoPercentBuildableText = '';
	this.lineWoCommitStatus = '';
	this.linePoNo = '';
	this.linePoDueDate = '';
	this.linePoId = '';
}

function purchaseOrderInfo(_orderNumber, _orderDueDate, _poId)
{
	this.orderNumber = _orderNumber;
	this.orderDueDate = _orderDueDate;	
	this.orderId = _poId;
}

function worksOrderInfo(_orderNumber, _orderDueDate, _poId, _woBuildable, _woBuildableText)
{
	this.orderNumber = _orderNumber;
	this.orderDueDate = _orderDueDate;	
	this.orderId = _poId;
	this.woBuildable = _woBuildable;
	this.woBuildableText = _woBuildableText;
}









