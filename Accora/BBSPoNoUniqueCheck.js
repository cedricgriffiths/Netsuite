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
function poFieldChanged(type, name, linenum)
{
	if(name == 'otherrefnum')
		{
			//Get the current record id & the current po num,ber
			//
			var currentId = nlapiGetRecordId();
			var currentPoNo = nlapiGetFieldValue('otherrefnum');
			var currentType = '';
			
			switch(nlapiGetRecordType())
				{
					case 'salesorder':
						currentType = 'SalesOrd';
						break;
						
					case 'estimate':
						currentType = 'Estimate';
						break;
						
					case 'invoice':
						currentType = 'CustInvc';
						break;
						
				}
			
			//Check to see if we have a po number
			//
			if(currentPoNo != null && currentPoNo != '')
				{
					//Basic filter
					//
					var filters = [
								   //["type","anyof","Estimate","CustInvc","SalesOrd"], 
								   ["type","anyof",currentType], 
								   "AND", 
								   ["mainline","is","T"], 
								   "AND", 
								   ["poastext","is",currentPoNo]
								];
					
					//If the current id is not -1 (new record) then exclude it from the serach
					//
					if(currentId != null && currentId != '' && currentId != '-1')
						{
							filters.push("AND", ["internalid","noneof",currentId]);
						}
					
					//Do the search
					//
					var transactionSearch = nlapiSearchRecord("transaction",null, filters, 
							[
							   new nlobjSearchColumn("tranid")
							]
							);
					
					//Have we found anything, if so it must be a duplicate
					//
					if(transactionSearch != null && transactionSearch.length > 0)
						{
							alert('WARNING - Purchase Order Number ' + currentPoNo + " Has Already Been Used On Another Transaction");
							//nlapiSetFieldValue('otherrefnum', '', false, true);
						}
				}
		}
}
