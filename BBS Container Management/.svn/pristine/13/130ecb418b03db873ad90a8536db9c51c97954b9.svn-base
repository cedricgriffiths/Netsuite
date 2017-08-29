/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       30 May 2017     cedricgriffiths
 *
 */

function markInTransitFieldChanged(type, name, linenum)
{
	if (type == 'custpage_sublist1') 
	{
		//See if the date has changed
		//
		if (name == 'custpage_col6')
			{
				var expectedDate = nlapiGetLineItemValue(type, 'custpage_col5', linenum);
				

						if (expectedDate)
							{
								//If the date is non-blank then set the tick on the line
								//
								nlapiSetLineItemValue(type, 'custpage_col1', linenum, 'T');
							}
						else
							{
								//If the date is blank then un-set the tick on the line
								//
								nlapiSetLineItemValue(type, 'custpage_col1', linenum, 'F');
								nlapiSetLineItemValue(type, 'custpage_col6', linenum, null);
							}

			}
		
		if (name == 'custpage_col1')
		{
			var ticked = nlapiGetLineItemValue(type, 'custpage_col1', linenum);
			
			if (ticked == 'F')
				{
					//If the tick box on the line as been un-checked, then set the date to null
					//
					nlapiSetLineItemValue(type, 'custpage_col6', linenum, null);
				}
			else
				{
					var expectedDate = nlapiGetLineItemValue(type, 'custpage_col5', linenum);

					if(expectedDate)
						{
							nlapiSetLineItemValue(type, 'custpage_col6', linenum, expectedDate);
						}
				}
		}
	}
}

function ButtonUpdateDate()
{
	var lines = nlapiGetLineItemCount('custpage_sublist1');
	
	var allDate = nlapiGetFieldValue('custpage_col8');
	
	if(allDate)
		{
			for (var int = 1; int <= lines; int++) 
			{
				var ticked = nlapiGetLineItemValue('custpage_sublist1', 'custpage_col1', int);
				
				if(ticked == 'T')
					{
						nlapiSetLineItemValue('custpage_sublist1', 'custpage_col6', int, allDate);
					}
			}
		}
}
