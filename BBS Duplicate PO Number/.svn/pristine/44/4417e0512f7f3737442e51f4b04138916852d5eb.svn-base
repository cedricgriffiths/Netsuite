/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       10 Jan 2017     cedricgriffiths
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
 
	//Only interested in the customer's PO number
	//
	if (name == 'otherrefnum')
		{
		
		//Have we entered a customer
		//
		var customerId = nlapiGetFieldValue('entity');
		
		if (customerId != null && customerId != '')
			{
			
			//Have we got a purchase order number
			//
			var purchaseOrderNumber = nlapiGetFieldValue('otherrefnum');
			
			if (purchaseOrderNumber != null && purchaseOrderNumber != '')
				{
				
				//Now go and search to see if the po exists for the customer elsewhere
				//
				var cols = new Array();
				cols[0] = new nlobjSearchColumn('otherrefnum');
				cols[1] = new nlobjSearchColumn('tranid');
				cols[2] = new nlobjSearchColumn('mainline');
				cols[3] = new nlobjSearchColumn('internalid');

				var searchFilters = new Array();
				searchFilters[0] = new nlobjSearchFilter('mainline', null, 'is', 'T');
				searchFilters[1] = new nlobjSearchFilter('name', null, 'is', customerId);
				searchFilters[2] = new nlobjSearchFilter('otherrefnum', null, 'equalto', purchaseOrderNumber);
				
				// Create the search
				//
				var orderSearch = nlapiCreateSearch('salesorder', searchFilters, cols);

				// Run the search
				//
				var orderSearchResults = orderSearch.runSearch();

				// Get the result set from the search
				//
				var orderSearchResultSet = orderSearchResults.getResults(0, 10);

				// See if there are any results to process
				//
				if (orderSearchResultSet != null) 
					{
					if (orderSearchResultSet.length > 0)
						{
							
						alert('Purchase Order Already In Use For This Customer');
							
						nlapiSetFieldValue('otherrefnum', null, false, true);
							
						}
					}
				}
			}
		}
	}
