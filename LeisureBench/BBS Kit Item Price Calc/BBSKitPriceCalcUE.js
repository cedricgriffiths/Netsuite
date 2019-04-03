/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       03 Apr 2019     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function userEventAfterSubmit(type)
{
	if(type == 'create')
		{
			//Get the kit record
			//
			var kitRecordId = nlapiGetRecordId();
			var kitRecord = null;
			
			try
				{
					kitRecord = nlapiLoadRecord('kititem', kitRecordId);
				}
			catch(err)
				{
					kitRecord = null;
					nlapiLogExecution('ERROR', 'Error reading kit record', err.message);
				}
			
			if(kitRecord != null)
				{
					//Build an array of kit price levels
					//
					var kitPriceLevels = getPriceLevels(kitRecord);
					
					for ( var kitPriceLevel in kitPriceLevels) 
						{
							kitPriceLevels[kitPriceLevel] = Number(0);
						}
					
					//Loop through all of the components of the kit
					//
					var memberCount = kitRecord.getLineItemCount('member');
					
					for (var int = 1; int <= memberCount; int++) 
						{
							var memberId = kitRecord.getLineItemValue('member', 'item', int);
							var memberQty = Number(kitRecord.getLineItemValue('member', 'quantity', int));
							var memberRecordType = kitRecord.getLineItemValue('member', 'sitemtype', int);
							
							var memberRecord = null;
							
							try
								{
									memberRecord = nlapiLoadRecord(getItemRecordType(memberRecordType), memberId);
								}
							catch(err)
								{
									memberRecord = null;
									nlapiLogExecution('ERROR', 'Error reading member record', err.message);
								}
							
							if(memberRecord != null)
								{
									//Get the price levels from the member item
									//
									var memberPriceLevels = getPriceLevels(memberRecord);
									
									//Add the price * kit item qty to the kit price levels
									//
									for ( var memberPriceLevel in memberPriceLevels) 
										{
											kitPriceLevels[memberPriceLevel] += memberPriceLevels[memberPriceLevel] * memberQty;
										}
								}
						}
					
					//Now we have the price levels, we need to set them on the kit record
					//
					var priceLevelCount = kitRecord.getLineItemCount('price1');
					
					for (var int = 1; int <= priceLevelCount; int++) 
						{
							var matrixPriceLevelId = kitRecord.getLineItemValue('price1', 'pricelevel', int);
							var priceValue = kitPriceLevels[matrixPriceLevelId];
							
							kitRecord.selectLineItem('price1', int);
							kitRecord.setCurrentLineItemMatrixValue('price1', 'price', 1, priceValue);
							kitRecord.commitLineItem('price1', false);
						}
					
					try
						{
							nlapiSubmitRecord(kitRecord, false, true);
						}
					catch(err)
						{
							nlapiLogExecution('ERROR', 'Error updating prices to kit record', err.message);
						}
				}
		}
}

function getPriceLevels(_record)
{
	var priceMatrix = {};

	var priceLineCount = _record.getLineItemCount('price1');

	for (var int2 = 1; int2 <= priceLineCount; int2++) 
		{	
			var matrixPrice = Number(_record.getLineItemMatrixValue('price1', 'price', int2, 1));
			var matrixPriceLevelId = _record.getLineItemValue('price1', 'pricelevel', int2);
	
			matrixPrice = (matrixPrice == '' ? 0 : matrixPrice);
	
			priceMatrix[matrixPriceLevelId] = matrixPrice;
		}
	
	return priceMatrix;
}

function getItemRecordType(girtItemType)
{
	var girtItemRecordType = '';
	
	switch(girtItemType)
	{
		case 'InvtPart':
			girtItemRecordType = 'inventoryitem';
			break;
		
		case 'NonInvtPart':
			girtItemRecordType = 'noninventoryitem';
			break;
		
		case 'Assembly':
			girtItemRecordType = 'assemblyitem';
			break;
			
		case 'Kit':
			girtItemRecordType = 'kititem';
			break;
	}

	return girtItemRecordType;
}