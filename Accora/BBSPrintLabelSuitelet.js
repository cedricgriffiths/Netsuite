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
	var fulfillmentParam = request.getParameter('fulfillmentid');
			
	if (fulfillmentParam != null && fulfillmentParam != '') 
		{
			// Build the output
			//	
			var file = buildOutput(fulfillmentParam);
	
			// Send back the output in the response message
			//
			response.setContentType('PDF', 'Serial Number Labels', 'inline');
			response.write(file.getValue());
		}
}

//=====================================================================
// Functions
//=====================================================================
//
function buildOutput(fulfillmentId)
{
	//Start the xml off with the basic header info 
	//
	var xml = "<?xml version=\"1.0\"?>\n<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n";
	
	//Read the fulfillment record
	//
	var fulfillmentRecord = null;
	
	try
		{
			fulfillmentRecord = nlapiLoadRecord('itemfulfillment', fulfillmentId);
		}
	catch(err)
		{
			fulfillmentRecord = null;
		}
	
	if(fulfillmentRecord)
		{
			var today = new Date();
			//var todayString = ('0' + today.getDate()).slice(-2) + '/' + ('0' + today.getMonth()).slice(-2) + '/' + today.getFullYear();
			var todayString = today.format('d-M-Y');
			
			//Header & style sheet
			//
			xml += "<pdf>"
			xml += "<head>";
			xml += "	<link name=\"NotoSans\" type=\"font\" subtype=\"truetype\" src=\"${nsfont.NotoSans_Regular}\" src-bold=\"${nsfont.NotoSans_Bold}\" src-italic=\"${nsfont.NotoSans_Italic}\" src-bolditalic=\"${nsfont.NotoSans_BoldItalic}\" bytes=\"2\" />";
			xml += "    <style type=\"text/css\">* {";
			xml += "		font-family: NotoSans, sans-serif;";
			xml += "		}";
			xml += "		table {";
			xml += "            font-size: 7pt;";
			xml += "            table-layout: fixed;";
			xml += "            page-break-inside: avoid;";
			xml += "            display: inline;";
			xml += "        }";
			xml += "		td p { align:left }";
			xml += "</style>";
			xml += "</head>";
							
			//Body
			//
			xml += "<body padding=\"0.2cm 0.2cm 0.1cm 0.2cm\" width=\"89mm\" height=\"36mm\">";
							
			var lines = fulfillmentRecord.getLineItemCount('item');
			var salesOrderId = fulfillmentRecord.getFieldValue('createdfrom');
			var salesOrderNo = nlapiLookupField('salesorder', salesOrderId, 'tranid', false);
			var customer = nlapiEscapeXML(fulfillmentRecord.getFieldText('entity'));
			var subsidiaryId = fulfillmentRecord.getFieldValue('subsidiary');
			
			var firstTime = true;
			
			for (var int = 1; int <= lines; int++) 
				{
					var serialNumber = nlapiEscapeXML(fulfillmentRecord.getLineItemValue('item', 'custcol_serial_numbers_udi', int));
					var itemId = fulfillmentRecord.getLineItemValue('item', 'item', int);
					var item = nlapiEscapeXML(fulfillmentRecord.getLineItemText('item', 'item', int));
					var itemType = fulfillmentRecord.getLineItemValue('item', 'itemtype', int);
					var itemName = '';
					
					try
						{
							itemName = nlapiEscapeXML(nlapiLookupField(getItemRecordType(itemType), itemId, 'displayname', false));
						}
					catch(err)
						{
							itemName = '';
						}
					
					if(serialNumber != null && serialNumber != '')
						{
							
							for (var int2 = 0; int2 < 3; int2++) 
								{
									if(firstTime)
										{
											firstTime = false;
										}
									else
										{
											xml += "<pbr/>";
										}
							
									xml += "<table>";
								
									xml += "<tr >";
									xml += "<td style=\"font-size: 7px;\" colspan=\"2\"><b>" + itemName + "</b></td>";
									xml += "<td>&nbsp;</td>";
									xml += "</tr>";
									
									xml += "<tr >";
									xml += "<td>Part No:</td>";
									xml += "<td>" + item + "</td>";
									xml += "<td rowspan=\"3\" align=\"right\">";
									xml += "<img src=\"https://system.na2.netsuite.com/core/media/media.nl?id=245030&amp;c=4810497&amp;h=335bbabdec6b6ef31eb4\" style=\"width:40px; height:30px;\"/>";
									xml += "</td>";
									xml += "</tr>";
									
									xml += "<tr >";
									xml += "<td><b>Serial No:</b></td>";
									xml += "<td><b>" + serialNumber + "</b></td>";
									xml += "</tr>";
									
									xml += "<tr >";
									xml += "<td>Order No:</td>";
									xml += "<td>" + salesOrderNo + "</td>";
									xml += "</tr>";
									
									xml += "<tr >";
									xml += "<td>Customer:</td>";
									xml += "<td colspan=\"2\">" + customer + "</td>";
									//xml += "<td>&nbsp;</td>";
									xml += "</tr>";
									
									xml += "<tr >";
									xml += "<td>Date:</td>";
									xml += "<td colspan=\"2\">" + todayString + "</td>";
									//xml += "<td>&nbsp;</td>";
									xml += "</tr>";
									
									xml += "<tr >";
									
									xml += "<td style=\"font-size: 8px;\" colspan=\"3\">Accora Ltd. Barrington Road, Orwell, Cambridge, SG8 5QP  01223 206100</td>";
									
									xml += "</tr>";

									xml += "</table>";
								}
						}
				}

			//Finish 
			//
			xml += "</body>";
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
			
		case 'Kit':
			girtItemRecordType = 'kititem';
			break;
	}

	return girtItemRecordType;
}
