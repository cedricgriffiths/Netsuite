/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       25 Jul 2017     cedricgriffiths
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function invExportSuitelet(request, response)
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

	//Number padding to the left prototype
	//
	Number.prototype.padLeft = function(base, chr) {
		var len = (String(base || 10).length - String(this).length) + 1;
		return len > 0 ? new Array(len).join(chr || '0') + this : this;
	};
	
	//Number formatting prototype
	//
	Number.formatFunctions={count:0};
	Number.prototype.numberFormat=function(format,context){if(isNaN(this)||this==+Infinity||this==-Infinity){return this.toString()}if(Number.formatFunctions[format]==null){Number.createNewFormat(format)}return this[Number.formatFunctions[format]](context)};Number.createNewFormat=function(format){var funcName="format"+Number.formatFunctions.count++;Number.formatFunctions[format]=funcName;var code="Number.prototype."+funcName+" = function(context){\n";var formats=format.split(";");switch(formats.length){case 1:code+=Number.createTerminalFormat(format);break;case 2:code+='return (this < 0) ? this.numberFormat("'+String.escape(formats[1])+'", 1) : this.numberFormat("'+String.escape(formats[0])+'", 2);';break;case 3:code+='return (this < 0) ? this.numberFormat("'+String.escape(formats[1])+'", 1) : ((this == 0) ? this.numberFormat("'+String.escape(formats[2])+'", 2) : this.numberFormat("'+String.escape(formats[0])+'", 3));';break;default:code+="throw 'Too many semicolons in format string';";break}eval(code+"}")};Number.createTerminalFormat=function(format){if(format.length>0&&format.search(/[0#?]/)==-1){return"return '"+String.escape(format)+"';\n"}var code="var val = (context == null) ? new Number(this) : Math.abs(this);\n";var thousands=false;var lodp=format;var rodp="";var ldigits=0;var rdigits=0;var scidigits=0;var scishowsign=false;var sciletter="";m=format.match(/\..*(e)([+-]?)(0+)/i);if(m){sciletter=m[1];scishowsign=m[2]=="+";scidigits=m[3].length;format=format.replace(/(e)([+-]?)(0+)/i,"")}var m=format.match(/^([^.]*)\.(.*)$/);if(m){lodp=m[1].replace(/\./g,"");rodp=m[2].replace(/\./g,"")}if(format.indexOf("%")>=0){code+="val *= 100;\n"}m=lodp.match(/(,+)(?:$|[^0#?,])/);if(m){code+="val /= "+Math.pow(1e3,m[1].length)+"\n;"}if(lodp.search(/[0#?],[0#?]/)>=0){thousands=true}if(m||thousands){lodp=lodp.replace(/,/g,"")}m=lodp.match(/0[0#?]*/);if(m){ldigits=m[0].length}m=rodp.match(/[0#?]*/);if(m){rdigits=m[0].length}if(scidigits>0){code+="var sci = Number.toScientific(val,"+ldigits+", "+rdigits+", "+scidigits+", "+scishowsign+");\n"+"var arr = [sci.l, sci.r];\n"}else{if(format.indexOf(".")<0){code+="val = (val > 0) ? Math.ceil(val) : Math.floor(val);\n"}code+="var arr = val.round("+rdigits+").toFixed("+rdigits+").split('.');\n";code+="arr[0] = (val < 0 ? '-' : '') + String.leftPad((val < 0 ? arr[0].substring(1) : arr[0]), "+ldigits+", '0');\n"}if(thousands){code+="arr[0] = Number.addSeparators(arr[0]);\n"}code+="arr[0] = Number.injectIntoFormat(arr[0].reverse(), '"+String.escape(lodp.reverse())+"', true).reverse();\n";if(rdigits>0){code+="arr[1] = Number.injectIntoFormat(arr[1], '"+String.escape(rodp)+"', false);\n"}if(scidigits>0){code+="arr[1] = arr[1].replace(/(\\d{"+rdigits+"})/, '$1"+sciletter+"' + sci.s);\n"}return code+"return arr.join('.');\n"};Number.toScientific=function(val,ldigits,rdigits,scidigits,showsign){var result={l:"",r:"",s:""};var ex="";var before=Math.abs(val).toFixed(ldigits+rdigits+1).trim("0");var after=Math.round(new Number(before.replace(".","").replace(new RegExp("(\\d{"+(ldigits+rdigits)+"})(.*)"),"$1.$2"))).toFixed(0);if(after.length>=ldigits){after=after.substring(0,ldigits)+"."+after.substring(ldigits)}else{after+="."}result.s=before.indexOf(".")-before.search(/[1-9]/)-after.indexOf(".");if(result.s<0){result.s++}result.l=(val<0?"-":"")+String.leftPad(after.substring(0,after.indexOf(".")),ldigits,"0");result.r=after.substring(after.indexOf(".")+1);if(result.s<0){ex="-"}else if(showsign){ex="+"}result.s=ex+String.leftPad(Math.abs(result.s).toFixed(0),scidigits,"0");return result};Number.prototype.round=function(decimals){if(decimals>0){var m=this.toFixed(decimals+1).match(new RegExp("(-?\\d*).(\\d{"+decimals+"})(\\d)\\d*$"));if(m&&m.length){return new Number(m[1]+"."+String.leftPad(Math.round(m[2]+"."+m[3]),decimals,"0"))}}return this};Number.injectIntoFormat=function(val,format,stuffExtras){var i=0;var j=0;var result="";var revneg=val.charAt(val.length-1)=="-";if(revneg){val=val.substring(0,val.length-1)}while(i<format.length&&j<val.length&&format.substring(i).search(/[0#?]/)>=0){if(format.charAt(i).match(/[0#?]/)){if(val.charAt(j)!="-"){result+=val.charAt(j)}else{result+="0"}j++}else{result+=format.charAt(i)}++i}if(revneg&&j==val.length){result+="-"}if(j<val.length){if(stuffExtras){result+=val.substring(j)}if(revneg){result+="-"}}if(i<format.length){result+=format.substring(i)}return result.replace(/#/g,"").replace(/\?/g," ")};Number.addSeparators=function(val){return val.reverse().replace(/(\d{3})/g,"$1,").reverse().replace(/^(-)?,/,"$1")};String.prototype.reverse=function(){var res="";for(var i=this.length;i>0;--i){res+=this.charAt(i-1)}return res};String.prototype.trim=function(ch){if(!ch)ch=" ";return this.replace(new RegExp("^"+ch+"+|"+ch+"+$","g"),"")};String.leftPad=function(val,size,ch){var result=new String(val);if(ch==null){ch=" "}while(result.length<size){result=ch+result}return result};String.escape=function(string){return string.replace(/('|\\)/g,"\\$1")};
	

	//=============================================================================================
	//Start of main code
	//=============================================================================================
	//
	
	//Get the invoice id from the parameters
	//
	var invoiceId = request.getParameter('invoiceid');
	var recType = request.getParameter('rectype');
	
	if (invoiceId != null && invoiceId != '')
		{
			//Get the DSSI Supplier Code from the system preferences
			//
			var dssiSupplierCode = nlapiGetContext().getPreference('custscript_bbs_dssi_supplier_code');
			fileNameSupplierId = dssiSupplierCode;
			
			//Initialise variables
			//
			var now = new Date();
			var fileContents = '';
			var fileName = '';
			var fileNamePrefix = 'DIV11'; 
			var fileNameDateTime = now.format('Y') +  now.format('m') + now.format('d') + '_' + now.format('H') + now.format('i') + now.format('s');
			var fileNameSupplierId = '';
			var fileNameCustomerID = '';
			var fileNameInvoiceNumber = '';
			var processedLineCount = Number(0);
			var recordTypeName = '';
			
			switch(recType)
			{
				case 'I':
					recordTypeName = 'invoice';
					break;
					
				case 'C':
					recordTypeName = 'creditmemo';
					break;
			}
			
			//Record variables
			//
			var invoiceRecord = null;
			var salesOrderRecord = null;
			var companyRecord = null;
			var parentRecord = null;
			
			//Header variables
			//
			var IH01 = '';
			var IH02 = ''; 
			var IH03 = '';
			var IH04 = '';
			var IH05 = '';
			var IH06 = '';
			var IH07 = '';
			var IH08 = '';
			var IH09 = '';
			var IH10 = '';
			var IH11 = '';
			var IH12 = '';
			var IH13 = '';
			var IH14 = '';
			var IH15 = '';
			var IH16 = '';
			var IH17 = '';
			var IH18 = '';

			//Detail variables
			//
			var ID01 = '';
			var ID02 = '';
			var ID03 = '';
			var ID04 = '';
			var ID05 = '';
			var ID06 = '';
			var ID07 = '';
			var ID08 = '';
			var ID09 = '';
			var ID10 = '';
			var ID11 = '';
			var ID12 = '';
			var ID13 = '';
			var ID14 = '';
			var ID15 = '';
			var ID16 = '';
			
			//Summary variables
			//
			var IS01 = 'S';
			var IS02 = '';
			
			
			//Read the invoice record
			//
			invoiceRecord = nlapiLoadRecord(recordTypeName, invoiceId);
			
			if (invoiceRecord)
				{
					//Get the sales order from the invoice
					//
					var salesOrderId = invoiceRecord.getFieldValue('createdfrom');
					
					if (salesOrderId != null && salesOrderId != '')
						{
							salesOrderRecord = nlapiLoadRecord('salesorder', salesOrderId);
							
							if (salesOrderRecord)
								{
									//Get the company from the sales order
									//
									var companyId = salesOrderRecord.getFieldValue('entity');
									
									if (companyId != null && companyId != '')
										{
											companyRecord = nlapiLoadRecord('customer', companyId);
											
											if (companyRecord)
												{
													//Get the parent company from the main company
													//
													var parentId = companyRecord.getFieldValue('parent');
													
													if (parentId != null && parentId != '')
														{
															parentRecord = nlapiLoadRecord('customer', parentId);
															
															if (parentRecord)
																{
																	//=============================================================================================
																	//Finish off the output file name
																	//=============================================================================================
																	//
																	fileNameSupplierId = dssiSupplierCode;
																	fileNameCustomerID = parentRecord.getFieldValue('custentity_bbs_dssi_provider');
																	fileNameInvoiceNumber = invoiceRecord.getFieldValue('tranid');
																	fileName = fileNamePrefix + '_' + fileNameDateTime + '_' + fileNameSupplierId + '_' + fileNameCustomerID + '_' + fileNameInvoiceNumber + '.txt';
																	
																	//=============================================================================================
																	//Build the header
																	//=============================================================================================
																	//
																	var totalProduct = Number(0);
																	var totalProductTax = Number(0);
																	var totalFreight = Number(0);
																	var totalFreightTax = Number(0);
																	var totalOther = Number(0);
																	var totalOtherTax = Number(0);
																	
																	//See if shipping is taxable & also get the tax rate
																	//
																	var isShippingTaxable = invoiceRecord.getFieldValue('shipping_btaxable');
																	var taxRate = Number(invoiceRecord.getFieldValue('taxrate'));
																	
																	//Get the number of lines on the invoice
																	//
																	var invLines = invoiceRecord.getLineItemCount('item');
																	
																	for (var int = 1; int <= invLines; int++) 
																	{
																		//Get the item type
																		//
																		var itemType = invoiceRecord.getLineItemValue('item', 'itemtype', int);
																		
																		//Sum up the actual item lines
																		//
																		if(["InvtPart","Assembly","Kit","NonInvtPart"].indexOf(itemType) > -1)
																		{
																			totalProduct += Number(invoiceRecord.getLineItemValue('item', 'amount', int));
																			
																			//Is the item line taxable
																			//
																			var isTaxable = invoiceRecord.getLineItemValue('item', 'istaxable', int);
																			
																			if(isTaxable != null && isTaxable == 'T')
																			{
																				totalProductTax += ((Number(invoiceRecord.getLineItemValue('item', 'amount', int)) / 100.00) * taxRate);
																			}
																		}
																	}
																	
																	//Calculate the freight charge & tax
																	//
																	totalFreight = Number(invoiceRecord.getFieldValue('shippingcost'));
																	
																	if(isShippingTaxable != null && isShippingTaxable == 'T')
																	{
																		totalFreightTax = ((totalFreight / 100.00) * taxRate);
																	}
																	
																	//Calculate the other charges (discount) & tax
																	//
																	totalOther = Number(invoiceRecord.getFieldValue('discounttotal'));
																	
																	
																	//Populate the output variables
																	//
																	IH01 = 'H';
																	IH02 = padding_right(dssiSupplierCode, ' ', 5);
																	IH03 = padding_right(parentRecord.getFieldValue('custentity_bbs_dssi_provider'), ' ', 3);
																	IH04 = padding_right(companyRecord.getFieldValue('custentity_bbs_dssi_facility'), ' ', 15);
																	//IH05 = padding_right(salesOrderRecord.getFieldValue('tranid'), ' ', 15);
																	IH05 = padding_right(parentRecord.getFieldValue('custentity_bbs_dssi_provider') + salesOrderRecord.getFieldValue('custbody_bbs_dssi_po_no'), ' ', 15);
																	
																	switch(recType)
																	{
																		case 'I':
																			IH06 = 'I';
																			break;
																			
																		case 'C':
																			IH06 = 'C';
																			break;
																	}
																	
																	IH07 = nlapiStringToDate(salesOrderRecord.getFieldValue('trandate')).format('Ymd');
																	IH08 = padding_right(salesOrderRecord.getFieldText('salesrep'), ' ', 15).substring(0,15).toUpperCase();
																	IH09 = padding_right(invoiceRecord.getFieldValue('tranid'), ' ', 20);
																	IH10 = nlapiStringToDate(salesOrderRecord.getFieldValue('shipdate')).format('Ymd');
																	IH11 = nlapiStringToDate(invoiceRecord.getFieldValue('trandate')).format('Ymd');
																	IH12 = toFixedFormat82(totalProduct);
																	IH13 = toFixedFormat82(totalProductTax);
																	IH14 = toFixedFormat82(totalFreight);
																	IH15 = toFixedFormat82(totalFreightTax);
																	IH16 = toFixedFormat82(totalOther);
																	IH17 = toFixedFormat82(totalOtherTax);
																	IH18 = padding_right(invoiceRecord.getFieldValue('tranid'), ' ', 20);
																	
																	//Output the header line
																	//
																	fileContents += IH01 + IH02 + IH03 + IH04 + IH05 + IH06 + IH07 + IH08 + IH09 + IH10 + IH11 + IH12 + IH13 + IH14 + IH15 + IH16 + IH17 + IH18 + '\r\n';
																	
																	//=============================================================================================
																	//Build the details
																	//=============================================================================================
																	//
																	var invLines = invoiceRecord.getLineItemCount('item');
																	
																	//Loop through the item lines
																	//
																	for (var int = 1; int <= invLines; int++) 
																	{
																		var itemType = invoiceRecord.getLineItemValue('item', 'itemtype', int);
																		
																		//Process only 'real' items
																		//
																		if(["InvtPart","Assembly","Kit","NonInvtPart"].indexOf(itemType) > -1)
																			{
																				processedLineCount++;
																				
																				//Get the item id from the line & then get the item details
																				//
																				var itemId = invoiceRecord.getLineItemValue('item', 'item', int);
																				var recordType = '';
																				
																				switch (itemType)
																				{
																					case 'InvtPart':
																						recordType = 'inventoryitem';
																						break;
																						
																					case 'Assembly':
																						recordType = 'assemblyitem';
																						break;
																						
																					case 'Kit':
																						recordType = 'kititem';
																						break;
																						
																					case 'NonInvtPart':
																						recordType = 'noninventoryitem';
																						break;
																				}
																				
																				var itemRecord = nlapiLoadRecord(recordType, itemId);
																				var description = '';
																				var item = '';
																				
																				if (itemRecord)
																					{
																						description = itemRecord.getFieldValue('displayname');
																						description = (description == null ? ' ' : description);
																						
																						item = itemRecord.getFieldValue('itemid');	
																					}
																				
																				//Work out the tax component
																				//
																				var isTaxable = invoiceRecord.getLineItemValue('item', 'istaxable', int);
																				var itemTax = Number(0);
																				var itemTaxRate = Number(0);
																				
																				if(isTaxable != null && isTaxable == 'T')
																				{
																					itemTax = ((Number(invoiceRecord.getLineItemValue('item', 'amount', int)) / 100.00) * taxRate);
																					itemTaxRate = taxRate;
																				}
																				
																				//Populate the output variables
																				//
																				ID01 = 'D';
																				ID02 = padding_right(' ', ' ', 13);
																				ID03 = padding_right(item, ' ', 30).substring(0,30).toUpperCase();
																				ID04 = toFixedFormat64(Number(invoiceRecord.getLineItemValue('item', 'quantity', int)));
																				ID05 = 'EA';
																				ID06 = toFixedFormat64(Number(invoiceRecord.getLineItemValue('item', 'rate', int)));
																				ID07 = toFixedFormat82(itemTax);
																				ID08 = toFixedFormat64(itemTaxRate);
																				ID09 = padding_right(description, ' ', 80).substring(0,80).toUpperCase();
																				ID10 = padding_right(' ', ' ', 5);
																				ID11 = padding_right(' ', ' ', 30);
																				ID12 = padding_right(' ', ' ', 20);
																				ID13 = padding_right(' ', ' ', 10);
																				ID14 = padding_right(' ', ' ', 30);
																				ID15 = padding_right(' ', ' ', 30);
																				ID16 = padding_right(' ', ' ', 129);
																				
																				//Output the detail line
																				//
																				fileContents += ID01 + ID02 + ID03 + ID04 + ID05 + ID06 + ID07 + ID08 + ID09 + ID10 + ID11 + ID12 + ID13 + ID14 + ID15 + ID16 + '\r\n';
																			}
																	}
																	
																	//=============================================================================================
																	//Build the summary
																	//=============================================================================================
																	//
																	IS02 = padding_left(processedLineCount.toString(), ' ',7);
																	
																	fileContents += IS01 + IS02 + '\r\n';
			
																}
															else
																{
																	fileName = 'error.txt';
																	fileContents = 'No parent customer record found';
																}
														}
													else
														{
															fileName = 'error.txt';
															fileContents = 'No parent set on customer record';
														}
												}
											else
												{
													fileName = 'error.txt';
													fileContents = 'No customer record found';
												}
										}
										else
										{
											fileName = 'error.txt';
											fileContents = 'No customer set on sales order record';
										}
									}
									else
										{
											fileName = 'error.txt';
											fileContents = 'No sales order record found';
										}
								}
							else
								{
									fileName = 'error.txt';
									fileContents = 'No sales order set on invoice record';
								}
				}
			else
				{
					fileName = 'error.txt';
					fileContents = 'No invoice record found for id ' + invoiceId.toString();
				}
			
			
			//Return the output file as an attachment
			//
			response.setContentType('PLAINTEXT', fileName, 'attachment');
			response.write(fileContents);
		}

}

//=============================================================================================
//Utility functions
//=============================================================================================
//
function toFixedFormat82(inputNumber)
{
	return ('          ' + inputNumber.numberFormat("0.00")).slice(-11);
}

function toFixedFormat64(inputNumber)
{
	return ('          ' + inputNumber.numberFormat("0.0000")).slice(-11);
}

function fixedFormat(inputNumber, mantissa, decplaces)
{
	mantissa--;
	
	var sign = inputNumber?inputNumber<0?-1:1:0;
	inputNumber = inputNumber * sign + ''; // poor man's absolute value
	
	var dec = Number(inputNumber.match(/\.\d+$/)).toFixed(decplaces);
	var int = inputNumber.match(/^[^\.]+/);
	
	if(sign < 0)
		{
			mantissa--;
		}
	
	var formattedNumber = (sign < 0 ? '-' : '') + ("         " + int).slice(-mantissa) + (dec !== null ? dec : '');

	return formattedNumber;
}

//left padding s with c to a total of n chars
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
 
// right padding s with c to a total of n chars
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