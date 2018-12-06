/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       06 Dec 2018     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function clientFieldChanged(type, name, linenum)
{
	var currentId = nlapiGetRecordId();
	var currentPoNo = nlapiGetFieldValue('otherrefnum');
	
	if(currentPoNo != null && currentPoNo != '')
		{
			var filters = [
						   ["type","anyof","Estimate","CustInvc","SalesOrd"], 
						   "AND", 
						   ["mainline","is","T"], 
						   "AND", 
						   ["poastext","is",currentPoNo]
						];
			
			if(currentId != null && currentId != '' && currentId != '-1')
				{
					filters.push("AND", ["internalid","noneof",currentId]);
				}
			
			var transactionSearch = nlapiSearchRecord("transaction",null, filters, 
					[
					   new nlobjSearchColumn("tranid")
					]
					);
			
			if(transactionSearch.length > 0)
				{
					alert('Purchase Order Number ' + currentPoNo + " Has Already Been Used. Please Re-Enter");
					nlapiSetFieldValue('otherrefnum', '', false, true);
				}
		}
	
}
