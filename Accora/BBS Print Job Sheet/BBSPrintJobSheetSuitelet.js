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
function printJobSheetSuitelet(request, response)
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
	
	
	//=====================================================================
	// Parameters passed to the suitelet
	//=====================================================================
	//
	var caseParam = request.getParameter('caseid');
			
	if (caseParam != null && caseParam != '') 
		{
			// Build the output
			//	
			var file = buildOutput(caseParam);
	
			//Build the file name
			//
			var now = new Date();
			var fileNameDateTime = now.format('Y') +  now.format('m') + now.format('d') + '_' + now.format('H') + now.format('i') + now.format('s');
			var caseNumber = nlapiLookupField('supportcase', caseParam, 'casenumber', false);
			var pdfFileName = 'Engineer Job Sheet ' + caseNumber + '_' + fileNameDateTime;
			
			var fileCount = Number(0);
			
			var supportcaseSearch = nlapiSearchRecord("supportcase",null,
					[
					   ["internalid","anyof",caseParam], 
					   "AND", 
					   ["file.internalid","noneof","@NONE@"]
					], 
					[
					   new nlobjSearchColumn("casenumber").setSort(false), 
					   new nlobjSearchColumn("internalid","file",null)
					]
					);
			
			if(supportcaseSearch)
				{
					fileCount = supportcaseSearch.length;
				}
			
			fileCount++;
			
			pdfFileName += '_' + fileCount.toFixed(0);
			
			//Set the file name & folder
			//
			file.setName(pdfFileName);
			file.setFolder(262601);	//Jobsheets Folder in File Cabinet

		    //Upload the file to the file cabinet.
			//
		    var fileId = nlapiSubmitFile(file);
		 
		    nlapiAttachRecord("file", fileId, "supportcase", caseParam); 
		    
			// Send back the output in the response message
			//
			response.setContentType('PDF', pdfFileName + '.pdf', 'inline');
			response.write(file.getValue());
		}
}

//=====================================================================
// Functions
//=====================================================================
//
function buildOutput(caseId)
{
	//Start the xml off with the basic header info 
	//
	var xml = "<?xml version=\"1.0\"?>\n<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n";
	
	//Read the case record
	//
	var caseRecord = null;
	
	try
		{
			caseRecord = nlapiLoadRecord('supportcase', caseId);
		}
	catch(err)
		{
			caseRecord = null;
		}
	
	if(caseRecord)
		{
			var today = new Date();
			var todayString = today.format('d') +  '/' + today.format('m') +  '/' + today.format('Y');
			//var todayString = ('0' + today.getDate()).slice(-2) + '/' + ('0' + today.getMonth()).slice(-2) + '/' + today.getFullYear();
			
			var companyId = caseRecord.getFieldValue('company');
			var contactId = caseRecord.getFieldValue('contact');
			var subsidiaryId = caseRecord.getFieldValue('subsidiary');
			
			var engineer = nlapiEscapeXML(caseRecord.getFieldText('custevent_acc_callout_engr'));
			var calloutIssue = nlapiEscapeXML(caseRecord.getFieldText('custevent_acc_callout_issuetype'));
			var calloutType = nlapiEscapeXML(caseRecord.getFieldText('custevent_acc_callout_type'));
			var caseNumber = nlapiEscapeXML(caseRecord.getFieldValue('casenumber'));
			var assignedTo = nlapiEscapeXML(caseRecord.getFieldValue('assigned'));
			var dateCreated = nlapiEscapeXML(caseRecord.getFieldValue('datecreated'));
			var jobDetails = nlapiEscapeXML(caseRecord.getFieldValue('custevent_acc_callout_jobsheet_info'));
			var productRange = nlapiEscapeXML(caseRecord.getFieldText('custevent_acc_callout_prodrange'));
			var newPo = nlapiEscapeXML(caseRecord.getFieldValue('custevent_acc_callout_new_po_number'));
			var newSo = nlapiEscapeXML(caseRecord.getFieldValue('custevent_acc_callout_new_so_number'));
			var originalPo = nlapiEscapeXML(caseRecord.getFieldValue('custevent_acc_callout_original_po_num'));
			var originalSo = nlapiEscapeXML(caseRecord.getFieldValue('custevent_acc_callout_orig_sop_number'));
			var productSerialNo = nlapiEscapeXML(caseRecord.getFieldValue('custevent_acc_prod_serial'));
			var serviceUserName = nlapiEscapeXML(caseRecord.getFieldValue('custevent_acc_su_name'));
			var serviceUserPhone = nlapiEscapeXML(caseRecord.getFieldValue('custevent_acc_su_phonenum'));
			var serviceUserAddress = nlapiEscapeXML(caseRecord.getFieldValue('custevent_acc_su_addr'));
			var serviceUserMobile = nlapiEscapeXML(caseRecord.getFieldValue('custevent_acc_su_mobilenum'));
			var serviceUserPostcode = nlapiEscapeXML(caseRecord.getFieldValue('custevent_acc_su_postcode'));
			
			
			var subsidiaryName = nlapiEscapeXML(removePrefix(nlapiLookupField('subsidiary', subsidiaryId, 'name', false)));
			var company = '';
			var contact = '';
			
			if(companyId != null && companyId != '')
				{
					company = nlapiEscapeXML(nlapiLookupField('customer', companyId, 'companyname', false));
				}
			
			if(contactId != null && contactId != '')
				{
					contact = nlapiEscapeXML(nlapiLookupField('contact', contactId, 'entityid', false));
				}
		
			engineer = (engineer == null ? '' : engineer);
			calloutIssue = (calloutIssue == null ? '' : calloutIssue);
			calloutType = (calloutType == null ? '' : calloutType);
			caseNumber = (caseNumber == null ? '' : caseNumber);
			assignedTo = (assignedTo == null ? '' : assignedTo);
			dateCreated = (dateCreated == null ? '' : dateCreated);
			jobDetails = (jobDetails == null ? '' : jobDetails);
			productRange = (productRange == null ? '' : productRange);
			newPo = (newPo == null ? '' : newPo);
			newSo = (newSo == null ? '' : newSo);
			originalPo = (originalPo == null ? '' : originalPo);
			originalSo = (originalSo == null ? '' : originalSo);
			productSerialNo = (productSerialNo == null ? '' : productSerialNo);
			serviceUserName = (serviceUserName == null ? '' : serviceUserName);
			serviceUserPhone = (serviceUserPhone == null ? '' : serviceUserPhone);
			serviceUserAddress = (serviceUserAddress == null ? '' : serviceUserAddress);
			serviceUserMobile = (serviceUserMobile == null ? '' : serviceUserMobile);
			serviceUserPostcode = (serviceUserPostcode == null ? '' : serviceUserPostcode);
			
			
			jobDetails = jobDetails.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />');
			serviceUserAddress = serviceUserAddress.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />');
			
			//Header & style sheet
			//
			xml += "<pdf>"
			xml += "<head>";
			xml += "<style>";
			
			xml += "*{font-family: Arial, Helvetica, sans-serif;}";
			xml += "table.tabborderall td {";
			xml += "border: 1px solid black;";
			xml += "border-collapse: collapse;";
			xml += "}";
			
			xml += "table.tabborder {";
			xml += "border: 1px solid black;";
			xml += "border-collapse: collapse;";
			xml += "}";
			
			xml += "table.tabgray td  {";
			xml += "background-color: #e3e3e3;";
			xml += "margin-top: 5px;";
			xml += "margin-bottom: 5px;";
			xml += "}";
			
			xml += "</style>";
			
			//Macros
	        //
			xml += "<macrolist>";
			xml += "<macro id=\"nlfooter\">";
			xml += "<table style=\"width: 100%;\">";
			xml += "<tr><td align=\"left\" style=\"font-size: 10px;\"><b>SOP307&ndash;A Rev 02</b></td></tr>";
			xml += "</table>";
			xml += "</macro>";
			xml += "</macrolist>";
			
			xml += "</head>";
				
			
			//Body
			//
			xml += "<body padding=\"0.5cm 0.5cm 0.5cm 0.5cm\" footer=\"nlfooter\" footer-height=\"10px\" size=\"A4\">";
										
			xml += "<table style=\"width: 100%;\">";
			xml += "<tr>";					
			xml += "<td align=\"left\" style=\"font-size: 10pt;\">" + subsidiaryName +"</td>";					
			xml += "<td align=\"left\" style=\"font-size: 18pt; padding-left: 130px;\">Job Sheet</td>";					
			xml += "<td align=\"right\" style=\"font-size: 10pt;\">Print Date : " + todayString +"</td>";					
			xml += "</tr>";					
			xml += "</table>";
								
			xml += "<table class=\"tabgray\" style=\"width: 100%;\">";
			xml += "<tr>";					
			xml += "<td align=\"center\" style=\"font-size: 12pt;\"><b>Call Details</b></td>";					
			xml += "</tr>";					
			xml += "</table>";
				
			xml += "<table class=\"tabborder\" style=\"width: 100%;\">";
			xml += "<tr>";					
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:23%\"><b>Case ID</b></td>";					
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:23%\">" + caseNumber + "</td>";					
			xml += "<td align=\"right\" style=\"font-size: 10pt; width:8%\">&nbsp;</td>";									
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:23%\"><b>Engineer Name</b></td>";					
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:23%\">" + engineer + "</td>";					
			xml += "</tr>";					
			xml += "<tr>";					
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:23%\"><b>Customer Name</b></td>";					
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:23%\">" + company + "</td>";					
			xml += "<td align=\"right\" style=\"font-size: 10pt; width:8%\">&nbsp;</td>";									
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:23%\"><b>Callout Type</b></td>";					
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:23%\">" + calloutType + "</td>";					
			xml += "</tr>";					
			xml += "<tr>";					
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:23%\"><b>Contact</b></td>";					
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:23%\">" + contact + "</td>";					
			xml += "<td align=\"right\" style=\"font-size: 10pt; width:8%\">&nbsp;</td>";									
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:23%\"><b>Product Range</b></td>";					
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:23%\">" + productRange + "</td>";					
			xml += "</tr>";					
			xml += "<tr>";					
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:23%\">&nbsp;</td>";					
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:23%\">&nbsp;</td>";					
			xml += "<td align=\"right\" style=\"font-size: 10pt; width:8%\">&nbsp;</td>";									
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:23%\"><b>Callout Issue</b></td>";					
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:23%\">" + calloutIssue + "</td>";					
			xml += "</tr>";					
			xml += "</table>";
			
			xml += "<table class=\"tabgray\" style=\"width: 100%;\">";
			xml += "<tr>";					
			xml += "<td align=\"center\" style=\"font-size: 12pt;\"><b>Callout Type Details</b></td>";					
			xml += "</tr>";					
			xml += "</table>";
				
			xml += "<table class=\"tabborder\" style=\"width: 100%;\">";
			xml += "<tr>";					
			xml += "<td align=\"left\" style=\"font-size: 12pt; width:23%\"><b>Paid Callout</b></td>";					
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:23%\">&nbsp;</td>";					
			xml += "<td align=\"right\" style=\"font-size: 10pt; width:8%\">&nbsp;</td>";									
			xml += "<td colspan=\"2\" align=\"left\" style=\"font-size: 12pt; width:23%\"><b>Warranty/Free of Charge</b></td>";					
			xml += "</tr>";					
			xml += "<tr>";					
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:23%\"><b>PO</b></td>";					
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:23%\">" + newPo + "</td>";					
			xml += "<td align=\"right\" style=\"font-size: 10pt; width:8%\">&nbsp;</td>";									
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:23%\"><b>Original PO</b></td>";					
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:23%\">" + originalPo + "</td>";					
			xml += "</tr>";					
			xml += "<tr>";					
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:23%\"><b>SO</b></td>";					
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:23%\">" + newSo + "</td>";					
			xml += "<td align=\"right\" style=\"font-size: 10pt; width:8%\">&nbsp;</td>";									
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:23%\"><b>Original SO</b></td>";					
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:23%\">" + originalSo + "</td>";					
			xml += "</tr>";					
			xml += "<tr>";					
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:23%\">&nbsp;</td>";					
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:23%\">&nbsp;</td>";					
			xml += "<td align=\"right\" style=\"font-size: 10pt; width:8%\">&nbsp;</td>";									
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:23%\"><b>Serial No.</b></td>";					
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:23%\">" + productSerialNo + "</td>";					
			xml += "</tr>";					
			xml += "</table>";
			
			xml += "<table class=\"tabgray\" style=\"width: 100%;\">";
			xml += "<tr>";					
			xml += "<td align=\"center\" style=\"font-size: 12pt;\"><b>Service User Details</b></td>";					
			xml += "</tr>";					
			xml += "</table>";
			
			xml += "<table class=\"tabborder\" style=\"width: 100%;\">";
			xml += "<tr>";					
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:23%\"><b>Name</b></td>";					
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:23%\">" + serviceUserName + "</td>";					
			xml += "<td align=\"right\" style=\"font-size: 10pt; width:8%\">&nbsp;</td>";									
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:23%\"><b>Telephone</b></td>";					
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:23%\">" + serviceUserPhone + "</td>";					
			xml += "</tr>";					
			xml += "<tr>";					
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:23%\"><b>Address</b></td>";					
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:23%\">" + serviceUserAddress + "</td>";					
			xml += "<td align=\"right\" style=\"font-size: 10pt; width:8%\">&nbsp;</td>";									
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:23%\"><b>Mobile Phone</b></td>";					
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:23%\">" + serviceUserMobile + "</td>";					
			xml += "</tr>";					
			xml += "<tr>";					
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:23%\"><b>Postcode</b></td>";					
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:23%\">" + serviceUserPostcode + "</td>";					
			xml += "<td align=\"right\" style=\"font-size: 10pt; width:8%\">&nbsp;</td>";									
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:23%\">&nbsp;</td>";					
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:23%\">&nbsp;</td>";					
			xml += "</tr>";					
			xml += "</table>";
			
			
			xml += "<table class=\"tabgray\" style=\"width: 100%;\">";
			xml += "<tr>";					
			xml += "<td align=\"center\" style=\"font-size: 12pt;\"><b>Callout Info</b></td>";					
			xml += "</tr>";					
			xml += "</table>";
				
			xml += "<table class=\"tabborder\" style=\"width: 100%;\">";
			xml += "<tr>";					
			xml += "<td align=\"left\" style=\"font-size: 8pt; width:100%; height: 200px\">" + jobDetails + "</td>";					
			xml += "</tr>";					
			xml += "</table>";
			
			xml += "<table class=\"tabgray\" style=\"width: 100%;\">";
			xml += "<tr>";					
			xml += "<td align=\"center\" style=\"font-size: 12pt;\"><b>Completion Details</b></td>";					
			xml += "</tr>";					
			xml += "</table>";
				
			xml += "<table class=\"tabborder\" style=\"width: 100%;\">";
			xml += "<tr>";					
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:100%; height: 100px\">&nbsp;</td>";					
			xml += "</tr>";					
			xml += "</table>";
			
			xml += "<table class=\"tabborder\" style=\"width: 100%;\">";
			xml += "<tr>";					
			xml += "<td align=\"left\" style=\"font-size: 10pt; line-height: 190%;\"><b>Item Model:</b></td>";					
			xml += "<td align=\"left\" style=\"font-size: 10pt; line-height: 190%;\">&nbsp;</td>";					
			xml += "<td align=\"left\" style=\"font-size: 10pt; line-height: 190%;\"><b>Serial No:</b></td>";					
			xml += "<td align=\"left\" style=\"font-size: 10pt; line-height: 190%;\">&nbsp;</td>";					
			xml += "<td align=\"left\" style=\"font-size: 10pt; line-height: 190%;\"><b>Warranty Y&frasl;N:</b></td>";					
			xml += "<td align=\"left\" style=\"font-size: 10pt; line-height: 190%;\">&nbsp;</td>";					
			xml += "</tr>";					
			xml += "</table>";
			
			xml += "<table class=\"tabgray\" style=\"width: 100%;\">";
			xml += "<tr>";					
			xml += "<td align=\"center\" style=\"font-size: 12pt;\"><b>Job Sign Off</b></td>";					
			xml += "</tr>";					
			xml += "</table>";
								
			xml += "<table class=\"tabborderall\" style=\"width: 100%;\">";
			xml += "<tr>";					
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:50%; line-height: 190%;\"><b>Customer</b></td>";					
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:50%; line-height: 190%;\"><b>Engineer</b></td>";					
			xml += "</tr>";	
			
			xml += "<tr>";					
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:50%; padding-left: 20px; line-height: 190%;\">Sign:</td>";					
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:50%; padding-left: 20px; line-height: 190%;\">Sign:</td>";					
			xml += "</tr>";	
			
			xml += "<tr>";					
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:50%; padding-left: 20px; line-height: 190%;\">Print:</td>";					
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:50%; padding-left: 20px; line-height: 190%;\">Print:</td>";					
			xml += "</tr>";		
			
			xml += "<tr>";					
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:50%; padding-left: 20px; line-height: 190%;\">Date:</td>";					
			xml += "<td align=\"left\" style=\"font-size: 10pt; width:50%; padding-left: 20px; line-height: 190%;\">Date:</td>";					
			xml += "</tr>";		
			
			xml += "</table>";
						
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
			xml += "<body padding=\"0.5cm 0.5cm 0.5cm 0.5cm\" size=\"A4\">";
			xml += "<p>No Data To Print</p>";
			xml += "</body>";
			xml += "</pdf>";
		}
	
	//Convert to pdf using the BFO library
	//
	var pdfFileObject = nlapiXMLToPDF(xml);
	
	return pdfFileObject;
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

