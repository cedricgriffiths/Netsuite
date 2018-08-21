/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       03 Mar 2017     cedricgriffiths
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function printLabelSuitelet(request, response)
{
	//=====================================================================
	// Parameters passed to the suitelet
	//=====================================================================
	//
	var fulfillmentParam = request.getParameter('fulfillmentid');
			
	if (fulfillmentParam != null && fulfillmentParam != '') 
		{
			// Build the output
			//	
			var file = buildOutput(fulfillmentParam);
	
			// Send back the output in the response message
			//
			response.setContentType('PDF', 'Serial Number Labels', 'inline');
			response.write(file.getValue());
		}
}

//=====================================================================
// Functions
//=====================================================================
//
function buildOutput(fulfillmentId)
{
	//Start the xml off with the basic header info 
	//
	var xml = "<?xml version=\"1.0\"?>\n<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n";
	
	//Read the fulfillment record
	//
	var fulfillmentRecord = null;
	
	try
		{
			fulfillmentRecord = nlapiLoadRecord('itemfulfillment', fulfillmentId);
		}
	catch(err)
		{
			fulfillmentRecord = null;
		}
	
	if(fulfillmentRecord)
		{
			var today = new Date();
			var todayString = ('0' + today.getDate()).slice(-2) + '/' + ('0' + today.getMonth()).slice(-2) + '/' + today.getFullYear();
			
			//Header & style sheet
			//
			xml += "<pdf>"
			xml += "<head>";
			xml += "	<link name=\"NotoSans\" type=\"font\" subtype=\"truetype\" src=\"${nsfont.NotoSans_Regular}\" src-bold=\"${nsfont.NotoSans_Bold}\" src-italic=\"${nsfont.NotoSans_Italic}\" src-bolditalic=\"${nsfont.NotoSans_BoldItalic}\" bytes=\"2\" />";
			xml += "    <style type=\"text/css\">* {";
			xml += "		font-family: NotoSans, sans-serif;";
			xml += "		}";
			xml += "		table {";
			xml += "            font-size: 7pt;";
			xml += "            table-layout: fixed;";
			xml += "            page-break-inside: avoid;";
			xml += "            display: inline;";
			xml += "        }";
			xml += "		td p { align:left }";
			xml += "</style>";
			xml += "</head>";
							
			//Body
			//
			xml += "<body padding=\"0.1cm 0.4cm 0.1cm 0.4cm\" width=\"89mm\" height=\"36mm\">";
							
			var lines = fulfillmentRecord.getLineItemCount('item');
			var salesOrderId = fulfillmentRecord.getFieldValue('createdfrom');
			var salesOrderNo = nlapiLookupField('salesorder', salesOrderId, 'tranid', false);
			var customer = nlapiEscapeXML(fulfillmentRecord.getFieldText('entity'));
			var subsidiaryId = fulfillmentRecord.getFieldValue('subsidiary');
			
			var firstTime = true;
			
			for (var int = 1; int <= lines; int++) 
				{
					var serialNumber = nlapiEscapeXML(fulfillmentRecord.getLineItemValue('item', 'custcol_serial_numbers_udi', int));
					var itemId = fulfillmentRecord.getLineItemValue('item', 'item', int);
					var item = nlapiEscapeXML(fulfillmentRecord.getLineItemText('item', 'item', int));
					var itemType = fulfillmentRecord.getLineItemValue('item', 'itemtype', int);
					var itemName = nlapiEscapeXML(nlapiLookupField(getItemRecordType(itemType), itemId, 'displayname', false));
					
					if(serialNumber != null && serialNumber != '')
						{
							
							for (var int2 = 0; int2 < 2; int2++) 
								{
									if(firstTime)
										{
											firstTime = false;
										}
									else
										{
											xml += "<pbr/>";
										}
							
									xml += "<table>";
								
									xml += "<tr >";
									xml += "<td colspan=\"2\"><b>" + itemName + "</b></td>";
									xml += "<td rowspan=\"4\" align=\"right\">";
									xml += "<img src=\"https://system.na2.netsuite.com/core/media/media.nl?id=245030&amp;c=4810497&amp;h=335bbabdec6b6ef31eb4\" style=\"width:20px; height:20px;\"/>";
									xml += "</td>";
									xml += "</tr>";
									
									xml += "<tr >";
									xml += "<td>Part No:</td>";
									xml += "<td>" + item + "</td>";
									xml += "</tr>";
									
									xml += "<tr >";
									xml += "<td><b>Serial No:</b></td>";
									xml += "<td><b>" + serialNumber + "</b></td>";
									xml += "</tr>";
									
									xml += "<tr >";
									xml += "<td>Order No:</td>";
									xml += "<td>" + salesOrderNo + "</td>";
									xml += "</tr>";
									
									xml += "<tr >";
									xml += "<td>Customer:</td>";
									xml += "<td colspan=\"2\">" + customer + "</td>";
									//xml += "<td>&nbsp;</td>";
									xml += "</tr>";
									
									xml += "<tr >";
									xml += "<td>Date:</td>";
									xml += "<td colspan=\"2\">" + todayString + "</td>";
									//xml += "<td>&nbsp;</td>";
									xml += "</tr>";
									
									xml += "<tr >";
									
									switch(subsidiaryId)
										{
											case '1':
												xml += "<td colspan=\"3\">Accora Inc, 6720B Rockledge Drive, Suite 750<br/>Bethesda MD 20817  +44 (0)1223 206100</td>";
												
												break;
										
											case '5':
												xml += "<td colspan=\"3\">Accora Ltd. Barrington Road, Orwell<br/>Cambridge, SG8 5QP  01223 206100</td>";
												
												break;
										}
									
									xml += "</tr>";

									xml += "</table>";
								}
						}
				}

			//Finish 
			//
			xml += "</body>";
			xml += "</pdf>";
		}
	else
		{
			xml += "<pdf>"
			xml += "<head>";
			xml += "</head>";
			xml += "<body padding=\"0.5in 0.5in 0.5in 0.5in\" size=\"A4\">";
			xml += "<p>No Data To Print</p>";
			xml += "</body>";
			xml += "</pdf>";
		}
	
	//Convert to pdf using the BFO library
	//
	var pdfFileObject = nlapiXMLToPDF(xml);
	
	return pdfFileObject;
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
			
		case 'NonInvtPart':
			girtItemRecordType = 'noninventoryitem';
			break;
	}

	return girtItemRecordType;
}
