{
	var PORTLET_TITLE = "Customers";

	//google map
	var URL_GOOGLE_MAP = '//maps.google.com';
	var URL_GOOGLE_MAP_SCRIPT = URL_GOOGLE_MAP + '/maps/api/js?v=3&sensor=false';
	var URL_GOOGLE_MAP_GEOCODE = "https://maps.googleapis.com/maps/api/geocode/json?sensor=false&address=";
	var ICON_SHADOW_GOOGLE = URL_GOOGLE_MAP + '/mapfiles/ms/micons/msmarker.shadow.png';
	var ICON_SINGLE_GOOGLE = URL_GOOGLE_MAP + '/mapfiles/ms/micons/blue.png';
	var ICON_MULTIPLE_GOOGLE = URL_GOOGLE_MAP + '/mapfiles/ms/micons/blue-dot.png';
	var GOOGLE_KEY = '&key=AIzaSyBGVizFbzSNRuI1RcA7-ddsTXqxsKchUpM';

	var URL_NETSUITE = 'https://system.netsuite.com';
	var ICON_CLOSE = URL_NETSUITE + '/images/forms/hide.gif';

	//internal ids
	var REC_CUSTOMER = 'customer';
	var CUSTOMER_SEARCH = 'customsearch_bbs_google_customer_search'; //the order in the search is important
	var CUSTOM_SCRIPT = 'customscript_bbs_cust_googlemap_suitelet';
	var CUSTOM_DEPLOY = 'customdeploy_bbs_cust_googlemap_suitelet';

	var SUITELET = 'SUITELET';
	var RECORD = 'RECORD';
	var SCRIPT = 'SCRIPT';

	var FLD_TITLE = 'companyname';
	var FLD_STATUS = 'entitystatus';
	var FLD_MESSAGE = 'comments';
	var FLD_SALESREP = 'salesrep';
	var FLD_COMPANY = 'companyname';
	var FLD_EMAIL = 'email';
	var FLD_ADDRESS = 'defaultaddress';
	var FLD_LATITUDE = 'custentity_bbs_latitude';
	var FLD_LONGITUDE = 'custentity_bbs_longitude';
	var FLD_LOCATION = 'phone';
	var FLD_INTADDR = 'address';

}

/**
 * Escape strings for JSON format
 * , { } [ ] " '
 * @param {String} text Text to escape.
 * @return {String} Escaped string
 */
function jsEscape(text) {
	if (text) {
		text = text.replace(/'/g, "&apos;");
		text = text.replace(/"/g, "&quot;");
		text = text.replace(/\{/g, "&#123;");
		text = text.replace(/\}/g, "&#125;");
		text = text.replace(/\[/g, "&#91;");
		text = text.replace(/\]/g, "&#93;");
		text = text.replace(/\,/g, "&#44;");
		text = text.replace(/\n/g, "<br/>");
		text = text.replace(/\r/g, "<br/>");
		text = text.replace(/\\/g, "\\\\");
	}
	return text;
}

/**
 * Get customers and return a JSON array
 */
function getCustomers(externalSearchId) {
	var unmappedCount = 0;
	var htmlUnmapped = "";
	var jsonEvents = "";
	var results = null;

	if (externalSearchId != null && externalSearchId != '') {
		if (externalSearchId != '0') {
			results = nlapiSearchRecord(REC_CUSTOMER, externalSearchId, null, null);
		}
	}
	else {
		results = nlapiSearchRecord(REC_CUSTOMER, CUSTOMER_SEARCH, null, null);
	}

	if (results) {
		var lastPoint = null;
		var itemArray = '';

		for (var i = 0; i < results.length; i++) {
			var isUnmapped = true;
			var title = results[i].getValue(FLD_TITLE);
			var status = results[i].getText(FLD_STATUS);
			var addr = results[i].getValue(FLD_INTADDR);
			var email = results[i].getValue(FLD_EMAIL);

			//if address is populated
			if (addr) {
				addr = removeCRLF(addr);

				var latitude = results[i].getValue(FLD_LATITUDE);
				var longitude = results[i].getValue(FLD_LONGITUDE);
				var message = results[i].getValue(FLD_MESSAGE);
				var salesrep = results[i].getText(FLD_SALESREP);
				var company = results[i].getText(FLD_COMPANY);
				var location = results[i].getValue(FLD_LOCATION);
				var tabLabel = title;
				var link = nlapiResolveURL(RECORD, REC_CUSTOMER, results[i].getId());

				//check if geo code is available in record
				if (latitude && longitude) {
					isUnmapped = false;

					//encode record info in json format, one record is one object
					var item = '{ address : "' + addr + '", ' + '  content : "<span class=content><b><a target=_top href=\\\"' + link + '\\\">' + jsEscape(title) + '</a></b> (' + jsEscape(status) + ')<br/>';

					if (company) {
						item += jsEscape(company) + '<br/>';
					}

					item += '<i>' + jsEscape(addr) + '</i><br/>';

					if (location) {
						item += 'Phone: ' + jsEscape(location) + '<br/>';
					}

					if (email) {
						item += 'Email: ' + jsEscape(email) + '<br/>';
					}

					if (salesrep) {
						item += 'Sales Rep: ' + jsEscape(salesrep) + '<br/>';
					}

					item += '</span>",' + '  message : "' + ((message) ? ('<span class=content>' + jsEscape(message) + '</span>') : '') + '",' + '  title : "' + jsEscape(title) + '",' + '  longitude : ' + longitude + ',' + '  latitude : ' + latitude + ',' + '  tabLabel : "' + tabLabel + '" }';

					//routine to group together records with same latitude & longitude
					//  into one array of item objects
					if (lastPoint != null && lastPoint != latitude + "," + longitude) {
						jsonEvents += '[' + itemArray.substring(0, itemArray.length - 1) + '],';
						itemArray = '';
					}

					itemArray += item + ',';

					lastPoint = latitude + "," + longitude;
				}
			}

			if (isUnmapped) {
				htmlUnmapped += '<li>' + title + ' (' + addr + ')</li>';
				unmappedCount++;
			}

			if (i == results.length - 1 && itemArray.length > 0) {
				jsonEvents += '[' + itemArray.substring(0, itemArray.length - 1) + '],';
			}
		}

		if (jsonEvents.length > 0) {
			jsonEvents = '[' + jsonEvents.substring(0, jsonEvents.length - 1) + ']';
		}
	}

	return { mapped : jsonEvents,
	unmapped : htmlUnmapped,
	unmappedCount : unmappedCount
	};
}

/**
 * Suitelet to generate inline html calling Google maps.
 *
 * @param {Object} request
 * @param {Object} response
 */
function customerGoogleMapsSuitelet(request, response) {

	var searchIdParam = request.getParameter('searchid');
	var customersToday = null;

	if (searchIdParam != null && searchIdParam != '') {
		customersToday = getCustomers(searchIdParam);
	}
	else {
		customersToday = getCustomers('');
	}

	var html = [ '<html><head>', '<meta http-equiv="content-type" content="text/html; charset=utf-8"/>', '<title>Events Map Integration</title>', '<style type="text/css">', '.content { font-size:8pt; font-family: arial, helvetica; }', '</style>' ];

	if (customersToday.mapped.length > 0) {
		var showTraffic = false;
		var showMapTypeControl = true;

		html = html
				.concat([ '<style type="text/css">', '#map          { width: 100%; height: 100%; border: 0px; padding: 0px; position: absolute; }', '.content_odd  { background-color: #E8E8E8; font-size:8pt; font-family: arial, helvetica; padding:5px}', '.content_even { font-size:8pt; font-family: arial, helvetica; padding:5px }', '.tabs_off     { background-color:#E8E8E8; font-family: arial, helvetica; font-size:8pt; float: left; display: inline; ', 'border: 0px; cursor: pointer; color: #505050; padding: 3px; margin-right:2px; }', '.tabs_on      { background-color:red; color: white; border:0px; font-family: arial, helvetica; font-size:8pt; float: left; display: inline; ', 'margin-right:2px; padding: 3px; }', '.tabs_line    { font-family: arial, helvetica; font-size:8pt; border-top-width: 1px; border-left-width: 0px;border-right-width: 0px; border-bottom-width: 0px; ', 'border-top-style: solid; border-left-style: none; border-right-style:none; border-bottom-style: none; ', 'border-top-color: #A0A0A0; border-left-color: #A0A0A0; border-right-color: #A0A0A0; border-bottom-color: #A0A0A0; padding: 3px; }', '.moreDetails  { background-color:#707070; font-family: arial, helvetica; font-size:8pt; float: right; display: inline; ', 'border: 0px; cursor: pointer; color:white; padding: 3px; margin-right:15px; }', '</style>', '<script src="', URL_GOOGLE_MAP_SCRIPT, '" type="text/javascript"></script>', '<script type="text/javascript">', 'function toggle(id) {', 'var el = document.getElementById(id);', 'if (el) {', 'el.style.display = (el.style.display=="none") ? "" : "none";', '}', '}', 'function moreDetails(id, content) {', 'return "<div class=moreDetails onclick=\\\"toggle("+id+");\\\">Details</div><div id="+id+" style=\\\"display:none\\\">"+content+"</div>";', '}', 'var Tabs = {', 'list: {},',
				//tabset_9   tab_9_9  data_tab_9_9
				'cssOn : "tabs_on",', 'cssOff: "tabs_off",', 'setCss: function(id, cssClass) {', 'var data = document.getElementById(id);', 'if (data) {', 'data.style.display = cssClass;', '}', '},', //setCss
				'setup: function(tabsContainer) {', 'var tabs = document.getElementById(tabsContainer).getElementsByTagName("div");', 'var first = true;', 'for (var x in tabs) {', 'if (tabs[x].id!=undefined && tabs[x].id.indexOf("tab_")==0) {', 'this.list[tabs[x].id] = tabsContainer;', 'first = false;', '}', '}', //for
				'},', //setup
				'onClick: function(element) {', 'var container = this.list[element.id];', 'if (container!=null) {', 'var tabs = document.getElementById(container).getElementsByTagName("div");', 'for (var x in tabs) {', 'if (tabs[x].id!=undefined && tabs[x].id.indexOf("tab_")==0) {', 'if (tabs[x]==element) {', 'tabs[x].className = this.cssOn;', 'this.setCss("data_"+tabs[x].id,"");', '} else if (tabs[x].className==this.cssOn) {', 'tabs[x].className = this.cssOff;', 'this.setCss("data_"+tabs[x].id,"none");', '}', '}', '}', //for
				'}', '}', //onClick
				'};', //Tabs
				'var nsEvents = ', customersToday.mapped, ';', 'var iconSimple = new google.maps.MarkerImage("' + ICON_SINGLE_GOOGLE + '", new google.maps.Size(32,32), new google.maps.Point(0,0),new google.maps.Point(16,32));', 'var iconMultiple = new google.maps.MarkerImage("' + ICON_MULTIPLE_GOOGLE + '", new google.maps.Size(32,32), new google.maps.Point(0,0),new google.maps.Point(16,32));', 'var iconShadow = new google.maps.MarkerImage("' + ICON_SHADOW_GOOGLE + '", new google.maps.Size(56,32), new google.maps.Point(0,0), new google.maps.Point(16,32));', 'var center = null;', 'var map = null;', 'var currentPopup, infoPopup;', 'var markerList = {};', 'var bounds = new google.maps.LatLngBounds();', 'function hideMore() {', 'infoPopup.close();', 'infoPopup=null;', 'map.panTo(center);', '}', 'function showMore(id) {', 'var m = markerList[id];', 'if (currentPopup!=null) { currentPopup.close(); currentPopup=null; }', 'infoPopup = new google.maps.InfoWindow({ content: m._maxContent, maxWidth: 500 });', 'infoPopup.open(map, m);', 'google.maps.event.addListener(infoPopup,"closeclick", hideMore);', '}', 'function formatContent(tabs, content, index) {', 'var html = null;', 'if (tabs==null) {', 'html = "<div style=\\\"float: left; display:inline; width:430px; height:100%; overflow:auto;\\\">"+content+"</div>', '<div align=center valign=top style=\\\"width:15px; float: right; display:inline;\\\">', '&nbsp;</div>";', '} else {', 'html = "<table width=350 cellpadding=0 cellspacing=0 border=0>', '<tr><td valign=bottom>"+tabs+"</td></tr>', '<tr><td valign=top class=tabs_line>"+content+"</td></tr></table>";', '}', 'return html;', '}', 'function addMarker(items, index){ ', 'var pt = new google.maps.LatLng(items[0].latitude, items[0].longitude);', 'bounds.extend(pt);', 'var tabs = "";', 'var content = "";', 'var maxContent = "";', 'var label = "";', 'if (items.length==1) {', 'tabs = "<div class=tabs_on>"+items[0].tabLabel+"</div>";', 'content = items[0].content;', 'label = items[0].title;', 'maxContent = formatContent(null, items[0].content + items[0].message, null);', '} else {', 'for(var i=0; i<items.length; i++) {', 'label += ((i==0)?"":" | ")+items[i].title;', 'tabs += "<div class="+((i==0)?"tabs_on":"tabs_off")+" id=tab_"+index+"_"+i+" onclick=\\\"Tabs.onClick(this);\\\">" + items[i].tabLabel + "</div>";', 'content += "<div id=data_tab_"+index+"_"+i+" "+((i==0)?"":"style=\\\"display:none\\\"")+">"+items[i].content+"</div>";', 'maxContent += "<p class="+ ((i%2==0)?"content_even":"content_odd") +">"+ items[i].content + items[i].message + "</p>";', '}', 'tabs = "<div id=tabset_"+index+">"+tabs+"</div>";', 'maxContent = formatContent(null, maxContent, null);', '}', 'tabs += "<div class=moreDetails onclick=\\\"showMore("+index+");\\\">More</div>";', 'var info = formatContent(tabs, content, index);', 'var marker = new google.maps.Marker({ position: pt, title: label, icon : ((items.length>1)?iconMultiple:iconSimple), shadow: iconShadow, map: map} );', 'marker._maxContent=maxContent;', //custom property
				'markerList[index]=marker;', 'var popup = new google.maps.InfoWindow({ content: info, maxWidth: 500 });', 'google.maps.event.addListener(marker, "click", function() {', 'if (infoPopup!=null) { infoPopup.close(); infoPopup=null; }', 'if (currentPopup!=null) { currentPopup.close(); currentPopup=null; }', 'popup.open(map, marker);', 'currentPopup = popup;', 'if (items.length>1) {', 'Tabs.setup("tabset_"+index);', '}', '});', 'google.maps.event.addListener(popup,"closeclick",function(){', 'map.panTo(center);', 'currentPopup=null;', '});', '}', 'function initMap() {', 'map = new google.maps.Map(document.getElementById("map"), { ', 'center: new google.maps.LatLng(0,0),', 'zoom: 14,', 'mapTypeId: google.maps.MapTypeId.ROADMAP,', 'mapTypeControl: ', showMapTypeControl, ',', 'mapTypeControlOptions: {style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR },', 'navigationControl: true,', 'navigationControlOptions: {style: google.maps.NavigationControlStyle.ZOOM_PAN }', '});', 'for(var i=0; i<nsEvents.length; i++){', 'addMarker(nsEvents[i],i);', '}', 'var trafficLayer = new google.maps.TrafficLayer();', 'trafficLayer.setMap(map);', 'center = bounds.getCenter();', 'if (nsEvents.length>1) {', 'map.fitBounds(bounds);',
				//     'map.setZoom(map.getZoom-1);', //recursion error fix, comment out this line
				'} else {', 'map.setCenter(center);', 'map.setZoom(14);', '}', '}', //func
				'</script>', '</head>', '<body onload="initMap()" style="margin:0px; border:0px; padding:0px;">', '<div id="map">', '</div>' ]);
	}
	else
		if (customersToday.unmappedCount > 0) {
			html.push('<span class=content>' + customersToday.unmappedCount + ' customer(s) found, but all without map data.<ul>' + customersToday.unmapped + '</ul></span>');
		}
		else {
			html.push('<span class=content>No customer(s) found.</span>');
		}

	html.push('</body></html>');
	response.writeLine(html.join(''));
}

/**
 * Remove line feed and carriage return.
 *
 * @param text
 * @return text
 */
function removeCRLF(text) {
	return (text == null) ? text : text.replace(/\r\n/g, ' ').replace(/\r/g, ' ').replace(/\n/g, ' ');
}

function requestGeocode(url, param, isJSON) {
	var url = url + param.replace(/ /g, '+') + GOOGLE_KEY;
	var res = nlapiRequestURL(url, null, null, null);

	if (res.getCode() == 200) {
		var body = res.getBody();

		if (isJSON) {
			var result = eval('(' + body + ')');
			if (result) {
				return result;
			}
		}
		else {
			return body;
		}
	}
	else {
		alert(res.getCode());
	}
	return null;
}

function trim(text) {
	if (!text)
		return '';
	var i = 0;
	while (i < text.length && text.charAt(i) == ' ') {
		i++;
	}
	var j = text.length;
	while (j > 0 && text.charAt(j) == ' ') {
		j--;
	}
	return text.substring(i, j);
}

function geocodeGoogle(address) {
	var res = requestGeocode(URL_GOOGLE_MAP_GEOCODE, removeCRLF(address), true);

	if (res && res.status == "OK") {
		return { error : null,
		latitude : res.results[0].geometry.location.lat,
		longitude : res.results[0].geometry.location.lng
		};
	}
	return { error : 'Error code=' + res.error
	};
}

/**
 * Update customer record
 *
 * @param {Object} geocode containing latitude, longitude, error
 */
function updateCustomerLonLat(geocode) {
	if (!geocode.error) {
		//success
		nlapiSetFieldValue(FLD_LATITUDE, geocode.latitude);
		nlapiSetFieldValue(FLD_LONGITUDE, geocode.longitude);
		return true;
	}
	else {
		//failed
		nlapiSetFieldValue(FLD_LATITUDE, '');
		nlapiSetFieldValue(FLD_LONGITUDE, '');

		return false;
	}
}

function custGoogleMapsFieldChanged(type, name) {

	if (name == FLD_ADDRESS) {
		var address = nlapiGetFieldValue(FLD_ADDRESS);

		if (address) {

			if (!updateCustomerLonLat(geocodeGoogle(address))) {
				alert('Unable to geocode the address.');
			}
		}
		else {
			nlapiSetFieldValue(FLD_LATITUDE, '');
			nlapiSetFieldValue(FLD_LONGITUDE, '');
		}
	}
}

function customerGoogleortlet(portletObj, column) {

	portletObj.setTitle('Google Customer Portlet');

	portletObj.setScript('customscript_bbs_cust_portlet_client');

	var field1 = portletObj.addField('custpage_select', 'select', 'Select Search', 'customrecord_bbs_cust_google_searches');
	field1.setLayoutType('normal', 'startcol');

	var field2 = portletObj.addField('custpage_text2', 'inlinehtml', '');
	field2.setLayoutType('outsidebelow', 'none');

	var height = 350;
	var serverUrl = nlapiResolveURL(SUITELET, CUSTOM_SCRIPT, CUSTOM_DEPLOY);
	var html = '<iframe src="' + serverUrl + '&searchid=0 " width="100%" align="center"  height="' + (height + 4) + 'px" style="margin:0px; border:0px; padding:0px"></iframe>';

	field2.setDefaultValue(html);

}

function customerGoogleMassUpdate(recType, recId) {

	var customerRecord = nlapiLoadRecord(recType, recId);

	var address = customerRecord.getFieldValue(FLD_ADDRESS);

	var geocode = geocodeGoogle(address);

	if (!geocode.error) {

		customerRecord.setFieldValue(FLD_LATITUDE, geocode.latitude);
		customerRecord.setFieldValue(FLD_LONGITUDE, geocode.longitude);
	}

	nlapiSubmitRecord(customerRecord, false, true);
}