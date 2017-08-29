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
		
		//If we change the landed costs calc method then we need to reset the costs on the lines
		//
		if (name == 'custpage_lc_method' || name.startsWith('custpage_lc_value_'))
			{
				var lcDataField = nlapiGetFieldValue('custpage_lc_data');
				var landedCosts = JSON.parse(lcDataField);
				var count = Number(0);
				
				//
				for ( var key in landedCosts) 
					{
						//Get the number of consignment detail lines
						//
						var lineCount =  nlapiGetLineItemCount('custpage_sublist1');
						
						for (var linenum = 1; linenum <= lineCount; linenum++) 
						{
							nlapiSetLineItemValue('custpage_sublist1', 'custpage_col_lc_' + count.toString(), linenum, null);
						}
						
						count++;
					}
			}
	}
}

function calcLandedCosts()
{
	//Get the landed costs allocation method from the form
	//
	var lcAllocationMethod = nlapiGetFieldValue('custpage_lc_method');
	
	if(lcAllocationMethod == null || lcAllocationMethod == '')
		{
			alert('Please Select An Allocation Method Before Calculating');
		}
	else
		{
			//Get the landed costs types from the form
			//
			var lcDataField = nlapiGetFieldValue('custpage_lc_data');
			var landedCosts = JSON.parse(lcDataField);
			
			
			var count = Number(0);
			var totalLc = Number(0);
			
			//Loop round the landed costs & get the values enetred against each
			//
			for ( var key in landedCosts) 
				{
					var lcData = landedCosts[key];
					
					//Get the lc value from the form header
					//
					var lcVal = Number(nlapiGetFieldValue('custpage_lc_value_' + count.toString()));
					
					lcData.push(lcVal);
					landedCosts[key] = lcData;
					
					//Get the number of consignment detail lines
					//
					var lineCount =  nlapiGetLineItemCount('custpage_sublist1');
					
					//Calculate based on the allocation method selected
					//
					var lcAllocNumber = Number(lcAllocationMethod);
					
					switch(lcAllocNumber)
						{
							case 1:	//Weight
								
								//Calculate total weights on all lines
								//
								var totalLineWeight = Number(0);
								
								for (var linenum = 1; linenum <= lineCount; linenum++) 
								{
									var lineQty = Number(nlapiGetLineItemValue('custpage_sublist1', 'custpage_col11', linenum));
									var lineWeight = Number(nlapiGetLineItemValue('custpage_sublist1', 'custpage_col14', linenum));
									
									totalLineWeight += (lineQty * lineWeight);
								}
								
								if(totalLineWeight != NaN && totalLineWeight != 0)
									{
										//Calculate the per unit value
										//
										var perUnitValue = lcVal / totalLineWeight;
										
										//Apportion across the lines
										//
										for (var linenum = 1; linenum <= lineCount; linenum++) 
										{
											var lineQty = Number(nlapiGetLineItemValue('custpage_sublist1', 'custpage_col11', linenum));
											var lineUnitWeight = Number(nlapiGetLineItemValue('custpage_sublist1', 'custpage_col14', linenum));
											
											var lineLandedCost = Math.round(((lineQty * lineUnitWeight) * perUnitValue) * 100) / 100;
											
											nlapiSetLineItemValue('custpage_sublist1', 'custpage_col_lc_' + count.toString(), linenum, lineLandedCost);
										}
									}
									
								break;
									
							case 2:	//Quantity
								
								//Calculate total quantities on all lines
								//
								var totalLineQty = Number(0);
								
								for (var linenum = 1; linenum <= lineCount; linenum++) 
								{
									totalLineQty += Number(nlapiGetLineItemValue('custpage_sublist1', 'custpage_col11', linenum));
								}
								
								//Calculate the per unit value
								//
								var perUnitValue = lcVal / totalLineQty;
								
								//Apportion across the lines
								//
								for (var linenum = 1; linenum <= lineCount; linenum++) 
								{
									var lineQty = Number(nlapiGetLineItemValue('custpage_sublist1', 'custpage_col11', linenum));
									var lineLandedCost = Math.round((lineQty * perUnitValue) * 100) / 100;
									
									nlapiSetLineItemValue('custpage_sublist1', 'custpage_col_lc_' + count.toString(), linenum, lineLandedCost);
								}
								
								break;
									
							case 3:	//Value
								
								//Calculate total values on all lines
								//
								var totalLineValue = Number(0);
								
								for (var linenum = 1; linenum <= lineCount; linenum++) 
								{
									var lineQty = Number(nlapiGetLineItemValue('custpage_sublist1', 'custpage_col11', linenum));
									var lineRate = Number(nlapiGetLineItemValue('custpage_sublist1', 'custpage_col15', linenum));
									
									totalLineValue += (lineQty * lineRate);
								}
								
								//Calculate the per unit value
								//
								var perUnitValue = lcVal / totalLineValue;
								
								//Apportion across the lines
								//
								for (var linenum = 1; linenum <= lineCount; linenum++) 
								{
									var lineQty = Number(nlapiGetLineItemValue('custpage_sublist1', 'custpage_col11', linenum));
									var lineUnitRate = Number(nlapiGetLineItemValue('custpage_sublist1', 'custpage_col15', linenum));
									
									var lineLandedCost = Math.round(((lineQty * lineUnitRate) * perUnitValue) * 100) / 100;
									
									nlapiSetLineItemValue('custpage_sublist1', 'custpage_col_lc_' + count.toString(), linenum, lineLandedCost);
								}
								
								break;
									
						}
					
					count++;
				}
		}
}





