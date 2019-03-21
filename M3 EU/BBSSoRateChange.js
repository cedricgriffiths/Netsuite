/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       09 Aug 2018     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Boolean} True to continue changing field value, false to abort value change
 */
function itemRateValidateField(type, name, linenum)
{
	if(type == 'item' && name == 'rate')
		{
			var context = nlapiGetContext();
			var usersRole = Number(context.getRole());

			if(usersRole == 3)
				{
					return true;
				}
			else
				{
					var currentPriceLevel = Number(nlapiGetCurrentLineItemValue('item', 'price'));
					
			   		if(currentPriceLevel == -1) //Custom Price
			   			{
			   				return true;
			   			}
			   		else
			   			{
			   				var currentRate = nlapiGetCurrentLineItemValue('item', 'rate');
			   				var oldRate = nlapiGetLineItemValue('item', 'rate', linenum);
			   				
			   				if(currentRate != oldRate && oldRate != null && oldRate != '')
			   					{
			   						alert('You cannot change the item rate');
			   						
			   						nlapiSetCurrentLineItemValue('item', 'rate', oldRate, false, true);
			   						
			   						return false;
			   					}
			   			}
				}
		}

	if(type == 'item' && name == 'amount')
	{
		var context = nlapiGetContext();
		var usersRole = Number(context.getRole());

		if(usersRole == 3)
			{
				return true;
			}
		else
			{
				var currentPriceLevel = Number(nlapiGetCurrentLineItemValue('item', 'price'));
				
				if(currentPriceLevel == -1) //Custom Price
		   			{
		   				return true;
		   			}
				else
		   			{
				   		var currentAmount = nlapiGetCurrentLineItemValue('item', 'amount');
				   		var oldAmount = nlapiGetLineItemValue('item', 'amount', linenum);
				   				
				   		if(currentAmount != oldAmount && oldAmount != null && oldAmount != '')
				   			{
				   				alert('You cannot change the item amount');
				   						
				   				nlapiSetCurrentLineItemValue('item', 'amount', oldAmount, false, true);
				   						
				   				return false;
				   			}
		   			}
			}
	}

    return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to save line item, false to abort save
 */
function itemRateValidateLine(type)
{
	Number.prototype.round = function(places) 
		{
			return +(Math.round(this + "e+" + places)  + "e-" + places);
		}

	if(type == 'item')
		{
			var context = nlapiGetContext();
			var usersRole = Number(context.getRole());
	
			if(usersRole == 3)
				{
					return true;
				}
			else
				{
					var currentAmount = Number(nlapiGetCurrentLineItemValue('item', 'amount'));
					var currentRate = Number(nlapiGetCurrentLineItemValue('item', 'rate'));
					var currentQty = Number(nlapiGetCurrentLineItemValue('item', 'quantity'));
					var newAmount = (currentRate * currentQty).round(2);
					
					if(newAmount != currentAmount)
						{
							alert('You cannot change the item amount');
							return false;
						}
					else
						{
							   return true;
						}
				}
		}
	else
		{
			return true;
		}
}
