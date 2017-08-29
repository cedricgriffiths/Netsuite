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
	}
}

function setOverallLocation()
{
	var overallLocation = nlapiGetFieldValue('custpage_location');
	
	var lines = nlapiGetLineItemCount('custpage_sublist1');
	
	for (var int = 1; int <= lines; int++) 
	{
		nlapiSetLineItemValue('custpage_sublist1', 'custpage_col11', int, overallLocation);
	}
}