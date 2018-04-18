
//Authentication Data
//
var appId = '8D0B253D-77AA-494E-AC6A-5F149716CA3E';
var email = 'cedric.griffiths@brightbridgesolutions.com';
var password = 'Horsey1234';
var account = 'TSTDRV1918005';
var role = '3';

//Works Order Data
var customerId = '4';
var assemblyId = '53';
var quantity = '2';
var sourceTranId = '270';
var sourceTranLine = '1';
var subsidiaryId = '1';

//General variables
//
var sessionInfo = {};


var loginStatus = webServiceLogin(appId, email, password, account, role, sessionInfo);

if(loginStatus)
	{
		var addWoStatus = webServiceCreateSpecialWo(sessionInfo, appId, customerId, assemblyId, quantity, sourceTranId, sourceTranLine, subsidiaryId)
	}


//Functions
//
function webServiceLogin(appId, email, password, account, role, sessionInfo)
{
	var headers = new Array();
	
    headers['User-Agent-x'] = 'SuiteScript-Call';
    headers['Content-Type'] = 'text/xml; charset=utf-8';
    headers['SOAPAction'] = 'login';
    
    var xml = '';
    
    xml += '<?xml version="1.0" encoding="utf-8"?>';
    xml += '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">';
    xml += '<soap:Header>';
    xml += '<applicationInfo xmlns="urn:messages_2017_2.platform.webservices.netsuite.com">';
    xml += '<applicationId>' + appId +'</applicationId>';
    xml += '</applicationInfo>';
    xml += '</soap:Header>';
    xml += '<soap:Body>';
    xml += '<login xmlns="urn:messages_2017_2.platform.webservices.netsuite.com">';
    xml += '<passport>';
    xml += '<email xmlns="urn:core_2017_2.platform.webservices.netsuite.com">' + email +'</email>';
    xml += '<password xmlns="urn:core_2017_2.platform.webservices.netsuite.com">' + password + '</password>';
    xml += '<account xmlns="urn:core_2017_2.platform.webservices.netsuite.com">' + account +'</account>';
    xml += '<role internalId="' + role + '" xmlns="urn:core_2017_2.platform.webservices.netsuite.com" />';
    xml += '</passport>';
    xml += '</login>';
    xml += '</soap:Body>';
    xml += '</soap:Envelope>';

    var sUrl = 'https://webservices.netsuite.com/services/NetSuitePort_2017_2';

    var resp = nlapiRequestURL( sUrl, xml , headers );
    var bodyXml = nlapiStringToXML(resp.getBody());

    var requestStatusNode = nlapiSelectNode(bodyXml, '/soapenv:Envelope/soapenv:Body/nlapi:loginResponse/nlapi:sessionResponse/platformCore:status');
    var loginStatus = nlapiSelectValue(requestStatusNode, '@isSuccess');

    var respHeaders = resp.getHeaders('Set-Cookie');
    
    for (var int = 0; int < respHeaders.length; int++) 
	    {
    		var theHeader = respHeaders[int];
    		
			if(theHeader.indexOf("JSESSIONID") > -1)
				{
					var sId = theHeader.substring(0, theHeader.indexOf(';') + 1);
					sessionInfo['sessionId'] = sId + 'NS_ROUTING_VERSION=LEADING; NS_VER=2017.2.0';
					
					break;
				}
		}
    
    return (loginStatus === 'true');
}

function webServiceCreateSpecialWo(sessionInfo, appId, customerId, assemblyId, quantity, sourceTranId, sourceTranLine, subsidiaryId)
{
var headers = new Array();
	
    headers['User-Agent-x'] = 'SuiteScript-Call';
    headers['Content-Type'] = 'text/xml; charset=utf-8';
    headers['SOAPAction'] = 'add';
    headers['Cookie'] = sessionInfo['sessionId'];
    
	var xml = '';
	
	xml += '<?xml version="1.0" encoding="utf-8"?>';
	xml += '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">';
	xml += '<soap:Header>';
	xml += '<applicationInfo xmlns="urn:messages_2017_2.platform.webservices.netsuite.com">';
	xml += '<applicationId>' + appId + '</applicationId>';
	xml += '</applicationInfo>';
	xml += '</soap:Header>';
	xml += '<soap:Body>';
	xml += '<add xmlns="urn:messages_2017_2.platform.webservices.netsuite.com">';
	xml += '<record xmlns:q1="urn:inventory_2017_2.transactions.webservices.netsuite.com" xsi:type="q1:WorkOrder">';
	xml += '<q1:entity internalId="' + customerId + '" type="customer" />';
	xml += '<q1:assemblyItem internalId="' + assemblyId + '" type="assemblyItem" />';
	xml += '<q1:quantity>' + quantity + '</q1:quantity>';
	xml += '<q1:sourceTransactionId>' + sourceTranId + '</q1:sourceTransactionId>';
	xml += '<q1:sourceTransactionLine>' + sourceTranLine + '</q1:sourceTransactionLine>';
	xml += '<q1:specialOrder>true</q1:specialOrder>';
	xml += '<q1:subsidiary internalId="' + subsidiaryId + '" type="subsidiary" />';
	xml += '</record>';
	xml += '</add>';
	xml += '</soap:Body>';
	xml += '</soap:Envelope>';
	
	var sUrl = 'https://webservices.netsuite.com/services/NetSuitePort_2017_2';

    var resp = nlapiRequestURL( sUrl, xml , headers );
    var bodyXml = nlapiStringToXML(resp.getBody());

    var requestStatusNode = nlapiSelectNode(bodyXml, '/soapenv:Envelope/soapenv:Body/nlapi:addResponse/nlapi:writeResponse/platformCore:status');
    
    var addStatus = nlapiSelectValue(requestStatusNode, '@isSuccess');

    return (addStatus === 'true');
}






