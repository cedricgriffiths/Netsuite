/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       16 Feb 2017     cedricgriffiths
 *
 */
function clientFieldChanged(type, name, linenum)
{
	var stage = Number(nlapiGetFieldValue('custpage_stage'));
	
	switch(stage)
	{
	case 0:
		
		if (type == 'custpage_sublist1') 
		{
			if (name == 'custpage_cons_tick')
			{
				var ticked = nlapiGetLineItemValue(type, 'custpage_cons_tick', linenum);
				
				if (ticked == 'T')
					{
						var lines = nlapiGetLineItemCount('custpage_sublist1');
						
						for (var int = 1; int <= lines; int++) 
						{
							if (int != linenum)
								{
									nlapiSetLineItemValue('custpage_sublist1', 'custpage_cons_tick', int, 'F');
								}
						}
					}
			}
		}
		
		break;
		
	case 1:
		
		if (type == 'custpage_sublist1') 
		{
			//See if the item quantity has changed
			//
			if (name == 'custpage_col_allocate')
				{
					var qty = Number(nlapiGetLineItemValue(type, 'custpage_col_allocate', linenum));
					var outstanding = Number(nlapiGetLineItemValue(type, 'custpage_col_outstanding', linenum));
					
					if (qty > outstanding)
						{
							alert('Cannot allocate more than available qty of ' + outstanding.toString() );
							nlapiSetLineItemValue(type, 'custpage_col_allocate', linenum, null);
							nlapiSetLineItemValue(type, 'custpage_col_tick', linenum, 'F');
						}
					else
						{
							if (qty > 0)
								{
									//If the quantity is non-blank then set the tick on the line
									//
									nlapiSetLineItemValue(type, 'custpage_col_tick', linenum, 'T');
								}
							else
								{
									//If the quantity is blank then un-set the tick on the line
									//
									nlapiSetLineItemValue(type, 'custpage_col_tick', linenum, 'F');
									nlapiSetLineItemValue(type, 'custpage_col_allocate', linenum, null);
								}
						}
				}
			
			if (name == 'custpage_col_tick')
			{
				var ticked = nlapiGetLineItemValue(type, 'custpage_col_tick', linenum);
				
				if (ticked == 'F')
					{
						//If the tick box on the line as been un-checked, then set the quantity to null
						//
						nlapiSetLineItemValue(type, 'custpage_col_allocate', linenum, null);
					}
				else
					{
						var outstanding = nlapiGetLineItemValue(type, 'custpage_col_outstanding', linenum);
						var allocated = nlapiGetLineItemValue(type, 'custpage_col_allocate', linenum);
						
						if(!allocated)
							{
								nlapiSetLineItemValue(type, 'custpage_col_allocate', linenum, outstanding);
							}
					}
			}
		}
		
		break;

	}
}

function ButtonRefresh() 
{

	var url = nlapiResolveURL('SUITELET', 'customscript_bbs_cons_alloc_po', 'customdeploy_bbs_cons_alloc_po');
	
	// Add the consignment id to the url
	//
	var consId = nlapiGetFieldValue('custpage_consignment');
	url += '&stage=1';
	
	url += '&consignmentid=' + consId;

	//Add the supplier id to the url
	//
	var supplierId = nlapiGetFieldValue('custpage_field1');
	
	url += '&supplierid=' + (supplierId == '0' ? '' : supplierId);
	
	//Add the purchase order to the url
	//
	var poNo= nlapiGetFieldValue('custpage_field2');
	
	url += '&pono=' + (poNo == '0' ? '' : poNo);
	
	//Add the item to the url
	//
	var item= nlapiGetFieldValue('custpage_field3');
	
	url += '&item=' + (item == '' ? '' : item);
	
	// Open the suitelet in a new window
	//
	window.open(url, '_self','Allocate PO');
	
}





