/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       03 Mar 2017     cedricgriffiths
 *
 */
function itemFieldChanged(type, name, linenum)
{
	if (type == 'item' && name == 'item')
	{
		var itemId = nlapiGetCurrentLineItemValue(type, name);
		var customerId = nlapiGetFieldValue('entity');
		var parentId = null;
		
		if(customerId)
			{
				var customerRecord = nlapiLoadRecord('customer', customerId);
				parentId = customerRecord.getFieldValue('parent');
				
				if(parentId == null || parentId == '')
					{
						parentId = customerId;
					}
			}
		
		if (itemId != null && itemId != '')
			{
				var filters = new Array();
				filters[0] = new nlobjSearchFilter('internalid', null, 'anyof', itemId);
				//filters[1] = new nlobjSearchFilter('custitem_bbs_item_web', null, 'is', 'T');
				
				var columns = new Array();
				columns[0] = new nlobjSearchColumn('custitem_bbs_item_customer');
				columns[1] = new nlobjSearchColumn('type');
				
				var results = nlapiSearchRecord('item', null, filters, columns);
				if(results)
					{
						if (results.length == 1)
						{
							var belongs = results[0].getValue('custitem_bbs_item_customer');
							var itemType = results[0].getValue('type');
							
							if(belongs == null || belongs == '' || belongs == customerId || belongs == parentId)
								{
									var dummy = '';
								}
							else
								{
									alert('You Cannot Select This Item Here.');
									nlapiSetCurrentLineItemValue('item', 'description', '', false, true);
									nlapiCancelLineItem('item');
									nlapiRemoveLineItem('item', linenum);
								}	
						}
					}
			}
	}
}

function manPackProcessing() {
	
	//This function gets called from the 'Man Pack' button on the item sublist
	//Call the manpack processing suitelet from here
	//
	var customer = nlapiGetFieldValue('entity');
	var depot = nlapiGetFieldValue('shipaddresslist');
	var depotName = nlapiGetFieldText('shipaddresslist');
	
	if (customer)
		{
			// Get the relative url of the suitelet 
			//
			var url = nlapiResolveURL('SUITELET', 'customscript_bbs_filtered_item_suitelet', 'customdeploy_bbs_filtered_item_suitelet');
		
			url = url + '&stage=1';
			url = url + '&customerid=' + customer;
			url = url + '&depotid=' + depot;
			url = url + '&depotname=' + depotName;
			
			// Open the contract print in a new window
			//
			window.open(url, '_blank', 'Man Pack Processing', 'menubar=no, titlebar=no, toolbar=no, scrollbars=no, resizable=yes');
		}
	else
		{
			alert('Cannot Select Items Without a Customer Selected');
		}
}

//This function is called by the suitelet to handle the chose items & add them to the sales order
//
function manpackCallback(dataString) 
{			
			//Convert the JSON string back into an array
			//
			var data = JSON.parse(dataString);
			
			//Process the array data
			//
			for (var int = 0; int < data.length; int++) 
			{
				var line = data[int];
				
				var item = line[0];
				var qty = line[1];
				var id = line[2];
				var employeeId = line[3];
				
				nlapiSelectNewLineItem('item');
				nlapiSetCurrentLineItemValue('item', 'item', id, true, true);
				nlapiSetCurrentLineItemValue('item', 'quantity', qty, true, true);
				
				if (employeeId != null && employeeId != '')
					{
						nlapiSetCurrentLineItemValue('item', 'custcol_bbs_sales_line_contact', employeeId, true, true);
					}	
				
				var amount = nlapiGetCurrentLineItemValue('item', 'amount');
				
				//Allow for the amount field being empty & set it to zero manually
				//
				if (!amount)
					{
						nlapiSetCurrentLineItemValue('item', 'amount', '0', true, true);
					}
				
				nlapiCommitLineItem('item');
			}
}

