/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       22 Aug 2017     cedricgriffiths
 *
 */
function libCreateSession()
{
	var uniqueId = Number(Date.now()).toFixed(0).toString();
	
	var paramsRecord = nlapiCreateRecord('customrecord_bbs_internal_params');
	paramsRecord.setFieldValue('custrecord_bbs_params_id', uniqueId);
	var sessionId = nlapiSubmitRecord(paramsRecord, false, true);
	
	return sessionId;
}

function libGetSessionData(sessionId)
{
	var sessionRecord = nlapiLoadRecord('customrecord_bbs_internal_params', sessionId);
	var data = null;
	
	if (sessionRecord)
		{
			data = sessionRecord.getFieldValue('custrecord_bbs_params_data');
		}
	
	return data;
}

function libSetSessionData(sessionId, sessionData)
{
	var sessionRecord = nlapiLoadRecord('customrecord_bbs_internal_params', sessionId);
	
	if (sessionRecord)
		{
			sessionRecord.setFieldValue('custrecord_bbs_params_data', sessionData);
			
			nlapiSubmitRecord(sessionRecord, false, true);
		}
}

function libClearSessionData(sessionId)
{
	nlapiDeleteRecord('customrecord_bbs_internal_params', sessionId);
}


function libGetPeriod(periodDate)
{
	var returnValue = '';
	
	var accountingperiodSearch = nlapiSearchRecord("accountingperiod",null,
			[
			   ["startdate","onorbefore",periodDate], 
			   "AND", 
			   ["enddate","onorafter",periodDate], 
			   "AND", 
			   ["closed","is","F"], 
			   "AND", 
			   ["isyear","is","F"], 
			   "AND", 
			   ["isquarter","is","F"]
			], 
			[
			   new nlobjSearchColumn("periodname",null,null), 
			   new nlobjSearchColumn("startdate",null,null).setSort(false)
			]
			);
	
	if(accountingperiodSearch && accountingperiodSearch.length == 1)
		{
			returnValue = accountingperiodSearch[0].getId();
		}
	
	return returnValue;
}

function libGetCustomers(subsidiaryId)
{
	var results = {};
	
	var filterArray = [
	                   ["custbody_bbs_related_invoice","anyof","@NONE@"],	//Not already been through this process
	                   "AND",
	                   ["type","anyof","ItemShip"],							//Fulfillments
	                   "AND",
	                   ["mainline","is","T"],								//Main line 
	                   "AND", 
	                   ["status","anyof","ItemShip:C"],						//Fulfilment status is "Shipped"
	                   "AND", 
	                   ["createdfrom","noneof","@NONE@"], 					//Created from is filled in
	                   "AND", 
	                   ["createdfrom.status","noneof","SalesOrd:G","SalesOrd:C","SalesOrd:H","SalesOrd:A"]			//Sales order not at "Billed","Cancelled","Closed","Pending Approval" status
	                   ];
	
	if(subsidiaryId != null && subsidiaryId != '')
		{
			filterArray.push("AND",["subsidiary","anyof",subsidiaryId]);
		}
		
	var itemfulfillmentSearch = nlapiSearchRecord("itemfulfillment",null,filterArray,
			[
			 	new nlobjSearchColumn("entity",null,"GROUP").setSort(false)
			]
			);
			
	if(itemfulfillmentSearch && itemfulfillmentSearch.length > 0)
		{
			for (var int = 0; int < itemfulfillmentSearch.length; int++) 
			{
				var customerId = itemfulfillmentSearch[int].getValue("entity",null,"GROUP");
				var customerText = itemfulfillmentSearch[int].getText("entity",null,"GROUP");
				
				results[customerText] = customerId;
			}
		}
		
	
	//Sort the output
	//
	const orderedResults = {};
	Object.keys(results).sort().forEach(function(key) {
		orderedResults[key] = results[key];
	});
	
	
	return orderedResults;
}