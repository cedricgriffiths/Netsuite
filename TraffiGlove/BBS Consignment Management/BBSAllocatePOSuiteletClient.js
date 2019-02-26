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
			if (name == 'custpage_col1')
			{
				var ticked = nlapiGetLineItemValue(type, 'custpage_col1', linenum);
				
				if (ticked == 'T')
					{
						var lines = nlapiGetLineItemCount('custpage_sublist1');
						
						for (var int = 1; int <= lines; int++) 
						{
							if (int != linenum)
								{
									nlapiSetLineItemValue('custpage_sublist1', 'custpage_col1', int, 'F');
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
			if (name == 'custpage_col15')
				{
					var qty = Number(nlapiGetLineItemValue('custpage_sublist1', 'custpage_col15', linenum));
                    var a = nlapiGetLineItemValue('custpage_sublist1', 'custpage_col15', linenum);
                    
					var outstanding = Number(nlapiGetLineItemValue('custpage_sublist1', 'custpage_col14', linenum));
					var a = nlapiGetLineItemValue('custpage_sublist1', 'custpage_col14', linenum);
					
					if (qty > outstanding)
						{
							alert('Cannot allocate more than available qty of ' + outstanding.toString() );
							nlapiSetLineItemValue('custpage_sublist1', 'custpage_col15', linenum, null);
							nlapiSetLineItemValue('custpage_sublist1', 'custpage_col1', linenum, 'F');
						}
					else
						{
							if (qty > 0)
								{
									//If the quantity is non-blank then set the tick on the line
									//
									nlapiSetLineItemValue('custpage_sublist1', 'custpage_col1', linenum, 'T');
								}
							else
								{
									//If the quantity is blank then un-set the tick on the line
									//
									nlapiSetLineItemValue('custpage_sublist1', 'custpage_col1', linenum, 'F');
									nlapiSetLineItemValue('custpage_sublist1', 'custpage_col15', linenum, null);
								}
						}
				}
			
			if (name == 'custpage_col1')
			{
				var ticked = nlapiGetLineItemValue('custpage_sublist1', 'custpage_col1', linenum);
				
				if (ticked == 'F')
					{
						//If the tick box on the line as been un-checked, then set the quantity to null
						//
						nlapiSetLineItemValue('custpage_sublist1', 'custpage_col15', linenum, null);
					}
				else
					{
						var outstanding = Number(nlapiGetLineItemValue('custpage_sublist1', 'custpage_col14', linenum));
						var allocated = Number(nlapiGetLineItemValue('custpage_sublist1', 'custpage_col15', linenum));
						
						if(allocated == 0)
							{
                              
                             nlapiSetLineItemValue('custpage_sublist1', 'custpage_col15', linenum, outstanding);
                             var a = nlapiGetLineItemValue('custpage_sublist1', 'custpage_col15', linenum);
                             
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





