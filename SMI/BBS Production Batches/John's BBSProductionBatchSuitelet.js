/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       03 Mar 2017     cedricgriffiths
 *
 */


//=============================================================================================
//Configuration
//=============================================================================================
//	

	
/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function productionBatchSuitelet(request, response)
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
	//Start of main code
	//=============================================================================================
	//
	
	var PRINT_PRODUCTION_BATCH = (nlapiGetContext().getPreference('custscript_bbs_prodbatch_detail') == 'T' ? true : false);
	var PRINT_CONSOLIDATED_BASE_ITEMS = (nlapiGetContext().getPreference('custscript_bbs_prodbatch_base') == 'T' ? true : false);
	var PRINT_CONSOLIDATED_FINISHED_ITEMS = (nlapiGetContext().getPreference('custscript_bbs_prodbatch_finish') == 'T' ? true : false);
	var MAX_BATCH_SIZE = Number(nlapiGetContext().getPreference('custscript_bbs_prodbatch_size'));

	nlapiLogExecution('DEBUG', 'Max Batch Size', MAX_BATCH_SIZE);
	
	if(isNaN(MAX_BATCH_SIZE) || MAX_BATCH_SIZE > 30 || MAX_BATCH_SIZE == 0)
		{
			MAX_BATCH_SIZE = Number(30);
		}
	
	if (request.getMethod() == 'GET') 
	{
		//Get request - so return a form for the user to process
		//
		
		//Get parameters
		//
		var productionBatchId = request.getParameter('productionbatchid');
		var belongsToId = request.getParameter('belongstoid');
		var customerId = request.getParameter('customerid');
		var stage = Number(request.getParameter('stage'));
		var logoType = request.getParameter('logotype');
		var logoTypeText = request.getParameter('logotypetext');
		var mode = request.getParameter('mode'); //U = update existing production batch, C = create a production batch
		var soLink = request.getParameter('solink'); // T/F - choose to select w/o that are/are not linked to sales orders
		var soCommitStatus = request.getParameter('socommitstatus'); 
		var soCommitStatusText = request.getParameter('socommitstatustext'); 
		var soId = request.getParameter('soid'); 
		var soText = request.getParameter('sotext'); 
		var batches = request.getParameter('batches'); 
		var woCommitStatus = request.getParameter('wocommitstatus'); 
		var woCommitStatusText = request.getParameter('wocommitstatustext'); 
		var startDate = request.getParameter('startdate');
		var endDate = request.getParameter('enddate');
		var logo = request.getParameter('logo');
		var logoText = request.getParameter('logotext');
		var otherrefnumText = request.getParameter('otherrefnum');
		var salesOrderText = request.getParameter('salesordertext');
		var salesOrderId = request.getParameter('salesorderid');
		var woBuildPercentText = request.getParameter('wobildpercenttext');
		var woBuildPercentId = request.getParameter('wobildpercentid');
		
		// Create a form
		//
		var form = nlapiCreateForm('Assign Works Orders To Production Batch');
		form.setScript('customscript_bbs_pb_suitelet_client');
		
		//Store the current stage in a field in the form so that it can be retrieved in the POST section of the code
		//
		var stageField = form.addField('custpage_stage', 'integer', 'stage');
		stageField.setDisplayType('hidden');
		stageField.setDefaultValue(stage);
		
		//Store the production batch in a field in the form so that it can be retrieved in the POST section of the code
		//
		var productionBatchField = form.addField('custpage_production_batch', 'integer', 'ProductionBatch');
		productionBatchField.setDisplayType('hidden');
		productionBatchField.setDefaultValue(productionBatchId);
		
		//Store the mode in a field in the form so that it can be retrieved in the POST section of the code
		//
		var modeField = form.addField('custpage_mode', 'text', 'Mode');
		modeField.setDisplayType('hidden');
		modeField.setDefaultValue(mode);
		
		//Store the solink in a field in the form so that it can be retrieved in the POST section of the code
		//
		var solinklField = form.addField('custpage_solink', 'text', 'SO Link');
		solinklField.setDisplayType('hidden');
		solinklField.setDefaultValue(soLink);
		
		//Store the so commit status in a field in the form so that it can be retrieved in the POST section of the code
		//
		var soComStatField = form.addField('custpage_so_com_text', 'text', 'SO Commit Text');
		soComStatField.setDisplayType('hidden');
		soComStatField.setDefaultValue(soCommitStatusText);
		
		//Store the wo commit status in a field in the form so that it can be retrieved in the POST section of the code
		//
		var woComStatField = form.addField('custpage_wo_com_text', 'text', 'WO Commit Text');
		woComStatField.setDisplayType('hidden');
		woComStatField.setDefaultValue(woCommitStatusText);
		
		//Store the so text in a field in the form so that it can be retrieved in the POST section of the code
		//
		var soTextField = form.addField('custpage_so_text', 'text', 'SO Text');
		soTextField.setDisplayType('hidden');
		soTextField.setDefaultValue(soText);
		
		//Store the logo type text in a field in the form so that it can be retrieved in the POST section of the code
		//
		var logoTypeTextField = form.addField('custpage_logo_type_text', 'text', 'Logo Type Text');
		logoTypeTextField.setDisplayType('hidden');
		logoTypeTextField.setDefaultValue(logoTypeText);
		
		//Store the logo text in a field in the form so that it can be retrieved in the POST section of the code
		//
		var logoTextField = form.addField('custpage_logo_text', 'text', 'Logo Text');
		logoTextField.setDisplayType('hidden');
		logoTextField.setDefaultValue(logoText);
		
		//Store the sales order text in a field in the form so that it can be retrieved in the POST section of the code
		//
		var salesOrderTextField = form.addField('custpage_sales_order_text', 'text', 'Sales Order Text');
		salesOrderTextField.setDisplayType('hidden');
		salesOrderTextField.setDefaultValue(salesOrderText);
		
		//Store the wo build percentage text in a field in the form so that it can be retrieved in the POST section of the code
		//
		var woBuildPercentTextField = form.addField('custpage_wo_build_percent_text', 'text', 'WO Build Percent Text');
		woBuildPercentTextField.setDisplayType('hidden');
		woBuildPercentTextField.setDefaultValue(woBuildPercentText);
		
		
		var prodBatchTitle = '';
		
		switch (mode)
		{
		//Update an existing production batch with selected works orders
		//
		case 'U':
			
			if (productionBatchId != null && productionBatchId != '')
			{
				var prodBatchRecord = nlapiLoadRecord('customrecord_bbs_assembly_batch', productionBatchId);
				
				if(prodBatchRecord)
					{
						prodBatchTitle = 'Assign Works Orders To Production Batch ' + prodBatchRecord.getFieldValue('custrecord_bbs_bat_description');
					}
			}
			
			break;
		
		//Create production batches from selected works orders
		//
		case 'C':
			
			prodBatchTitle = 'Create Production Batches For Works Orders';
			
			break;
		}
		
		switch(soLink)
		{
		case 'T':
			prodBatchTitle = prodBatchTitle + ' (WO Linked To SO)'
			break;
			
		default:
			prodBatchTitle = prodBatchTitle + ' (WO Not Linked To SO)'
			break;
		}
		
		if(batches != null && batches != '')
			{
			prodBatchTitle = 'Production Batches Created';
			}
		
		form.setTitle(prodBatchTitle);
		
		//Add a field group for optional filters
		//
		var fieldGroup2 = form.addFieldGroup('custpage_grp2', 'Optional Filters');

		//Work out what the form layout should look like based on the stage number
		//
		switch(stage)
		{
		case 1:	
				//Add a select field to pick the customer from
				//
				var customerField = form.addField('custpage_customer_select', 'select', 'Works Order Customer', 'customer', 'custpage_grp2');
				var assemblyBelongsToField = form.addField('custpage_asym_belongs_select', 'select', 'Assembly Belongs To', 'customer','custpage_grp2');
				var logoTypeField = form.addField('custpage_logo_type_select', 'select', 'Logo Type', 'customlist_bbs_item_process_type','custpage_grp2');
				var logoField = form.addField('custpage_logo_select', 'select', 'Logo', null,'custpage_grp2');
				
				var assemblyitemSearch = nlapiCreateSearch("assemblyitem",
						[
						   ["type","anyof","Assembly"], 
						   "AND", 
						   ["matrix","is","F"], 
						   "AND", 
						   ["matrixchild","is","F"], 
						   "AND", 
						   ["isphantom","is","T"]
						], 
						[
						   new nlobjSearchColumn("itemid").setSort(false), 
						   new nlobjSearchColumn("displayname")
						]
						);
				
				var assemblyitemSearchResults = getResults(assemblyitemSearch);
				
				logoField.addSelectOption('', '', true);
				
				if(assemblyitemSearchResults != null && assemblyitemSearchResults.length > 0)
					{
						for (var int = 0; int < assemblyitemSearchResults.length; int++) 
							{
								var assId = assemblyitemSearchResults[int].getId();
								var assName = assemblyitemSearchResults[int].getValue('itemid');
								logoField.addSelectOption(assId, assName, false);
							}
					}
				
				var startDateField = form.addField('custpage_start_date', 'date', 'Ship Date Range From', null,'custpage_grp2');
				var endDateField = form.addField('custpage_end_date', 'date', 'Ship Date Range To', null,'custpage_grp2');
				
				var today = new Date();
				var todayString = nlapiDateToString(today);
				startDateField.setDefaultValue(todayString);
				endDateField.setDefaultValue(todayString);
				startDateField.setLayoutType('normal', 'startcol');
				
				//If we are looking at w/o that are linked to s/o then add specific filters
				//
				if(soLink == 'T')
					{
						var soCommitStatusField = form.addField('custpage_so_commit_select', 'select', 'Sales Order Commitment Status', 'customlist_bbs_commitment_status','custpage_grp2');
						soCommitStatusField.setDisplayType('hidden'); //SMI - Hide sales order commit status
						
						
						var soSelectionField = form.addField('custpage_so_select', 'select', 'Sales Orders', null,'custpage_grp2');
						soSelectionField.setDisplayType('hidden'); //SMI - Hide sales order selection
						
						
//SMI					//Now search the available w/o for s/o numbers
//						//
//						var filterArray = [
//						                   ["mainline","is","T"], 
//						                   "AND", 
//						                   ["type","anyof","WorkOrd"], 
//						                   "AND", 
//						                   ["custbody_bbs_wo_batch","anyof","@NONE@"], 
//						                   "AND", 
//						                   ["status","anyof","WorkOrd:A","WorkOrd:B"],
//						                   "AND",
//						                   ["createdfrom","noneof","@NONE@"]
//						                ];
//						
//						var woSearch = nlapiCreateSearch("transaction", filterArray, 
//								[
//								   new nlobjSearchColumn("createdfrom",null,null)
//								]
//								);
//								
//						var searchResult = woSearch.runSearch();
//				
//						//Get the initial set of results
//						//
//						var start = 0;
//						var end = 1000;
//						var searchResultSet = searchResult.getResults(start, end);
//						var resultlen = searchResultSet.length;
//				
//						//If there is more than 1000 results, page through them
//						//
//						while (resultlen == 1000) 
//							{
//									start += 1000;
//									end += 1000;
//				
//									var moreSearchResultSet = searchResult.getResults(start, end);
//									resultlen = moreSearchResultSet.length;
//				
//									searchResultSet = searchResultSet.concat(moreSearchResultSet);
//							}
//						
//						var soArray = {};
//						
//						//Build up a list of sales order to pick from
//						//
//						for (var int = 0; int < searchResultSet.length; int++) 
//						{
//							var soId = searchResultSet[int].getValue('createdfrom');
//							var soText = searchResultSet[int].getText('createdfrom');
//							
//							if(!soArray[soText])
//								{
//									soArray[soText] = soId;
//								}
//						}
//						
//						//Sort the sales orders
//						//
//						const orderedSalesOrders = {};
//						Object.keys(soArray).sort().forEach(function(key) {
//							orderedSalesOrders[key] = soArray[key];
//						});
//						
//						
//						soSelectionField.addSelectOption( '', '', true);
//						
//						for ( var soKey in orderedSalesOrders) 
//						{
//							soSelectionField.addSelectOption(orderedSalesOrders[soKey], soKey, false);
//						}
						
						//Works Order Commitment Status Filter
						//
						var woCommitStatusField = form.addField('custpage_wo_commit_select', 'select', 'Works Order Commitment Status', 'customlist_bbs_commitment_status','custpage_grp2');

						//Works Order Build Percentage Filter
						//
						var woBuildPercentageField = form.addField('custpage_wo_build_percent_select', 'select', 'Works Order % Buildable', 'customlist_bbs_wo_percent_can_build','custpage_grp2');

						//Sales order otherrefnum Filter
						//
						var soOtherRefNumField = form.addField('custpage_so_otherrefnum_select', 'text', 'Sales Order Reference', null,'custpage_grp2');
						soOtherRefNumField.setLayoutType('normal', 'startcol');
						
						//Sales Orders pending fulfilment
						//
						var salesorderSearch = nlapiSearchRecord("salesorder",null,
								[
								   ["type","anyof","SalesOrd"], 
								   "AND", 
								   ["mainline","is","T"], 
								   "AND", 
								   ["status","anyof","SalesOrd:B"]
								], 
								[
								   new nlobjSearchColumn("tranid").setSort(false)
								]
								);
						
						var salesOrderField = form.addField('custpage_sales_order_select', 'select', 'Sales Order', null, 'custpage_grp2');
						salesOrderField.addSelectOption('0', '', true);
						
						if(salesorderSearch != null && salesorderSearch.length > 0)
							{
								for (var int = 0; int < salesorderSearch.length; int++) 
									{
										var salesOrderId = salesorderSearch[int].getId();
										var salesOrderNumber = salesorderSearch[int].getValue("tranid");
										
										salesOrderField.addSelectOption(salesOrderId, salesOrderNumber, false);
									}
							}
					}
				else
					{
						//Works Order Commitment Status Filter
						//	
						var woCommitStatusField = form.addField('custpage_wo_commit_select', 'select', 'Works Order Commitment Status', 'customlist_bbs_commitment_status','custpage_grp2');
					}
				
				//Add a submit button to the form
				//
				form.addSubmitButton('Select Works Orders');
				
				break;
		
		case 2:	
				//Filter the items to display based on the criteria chosen in stage 1
				//
				var customerField = form.addField('custpage_customer_select', 'text', 'Assembly Customer', null, 'custpage_grp2');
				customerField.setDisplayType('disabled');
				
				if(customerId != '')
					{
						var text = nlapiLookupField('customer', customerId, 'companyname', false);
						customerField.setDefaultValue(text);
					}
				
				var assemblyBelongsToField = form.addField('custpage_asym_belongs_select', 'text', 'Assembly Belongs To', null, 'custpage_grp2');
				assemblyBelongsToField.setDisplayType('disabled');
				
				if(belongsToId != '')
					{
						var text = nlapiLookupField('customer', belongsToId, 'companyname', false);
						assemblyBelongsToField.setDefaultValue(text);
					}
			
				var logoTypeField = form.addField('custpage_logo_type_select', 'text', 'Logo Type', null, 'custpage_grp2');
				logoTypeField.setDisplayType('disabled');
				
				if(logoTypeText != '')
					{
						logoTypeField.setDefaultValue(logoTypeText);
					}
				
				var logoField = form.addField('custpage_logo_select', 'text', 'Logo', null, 'custpage_grp2');
				logoField.setDisplayType('disabled');
				
				if(logoText != '')
					{
						logoField.setDefaultValue(logoText);
					}
				
				var startDateField = form.addField('custpage_start_date', 'date', 'Ship Date Range From', null,'custpage_grp2');
				startDateField.setDisplayType('disabled');
				startDateField.setLayoutType('normal', 'startcol');
				
				if(startDate != '')
					{
						startDateField.setDefaultValue(startDate);
					}
				
				var endDateField = form.addField('custpage_end_date', 'date', 'Ship Date Range To', null,'custpage_grp2');
				endDateField.setDisplayType('disabled');
				
				if(endDate != '')
					{
						endDateField.setDefaultValue(endDate);
					}
				
				if(soLink == 'T')
					{
						var soCommitStatusField = form.addField('custpage_so_commit_select', 'text', 'Sales Order Commitment Status', null, 'custpage_grp2');
						soCommitStatusField.setDisplayType('disabled');
						soCommitStatusField.setDefaultValue(soCommitStatusText);
						soCommitStatusField.setDisplayType('hidden'); //SMI
						
						var soTextField = form.addField('custpage_so_text_select', 'text', 'Sales Order', null, 'custpage_grp2');
						soTextField.setDisplayType('disabled');
						soTextField.setDefaultValue(soText);
						soTextField.setDisplayType('hidden'); //SMI
						
						var woCommitStatusField = form.addField('custpage_wo_commit_select', 'text', 'Works Order Commitment Status', null, 'custpage_grp2');
						woCommitStatusField.setDisplayType('disabled');
						woCommitStatusField.setDefaultValue(woCommitStatusText);
						
						var woBuildPercentageField = form.addField('custpage_wo_build_percent_select', 'text', 'Works Order % Buildable', null, 'custpage_grp2');
						woBuildPercentageField.setDisplayType('disabled');
						woBuildPercentageField.setDefaultValue(woBuildPercentText);
						
						var soOtherRefNumField = form.addField('custpage_so_otherrefnum_select', 'text', 'Sales Order Reference', null, 'custpage_grp2');
						soOtherRefNumField.setDisplayType('disabled');
						soOtherRefNumField.setDefaultValue(otherrefnumText);
						soOtherRefNumField.setLayoutType('normal', 'startcol');
						
						var salesOrderField = form.addField('custpage_sales_order_select', 'text', 'Sales Order', null, 'custpage_grp2');
						salesOrderField.setDisplayType('disabled');
						salesOrderField.setDefaultValue(salesOrderText);
					}
				else
					{
						var woCommitStatusField = form.addField('custpage_wo_commit_select', 'text', 'Works Order Commitment Status', null, 'custpage_grp2');
						woCommitStatusField.setDisplayType('disabled');
						woCommitStatusField.setDefaultValue(woCommitStatusText);
					}
				
				var maxBatchField = form.addField('custpage_max_batch', 'inlinehtml', '', null, 'custpage_grp2');
				maxBatchField.setLayoutType('outsidebelow', 'startrow');
				maxBatchField.setDefaultValue('<p style="font-size:16px; color:DarkRed;">Maximum Batch Count Allowed = ' + MAX_BATCH_SIZE.toString() + '</p>');
				
				var tab = form.addTab('custpage_tab_items', 'Works Orders To Select');
				tab.setLabel('Works Orders To Select');
				
				var tab2 = form.addTab('custpage_tab_items2', '');
				
				form.addField('custpage_tab2', 'text', 'test', null, 'custpage_tab_items2');
				
				var subList = form.addSubList('custpage_sublist_items', 'list', 'Works Orders To Select', 'custpage_tab_items');
				
				subList.setLabel('Works Orders To Select');
				
				//Add a mark/unmark button
				//
				subList.addMarkAllButtons();
				
				
				var listSelect = subList.addField('custpage_sublist_tick', 'checkbox', 'Select', null);
				var listWoNo = subList.addField('custpage_sublist_wo_no', 'text', 'Works Order No', null);
				var listSoNo = subList.addField('custpage_sublist_so_no', 'text', 'Sales Order No', null);
//SMI			var listSoCommitStatus = subList.addField('custpage_sublist_so_status', 'text', 'Sales Order Status', null);
				var listCustomer = subList.addField('custpage_sublist_customer', 'text', 'WO Customer', null);
				var listAssembly = subList.addField('custpage_sublist_assembly', 'text', 'Assembly', null);
				var listBelongs = subList.addField('custpage_sublist_belongs', 'text', 'Assembly Belongs To', null);
				var listQty = subList.addField('custpage_sublist_qty', 'integer', 'Qty Required', null);
				var listShipDate = subList.addField('custpage_sublist_ship_date', 'text', 'Ship Date', null);
				var listDate = subList.addField('custpage_sublist_date', 'text', 'Date Entered', null);
				var listStatus = subList.addField('custpage_sublist_status', 'text', 'WO Commit Status', null);
				var listWoBuildStatus = subList.addField('custpage_sublist_wo_percent_build', 'text', 'WO % Buildable', null);
				
				var listId = subList.addField('custpage_sublist_id', 'text', 'Id', null);
				listId.setDisplayType('hidden');
//SMI			var listFFI = subList.addField('custpage_sublist_ffi', 'text', 'FFI', null);
//SMI			var listFinishType = subList.addField('custpage_sublist_finish_type', 'text', 'Finish Type', null);
				var listSoTranId = subList.addField('custpage_sublist_so_tranid', 'text', 'Sales Order TranId', null);
				listSoTranId.setDisplayType('hidden');
				var listCustEntityId = subList.addField('custpage_sublist_cust_entityid', 'text', 'Customer EntityId', null);
				listCustEntityId.setDisplayType('hidden');
				var listLogoType = subList.addField('custpage_sublist_logo_type', 'text', 'Logo Type', null);
				var listLogo = subList.addField('custpage_sublist_logo', 'text', 'Logo', null);
				var listSoRef = subList.addField('custpage_sublist_so_ref', 'text', 'SO Reference', null);
				
				
				var filterArray = [
				                   ["mainline","is","T"], 
				                   "AND", 
				                   ["type","anyof","WorkOrd"], 
				                   "AND", 
				                   ["custbody_bbs_wo_batch","anyof","@NONE@"], 
				                   "AND", 
				                   ["status","anyof","WorkOrd:A","WorkOrd:B"]
				                ];
				
				if(customerId != '')
					{
						filterArray.push("AND",["entity","anyof",customerId]);
					}
				
				if(belongsToId != '')
					{
						filterArray.push("AND",["item.custitem_bbs_item_customer","anyof",belongsToId]);
					}
				
				if(soLink == 'T')
					{
						if(soId != '')
						{
							filterArray.push("AND",["createdfrom","anyof",soId]);
						}
						else
							{
								filterArray.push("AND",["createdfrom","noneof","@NONE@"]);
							}
					}
				else
					{
						filterArray.push("AND",["createdfrom","anyof","@NONE@"]);
					}	
				
				if(logoType != '')
					{
						filterArray.push("AND",["custbody_bbs_wo_logo_type","anyof",logoType]);
					}
				
				if(logo != '')
					{
						filterArray.push("AND",["custbody_bbs_wo_logo","anyof",logo]);
					}
			
				if(soCommitStatus != '')
					{
						filterArray.push("AND",["createdfrom.custbody_bbs_commitment_status","anyof",soCommitStatus]);
					}
				
				if(woCommitStatus != '')
					{
						filterArray.push("AND",["custbody_bbs_commitment_status","anyof",woCommitStatus]);
					}
				
				if(startDate != '')
					{
						filterArray.push("AND",["createdfrom.shipdate","onorafter",startDate]);
					}
				
				if(endDate != '')
					{
						filterArray.push("AND",["createdfrom.shipdate","onorbefore",endDate]);
					}
				
				if(otherrefnumText != '')
					{
						filterArray.push("AND",["createdfrom.poastext","is",otherrefnumText]);
					}
				
				if(salesOrderId != '' && salesOrderId != '0')
					{
						filterArray.push("AND",["createdfrom","anyof",salesOrderId]);
					}
				
				if(woBuildPercentId != '')
					{
						filterArray.push("AND",["custbody_bbs_wo_percent_can_build","anyof",woBuildPercentId]);
					}
				
				var woSearch = nlapiCreateSearch("transaction", filterArray, 
						[
						   new nlobjSearchColumn("tranid",null,null), 
						   new nlobjSearchColumn("entity",null,null), 
						   new nlobjSearchColumn("item",null,null), 
						   new nlobjSearchColumn("custitem_bbs_item_customer","item",null), 
						   new nlobjSearchColumn("quantity",null,null), 
						   new nlobjSearchColumn("datecreated",null,null), 
						   new nlobjSearchColumn("custbody_bbs_commitment_status",null,null), 
						   new nlobjSearchColumn("createdfrom",null,null),
						   new nlobjSearchColumn("custbody_bbs_commitment_status",null,null), 
//SMI					   new nlobjSearchColumn("custbody_bbs_wo_finish",null,null), 
//SMI					   new nlobjSearchColumn("custbody_bbs_wo_ffi",null,null), 
//SMI					   new nlobjSearchColumn("custbody_bbs_commitment_status","createdFrom",null), 
						   new nlobjSearchColumn("tranid","createdFrom",null), 
						   new nlobjSearchColumn("externalid","customer",null),
						   new nlobjSearchColumn("custbody_bbs_wo_logo_type",null,null), 
						   new nlobjSearchColumn("custbody_bbs_wo_logo",null,null),
						   new nlobjSearchColumn("otherrefnum","createdFrom",null),
						   new nlobjSearchColumn("custbody_bbs_wo_percent_can_build",null,null),
						   new nlobjSearchColumn("shipdate","createdFrom",null)
						]
						);
						
				var searchResult = woSearch.runSearch();
		
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
					
				//Copy the results to the sublist
				//
				var line = Number(0);
				var memberItemRecords = {};
				var fullFinishItems = {};
				
				for (var int = 0; int < searchResultSet.length; int++) 
				{
					line++;
		
					subList.setLineItemValue('custpage_sublist_wo_no', line, searchResultSet[int].getValue('tranid'));
					subList.setLineItemValue('custpage_sublist_so_no', line, searchResultSet[int].getText('createdfrom'));
					subList.setLineItemValue('custpage_sublist_customer', line, searchResultSet[int].getText('entity'));
					subList.setLineItemValue('custpage_sublist_assembly', line, searchResultSet[int].getText('item'));
					subList.setLineItemValue('custpage_sublist_belongs', line, searchResultSet[int].getText('custitem_bbs_item_customer','item'));
					subList.setLineItemValue('custpage_sublist_qty', line, searchResultSet[int].getValue('quantity'));
					subList.setLineItemValue('custpage_sublist_date', line, searchResultSet[int].getValue('datecreated'));
					subList.setLineItemValue('custpage_sublist_status', line, searchResultSet[int].getText('custbody_bbs_commitment_status'));
					subList.setLineItemValue('custpage_sublist_id', line, searchResultSet[int].getId());
//SMI				subList.setLineItemValue('custpage_sublist_ffi', line, searchResultSet[int].getText('custbody_bbs_wo_ffi'));
//SMI				subList.setLineItemValue('custpage_sublist_finish_type', line, searchResultSet[int].getText('custbody_bbs_wo_finish'));
//SMI				subList.setLineItemValue('custpage_sublist_so_status', line, searchResultSet[int].getText('custbody_bbs_commitment_status','createdFrom'));
					subList.setLineItemValue('custpage_sublist_so_tranid', line, searchResultSet[int].getValue('tranid','createdFrom'));
					subList.setLineItemValue('custpage_sublist_cust_entityid', line, searchResultSet[int].getValue('externalid','customer'));
					subList.setLineItemValue('custpage_sublist_logo_type', line, searchResultSet[int].getText('custbody_bbs_wo_logo_type'));
					subList.setLineItemValue('custpage_sublist_logo', line, searchResultSet[int].getText('custbody_bbs_wo_logo'));
					subList.setLineItemValue('custpage_sublist_so_ref', line, searchResultSet[int].getValue('otherrefnum','createdFrom'));
					subList.setLineItemValue('custpage_sublist_wo_percent_build', line, searchResultSet[int].getText('custbody_bbs_wo_percent_can_build'));
					subList.setLineItemValue('custpage_sublist_ship_date', line, searchResultSet[int].getValue("shipdate","createdFrom"));
					
				}
		
				switch(mode)
				{
				case 'C':
					form.addSubmitButton('Create Production Batches');
					
					break;
					
				case 'U':
					form.addSubmitButton('Assign Selected Works Orders');
				
					break;
				}
				
				//form.addField('custpage_remaining', 'text', 'Remaining', null, null).setDefaultValue(nlapiGetContext().getRemainingUsage());
				
				break;
				
			case 3:
			
				var batchesField = form.addField('custpage_batches', 'text', 'Batches', null, null);
				batchesField.setDisplayType('hidden');
				batchesField.setDefaultValue(batches);
				
				var warningField = form.addField('custpage_warning', 'inlinehtml', null, null, null);
				warningField.setDefaultValue('<p style="font-size:16px; color:DarkRed;">Refresh the screen untill all works orders are updated to the batch, before producing documentation<p/>');
				warningField.setDisplayType('disabled');
				
				var tab = form.addTab('custpage_tab_items', 'Production Batches Created');
				tab.setLabel('Production Batches Created');
				
				var tab2 = form.addTab('custpage_tab_items2', '');
				
				form.addField('custpage_tab2', 'text', 'test', null, 'custpage_tab_items2');
				
				var subList = form.addSubList('custpage_sublist_items', 'list', 'Production Batches Created', 'custpage_tab_items');
				
				subList.setLabel('Production Batches Created');
				
				var listView = subList.addField('custpage_sublist_view', 'url', 'View', null);
				listView.setLinkText('View');
				var listId = subList.addField('custpage_sublist_id', 'text', 'Internal Id', null);
				var listBatch = subList.addField('custpage_sublist_batch', 'text', 'Production Batch', null);
				var listEntered = subList.addField('custpage_sublist_entered', 'date', 'Date Entered', null);
				var listDue = subList.addField('custpage_sublist_due', 'date', 'Due Date', null);
				var listUpdated = subList.addField('custpage_sublist_updated', 'checkbox', 'W/O Updated To Batch', null);
				
				if(batches != '')
					{
						var lineNo = Number(0);
						
						var batchesArray = JSON.parse(batches);
						
						if(batchesArray.length > 0)
							{
								var filters = new Array();
								filters[0] = new nlobjSearchFilter('internalid', null, 'anyof', batchesArray);
								
								var columns = new Array();
								columns[0] = new nlobjSearchColumn('custrecord_bbs_bat_description');
								columns[1] = new nlobjSearchColumn('custrecord_bbs_bat_date_entered');
								columns[2] = new nlobjSearchColumn('custrecord_bbs_bat_date_due');
								columns[3] = new nlobjSearchColumn('custrecord_bbs_wo_updated');
								
								var batchResults = nlapiSearchRecord('customrecord_bbs_assembly_batch', null, filters, columns);
								
								for (var int2 = 0; int2 < batchResults.length; int2++) 
									{
										lineNo++;
										
										subList.setLineItemValue('custpage_sublist_view', lineNo, nlapiResolveURL('RECORD', 'customrecord_bbs_assembly_batch', batchResults[int2].getId(), 'VIEW'));
										subList.setLineItemValue('custpage_sublist_id', lineNo, batchResults[int2].getId());
										subList.setLineItemValue('custpage_sublist_batch', lineNo, batchResults[int2].getValue('custrecord_bbs_bat_description'));
										subList.setLineItemValue('custpage_sublist_entered', lineNo, batchResults[int2].getValue('custrecord_bbs_bat_date_entered'));
										subList.setLineItemValue('custpage_sublist_due', lineNo, batchResults[int2].getValue('custrecord_bbs_bat_date_due'));
										subList.setLineItemValue('custpage_sublist_updated', lineNo, batchResults[int2].getValue('custrecord_bbs_wo_updated'));
									}
							}
					}
				//Add a refresh button
				//
				subList.addRefreshButton();
				
				//Add a submit button to the form
				//
				form.addSubmitButton('Generate Production Batch Documentation');
				
				break;
			}
		
		//Write the response
		//
		response.writePage(form);
	}
	else
	{
		//Post request - so process the returned form
		//
		
		//Get the stage of the processing we are at
		//
		var stage = Number(request.getParameter('custpage_stage'));
		
		switch(stage)
		{
			case 1:

				var customerId = request.getParameter('custpage_customer_select');
				var belongsToId = request.getParameter('custpage_asym_belongs_select');
				var productionBatchId = request.getParameter('custpage_production_batch');
				var logotype = request.getParameter('custpage_logo_type_select');
				var logotypetext = request.getParameter('custpage_logo_type_text');
				var mode = request.getParameter('custpage_mode');
				var solink = request.getParameter('custpage_solink');
				var socommitstatus = request.getParameter('custpage_so_commit_select');
				var socommitstatustext = request.getParameter('custpage_so_com_text');
				var soid = request.getParameter('custpage_so_select');
				var sotext = request.getParameter('custpage_so_text');
				var wocommitstatus = request.getParameter('custpage_wo_commit_select');
				var wocommitstatustext = request.getParameter('custpage_wo_com_text');
				var startDate = request.getParameter('custpage_start_date');
				var endDate = request.getParameter('custpage_end_date');
				var logo = request.getParameter('custpage_logo_select');
				var logotext = request.getParameter('custpage_logo_text');
				var otherrefnum = request.getParameter('custpage_so_otherrefnum_select');
				var salesOrderId = request.getParameter('custpage_sales_order_select');
				var salesOrderText = request.getParameter('custpage_sales_order_text');
				var woBuildPercentId = request.getParameter('custpage_wo_build_percent_select');
				var woBuildPercentText = request.getParameter('custpage_wo_build_percent_text');
				
				//Build up the parameters so we can call this suitelet again, but move it on to the next stage
				//
				var params = new Array();
				params['customerid'] = customerId;
				params['belongstoid'] = belongsToId;
				params['productionbatchid'] = productionBatchId;
				params['stage'] = '2';
				params['logotype'] = logotype;
				params['logotypetext'] = logotypetext;
				params['mode'] = mode;
				params['solink'] = solink;
				params['socommitstatus'] = socommitstatus;
				params['socommitstatustext'] = socommitstatustext;
				params['soid'] = soid;
				params['sotext'] = sotext;
				params['wocommitstatus'] = wocommitstatus;
				params['wocommitstatustext'] = wocommitstatustext;
				params['startdate'] = startDate;
				params['enddate'] = endDate;
				params['logo'] = logo;
				params['logotext'] = logotext;
				params['otherrefnum'] = otherrefnum;
				params['salesorderid'] = salesOrderId;
				params['salesordertext'] = salesOrderText;
				params['wobildpercentid'] = woBuildPercentId;
				params['wobildpercenttext'] = woBuildPercentText;
				
				response.sendRedirect('SUITELET','customscript_bbs_assign_wo_suitelet', 'customdeploy_bbs_assign_wo_suitelet', null, params);
				
				break;
				
			case 2:
				
				var lineCount = request.getLineItemCount('custpage_sublist_items');
				var productionBatchId = request.getParameter('custpage_production_batch');
				var mode = request.getParameter('custpage_mode');
				var soLink = request.getParameter('custpage_solink'); // T/F - choose to select w/o that are/are not linked to sales orders
				
				//See if we are updating an existing batch or creating new ones
				//
				switch(mode)
				{
					//Update existing batch
					//
					case 'U':
						
						//Find all the ticked items & their quantities
						//
						for (var int = 1; int <= lineCount; int++) 
						{
							var ticked = request.getLineItemValue('custpage_sublist_items', 'custpage_sublist_tick', int);
							
							if (ticked == 'T')
								{
									var woId = request.getLineItemValue('custpage_sublist_items', 'custpage_sublist_id', int);
									
									var woRecord = nlapiLoadRecord('workorder', woId);
									woRecord.setFieldValue('custbody_bbs_wo_batch', productionBatchId);
									nlapiSubmitRecord(woRecord, false, true);
								}
						}
						
						//Return to the production batch record
						//
						response.sendRedirect('RECORD', 'customrecord_bbs_assembly_batch', productionBatchId, true, null);
						
						break;
				
					//Create new batches
					//
					case 'C':
						
						var woArray = {};
						var now = new Date();
						var nowFormatted = new Date(now.getTime() + (now.getTimezoneOffset() * 60000)).format('Ymd:Hi');
						var batchesCreated = [];
						
						//Loop round the sublist to find rows that are ticked
						//
						for (var int = 1; int <= lineCount; int++) 
							{
								var ticked = request.getLineItemValue('custpage_sublist_items', 'custpage_sublist_tick', int);
								
								if (ticked == 'T')
									{
										var woId = request.getLineItemValue('custpage_sublist_items', 'custpage_sublist_id', int);
										var belongsTo = request.getLineItemValue('custpage_sublist_items', 'custpage_sublist_belongs', int);
//SMI									var finish = request.getLineItemValue('custpage_sublist_items', 'custpage_sublist_finish_type', int);
										var soTranId = request.getLineItemValue('custpage_sublist_items', 'custpage_sublist_so_tranid', int);
										var custEntityId = request.getLineItemValue('custpage_sublist_items', 'custpage_sublist_cust_entityid', int);
										var custEntity = request.getLineItemValue('custpage_sublist_items', 'custpage_sublist_customer', int);
										var custEntityAccNo = request.getLineItemValue('custpage_sublist_items', 'custpage_sublist_customer_acc_no', int);
										var logo = request.getLineItemValue('custpage_sublist_items', 'custpage_sublist_logo', int);
										var soNumber = request.getLineItemValue('custpage_sublist_items', 'custpage_sublist_so_no', int);
										
										//Build the batch key (which is used as the batch description)
										//
										var key = '';
										
										if (soLink == 'T')
											{
//SMI										 	key = custEntity + ':' + soTranId + ':' + finish;
											 	key = soNumber + ':' + logo;
											}
										else
											{
//SMI											key = belongsTo + ':' + finish + ':' + nowFormatted;
												key = belongsTo + ':' + nowFormatted;
											}
										
										if(!woArray[key])
											{
												woArray[key] = [woId];
											}
										else
											{
												woArray[key].push(woId);
											}
									}
							}
					
						//Limit the qty of batches to be a maximum of MAX_BATCH_SIZE or 30 whichever is smaller
						//
						var batchCount = Number(Object.keys(woArray).length);
						
						var count = Number(0);
						
						for ( var wo in woArray) 
							{
								count++;
									
								if(count > MAX_BATCH_SIZE)
									{
										delete woArray[wo];
									}
							}

						var prodBatchId = '';
						
						nlapiLogExecution('DEBUG', 'Count of prod batches', (Object.keys(woArray).length).toString());
						
						var woToProcessArray = {};
						
						//Loop round the batch keys to create the batches
						//
						for (var woKey in woArray) 
							{
								//Create the batch record
								//
								var prodBatchRecord = nlapiCreateRecord('customrecord_bbs_assembly_batch');   // 2GU's
								prodBatchRecord.setFieldValue('custrecord_bbs_bat_description',woKey);
								
								//Save the batch record & get the id
								//
								prodBatchId = nlapiSubmitRecord(prodBatchRecord, true, true);  // 4GU's
								batchesCreated.push(prodBatchId);
								
								//Update the batch with the derived name
								//
								var batchName = woKey.split(':')[0] + '-' + prodBatchId.toString();
								
								nlapiSubmitField('customrecord_bbs_assembly_batch', prodBatchId, 'name', batchName, false)  // 2GU's
								
								//Loop round the w/o id's associated with this batch
								//
								woIds = woArray[woKey];
								
								//Save the id of the created batch along with the works orders that go with it
								//
								woToProcessArray[prodBatchId] = woIds;
								
							}
						
						var scheduleParams = {custscript_wo_array: JSON.stringify(woToProcessArray)};
						nlapiScheduleScript('customscript_bbs_prod_batch_scheduled', null, scheduleParams);
						
						var batchesCreatedText = JSON.stringify(batchesCreated);
						var params = new Array();
						
						params['stage'] = '3';
						params['batches'] = batchesCreatedText;
						params['solink'] = soLink;
						
						response.sendRedirect('SUITELET','customscript_bbs_assign_wo_suitelet', 'customdeploy_bbs_assign_wo_suitelet', null, params);
						
						break;
				}
				
				break;
			
			case 3:
				//Need to generate the production batch documentation
				//
				var today = new Date();
				var now = today.toUTCString();
				
				var remaining = nlapiGetContext().getRemainingUsage();
				
				//Get the batches data
				//
				var batches = request.getParameter('custpage_batches');
				var batchesArray = JSON.parse(batches);
				var solink = request.getParameter('custpage_solink');
				var stockOrSales = (solink == 'T' ? 'Sales Order' : 'Stock');
				
				var filters = new Array();
				filters[0] = new nlobjSearchFilter('internalid', null, 'anyof', batchesArray);
				
				var columns = new Array();
				columns[0] = new nlobjSearchColumn('custrecord_bbs_bat_description');
				columns[1] = new nlobjSearchColumn('custrecord_bbs_bat_date_entered');
				columns[2] = new nlobjSearchColumn('custrecord_bbs_bat_date_due');
				
				var batchResults = nlapiSearchRecord('customrecord_bbs_assembly_batch', null, filters, columns);  // 10GU's
				
				
				//
				//=====================================================================
				// Start the xml off with the basic header info & the start of a pdfset
				//=====================================================================
				//
				var xml = "<?xml version=\"1.0\"?>\n<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n<pdfset>";  // Main XML
				var xmlPb = ''; // Production Batch XML
				var xmlCb = ''; // Consolidated Base Products XML
				var xmlCf = ''; // Consolidated Finished Products XML
				
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

					//Find the works orders associated with this batch
					//
					var filterArray = [
					                   //["mainline","is","T"], 
					                   //"AND", 
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
							   new nlobjSearchColumn("custbody_bbs_wo_machine",null,null),
                               new nlobjSearchColumn("binnumber","item",null),
                               new nlobjSearchColumn("parent","item",null)
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
					
					//If we are linked to sales orders, then read the first w/o to get the customer from the w/o & then get the sub group
					//
					if(solink == 'T')
						{
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
						}
					else
						{	
							//If not linked to sales orders, we will need to use the assembly item belongs to instead
							//
							if(searchResultSet != null && searchResultSet.length > 0)
								{
									thisEntity = searchResultSet[0].getValue("custitem_bbs_item_customer","item");
								}
						}
					
					if(thisEntity !=  null && thisEntity != '')
					{
//SMI					subGroup = nlapiLookupField('customer', thisEntity, 'custentity_bbs_customer_sub_group', true);  // 5GU's
						subGroup = (subGroup == null ? '' : subGroup);
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
					
					//Header & style sheet
					//
					xmlPb += "<pdf>"
					xmlPb += "<head>";
					xmlPb += "<style type=\"text/css\">table {font-family: Calibri, Candara, Segoe, \"Segoe UI\", Optima, Arial, sans-serif;font-size: 9pt;table-layout: fixed;}";
					xmlPb += "th {font-weight: bold;font-size: 8pt;padding: 0px;border-bottom: 1px solid black;border-collapse: collapse;}";
					xmlPb += "td {padding: 0px;vertical-align: top;font-size:10px;}";
					xmlPb += "b {font-weight: bold;color: #333333;}";
					xmlPb += "table.header td {padding: 0px;font-size: 10pt;}";
					xmlPb += "table.footer td {padding: 0;font-size: 10pt;}";
					xmlPb += "table.itemtable th {padding-bottom: 0px;padding-top: 0px;}";
					xmlPb += "table.body td {padding-top: 0px;}";
					xmlPb += "table.total {page-break-inside: avoid;}";
					xmlPb += "table.message{border: 1px solid #dddddd;}";
					xmlPb += "tr.totalrow {line-height: 300%;}";
					xmlPb += "tr.messagerow{font-size: 6pt;}";
					xmlPb += "td.totalboxtop {font-size: 12pt;background-color: #e3e3e3;}";
					xmlPb += "td.addressheader {font-size: 10pt;padding-top: 0px;padding-bottom: 0px;}";
					xmlPb += "td.address {padding-top: 0;font-size: 10pt;}";
					xmlPb += "td.totalboxmid {font-size: 28pt;padding-top: 20px;background-color: #e3e3e3;}";
					xmlPb += "td.totalcell {border: 1px solid black;border-collapse: collapse;}";
					xmlPb += "td.message{font-size: 8pt;}";
					xmlPb += "td.totalboxbot {background-color: #e3e3e3;font-weight: bold;}";
					xmlPb += "span.title {font-size: 28pt;}";
					xmlPb += "span.number {font-size: 16pt;}";
					xmlPb += "span.itemname {font-weight: bold;line-height: 150%;}";
					xmlPb += "hr {width: 100%;color: #d3d3d3;background-color: #d3d3d3;height: 1px;}";
					xmlPb += "</style>";

			        //Macros
			        //
					xmlPb += "<macrolist>";
					xmlPb += "<macro id=\"nlfooter\">";
					
					xmlPb += "<table class=\"footer\" style=\"width: 100%;\">";
					xmlPb += "<tr><td>&nbsp;</td><td align=\"center\" style=\"font-size:16px;\">Ship Date: " + thisShipDateFormatted + "</td><td align=\"right\" style=\"font-size:16px;\">" + thisShipDay + "</td></tr>";
					xmlPb += "</table>";
					
					xmlPb += "<p/>";
					
					xmlPb += "<table class=\"footer\" style=\"width: 100%;\">";
					xmlPb += "<tr><td align=\"left\" style=\"font-size:6px;\">Printed: " + now + "</td><td align=\"right\" style=\"font-size:6px;\">Page <pagenumber/> of <totalpages/></td></tr>";
					xmlPb += "</table>";
					xmlPb += "</macro>";
					
					//Header data
					//
					xmlPb += "<macro id=\"nlheader\">";
					xmlPb += "<table style=\"width: 100%\">";
					xmlPb += "<tr>";
					xmlPb += "<td colspan=\"2\" align=\"left\" style=\"font-size:12px; padding-bottom: 10px;\">&nbsp;</td>";
					xmlPb += "<td colspan=\"12\" align=\"center\" style=\"font-size:20px; padding-bottom: 10px;\"><b>Production Batch Picking List</b></td>";
					xmlPb += "<td colspan=\"2\" align=\"right\" style=\"font-size:16px; padding-bottom: 10px;\">" + nlapiEscapeXML(thisLogoType) + "</td>";
					xmlPb += "</tr>";
					
					xmlPb += "<tr>";
					xmlPb += "<td align=\"center\" style=\"font-size:20px;\">&nbsp;</td>";
					xmlPb += "<td align=\"center\" style=\"font-size:20px;\">&nbsp;</td>";
					xmlPb += "</tr>";
					
					xmlPb += "<tr>";
					xmlPb += "<td align=\"left\" colspan=\"4\" style=\"font-size:12px; padding-bottom: 10px;\"><b>Batch Description</b></td>";
					xmlPb += "<td align=\"left\" colspan=\"12\" style=\"font-size:12px; padding-bottom: 10px;\">" + nlapiEscapeXML(batchDescription) + "</td>";
					xmlPb += "</tr>";
					
					xmlPb += "<tr>";
					xmlPb += "<td align=\"center\" style=\"font-size:20px;\">&nbsp;</td>";
					xmlPb += "<td align=\"center\" style=\"font-size:20px;\">&nbsp;</td>";
					xmlPb += "</tr>";
					
					xmlPb += "<tr>";
					xmlPb += "<td align=\"left\" colspan=\"4\" style=\"font-size:12px; padding-bottom: 10px;\"><b>Batch Id</b></td>";
					xmlPb += "<td align=\"left\" colspan=\"3\" style=\"padding-bottom: 10px;\"><barcode codetype=\"code128\" showtext=\"false\" value=\"" + nlapiEscapeXML(batchId) + "\"/></td>";
					xmlPb += "<td align=\"left\" style=\"font-size:16px; padding-bottom: 10px;\" colspan=\"2\">" + nlapiEscapeXML(batchId) + "</td>";
					xmlPb += "</tr>";
					
					xmlPb += "<tr>";
					xmlPb += "<td align=\"center\" style=\"font-size:20px;\">&nbsp;</td>";
					xmlPb += "<td align=\"center\" style=\"font-size:20px;\">&nbsp;</td>";
					xmlPb += "</tr>";
					
					xmlPb += "<tr>";
					xmlPb += "<td align=\"left\" colspan=\"4\" style=\"font-size:12px; padding-bottom: 10px;\"><b>Sales Order</b></td>";
					xmlPb += "<td align=\"left\" colspan=\"3\" style=\"padding-bottom: 10px;\"><barcode codetype=\"code128\" showtext=\"false\" value=\"" + nlapiEscapeXML(thisSalesOrder) + "\"/></td>";
					xmlPb += "<td align=\"left\" style=\"font-size:16px; padding-bottom: 10px;\" colspan=\"2\">" + nlapiEscapeXML(thisSalesOrder) + "</td>";
					xmlPb += "</tr>";
					
					xmlPb += "<tr>";
					xmlPb += "<td align=\"left\" colspan=\"4\" style=\"font-size:12px; padding-bottom: 10px;\"><b>Machine</b></td>";
					xmlPb += "<td align=\"left\" colspan=\"3\" style=\"padding-bottom: 10px;\">" + nlapiEscapeXML(thisMachine) + "</td>";
					xmlPb += "</tr>";
					
					xmlPb += "</table></macro>";

					xmlPb += "</macrolist>";
					xmlPb += "</head>";
					
					//Body
					//
					xmlPb += "<body header=\"nlheader\" header-height=\"150px\" footer=\"nlfooter\" footer-height=\"20px\" padding=\"0.5in 0.5in 0.5in 0.5in\" size=\"A4\">";
					
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
								var woAssemblyProcessTypeId		= searchResultSet[int3].getValue("custitem_bbs_item_process_type","item");
                                var woBinNumber					= searchResultSet[int3].getValue("binnumber","item");
                                var woAssemblyParent					= searchResultSet[int3].getValue("parent","item");
								if(woAssemblyItemSequence == null || woAssemblyItemSequence == '')
									{
										woAssemblyItemSequence = padding_left(woAssemblyItemId, '0', 6);
									}
								
								if(woMainline == '*')
									{	
//SMI									thisFinishedItem = woAssemblyItemSequence + woAssemblyFinishType;
										thisFinishedItem = woAssemblyItemSequence;
									
										if(firstTime)
											{
												firstTime = false;
											}
										else
											{
												xmlPb += "</table>";
											}
										
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
											
										
										xmlPb += "<table class=\"itemtable\" style=\"width: 100%; page-break-inside: avoid;\">";
										xmlPb += "<thead >";
										xmlPb += "<tr >";
										xmlPb += "<th colspan=\"2\">Works Order</th>";
										xmlPb += "<th align=\"left\" colspan=\"14\">Component</th>";
                                      	xmlPb += "<th align=\"left\" colspan=\"2\">Bin Number</th>";
										xmlPb += "<th align=\"right\" colspan=\"3\">Committed Qty</th>";
                                      
										xmlPb += "</tr>";
										xmlPb += "</thead>";
										
										xmlPb += "<tr>";
										xmlPb += "<td  style=\"border-top: 1px; border-top-color: black;\" colspan=\"2\">" + nlapiEscapeXML(searchResultSet[int3].getValue('tranid')) + "</td>";
										xmlPb += "<td  style=\"border-top: 1px; border-top-color: black; font-size: 10pt;\" align=\"left\" colspan=\"14\"><b>" + nlapiEscapeXML(removePrefix(woAssemblyItem)) + "</b></td>";
										xmlPb += "<td  style=\"border-top: 1px; border-top-color: black;\" align=\"left\" colspan=\"4\">&nbsp;</td>";
										xmlPb += "</tr>";
															
										xmlPb += "<tr>";
										xmlPb += "<td colspan=\"2\" style=\"font-size: 5pt;\"> " + nlapiEscapeXML(woCommitStatus) + "</td>";
										xmlPb += "<td align=\"left\" colspan=\"14\">" + nlapiEscapeXML(woAssemblyItemDesc) + "</td>";
                                      	xmlPb += "</tr>";	
										xmlPb += "<tr>";
										xmlPb += "<td colspan=\"2\" style=\"font-size: 5pt;\">&nbsp;</td>";
										xmlPb += "<td align=\"left\" colspan=\"12\">&nbsp;</td>";
										xmlPb += "</tr>";
										
									}
								else
									{
										//Collate all of the base items together
										//
										if(woItemType == 'InvtPart' || woItemType == 'NonInvtPart')
											{
												if(!baseItems[woAssemblyItemSequence])
													{
														baseItems[woAssemblyItemSequence] = [woAssemblyItem,Number(woAssemblyItemQty),Number(woAssemblyItemCommitted),woAssemblyItemDesc,woSpecInst,woAssemblyProcessTypeId,woBinNumber]; //Item Description, Quantity, Committed Qty, Description, Special Instr, Process Type
                                                      	
													}
												else
													{
														baseItems[woAssemblyItemSequence][1] = Number(baseItems[woAssemblyItemSequence][1]) + Number(woAssemblyItemQty);
														baseItems[woAssemblyItemSequence][2] = Number(baseItems[woAssemblyItemSequence][2]) + Number(woAssemblyItemCommitted);
                                                     
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
												
												
												if(firstInventoryItem && woAssemblyParent != '')
													{
														xmlPb += "<tr>";
														xmlPb += "<td colspan=\"2\">&nbsp;</td>";
														xmlPb += "<td align=\"left\" colspan=\"4\" style=\"font-size: 12pt; margin-top: 5px;\"><b>" + nlapiEscapeXML(removePrefix(woAssemblyItem)) + "</b></td>";
														xmlPb += "<td align=\"left\" colspan=\"10\" style=\"font-size: 8pt; margin-top: 5px; vertical-align: middle;\">" + nlapiEscapeXML(woAssemblyItemDesc) + "</td>";
                                                      	xmlPb += "<td align=\"left\" colspan=\"2\" style=\"font-size: 8pt; margin-top: 5px; vertical-align: middle;\">" + nlapiEscapeXML(woBinNumber) + "</td>";
														xmlPb += "<td align=\"right\" colspan=\"2\" style=\"padding-right: 5px; margin-top: 5px;\">" + nlapiEscapeXML(woAssemblyItemCommitted) + "</td>";
														xmlPb += "</tr>";
																	
														xmlPb += "<tr>";
														xmlPb += "<td colspan=\"2\" style=\"margin-top: 5px;\">&nbsp;</td>";
														xmlPb += "<td align=\"left\" colspan=\"4\" style=\"margin-top: 5px;\"><b>Special Instructions :</b></td>";
														xmlPb += "<td align=\"left\" colspan=\"10\" style=\"margin-top: 5px;\">" + nlapiEscapeXML(woSpecInst) + "</td>";
														xmlPb += "</tr>";
													}
												
												/*
												xmlPb += "<tr>";
												xmlPb += "<td colspan=\"2\">&nbsp;</td>";
												xmlPb += "<td align=\"left\" colspan=\"4\" style=\"font-size: 12pt; margin-top: 5px;\"><b>" + nlapiEscapeXML(removePrefix(woAssemblyItem)) + "</b></td>";
												
												if(!firstInventoryItem)
													{
														xmlPb += "<td align=\"left\" colspan=\"10\" style=\"font-size: 8pt; margin-top: 5px; vertical-align: middle;\">" + nlapiEscapeXML(woAssemblyItemDesc) + "<barcode codetype=\"code128\" showtext=\"false\" value=\"" + nlapiEscapeXML(removePrefix(woAssemblyItem)) + "\"/></td>";
														
													}
												else
													{
														xmlPb += "<td align=\"left\" colspan=\"10\" style=\"font-size: 8pt; margin-top: 5px; vertical-align: middle;\">" + nlapiEscapeXML(woAssemblyItemDesc) + "</td>";
													
													}
												
												xmlPb += "<td align=\"right\" colspan=\"2\" style=\"padding-right: 5px; margin-top: 5px;\">" + nlapiEscapeXML(woAssemblyItemCommitted) + "</td>";
												xmlPb += "</tr>";
															
												xmlPb += "<tr>";
												xmlPb += "<td colspan=\"2\" style=\"margin-top: 5px;\">&nbsp;</td>";
												xmlPb += "<td align=\"left\" colspan=\"4\" style=\"margin-top: 5px;\"><b>Special Instructions :</b></td>";
												xmlPb += "<td align=\"left\" colspan=\"10\" style=\"margin-top: 5px;\">" + nlapiEscapeXML(woSpecInst) + "</td>";
												xmlPb += "</tr>";
												 */
												
												if(firstInventoryItem)
												{
													//firstInventoryItem = false;
													
													//xmlPb += "<tr>";
													//xmlPb += "<td colspan=\"2\">&nbsp;</td>";
													//xmlPb += "<td style=\"border-bottom: 1px; border-bottom-color: black;\" colspan=\"16\"><b><br/>Processes Required</b></td>";
													//xmlPb += "</tr>";
												}
											}
									}
							}
							
							//Finish the item table
							//
							xmlPb += "</table>";
							
						}
					
					//Add in the operator signature boxes
					//
					xmlPb += "<p/>";
					xmlPb += "<table class=\"total\" style=\"width: 100%; page-break-inside: avoid;\">";
					xmlPb += "<tr class=\"totalrow\">";
					xmlPb += "<td class=\"totalcell\" align=\"left\" style=\"padding-left: 5px;\"><b>Picked (Initials):</b></td>";
					xmlPb += "<td class=\"totalcell\" align=\"left\" style=\"padding-left: 5px;\"><b>Date:</b></td>";
					xmlPb += "</tr>";
					xmlPb += "<tr class=\"totalrow\">";
					xmlPb += "<td class=\"totalcell\" align=\"left\" style=\"padding-left: 5px;\"><b>Checked (Initials):</b></td>";
					xmlPb += "<td class=\"totalcell\" align=\"left\" style=\"padding-left: 5px;\"><b>Date:</b></td>";
					xmlPb += "</tr>";
					xmlPb += "</table>";
					
					//Finish the body
					//
					xmlPb += "</body>";
					
					//Finish the pdf
					//
					xmlPb += "</pdf>";

					if(PRINT_PRODUCTION_BATCH)
						{
							xml += xmlPb;
						}
					
					xmlPb = '';
					
					//
					//=====================================================================
					// Produce the summary of the base items
					//=====================================================================
					//
					
					//Header & style sheet
					//
					xmlCb += "<pdf>"
					xmlCb += "<head>";
					xmlCb += "<style type=\"text/css\">table {font-family: Calibri, Candara, Segoe, \"Segoe UI\", Optima, Arial, sans-serif;font-size: 9pt;table-layout: fixed;}";
					xmlCb += "th {font-weight: bold;font-size: 8pt;padding: 0px;border-bottom: 1px solid black;border-collapse: collapse;}";
					xmlCb += "td {padding: 0px;vertical-align: top;font-size:10px;}";
					xmlCb += "b {font-weight: bold;color: #333333;}";
					xmlCb += "table.header td {padding: 0px;font-size: 10pt;}";
					xmlCb += "table.footer td {padding: 0;font-size: 10pt;}";
					xmlCb += "table.itemtable th {padding-bottom: 0px;padding-top: 0px;}";
					xmlCb += "table.body td {padding-top: 0px;}";
					xmlCb += "table.total {page-break-inside: avoid;}";
					xmlCb += "table.message{border: 1px solid #dddddd;}";
					xmlCb += "tr.totalrow {line-height: 300%;}";
					xmlCb += "tr.messagerow{font-size: 6pt;}";
					xmlCb += "td.totalboxtop {font-size: 12pt;background-color: #e3e3e3;}";
					xmlCb += "td.addressheader {font-size: 10pt;padding-top: 0px;padding-bottom: 0px;}";
					xmlCb += "td.address {padding-top: 0;font-size: 10pt;}";
					xmlCb += "td.totalboxmid {font-size: 28pt;padding-top: 20px;background-color: #e3e3e3;}";
					xmlCb += "td.totalcell {border: 1px solid black;border-collapse: collapse;}";
					xmlCb += "td.message{font-size: 8pt;}";
					xmlCb += "td.totalboxbot {background-color: #e3e3e3;font-weight: bold;}";
					xmlCb += "span.title {font-size: 28pt;}";
					xmlCb += "span.number {font-size: 16pt;}";
					xmlCb += "span.itemname {font-weight: bold;line-height: 150%;}";
					xmlCb += "hr {width: 100%;color: #d3d3d3;background-color: #d3d3d3;height: 1px;}";
					xmlCb += "</style>";

			        //Macros
			        //
					xmlCb += "<macrolist>";
					xmlCb += "<macro id=\"nlfooter\">"; 
					xmlCb += "<table class=\"footer\" style=\"width: 100%;\">";
					xmlCb += "<tr><td>&nbsp;</td><td align=\"center\" style=\"font-size:16px;\">Ship Date: " + thisShipDateFormatted + "</td><td align=\"right\" style=\"font-size:16px;\">" + thisShipDay + "</td></tr>";
					xmlCb += "</table>";
					
					xmlCb += "<p/>";
					
					xmlCb += "<table class=\"footer\" style=\"width: 100%;\">";
					xmlCb += "<tr><td align=\"left\" style=\"font-size:6px;\">Printed: " + now + "</td><td align=\"right\" style=\"font-size:6px;\">Page <pagenumber/> of <totalpages/></td></tr>";
					xmlCb += "</table>";
					xmlCb += "</macro>";
					
					//Header data
					//
					xmlCb += "<macro id=\"nlheader\">";
					xmlCb += "<table style=\"width: 100%\">";
					
					
					xmlCb += "<tr>";
					xmlCb += "<td colspan=\"2\" align=\"left\" style=\"font-size:12px; padding-bottom: 10px;\">&nbsp;</td>";
					xmlCb += "<td colspan=\"12\" align=\"center\" style=\"font-size:20px; padding-bottom: 10px;\"><b>Consolidated Finished Items Picking List</b></td>";
					xmlCb += "<td colspan=\"2\" align=\"right\" style=\"font-size:16px; padding-bottom: 10px;\">" + nlapiEscapeXML(thisLogoType) + "</td>";
					xmlCb += "</tr>";
					
					xmlCb += "<tr>";
					xmlCb += "<td align=\"center\" style=\"font-size:20px;\">&nbsp;</td>";
					xmlCb += "<td align=\"center\" style=\"font-size:20px;\">&nbsp;</td>";
					xmlCb += "</tr>";
					
					xmlCb += "<tr>";
					xmlCb += "<td align=\"left\" colspan=\"4\" style=\"font-size:12px; padding-bottom: 10px;\"><b>Batch Description</b></td>";
					xmlCb += "<td align=\"left\" colspan=\"12\" style=\"font-size:12px; padding-bottom: 10px;\">" + nlapiEscapeXML(batchDescription) + "</td>";
					xmlCb += "</tr>";
					
					xmlCb += "<tr>";
					xmlCb += "<td align=\"center\" style=\"font-size:20px;\">&nbsp;</td>";
					xmlCb += "<td align=\"center\" style=\"font-size:20px;\">&nbsp;</td>";
					xmlCb += "</tr>";
					
					xmlCb += "<tr>";
					xmlCb += "<td align=\"left\" colspan=\"4\" style=\"font-size:12px; padding-bottom: 10px;\"><b>Batch Id</b></td>";
					xmlCb += "<td align=\"left\" colspan=\"3\" style=\"padding-bottom: 10px;\"><barcode codetype=\"code128\" showtext=\"false\" value=\"" + nlapiEscapeXML(batchId) + "\"/></td>";
					xmlCb += "<td align=\"left\" style=\"font-size:16px; padding-bottom: 10px;\" colspan=\"2\">" + nlapiEscapeXML(batchId) + "</td>";
					xmlCb += "</tr>";
					
					xmlCb += "<tr>";
					xmlCb += "<td align=\"center\" style=\"font-size:20px;\">&nbsp;</td>";
					xmlCb += "<td align=\"center\" style=\"font-size:20px;\">&nbsp;</td>";
					xmlCb += "</tr>";
					
					xmlCb += "<tr>";
					xmlCb += "<td align=\"left\" colspan=\"4\" style=\"font-size:12px; padding-bottom: 10px;\"><b>Sales Order</b></td>";
					xmlCb += "<td align=\"left\" colspan=\"3\" style=\"padding-bottom: 10px;\"><barcode codetype=\"code128\" showtext=\"false\" value=\"" + nlapiEscapeXML(thisSalesOrder) + "\"/></td>";
					xmlCb += "<td align=\"left\" style=\"font-size:16px; padding-bottom: 10px;\" colspan=\"2\">" + nlapiEscapeXML(thisSalesOrder) + "</td>";
					xmlCb += "</tr>";
					
					xmlCb += "<tr>";
					xmlCb += "<td align=\"left\" colspan=\"4\" style=\"font-size:12px; padding-bottom: 10px;\"><b>Machine</b></td>";
					xmlCb += "<td align=\"left\" colspan=\"3\" style=\"padding-bottom: 10px;\">" + nlapiEscapeXML(thisMachine) + "</td>";
					xmlCb += "</tr>";

					xmlCb += "</table></macro>";

					xmlCb += "</macrolist>";
					xmlCb += "</head>";
					
					//Body
					//
					xmlCb += "<body header=\"nlheader\" header-height=\"150px\" footer=\"nlfooter\" footer-height=\"20px\" padding=\"0.5in 0.5in 0.5in 0.5in\" size=\"A4\">";
					
					xmlCb += "<table class=\"itemtable\" style=\"width: 100%;\">";
					xmlCb += "<thead >";
					xmlCb += "<tr >";
					xmlCb += "<th align=\"left\" colspan=\"17\">Base Item</th>";
					//xmlCb += "<th align=\"right\" colspan=\"2\" style=\"padding-right: 5px;\">Required Qty</th>";
					xmlCb += "<th align=\"right\" colspan=\"3\">Committed Qty</th>";

					xmlCb += "</tr>";
					xmlCb += "</thead>";

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
					for (var baseItem in orderedBaseItems) 
						{
							//Base Item Array - [0]Item Description, [1]Quantity, [2]Committed Qty, [3]Description, [4]Special Instr, [5]Process Type
							//
							if(['1','2','7','11'].indexOf(orderedBaseItems[baseItem][5]) != -1) //1=Embroidery, 2=Heatseal, 7=Transfer, 11=Embroidery/Heatseal
								{
									xmlCb += "<tr>";
									xmlCb += "<td colspan=\"2\">&nbsp;</td>";
									xmlCb += "<td align=\"left\" colspan=\"4\" style=\"font-size: 12pt; margin-top: 5px;\"><b>" + nlapiEscapeXML(removePrefix(orderedBaseItems[baseItem][0])) + "</b></td>";
									xmlCb += "<td align=\"left\" colspan=\"10\" style=\"font-size: 8pt; margin-top: 5px; vertical-align: middle;\">" + nlapiEscapeXML(orderedBaseItems[baseItem][3]) + "<barcode codetype=\"code128\" showtext=\"false\" value=\"" + nlapiEscapeXML(removePrefix(orderedBaseItems[baseItem][0])) + "\"/></td>";
									xmlCb += "<td align=\"right\" colspan=\"2\" style=\"padding-right: 5px; margin-top: 5px;\">" + nlapiEscapeXML(orderedBaseItems[baseItem][6]) + "</td>";
                                  xmlCb += "<td align=\"right\" colspan=\"2\" style=\"padding-right: 5px; margin-top: 5px;\">" + nlapiEscapeXML(orderedBaseItems[baseItem][2]) + "</td>";
									xmlCb += "</tr>";
												
									xmlCb += "<tr>";
									xmlCb += "<td colspan=\"2\" style=\"margin-top: 5px;\">&nbsp;</td>";
									xmlCb += "<td align=\"left\" colspan=\"4\" style=\"margin-top: 5px;\"><b>Special Instructions :</b></td>";
									xmlCb += "<td align=\"left\" colspan=\"10\" style=\"margin-top: 5px;\">" + nlapiEscapeXML(orderedBaseItems[baseItem][4]) + "</td>";
									xmlCb += "</tr>";
								}
						
						
							/*
							xmlCb += "<tr>";
							xmlCb += "<td align=\"left\" colspan=\"16\" style=\"font-size: 10pt;\"><b>" + nlapiEscapeXML(removePrefix(orderedBaseItems[baseItem][0])) + "</b></td>";
							xmlCb += "<td align=\"right\" colspan=\"2\" style=\"padding-right: 5px;\">" + nlapiEscapeXML(orderedBaseItems[baseItem][2]) + "</td>";
							xmlCb += "</tr>";
												
							xmlCb += "<tr>";
							xmlCb += "<td align=\"left\" colspan=\"14\">" + nlapiEscapeXML(orderedBaseItems[baseItem][3]) + "</td>";
							xmlCb += "</tr>";
												
							xmlCb += "<tr>";
							xmlCb += "<td align=\"left\" colspan=\"14\"><b>" + nlapiEscapeXML(orderedBaseItems[baseItem][4]) + "</b></td>";
							xmlCb += "</tr>";
												
							xmlCb += "<tr>";
							xmlCb += "<td colspan=\"18\">&nbsp;</td>";
							xmlCb += "</tr>";
							*/
						}
					
					//Finish the item table
					//
					xmlCb += "</table>";
					
					//Add in the operator signature boxes
					//
					xmlCb += "<p/>";
					xmlCb += "<table class=\"total\" style=\"width: 100%; page-break-inside: avoid;\">";
					xmlCb += "<tr class=\"totalrow\">";
					xmlCb += "<td class=\"totalcell\" align=\"left\" style=\"padding-left: 5px;\"><b>Picked (Initials):</b></td>";
					xmlCb += "<td class=\"totalcell\" align=\"left\" style=\"padding-left: 5px;\"><b>Date:</b></td>";
					xmlCb += "</tr>";
					xmlCb += "<tr class=\"totalrow\">";
					xmlCb += "<td class=\"totalcell\" align=\"left\" style=\"padding-left: 5px;\"><b>Checked (Initials):</b></td>";
					xmlCb += "<td class=\"totalcell\" align=\"left\" style=\"padding-left: 5px;\"><b>Date:</b></td>";
					xmlCb += "</tr>";
					xmlCb += "</table>";
					
					//Finish the body
					//
					xmlCb += "</body>";
					
					//Finish the pdf
					//
					xmlCb += "</pdf>";
					
					if(PRINT_CONSOLIDATED_BASE_ITEMS)
						{
							xml += xmlCb;
						}
					
					xmlCb = '';
					
					//
					//=====================================================================
					// End of summary picking list
					//=====================================================================
					//
					
					
					//
					//=====================================================================
					// Produce the summary of the finished items
					//=====================================================================
					//
					
					//Header & style sheet
					//
					xmlCf += "<pdf>"
					xmlCf += "<head>";
					xmlCf += "<style type=\"text/css\">table {font-family: Calibri, Candara, Segoe, \"Segoe UI\", Optima, Arial, sans-serif;font-size: 9pt;table-layout: fixed;}";
					xmlCf += "th {font-weight: bold;font-size: 8pt;padding: 0px;border-bottom: 1px solid black;border-collapse: collapse;}";
					xmlCf += "td {padding: 0px;vertical-align: top;font-size:10px;}";
					xmlCf += "b {font-weight: bold;color: #333333;}";
					xmlCf += "table.header td {padding: 0px;font-size: 10pt;}";
					xmlCf += "table.footer td {padding: 0;font-size: 10pt;}";
					xmlCf += "table.itemtable th {padding-bottom: 0px;padding-top: 0px;}";
					xmlCf += "table.body td {padding-top: 0px;}";
					xmlCf += "table.total {page-break-inside: avoid;}";
					xmlCf += "table.message{border: 1px solid #dddddd;}";
					xmlCf += "tr.totalrow {line-height: 300%;}";
					xmlCf += "tr.messagerow{font-size: 6pt;}";
					xmlCf += "td.totalboxtop {font-size: 12pt;background-color: #e3e3e3;}";
					xmlCf += "td.addressheader {font-size: 10pt;padding-top: 0px;padding-bottom: 0px;}";
					xmlCf += "td.address {padding-top: 0;font-size: 10pt;}";
					xmlCf += "td.totalboxmid {font-size: 28pt;padding-top: 20px;background-color: #e3e3e3;}";
					xmlCf += "td.totalcell {border: 1px solid black;border-collapse: collapse;}";
					xmlCf += "td.message{font-size: 8pt;}";
					xmlCf += "td.totalboxbot {background-color: #e3e3e3;font-weight: bold;}";
					xmlCf += "span.title {font-size: 28pt;}";
					xmlCf += "span.number {font-size: 16pt;}";
					xmlCf += "span.itemname {font-weight: bold;line-height: 150%;}";
					xmlCf += "hr {width: 100%;color: #d3d3d3;background-color: #d3d3d3;height: 1px;}";
					xmlCf += "</style>";

			        //Macros
			        //
					xmlCf += "<macrolist>";
					xmlCf += "<macro id=\"nlfooter\"><table class=\"footer\" style=\"width: 100%;\">";
					xmlCf += "<tr><td align=\"left\">Printed: " + now + "</td><td align=\"right\">Page <pagenumber/> of <totalpages/></td></tr>";
					xmlCf += "</table></macro>";
					
					//Header data
					//
					xmlCf += "<macro id=\"nlheader\">";
					xmlCf += "<table style=\"width: 100%\">";
					xmlCf += "<tr>";
					xmlCf += "<td colspan=\"2\" align=\"left\" style=\"font-size:12px; padding-bottom: 5px;\">&nbsp;</td>";
					xmlCf += "<td colspan=\"12\" align=\"center\" style=\"font-size:20px; padding-bottom: 5px;\"><b>Consolidated Finished Items Production List</b></td>";
					xmlCf += "<td colspan=\"2\" align=\"right\" style=\"font-size:12px; padding-bottom: 5px;\">&nbsp;</td>";
					xmlCf += "</tr>";
					
					xmlCf += "<tr>";
					xmlCf += "<td align=\"center\" style=\"font-size:20px;\">&nbsp;</td>";
					xmlCf += "<td align=\"center\" style=\"font-size:20px;\">&nbsp;</td>";
					xmlCf += "</tr>";
					
					xmlCf += "<tr>";
					xmlCf += "<td align=\"left\" colspan=\"4\" style=\"font-size:12px; padding-bottom: 5px;\"><b>Batch Description</b></td>";
					xmlCf += "<td align=\"left\" colspan=\"12\" style=\"font-size:12px; padding-bottom: 5px;\">" + nlapiEscapeXML(batchDescription) + "</td>";
					xmlCf += "</tr>";
					
					xmlCf += "<tr>";
					xmlCf += "<td align=\"center\" style=\"font-size:20px;\">&nbsp;</td>";
					xmlCf += "<td align=\"center\" style=\"font-size:20px;\">&nbsp;</td>";
					xmlCf += "</tr>";
					
					xmlCf += "<tr>";
					xmlCf += "<td align=\"left\" colspan=\"4\" style=\"font-size:12px;\"><b>Batch Id</b></td>";
					xmlCf += "<td colspan=\"3\"><barcode codetype=\"code128\" showtext=\"false\" value=\"" + nlapiEscapeXML(batchId) + "\"/></td>";
					xmlCf += "<td align=\"left\" style=\"font-size:16px;\" colspan=\"2\">" + nlapiEscapeXML(batchId) + "</td>";
					//xmlCf += "<td align=\"right\" style=\"font-size:12px;\" colspan=\"2\">" + nlapiEscapeXML(stockOrSales) + "</td>";
					xmlCf += "</tr>";
					
					xmlCf += "</table></macro>";

					xmlCf += "</macrolist>";
					xmlCf += "</head>";
					
					//Body
					//
					xmlCf += "<body header=\"nlheader\" header-height=\"150px\" footer=\"nlfooter\" footer-height=\"1%\" padding=\"0.5in 0.5in 0.5in 0.5in\" size=\"A4\">";

					//xmlCf += "<table class=\"itemtable\" style=\"width: 100%;\">";
					//xmlCf += "<thead >";
					//xmlCf += "<tr >";
					//xmlCf += "<th align=\"left\" colspan=\"14\">Finished Item</th>";
					//xmlCf += "<th align=\"right\" colspan=\"2\" style=\"padding-right: 5px;\">Required Qty</th>";
					//xmlCf += "<th align=\"right\" colspan=\"2\">Committed Qty</th>";
					//xmlCf += "</tr>";
					//xmlCf += "</thead>";

					//Sort the finished items
					//
					for ( var orderedfinishedItem in orderedfinishedItems) 
						{
							delete orderedfinishedItems[orderedfinishedItem];
						}
					
					const orderedfinishedItems = {};
					Object.keys(finishedItems).sort().forEach(function(key) {
						orderedfinishedItems[key] = finishedItems[key];
					});
					
					//Loop through the finished items
					//
					for (var finishedItem in orderedfinishedItems) 
						{
							xmlCf += "<table class=\"itemtable\" style=\"width: 100%; page-break-inside: avoid;\">";
							xmlCf += "<thead >";
							xmlCf += "<tr >";
							xmlCf += "<th align=\"left\" colspan=\"16\">Finished Item</th>";
							//xmlCf += "<th align=\"right\" colspan=\"2\" style=\"padding-right: 5px;\">Required Qty</th>";
							xmlCf += "<th align=\"right\" colspan=\"2\">Committed Qty</th>";
							xmlCf += "</tr>";
							xmlCf += "</thead>";

							xmlCf += "<tr>";
							xmlCf += "<td align=\"left\" colspan=\"16\" style=\"font-size: 10pt;\"><b>" + nlapiEscapeXML(removePrefix(orderedfinishedItems[finishedItem][0])) + "</b></td>";
							//xmlCf += "<td align=\"right\" colspan=\"2\" style=\"padding-right: 5px;\">" + orderedfinishedItems[finishedItem][1] + "</td>";
							xmlCf += "</tr>";
												
							xmlCf += "<tr>";
							xmlCf += "<td align=\"left\" colspan=\"16\">" + nlapiEscapeXML(orderedfinishedItems[finishedItem][2]) + "</td>";
							xmlCf += "</tr>";
																	
							xmlCf += "<tr>";
							xmlCf += "<td colspan=\"18\">&nbsp;</td>";
							xmlCf += "</tr>";
							
							var theComponents = orderedfinishedItems[finishedItem][3];
							
							//for ( var orderedComponent in orderedComponents) 
							//{
							//	delete orderedComponents[orderedComponent];
							//}
							
							//const orderedComponents = {};
							//Object.keys(theComponents).sort().forEach(function(key) {
							//	orderedComponents[key] = theComponents[key];
							//});
							
							for (var theComponent in theComponents) 
								{
									xmlCf += "<tr>";
									xmlCf += "<td colspan=\"2\">&nbsp;</td>";
									xmlCf += "<td align=\"left\" colspan=\"14\" style=\"font-size: 10pt;\"><b>" + nlapiEscapeXML(removePrefix(theComponents[theComponent][0])) + "</b></td>";
									xmlCf += "<td align=\"right\" colspan=\"2\" style=\"padding-right: 5px;\">" + nlapiEscapeXML(theComponents[theComponent][4]) + "</td>";
									xmlCf += "</tr>";
														
									xmlCf += "<tr>";
									xmlCf += "<td colspan=\"2\">&nbsp;</td>";
									xmlCf += "<td align=\"left\" colspan=\"14\">" + nlapiEscapeXML(theComponents[theComponent][1]) + "</td>";
									xmlCf += "</tr>";
														
									xmlCf += "<tr>";
									xmlCf += "<td colspan=\"2\">&nbsp;</td>";
									xmlCf += "<td align=\"left\" colspan=\"14\"><b>" + nlapiEscapeXML(theComponents[theComponent][2]) + "</b></td>";
									xmlCf += "</tr>";

									xmlCf += "<tr>";
									xmlCf += "<td colspan=\"18\">&nbsp;</td>";
									xmlCf += "</tr>";
								}
							
							//Finish the item table
							//
							xmlCf += "</table>";
							
						}
					
					//Finish the item table
					//
					//xmlCf += "</table>";
					
					//Add in the operator signature boxes
					//
					xmlCf += "<p/>";
					xmlCf += "<table class=\"total\" style=\"width: 100%; page-break-inside: avoid;\">";
					xmlCf += "<tr class=\"totalrow\">";
					xmlCf += "<td class=\"totalcell\" align=\"left\" style=\"padding-left: 5px;\"><b>Picked (Initials):</b></td>";
					xmlCf += "<td class=\"totalcell\" align=\"left\" style=\"padding-left: 5px;\"><b>Date:</b></td>";
					xmlCf += "</tr>";
					xmlCf += "<tr class=\"totalrow\">";
					xmlCf += "<td class=\"totalcell\" align=\"left\" style=\"padding-left: 5px;\"><b>Checked (Initials):</b></td>";
					xmlCf += "<td class=\"totalcell\" align=\"left\" style=\"padding-left: 5px;\"><b>Date:</b></td>";
					xmlCf += "</tr>";
					xmlCf += "</table>";
					
					//Finish the body
					//
					xmlCf += "</body>";
					
					//Finish the pdf
					//
					xmlCf += "</pdf>";
					
					if(PRINT_CONSOLIDATED_FINISHED_ITEMS)
						{
							xml += xmlCf;
						}
					
					xmlCf = '';
					
					//
					//=====================================================================
					// End of summary finished items list
					//=====================================================================
					//
					
				}
				//
				//End of loop through data
				//

				
				//Finish the pdfset
				//
				xml += "</pdfset>";
				
				//
				//=====================================================================
				// End of pdf generation
				//=====================================================================
				//
				
				//Convert to pdf using the BFO library
				//
				var pdfFileObject = nlapiXMLToPDF(xml);
				
				//Build the file name
				//
				var today = new Date();
				var pdfFileName = 'Production Batch Documentation ' + today.toUTCString();
				
				//Set the file name & folder
				//
				pdfFileObject.setName(pdfFileName);
				pdfFileObject.setFolder(-10);

			    //Upload the file to the file cabinet.
				//
			    var fileId = nlapiSubmitFile(pdfFileObject);
			 
			    var remaining = nlapiGetContext().getRemainingUsage();
				
			    //Attach file to the batches
			    //
			    for (var int6 = 0; int6 < batchesArray.length; int6++) 
			    {
					var batchId = batchesArray[int6];
					
					nlapiAttachRecord("file", fileId, "customrecord_bbs_assembly_batch", batchId); // 10GU's
				}
			    
				//Send back the output in the response message
				//
				response.setContentType('PDF', 'Production Batch Documents', 'inline');
				response.write(pdfFileObject.getValue());
				
				break;
		}
	}
}

//=====================================================================
//Functions
//=====================================================================
//
function getItemRecType(ItemType)
{
	var itemType = '';
	
	switch(ItemType)
	{
		case 'InvtPart':
			itemType = 'inventoryitem';
			break;
			
		case 'Assembly':
			itemType = 'assemblyitem';
			break;
			
		case 'NonInvtPart':
			itemType = 'noninventoryitem';
			break;
	}

	return itemType;
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

function getResults(search)
{
	var searchResult = search.runSearch();
	
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



