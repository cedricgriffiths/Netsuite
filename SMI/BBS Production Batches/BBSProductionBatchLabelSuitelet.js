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
function printLabelSuitelet(request, response)
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
	// Parameters passed to the suitelet
	//=====================================================================
	//
	var batchParam = request.getParameter('batchid');
			
	if (batchParam != null && batchParam != '') 
		{
			// Build the output
			//	
			var file = buildOutput(batchParam);
	
			// Send back the output in the response message
			//
			response.setContentType('PDF', 'Production Batch Labels', 'inline');
			response.write(file.getValue());
		}
}

//=====================================================================
// Functions
//=====================================================================
//
function buildOutput(batchId)
{
	//Need to generate the production batch documentation
	//
	var today = new Date();
	var now = today.toUTCString();
	
	var remaining = nlapiGetContext().getRemainingUsage();
	
	//Get the batches data
	//
	var filters = new Array();
	filters[0] = new nlobjSearchFilter('internalid', null, 'anyof', batchId);
	
	var columns = new Array();
	columns[0] = new nlobjSearchColumn('custrecord_bbs_bat_description');
	columns[1] = new nlobjSearchColumn('custrecord_bbs_bat_date_entered');
	columns[2] = new nlobjSearchColumn('custrecord_bbs_bat_date_due');
    columns[3] = new nlobjSearchColumn('name');
	
	var batchResults = nlapiSearchRecord('customrecord_bbs_assembly_batch', null, filters, columns);  // 10GU's
	
	
	//
	//=====================================================================
	// Start the xml off with the basic header info & the start of a pdfset
	//=====================================================================
	//
	var xml = "<?xml version=\"1.0\"?>\n<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n";
	
	//
	//=====================================================================
	// Produce the batch picking list
	//=====================================================================
	//
	var baseItems = {};
	var finishedItems = {};
	
	//Loop through the batch data
	//
	for (var int2 = 0; int2 < batchResults.length; int2++) 
	{
		//
		//Produce the batch pick documents
		//
		var batchId = batchResults[int2].getId();
		var batchDescription = batchResults[int2].getValue('custrecord_bbs_bat_description');
         var batchname = batchResults[int2].getValue('name');

		//Find the works orders associated with this batch
		//
		var filterArray = [
		                   ["type","anyof","WorkOrd"], 
		                   "AND", 
		                   ["custbody_bbs_wo_batch","anyof",batchId]
		                   
		                ];
		
		var transactionSearch = nlapiCreateSearch("transaction", filterArray, 
				[
				   new nlobjSearchColumn("tranid",null,null).setSort(false), 
				   new nlobjSearchColumn("entity",null,null), 
				   new nlobjSearchColumn("item",null,null), 
				   new nlobjSearchColumn("quantity",null,null),
				   new nlobjSearchColumn("custitem_bbs_item_customer","item",null),
				   new nlobjSearchColumn("item",null,null),
				   new nlobjSearchColumn("type","item",null),
				   new nlobjSearchColumn("description","item",null),
				   new nlobjSearchColumn("mainline",null,null),
				   new nlobjSearchColumn("custcol_bbs_bom_spec_inst",null,null),
				   new nlobjSearchColumn("quantitycommitted",null,null),
				   new nlobjSearchColumn("custbody_bbs_commitment_status",null,null),
				   new nlobjSearchColumn("custitem_bbs_matrix_item_seq","item",null),
				   new nlobjSearchColumn("custitemfinish_type","item",null),
				   new nlobjSearchColumn("custitem_bbs_item_process_type","item",null),
				   new nlobjSearchColumn("tranid","createdfrom",null),
				   new nlobjSearchColumn("shipdate","createdfrom",null),
				   new nlobjSearchColumn("custbody_bbs_wo_logo_type",null,null),
				   new nlobjSearchColumn("custbody_bbs_wo_machine",null,null)
				]
				);

		var searchResult = transactionSearch.runSearch();
		
		//Get the initial set of results
		//
		var start = 0;
		var end = 1000;
		var searchResultSet = searchResult.getResults(start, end); // 10GU's
		var resultlen = searchResultSet.length;

		//If there is more than 1000 results, page through them
		//
		while (resultlen == 1000) 
			{
					start += 1000;
					end += 1000;

					var moreSearchResultSet = searchResult.getResults(start, end);  // 10GU's
					resultlen = moreSearchResultSet.length;

					searchResultSet = searchResultSet.concat(moreSearchResultSet);
			}
		
		
		//Work out the customer sub group
		//
		var subGroup = '';
		var thisEntity = '';
		var thisSalesOrder = '';
		var thisShipDate = '';
		var thisShipDay = '';
		var thisShipDateFormatted = '';
		var thisLogoType = '';
		var thisMachine = '';
		
		if(searchResultSet != null && searchResultSet.length > 0)
			{
				thisEntity = searchResultSet[0].getValue("entity");
				thisSalesOrder = searchResultSet[0].getValue("tranid","createdfrom");
				thisShipDate = searchResultSet[0].getValue("shipdate","createdfrom");
				thisMachine = searchResultSet[0].getValue("custbody_bbs_wo_machine");
						
				switch(searchResultSet[0].getValue("custbody_bbs_wo_logo_type"))
					{
						case '1': //Embroidery
							thisLogoType = 'EMB';
							break;
									
						case '2': //Heatseal
							thisLogoType = 'HS';
							break;
									
						case '11': //Emb + hs
							thisLogoType = 'EMB+HS';
							break;
					}
						
				if(thisShipDate != null && thisShipDate != '')
					{
						thisShipDay = (nlapiStringToDate(thisShipDate)).format('D');
						thisShipDateFormatted = (nlapiStringToDate(thisShipDate)).format('d F Y');
					}
			}
		
		for ( var baseItem in baseItems) 
			{
				delete baseItems[baseItem];
			}
	
		for ( var finishedItem in finishedItems) 
			{
				delete finishedItems[finishedItem];
			}
	
		var remaining = nlapiGetContext().getRemainingUsage();
		
		//Init some variables
		//
		var firstTime = true;
		
		//Loop through the works orders on the batch
		//
		if(searchResultSet != null)
			{
				var thisFinishedItem = '';
				var woSpecInst = '';
				var firstInventoryItem = true;
				
				for (var int3 = 0; int3 < searchResultSet.length; int3++) 
					{
						var woId 						= searchResultSet[int3].getId();
						var woAssemblyItemId 			= searchResultSet[int3].getValue('item');
						var woAssemblyItem 				= searchResultSet[int3].getText('item');
						var woAssemblyItemDesc 			= searchResultSet[int3].getValue('description','item');
						var woAssemblyItemQty 			= (Number(searchResultSet[int3].getValue('quantity')).toFixed(0));
						var woAssemblyItemCommitted 	= (Number(searchResultSet[int3].getValue('quantitycommitted')).toFixed(0));
						var woMainline 					= searchResultSet[int3].getValue('mainline');
						var woSpecInst 					= searchResultSet[int3].getValue("custcol_bbs_bom_spec_inst");
						var woItemType 					= searchResultSet[int3].getValue("type","item");
						var woCommitStatus 				= searchResultSet[int3].getText("custbody_bbs_commitment_status");
						var woAssemblyItemSequence 		= searchResultSet[int3].getValue("custitem_bbs_matrix_item_seq","item");
						var woAssemblyProcessType 		= searchResultSet[int3].getText("custitem_bbs_item_process_type","item");
						
						
						if(woAssemblyItemSequence == null || woAssemblyItemSequence == '')
							{
								woAssemblyItemSequence = padding_left(woAssemblyItemId, '0', 6);
							}
						
						if(woMainline == '*')
							{	
								thisFinishedItem = woAssemblyItemSequence;
	
								firstInventoryItem = true;
								
								//Collate all of the finished items together
								//
								if(!finishedItems[thisFinishedItem])
									{
										var componetsObject = {};
										finishedItems[thisFinishedItem] = [woAssemblyItem,Number(woAssemblyItemQty),woAssemblyItemDesc,componetsObject]; //Item Description, Quantity, Description, Components Object
									}
								else
									{
										finishedItems[thisFinishedItem][1] = Number(finishedItems[thisFinishedItem][1]) + Number(woAssemblyItemQty);
									}
							}
						else
							{
								//Collate all of the base items together
								//
								if(woItemType == 'InvtPart' || woItemType == 'NonInvtPart')
									{
										if(firstInventoryItem)
											{
												firstInventoryItem = false;
											}
										else
											{
												if(!baseItems[woAssemblyItemSequence])
													{
														baseItems[woAssemblyItemSequence] = [woAssemblyItem,Number(woAssemblyItemQty),Number(woAssemblyItemCommitted),woAssemblyItemDesc,woSpecInst]; //Item Description, Quantity, Committed Qty, Description, Special Instr
													}
												else
													{
														baseItems[woAssemblyItemSequence][1] = Number(baseItems[woAssemblyItemSequence][1]) + Number(woAssemblyItemQty);
														baseItems[woAssemblyItemSequence][2] = Number(baseItems[woAssemblyItemSequence][2]) + Number(woAssemblyItemCommitted);
													}
											}
									}
								
								
								//Only print out non-assembly items
								//
								if(woItemType != 'Assembly')
									{
										//Also we need to keep track of the components for the current finished item 
										//
										var finishedItemComponents = finishedItems[thisFinishedItem][3];
										
										if(!finishedItemComponents[woAssemblyItemId])
											{
												finishedItemComponents[woAssemblyItemId] = [woAssemblyItem,woAssemblyItemDesc,woSpecInst,Number(woAssemblyItemQty),Number(woAssemblyItemCommitted)]
											}
										else
											{
												finishedItemComponents[woAssemblyItemId][3] = Number(finishedItemComponents[woAssemblyItemId][3]) + Number(woAssemblyItemQty);
												finishedItemComponents[woAssemblyItemId][4] = Number(finishedItemComponents[woAssemblyItemId][4]) + Number(woAssemblyItemCommitted);
											}
										
										finishedItems[thisFinishedItem][3] = finishedItemComponents;
	
									}
							}
					}
			}

		
		//
		//=====================================================================
		// Produce the summary of the base items
		//=====================================================================
		//
		var today = new Date();
		var todayString = ('0' + today.getDate()).slice(-2) + '/' + ('0' + today.getMonth()).slice(-2) + '/' + today.getFullYear();
		
		//Header & style sheet
		//
		xml += "<pdf>"
		xml += "<head>";
		xml += "<style type=\"text/css\">table {font-family: Calibri, Candara, Segoe, \"Segoe UI\", Optima, Arial, sans-serif;font-size: 9pt;table-layout: fixed;}";
		xml += "th {font-weight: bold;font-size: 8pt;padding: 0px;border-bottom: 1px solid black;border-collapse: collapse;}";
		xml += "td {padding: 0px;vertical-align: top;font-size:10px;}";
		xml += "b {font-weight: bold;color: #333333;}";
		xml += "table.header td {padding: 0px;font-size: 10pt;}";
		xml += "table.footer td {padding: 0;font-size: 10pt;}";
		xml += "table.itemtable th {padding-bottom: 0px;padding-top: 0px;}";
		xml += "table.body td {padding-top: 0px;}";
		xml += "table.total {page-break-inside: avoid;}";
		xml += "table.message{border: 1px solid #dddddd;}";
		xml += "tr.totalrow {line-height: 300%;}";
		xml += "tr.messagerow{font-size: 6pt;}";
		xml += "td.totalboxtop {font-size: 12pt;background-color: #e3e3e3;}";
		xml += "td.addressheader {font-size: 10pt;padding-top: 0px;padding-bottom: 0px;}";
		xml += "td.address {padding-top: 0;font-size: 10pt;}";
		xml += "td.totalboxmid {font-size: 28pt;padding-top: 20px;background-color: #e3e3e3;}";
		xml += "td.totalcell {border: 1px solid black;border-collapse: collapse;}";
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
		xml += "<tr><td align=\"left\" style=\"font-size:20px; vertical-align: middle;\">Ship Date: " + thisShipDateFormatted + "</td></tr>";
		xml += "<tr><td align=\"right\" style=\"font-size:50px; vertical-align: middle;\"><b>" + thisShipDay + "</b></td></tr>";
		xml += "</table>";
		
		xml += "</macro>";
		
		//Header data
		//
		xml += "<macro id=\"nlheader\">";
		xml += "<table style=\"width: 100%\">";
		xml += "<tr>";
		xml += "<td align=\"center\" colspan=\"3\" style=\"font-size:20px; padding-bottom: 30px;\"><b>" + nlapiEscapeXML(batchDescription) + "</b></td>";
		xml += "</tr>";
		
		xml += "<tr>";
		xml += "<td align=\"left\" style=\"font-size:12px; padding-bottom: 10px;\"><b>Batch Id</b></td>";
		xml += "<td align=\"left\" style=\"padding-bottom: 10px;\"><barcode codetype=\"code128\" showtext=\"false\" value=\"" + "%" + nlapiEscapeXML(batchId) + "\"/></td>";
		xml += "<td align=\"right\" style=\"font-size:20px; padding-bottom: 10px;\">" + nlapiEscapeXML(batchId) + "</td>";
		xml += "</tr>";

		xml += "<tr>";
		xml += "<td align=\"left\" style=\"font-size:12px; padding-bottom: 10px;\"><b>Sales Order</b></td>";
		xml += "<td align=\"left\" style=\"padding-bottom: 10px;\"><barcode codetype=\"code128\" showtext=\"false\" value=\"" + nlapiEscapeXML(thisSalesOrder) + "\"/></td>";
		xml += "<td align=\"right\" style=\"font-size:20px; padding-bottom: 10px;\"><b>" + nlapiEscapeXML(thisSalesOrder) + "</b></td>";
		xml += "</tr>";
		
		
		xml += "</table></macro>";

		xml += "</macrolist>";
		xml += "</head>";
		
		//Body
		//
		xml += "<body header=\"nlheader\" header-height=\"120px\" footer=\"nlfooter\" footer-height=\"60px\" padding=\"0.4cm 0.4cm 0.4cm 0.4cm\" width=\"112mm\" height=\"112mm\">";
		


		//Sort the base items
		//
		for ( var orderedBaseItem in orderedBaseItems) 
			{
				delete orderedBaseItems[orderedBaseItem];
			}
		
		const orderedBaseItems = {};
		Object.keys(baseItems).sort().forEach(function(key) {
			orderedBaseItems[key] = baseItems[key];
		});
		
		//Loop through the base items
		//
		xml += "<table>";
		
		for (var baseItem in orderedBaseItems) 
			{
				xml += "<tr>";
				xml += "<td align=\"left\" style=\"font-size: 8pt;\"><b>" + nlapiEscapeXML(removePrefix(orderedBaseItems[baseItem][0])) + "</b></td>";
				xml += "<td align=\"left\" style=\"font-size: 8pt; padding-left: 10px;\">" + nlapiEscapeXML(orderedBaseItems[baseItem][3]) + "</td>";
				xml += "</tr>";
									
									
				xml += "<tr>";
				xml += "<td align=\"left\" ><b>" + nlapiEscapeXML(orderedBaseItems[baseItem][4]) + "</b></td>";
				xml += "</tr>";
								
			}
		
		//Finish the item table
		//
		xml += "</table>";

		}

	//Finish 
	//
	xml += "</body>";
	xml += "</pdf>";
	
	//Convert to pdf using the BFO library
	//
	var pdfFileObject = nlapiXMLToPDF(xml);
	
	return pdfFileObject;
}

function getItemRecordType(girtItemType)
{
	var girtItemRecordType = '';
	
	switch(girtItemType)
	{
		case 'InvtPart':
			girtItemRecordType = 'inventoryitem';
			break;
		
		case 'NonInvtPart':
			girtItemRecordType = 'noninventoryitem';
			break;
		
		case 'Assembly':
			girtItemRecordType = 'assemblyitem';
			break;
			
		case 'NonInvtPart':
			girtItemRecordType = 'noninventoryitem';
			break;
	}

	return girtItemRecordType;
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
