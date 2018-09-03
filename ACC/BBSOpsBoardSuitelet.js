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
	var SEARCHCOLFIXTUREHYPERLINK = 17;
	var SEARCHCOLSECTORHYPERLINK = 18;
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
	
	
	//Declare variables
	//
	var html = '';
	var now = convertDateToUTC(new Date()); // work out the current date/time as UTC
	//var nowMinusFiveMins = new Date(now.getTime() - (5*60000)); //This is used to determine if the black 'estimated' bar should go amber
	var nowRounded = toHalfHour(new Date(now)); // round the current date/time to the half hour
	var startDate = nlapiAddDays(nowRounded, -1); //define the start date of the ops board
	var endDate = nlapiAddDays(nowRounded, +1); //define the end date of the ops board
	var opsSearchResults = getOpsSearchResults(startDate, endDate); //get the sector records to put on the ops board
	var opsAircraft = {}; //object to hold list of aircraft
	var opsBoard = {}; //object to hold the ops board data
	
	//=============================================================================================
	// Main Code
	//=============================================================================================
	//
	
	//Get request
	//
	if (request.getMethod() == 'GET') 
	{
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
						
						opsBoard[opsBoardKeyEstimated] = makeCellArray(startDate, endDate, nowRounded);
						opsBoard[opsBoardKeyActual] = makeCellArray(startDate, endDate, nowRounded);
					}
				
				//Now we have an empty ops board, we need to start to fill in the data by looping through the results
				//
				for (var int = 0; int < opsSearchResults.length; int++) 
					{
						//Build the key to reference the estimated line on the ops board
						//
						var opsKey = opsSearchResults[int].getValue("custrecord_fw_acreg") + '|' + 'ESTIMATED';
						
						//Fill in the aircraft details for the left hand column on the board
						//
						updateOpsBoardWithAircraft(opsBoard, opsKey, opsSearchResults[int], 'E'); //Ops Board Object, Ops Board Key, Search Results Row, Row type
						
						//Fill in the flight details in the ops board
						//
						updateOpsBoardWithFlight(opsBoard, opsKey, opsSearchResults[int], 'E', now); //Ops Board Object, Ops Board Key, Search Results Row, Type (E=ESTIMATED, A=Actual)
						
						
						//Build the key to reference the actual line on the ops board
						//
						var opsKey = opsSearchResults[int].getValue("custrecord_fw_acreg") + '|' + 'ACTUAL';
						
						//Fill in the aircraft details for the left hand column on the board
						//
						updateOpsBoardWithAircraft(opsBoard, opsKey, opsSearchResults[int], 'A'); //Ops Board Object, Ops Board Key, Search Results Row, Row type
						
						//Fill in the flight details in the ops board
						//
						updateOpsBoardWithFlight(opsBoard, opsKey, opsSearchResults[int], 'A', now); //Ops Board Object, Ops Board Key, Search Results Row, Type (E=ESTIMATED, A=Actual)
						
					}
				
				//Convert the data into html
				//
				html = convertDataToHtml(opsBoard, now);
			}

		response.write(html);
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
			
			if(this.cellIsNow)
				{
					borders = 'border-color: black black black ' + HTMLCOLOURYELLOW + '; border-left: 3px solid ' + HTMLCOLOURYELLOW;
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
		
		if(this.cellIsNow)
			{
				borders = 'border-color: black black black yellow; border-left: 3px solid yellow';
				text = "<td align=\"center\"style=\"font-size: " + this.cellTextSize + "; background-color: " + this.cellBackgroundColour + "; color: " + this.cellTextColour + "; " + borders + "\">" + this.cellText + "</td>";
			}
		else
			{
				if(this.cellBackgroundColour != HTMLCOLOURWHITE)
					{
						borders = "border-right: 1px solid " + this.cellBackgroundColour + "; border-left: 1px solid " + this.cellBackgroundColour + ";";
						text = "<td align=\"center\" style=\"font-size: " + this.cellTextSize + ";background-color: " + this.cellBackgroundColour + "; color: " + this.cellTextColour + "; " + borders + "\">" + this.cellText + "</td>";
					}
				else
					{
						borders = 'border-color: black 1px solid;';
						text = "<td align=\"center\" style=\"fnt-size: " + this.cellTextSize + ";background-color: " + this.cellBackgroundColour + "; color: " + this.cellTextColour + "; " + borders + "\">" + this.cellText + "</td>";					
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
	
	this.getInfoHtmlLine = function()
	{
		var text = '';
		
		if(this.rowType == 'E')
			{
				text = "<td width=\"200px\">" + this.aircraftReg + "&nbsp;&nbsp;&nbsp;(" + this.aircraftNo + ")</td>";
			}

		if(this.rowType == 'A')
			{
				text = "<td width=\"200px\">" + this.fixtureRef + "&nbsp;&nbsp;&nbsp;(" + this.sectorType + ")</td>";
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
function convertDataToHtml(_opsBoard, _now)
{
	var content = ''
	
	//Work out how deep the table should be
	//
	var opsLines = Number(0);
	
	for ( var opsKeys in _opsBoard) 
		{
			opsLines++;
		}	
	
	var tableDepth = (Number(30) * opsLines) + 10;
	tableDepth = (tableDepth > 10000 ? 10000 : tableDepth); //set the max table depth to 10,000 pixels 
	
	content += "<html>";
	content += "<head>";
	
	//Scripting
	//
	content += "<script src=\"https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js\"></script>";
	content += "<script>";
	content += "$(document).ready(function() {";
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
	content += "  width: 1920px;";
	content += "  background-color: #aaa;";
	content += "  overflow: hidden;";
	content += "  border-collapse: collapse;";
	content += "}";
	content += "thead {";
	content += "  position: relative;";
	content += "  display: block; ";
	content += "  width: 1920px;";
	content += "  overflow: visible;";
	content += "}";
	content += "thead th {";
	content += "  background-color: #ffffff; ";
	content += "  min-width: 50px;";
	content += "  height: 30px;";
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
	content += "  width: 1920px;";
	//content += "  height: 239px;";
	content += "  height: " + tableDepth.toString() + "px;";
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
	content += "  height: 30px;";
	content += "  background-color: #ffffff; ";
	content += "}";	
	content += "</style>";
	
	content += "</head>";
	
	//Start of body section
	//
	content += "<body>";
	content += "  <table>";
	content += "    <thead>";
	
	
	//Construct the header info which will be the cells and their times 
	//
	var firstOpsBoardKey = Object.keys(_opsBoard)[0]; 
	var yesterdaysDate = new Date(_now);
	var tomorrowsDate = new Date(_now);
	yesterdaysDate.setDate(yesterdaysDate.getDate() - 1);
	tomorrowsDate.setDate(yesterdaysDate.getDate() + 1);
	
	
	content += "<tr>";
	content += "<th>&nbsp;</th>";
	//content += "<th align=\"center\" colspan=\"" + MAXOPSBOARDSIZE + "\">" + _now.format('D d F Y') + "</th>";
	content += "<th align=\"center\" colspan=\"32\">" + yesterdaysDate.format('D d F Y') + "</th>";
	content += "<th align=\"center\" colspan=\"48\">" + _now.format('D d F Y H:i') + " UTC</th>";
	content += "<th align=\"center\" colspan=\"17\">" + tomorrowsDate.format('D d F Y') + "</th>";
	content += "</tr>";
	
	content += "<tr>";
	content += "<th width=\"200px\">Ops Board v1.0.0.1</th>";
	
	for (var headerCell = 1; headerCell < _opsBoard[firstOpsBoardKey].length; headerCell++) 
		{
			content += _opsBoard[firstOpsBoardKey][headerCell].getHeaderHtml();
		}
	
	content += "      </tr>";
	content += "    </thead>";
	
	//Construct the table body
	//
	content += "    <tbody>";
	
	for ( var opsKey in _opsBoard) 
		{
			content += "<tr>";
		
			for (var bodyCell = 0; bodyCell < _opsBoard[opsKey].length; bodyCell++) 
				{
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

	content += "    </tbody>";
	content += "  </table>";
	
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
	
	//uobwfSectorHyperlink = _results.getValue(_results.getAllColumns()[SEARCHCOLSECTORHYPERLINK]);
	//uobwfFixtureHyperlink = _results.getValue(_results.getAllColumns()[SEARCHCOLFIXTUREHYPERLINK]);
	
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
					_opsBoard[_opsKey][cellCounter].cellText = "<a style=\"text-decoration: none; color: " + blockColour + ";\"href=\"/app/accounting/transactions/salesord.nl?id=" + uobwfFixtureHyperlink + " \"target=\"_blank\">link</a>";
					
					//If we are on the first cell of the bar, the add the departure time to the cell text
					//
					if(cellCounter == startCellNumber)
						{
							//_opsBoard[_opsKey][cellCounter].cellText = beforeStartMarker + uobwfDepartureTime;
							_opsBoard[_opsKey][cellCounter].cellText = "<a style=\"text-decoration: none; color: " + HTMLCOLOURWHITE + ";\"href=\"/app/accounting/transactions/salesord.nl?id=" + uobwfFixtureHyperlink + " \"target=\"_blank\">" + beforeStartMarker + uobwfDepartureTime + "</a>";
						}
					
					//If we are on the last cell of the bar, the add the arrival time to the cell text
					//
					if(cellCounter == endCellNumber)
						{
							//_opsBoard[_opsKey][cellCounter].cellText = uobwfArrivalTime + afterEndMarker;
							_opsBoard[_opsKey][cellCounter].cellText = "<a style=\"text-decoration: none; color: " + HTMLCOLOURWHITE + ";\"href=\"/app/accounting/transactions/salesord.nl?id=" + uobwfFixtureHyperlink + " \"target=\"_blank\">" + uobwfArrivalTime + afterEndMarker + "</a>";
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
	
	//Processing for an ACTUAL line on the ops board
	//
	if(_type == 'A')
		{
			if(uobwfOffBlockDate != null && uobwfOffBlockDate !== '')
				{
					//Join the off block date & time together & then round to the nearest 30 mins
					//
					var uobwOffBlockDateTime = toHalfHour(joinDateTime(uobwfOffBlockDate, uobwfOffBlockTime));
					
					//Join the on block date & time together & then round to the nearest 30 mins
					//
					var uobwOnBlockDateTime = toHalfHour(joinDateTime(uobwfOnBlockDate, uobwfOnBlockTime));
					
					//Find the start and end cell in the ops board
					//
					var startCellNumber = findCellByDate(_opsBoard, _opsKey, uobwOffBlockDateTime);
					var endCellNumber = findCellByDate(_opsBoard, _opsKey, uobwOnBlockDateTime);
					
					//If the start cell has come back as zero, then we must have started before the ops board range, therefore set the start to be cell 1
					//If the end cell has come back as zero, then we must have ended after the ops board range, therefore set the start to be cell 97
					//Also set up a little marker to indicate that the time is actually off the start/end of the ops board when displaying on the bar
					//
					var beforeStartMarker = (startCellNumber == 0 ? '<' : '');
					var afterEndMarker = (endCellNumber == 0 ? '>' : '');
					
					startCellNumber = (startCellNumber == 0 ? 1 : startCellNumber); 
					endCellNumber = (endCellNumber == 0 ? MAXOPSBOARDSIZE : endCellNumber); 
					
					var blockColour = HTMLCOLOURGREEN;
						
					//Fill in the flight bar between the start and the end cells
					//
					for (var cellCounter = startCellNumber; cellCounter <= endCellNumber; cellCounter++) 
						{
							_opsBoard[_opsKey][cellCounter].cellTextColour = HTMLCOLOURWHITE;
							_opsBoard[_opsKey][cellCounter].cellBackgroundColour = blockColour;
							_opsBoard[_opsKey][cellCounter].cellHyperlink = uobwfSectorHyperlink;
							_opsBoard[_opsKey][cellCounter].cellText = "<a style=\"text-decoration: none; color: " + blockColour + ";\" href=\"/app/common/custom/custrecordentry.nl?rectype=34&id=" + uobwfSectorHyperlink + " \"target=\"_blank\">link</a>";
							
							//If we are on the first cell of the bar, the add the departure time to the cell text
							//
							if(cellCounter == startCellNumber)
								{
									//_opsBoard[_opsKey][cellCounter].cellText = beforeStartMarker + uobwfOffBlockTime;
									_opsBoard[_opsKey][cellCounter].cellText = "<a style=\"text-decoration: none; color: " + HTMLCOLOURWHITE + ";\" href=\"/app/common/custom/custrecordentry.nl?rectype=34&id=" + uobwfSectorHyperlink + " \"target=\"_blank\">" + beforeStartMarker + uobwfOffBlockTime + "</a>";
									
								}
							
							//If we are on the last cell of the bar, the add the arrival time to the cell text
							//
							if(cellCounter == endCellNumber)
								{
									//_opsBoard[_opsKey][cellCounter].cellText = uobwfOnBlockTime + afterEndMarker;
									_opsBoard[_opsKey][cellCounter].cellText = "<a style=\"text-decoration: none; color: " + HTMLCOLOURWHITE + ";\"  href=\"/app/common/custom/custrecordentry.nl?rectype=34&id=" + uobwfSectorHyperlink + " \"target=\"_blank\">" + uobwfOnBlockTime + afterEndMarker + "</a>";
									
								}
						}
				}
		}
}


// Set the aircraft details on the ops board line
//
function updateOpsBoardWithAircraft(_opsBoard, _opsKey, _results, _rowType)
{
	_opsBoard[_opsKey][0].aircraftReg = _results.getValue("custrecord_fw_acreg");
	_opsBoard[_opsKey][0].aircraftNo = _results.getValue("custrecord_fw_acno");
	_opsBoard[_opsKey][0].fixtureRef = _results.getText("custrecord_sector_fixture");
	_opsBoard[_opsKey][0].sectorType = _results.getText("custrecord_sector_type");
	_opsBoard[_opsKey][0].rowType = _rowType;
}


// Get the sectors to process
//
function getOpsSearchResults(_startDate, _endDate)
{
	var customrecord_fs_sectorsSearch = nlapiSearchRecord("customrecord_fs_sectors",null,
			[
//TODO Use the start & end date rather than hard code them  ["custrecord_sector_departuredate","within", nlapiDateToString(_startDate), nlapiDateToString(_endDate)], 
			   ["internalid","anyof",["117736","118041"]],
			   "AND", 
			   ["custrecord_sector_fixture.mainline","is","T"]
			], 
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
			   new nlobjSearchColumn("internalid")
			]
			);
	
	return customrecord_fs_sectorsSearch;
}


// Makes an array of objects that represents one complete row of ops board cells between the start & end dates
//
function makeCellArray(_startDate, _endDate, _nowDate)
{
	var HALF_HOUR_IN_MS = 1800000;
	
	var cellArray = new Array();
	var loopDate = _startDate;

	cellArray.push(new opsInfoCell());
	
	while (loopDate <= _endDate) 
	{
		cellArray.push(new opsCell(loopDate,(loopDate.getTime() == _nowDate.getTime() ? true : false)));
	   
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