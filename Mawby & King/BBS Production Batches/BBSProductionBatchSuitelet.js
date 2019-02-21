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
		var thickness = request.getParameter('thickness');
		var thicknessText = request.getParameter('thicknesstext');
		var mode = 'C'; 												//U = update existing production batch, C = create a production batch
		var productType = request.getParameter('producttype'); 
		var productTypeText = request.getParameter('producttypetext'); 
		var batches = request.getParameter('batches'); 
		var glassSpec = request.getParameter('glassspec'); 
		var glassSpecText = request.getParameter('glassspectext'); 
		var startDate = request.getParameter('startdate');
		var endDate = request.getParameter('enddate');
		var stockFlag = request.getParameter('stockflag');
		var stockFlagText = request.getParameter('stockflagtext');
		
		stage = (stage == null || stage == '' || stage == 0 ? 1 : stage);
		
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
		
		//Store the glass spec in a field in the form so that it can be retrieved in the POST section of the code
		//
		var glassSpecTextField = form.addField('custpage_glass_spec_text', 'text', 'Glass Spec Text');
		glassSpecTextField.setDisplayType('hidden');
		glassSpecTextField.setDefaultValue(glassSpecText);
		
		//Store the product type in a field in the form so that it can be retrieved in the POST section of the code
		//
		var productTypeTextField = form.addField('custpage_prod_type_text', 'text', 'Product Type Text');
		productTypeTextField.setDisplayType('hidden');
		productTypeTextField.setDefaultValue(productTypeText);
		
		//Store the thickness type text in a field in the form so that it can be retrieved in the POST section of the code
		//
		var thicknessTextField = form.addField('custpage_thickness_text', 'text', 'Thickness Text');
		thicknessTextField.setDisplayType('hidden');
		thicknessTextField.setDefaultValue(thicknessText);
		
		//Store the stockflag text in a field in the form so that it can be retrieved in the POST section of the code
		//
		var stockflagtextField = form.addField('custpage_stockflag_text', 'text', 'stockflag Text');
		stockflagtextField.setDisplayType('hidden');
		stockflagtextField.setDefaultValue(stockFlagText);
		

		//Set the form title
		//
		var prodBatchTitle = 'Create Production Batches For Works Orders';

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
				var producttypeField = form.addField('custpage_product_type_select', 'select', 'Product Type', 'customlist_bbs_item_product_type','custpage_grp2');
				var glassspecField = form.addField('custpage_glass_spec_select', 'select', 'Glass Spec', null,'custpage_grp2');
				var thicknessField = form.addField('custpage_thickness_select', 'select', 'Thickness', 'customlist_bbs_item_thickness','custpage_grp2');
				var stockflagField = form.addField('custpage_stockflag_select', 'select', 'Stock / Processed', 'customlist_bbs_item_stock_processed','custpage_grp2');
				
				
				//Hide the glass spec by default
				//
				//glassspecField.setDisplayType('hidden');
				
				var startDateField = form.addField('custpage_start_date', 'date', 'Ship Date Range From', null,'custpage_grp2');
				var endDateField = form.addField('custpage_end_date', 'date', 'Ship Date Range To', null,'custpage_grp2');
				
				var today = new Date();
				var todayString = nlapiDateToString(today);
				startDateField.setDefaultValue(todayString);
				endDateField.setDefaultValue(todayString);
				startDateField.setLayoutType('normal', 'startcol');
				
				//Find the glass specs
				//
				var glassSpecSearch = nlapiSearchRecord("noninventoryresaleitem",null,
						[
						   ["type","anyof","NonInvtPart"], 
						   "AND", 
						   ["subtype","anyof","Resale"], 
						   "AND", 
						   ["custitem_bbs_item_product_type","anyof","5"]
						], 
						[
						   new nlobjSearchColumn("itemid").setSort(false), 
						   new nlobjSearchColumn("salesdescription")			   
						]
						);
				
				glassspecField.addSelectOption(0, '', true);
				
				if(glassSpecSearch)
					{
						for (var int4 = 0; int4 < glassSpecSearch.length; int4++) 
							{
								var glassSpecId = glassSpecSearch[int4].getId();
								var glassSpecDesc = glassSpecSearch[int4].getValue("salesdescription");
								
								glassspecField.addSelectOption(glassSpecId, glassSpecDesc, false);
							}
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
			
				var producttypeField = form.addField('custpage_product_type_select', 'text', 'Product Type', null, 'custpage_grp2');
				producttypeField.setDisplayType('disabled');
				producttypeField.setDefaultValue(productTypeText);

				
				var glassspecField = form.addField('custpage_glass_spec_select', 'text', 'Glass Spec', null, 'custpage_grp2');
				glassspecField.setDisplayType('disabled');
				glassspecField.setDefaultValue(glassSpecText);
				
				if(productType != '5')
					{
						glassspecField.setDisplayType('hidden');
					}
				
				var thicknessField = form.addField('custpage_thickness_select', 'text', 'Thickness', null, 'custpage_grp2');
				thicknessField.setDisplayType('disabled');
				thicknessField.setDefaultValue(thicknessText);

				var stockflagField = form.addField('custpage_stockflag_select', 'text', 'Stock / Processed', null, 'custpage_grp2');
				stockflagField.setDisplayType('disabled');
				stockflagField.setDefaultValue(stockFlagText);
				
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
				var listCustomer = subList.addField('custpage_sublist_customer', 'text', 'WO Customer', null);
				var listAssembly = subList.addField('custpage_sublist_assembly', 'text', 'Assembly', null);
				var listBelongs = subList.addField('custpage_sublist_belongs', 'text', 'Assembly Belongs To', null);
				var listQty = subList.addField('custpage_sublist_qty', 'float', 'Qty Required', null);
				var listShipDate = subList.addField('custpage_sublist_ship_date', 'date', 'Ship Date', null);
				
				var listShipPlanned = subList.addField('custpage_sublist_ship_planned', 'date', 'Planned Date', null);
						
				var listDate = subList.addField('custpage_sublist_date', 'date', 'Date Entered', null);
				
				var listProductType = subList.addField('custpage_sublist_product_type', 'text', 'Product Type', null);
				var listGlassSpec = subList.addField('custpage_sublist_glass_spec', 'text', 'Glass Spec', null);
				var listThickness = subList.addField('custpage_sublist_thickness', 'text', 'Thickness', null);
				var listStockFlag = subList.addField('custpage_sublist_stock_flag', 'text', 'Stock / Processed', null);
				
				var listId = subList.addField('custpage_sublist_id', 'text', 'Id', null);
				listId.setDisplayType('hidden');
				
				var listSoTranId = subList.addField('custpage_sublist_so_tranid', 'text', 'Sales Order TranId', null);
				listSoTranId.setDisplayType('hidden');
				
				var listCustEntityId = subList.addField('custpage_sublist_cust_entityid', 'text', 'Customer EntityId', null);
				listCustEntityId.setDisplayType('hidden');
				
				
				var filterArray = [
				                   ["mainline","is","T"], 
				                   "AND", 
				                   ["type","anyof","WorkOrd"], 
				                   "AND", 
				                   ["custbody_bbs_wo_batch","anyof","@NONE@"], 
				                   "AND", 
				                   ["status","anyof","WorkOrd:A","WorkOrd:B","WorkOrd:D"]
				                ];
				
				if(customerId != '')
					{
						filterArray.push("AND",["entity","anyof",customerId]);
					}
				
				if(belongsToId != '')
					{
						filterArray.push("AND",["item.custitem_bbs_item_belongs_to","anyof",belongsToId]);
					}
				
				if(thickness != '')
					{
						filterArray.push("AND",["item.custitem_bbs_item_thickness","anyof",thickness]);
					}
				
				if(stockFlag != '')
					{
						filterArray.push("AND",["item.custitem_bbs_item_stocked","is",stockFlag]);
					}
			
				//Search by product type except if the product type filter is set to 'glass spec'
				//
				if(productType != '' && productType != '5')
					{
						filterArray.push("AND",["item.custitem_bbs_item_product_type","anyof",productType]);
					}
				
				if(glassSpec != '' && glassSpec != '0')
					{
						filterArray.push("AND",["item.custitem_bbs_glass_spec","anyof",glassSpec]);
					}
				
				if(startDate != '')
					{
						filterArray.push("AND",["createdfrom.shipdate","onorafter",startDate]);
					}
				
				if(endDate != '')
					{
						filterArray.push("AND",["createdfrom.shipdate","onorbefore",endDate]);
					}
					
				var woSearch = nlapiCreateSearch("transaction", filterArray, 
						[
						   new nlobjSearchColumn("tranid",null,null), 
						   new nlobjSearchColumn("entity",null,null), 
						   new nlobjSearchColumn("item",null,null), 
						   new nlobjSearchColumn("custitem_bbs_item_belongs_to","item",null), 
						   new nlobjSearchColumn("custitem_bbs_item_thickness","item",null), 
						   new nlobjSearchColumn("custitem_bbs_item_stocked","item",null), 
						   new nlobjSearchColumn("custitem_bbs_item_product_type","item",null), 
						   new nlobjSearchColumn("custitem_bbs_glass_spec","item",null), 
						   new nlobjSearchColumn("quantity",null,null), 
						   new nlobjSearchColumn("datecreated",null,null), 
						   new nlobjSearchColumn("createdfrom",null,null),
						   new nlobjSearchColumn("tranid","createdFrom",null), 
						   new nlobjSearchColumn("externalid","customer",null),
						   new nlobjSearchColumn("shipdate","createdFrom",null),
						   new nlobjSearchColumn("custbody_bbs_sales_planned_ship","createdFrom",null)
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
						subList.setLineItemValue('custpage_sublist_belongs', line, searchResultSet[int].getText('custitem_bbs_item_belongs_to','item'));
						subList.setLineItemValue('custpage_sublist_qty', line, searchResultSet[int].getValue('quantity'));
						
						subList.setLineItemValue('custpage_sublist_date', line, searchResultSet[int].getValue('datecreated').split(' ')[0]);
						
						subList.setLineItemValue('custpage_sublist_id', line, searchResultSet[int].getId());
						subList.setLineItemValue('custpage_sublist_so_tranid', line, searchResultSet[int].getValue('tranid','createdFrom'));
						subList.setLineItemValue('custpage_sublist_cust_entityid', line, searchResultSet[int].getValue('externalid','customer'));
						subList.setLineItemValue('custpage_sublist_ship_date', line, searchResultSet[int].getValue("shipdate","createdFrom"));
						subList.setLineItemValue('custpage_sublist_ship_planned', line, searchResultSet[int].getValue("custbody_bbs_sales_planned_ship","createdFrom"));
						
						subList.setLineItemValue('custpage_sublist_product_type', line, searchResultSet[int].getText('custitem_bbs_item_product_type', 'item'));
						subList.setLineItemValue('custpage_sublist_glass_spec', line, searchResultSet[int].getText('custitem_bbs_glass_spec'));
						subList.setLineItemValue('custpage_sublist_thickness', line, searchResultSet[int].getText('custitem_bbs_item_thickness', 'item'));
						subList.setLineItemValue('custpage_sublist_stock_flag', line, searchResultSet[int].getText("custitem_bbs_item_stocked","item"));
						
					}
		
																																																																																form.addSubmitButton('Create Production Batches');
	
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
				var thickness = request.getParameter('custpage_thickness_select');
				var thicknesstext = request.getParameter('custpage_thickness_text');
				var mode = request.getParameter('custpage_mode');
				var producttype = request.getParameter('custpage_product_type_select');
				var producttypetext = request.getParameter('custpage_prod_type_text');
				var glassspec = request.getParameter('custpage_glass_spec_select');
				var glassspectext = request.getParameter('custpage_glass_spec_text');
				var startDate = request.getParameter('custpage_start_date');
				var endDate = request.getParameter('custpage_end_date');
				var stockflag = request.getParameter('custpage_stockflag_select');
				var stockflagtext = request.getParameter('custpage_stockflag_text');
				var otherrefnum = request.getParameter('custpage_stockflag_text');
				
				
				//Build up the parameters so we can call this suitelet again, but move it on to the next stage
				//
				var params = new Array();
				params['customerid'] = customerId;
				params['belongstoid'] = belongsToId;
				params['productionbatchid'] = productionBatchId;
				params['stage'] = '2';
				params['thickness'] = thickness;
				params['thicknesstext'] = thicknesstext;
				params['mode'] = mode;
				params['producttype'] = producttype;
				params['producttypetext'] = producttypetext;
				params['glassspec'] = glassspec;
				params['glassspectext'] = glassspectext;
				params['startdate'] = startDate;
				params['enddate'] = endDate;
				params['stockflag'] = stockflag;
				params['stockflagtext'] = stockflagtext;
				
				response.sendRedirect('SUITELET',nlapiGetContext().getScriptId(), nlapiGetContext().getDeploymentId(), null, params);
				
				break;
				
			case 2:
				
				var lineCount = request.getLineItemCount('custpage_sublist_items');
				var productionBatchId = request.getParameter('custpage_production_batch');
				var mode = request.getParameter('custpage_mode');
				
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
										var soTranId = request.getLineItemValue('custpage_sublist_items', 'custpage_sublist_so_tranid', int);
										var custEntityId = request.getLineItemValue('custpage_sublist_items', 'custpage_sublist_cust_entityid', int);
										var custEntity = request.getLineItemValue('custpage_sublist_items', 'custpage_sublist_customer', int);
										
										//Build the batch key (which is used as the batch description)
										//
										var key = new Date().getTime().toString();
										

										
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
					
						var prodBatchId = '';
												
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
						
						response.sendRedirect('SUITELET',nlapiGetContext().getScriptId(), nlapiGetContext().getDeploymentId(), null, params);
						
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
				var stockOrSales = '';
				
				var filters = new Array();
				filters[0] = new nlobjSearchFilter('internalid', null, 'anyof', batchesArray);
				
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
				var xml = "<?xml version=\"1.0\"?>\n<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n<pdfset>";  // Main XML
				var xmlPb = ''; // Production Batch XML
				var xmlPt = ''; // Production Ticket XML
				
				//
				//=====================================================================
				// Produce the batch picking list
				//=====================================================================
				//
				
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
							   new nlobjSearchColumn("custitem_bbs_item_belongs_to","item",null),
							   new nlobjSearchColumn("custitem_bbs_item_product_type","item",null),
							   new nlobjSearchColumn("item",null,null),
							   new nlobjSearchColumn("type","item",null),
							   new nlobjSearchColumn("description","item",null),
							   new nlobjSearchColumn("mainline",null,null),
							   new nlobjSearchColumn("quantitycommitted",null,null),
							   new nlobjSearchColumn("tranid","createdfrom",null),
							   new nlobjSearchColumn("shipdate","createdfrom",null),
							   new nlobjSearchColumn("parent","item",null),
							   new nlobjSearchColumn("unit")
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
					var thisEntity = '';
					var thisSalesOrder = '';
					var thisShipDate = '';
					var thisShipDay = '';
					var thisShipDateFormatted = '';
					var thisthickness = '';
					

					if(searchResultSet != null && searchResultSet.length > 0)
						{
							thisEntity = searchResultSet[0].getValue("entity");
							thisSalesOrder = searchResultSet[0].getValue("tranid","createdfrom");
							thisShipDate = searchResultSet[0].getValue("shipdate","createdfrom");

							if(thisShipDate != null && thisShipDate != '')
								{
									thisShipDay = (nlapiStringToDate(thisShipDate)).format('D');
									thisShipDateFormatted = (nlapiStringToDate(thisShipDate)).format('d F Y');
								}
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
					xmlPb += "<td colspan=\"2\" align=\"right\" style=\"font-size:16px; padding-bottom: 10px;\">" + nlapiEscapeXML(thisthickness) + "</td>";
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
					xmlPb += "<td align=\"left\" style=\"font-size:16px; padding-bottom: 10px; padding-left: 50px;\" colspan=\"9\">" + nlapiEscapeXML(batchId) + "</td>";
					xmlPb += "</tr>";
					
					xmlPb += "<tr>";
					xmlPb += "<td align=\"center\" style=\"font-size:20px;\">&nbsp;</td>";
					xmlPb += "<td align=\"center\" style=\"font-size:20px;\">&nbsp;</td>";
					xmlPb += "</tr>";
					
					//xmlPb += "<tr>";
					//xmlPb += "<td align=\"left\" colspan=\"4\" style=\"font-size:12px; padding-bottom: 10px;\"><b>Sales Order</b></td>";
					//xmlPb += "<td align=\"left\" colspan=\"3\" style=\"padding-bottom: 10px;\"><barcode codetype=\"code128\" showtext=\"false\" value=\"" + nlapiEscapeXML(thisSalesOrder) + "\"/></td>";
					//xmlPb += "<td align=\"left\" style=\"font-size:16px; padding-bottom: 10px; padding-left: 50px;\" colspan=\"9\">" + nlapiEscapeXML(thisSalesOrder) + "</td>";
					//xmlPb += "</tr>";
					

					xmlPb += "</table></macro>";

					xmlPb += "</macrolist>";
					xmlPb += "</head>";
					
					//Body
					//
					xmlPb += "<body header=\"nlheader\" header-height=\"100px\" footer=\"nlfooter\" footer-height=\"5px\" padding=\"0.5in 0.5in 0.5in 0.5in\" size=\"A4\">";
					
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
								var woAssemblyItemProdType		= searchResultSet[int3].getValue('custitem_bbs_item_product_type','item');
								var woAssemblyItemDesc 			= searchResultSet[int3].getValue('description','item');
								var woAssemblyItemQty 			= (Number(searchResultSet[int3].getValue('quantity')).toFixed(0));
								var woAssemblyItemCommitted 	= (Number(searchResultSet[int3].getValue('quantitycommitted')).toFixed(0));
								var woMainline 					= searchResultSet[int3].getValue('mainline');
								var woItemType 					= searchResultSet[int3].getValue("type","item");
								var woAssemblyParent			= searchResultSet[int3].getValue("parent","item");
								var woAssemblyItemUnits 		= searchResultSet[int3].getValue('unit');
								
								if(woMainline == '*')
									{										
										if(firstTime)
											{
												firstTime = false;
											}
										else
											{
												xmlPb += "</table>";
											}
										
										xmlPb += "<table class=\"itemtable\" style=\"width: 100%; page-break-inside: avoid;\">";
										xmlPb += "<thead >";
										xmlPb += "<tr >";
										xmlPb += "<th colspan=\"2\">Works Order</th>";
										xmlPb += "<th align=\"left\" colspan=\"12\">Component</th>";
                                      	xmlPb += "<th align=\"left\" colspan=\"2\">Quantity</th>";
										xmlPb += "<th align=\"center\" colspan=\"4\">Lot Numbers</th>";
                                      
										xmlPb += "</tr>";
										xmlPb += "</thead>";
										
										xmlPb += "<tr>";
										xmlPb += "<td  style=\"border-top: 1px; border-top-color: black;\" colspan=\"2\">" + nlapiEscapeXML(searchResultSet[int3].getValue('tranid')) + "</td>";
										xmlPb += "<td  style=\"border-top: 1px; border-top-color: black; font-size: 10pt;\" align=\"left\" colspan=\"12\"><b>" + nlapiEscapeXML(removePrefix(woAssemblyItem)) + "</b></td>";
										xmlPb += "<td  style=\"border-top: 1px; border-top-color: black;\" align=\"left\" colspan=\"2\">&nbsp;</td>";
										xmlPb += "<td  style=\"border-top: 1px; border-top-color: black; border: 1px solid black;\" align=\"left\" rowspan=\"2\" colspan=\"4\">&nbsp;</td>";
										xmlPb += "</tr>";
															
										xmlPb += "<tr>";
										xmlPb += "<td colspan=\"2\" style=\"font-size: 5pt;\"> &nbsp;</td>";
										xmlPb += "<td align=\"left\" colspan=\"12\">" + nlapiEscapeXML(woAssemblyItemDesc) + "</td>";
										xmlPb += "<td align=\"left\" colspan=\"2\">&nbsp;</td>";
										//xmlPb += "<td align=\"left\" colspan=\"4\">&nbsp;</td>";
										xmlPb += "</tr>";	
                                      	
										xmlPb += "<tr>";
										xmlPb += "<td colspan=\"2\" style=\"font-size: 5pt;\"> &nbsp;</td>";
										xmlPb += "<td align=\"left\" colspan=\"12\">&nbsp;</td>";
										xmlPb += "<td align=\"left\" colspan=\"2\">&nbsp;</td>";
										xmlPb += "<td align=\"left\" colspan=\"4\">&nbsp;</td>";
										xmlPb += "</tr>";	
										
									}
								else
									{

										//Only print out non-assembly items that are of product type 'Glass Spec"
										//
										if(woItemType != 'Assembly' && woAssemblyItemProdType == '5')
											{
												xmlPb += "<tr>";
												xmlPb += "<td colspan=\"2\">&nbsp;</td>";
												xmlPb += "<td align=\"left\" colspan=\"12\" style=\"font-size: 10pt; margin-top: 5px;\"><b>" + nlapiEscapeXML(removePrefix(woAssemblyItem)) + "</b></td>";
												xmlPb += "<td align=\"left\" colspan=\"2\" style=\"padding-right: 5px; margin-top: 5px;\">" + nlapiEscapeXML(woAssemblyItemQty) + " (" + nlapiEscapeXML(woAssemblyItemUnits) + ")</td>";
												xmlPb += "<td align=\"left\" colspan=\"4\" style=\"font-size: 8pt; margin-top: 5px;\">&nbsp;</td>";
												xmlPb += "</tr>";
																	
												xmlPb += "<tr>";
												xmlPb += "<td colspan=\"2\">&nbsp;</td>";
												xmlPb += "<td align=\"left\" colspan=\"12\" style=\"font-size: 8pt; margin-top: 5px; vertical-align: middle;\">" + nlapiEscapeXML(woAssemblyItemDesc) + "</td>";
												xmlPb += "<td align=\"left\" colspan=\"2\" style=\"font-size: 8pt; margin-top: 5px; vertical-align: middle;\">&nbsp;</td>";
												xmlPb += "<td align=\"left\" colspan=\"4\" style=\"font-size: 8pt; margin-top: 5px; vertical-align: middle;\">&nbsp;</td>";
												xmlPb += "</tr>";
												
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

					//xml += xmlPb;

					xmlPb = '';
					
					
				}
				//
				//End of loop through data
				//

				
				//
				//=====================================================================
				// Produce the production ticket
				//=====================================================================
				//
				
				//Loop through the batch data
				//
				for (var int2 = 0; int2 < batchResults.length; int2++) 
				{
					//
					//Produce the batch pick documents
					//
					var batchId = batchResults[int2].getId();
					var batchDescription = batchResults[int2].getValue('custrecord_bbs_bat_description');
					var batchName = batchResults[int2].getValue('name');

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
							   new nlobjSearchColumn("custitem_bbs_item_belongs_to","item",null),
							   new nlobjSearchColumn("custitem_bbs_item_product_type","item",null),
							   new nlobjSearchColumn("item",null,null),
							   new nlobjSearchColumn("type","item",null),
							   new nlobjSearchColumn("description","item",null),
							   new nlobjSearchColumn("mainline",null,null),
							   new nlobjSearchColumn("quantitycommitted",null,null),
							   new nlobjSearchColumn("tranid","createdfrom",null),
							   new nlobjSearchColumn("shipdate","createdfrom",null),
							   new nlobjSearchColumn("parent","item",null),
							   new nlobjSearchColumn("custbody_bbs_prodn_scrap_allowance",null,null),
							   new nlobjSearchColumn("custbody_bbs_order_delivery_notes","createdfrom",null),
							   new nlobjSearchColumn("purchaseunit","item",null),
							   new nlobjSearchColumn("shipdate","createdfrom",null),
							   new nlobjSearchColumn("custbody_bbs_sales_planned_ship","createdfrom",null),
							   new nlobjSearchColumn("custbody_bbs_wo_copies")
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
					var thisEntity = '';
					var thisSalesOrder = '';
					var thisShipDate = '';
					var thisShipDay = '';
					var thisShipDateFormatted = '';
					var thisthickness = '';
					

					if(searchResultSet != null && searchResultSet.length > 0)
						{
							thisEntity = searchResultSet[0].getValue("entity");
							thisSalesOrder = searchResultSet[0].getValue("tranid","createdfrom");
							thisShipDate = searchResultSet[0].getValue("shipdate","createdfrom");

							if(thisShipDate != null && thisShipDate != '')
								{
									thisShipDay = (nlapiStringToDate(thisShipDate)).format('D');
									thisShipDateFormatted = (nlapiStringToDate(thisShipDate)).format('d F Y');
								}
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
							var previousCopies = Number(0);
							
							for (var int3 = 0; int3 < searchResultSet.length; int3++) 
							{
								var woId 						= searchResultSet[int3].getId();
								var woAssemblyItemId 			= searchResultSet[int3].getValue('item');
								var woAssemblyItem 				= searchResultSet[int3].getText('item');
								var woAssemblyItemProdType		= searchResultSet[int3].getValue('custitem_bbs_item_product_type','item');
								var woAssemblyItemDesc 			= searchResultSet[int3].getValue('description','item');
								var woAssemblyItemQty 			= (Number(searchResultSet[int3].getValue('quantity')).toFixed(0));
								var woAssemblyItemCommitted 	= (Number(searchResultSet[int3].getValue('quantitycommitted')).toFixed(0));
								var woMainline 					= searchResultSet[int3].getValue('mainline');
								var woItemType 					= searchResultSet[int3].getValue("type","item");
								var woAssemblyParent			= searchResultSet[int3].getValue("parent","item");
								var woAssemblyUnit 				= searchResultSet[int3].getText('purchaseunit',"item");
								var woSalesOrder 				= searchResultSet[int3].getValue("tranid","createdfrom");
								var woEntity 					= searchResultSet[int3].getText("entity");
								var woEntityId 					= searchResultSet[int3].getValue("entity");
								var woSalesOrderShipDate		= searchResultSet[int3].getValue("shipdate","createdfrom");
								var woScrapAllowance			= searchResultSet[int3].getValue("custbody_bbs_prodn_scrap_allowance");
								var woSalesOrderNotes			= searchResultSet[int3].getValue("custbody_bbs_order_delivery_notes","createdfrom");
								var woSalesOrderPlanned			= searchResultSet[int3].getValue("custbody_bbs_sales_planned_ship","createdfrom");
								var woCopies					= Number(searchResultSet[int3].getValue("custbody_bbs_wo_copies"));
								
								woCopies = (woCopies == 0 || woCopies < 0 ? 1 : woCopies);
								
								var woCustPartNo = findCustPartNo(woEntityId, woAssemblyItemId);
								
								if(woMainline == '*')
									{											
										if(firstTime)
											{
												previousCopies = woCopies;
											
												firstTime = false;
											}
										else
											{
												xmlPt += "</table>";

												//Finish the body
												//
												xmlPt += "</body>";
												
												//Finish the pdf
												//
												xmlPt += "</pdf>";
												
												//Copy the resulting pdf the relevant number of times
												//
												for (var int5 = 0; int5 < previousCopies; int5++) 
													{
														xml += xmlPt;
													}
												
												previousCopies = woCopies;
												
												xmlPt = '';
											}
										
										//Header & style sheet
										//
										xmlPt += "<pdf>"
										xmlPt += "<head>";
										xmlPt += "<style type=\"text/css\">table {font-family: Calibri, Candara, Segoe, \"Segoe UI\", Optima, Arial, sans-serif;font-size: 9pt;table-layout: fixed;}";
										xmlPt += "th {font-weight: bold;font-size: 8pt;padding: 0px;border-bottom: 1px solid black;border-collapse: collapse;}";
										xmlPt += "td {padding: 0px;vertical-align: top;font-size:10px;}";
										xmlPt += "b {font-weight: bold;color: #333333;}";
										xmlPt += "table.header td {padding: 0px;font-size: 10pt;}";
										xmlPt += "table.footer td {padding: 0;font-size: 10pt;}";
										xmlPt += "table.itemtable th {padding-bottom: 0px;padding-top: 0px;}";
										xmlPt += "table.body td {padding-top: 0px;}";
										xmlPt += "table.total {page-break-inside: avoid;}";
										xmlPt += "table.message{border: 1px solid #dddddd;}";
										xmlPt += "tr.totalrow {line-height: 300%;}";
										xmlPt += "tr.messagerow{font-size: 6pt;}";
										xmlPt += "td.totalboxtop {font-size: 12pt;background-color: #e3e3e3;}";
										xmlPt += "td.addressheader {font-size: 10pt;padding-top: 0px;padding-bottom: 0px;}";
										xmlPt += "td.address {padding-top: 0;font-size: 10pt;}";
										xmlPt += "td.totalboxmid {font-size: 28pt;padding-top: 20px;background-color: #e3e3e3;}";
										xmlPt += "td.totalcell {border: 1px solid black;border-collapse: collapse;}";
										xmlPt += "td.message{font-size: 8pt;}";
										xmlPt += "td.totalboxbot {background-color: #e3e3e3;font-weight: bold;}";
										xmlPt += "span.title {font-size: 28pt;}";
										xmlPt += "span.number {font-size: 16pt;}";
										xmlPt += "span.itemname {font-weight: bold;line-height: 150%;}";
										xmlPt += "hr {width: 100%;color: #d3d3d3;background-color: #d3d3d3;height: 1px;}";
										xmlPt += "</style>";

								        //Macros
								        //
										xmlPt += "<macrolist>";
										xmlPt += "<macro id=\"nlfooter\">";	
										
										xmlPt += "<table style=\"width: 100%; border: 1px solid black; \">";
										
										xmlPt += "<tr>";
										xmlPt += "<td colspan=\"6\" align=\"left\" style=\"font-size:12px; padding-left: 5px; padding-bottom: 5px;\"><b>Production Details</b></td>";
										xmlPt += "</tr>";
										
										xmlPt += "<tr>";
										xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; padding-left: 5px; padding-bottom: 5px;\">Order Qty:</td>";
										xmlPt += "<td colspan=\"2\" align=\"left\" style=\"font-size:12px; padding-bottom: 5px;\">" + woAssemblyItemQty + " " + nlapiEscapeXML(woScrapAllowance) + "</td>";
										xmlPt += "<td colspan=\"3\" align=\"left\" style=\"font-size:12px; padding-bottom: 5px;\">Employee Name:</td>";
										xmlPt += "</tr>";
										
										xmlPt += "<tr>";
										xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; padding-left: 5px; padding-bottom: 5px;\">Produced Qty:</td>";
										xmlPt += "<td colspan=\"2\" align=\"left\" style=\"font-size:12px; padding-bottom: 5px;\">&nbsp;</td>";
										xmlPt += "<td colspan=\"3\" align=\"left\" style=\"font-size:12px; padding-bottom: 5px;\">Clock Card No:</td>";
										xmlPt += "</tr>";
										
										xmlPt += "<tr>";
										xmlPt += "<td colspan=\"6\" align=\"left\" style=\"font-size:12px; padding-left: 5px; padding-bottom: 5px;\"><b>Wastage:</b></td>";
										xmlPt += "</tr>";
										
										xmlPt += "<tr style=\"line-height: 300%;\">";
										xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; margin: 2px 20px 2px 5px; border: 1px solid black;\">&nbsp;</td>";
										xmlPt += "<td colspan=\"2\" align=\"left\" style=\"font-size:12px;\">Seeds</td>";
										xmlPt += "<td colspan=\"3\" rowspan=\"5\" align=\"left\" style=\"font-size:12px;\">Other Details:</td>";
										xmlPt += "</tr>";
										
										xmlPt += "<tr style=\"line-height: 300%;\">";
										xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; margin: 2px 20px 2px 5px; border: 1px solid black;\">&nbsp;</td>";
										xmlPt += "<td colspan=\"2\" align=\"left\" style=\"font-size:12px;\">Scratches</td>";
										//xmlPt += "<td colspan=\"3\" align=\"left\" style=\"font-size:12px; padding-bottom: 5px;\">&nbsp;</td>";
										xmlPt += "</tr>";
										
										xmlPt += "<tr style=\"line-height: 300%;\">";
										xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; margin: 2px 20px 2px 5px; border: 1px solid black;\">&nbsp;</td>";
										xmlPt += "<td colspan=\"2\" align=\"left\" style=\"font-size:12px;\">Stains</td>";
										//xmlPt += "<td colspan=\"3\" align=\"left\" style=\"font-size:12px; padding-bottom: 5px;\">&nbsp;</td>";
										xmlPt += "</tr>";
										
										xmlPt += "<tr style=\"line-height: 300%;\">";
										xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; margin: 2px 20px 2px 5px; border: 1px solid black;\">&nbsp;</td>";
										xmlPt += "<td colspan=\"2\" align=\"left\" style=\"font-size:12px;\">Breakages</td>";
										//xmlPt += "<td colspan=\"3\" align=\"left\" style=\"font-size:12px; padding-bottom: 5px;\">&nbsp;</td>";
										xmlPt += "</tr>";
										
										xmlPt += "<tr style=\"line-height: 300%;\">";
										xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; margin: 2px 20px 2px 5px; border: 1px solid black;\">&nbsp;</td>";
										xmlPt += "<td colspan=\"2\" align=\"left\" style=\"font-size:12px;\">Poor Process Quality</td>";
										//xmlPt += "<td colspan=\"3\" align=\"left\" style=\"font-size:12px; padding-bottom: 5px;\">&nbsp;</td>";
										xmlPt += "</tr>";
										xmlPt += "</table>";

										xmlPt += "<table class=\"footer\" style=\"width: 100%;\">";
										xmlPt += "<tr><td align=\"left\" style=\"font-size:6px;\">Printed: " + now + "</td><td align=\"right\" style=\"font-size:6px;\">Page <pagenumber/> of <totalpages/></td></tr>";
										xmlPt += "</table>";
										
										xmlPt += "</macro>";
										xmlPt += "</macrolist>";
										xmlPt += "</head>";
										
										//Body
										//
										xmlPt += "<body footer=\"nlfooter\" footer-height=\"240px\" padding=\"0.5in 0.5in 0.5in 0.5in\" size=\"A4\">";
										
										xmlPt += "<table style=\"width: 100%;\">";
										
										xmlPt += "<tr>";
										xmlPt += "<td colspan=\"6\" align=\"center\" style=\"font-size:20px; padding-bottom: 20px;\"><b>Production Ticket</b></td>";
										xmlPt += "</tr>";
										
										xmlPt += "</table>";
										
										xmlPt += "<table style=\"width: 100%; border: 1px solid black; \">";
										
										xmlPt += "<tr>";
										xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; padding-left: 5px; padding-bottom: 5px;\"><b>Order Details</b></td>";
										xmlPt += "<td colspan=\"5\" align=\"left\" style=\"font-size:12px; padding-bottom: 5px;\">&nbsp;</td>";
										xmlPt += "</tr>";
										
										xmlPt += "<tr>";
										xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; padding-left: 5px; padding-bottom: 5px;\">Sales Order</td>";
										xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; padding-bottom: 5px;\">" + nlapiEscapeXML(woSalesOrder) + "</td>";
										xmlPt += "<td colspan=\"3\" align=\"left\" style=\"font-size:12px; padding-bottom: 5px;\">" + nlapiEscapeXML(woEntity) + "</td>";
										xmlPt += "</tr>";
										
										//xmlPt += "<tr>";
										//xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; padding-left: 5px; padding-bottom: 5px;\">Customer</td>";
										//xmlPt += "<td colspan=\"5\" align=\"left\" style=\"font-size:12px; padding-bottom: 5px;\">" + nlapiEscapeXML(woEntity) + "</td>";
										//xmlPt += "</tr>";
										
										xmlPt += "<tr>";
										xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; padding-left: 5px; padding-bottom: 5px;\">Works Order</td>";
										xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; padding-bottom: 5px;\">" + nlapiEscapeXML(searchResultSet[int3].getValue('tranid')) + "</td>";
										xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; padding-bottom: 5px;\">Production Batch</td>";
										xmlPt += "<td colspan=\"2\" align=\"left\" style=\"font-size:12px; padding-bottom: 5px;\">" + nlapiEscapeXML(batchName) + "</td>";
										xmlPt += "</tr>";
										
										xmlPt += "<tr>";
										xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; padding-left: 5px; padding-bottom: 5px;\">Product</td>";
										xmlPt += "<td colspan=\"5\" align=\"left\" style=\"font-size:12px; padding-bottom: 5px;\">" + nlapiEscapeXML(removePrefix(woAssemblyItem)) + "</td>";
										xmlPt += "</tr>";
										
										xmlPt += "<tr>";
										xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; padding-left: 5px; padding-bottom: 5px;\">Description</td>";
										xmlPt += "<td colspan=\"5\" align=\"left\" style=\"font-size:12px; padding-bottom: 5px;\">" + nlapiEscapeXML(woAssemblyItemDesc) + "</td>";
										xmlPt += "</tr>";
										
										xmlPt += "<tr>";
										xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; padding-left: 5px; padding-bottom: 5px;\">Requested<br/>Delivery Date</td>";
										xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; padding-bottom: 5px;\"><br/>" + woSalesOrderShipDate + "</td>";
										xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; padding-bottom: 5px;\"><br/>Planned Date</td>";
										xmlPt += "<td colspan=\"2\" align=\"left\" style=\"font-size:12px; padding-bottom: 5px;\"><br/>" + woSalesOrderPlanned + "</td>";
										xmlPt += "</tr>";
										
										xmlPt += "<tr>";
										xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; padding-left: 5px; padding-bottom: 5px;\">Order Qty</td>";
										xmlPt += "<td colspan=\"5\" align=\"left\" style=\"font-size:12px; padding-bottom: 5px;\">" + woAssemblyItemQty + "</td>";
										xmlPt += "</tr>";
										
										xmlPt += "<tr>";
										xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; padding-left: 5px; padding-bottom: 5px;\">Scrap Allowance</td>";
										xmlPt += "<td colspan=\"5\" align=\"left\" style=\"font-size:12px; padding-bottom: 5px;\"><br/>" + nlapiEscapeXML(woScrapAllowance) + "</td>";
										xmlPt += "</tr>";
										
										xmlPt += "<tr>";
										xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; padding-left: 5px; padding-bottom: 5px;\">Customer Part No.</td>";
										xmlPt += "<td colspan=\"5\" align=\"left\" style=\"font-size:12px; padding-bottom: 5px;\">" + nlapiEscapeXML(woCustPartNo) + "</td>";
										xmlPt += "</tr>";
										
										xmlPt += "<tr>";
										xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; padding-left: 5px; padding-bottom: 5px;\">Order Notes</td>";
										xmlPt += "<td colspan=\"5\" align=\"left\" style=\"font-size:12px; padding-right: 5px; padding-bottom: 5px;\">" + nlapiEscapeXML(woSalesOrderNotes) + "</td>";
										xmlPt += "</tr>";

										xmlPt += "</table>";
										
										xmlPt += "<p/>";
										
										xmlPt += "<table class=\"itemtable\" style=\"width: 100%; page-break-inside: avoid;\">";
										xmlPt += "<thead >";
										xmlPt += "<tr >";
										xmlPt += "<th align=\"left\" colspan=\"16\"><br/>Operation</th>";
                                      	xmlPt += "<th align=\"right\" colspan=\"2\">Time</th>";
										xmlPt += "<th align=\"right\" colspan=\"2\">Units</th>";
                                      
										xmlPt += "</tr>";
										xmlPt += "</thead>";
											
										
									}
								else
									{

										//Only print out lines that have a product type of Process Cost
										//
										if(woAssemblyItemProdType == '4')
											{
												xmlPt += "<tr>";
												xmlPt += "<td align=\"left\" colspan=\"16\" style=\"font-size: 10pt; margin-top: 5px;\"><b>" + nlapiEscapeXML(removePrefix(woAssemblyItem)) + "</b></td>";
												xmlPt += "<td align=\"right\" colspan=\"2\" style=\"padding-right: 5px; margin-top: 5px;\">" + nlapiEscapeXML(woAssemblyItemQty) + "</td>";
												xmlPt += "<td align=\"right\" colspan=\"2\" style=\"font-size: 8pt; margin-top: 5px;\">" + nlapiEscapeXML(woAssemblyUnit) + "</td>";
												xmlPt += "</tr>";
											
												
											}
									}
							}
							
							//Finish the item table
							//
							xmlPt += "</table>";
							
						}
					
					//Finish the body
					//
					xmlPt += "</body>";
					
					//Finish the pdf
					//
					xmlPt += "</pdf>";

					//Copy the resulting pdf the relevant number of times
					//
					for (var int5 = 0; int5 < previousCopies; int5++) 
						{
							xml += xmlPt;
						}
					
					//xml += xmlPt;

					xmlPt = '';
					
				}

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

function findCustPartNo(_customerId, _itemId)
{
	var custPartNo = '';
	
	var customrecord_scm_customerpartnumberSearch = nlapiSearchRecord("customrecord_scm_customerpartnumber",null,
			[
			   ["custrecord_scm_cpn_customer","anyof",_customerId], 
			   "AND", 
			   ["custrecord_scm_cpn_item","anyof",_itemId]
			], 
			[
			   new nlobjSearchColumn("name").setSort(false)
			]
			);
	
	if(customrecord_scm_customerpartnumberSearch && customrecord_scm_customerpartnumberSearch.length == 1)
		{
			custPartNo = customrecord_scm_customerpartnumberSearch[0].getValue("name");
		}
	
	return custPartNo;
}


