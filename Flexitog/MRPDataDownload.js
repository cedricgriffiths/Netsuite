/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       06 May 2016     cedric
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
{
	var FORM_HEADER = 'Predicted Inventory Export';
	var FORM_WEEKS_FIELD = 'custpage_weeks';
	var FORM_WEEKS_DEFAULT = '26';
	var FORM_WEEKS_LABEL = 'Export Data';

	var PRODUCT_RESULTSET_ENTITY = 'item';
	var PRODUCT_RESULTSET_SEARCH = 'customsearch_bbs_flexitog_rep1';

	var DUEIN_RESULTSET_ENTITY = 'transaction';
	var DUEIN_RESULTSET_SEARCH = 'customsearch_bbs_flexitog_rep3';

	var DEMAND_RESULTSET_ENTITY = 'itemdemandplan';
	var DEMAND_RESULTSET_SEARCH = 'customsearch_bbs_flexitog_rep2';

	var COLS_ONHAND = Number(0);
	var COLS_DUEIN = Number(1);
	var COLS_DEMAND = Number(2);
	var COLS_TOTAL = Number(3);
	var COLS_PARENT = Number(4);
	var COLS_STARTDATE = Number(5);
	var COLS_SAFETY = Number(6);
}

function getFullResults(entity, search) {

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

function getDateOfISOWeek(w, y) {
	var simple = new Date(y, 0, 1 + (w - 1) * 7);
	var dow = simple.getDay();
	var ISOweekStart = simple;
	if (dow <= 4)
		ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
	else
		ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
	return ISOweekStart;
}

function MRPDownloadSuitelet(request, response) {

	if (request.getMethod() == 'GET') {

		var form = nlapiCreateForm(FORM_HEADER);

		var weeksField = form.addField(FORM_WEEKS_FIELD, 'integer', 'No of Weeks');
		weeksField.setDefaultValue(FORM_WEEKS_DEFAULT);

		form.addSubmitButton(FORM_WEEKS_LABEL);

		response.writePage(form);
	}
	else {

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

		//Get the range of weeks & calc end week no
		//
		var weeksRange = Number(request.getParameter(FORM_WEEKS_FIELD));

		var todaysDate = new Date();
		var year = todaysDate.getFullYear().toString();
		var month = todaysDate.getMonth().toString();
		//var day = '01';
		var day = todaysDate.getDate().toString();
		var currentDate = new Date(year, month, day);

		var currentWeek = Number(currentDate.format('W'));
		var endWeeks = currentWeek + weeksRange;

		var rows = {};

		//Get the data for the products here
		//We should have an array of products
		//
		//var productsResultSet = nlapiSearchRecord(PRODUCT_RESULTSET_ENTITY, PRODUCT_RESULTSET_SEARCH, null, null);

		var productsResultSet = getFullResults(PRODUCT_RESULTSET_ENTITY, PRODUCT_RESULTSET_SEARCH);

		if (productsResultSet) {

			//Loop round all of the products in the result set
			//
			for (var int = 0; int < productsResultSet.length; int++) {

				//Loop round the week numbers 
				//
				var startDate = new Date(year, month, day); //new Date();

				for (var int2 = currentWeek; int2 <= endWeeks; int2++) {

					//Year + week no makes up the date part of the key
					//
					var dateKey = startDate.format('Y') + startDate.format('W');
					var weekStartDate = getDateOfISOWeek(startDate.format('W'), startDate.format('Y'));

					var weekStartString = [ weekStartDate.getDate().padLeft(), (weekStartDate.getMonth() + 1).padLeft(), weekStartDate.getFullYear() ].join('/');

					//Product key is product + date key
					//
					var productKey = productsResultSet[int].getValue('itemid') + '|' + dateKey;

					//Some dummy data for the data element of the key/value pair
					//
					var cols = [ 0, 0, 0, 0, '', weekStartString, 0 ]; //Need to define how many columns we need (onhand, duein, demand, total, parent, week start date, safety stock)

					cols[COLS_PARENT] = productsResultSet[int].getText('parent');
					cols[COLS_SAFETY] = productsResultSet[int].getValue('locationsafetystocklevel');

					//Add the on hand to the first row 
					//
					if (int2 == currentWeek) {

						cols[COLS_ONHAND] = Number(productsResultSet[int].getValue('formulanumeric'));
					}

					//Add the empty column data as the 'value' element to the key-value pair
					//
					rows[productKey] = cols;

					//Increment the start date by another week
					//
					startDate.setDate(startDate.getDate() + 7);
				}
			}
		}

		//Process due in's
		//
		//var dueInResultSet = nlapiSearchRecord(DUEIN_RESULTSET_ENTITY, DUEIN_RESULTSET_SEARCH, null, null);

		var dueInResultSet = getFullResults(DUEIN_RESULTSET_ENTITY, DUEIN_RESULTSET_SEARCH);

		if (dueInResultSet) {

			for (var int = 0; int < dueInResultSet.length; int++) {

				//Work out the product/date key
				//
				var product = dueInResultSet[int].getText('item', null, 'group');
				var date = dueInResultSet[int].getValue('formulatext', null, 'group');
				var quantity = Number(dueInResultSet[int].getValue('formulanumeric', null, 'sum'));
				var productKey = product + '|' + date;

				//Try to find the product/date in the key-value pair & update the due in
				//
				if (rows[productKey]) {

					rows[productKey][COLS_DUEIN] = quantity;
				}
			}
		}

		//Process demand 
		//

		//var demandResultSet = nlapiSearchRecord(DEMAND_RESULTSET_ENTITY, DEMAND_RESULTSET_SEARCH, null, null);

		var demandResultSet = getFullResults(DEMAND_RESULTSET_ENTITY, DEMAND_RESULTSET_SEARCH);

		if (demandResultSet) {

			for (var int = 0; int < demandResultSet.length; int++) {

				//Work out the product/date key
				//
				var product = demandResultSet[int].getText('item', null, 'group');
				var date = demandResultSet[int].getValue('formulatext', null, 'group');
				var quantity = Number(demandResultSet[int].getValue('quantity', null, 'sum'));
				var productKey = product + '|' + date;

				//Try to find the product/date in the key-value pair & update the due in
				//
				if (rows[productKey]) {

					rows[productKey][COLS_DEMAND] = quantity;
				}
			}
		}

		//Calculate totals by looping through the array
		//
		var previousProduct = '';
		var runningTotal = Number(0);

		for ( var key in rows) {

			var currentProduct = key.split('|')[0];

			var total = Number(0);

			if (previousProduct != currentProduct) {

				total = Number(rows[key][COLS_ONHAND]) + Number(rows[key][COLS_DUEIN]) - Number(rows[key][COLS_DEMAND]); //On hand + due in - demand
				rows[key][COLS_TOTAL] = total;

				previousProduct = currentProduct;
				runningTotal = total;
			}
			else {
				rows[key][COLS_ONHAND] = runningTotal;

				runningTotal += (Number(rows[key][COLS_DUEIN]) - Number(rows[key][COLS_DEMAND])); //previous total + due in - demand
				rows[key][COLS_TOTAL] = runningTotal;

			}
		}

		//Extract out the data array to a string & then return as a csv
		//
		var contents = 'Parent,Product,DateKey,WeekStartDate,Safety,OnHand,DueIn,Demand,Balance\n';

		for ( var key in rows) {
			var keyString = key;

			contents += rows[key][COLS_PARENT] + ',' + keyString.split('|') + ',' + rows[key][COLS_STARTDATE] + ',' + rows[key][COLS_SAFETY] + ',' + rows[key][COLS_ONHAND] + ',' + rows[key][COLS_DUEIN] + ',' + rows[key][COLS_DEMAND] + ',' + rows[key][COLS_TOTAL] + '\n';
		}

		// Send back the output in the respnse message
		//
		response.setContentType('CSV', 'PredictedInventoryExport.csv', 'attachment');
		response.write(contents);
	}
}
