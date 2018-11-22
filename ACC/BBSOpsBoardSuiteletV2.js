/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       29 Aug 2018     cedricgriffiths
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */

//Declare constants
//
{
	var MAXOPSBOARDSIZE = 97;
	var HTMLCOLOURBLACK = '#000000';
	var HTMLCOLOURWHITE = '#ffffff';
	var HTMLCOLOURGREEN = '#66ff66';
	var HTMLCOLOURAMBER = '#ff8000';
	var HTMLCOLOURYELLOW = '#ffff00';
	var HTMLCOLOURRED = '#ff0000';
	var SEARCHCOLFIXTUREHYPERLINK = 17;
	var SEARCHCOLSECTORHYPERLINK = 18;
	var RESOLUTIONWIDTH = '1800';
	var RESOLUTIONHEIGHT = '1080';
	var OPSBOARDVERSION = 'v2.1.0.1';
	var LEFTSCROLL = '1800';
}

function suitelet(request, response)
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
	
	
	//=============================================================================================
	// Declare variables
	//=============================================================================================
	//
	var html = '';
	var opsAircraft = {}; //object to hold list of aircraft
	var opsBoard = {}; //object to hold the ops board data
	
	
	//=============================================================================================
	// Main Code
	//=============================================================================================
	//
	
	//Parameters passed to the suitelet 
	//
	var paramRefreshInterval = Number(request.getParameter('refresh'));
	var paramNowDate = request.getParameter('nowdate');
	var paramDept = request.getParameter('dept');
	var paramStage = Number(request.getParameter('stage'));
	paramStage = (paramStage == 0 ? 1 : paramStage);
	
	//Get request
	//
	if (request.getMethod() == 'GET') 
		{
			switch(paramStage)
				{
					case 1:	
						
						// Form creation
						//
						var form = nlapiCreateForm('Launch Ops Board', false);
						form.setTitle('Launch Ops Board');
						
						//Stage
						//
						var stageField = form.addField('custpage_param_stage', 'integer', 'stage');
						stageField.setDisplayType('hidden');
						stageField.setDefaultValue(paramStage);
						
						//Add a field group 
						//
						var fieldGroupConfig = form.addFieldGroup('custpage_grp_config', 'Configuration');
						fieldGroupConfig.setSingleColumn(false);
						
						//Add a field to set the now date
						//
						var nowField = form.addField('custpage_param_now', 'date', 'Board Centre Date (Blank = now)', null, 'custpage_grp_config');
						
						//Add a field to set the department
						//
						var nowField = form.addField('custpage_param_dept', 'select', 'Department', 'department', 'custpage_grp_config');
						
						//Add a field to set the refresh time
						//
						var refreshField = form.addField('custpage_param_refresh', 'integer', 'Refresh Interval (Blank = no refresh)', null, 'custpage_grp_config');
						refreshField.setDefaultValue('1');
						
						//Add a submit button to the form
						//
						form.addSubmitButton('Launch');
		
						response.writePage(form);
						
						break;
						
					case 2:
						
						var now = convertDateToUTC(new Date()); // work out the current date/time as UTC
						var showNow = true;
						
						if(paramNowDate != null && paramNowDate != '')
							{
								now = nlapiStringToDate(paramNowDate);
								now.setHours(12, 0, 0, 0);
								showNow = false;
							}
						
						var nowRounded = toHalfHour(new Date(now)); // round the current date/time to the half hour
						var startDate = nlapiAddDays(nowRounded, -1); //define the start date of the ops board
						var endDate = nlapiAddDays(nowRounded, +1); //define the end date of the ops board
						var opsSearchResults = getOpsSearchResults(startDate, endDate, paramDept); //get the sector records to put on the ops board
						
						
						//Convert refresh time in mins to seconds
						//
						paramRefreshInterval = paramRefreshInterval * 60; //Convert refresh time in mins to seconds
						
						//Set up a default response string in case there is no data to display
						//
						html = "<html><head>"; 
						
						if(paramRefreshInterval > 0)
						{
							html += "<meta http-equiv=\"refresh\" content=\"" + paramRefreshInterval + "\">";
						}
						
						html += "</head><body><p>No Data To Display</p></body></html>";
						
						//See if we have any results to process
						//
						if(opsSearchResults != null && opsSearchResults.length > 0)
							{
								//Loop through the results to see how many distinct aircraft we have
								//
								for (var int = 0; int < opsSearchResults.length; int++) 
									{
										var aircraftId = opsSearchResults[int].getValue("custrecord_fw_acreg");
										opsAircraft[aircraftId] = aircraftId;
									}
								
								//Having got a list of all the distinct aircraft, loop through them to build up an empty ops board
								//
								for ( var aircraft in opsAircraft) 
									{
										var opsBoardKeyEstimated = aircraft + '|' + 'ESTIMATED';
										var opsBoardKeyActual = aircraft + '|' + 'ACTUAL';
										var opsBoardKeyBlank = aircraft + '|' + 'BLANK';
										
										opsBoard[opsBoardKeyEstimated] = makeCellArray(startDate, endDate, nowRounded, showNow); //Add an ESTIMATED line to the ops board
										opsBoard[opsBoardKeyActual] = makeCellArray(startDate, endDate, nowRounded, showNow); //Add an ACTUAL line to the ops board
										opsBoard[opsBoardKeyBlank] = makeCellArray(startDate, endDate, nowRounded, showNow); //Add an BLANK line to the ops board
									}
								
								//Now we have an empty ops board, we need to start to fill in the data by looping through the results
								//
								for (var int = 0; int < opsSearchResults.length; int++) 
									{
										//=============================================================================================
										// Processing for ESTIMATED line
										//=============================================================================================
										//
									
										//Build the key to reference the ESTIMATED line on the ops board
										//
										var opsKey = opsSearchResults[int].getValue("custrecord_fw_acreg") + '|' + 'ESTIMATED';
										
										//Fill in the aircraft details for the left hand column on the board
										//
										updateOpsBoardWithAircraft(opsBoard, opsKey, opsSearchResults[int], 'E'); //Ops Board Object, Ops Board Key, Search Results Row, Row type
										
										//Fill in the flight details in the ops board
										//
										updateOpsBoardWithFlight(opsBoard, opsKey, opsSearchResults[int], 'E', now); //Ops Board Object, Ops Board Key, Search Results Row, Type (E=ESTIMATED, A=Actual), Time now
										
										
										//=============================================================================================
										// Processing for ACTUAL line
										//=============================================================================================
										//
									
										//Build the key to reference the ACTUAL line on the ops board
										//
										var opsKey = opsSearchResults[int].getValue("custrecord_fw_acreg") + '|' + 'ACTUAL';
										
										//Fill in the aircraft details for the left hand column on the board
										//
										updateOpsBoardWithAircraft(opsBoard, opsKey, opsSearchResults[int], 'A'); //Ops Board Object, Ops Board Key, Search Results Row, Row type
										
										//Fill in the flight details in the ops board
										//
										updateOpsBoardWithFlight(opsBoard, opsKey, opsSearchResults[int], 'A', now); //Ops Board Object, Ops Board Key, Search Results Row, Type (E=ESTIMATED, A=Actual), Time now
										
										
										//=============================================================================================
										// Processing for BLANK line
										//=============================================================================================
										//
									
										//Build the key to reference the BLANK line on the ops board
										//
										var opsKey = opsSearchResults[int].getValue("custrecord_fw_acreg") + '|' + 'BLANK';
										
										//Fill in the aircraft details for the left hand column on the board
										//
										updateOpsBoardWithAircraft(opsBoard, opsKey, opsSearchResults[int], 'B'); //Ops Board Object, Ops Board Key, Search Results Row, Row type
									}
								
								//Convert the data into html
								//
								html = convertDataToHtml(opsBoard, now, paramRefreshInterval, showNow);
							}
				
						//Return the html to the client
						//
						try
							{
								var contextUser = nlapiGetContext().getName();
								nlapiLogExecution('AUDIT', 'Ops Board Launched', contextUser);
							}
						catch(err)
							{
							
							}
						
						response.write(html);
						
						break;
				}
		}
	else
		{
			//=====================================================================
			// Post request - so process the returned form
			//=====================================================================
			//
			
			//Retrieve the parameters from the form fields
			//
			var paramNowDate = request.getParameter('custpage_param_now');
			var paramRefresh = request.getParameter('custpage_param_refresh');
			var stage = Number(request.getParameter('custpage_param_stage'));
			var paramDept = Number(request.getParameter('custpage_param_dept'));
			
			
			//Build up the parameters so we can call this suitelet again, but move it on to the next stage
			//
			var params = new Array();
			params['nowdate'] = paramNowDate;
			params['refresh'] = paramRefresh;
			params['dept'] = paramDept;
			params['stage'] = stage + 1;
			
			var context = nlapiGetContext();
			response.sendRedirect('SUITELET',context.getScriptId(), context.getDeploymentId(), null, params);
		}
}



//=============================================================================
// Objects
//=============================================================================
//

// Represents a single ops board cell & its properties
//
function opsCell(_cellDate, _cellIsNow)
{
	this.cellDate = _cellDate;
	this.cellText = '';
	this.cellTextSize = '10pt';
	this.cellTextColour = HTMLCOLOURBLACK;
	this.cellIsNow = _cellIsNow;
	this.cellHyperlink = '';
	this.cellBackgroundColour = HTMLCOLOURWHITE;
	
	//Method to return html for the header lines
	//
	this.getHeaderHtml = function()
		{
			var theColour = (this.cellIsNow ? HTMLCOLOURYELLOW : HTMLCOLOURWHITE);
			var text = '';
			var borders = '';
			
			//Special processing if the cell is classed as 'now'
			//
			if(this.cellIsNow)
				{
					borders = 'border-color: black ' + theColour + ' black ' + HTMLCOLOURYELLOW + '; border-left: 4px solid ' + HTMLCOLOURYELLOW;
					text = "<th style=\"background-color: " + theColour + "; " + borders + "\">" + this.cellDate.format('H') + ':' + this.cellDate.format('i') + "</th>";
				}
			else
				{
					borders = 'border-color: black;';
					text = "<th style=\"background-color: " + theColour + "; " + borders + "\">" + this.cellDate.format('H') + ':' + this.cellDate.format('i') + "</th>";
				}
			
			return text;
		}
	
	//Method to return html for the body cells
	//
	this.getBodyHtml = function()
		{
			var borders = '';
			var text = '';
			
			//Special processing if the cell is classed as 'now'
			//
			if(this.cellIsNow)
				{
					borders = 'border-color: black black black yellow; border-left: 4px solid yellow';
					text = "<td align=\"center\"style=\"font-size: " + this.cellTextSize + "; background-color: " + this.cellBackgroundColour + "; color: " + this.cellTextColour + "; " + borders + "\">" + this.cellText + "</td>";
				}
			else
				{
					//If the cell has a colour in it, the we need to make the borders the same colour as the background
					//
					if(this.cellBackgroundColour != HTMLCOLOURWHITE)
						{
							borders = "border-right: 1px solid " + this.cellBackgroundColour + "; border-left: 1px solid " + this.cellBackgroundColour + ";";
							text = "<td align=\"center\" style=\"font-size: " + this.cellTextSize + ";background-color: " + this.cellBackgroundColour + "; color: " + this.cellTextColour + "; " + borders + "\">" + this.cellText + "</td>";
						}
					else
						{
							borders = 'border-color: black 1px solid;';
							text = "<td align=\"center\" style=\"font-size: " + this.cellTextSize + ";background-color: " + this.cellBackgroundColour + "; color: " + this.cellTextColour + "; " + borders + "\">" + this.cellText + "</td>";					
						}
				}
			
			return text;
		}
}


// Represents a single ops board aircraft info cell which will be the first cell in the row
//
function opsInfoCell()
{
	this.aircraftReg = '';
	this.aircraftNo = '';
	this.fixtureRef = '';
	this.sectorType = '';
	this.rowType = '';
	this.fixtureId = '';
	
	this.getInfoHtmlLine = function()
		{
			var text = '';
			
			if(this.rowType == 'E')
				{
					text = "<td width=\"250px\"><a href=\"https://www.flightradar24.com/data/aircraft/" + this.aircraftReg + "\" target=\"_blank\">" + this.aircraftReg + "</a>&nbsp;&nbsp;&nbsp;(" + this.aircraftNo + ")</td>";
				}
	
			if(this.rowType == 'A')
				{
					//text = "<td width=\"200px\">" + this.fixtureRef + "&nbsp;&nbsp;&nbsp;(" + this.sectorType + ")</td>";
					text = "<td width=\"250px\"><a href=\"/app/accounting/transactions/salesord.nl?id=" + this.fixtureId + "\" target=\"_blank\">" + this.fixtureRef + "</a>&nbsp;&nbsp;&nbsp;(" + this.sectorType + ")</td>";
				}
	
			if(this.rowType == 'B')
				{
					text = "<td width=\"250px\">&nbsp;</td>";
				}

			return text;
		}
}


//=============================================================================
// Functions
//=============================================================================
//

//Build the html from the ops board data
//
function convertDataToHtml(_opsBoard, _now, _refreshTime, _showNow)
{
	var content = ''
	
	//Work out how deep the table should be
	//
	var opsLines = Number(0);
	
	for ( var opsKeys in _opsBoard) 
		{
			opsLines++;
		}	
	
	var tableDepth = (Number(23) * opsLines) + 25;
	tableDepth = (tableDepth > 10000 ? 10000 : tableDepth); //set the max table depth to 10,000 pixels 
	
	//Start the html
	//
	content += "<html>";
	content += "<head>";
	
	//Refresh interval if time > 0, otherwise no refresh
	//
	if(_refreshTime > 0)
		{
			content += "<meta http-equiv=\"refresh\" content=\"" + _refreshTime + "\">";
		}
	
	//Scripting
	//
	content += "<script src=\"https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js\"></script>";
	content += "<script>";
	content += "$(document).ready(function() {";
	
	//If we are showing the 'now' marker, then scroll this into view
	//
	//if(_showNow)
	//	{
			content += "var $tbody = $('tbody');";
			content += "$tbody.scrollLeft(" + LEFTSCROLL + ");";
	//	}
	
	content += "  $('tbody').scroll(function(e) { ";
	content += "    $('thead').css(\"left\", -$(\"tbody\").scrollLeft()); ";
	content += "    $('thead th:nth-child(1)').css(\"left\", $(\"tbody\").scrollLeft()); ";
	content += "    $('tbody td:nth-child(1)').css(\"left\", $(\"tbody\").scrollLeft()); ";
	content += "  });";
	content += "});";
	content += "</script>";
	
	//Style sheet
	//
	content += "<style type=\"text/css\">";
	content += "table {";
	content += "  position: relative;";
	content += "  width: " + RESOLUTIONWIDTH + "px;";
	content += "  background-color: #aaa;";
	content += "  overflow: hidden;";
	content += "  border-collapse: collapse;";
	content += "}";
	content += "thead {";
	content += "  position: relative;";
	content += "  display: block; ";
	content += "  width: " + RESOLUTIONWIDTH + "px;";
	content += "  overflow: visible;";
	content += "}";
	content += "thead th {";
	content += "  background-color: #ffffff; ";
	content += "  min-width: 50px;";
	content += "  height: 20px;";
	content += "  border: 1px solid #222; ";
	content += "}";
	content += "thead th:nth-child(1) {";
	content += "  position: relative;";
	content += "  display: block; ";
	content += "  background-color: #ffffff; ";
	content += "}";
	content += "tbody {";
	content += "  position: relative;";
	content += "  display: block;";
	content += "  width: " + RESOLUTIONWIDTH + "px;";
	//content += "  height: " + tableDepth.toString() + "px;";
	content += "  height: 700px;";
	content += "  overflow: scroll;";
	content += "}";
	content += "tbody td {";
	content += "  background-color: #ffffff; ";
	content += "  min-width: 50px;";
	content += "  border-top: 1px solid #000000; ";
	content += "  border-bottom: 1px solid #000000; ";
	content += "  border-left: 1px solid #000000; ";
	content += "  border-right: 1px solid #000000; ";
	content += "}";
	content += "tbody tr td:nth-child(1) {  ";
	content += "  position: relative;";
	content += "  display: block; ";
	content += "  height: 20px;";
	content += "  background-color: #ffffff; ";
	content += "}";	
	content += "</style>";
	
	content += "</head>";
	
	//Start of body section
	//
	content += "<body>";
	content += "<table>";
	content += "<thead>";
	
	
	//Construct the header info which will be the cells and their times as well as a top level header showing which day the ce;l;s belong to
	//
	var firstOpsBoardKey = Object.keys(_opsBoard)[0]; 
	var yesterdaysDate = new Date(_now.getFullYear(), _now.getMonth(), _now.getDate(), 0, 0, 0, 0);
	var tomorrowsDate = new Date(_now.getFullYear(), _now.getMonth(), _now.getDate(), 0, 0, 0, 0);
	yesterdaysDate.setDate(yesterdaysDate.getDate() - 1);
	tomorrowsDate.setDate(tomorrowsDate.getDate() + 1);

	var yesterdaysCellCount = Number(0);
	var tomorrowsCellCount = Number(0);
	
	//Work out how to split the date heading across the individual cells
	//
	for (var headerCell = 1; headerCell < _opsBoard[firstOpsBoardKey].length; headerCell++) 
	{
		var cellDateRaw = _opsBoard[firstOpsBoardKey][headerCell].cellDate;
		var cellDate = new Date(cellDateRaw.getFullYear(), cellDateRaw.getMonth(), cellDateRaw.getDate(), 0, 0, 0, 0);
	
		if(cellDate.getTime() == yesterdaysDate.getTime())
			{
				yesterdaysCellCount++;
			}
		
		if(cellDate.getTime() == tomorrowsDate.getTime())
			{
				tomorrowsCellCount++;
			}
	}
	
	//Top level heading
	//
	content += "<tr>";
	content += "<th>&nbsp;</th>";
	content += "<th align=\"center\" colspan=\"" + yesterdaysCellCount + "\">" + yesterdaysDate.format('D d F Y') + "</th>";
	content += "<th align=\"center\" colspan=\"48\">" + _now.format('D d F Y H:i') + " UTC</th>";
	content += "<th align=\"center\" colspan=\"" + tomorrowsCellCount + "\">" + tomorrowsDate.format('D d F Y') + "</th>";
	content += "</tr>";
	
	//Headings by time
	//
	content += "<tr>";
	content += "<th width=\"250px\">Ops Board " + OPSBOARDVERSION + "</th>";
	
	for (var headerCell = 1; headerCell < _opsBoard[firstOpsBoardKey].length; headerCell++) 
		{
			content += _opsBoard[firstOpsBoardKey][headerCell].getHeaderHtml();
		}
	
	content += "</tr>";
	content += "</thead>";
	
	//Construct the table body
	//
	content += "<tbody>";
	
	for ( var opsKey in _opsBoard) 
		{
			content += "<tr>";
		
			for (var bodyCell = 0; bodyCell < _opsBoard[opsKey].length; bodyCell++) 
				{
					//Cell 0 get the aircraft info, cell 1+ gets the fixture & sector info
					//
					if(bodyCell == 0)
						{
							content += _opsBoard[opsKey][bodyCell].getInfoHtmlLine();
						}
					else
						{
							content += _opsBoard[opsKey][bodyCell].getBodyHtml();
						}
				}
			
			content += "</tr>";	
		}

	content += "</tbody>";
	content += "</table>";
	
	//End of body section
	//
	content += "</body>";
	content += "</html>";
	
	return content;
}


//Find a cell in the ops board by date
//
function findCellByDate(_opsBoard, _opsKey, _dateTime)
{
	var cellNumber = Number(0);
	
	for (var cellCounter = 1; cellCounter < _opsBoard[_opsKey].length; cellCounter++) 
		{
			if(_opsBoard[_opsKey][cellCounter].cellDate.getTime() == _dateTime.getTime())
				{
					cellNumber = cellCounter;
					break;
				}
		}
	
	return cellNumber;
}


// Join date and time together into a new date object
//
function joinDateTime(_dateString, _timeString)
{
	var hours = _timeString.split(':')[0];
	var minutes = _timeString.split(':')[1];
	var dateObj = nlapiStringToDate(_dateString);
	
	var joinedDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), hours, minutes, 0, 0);
	
	return joinedDate;
}


// Set the flight details on the ops board line, _type (E=ESTIMATED, A=Actual) 
//
function updateOpsBoardWithFlight(_opsBoard, _opsKey, _results, _type, _now)
{
	//Get the relevant fields from the results
	//
	uobwfDepartureDate = _results.getValue("custrecord_sector_departuredate");
	uobwfDepartureTime = _results.getValue("custrecord_sector_deputcdt");
	uobwfArrivalDate = _results.getValue("custrecord_sector_arrivaldate");
	uobwfArrivalTime = _results.getValue("custrecord_sector_arrutcdt");
	uobwfFlightNumber = _results.getValue("custrecord_sector_flightnumber");
	uobwfDepartureAirport = _results.getText("custrecord_sector_departureiata");
	uobwfArrivalAirport = _results.getText("custrecord_sector_arrivaliata");
	uobwfOffBlockDate = _results.getValue("custrecord_fw_offbloclsdate");
	uobwfOffBlockTime = _results.getValue("custrecord_fw_offblocktime");
	uobwfOnBlockDate = _results.getValue("custrecord_fw_onblocksdate");
	uobwfOnBlockTime = _results.getValue("custrecord_fw_onblockstime");
	uobwfDivertedAirport = _results.getText("custrecord_fw_divertedto");
	uobwfEtaDate = _results.getValue("custrecord_fw_etadate");
	uobwfEtaTime = _results.getValue("custrecord_fw_etatime");
	uobwfAirborneTime = _results.getValue("custrecord_fw_airbornetime");
	uobwfTouchdownTime = _results.getValue("custrecord_fw_touchdowntime");
	
	uobwfFixtureHyperlink = _results.getValue("internalid","CUSTRECORD_SECTOR_FIXTURE");
	uobwfSectorHyperlink = _results.getValue("internalid");
	
	
	//Processing for an ESTIMATED line on the ops board
	//
	if(_type == 'E')
		{
			//Keep a copy of the un-rounded departure date/time so we can to the five minute check against it (see below)
			//
			var uobwDepartureDateTimeUnRounded = joinDateTime(uobwfDepartureDate, uobwfDepartureTime);
			var uobwDepartureDateTimeFiveMinsBefore = new Date(uobwDepartureDateTimeUnRounded.getTime() - (5*60000))
			
			//Join the departure date & time together & then round to the nearest 30 mins
			//
			var uobwDepartureDateTime = toHalfHour(joinDateTime(uobwfDepartureDate, uobwfDepartureTime));
			
			//Join the arrival date & time together & then round to the nearest 30 mins
			//
			var uobwArrivalDateTime = toHalfHour(joinDateTime(uobwfArrivalDate, uobwfArrivalTime));
			
			//See if the arrival date/time is before the date/time of the first cell
			//If so, then ignore it
			//
			if(uobwArrivalDateTime.getTime() < _opsBoard[_opsKey][1].cellDate.getTime() || uobwDepartureDateTime.getTime() > _opsBoard[_opsKey][MAXOPSBOARDSIZE].cellDate.getTime())
				{
					//do nothing
					//
				}
			else
				{
					//Find the start and end cell in the ops board
					//
					var startCellNumber = findCellByDate(_opsBoard, _opsKey, uobwDepartureDateTime);
					var endCellNumber = findCellByDate(_opsBoard, _opsKey, uobwArrivalDateTime);
					
					//If the start cell has come back as zero, then we must have started before the ops board range, therefore set the start to be cell 1
					//If the end cell has come back as zero, then we must have ended after the ops board range, therefore set the start to be cell 97
					//Also set up a little marker to indicate that the time is actually off the start/end of the ops board when displaying on the bar
					//
					var beforeStartMarker = (startCellNumber == 0 ? '<' : '');
					var afterEndMarker = (endCellNumber == 0 ? '>' : '');
					
					startCellNumber = (startCellNumber == 0 ? 1 : startCellNumber); 
					endCellNumber = (endCellNumber == 0 ? MAXOPSBOARDSIZE : endCellNumber); 
					
					//Check to see if we can fit in the departure airport in the ops board i.e. the start cell has to be > 1
					//
					if(startCellNumber > 1)
						{
							_opsBoard[_opsKey][startCellNumber - 1].cellText = uobwfDepartureAirport;
							_opsBoard[_opsKey][startCellNumber - 1].cellTextColour = HTMLCOLOURBLACK;
							_opsBoard[_opsKey][startCellNumber - 1].cellBackgroundColour = HTMLCOLOURWHITE;
						}
				
					//Check to see if we can fit in the arrival airport in the ops board i.e. the end cell has to be < 97
					//
					if(endCellNumber < MAXOPSBOARDSIZE)
						{
							_opsBoard[_opsKey][endCellNumber + 1].cellText = uobwfArrivalAirport;
							_opsBoard[_opsKey][endCellNumber + 1].cellTextColour = HTMLCOLOURBLACK;
							_opsBoard[_opsKey][endCellNumber + 1].cellBackgroundColour = HTMLCOLOURWHITE;
						}
				
					
					//See if we need to change the estimated bar from black to amber if we are within 5 minutes of 'now'
					//and we still do not have any actual departure date/time
					//
					var blockColour = HTMLCOLOURBLACK;
					
					if( _now.getTime() >= uobwDepartureDateTimeFiveMinsBefore.getTime()  && (uobwfOffBlockTime == '' || uobwfOffBlockTime == null))
						{
							blockColour = HTMLCOLOURAMBER;
						}
						
					//Fill in the flight bar between the start and the end cells
					//
					for (var cellCounter = startCellNumber; cellCounter <= endCellNumber; cellCounter++) 
						{
							_opsBoard[_opsKey][cellCounter].cellTextColour = HTMLCOLOURWHITE;
							_opsBoard[_opsKey][cellCounter].cellBackgroundColour = blockColour;
							_opsBoard[_opsKey][cellCounter].cellHyperlink = uobwfFixtureHyperlink;
							_opsBoard[_opsKey][cellCounter].cellText = "<a style=\"text-decoration: none; color: " + blockColour + ";\"href=\"/app/common/custom/custrecordentry.nl?rectype=34&id=" + uobwfSectorHyperlink + " \"target=\"_blank\">link</a>";
							
							//If we are on the first cell of the bar, the add the departure time to the cell text
							//
							if(cellCounter == startCellNumber)
								{
									//_opsBoard[_opsKey][cellCounter].cellText = beforeStartMarker + uobwfDepartureTime;
									_opsBoard[_opsKey][cellCounter].cellText = "<a style=\"text-decoration: none; color: " + HTMLCOLOURWHITE + ";\"href=\"/app/common/custom/custrecordentry.nl?rectype=34&id=" + uobwfSectorHyperlink + " \"target=\"_blank\">" + beforeStartMarker + uobwfDepartureTime + "</a>";
								}
							
							//If we are on the last cell of the bar, the add the arrival time to the cell text
							//
							if(cellCounter == endCellNumber)
								{
									//_opsBoard[_opsKey][cellCounter].cellText = uobwfArrivalTime + afterEndMarker;
									_opsBoard[_opsKey][cellCounter].cellText = "<a style=\"text-decoration: none; color: " + HTMLCOLOURWHITE + ";\"href=\"/app/common/custom/custrecordentry.nl?rectype=34&id=" + uobwfSectorHyperlink + " \"target=\"_blank\">" + uobwfArrivalTime + afterEndMarker + "</a>";
								}
						}
					
					//Find the middle cell of the bar to put the flight number in, but only if we have a bar length > 2 cells
					//
					var barLength = (endCellNumber - startCellNumber) + 1;
					
					if(barLength > 2)
						{
							var middle = Math.floor((barLength - 1) / 2);
							var middleCell = startCellNumber + middle;
							
							_opsBoard[_opsKey][middleCell].cellTextSize = '8pt';
							_opsBoard[_opsKey][middleCell].cellTextColour = HTMLCOLOURWHITE;
							_opsBoard[_opsKey][middleCell].cellBackgroundColour = blockColour;
							//_opsBoard[_opsKey][middleCell].cellText = uobwfFlightNumber;
							_opsBoard[_opsKey][middleCell].cellText = "<a style=\"text-decoration: none; color: " + HTMLCOLOURWHITE + ";\"href=\"/app/accounting/transactions/salesord.nl?id=" + uobwfFixtureHyperlink + " \"target=\"_blank\">" + uobwfFlightNumber + "</a>";
							
						}
				}
		}
	
	//Processing for an ACTUAL line on the ops board
	//
	if(_type == 'A')
		{
			if(uobwfOffBlockDate != null && uobwfOffBlockDate !== '')
				{
					//Join the off block date & time together & then round to the nearest 30 mins
					//
					var uobwOffBlockDateTime = toHalfHour(joinDateTime(uobwfOffBlockDate, uobwfOffBlockTime));
					
					//Keep a copy of the un-rounded date/times for late departure/arrival calculations 
					//
					var uobwOffBlockDateTimeUnRounded = joinDateTime(uobwfOffBlockDate, uobwfOffBlockTime);
					var uobwDepartureDateTimeUnRounded = joinDateTime(uobwfDepartureDate, uobwfDepartureTime);
					var uobwArrivalDateTimeUnRounded = joinDateTime(uobwfArrivalDate, uobwfArrivalTime);
					
					
					//Join the on block date & time together & then round to the nearest 30 mins
					//
					var uobwOnBlockDateTime = null;
					try
						{
							uobwOnBlockDateTime = toHalfHour(joinDateTime(uobwfOnBlockDate, uobwfOnBlockTime));
						}
					catch(err)
						{
							uobwOnBlockDateTime = null;
						}
					
					//Join the ETA date & time together & then round to the nearest 30 mins
					//
					var uobwEtaDateTime = null;
					try
						{
							uobwEtaDateTime = toHalfHour(joinDateTime(uobwfEtaDate, uobwfEtaTime));
						}
					catch(err)
						{
							uobwEtaDateTime = null;
						}
					
					var uobwTheEndDateTime = null
					var uobwTheEndDateTimeUnRounded = null
					var uobwTheEndTime = '';
					
					//Is the on block date/time filled in, if so use that
					//
					if(uobwOnBlockDateTime != null)
						{
							uobwTheEndDateTime = new Date(uobwOnBlockDateTime);
							uobwTheEndTime = uobwfOnBlockTime;
							uobwTheEndDateTimeUnRounded = joinDateTime(uobwfOnBlockDate, uobwfOnBlockTime);
						}
					else
						{
							//Else is the ETA date/time filled in, if so use that
							//
							if(uobwEtaDateTime != null)
								{
									uobwTheEndDateTime = new Date(uobwEtaDateTime);
									uobwTheEndTime = uobwfEtaTime;
									uobwTheEndDateTimeUnRounded = joinDateTime(uobwfEtaDate, uobwfEtaTime);
								}
							else
								{
									//If we have no on block date/time & no ETA date/time, we must use the off block date/time
									//
									uobwTheEndDateTime = new Date(uobwOffBlockDateTime);
									uobwTheEndTime = uobwfOffBlockTime;
									uobwTheEndDateTimeUnRounded = joinDateTime(uobwfOffBlockDate, uobwfOffBlockTime);
								}
						}
					
					//See if the arrival date/time is before the date/time of the first cell
					//If so, then ignore it
					//
					if(uobwTheEndDateTime.getTime() < _opsBoard[_opsKey][1].cellDate.getTime() || uobwTheEndDateTime.getTime() > _opsBoard[_opsKey][MAXOPSBOARDSIZE].cellDate.getTime())
						{
							//do nothing
							//
						}
					else
						{
							//Find the start and end cell in the ops board
							//
							var startCellNumber = findCellByDate(_opsBoard, _opsKey, uobwOffBlockDateTime);
							var endCellNumber = findCellByDate(_opsBoard, _opsKey, uobwTheEndDateTime);
							
							//If the start cell has come back as zero, then we must have started before the ops board range, therefore set the start to be cell 1
							//If the end cell has come back as zero, then we must have ended after the ops board range, therefore set the start to be cell 97
							//Also set up a little marker to indicate that the time is actually off the start/end of the ops board when displaying on the bar
							//
							var beforeStartMarker = (startCellNumber == 0 ? '<' : '');
							var afterEndMarker = (endCellNumber == 0 ? '>' : '');
							
							startCellNumber = (startCellNumber == 0 ? 1 : startCellNumber); 
							endCellNumber = (endCellNumber == 0 ? MAXOPSBOARDSIZE : endCellNumber); 
							
							//Check to see if we can fit in the diverted airport in the ops board i.e. the end cell has to be < 97
							//
							if(endCellNumber < MAXOPSBOARDSIZE && (uobwfDivertedAirport != null && uobwfDivertedAirport != ''))
								{
									_opsBoard[_opsKey][endCellNumber + 1].cellText = uobwfDivertedAirport;
									_opsBoard[_opsKey][endCellNumber + 1].cellTextColour = HTMLCOLOURBLACK;
									_opsBoard[_opsKey][endCellNumber + 1].cellBackgroundColour = HTMLCOLOURWHITE;
								}
						
							var blockColour = HTMLCOLOURGREEN;
								
							//Fill in the flight bar between the start and the end cells
							//
							var airborneCellNumber = Number(startCellNumber) + 1;
							var touchdownCellNumber = Number(endCellNumber) - 1;
							
							//If we were late departing & late arriving, then set all the cell colours to be red
							//
							if(uobwOffBlockDateTimeUnRounded.getTime() > uobwDepartureDateTimeUnRounded.getTime() && uobwTheEndDateTimeUnRounded.getTime() > uobwArrivalDateTimeUnRounded.getTime())
								{
									blockColour = HTMLCOLOURRED;
								}
							
							for (var cellCounter = startCellNumber; cellCounter <= endCellNumber; cellCounter++) 
								{
									_opsBoard[_opsKey][cellCounter].cellTextColour = HTMLCOLOURWHITE;
									_opsBoard[_opsKey][cellCounter].cellBackgroundColour = blockColour;
									_opsBoard[_opsKey][cellCounter].cellHyperlink = uobwfSectorHyperlink;
									_opsBoard[_opsKey][cellCounter].cellText = "<a style=\"text-decoration: none; color: " + blockColour + ";\" href=\"/app/common/custom/custrecordentry.nl?rectype=34&id=" + uobwfSectorHyperlink + " \"target=\"_blank\">link</a>";
									
		
									//If we are on the airborne cell of the bar, the add the airborne time to the cell text
									//
									if(cellCounter == airborneCellNumber && (uobwfAirborneTime != null && uobwfAirborneTime != ''))
										{
											_opsBoard[_opsKey][cellCounter].cellText = "<a style=\"text-decoration: none; color: " + HTMLCOLOURWHITE + ";\" href=\"/app/common/custom/custrecordentry.nl?rectype=34&id=" + uobwfSectorHyperlink + " \"target=\"_blank\">" + uobwfAirborneTime + "</a>";
										}
									
									
									//If we are on the touchdown cell of the bar, the add the touchdown time to the cell text
									//
									if(cellCounter == touchdownCellNumber && (uobwfTouchdownTime != null && uobwfTouchdownTime != ''))
										{
											_opsBoard[_opsKey][cellCounter].cellText = "<a style=\"text-decoration: none; color: " + HTMLCOLOURWHITE + ";\" href=\"/app/common/custom/custrecordentry.nl?rectype=34&id=" + uobwfSectorHyperlink + " \"target=\"_blank\">" + uobwfTouchdownTime + "</a>";
										}
									
									
									//If we are on the first cell of the bar, the add the departure time to the cell text
									//
									if(cellCounter == startCellNumber)
										{
											//If we were late departing, then set the first cell colour to be red
											//
											if(uobwOffBlockDateTimeUnRounded.getTime() > uobwDepartureDateTimeUnRounded.getTime())
												{
													_opsBoard[_opsKey][cellCounter].cellBackgroundColour = HTMLCOLOURRED;
												}
											
											_opsBoard[_opsKey][cellCounter].cellText = "<a style=\"text-decoration: none; color: " + HTMLCOLOURWHITE + ";\" href=\"/app/common/custom/custrecordentry.nl?rectype=34&id=" + uobwfSectorHyperlink + " \"target=\"_blank\">" + beforeStartMarker + uobwfOffBlockTime + "</a>";
											
										}
									
									
									//If we are on the last cell of the bar, the add the arrival time to the cell text
									//
									if(cellCounter == endCellNumber)
										{
											//If we were late arriving, then set the last cell colour to be red
											//
											if(uobwTheEndDateTimeUnRounded.getTime() > uobwArrivalDateTimeUnRounded.getTime())
												{
													_opsBoard[_opsKey][cellCounter].cellBackgroundColour = HTMLCOLOURRED;
												}
											
											_opsBoard[_opsKey][cellCounter].cellText = "<a style=\"text-decoration: none; color: " + HTMLCOLOURWHITE + ";\"  href=\"/app/common/custom/custrecordentry.nl?rectype=34&id=" + uobwfSectorHyperlink + " \"target=\"_blank\">" + uobwTheEndTime + afterEndMarker + "</a>";
											
										}
								}
						}
				}
		}
}


// Set the aircraft details on the ops board line
//
function updateOpsBoardWithAircraft(_opsBoard, _opsKey, _results, _rowType)
{
	_opsBoard[_opsKey][0].fixtureId = _results.getValue("internalid","CUSTRECORD_SECTOR_FIXTURE")
	_opsBoard[_opsKey][0].aircraftReg = _results.getValue("custrecord_fw_acreg");
	//_opsBoard[_opsKey][0].aircraftNo = _results.getValue("custrecord_fw_acno");
	_opsBoard[_opsKey][0].aircraftNo = _results.getText("custbody_acc_q_aircraft","CUSTRECORD_SECTOR_FIXTURE");
	_opsBoard[_opsKey][0].fixtureRef = _results.getText("custrecord_sector_fixture");
	//_opsBoard[_opsKey][0].sectorType = _results.getText("custrecord_sector_type");
	_opsBoard[_opsKey][0].sectorType = removePrefix(_results.getText("department","CUSTRECORD_SECTOR_FIXTURE",null));
	_opsBoard[_opsKey][0].rowType = _rowType;
	
}


// Get the sectors to process
//
function getOpsSearchResults(_startDate, _endDate, _department)
{
	var filters = [
				   ["custrecord_sector_departuredate","within", nlapiDateToString(_startDate), nlapiDateToString(_endDate)], 
				   "AND", 
				   ["custrecord_sector_fixture.mainline","is","T"]
				];
	
	if(_department != null && _department != '' && _department != '0')
		{
			filters.push("AND",["custrecord_sector_fixture.department","anyof",_department]);
		}
	
	var customrecord_fs_sectorsSearch = nlapiSearchRecord("customrecord_fs_sectors",null,filters, 
			[
			   new nlobjSearchColumn("custrecord_fw_acreg").setSort(false), 
			   new nlobjSearchColumn("custrecord_fw_acno"), 
			   new nlobjSearchColumn("custrecord_sector_fixture"), 
			   new nlobjSearchColumn("custrecord_sector_type"), 
			   new nlobjSearchColumn("custrecord_fw_offbloclsdate"), 
			   new nlobjSearchColumn("custrecord_fw_airbornedate"), 
			   new nlobjSearchColumn("custrecord_fw_etadate"), 
			   new nlobjSearchColumn("custrecord_fw_touchdowndate"), 
			   new nlobjSearchColumn("custrecord_fw_onblocksdate"), 
			   new nlobjSearchColumn("custrecord_fw_offblocktime"), 
			   new nlobjSearchColumn("custrecord_fw_onblockstime"), 
			   new nlobjSearchColumn("custrecord_sector_departureiata"), 
			   new nlobjSearchColumn("custrecord_sector_arrivaliata"), 
			   new nlobjSearchColumn("custrecord_sector_departuredate").setSort(false), 
			   new nlobjSearchColumn("custrecord_sector_deputcdt").setSort(false), 
			   new nlobjSearchColumn("custrecord_sector_arrivaldate"), 
			   new nlobjSearchColumn("custrecord_sector_arrutcdt"), 
			   new nlobjSearchColumn("formulatext").setFormula("'<a href=\"/app/accounting/transactions/salesord.nl?id='||{custrecord_sector_fixture.internalid}||'\"target=\"_blank\">'||'<div style=\"color:#000000\">'||{custrecord_sector_fixture.internalid}||'</div>'||'</a>'"), 
			   new nlobjSearchColumn("formulatext").setFormula("'<a href=\"/app/common/custom/custrecordentry.nl?rectype=34&id='||{internalid}||'\"target=\"_blank\">'||'<div style=\"color:#008000\">' ||{internalid}|| '</div>'||'</a>'"), 
			   new nlobjSearchColumn("custrecord_sector_flightnumber"), 
			   new nlobjSearchColumn("internalid","CUSTRECORD_SECTOR_FIXTURE",null), 
			   new nlobjSearchColumn("internalid"),
			   new nlobjSearchColumn("custrecord_fw_divertedto"),
			   new nlobjSearchColumn("custrecord_fw_airbornetime"),
			   new nlobjSearchColumn("custrecord_fw_touchdowntime"),
			   new nlobjSearchColumn("custrecord_fw_etatime"),
			   new nlobjSearchColumn("custbody_acc_q_aircraft","CUSTRECORD_SECTOR_FIXTURE",null),
			   new nlobjSearchColumn("department","CUSTRECORD_SECTOR_FIXTURE",null)
			]
			);
	
	return customrecord_fs_sectorsSearch;
}


// Makes an array of objects that represents one complete row of ops board cells between the start & end dates
//
function makeCellArray(_startDate, _endDate, _nowDate, _showNow)
{
	var HALF_HOUR_IN_MS = 1800000;
	
	var cellArray = new Array();
	var loopDate = _startDate;

	cellArray.push(new opsInfoCell());
	
	while (loopDate.getTime() <= _endDate.getTime()) 
	{
		cellArray.push(new opsCell(loopDate,(loopDate.getTime() == _nowDate.getTime() && _showNow ? true : false)));
	   
		loopDate = new Date(loopDate.getTime() + HALF_HOUR_IN_MS);	
	}

	return cellArray; 
}


// Rounds a date to the nearest half hour
//
function toHalfHour(_inputDate)
{
	var MIN_IN_MS = 60000;
	
	_inputDate.setSeconds(0);
	_inputDate.setMilliseconds(0);
	
	var minutes = _inputDate.getMinutes();
	var minutesToAdd = 0;
	
	if (minutes >= 0 && minutes <= 29)
	{
	    minutesToAdd = 0 - minutes;
	}
	else if (minutes >= 31 && minutes <= 59)
	{
	    minutesToAdd = 0 - (minutes - 30);
	}
	
	minutesToAdd = minutesToAdd * MIN_IN_MS;
	
	return new Date(_inputDate.getTime() + minutesToAdd);
}


// Converts a date to its UTC equivalent
//
function convertDateToUTC(_date) 
{ 
	return new Date(_date.getUTCFullYear(), _date.getUTCMonth(), _date.getUTCDate(), _date.getUTCHours(), _date.getUTCMinutes(), _date.getUTCSeconds()); 
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


//right padding s with c to a total of n chars
function padding_right(s, c, n) 
{
    if (! s || ! c || s.length >= n) 
	    {
	        return s;
	    }

    var max = (n - s.length)/c.length;
    
    for (var i = 0; i < max; i++) 
	    {
	        s += c;
	    }

    return s;
}

function removePrefix(fullString)
{
	var returnString = fullString;
	
	var colon = fullString.indexOf(' : ');
	
	if(colon > -1)
		{
			returnString = fullString.substr(colon + 3);
		}
	
	return returnString;
}