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
//=============================================================================
// Main code
//=============================================================================
//
function suitelet(request, response)
{
	//Declare variables
	//
	var html = '';
	var now = convertDateToUTC(new Date()); // work out the current date/time as UTC
	var nowRounded = toHalfHour(now); // round the current date/time to the half hour
	var startDate = nlapiAddDays(nowRounded, -1); //define the start date of the ops board
	var endDate = nlapiAddDays(nowRounded, +1); //define the end date of the ops board
	var opsSearchResults = getOpsSearchResults(startDate, endDate); //get the record to put on the ops board
	var opsAircraft = {}; //object to hold list of aircraft
	var opsBoard = {}; //object to hold the ops board data
	
	
	//Get request
	//
	//if (request.getMethod() == 'GET') 
	//{
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
						updateOpsBoardWithAircraft(opsBoard, opsKey, opsSearchResults[int]); //Ops Board Object, Ops Board Key, Search Results Row
						
						//Fill in the flight details in the ops board
						//
						updateOpsBoardWithFlight(opsBoard, opsKey, opsSearchResults[int], 'E'); //Ops Board Object, Ops Board Key, Search Results Row, Type (E=ESTIMATED, A=Actual)
						
						
					}
				
				
				
			}
		

		

		
	//	response.write(html);
	//}
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
	this.cellIsNow = _cellIsNow;
	this.cellHyperlink = '';
	this.cellBackgroundColour = '';
}

// Represents a single ops board aircraft info cell which will be the first cell in the row
//
function opsInfoCell()
{
	this.aircraftReg = '';
	this.aircraftNo = '';
	this.fixtureRef = '';
	this.sectorType = '';
}


//=============================================================================
// Functions
//=============================================================================
//

//Set the flight details on the ops board line, _type (E=ESTIMATED, A=Actual) 
//
function updateOpsBoardWithFlight(_opsBoard, _opsKey, _results, _type)
{
	
}

// Set the aircraft details on the ops board line
//
function updateOpsBoardWithAircraft(_opsBoard, _opsKey, _results)
{
	_opsBoard[_opsKey][0].aircraftReg = _results.getValue("custrecord_fw_acreg");
	_opsBoard[_opsKey][0].aircraftNo = _results.getValue("custrecord_fw_acno");
	_opsBoard[_opsKey][0].fixtureRef = _results.getText("custrecord_sector_fixture");
	_opsBoard[_opsKey][0].sectorType = _results.getText("custrecord_sector_type");
}

// Get the sectors to process
//
function getOpsSearchResults(_startDate, _endDate)
{
	//TODO
	//Use the start & end date rather than hard code them
	//
	var customrecord_fs_sectorsSearch = nlapiSearchRecord("customrecord_fs_sectors",null,
			[
			   ["custrecord_sector_departuredate","within","28-Aug-2018","29-Aug-2018"], 
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

