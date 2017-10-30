/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       30 Oct 2017     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */
function binsSerialNumbersBS(type)
{
	var count = nlapiGetLineItemCount('item');
	 
	for(var i=1; i <= count; i++ ) 
	{
		var bins = "";
		var serials = "";
		
		nlapiSelectLineItem('item', i);
		
		var rec = nlapiViewLineItemSubrecord('item', 'inventorydetail',i);
		
		if (rec)
			{
				var invcount = rec.getLineItemCount('inventoryassignment');  
				 
				  for(var x = 1; x <=invcount ; x++) 
				  {
					  rec.selectLineItem('inventoryassignment', x);
				    
					  var binID = rec.getCurrentLineItemText('inventoryassignment', 'binnumber');
					  var quantity = rec.getCurrentLineItemValue('inventoryassignment', 'quantity');
					  var serialNumber = rec.getCurrentLineItemText('inventoryassignment', 'issueinventorynumber');
					  
					  if(x>1)
					  {
						  bins += '\n';
						  serials += '\n';
					  }
					  
					  bins += binID + ' (' + quantity + ')';
					  serials += serialNumber;
				  }
			}
		  nlapiSetCurrentLineItemValue('item', 'custcol_bbs_if_bin_no', bins);  
		  nlapiSetCurrentLineItemValue('item', 'custcol_bbs_if_serial_no', serials);  
		  
		  nlapiCommitLineItem('item');
	}
	 
}
