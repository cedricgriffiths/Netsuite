/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       09 Jan 2019     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function poButtonsPageInit(type)
{
   
}

function clientCopyDelDate()
{
	copyData('duedate', 'expectedreceiptdate');
}

function clientCopyLocation()
{
	copyData('location', 'location');
}

function clientCopyXfacDate()
{
	copyData('custbodyexfactorydate', 'custcol_sw_ex_factory_date');
}

function copyData(_headerField, _itemField)
{
	//Get the data from the header field
	//
	var headerFieldData = nlapiGetFieldValue(_headerField);
	
	//Does the header field have any data in it
	//
	if(headerFieldData != null && headerFieldData != '')
		{
			//Get the count of item lines
			//
			var itemLines = nlapiGetLineItemCount('item');
			
			//Loop through the item lines
			//
			for (var int = 1; int <= itemLines; int++) 
				{
					//Get the quantity & received values & calculate the outstanding quantity
					//
					var lineQuantity = Number(nlapiGetLineItemValue('item', 'quantity', int));
					var lineReceived = Number(nlapiGetLineItemValue('item', 'quantityreceived', int));
				
					var lineRemaining = lineQuantity - lineReceived;
					
					//If this line has any quantity to be received, we can copy the header data into the corresponding line field
					//
					if(lineRemaining > 0)
						{
							//Select the relevant line
							//
							nlapiSelectLineItem('item', int);
							
							nlapiSetCurrentLineItemValue('item', _itemField, headerFieldData, true, true);
							nlapiCommitLineItem('item');
						}
				}
		}
}
