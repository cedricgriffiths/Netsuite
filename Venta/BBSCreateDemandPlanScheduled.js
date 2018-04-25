
/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
	//=============================================================================
	// Constants
	//=============================================================================
	//
	const OPPORTUNITY_RESULTSET_ENTITY = 'item';
	const OPPORTUNITY_RESULTSET_SEARCH = 'customsearch136';

	const SALES_RESULTSET_ENTITY = 'item';
	const SALES_RESULTSET_SEARCH = 'customsearch135';

	const RESULT_COL_ITEM = Number(0);
	const RESULT_COL_MONTH_1 = Number(1);
	const RESULT_COL_MONTH_2 = Number(2);
	const RESULT_COL_MONTH_3 = Number(3);
	const RESULT_COL_MONTH_4 = Number(4);
	const RESULT_COL_MONTH_5 = Number(5);
	const RESULT_COL_MONTH_6 = Number(6);
	const RESULT_COL_MONTH_7 = Number(7);
	const RESULT_COL_MONTH_8 = Number(8);
	const RESULT_COL_MONTH_9 = Number(9);
	const RESULT_COL_MONTH_10 = Number(10);
	const RESULT_COL_MONTH_11 = Number(11);
	const RESULT_COL_MONTH_12 = Number(12);
	
	const DEMAND_SUBSIDIARY = 1;
	const DEMAND_LOCATION = 1;
	const DEMAND_TYPE = 'MONTHLY';
	


function createDemandPlanScheduled(type) 
{
	//=============================================================================
	// Prototypes
	//=============================================================================
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

	Number.prototype.padLeft = function(base, chr) {
		var len = (String(base || 10).length - String(this).length) + 1;
		return len > 0 ? new Array(len).join(chr || '0') + this : this;
	}


	//=============================================================================
	// Local variables
	//=============================================================================
	//
	var opportunityColumns = null;
	var salesColumns = null;
	var combinedResults = {};
	
	
	//=============================================================================
	// Get the opportunity & sales results
	//=============================================================================
	//
	var opportunityResults = getFullResults(OPPORTUNITY_RESULTSET_ENTITY, OPPORTUNITY_RESULTSET_SEARCH);
	var salesResults = getFullResults(SALES_RESULTSET_ENTITY, SALES_RESULTSET_SEARCH);
	
	
	//=============================================================================
	// Process the opportunity results
	//=============================================================================
	//
	checkResources();
	
	for (var int = 0; int < opportunityResults.length; int++) 
		{
			if(int == 0)
				{
					opportunityColumns = opportunityResults[int].getAllColumns();
				}
			
			var opportunityItem = opportunityResults[int].getValue(opportunityColumns[RESULT_COL_ITEM]);
			var opportunityMonth1 = Number(opportunityResults[int].getValue(opportunityColumns[RESULT_COL_MONTH_1]));
			var opportunityMonth2 = Number(opportunityResults[int].getValue(opportunityColumns[RESULT_COL_MONTH_2]));
			var opportunityMonth3 = Number(opportunityResults[int].getValue(opportunityColumns[RESULT_COL_MONTH_3]));
			var opportunityMonth4 = Number(opportunityResults[int].getValue(opportunityColumns[RESULT_COL_MONTH_4]));
			var opportunityMonth5 = Number(opportunityResults[int].getValue(opportunityColumns[RESULT_COL_MONTH_5]));
			var opportunityMonth6 = Number(opportunityResults[int].getValue(opportunityColumns[RESULT_COL_MONTH_6]));
			var opportunityMonth7 = Number(opportunityResults[int].getValue(opportunityColumns[RESULT_COL_MONTH_7]));
			var opportunityMonth8 = Number(opportunityResults[int].getValue(opportunityColumns[RESULT_COL_MONTH_8]));
			var opportunityMonth9 = Number(opportunityResults[int].getValue(opportunityColumns[RESULT_COL_MONTH_9]));
			var opportunityMonth10 = Number(opportunityResults[int].getValue(opportunityColumns[RESULT_COL_MONTH_10]));
			var opportunityMonth11 = Number(opportunityResults[int].getValue(opportunityColumns[RESULT_COL_MONTH_11]));
			var opportunityMonth12 = Number(opportunityResults[int].getValue(opportunityColumns[RESULT_COL_MONTH_12]));
			
			combinedResults[opportunityItem] = [opportunityMonth1,opportunityMonth2,opportunityMonth3,opportunityMonth4,opportunityMonth5,opportunityMonth6,opportunityMonth7,opportunityMonth8,opportunityMonth9,opportunityMonth10,opportunityMonth11,opportunityMonth12];
			
		}
	
	
	//=============================================================================
	// Process the sales results
	//=============================================================================
	//
	checkResources();
	
	for (var int = 0; int < salesResults.length; int++) 
		{
			if(int == 0)
				{
					salesColumns = salesResults[int].getAllColumns();
				}
			
			var salesItem = salesResults[int].getValue(salesColumns[RESULT_COL_ITEM]);
			var salesMonth1 = Number(salesResults[int].getValue(salesColumns[RESULT_COL_MONTH_1]));
			var salesMonth2 = Number(salesResults[int].getValue(salesColumns[RESULT_COL_MONTH_2]));
			var salesMonth3 = Number(salesResults[int].getValue(salesColumns[RESULT_COL_MONTH_3]));
			var salesMonth4 = Number(salesResults[int].getValue(salesColumns[RESULT_COL_MONTH_4]));
			var salesMonth5 = Number(salesResults[int].getValue(salesColumns[RESULT_COL_MONTH_5]));
			var salesMonth6 = Number(salesResults[int].getValue(salesColumns[RESULT_COL_MONTH_6]));
			var salesMonth7 = Number(salesResults[int].getValue(salesColumns[RESULT_COL_MONTH_7]));
			var salesMonth8 = Number(salesResults[int].getValue(salesColumns[RESULT_COL_MONTH_8]));
			var salesMonth9 = Number(salesResults[int].getValue(salesColumns[RESULT_COL_MONTH_9]));
			var salesMonth10 = Number(salesResults[int].getValue(salesColumns[RESULT_COL_MONTH_10]));
			var salesMonth11 = Number(salesResults[int].getValue(salesColumns[RESULT_COL_MONTH_11]));
			var salesMonth12 = Number(salesResults[int].getValue(salesColumns[RESULT_COL_MONTH_12]));
			
			// See if we have the sales item in the combined results, if not we can just add it
			//
			if(!combinedResults[salesItem])
				{
					combinedResults[salesItem] = [salesMonth1,salesMonth2,salesMonth3,salesMonth4,salesMonth5,salesMonth6,salesMonth7,salesMonth8,salesMonth9,salesMonth10,salesMonth11,salesMonth12];
				}
			else
				{
					// If the item does exist, then we need to see if the sales value is higher than the opportunity value already in the array
					//
					combinedResults[salesItem][0] = (salesMonth1 > combinedResults[salesItem][0] ? salesMonth1 : combinedResults[salesItem][0]);
					combinedResults[salesItem][1] = (salesMonth2 > combinedResults[salesItem][1] ? salesMonth2 : combinedResults[salesItem][1]);
					combinedResults[salesItem][2] = (salesMonth3 > combinedResults[salesItem][2] ? salesMonth3 : combinedResults[salesItem][2]);
					combinedResults[salesItem][3] = (salesMonth4 > combinedResults[salesItem][3] ? salesMonth4 : combinedResults[salesItem][3]);
					combinedResults[salesItem][4] = (salesMonth5 > combinedResults[salesItem][4] ? salesMonth5 : combinedResults[salesItem][4]);
					combinedResults[salesItem][5] = (salesMonth6 > combinedResults[salesItem][5] ? salesMonth6 : combinedResults[salesItem][5]);
					combinedResults[salesItem][6] = (salesMonth7 > combinedResults[salesItem][6] ? salesMonth7 : combinedResults[salesItem][6]);
					combinedResults[salesItem][7] = (salesMonth8 > combinedResults[salesItem][7] ? salesMonth8 : combinedResults[salesItem][7]);
					combinedResults[salesItem][8] = (salesMonth9 > combinedResults[salesItem][8] ? salesMonth9 : combinedResults[salesItem][8]);
					combinedResults[salesItem][9] = (salesMonth10 > combinedResults[salesItem][9] ? salesMonth10 : combinedResults[salesItem][9]);
					combinedResults[salesItem][10] = (salesMonth11 > combinedResults[salesItem][10] ? salesMonth11 : combinedResults[salesItem][10]);
					combinedResults[salesItem][11] = (salesMonth12 > combinedResults[salesItem][11] ? salesMonth12 : combinedResults[salesItem][11]);
				}
		}
	
	
		//=============================================================================
		// Make sure we have demand plan records for all the items
		//=============================================================================
		//
		createPlans(combinedResults);
		
		
		//=============================================================================
		// Update the demand plans
		//=============================================================================
		//
		updatePlans(combinedResults);
		
		//=============================================================================
		// Email the user
		//=============================================================================
		//
		var context = nlapiGetContext();
		var usersEmail = context.getUser();
		var emailMessage = 'Item demand plan updates have been completed\n';
		
		nlapiSendEmail(usersEmail, usersEmail, 'Item Demand Planning', emailMessage);
}


//=============================================================================
// Functions
//=============================================================================
//
function updatePlans(results)
{
	var startDate = new Date();
	var startYear = Number(startDate.format('Y'));
	var startMonth = Number(startDate.format('m'));
	var startDay = '01';
	var startDateString = startDay + '/' + startDate.format('m') + '/' + startDate.format('Y');

	var endDate = new Date(startYear, startMonth + 11, 0);
	var endDateString = endDate.format('d') + '/' + endDate.format('m') + '/' + endDate.format('Y');

	// Loop through the items
	//
	for ( var item in results) 
		{
			checkResources();
		
			// Find the demand plan record 
			//
			var itemdemandplanSearch = nlapiSearchRecord("itemdemandplan",null,
					[
					   ["subsidiary","anyof",DEMAND_SUBSIDIARY], 
					   "AND", 
					   ["location","anyof",DEMAND_LOCATION], 
					   "AND", 
					   ["item","anyof",item]
					], 
					[
					   new nlobjSearchColumn("item").setSort(false), 
					]
					);
			
			// Have we found it
			//
			if(itemdemandplanSearch && itemdemandplanSearch.length == 1)
				{
					// Get the id of the demand plan
					//
					var recordId = itemdemandplanSearch[0].getId();
					
					try
						{
							var record = nlapiLoadRecord('itemdemandplan', recordId, {recordmode: 'dynamic'});
							
							record.setFieldValue('startdate',startDateString);
							record.setFieldValue('enddate',endDateString);
							 
							var monthlyValues = results[item];
							
							for (var int = 0; int < monthlyValues.length; int++) 
								{
									record.selectLineItem('demandplandetail', int + 1);
									record.setCurrentLineItemMatrixValue('demandplandetail', 'quantity', '1', monthlyValues[int]);
								}
		                 
							var id = nlapiSubmitRecord(record,true);
						}
					catch(err)
						{
							
						}
				}
		}
}

function createPlans(results)
{
	var todaysDate = new Date();
	var thisYear = Number(todaysDate.format('Y'));
	var thisYearStart = '01/01/' + thisYear.toString();
	var thisYearEnd = '31/12/' + thisYear.toString();
	
	for ( var item in results) 
		{
			checkResources();
		
			try
				{
					var record = nlapiCreateRecord('itemdemandplan', {recordmode: 'dynamic'});
					record.setFieldValue('demandplancalendartype',DEMAND_TYPE);
					 
					record.setFieldValue('subsidiary', DEMAND_SUBSIDIARY);
					record.setFieldValue('location', DEMAND_LOCATION);
					record.setFieldValue('item', item); 
					record.setFieldValue('startdate',thisYearStart);
					record.setFieldValue('enddate',thisYearEnd);
    
					var id = nlapiSubmitRecord(record,true);
				}
			catch(err)
				{
					
				}
		}
}
	
function getFullResults(entity, search) 
{
	//Copy the existing saved search so we can page through it
	//
	var origSearch = nlapiLoadSearch(entity, search);
	var newSearch = nlapiCreateSearch(origSearch.getSearchType(), origSearch.getFilters(), origSearch.getColumns());
	var searchResult = newSearch.runSearch();

	//Get the initial set of results
	//
	var start = 0;
	var end = 1000;
	var searchResultSet = searchResult.getResults(start, end);
	var resultlen = searchResultSet.length;

	//If there is more than 1000 results, page through them
	//
	while (resultlen == 1000) {

		start += 1000;
		end += 1000;

		var moreSearchResultSet = searchResult.getResults(start, end);
		resultlen = moreSearchResultSet.length;

		searchResultSet = searchResultSet.concat(moreSearchResultSet);
	}

	return searchResultSet;
}

function checkResources()
{
	var remaining = parseInt(nlapiGetContext().getRemainingUsage());
	
	if(remaining < 100)
		{
			nlapiYieldScript();
		}
}
