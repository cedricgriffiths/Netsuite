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
		var ffi = request.getParameter('ffi');
		var mode = request.getParameter('mode'); //U = update existing production batch, C = create a production batch
		var soLink = request.getParameter('solink'); // T/F - choose to select w/o that are/are not linked to sales orders
		var soCommitStatus = request.getParameter('socommitstatus'); 
		var soCommitStatusText = request.getParameter('socommitstatustext'); 
		var soId = request.getParameter('soid'); 
		var soText = request.getParameter('sotext'); 
		var batches = request.getParameter('batches'); 
		var woCommitStatus = request.getParameter('wocommitstatus'); 
		var woCommitStatusText = request.getParameter('wocommitstatustext'); 
		
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
				var fullFinishField = form.addField('custpage_ffi_select', 'text', 'Full Finish item', null,'custpage_grp2');
				
				//If we are looking at w/o that are linked to s/o then add specific filters
				//
				if(soLink == 'T')
					{
						var soCommitStatusField = form.addField('custpage_so_commit_select', 'select', 'Sales Order Commitment Status', 'customlist_bbs_commitment_status','custpage_grp2');
					
						var soSelectionField = form.addField('custpage_so_select', 'select', 'Sales Orders', null,'custpage_grp2');
						
						//Now search the available w/o for s/o numbers
						//
						var filterArray = [
						                   ["mainline","is","T"], 
						                   "AND", 
						                   ["type","anyof","WorkOrd"], 
						                   "AND", 
						                   ["custbody_bbs_wo_batch","anyof","@NONE@"], 
						                   "AND", 
						                   ["status","anyof","WorkOrd:A","WorkOrd:B"],
						                   "AND",
						                   ["createdfrom","noneof","@NONE@"]
						                ];
						
						var woSearch = nlapiCreateSearch("transaction", filterArray, 
								[
								   new nlobjSearchColumn("createdfrom",null,null)
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
						
						var soArray = {};
						
						//Build up a list of sales order to pick from
						//
						for (var int = 0; int < searchResultSet.length; int++) 
						{
							var soId = searchResultSet[int].getValue('createdfrom');
							var soText = searchResultSet[int].getText('createdfrom');
							
							if(!soArray[soId])
								{
									soArray[soId] = soText;
								}
						}
						
						soSelectionField.addSelectOption( '', '', true);
						
						for ( var soKey in soArray) 
						{
							soSelectionField.addSelectOption(soKey, soArray[soKey], false);
						}
						
					}
				else
					{
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
			
				var fullFinishField = form.addField('custpage_ffi_select', 'text', 'Full Finish Item', null, 'custpage_grp2');
				fullFinishField.setDisplayType('disabled');
				
				if(ffi != '')
				{
					fullFinishField.setDefaultValue(ffi);
				}
				
				if(soLink == 'T')
				{
					var soCommitStatusField = form.addField('custpage_so_commit_select', 'text', 'Sales Order Commitment Status', null, 'custpage_grp2');
					soCommitStatusField.setDisplayType('disabled');
					soCommitStatusField.setDefaultValue(soCommitStatusText);
					
					var soTextField = form.addField('custpage_so_text_select', 'text', 'Sales Order', null, 'custpage_grp2');
					soTextField.setDisplayType('disabled');
					soTextField.setDefaultValue(soText);
				}
				else
				{
					var woCommitStatusField = form.addField('custpage_wo_commit_select', 'text', 'Works Order Commitment Status', null, 'custpage_grp2');
					woCommitStatusField.setDisplayType('disabled');
					woCommitStatusField.setDefaultValue(woCommitStatusText);
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
				var listSoCommitStatus = subList.addField('custpage_sublist_so_status', 'text', 'Sales Order Status', null);
				var listCustomer = subList.addField('custpage_sublist_customer', 'text', 'WO Customer', null);
				var listAssembly = subList.addField('custpage_sublist_assembly', 'text', 'Assembly', null);
				var listBelongs = subList.addField('custpage_sublist_belongs', 'text', 'Assembly Belongs To', null);
				var listQty = subList.addField('custpage_sublist_qty', 'integer', 'Quantity', null);
				var listDate = subList.addField('custpage_sublist_date', 'text', 'Date Entered', null);
				var listStatus = subList.addField('custpage_sublist_status', 'text', 'WO Commit Status', null);
				var listId = subList.addField('custpage_sublist_id', 'text', 'Id', null);
				listId.setDisplayType('hidden');
				var listFFI = subList.addField('custpage_sublist_ffi', 'text', 'FFI', null);
				var listFinishType = subList.addField('custpage_sublist_finish_type', 'text', 'Finish Type', null);
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
				
				if(ffi != '')
				{
					filterArray.push("AND",["custbody_bbs_wo_ffi.itemid","startswith",ffi]);
				}
				
				if(soCommitStatus != '')
				{
					filterArray.push("AND",["createdfrom.custbody_bbs_commitment_status","anyof",soCommitStatus]);
				}
				
				if(woCommitStatus != '')
				{
					filterArray.push("AND",["custbody_bbs_commitment_status","anyof",woCommitStatus]);
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
						   new nlobjSearchColumn("custbody_bbs_wo_finish",null,null), 
						   new nlobjSearchColumn("custbody_bbs_wo_ffi",null,null), 
						   new nlobjSearchColumn("custbody_bbs_commitment_status","createdFrom",null), 
						   new nlobjSearchColumn("tranid","createdFrom",null), 
						   new nlobjSearchColumn("externalid","customer",null)
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
					subList.setLineItemValue('custpage_sublist_ffi', line, searchResultSet[int].getText('custbody_bbs_wo_ffi'));
					subList.setLineItemValue('custpage_sublist_finish_type', line, searchResultSet[int].getText('custbody_bbs_wo_finish'));
					subList.setLineItemValue('custpage_sublist_so_status', line, searchResultSet[int].getText('custbody_bbs_commitment_status','createdFrom'));
					subList.setLineItemValue('custpage_sublist_so_tranid', line, searchResultSet[int].getValue('tranid','createdFrom'));
					subList.setLineItemValue('custpage_sublist_cust_entityid', line, searchResultSet[int].getValue('externalid','customer'));
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
				var ffi = request.getParameter('custpage_ffi_select');
				var mode = request.getParameter('custpage_mode');
				var solink = request.getParameter('custpage_solink');
				var socommitstatus = request.getParameter('custpage_so_commit_select');
				var socommitstatustext = request.getParameter('custpage_so_com_text');
				var soid = request.getParameter('custpage_so_select');
				var sotext = request.getParameter('custpage_so_text');
				var wocommitstatus = request.getParameter('custpage_wo_commit_select');
				var wocommitstatustext = request.getParameter('custpage_wo_com_text');
				
				//Build up the parameters so we can call this suitelet again, but move it on to the next stage
				//
				var params = new Array();
				params['customerid'] = customerId;
				params['belongstoid'] = belongsToId;
				params['productionbatchid'] = productionBatchId;
				params['stage'] = '2';
				params['ffi'] = ffi;
				params['mode'] = mode;
				params['solink'] = solink;
				params['socommitstatus'] = socommitstatus;
				params['socommitstatustext'] = socommitstatustext;
				params['soid'] = soid;
				params['sotext'] = sotext;
				params['wocommitstatus'] = wocommitstatus;
				params['wocommitstatustext'] = wocommitstatustext;
				
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
									var finish = request.getLineItemValue('custpage_sublist_items', 'custpage_sublist_finish_type', int);
									var soTranId = request.getLineItemValue('custpage_sublist_items', 'custpage_sublist_so_tranid', int);
									var custEntityId = request.getLineItemValue('custpage_sublist_items', 'custpage_sublist_cust_entityid', int);
									var custEntity = request.getLineItemValue('custpage_sublist_items', 'custpage_sublist_customer', int);
									
									//Build the batch key (which is used as the batch description)
									//
									var key = '';
									
									if (soLink == 'T')
										{
										 	key = custEntity + ':' + soTranId + ':' + finish;
										}
									else
										{
											key = belongsTo + ':' + finish + ':' + nowFormatted;
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
					
					var prodBatchId = '';
					
					var remaining = nlapiGetContext().getRemainingUsage();
					nlapiLogExecution('DEBUG', 'Usage left before batch/wo update', remaining.toString());
					nlapiLogExecution('DEBUG', 'Count of prod batches', (Object.keys(woArray).length).toString());
					
					var woToProcessArray = {};
					
					//Loop round the batch keys to create the batches
					//
					for (var woKey in woArray) 
					{
						//Create the batch record
						//
						var prodBatchRecord = nlapiCreateRecord('customrecord_bbs_assembly_batch');
						prodBatchRecord.setFieldValue('custrecord_bbs_bat_description',woKey);
						
						//Save the batch record & get the id
						//
						prodBatchId = nlapiSubmitRecord(prodBatchRecord, true, true);
						batchesCreated.push(prodBatchId);
						
						//Loop round the w/o id's associated with this batch
						//
						woIds = woArray[woKey];
						
						//Save the id of the created batch along with the works orders that go with it
						//
						woToProcessArray[prodBatchId] = woIds;
						
						/*
						nlapiLogExecution('DEBUG', 'Count of wo in batch ' + woKey, woIds.length.toString());
						
						for (var int2 = 0; int2 < woIds.length; int2++) 
						{
							var woRecord = nlapiLoadRecord('workorder', woIds[int2]);
							woRecord.setFieldValue('custbody_bbs_wo_batch', prodBatchId);
							nlapiSubmitRecord(woRecord, false, true);
							
							var remaining = nlapiGetContext().getRemainingUsage();
							nlapiLogExecution('DEBUG', 'Usage left after wo update', remaining.toString());
							
						}
						*/
					}
					
					var scheduleParams = {custscript_wo_array: JSON.stringify(woToProcessArray)};
					nlapiScheduleScript('customscript_bbs_prod_batch_scheduled', null, scheduleParams);
					
					var batchesCreatedText = JSON.stringify(batchesCreated);
					var params = new Array();
					
					params['stage'] = '3';
					params['batches'] = batchesCreatedText;
					params['solink'] = soLink;
					
					response.sendRedirect('SUITELET','customscript_bbs_assign_wo_suitelet', 'customdeploy_bbs_assign_wo_suitelet', null, params);
					
					//response.sendRedirect('RECORD', 'customrecord_bbs_assembly_batch', prodBatchId, true, null);
					
					break;
				}
				
				break;
			
			case 3:
				//Need to generate the production batch documentation
				//
				
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
				
				var batchResults = nlapiSearchRecord('customrecord_bbs_assembly_batch', null, filters, columns);
				
				//Start the xml off with the basic header info & the start of a pdfset
				//
				var xml = "<?xml version=\"1.0\"?>\n<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n";
				xml += "<pdfset>";
				
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
					                   ["mainline","is","T"], 
					                   "AND", 
					                   ["type","anyof","WorkOrd"], 
					                   "AND", 
					                   ["custbody_bbs_wo_batch","anyof",batchId]
					                   
					                ];
					
					var searchResultSet = nlapiSearchRecord("transaction", null, filterArray, 
							[
							   new nlobjSearchColumn("tranid",null,null).setSort(false), 
							   new nlobjSearchColumn("entity",null,null), 
							   new nlobjSearchColumn("item",null,null), 
							   new nlobjSearchColumn("quantity",null,null),
							   //new nlobjSearchColumn("binnumber","item",null),
							   new nlobjSearchColumn("custitem_bbs_item_customer","item",null),
							   new nlobjSearchColumn("item",null,null),
							   new nlobjSearchColumn("description","item",null),
							   new nlobjSearchColumn("mainline",null,null)
							   
							]
							);

					//Work out the customer sub group
					//
					var subGroup = '';
					
					//If we are linked to sales orders, then read the first w/o to get the customer from the w/o & then get the sub group
					if(solink == 'T')
						{
							if(searchResultSet.length > 0)
								{
									var thisEntity = searchResultSet[0].getValue("entity");
									if(thisEntity !=  null && thisEntity != '')
										{
											subGroup = nlapiLookupField('customer', thisEntity, 'custentity_bbs_customer_sub_group', true);
											subGroup = (subGroup == null ? '' : subGroup);
										}
									
								}
						}
					else
						{	
							//If not linked to sales orders, we will need to use the assembly item belongs to instead
							//
							if(searchResultSet.length > 0)
								{
									var thisEntity = searchResultSet[0].getValue("custitem_bbs_item_customer","item");
									if(thisEntity !=  null && thisEntity != '')
										{
											subGroup = nlapiLookupField('customer', thisEntity, 'custentity_bbs_customer_sub_group', true);
											subGroup = (subGroup == null ? '' : subGroup);
										}
								}
						}
					
					
					//Header & style sheet
					//
					xml += "<pdf>"
					xml += "<head>";
			        xml += "<style type=\"text/css\">table {font-family: Calibri, Candara, Segoe, \"Segoe UI\", Optima, Arial, sans-serif;font-size: 9pt;table-layout: fixed;}";
			        xml += "th {font-weight: bold;font-size: 8pt;padding: 0px;border-bottom: 1px solid black;border-collapse: collapse;}";
			        xml += "td {padding: 0px;vertical-align: top;font-size:10px;}";
			        xml += "b {font-weight: bold;color: #333333;}";
			        xml += "table.header td {padding: 0px;font-size: 10pt;}";
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
			        xml += "span.title {font-size: 28pt;}";
			        xml += "span.number {font-size: 16pt;}";
			        xml += "span.itemname {font-weight: bold;line-height: 150%;}";
			        xml += "hr {width: 100%;color: #d3d3d3;background-color: #d3d3d3;height: 1px;}";
			        xml += "</style>";

			        //Macros
			        //
					xml += "<macrolist>";
					xml += "<macro id=\"nlfooter\"><table class=\"footer\" style=\"width: 100%;\"><tr><td align=\"right\">Page <pagenumber/> of <totalpages/></td></tr></table></macro>";
					xml += "</macrolist>";
					xml += "</head>";
					
					//Body
					//
					xml += "<body footer=\"nlfooter\" footer-height=\"1%\" padding=\"0.5in 0.5in 0.5in 0.5in\" size=\"A4\">";

					//Header data
					//
					xml += "<table style=\"width: 100%\">";
					xml += "<tr>";
					xml += "<td colspan=\"2\" align=\"left\" style=\"font-size:12px;\">&nbsp;</td>";
					xml += "<td colspan=\"12\" align=\"center\" style=\"font-size:20px;\"><b>Production Batch Picking List</b></td>";
					xml += "<td colspan=\"2\" align=\"right\" style=\"font-size:12px;\">" + nlapiEscapeXML(subGroup) + "</td>";
					xml += "</tr>";
					
					xml += "<tr>";
					xml += "<td align=\"center\" style=\"font-size:20px;\">&nbsp;</td>";
					xml += "<td align=\"center\" style=\"font-size:20px;\">&nbsp;</td>";
					xml += "</tr>";
					
					xml += "<tr>";
					xml += "<td align=\"left\" colspan=\"4\" style=\"font-size:12px;\"><b>Batch Decsription</b></td>";
					xml += "<td align=\"left\" colspan=\"12\" style=\"font-size:12px;\">" + nlapiEscapeXML(batchDescription) + "</td>";
					xml += "</tr>";
					
					xml += "<tr>";
					xml += "<td align=\"center\" style=\"font-size:20px;\">&nbsp;</td>";
					xml += "<td align=\"center\" style=\"font-size:20px;\">&nbsp;</td>";
					xml += "</tr>";
					
					xml += "<tr>";
					xml += "<td align=\"left\" colspan=\"4\" style=\"font-size:12px;\"><b>Batch Id</b></td>";
					xml += "<td colspan=\"3\"><barcode codetype=\"code128\" showtext=\"false\" value=\"" + nlapiEscapeXML(batchId) + "\"/></td>";
					xml += "<td align=\"left\" style=\"font-size:16px;\" colspan=\"2\">" + nlapiEscapeXML(batchId) + "</td>";
					xml += "<td align=\"right\" style=\"font-size:12px;\" colspan=\"2\">" + nlapiEscapeXML(stockOrSales) + "</td>";
					xml += "</tr>";
					
					xml += "</table>\n";
					xml += "<p></p>";
					
					//Item data
					//
					xml += "<table class=\"itemtable\" style=\"width: 100%;\">";
					xml += "<thead >";
					xml += "<tr >";
					xml += "<th colspan=\"2\">Works Order</th>";
					xml += "<th align=\"left\" colspan=\"12\">Component</th>";
					xml += "<th align=\"left\" colspan=\"2\">Required Qty</th>";
					xml += "<th align=\"left\" colspan=\"2\">Picking Bin</th>";

					xml += "</tr>";
					xml += "</thead>";

					
					//Loop through the works orders on the batch
					//
					for (var int3 = 0; int3 < searchResultSet.length; int3++) 
					{
						var woId = searchResultSet[int3].getId();
						var woAssemblyItem = searchResultSet[int3].getText('item');
						var woAssemblyItemDesc = searchResultSet[int3].getValue('description','item');
						var woAssemblyItemQty = searchResultSet[int3].getValue('quantity');
						var woMainline = searchResultSet[int3].getValue('mainline');
						
						/*
						xml += "<tr>";
						xml += "<td colspan=\"2\">" + nlapiEscapeXML(searchResultSet[int3].getValue('tranid')) + "</td>";
						*/
						
						//xml += "<td align=\"left\" colspan=\"12\">&nbsp;</td>";
						//xml += "<td align=\"left\" colspan=\"2\">&nbsp;</td>";
						//xml += "<td align=\"left\" colspan=\"2\">&nbsp;</td>";
						//xml += "</tr>";
						
						var firstLine = true;
						
						//Read the works order so we can get the components
						//
						var woRecord = nlapiLoadRecord('workorder', woId);
						
						if (woRecord)
							{
								var woLocation = woRecord.getFieldValue('location');
								var componentsCount = woRecord.getLineItemCount('item');
								
								for (var int4 = 1; int4 <= componentsCount; int4++) 
								{
									var itemType = woRecord.getLineItemValue('item', 'itemtype', int4);
									
									if(itemType == 'InvtPart' || itemType == 'NonInvtPart')
										{
											var committedQty = Number(woRecord.getLineItemValue('item', 'quantitycommitted', int4));
											var componentText = woRecord.getLineItemText('item', 'item', int4);
											var componentId = woRecord.getLineItemValue('item', 'item', int4);
											
											//Find the default bin 
											//
											var componentBin = '';
											var componentDescription = '';
											var componentSpecInst = '';
											
											
											var componentRecord = nlapiLoadRecord(getItemRecType(itemType), componentId);
											var componentDescription = componentRecord.getFieldValue('salesdescription');
											var componentSpecInst = componentRecord.getFieldValue('custitem_bbs_item_instructions');
											
											componentSpecInst = (componentSpecInst == null ? "" : componentSpecInst);
											
											var binCount = componentRecord.getLineItemCount('binnumber');
											
											for (var int5 = 1; int5 <= binCount; int5++) 
											{
												var binPreferred = componentRecord.getLineItemValue('binnumber', 'preferredbin', int5);
												var binLocation = componentRecord.getLineItemValue('binnumber', 'location', int5);
												
												if(binPreferred == 'T' && binLocation == woLocation)
													{
														componentBin = componentRecord.getLineItemText('binnumber', 'binnumber', int5);
													}
											}

										if(firstLine)
												{
													firstLine = false;
													
													xml += "<tr>";
													xml += "<td  style=\"border-top: 1px; border-top-color: black;\" colspan=\"2\">" + nlapiEscapeXML(searchResultSet[int3].getValue('tranid')) + "</td>";
													xml += "<td  style=\"border-top: 1px; border-top-color: black; font-size: 10pt;\" align=\"left\" colspan=\"12\"><b>" + nlapiEscapeXML(woAssemblyItem) + "</b></td>";
													xml += "<td  style=\"border-top: 1px; border-top-color: black;\" align=\"left\" colspan=\"2\">" + woAssemblyItemQty + "</td>";
													xml += "<td  style=\"border-top: 1px; border-top-color: black;\" align=\"left\" colspan=\"2\">&nbsp;</td>";
													xml += "</tr>";
													
													xml += "<tr>";
													xml += "<td colspan=\"2\">&nbsp;</td>";
													xml += "<td align=\"left\" colspan=\"12\">" + nlapiEscapeXML(woAssemblyItemDesc) + "</td>";
													xml += "</tr>";
													
													xml += "<tr>";
													xml += "<td colspan=\"2\">&nbsp;</td>";
													xml += "</tr>";
												}
											
											xml += "<tr>";
											xml += "<td colspan=\"4\">&nbsp;</td>";
											xml += "<td align=\"left\" colspan=\"10\" style=\"font-size: 10pt;\"><b>" + nlapiEscapeXML(componentText) + "</b></td>";
											xml += "<td align=\"left\" colspan=\"2\">" + committedQty + "</td>";
											xml += "<td align=\"left\" colspan=\"2\">" + nlapiEscapeXML(componentBin) + "</td>";
											xml += "</tr>";
											
											xml += "<tr>";
											xml += "<td colspan=\"4\">&nbsp;</td>";
											xml += "<td align=\"left\" colspan=\"10\">" + nlapiEscapeXML(componentDescription) + "</td>";
											xml += "</tr>";
											
											xml += "<tr>";
											xml += "<td colspan=\"4\">&nbsp;</td>";
											xml += "<td align=\"left\" colspan=\"10\"><b>" + nlapiEscapeXML(componentSpecInst) + "</b></td>";
											xml += "</tr>";
											
											
											
											/*
											if(firstLine)
												{
													firstLine = false;
													xml += "<td align=\"left\" colspan=\"12\"><b>" + nlapiEscapeXML(componentText) + "</b><br/>" + nlapiEscapeXML(componentDescription) + "<br />" + nlapiEscapeXML(componentSpecInst) + "</td>";
													xml += "<td align=\"left\" colspan=\"2\">" + committedQty + "</td>";
													xml += "<td align=\"left\" colspan=\"2\">" + nlapiEscapeXML(componentBin) + "</td>";
													xml += "</tr>";
												}
											else
												{
													xml += "<tr>";
													xml += "<td colspan=\"2\">&nbsp;</td>";
													xml += "<td align=\"left\" colspan=\"12\"><b>" + nlapiEscapeXML(componentText) + "</b><br/>" + nlapiEscapeXML(componentDescription) + "<br />" + nlapiEscapeXML(componentSpecInst) +  "</td>";
													xml += "<td align=\"left\" colspan=\"2\">" + committedQty + "</td>";
													xml += "<td align=\"left\" colspan=\"2\">" + nlapiEscapeXML(componentBin) + "</td>";
													xml += "</tr>";
												}
											*/
											
											xml += "<tr>";
											xml += "<td colspan=\"18\">&nbsp;</td>";
											xml += "</tr>";
											
										}
								}
							}
						
						xml += "<tr>";
						xml += "<td colspan=\"18\">&nbsp;</td>";
						xml += "</tr>";
					}
					
					//Finish the item table
					//
					xml += "</table>";
					
					//Finish the body
					//
					xml += "</body>";
					
					//Finish the pdf
					//
					xml += "</pdf>";
	
				
					//
					//Produce the batch putaway documents
					//
					/*
					var batchId = batchResults[int2].getId();
					var batchDescription = batchResults[int2].getValue('custrecord_bbs_bat_description');

					//Find the works orders associated with this batch
					//
					var filterArray = [
					                   ["mainline","is","T"], 
					                   "AND", 
					                   ["type","anyof","WorkOrd"], 
					                   "AND", 
					                   ["custbody_bbs_wo_batch","anyof",batchId]
					                   
					                ];
					
					var searchResultSet = nlapiSearchRecord("transaction", null, filterArray, 
							[
							   new nlobjSearchColumn("tranid",null,null), 
							   new nlobjSearchColumn("entity",null,null), 
							   new nlobjSearchColumn("item",null,null), 
							   new nlobjSearchColumn("quantity",null,null),
							   new nlobjSearchColumn("location",null,null),
							   //new nlobjSearchColumn("binnumber","item",null),
							   new nlobjSearchColumn("salesdescription","item",null),
							   new nlobjSearchColumn("custitem_bbs_item_customer","item",null)
							]
							);

					//Work out the customer sub group
					//
					var subGroup = '';
					
					//If we are linked to sales orders, then read the first w/o to get the customer from the w/o & then get the sub group
					if(solink == 'T')
						{
							if(searchResultSet.length > 0)
								{
									var thisEntity = searchResultSet[0].getValue("entity");
									if(thisEntity !=  null && thisEntity != '')
										{
											subGroup = nlapiLookupField('customer', thisEntity, 'custentity_bbs_customer_sub_group', true);
											subGroup = (subGroup == null ? '' : subGroup);
										}
									
								}
						}
					else
						{	
							//If not linked to sales orders, we will need to use the assembly item belongs to instead
							//
							if(searchResultSet.length > 0)
								{
									var thisEntity = searchResultSet[0].getValue("custitem_bbs_item_customer","item");
									if(thisEntity !=  null && thisEntity != '')
										{
											subGroup = nlapiLookupField('customer', thisEntity, 'custentity_bbs_customer_sub_group', true);
											subGroup = (subGroup == null ? '' : subGroup);
										}
								}
						}
					
					
					//Header & style sheet
					//
					xml += "<pdf>"
					xml += "<head>";
			        xml += "<style type=\"text/css\">table {font-family: Calibri, Candara, Segoe, \"Segoe UI\", Optima, Arial, sans-serif;font-size: 9pt;table-layout: fixed;}";
			        xml += "th {font-weight: bold;font-size: 8pt;padding: 0px;border-bottom: 1px solid black;border-collapse: collapse;}";
			        xml += "td {padding: 0px;vertical-align: top;font-size:10px;}";
			        xml += "b {font-weight: bold;color: #333333;}";
			        xml += "table.header td {padding: 0px;font-size: 10pt;}";
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
			        xml += "span.title {font-size: 28pt;}";
			        xml += "span.number {font-size: 16pt;}";
			        xml += "span.itemname {font-weight: bold;line-height: 150%;}";
			        xml += "hr {width: 100%;color: #d3d3d3;background-color: #d3d3d3;height: 1px;}";
			        xml += "</style>";

			        //Macros
			        //
					xml += "<macrolist>";
					xml += "<macro id=\"nlfooter\"><table class=\"footer\" style=\"width: 100%;\"><tr><td align=\"right\">Page <pagenumber/> of <totalpages/></td></tr></table></macro>";
					xml += "</macrolist>";
					xml += "</head>";
					
					//Body
					//
					xml += "<body footer=\"nlfooter\" footer-height=\"1%\" padding=\"0.5in 0.5in 0.5in 0.5in\" size=\"A4\">";

					//Header data
					//
					xml += "<table style=\"width: 100%\">";
					xml += "<tr>";
					xml += "<td colspan=\"2\" align=\"left\" style=\"font-size:12px;\">&nbsp;</td>";
					xml += "<td colspan=\"12\" align=\"center\" style=\"font-size:20px;\"><b>Production Batch Putaway</b></td>";
					xml += "<td colspan=\"2\" align=\"right\" style=\"font-size:12px;\">" + nlapiEscapeXML(subGroup) + "</td>";
					xml += "</tr>";
					
					
					xml += "<tr>";
					xml += "<td align=\"center\" style=\"font-size:20px;\">&nbsp;</td>";
					xml += "<td align=\"center\" style=\"font-size:20px;\">&nbsp;</td>";
					xml += "</tr>";
					
					xml += "<tr>";
					xml += "<td align=\"left\" colspan=\"4\" style=\"font-size:12px;\"><b>Batch Decsription</b></td>";
					xml += "<td align=\"left\" colspan=\"12\" style=\"font-size:12px;\">" + nlapiEscapeXML(batchDescription) + "</td>";
					xml += "</tr>";
					
					xml += "<tr>";
					xml += "<td align=\"center\" style=\"font-size:20px;\">&nbsp;</td>";
					xml += "<td align=\"center\" style=\"font-size:20px;\">&nbsp;</td>";
					xml += "</tr>";
					
					xml += "<tr>";
					xml += "<td align=\"left\" colspan=\"4\" style=\"font-size:12px;\"><b>Batch Id</b></td>";
					xml += "<td colspan=\"3\"><barcode codetype=\"code128\" showtext=\"true\" value=\"" + nlapiEscapeXML(batchId) + "\"/></td>";
					xml += "<td align=\"right\" style=\"font-size:12px;\" colspan=\"2\">" + nlapiEscapeXML(stockOrSales) + "</td>";
					xml += "</tr>";
					
					xml += "</table>\n";
					xml += "<p></p>";
					
					//Item data
					//
					xml += "<table class=\"itemtable\" style=\"width: 100%;\">";
					xml += "<thead >";
					xml += "<tr >";
					xml += "<th colspan=\"2\">Works Order</th>";
					xml += "<th align=\"left\" colspan=\"12\">Finished Item</th>";
					xml += "<th align=\"left\" colspan=\"2\">Finished Qty</th>";
					xml += "<th align=\"left\" colspan=\"2\">Putaway Bin</th>";

					xml += "</tr>";
					xml += "</thead>";

					
					//Loop through the works orders on the batch
					//
					for (var int3 = 0; int3 < searchResultSet.length; int3++) 
					{
						var woLocation = searchResultSet[int3].getValue('location');
						var assemblyItemId = searchResultSet[int3].getValue('item');
						
						//Find the default bin 
						//
						var assemblyBin = '';
						
						
						var assemblyRecord = nlapiLoadRecord('assemblyitem', assemblyItemId);
						var binCount = assemblyRecord.getLineItemCount('binnumber');
						
						for (var int5 = 1; int5 <= binCount; int5++) 
						{
							var binPreferred = assemblyRecord.getLineItemValue('binnumber', 'preferredbin', int5);
							var binLocation = assemblyRecord.getLineItemValue('binnumber', 'location', int5);
							
							if(binPreferred == 'T' && binLocation == woLocation)
								{
									assemblyBin = assemblyRecord.getLineItemText('binnumber', 'binnumber', int5);
								}
						}
						
						
						xml += "<tr>";
						xml += "<td colspan=\"2\">" + nlapiEscapeXML(searchResultSet[int3].getValue('tranid')) + "</td>";
						xml += "<td align=\"left\" colspan=\"12\">" + nlapiEscapeXML(searchResultSet[int3].getText('item')) + "<br/>" + nlapiEscapeXML(searchResultSet[int3].getValue('salesdescription','item')) + "</td>";
						xml += "<td align=\"left\" colspan=\"2\">" + searchResultSet[int3].getValue('quantity') + "</td>";
						//xml += "<td align=\"left\" colspan=\"2\">" + nlapiEscapeXML(searchResultSet[int3].getValue('binnumber','item')) + "</td>";
						xml += "<td align=\"left\" colspan=\"2\">" + nlapiEscapeXML(assemblyBin) + "</td>";
						xml += "</tr>";
						
						xml += "<tr>";
						xml += "<td colspan=\"2\">&nbsp;</td>";
						xml += "<td align=\"left\" colspan=\"12\">&nbsp;</td>";
						xml += "<td align=\"left\" colspan=\"2\">&nbsp;</td>";
						xml += "<td align=\"left\" colspan=\"2\">&nbsp;</td>";
						xml += "</tr>";
					}
					
					//Finish the item table
					//
					xml += "</table>";
					
					//Finish the body
					//
					xml += "</body>";
					
					//Finish the pdf
					//
					xml += "</pdf>";
					
					*/
					
				}

				//
				//Finish the pdfset
				//
				xml += "</pdfset>";
				
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
			 
			    //Attach file to the batches
			    //
			    for (var int6 = 0; int6 < batchesArray.length; int6++) 
			    {
					var batchId = batchesArray[int6];
					
					nlapiAttachRecord("file", fileId, "customrecord_bbs_assembly_batch", batchId);
				}
			    
				//Send back the output in the response message
				//
				response.setContentType('PDF', 'Production Batch Documents', 'inline');
				response.write(pdfFileObject.getValue());
				
				break;
		}
	}
}

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