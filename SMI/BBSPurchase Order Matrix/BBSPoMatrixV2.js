/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       21 Sep 2017     cedricgriffiths
 *
 */

const TOTAL = 999997;
const UNITCOST = 999998;
const TOTALCOST = 999999;
const COLOURID = 163;
const SIZEID = 164;
const EMAILINFO = 'sales@smigroupuk.com';
const TELINFO = '+44 (0) 1428 658333'
	
function matrixOutputSuitelet(request, response)
{
	
	//=============================================================================================
	//Start of main code
	//=============================================================================================
	//
	
	if (request.getMethod() == 'GET') 
	{
		//Get parameters
		//
		var poId = request.getParameter('poid');
		
		var parentProduct = '';
		var parentDescription = '';
		var parentVendorName = '';
		
		//Read a purchase order
		//
		var poRecord = nlapiLoadRecord('purchaseorder', poId);
		var poLines = poRecord.getLineItemCount('item');
		var poBillAddress = nlapiEscapeXML(poRecord.getFieldValue('billaddress'));
		var poSubsidiaryAddress = nlapiEscapeXML(poRecord.getFieldValue('custbody_subsidiary_address'));
		var poShipAddress = nlapiEscapeXML(poRecord.getFieldValue('shipaddress'));
		
		if (poBillAddress)
			{
				poBillAddress = poBillAddress.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />');
			}
		
		if (poSubsidiaryAddress)
			{
				poSubsidiaryAddress = poSubsidiaryAddress.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />');
			
			}
		
		if (poShipAddress)
			{
				poShipAddress = poShipAddress.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />');
			}
		
		var poTranId = poRecord.getFieldValue('tranid');
		var poTranDate = poRecord.getFieldValue('trandate');
		var poDueDate = poRecord.getFieldValue('duedate');
		var poMemo = poRecord.getFieldValue('memo');
		var poEntity = nlapiLookupField('vendor', poRecord.getFieldValue('entity'), 'entityid', false);
		var poSubTotal= poRecord.getFieldValue('subtotal');
		var poTaxTotal= poRecord.getFieldValue('taxtotal');
		var poTotal= poRecord.getFieldValue('total');
		var poCurrency= poRecord.getFieldText('currency');
		
		poMemo = nlapiEscapeXML((poMemo == null ? '' : poMemo));
		poDueDate = (poDueDate == null ? '' : poDueDate);
		
		
		//Get the po lines by using a search
		//
		var purchaseorderSearch = nlapiSearchRecord("purchaseorder",null,
				[
				   ["type","anyof","PurchOrd"], 
				   "AND", 
				   ["mainline","is","F"], 
				   "AND", 
				   ["internalid","anyof",poId], 
				   "AND", 
				   ["taxline","is","F"], 
				   "AND", 
				   ["item.matrixchild","is","T"]
				], 
				[
				   new nlobjSearchColumn("tranid",null,null), 
				   new nlobjSearchColumn("entity",null,null), 
				   new nlobjSearchColumn("item",null,null), 
				   new nlobjSearchColumn("rate",null,null), 
				   new nlobjSearchColumn("quantity",null,null), 
				   new nlobjSearchColumn("amount",null,null), 
				   new nlobjSearchColumn("salesdescription","item",null), 
				   new nlobjSearchColumn("parent","item",null).setSort(false), 
				   new nlobjSearchColumn("custitem_bbs_item_colouritem","item",null), 
				   new nlobjSearchColumn("custitem_bbs_item_size1","item",null), 
				   new nlobjSearchColumn("type","item",null)
				]
				);
		
		//Loop through the results to see how many parent items we have & build a blank matrix for each parent
		//
		var parentArray = {};
		var parentArrayDetails = {};
		
		for (var int = 0; int < purchaseorderSearch.length; int++) 
		{
			var parentId = purchaseorderSearch[int].getValue("parent","item",null);
			var item = purchaseorderSearch[int].getValue("item",null,null);
			
			//build a blank matrix for each parent
			//
			if(!parentArray[parentId])
				{
					parentArray[parentId] = buildMatrix();
				}
			
			if(!parentArrayDetails[parentId])
			{
				var parentVendorName = '';
				
				for (var int2 = 1; int2 <= poLines; int2++) 
				{
					var poLineItem = poRecord.getLineItemValue('item', 'item', int2);
					
					if(poLineItem == item)
						{
							parentVendorName = poRecord.getLineItemValue('item', 'vendorname', int2);
							break;
						}
				}
				
				parentArrayDetails[parentId] = [purchaseorderSearch[int].getText("parent","item",null), (parentVendorName == null ? '' : parentVendorName)];
			}
		
			
			var itemId = purchaseorderSearch[int].getValue("item",null,null);
			var itemQty = Number(purchaseorderSearch[int].getValue("quantity",null,null));
			var itemRate = Number(purchaseorderSearch[int].getValue("rate",null,null));
			var itemColour = purchaseorderSearch[int].getValue("custitem_bbs_item_colouritem","item",null);
			var itemSize = purchaseorderSearch[int].getValue("custitem_bbs_item_size1","item",null);
			
			parentArray[parentId][itemColour][itemSize] = parentArray[parentId][itemColour][itemSize] + itemQty; //Update the specific colour & size
			parentArray[parentId][itemColour][TOTAL] = parentArray[parentId][itemColour][TOTAL] + itemQty; //Update the row total
			parentArray[parentId][itemColour][UNITCOST] = itemRate; //Update the rate
			parentArray[parentId][itemColour][TOTALCOST] = parentArray[parentId][itemColour][UNITCOST] * parentArray[parentId][itemColour][TOTAL];
			parentArray[parentId][TOTAL][itemSize] = parentArray[parentId][TOTAL][itemSize] + itemQty; //Update the column total
			parentArray[parentId][TOTAL][TOTAL] = parentArray[parentId][TOTAL][TOTAL] + itemQty; //Update the grand total
			parentArray[parentId][TOTAL][UNITCOST] = itemRate; //Update the grand total
			parentArray[parentId][TOTAL][TOTALCOST] = parentArray[parentId][TOTAL][TOTALCOST] + parentArray[parentId][itemColour][TOTALCOST];

		}
		
		for ( var parentId in parentArray) 
		{
			var sizeColourMatrix = parentArray[parentId];
			
			//Remove any un-populated rows in the matrix
			//
			for ( var colourId in sizeColourMatrix) 
			{
				if(sizeColourMatrix[colourId][TOTAL] == 0)
					{
						delete sizeColourMatrix[colourId];
					}
			}
			
			//Remove any un-populated columns in the matrix
			//
			var matrixColumnTotals = sizeColourMatrix[TOTAL];
			
			for ( var sizeId in matrixColumnTotals) 
			{
				var sizeTotal = Number(matrixColumnTotals[sizeId]);
				
				if(sizeTotal == 0)
					{
						for ( var colourId in sizeColourMatrix) 
						{
							delete sizeColourMatrix[colourId][sizeId];
						}
					}
			}
			
			 parentArray[parentId] = sizeColourMatrix;
		}
		

		//=============================================================================================
		//Print formatting
		//=============================================================================================
		//
		var sizeLookupArray = getDescriptions(SIZEID);
		var colourLookupArray = getDescriptions(COLOURID);
		
		var companyConfig = nlapiLoadConfiguration("companyinformation");
		var companyName = nlapiEscapeXML(companyConfig.getFieldValue("companyname"));
		var companyLogo = companyConfig.getFieldValue("pagelogo");
		var companyVatNo = companyConfig.getFieldValue("employerid");
		var companyAddress = companyConfig.getFieldValue("mainaddress_text").replace(/\r\n/g,'<br />');
		var formLogo = companyConfig.getFieldValue("formlogo");
		var logoFile = nlapiLoadFile(formLogo);
		var logoURL = nlapiEscapeXML(logoFile.getURL());
		
		//Start the xml off with the basic header info & the start of a pdfset
		//
		var xml = "<?xml version=\"1.0\"?>\n<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n";

		//Header & style sheet
		//
		xml += "<pdf>"
		xml += "<head>";
        xml += "<style type=\"text/css\">table {font-family: Calibri, Candara, Segoe, \"Segoe UI\", Optima, Arial, sans-serif;font-size: 8pt;table-layout: fixed;}";
        xml += "th {font-weight: bold;font-size: 8pt;padding: 0px;border-bottom: 1px solid black;border-collapse: collapse;}";
        xml += "td {padding: 0px;vertical-align: top;font-size:8px;}";
        xml += "b {font-weight: bold;color: #333333;}";
        xml += "table.header td {padding: 0px;font-size: 8pt;}";
        xml += "table.footer td {padding: 0;font-size: 6pt;}";
        xml += "table.itemtable th {padding-bottom: 0px;padding-top: 0px;}";
        xml += "table.body td {padding-top: 0px;}";
        xml += "table.total {page-break-inside: avoid;}";
        xml += "table.message{border: 1px solid #dddddd;}";
        xml += "tr.totalrow {line-height: 200%;}";
        xml += "tr.messagerow{font-size: 6pt;}";
        xml += "td.totalboxtop {font-size: 12pt;background-color: #e3e3e3;}";
        xml += "td.addressheader {font-size: 10pt;padding-top: 0px;padding-bottom: 0px;}";
        xml += "td.address {padding-top: 0;font-size: 8pt;}";
        xml += "td.totalboxmid {font-size: 28pt;padding-top: 20px;background-color: #e3e3e3;}";
        xml += "td.totalcell {border-bottom: 1px solid black;border-collapse: collapse;}";
        xml += "td.message{font-size: 8pt;}";
        xml += "td.totalboxbot {background-color: #e3e3e3;font-weight: bold;}";
        //xml += "td.itemtable {border-bottom: 1px solid black}";
        xml += "span.title {font-size: 28pt;}";
        xml += "span.number {font-size: 16pt;}";
        xml += "span.itemname {font-weight: bold;line-height: 150%;}";
        xml += "hr {width: 100%;color: #d3d3d3;background-color: #d3d3d3;height: 1px;}";
        xml += "</style>";

        //Macros
        //
		xml += "<macrolist>";
		
		xml += "<macro id=\"nlheader\">";
		xml += "<table class=\"header\" style=\"width: 100%;\">";
		xml += "<tr><td align=\"right\">&nbsp;</td><td align=\"right\">&nbsp;</td><td align=\"right\"><img src=\"" + logoURL + "\" style=\"float: right; width:250px; height:75px;\" /></td></tr>";
		xml += "<tr><td><span style=\"font-size:24px;\">Purchase Order</span></td><td align=\"right\">&nbsp;</td><td align=\"right\">&nbsp;</td></tr>";
		xml += "</table>";
		xml += "<table class=\"header\" style=\"width: 100%;\">";
		xml += "<tr><td align=\"right\">&nbsp;</td><td align=\"right\">&nbsp;</td><td align=\"right\">&nbsp;</td><td align=\"right\">&nbsp;</td></tr>";
		xml += "<tr>";
		xml += "<td colspan=\"2\" rowspan=\"8\" class=\"addressheader\"><span style=\"font-size:8pt\"><b>Supplier Address:</b></span><br /><span class=\"nameandaddress\" style=\"font-size:8pt\">" + poBillAddress + "<br/></span></td>";
		xml += "<td align=\"right\" style=\"font-size:8pt\"></td>";
		xml += "<td colspan=\"2\" align=\"left\" rowspan=\"8\"><span class=\"nameandaddress\">" + companyAddress + "</span><br/>VAT No. " + companyVatNo + "<br /><br/><b>Email:</b> " + EMAILINFO + "<br /><b>Tel:</b> " + TELINFO + "</td>";
		xml += "</tr>";
		xml += "<tr><td align=\"right\"></td></tr>";
		xml += "<tr><td align=\"right\" style=\"font-size:8pt\"></td></tr>";
		xml += "<tr><td align=\"right\" style=\"font-size:8pt\">&nbsp;</td></tr>";
		xml += "<tr><td align=\"right\" style=\"font-size:8pt\">&nbsp;</td></tr>";
		xml += "<tr><td align=\"right\" style=\"font-size:8pt\">&nbsp;</td></tr>";
		xml += "<tr style=\"font-size:8pt\"><td align=\"right\">&nbsp;</td></tr>";
		xml += "<tr style=\"font-size:8pt\"><td align=\"right\">&nbsp;</td></tr>";
		xml += "</table>"; 
		xml += "</macro>";
		
		xml += "<macro id=\"nlfooter\">";
		xml += "<table style=\"width: 100%;\">";
		xml += "<tr><td><b>Standard Terms and Conditions apply. Invoices should quote the PO number above any any difference will result in delays in payment</b></td></tr>";
		//xml += "<tr><td><b>Invoices should quote the PO number above any any difference will result in delays in payment</b></td></tr>";
		//xml += "<tr><td>&nbsp;</td></tr>";
		xml += "</table>";
		xml += "<table class=\"footer\" style=\"width: 100%;\">";
		xml += "<tr><td align=\"right\">Page <pagenumber/> of <totalpages/></td></tr>";
		xml += "</table></macro>";
		
		xml += "</macrolist>";
		xml += "</head>";
		
		//Body
		//
		xml += "<body header=\"nlheader\" header-height=\"250px\" footer=\"nlfooter\" footer-height=\"1%\" padding=\"0.5in 0.5in 0.5in 0.5in\" size=\"A4-LANDSCAPE\">";

		//Header data
		//
		
		xml += "<table style=\"width: 100%;\">";
		xml += "<tr><td colspan=\"2\" class=\"addressheader\"><B>Shipping Address:</B></td><td></td><td></td><td></td></tr>";
		xml += "<tr><td colspan=\"2\" rowspan=\"8\" class=\"address\">" + poShipAddress + "</td><td></td><td></td><td></td></tr>";
		xml += "<tr><td class=\"address\">&nbsp;</td><td  align=\"left\" style=\"font-size:8pt\"><b>Purchase Order No.</b></td><td align=\"right\" style=\"font-size:8pt\">" + poTranId + "</td></tr>";
		xml += "<tr><td class=\"address\">&nbsp;</td><td  align=\"left\" style=\"font-size:8pt\"><b>Purchase Order Date</b></td><td align=\"right\" style=\"font-size:8pt\">" + poTranDate + "</td></tr>";
		xml += "<tr><td class=\"address\">&nbsp;</td><td  align=\"left\" style=\"font-size:8pt\"><b>Reference</b></td><td align=\"right\" style=\"font-size:8pt\">" + poMemo + "</td></tr>";
		xml += "<tr><td class=\"address\">&nbsp;</td><td align=\"left\" style=\"font-size:8pt\"><b>Account No</b></td><td align=\"right\" style=\"font-size:8pt\">" + poEntity + "</td></tr>";
		xml += "<tr><td class=\"address\">&nbsp;</td><td  align=\"left\" style=\"font-size:8pt\"><b>Delivery Date</b></td><td align=\"right\" style=\"font-size:8pt\">" + poDueDate + "</td></tr>";
		xml += "<tr><td class=\"address\">&nbsp;</td><td></td><td></td></tr>";
		xml += "<tr><td class=\"address\">&nbsp;</td><td></td><td></td></tr>";
		xml += "<tr><td class=\"address\">&nbsp;</td><td></td><td></td></tr>";
		xml += "</table>";
				
		//xml += "<p></p>";
		
		for ( var parentId in parentArray) 
		{
			var sizeColourMatrix = parentArray[parentId];

			var parentDescription = nlapiLookupField('item', parentId, 'description', false);
			var parentItem = parentArrayDetails[parentId][0];
			var parentVendorName = parentArrayDetails[parentId][1];
			
			//xml += "<span >";
			/*
			xml += "<table style=\"width: 100%\">";
			xml += "<tr>";
			xml += "<td width=\"50px\" align=\"left\" colspan=\"4\" style=\"font-size:12px;\"><b>" + nlapiEscapeXML(parentVendorName) + "</b></td>";
			xml += "<td align=\"left\" colspan=\"12\" style=\"font-size:12px;\"><b>" + nlapiEscapeXML(parentDescription) + "</b></td>";
			xml += "</tr>";
			xml += "</table>\n";
			*/
			
			//Loop round the remaining data in the matrix
			//
			var headingDone = false;
			
			for ( var colourId in sizeColourMatrix) 
			{
				if(colourId != TOTAL)
					{
						//Get the current row
						//
						var row = sizeColourMatrix[colourId];
						
						//Produce the headings
						//
						if(!headingDone)
						{
							headingDone = true;
							var colCount = Number(2);
							
							for ( var sizeId in row) 
							{
								colCount++;
							}
					
							
							xml += "<table page-break-inside=\"avoid\" class=\"itemtable\" style=\"width: 100%; border: 1px solid lightgrey; border-collapse: collapse;\">";
							xml += "<thead >";
							xml += "<tr >";
							xml += "<th colspan = \"" + colCount.toString() + "\">" + nlapiEscapeXML(parentVendorName) + " " + nlapiEscapeXML(parentDescription) + "</th>";
							xml += "</tr>";
							
							xml += "<tr >";
							xml += "<th style=\"border: 1px solid lightgrey; border-collapse: collapse;\" colspan=\"2\">Colour</th>";
							
							for ( var sizeId in row) 
							{
								//Get the size descriptions & print them out
								//
								var sizeDescription = '';
								
								switch(Number(sizeId))
								{
									case Number(TOTAL):
										sizeDescription = 'Total';
										break;
										
									case Number(UNITCOST):
										sizeDescription = 'Unit Price';
										break;
										
									case Number(TOTALCOST):
										sizeDescription = 'Total Price';
										break;
										
									default:
											sizeDescription = sizeLookupArray[sizeId];
										break;
								}
								
								xml += "<th style=\"border: 1px solid lightgrey; border-collapse: collapse;\" align=\"center\" colspan=\"1\">" + nlapiEscapeXML(sizeDescription) + "</th>";
							}
							
							xml += "</tr>";
							xml += "</thead>";
						}
					
						
						//Get the colour description so we can print it out
						//
						var colourDescription = '';
						
						xml += "<tr >";
						
						if (colourId == TOTAL)
						{
							xml += "<td style=\"border: 1px solid lightgrey; border-collapse: collapse;\" colspan=\"2\"><b>Total</b></td>";
						}
						else
						{
							colourDescription = colourLookupArray[colourId];
							xml += "<td style=\"border: 1px solid lightgrey; border-collapse: collapse;\" colspan=\"2\">" + nlapiEscapeXML(colourDescription) + "</td>";
						}
						
						
						for ( var sizeId in row) 
						{
							var cell = row[sizeId];
							
							
							//Output the values in each cell
							//
							if (colourId == TOTAL)
							{
								cell = (cell == '0' ? '' : Number(cell).toFixed(0));
								
								xml += "<td style=\"border: 1px solid lightgrey; border-collapse: collapse;\" align=\"left\" colspan=\"1\"><b>" + cell + "</b></td>";
							}
							else
							{
								if(sizeId == TOTAL || sizeId == TOTALCOST || sizeId == UNITCOST)
									{
										cell = (cell == '0' ? '' : Number(cell).toFixed(2));
									
										xml += "<td style=\"border: 1px solid lightgrey; border-collapse: collapse;\" align=\"right\" colspan=\"1\"><b>" + cell + "</b></td>";
									}
								else
									{
										cell = (cell == '0' ? '' : Number(cell).toFixed(0));
									
										xml += "<td style=\"border: 1px solid lightgrey; border-collapse: collapse;\" align=\"center\" colspan=\"1\">" + cell + "</td>";
									}
							}
						}
						
						xml += "</tr>";
				}
			}
			
			//Finish the item table
			//
			xml += "</table>";
			//xml += "</span>";
			//xml += "<hr />";
			xml += "<p/>";
		}

		
		xml += "<table class=\"total\" style=\"width: 100%;\">";
		xml += "<tr class=\"totalrow\">";
		xml += "<td colspan=\"3\">&nbsp;</td>";
		xml += "<td class=\"totalcell\"  align=\"right\"><b>Subtotal</b></td>";
		xml += "<td class=\"totalcell\"  align=\"right\">" + poSubTotal + "</td>";
		xml += "</tr>";

		xml += "<tr class=\"totalrow\">";
		xml += "<td colspan=\"3\">&nbsp;</td>";
		xml += "<td class=\"totalcell\" align=\"right\"><b>VAT Total</b></td>";
		xml += "<td class=\"totalcell\"  align=\"right\">" + poTaxTotal + "</td>";
		xml += "</tr>";
		xml += "<tr class=\"totalrow\">";
		xml += "<td colspan=\"3\">&nbsp;</td>";
		xml += "<td class=\"totalcell\"  align=\"right\"><b>Total (" + poCurrency + ")</b></td>";
		xml += "<td class=\"totalcell\"  align=\"right\">" + poTotal + "</td>";
		xml += "</tr>";
		xml += "<tr>";
		xml += "<td>&nbsp;</td>";
		xml += "</tr>";
		xml += "</table>";
		
		//Finish the body
		//
		xml += "</body>";
		
		//Finish the pdf
		//
		xml += "</pdf>";
		
		//Convert to pdf using the BFO library
		//
		var file = nlapiXMLToPDF(xml);

		//Send back the output in the response message
		//
		response.setContentType('PDF', 'Purchase Order', 'inline');
		response.write(file.getValue());
	}	
}		

//=============================================================================================
//Functions
//=============================================================================================
//
function getDescriptions(listId)
{
	var listRecord = nlapiLoadRecord('customlist', listId);
	var values = listRecord.getLineItemCount('customvalue');
	var valuesArray = {};
	
	for (var int4 = 1; int4 <= values; int4++) 
	{
		var ValueId = listRecord.getLineItemValue('customvalue', 'valueid', int4);
		var ValueText = listRecord.getLineItemValue('customvalue', 'value', int4);
		
		valuesArray[ValueId] = ValueText;
	}
	
	valuesArray[''] = '';
	
	return valuesArray;
}

function buildMatrix()
{
	var colourRecord = nlapiLoadRecord('customlist', COLOURID);
	var sizeRecord = nlapiLoadRecord('customlist', SIZEID);
	
	var colours = colourRecord.getLineItemCount('customvalue');
	var sizes = sizeRecord.getLineItemCount('customvalue');
	
	var colourSizeArray = {};
	var colourTotalAdded = false;
	
	//Loop round the colours
	//
	for (var int3 = 1; int3 <= colours+2; int3++) 
	{
		var sizeArray = {};
	
		//Loop round all the sizes
		//
		for (var int4 = 1; int4 <= sizes; int4++) 
		{
			var sizeValue = sizeRecord.getLineItemValue('customvalue', 'valueid', int4);
			sizeArray[sizeValue] = 0;
		}
	
		//Insert the row summary as size value -1
		//
		sizeArray[TOTAL] = 0;
		
		//Insert the row unit cost
		//
		sizeArray[UNITCOST] = 0;
		
		//Insert the row unit cost
		//
		sizeArray[TOTALCOST] = 0;
		
		//Add in the row total record as colour value -1
		//
		if(int3 == colours+1)
			{
				colourValue = '';
			}
		else
			{
				if(int3 == colours+2)
					{
						colourValue = TOTAL;
					}
				else
					{
						var colourValue = colourRecord.getLineItemValue('customvalue', 'valueid', int3);
					}
			}
		//Attach the size array to the respective colour
		//
		colourSizeArray[colourValue] = sizeArray;
	
	}
	
	return colourSizeArray;

}

function getItemRecType(ItemType)
{
	var itemType = '';
	
	switch(ItemType)
	{
		case 'InvtPart':
			itemType = 'inventoryitem';
			break;
			
		case 'Assembly':
			itemType = 'assemblyitem';
			break;
			
		case 'NonInvtPart':
			itemType = 'noninventoryitem';
			break;
	}

	return itemType;
}


