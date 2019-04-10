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
function itemSpecSheetSuitelet(request, response)
{
	//=====================================================================
	// Parameters passed to the suitelet
	//=====================================================================
	//
	var itemIdParam = request.getParameter('itemid');
			
	if (itemIdParam != null && itemIdParam != '') 
		{
			// Build the output
			//	
			var file = buildOutput(itemIdParam);
	
			// Send back the output in the response message
			//
			response.setContentType('PDF', 'Item Specification Sheet', 'inline');
			response.write(file.getValue());
		}
	else
		{
			//=====================================================================
			// Get request - so return a form for the user to process
			//=====================================================================
			//
			if (request.getMethod() == 'GET') 
				{
					//=====================================================================
					// Form creation
					//=====================================================================
					//
					var form = nlapiCreateForm('Print Item Specification Sheet', false);
					form.setTitle('Print Item Specification Sheet');
					
			
					//=====================================================================
					// Field groups creation
					//=====================================================================
					//
							
					//Add a field group for header info
					//
					var fieldGroupHeader = form.addFieldGroup('custpage_grp_header', 'Selection');
					fieldGroupHeader.setSingleColumn(true);
							
			
					//=====================================================================
					// Fields creation
					//=====================================================================
					//
			
					//Add a select field to select the sales order
					//
					var itemField = form.addField('custpage_item_select', 'select', 'Item', 'inventoryitem', 'custpage_grp_header');
					itemField.setMandatory(true);
							
					form.addSubmitButton('Print Item Specification Sheet');
					
					//Write the response
					//
					response.writePage(form);
				}
			else
				{
					//=====================================================================
					// Post request - so process the returned form
					//=====================================================================
					//
					
					
					//Get the sales order 
					//
					var itemId = request.getParameter('custpage_item_select');
			
					// Build the output
					//	
					var file = buildOutput(itemId);
			
					//Send back the output in the response message
					//
					response.setContentType('PDF', 'Item Specification Sheet', 'inline');
					response.write(file.getValue());
			
				}
		}
}

//=====================================================================
// Functions
//=====================================================================
//
function buildOutput(itemId)
{
	//Start the xml off with the basic header info 
	//
	var xml = "<?xml version=\"1.0\"?>\n<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n";
	
	var itemRecord = nlapiLoadRecord('inventoryitem', itemId);
	
	if(itemRecord)
		{
			var today = new Date();
			var now = today.toUTCString();
			
			var size1Object = {};
			var size2Object = {};
			var colourObject = {};
			
			
			//Get size 1 sequences
			//
			var customrecord_bbs_item_size1_seqSearch = nlapiSearchRecord("customrecord_bbs_item_size1_seq",null,
					[
					], 
					[
					   new nlobjSearchColumn("custrecord_bbs_item_size1_size"), 
					   new nlobjSearchColumn("custrecord_bbs_item_size1_seq")
					]
					);
			
			if(customrecord_bbs_item_size1_seqSearch)
				{
					for (var int = 0; int < customrecord_bbs_item_size1_seqSearch.length; int++) 
						{
							var size1Id = customrecord_bbs_item_size1_seqSearch[int].getValue("custrecord_bbs_item_size1_size");
							var size1Text = customrecord_bbs_item_size1_seqSearch[int].getText("custrecord_bbs_item_size1_size");
							var size1Seq = Number(customrecord_bbs_item_size1_seqSearch[int].getValue("custrecord_bbs_item_size1_seq"));
							
							size1Object[size1Seq] = [size1Id,size1Text]
						}
				}
			
			//Get size 2 sequences
			//
			var customrecord_bbs_item_size2_seqSearch = nlapiSearchRecord("customrecord_bbs_item_size2_seq",null,
					[
					], 
					[
					   new nlobjSearchColumn("custrecord_bbs_item_size2_size"), 
					   new nlobjSearchColumn("custrecord_bbs_item_size2_seq")
					]
					);
			
			if(customrecord_bbs_item_size2_seqSearch)
				{
					for (var int = 0; int < customrecord_bbs_item_size2_seqSearch.length; int++) 
						{
							var size2Id = customrecord_bbs_item_size2_seqSearch[int].getValue("custrecord_bbs_item_size2_size");
							var size2Text = customrecord_bbs_item_size2_seqSearch[int].getText("custrecord_bbs_item_size2_size");
							var size2Seq = Number(customrecord_bbs_item_size2_seqSearch[int].getValue("custrecord_bbs_item_size2_seq"));
							
							size2Object[size2Seq] = [size2Id,size2Text]
						}
				}
			
			//Get colours
			//
			var customlist_bbs_item_colour_seqSearch = nlapiSearchRecord("customlist_bbs_item_colour",null,
					[
					], 
					[
					   new nlobjSearchColumn("name"), 
					   new nlobjSearchColumn("abbreviation")
					]
					);
			
			if(customlist_bbs_item_colour_seqSearch)
				{
					for (var int = 0; int < customlist_bbs_item_colour_seqSearch.length; int++) 
						{
							var colourId = customlist_bbs_item_colour_seqSearch[int].getId();
							var colourText = customlist_bbs_item_colour_seqSearch[int].getValue("name");
							
							colourObject[colourId] = [colourId,colourText]
						}
				}
			
			
			//Get details from the item record
			//
			var itemColours = itemRecord.getFieldValues('custitem_bbs_item_colour');
			var itemSize1s = itemRecord.getFieldValues('custitem_bbs_item_size1');
			var itemSize2s = itemRecord.getFieldValues('custitem_bbs_item_size2');
			
			itemColours = (itemColours == null ? [] : itemColours);
			itemSize1s = (itemSize1s == null ? [] : itemSize1s);
			itemSize2s = (itemSize2s == null ? [] : itemSize2s);
			
			var itemCode = nlapiEscapeXML(itemRecord.getFieldValue('itemid'));
			var itemName = nlapiEscapeXML(itemRecord.getFieldValue('salesdescription'));
			var itemDescription = nlapiEscapeXML(itemRecord.getFieldValue('custitem_bbs_item_long_desc'));
			var itemImageUrl = itemRecord.getFieldValue('custitem_bbs_item_front_image_loc');
			
			var itemProdAttrib1 =  nlapiEscapeXML(itemRecord.getFieldValue('custitem_bbs_item_attrib1'));
			var itemProdAttrib2 =  nlapiEscapeXML(itemRecord.getFieldValue('custitem_bbs_item_attrib2'));
			var itemProdAttrib3 =  nlapiEscapeXML(itemRecord.getFieldValue('custitem_bbs_item_attrib3'));
			var itemProdAttrib4 =  nlapiEscapeXML(itemRecord.getFieldValue('custitem_bbs_item_attrib4'));
			var itemProdAttrib5 =  nlapiEscapeXML(itemRecord.getFieldValue('custitem_bbs_item_attrib5'));
			var itemProdAttrib6 =  nlapiEscapeXML(itemRecord.getFieldValue('custitem_bbs_item_attrib6'));
			var itemProdAttrib7 =  nlapiEscapeXML(itemRecord.getFieldValue('custitem_bbs_item_attrib7'));
			var itemProdAttrib8 =  nlapiEscapeXML(itemRecord.getFieldValue('custitem_bbs_item_attrib8'));
			var itemProdAttrib9 =  nlapiEscapeXML(itemRecord.getFieldValue('custitem_bbs_item_attrib9'));
			var itemProdAttrib10 = nlapiEscapeXML(itemRecord.getFieldValue('custitem_bbs_item_attrib10'));
			var itemProdAttrib11 = nlapiEscapeXML(itemRecord.getFieldValue('custitem_bbs_item_attrib11'));
			var itemProdAttrib12 = nlapiEscapeXML(itemRecord.getFieldValue('custitem_bbs_item_attrib12'));
			var itemProdAttrib13 = nlapiEscapeXML(itemRecord.getFieldValue('custitem_bbs_item_attrib13'));
			var itemProdAttrib14 = nlapiEscapeXML(itemRecord.getFieldValue('custitem_bbs_item_attrib14'));
			var itemProdAttrib15 = nlapiEscapeXML(itemRecord.getFieldValue('custitem_bbs_item_attrib15'));
			
			var itemAppAttrib1 =  nlapiEscapeXML(itemRecord.getFieldValue('custitem_bbs_item_app_attrib1'));
			var itemAppAttrib2 =  nlapiEscapeXML(itemRecord.getFieldValue('custitem_bbs_item_app_attrib2'));
			var itemAppAttrib3 =  nlapiEscapeXML(itemRecord.getFieldValue('custitem_bbs_item_app_attrib3'));
			var itemAppAttrib4 =  nlapiEscapeXML(itemRecord.getFieldValue('custitem_bbs_item_app_attrib4'));
			var itemAppAttrib5 =  nlapiEscapeXML(itemRecord.getFieldValue('custitem_bbs_item_app_attrib5'));
			var itemAppAttrib6 =  nlapiEscapeXML(itemRecord.getFieldValue('custitem_bbs_item_app_attrib6'));
			var itemAppAttrib7 =  nlapiEscapeXML(itemRecord.getFieldValue('custitem_bbs_item_app_attrib7'));
			var itemAppAttrib8 =  nlapiEscapeXML(itemRecord.getFieldValue('custitem_bbs_item_app_attrib8'));
			var itemAppAttrib9 =  nlapiEscapeXML(itemRecord.getFieldValue('custitem_bbs_item_app_attrib9'));
			var itemAppAttrib10 = nlapiEscapeXML(itemRecord.getFieldValue('custitem_bbs_item_app_attrib10'));
			var itemAppAttrib11 = nlapiEscapeXML(itemRecord.getFieldValue('custitem_bbs_item_app_attrib11'));
			var itemAppAttrib12 = nlapiEscapeXML(itemRecord.getFieldValue('custitem_bbs_item_app_attrib12'));
			var itemAppAttrib13 = nlapiEscapeXML(itemRecord.getFieldValue('custitem_bbs_item_app_attrib13'));
			var itemAppAttrib14 = nlapiEscapeXML(itemRecord.getFieldValue('custitem_bbs_item_app_attrib14'));
			var itemAppAttrib15 = nlapiEscapeXML(itemRecord.getFieldValue('custitem_bbs_item_app_attrib15'));
			
			var itemR1       = nlapiEscapeXML(itemRecord.getFieldValue('custitem_bbs_item_r1'));
			var itemR1Rating = nlapiEscapeXML(itemRecord.getFieldValue('custitem_bbs_item_r1_rating'));
			var itemR2       = nlapiEscapeXML(itemRecord.getFieldValue('custitem_bbs_item_r2'));
			var itemR2Rating = nlapiEscapeXML(itemRecord.getFieldValue('custitem_bbs_item_r2_rating'));
			var itemR3       = nlapiEscapeXML(itemRecord.getFieldValue('custitem_bbs_item_r3'));
			var itemR3Rating = nlapiEscapeXML(itemRecord.getFieldValue('custitem_bbs_item_r3_rating'));
			var itemR4       = nlapiEscapeXML(itemRecord.getFieldValue('custitem_bbs_item_r4'));
			var itemR4Rating = nlapiEscapeXML(itemRecord.getFieldValue('custitem_bbs_item_r4_rating'));
			var itemR5       = nlapiEscapeXML(itemRecord.getFieldValue('custitem_bbs_item_r5'));
			var itemR5Rating = nlapiEscapeXML(itemRecord.getFieldValue('custitem_bbs_item_r5_rating'));
			
			itemProdAttrib1 =  (itemProdAttrib1 == null ? '' : '• ' + itemProdAttrib1.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />'));
			itemProdAttrib2 =  (itemProdAttrib2 == null ? '' : '• ' + itemProdAttrib2.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />'));
			itemProdAttrib3 =  (itemProdAttrib3 == null ? '' : '• ' + itemProdAttrib3.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />'));
			itemProdAttrib4 =  (itemProdAttrib4 == null ? '' : '• ' + itemProdAttrib4.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />'));
			itemProdAttrib5 =  (itemProdAttrib5 == null ? '' : '• ' + itemProdAttrib5.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />'));
			itemProdAttrib6 =  (itemProdAttrib6 == null ? '' : '• ' + itemProdAttrib6.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />'));
			itemProdAttrib7 =  (itemProdAttrib7 == null ? '' : '• ' + itemProdAttrib7.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />'));
			itemProdAttrib8 =  (itemProdAttrib8 == null ? '' : '• ' + itemProdAttrib8.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />'));
			itemProdAttrib9 =  (itemProdAttrib9 == null ? '' : '• ' + itemProdAttrib9.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />'));
			itemProdAttrib10 = (itemProdAttrib10 == null ? '' : '• ' + itemProdAttrib10.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />'));
			itemProdAttrib11 = (itemProdAttrib11 == null ? '' : '• ' + itemProdAttrib11.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />'));
			itemProdAttrib12 = (itemProdAttrib12 == null ? '' : '• ' + itemProdAttrib12.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />'));
			itemProdAttrib13 = (itemProdAttrib13 == null ? '' : '• ' + itemProdAttrib13.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />'));
			itemProdAttrib14 = (itemProdAttrib14 == null ? '' : '• ' + itemProdAttrib14.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />'));
			itemProdAttrib15 = (itemProdAttrib15 == null ? '' : '• ' + itemProdAttrib15.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />'));

			itemAppAttrib1 =  (itemAppAttrib1 == null ? '' : '• ' + itemAppAttrib1.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />'));
			itemAppAttrib2 =  (itemAppAttrib2 == null ? '' : '• ' + itemAppAttrib2.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />'));
			itemAppAttrib3 =  (itemAppAttrib3 == null ? '' : '• ' + itemAppAttrib3.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />'));
			itemAppAttrib4 =  (itemAppAttrib4 == null ? '' : '• ' + itemAppAttrib4.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />'));
			itemAppAttrib5 =  (itemAppAttrib5 == null ? '' : '• ' + itemAppAttrib5.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />'));
			itemAppAttrib6 =  (itemAppAttrib6 == null ? '' : '• ' + itemAppAttrib6.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />'));
			itemAppAttrib7 =  (itemAppAttrib7 == null ? '' : '• ' + itemAppAttrib7.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />'));
			itemAppAttrib8 =  (itemAppAttrib8 == null ? '' : '• ' + itemAppAttrib8.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />'));
			itemAppAttrib9 =  (itemAppAttrib9 == null ? '' : '• ' + itemAppAttrib9.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />'));
			itemAppAttrib10 = (itemAppAttrib10 == null ? '' : '• ' + itemAppAttrib10.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />'));
			itemAppAttrib11 = (itemAppAttrib11 == null ? '' : '• ' + itemAppAttrib11.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />'));
			itemAppAttrib12 = (itemAppAttrib12 == null ? '' : '• ' + itemAppAttrib12.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />'));
			itemAppAttrib13 = (itemAppAttrib13 == null ? '' : '• ' + itemAppAttrib13.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />'));
			itemAppAttrib14 = (itemAppAttrib14 == null ? '' : '• ' + itemAppAttrib14.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />'));
			itemAppAttrib15 = (itemAppAttrib15 == null ? '' : '• ' + itemAppAttrib15.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />'));
			
			itemR1 =  (itemR1 == null ? '' : '• ' + itemR1.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />'));
			itemR2 =  (itemR2 == null ? '' : '• ' + itemR2.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />'));
			itemR3 =  (itemR3 == null ? '' : '• ' + itemR3.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />'));
			itemR4 =  (itemR4 == null ? '' : '• ' + itemR4.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />'));
			itemR5 =  (itemR5 == null ? '' : '• ' + itemR5.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />'));
			
			itemR1Rating =  (itemR1Rating == null ? '' : itemR1Rating.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />'));
			itemR2Rating =  (itemR2Rating == null ? '' : itemR2Rating.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />'));
			itemR3Rating =  (itemR3Rating == null ? '' : itemR3Rating.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />'));
			itemR4Rating =  (itemR4Rating == null ? '' : itemR4Rating.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />'));
			itemR5Rating =  (itemR5Rating == null ? '' : itemR5Rating.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />'));
			
			
			
			//Remove unwanted size 1's
			//
			for ( var size1Key in size1Object) 
			{
				if(itemSize1s.indexOf(size1Object[size1Key][0]) < 0)
					{
						delete size1Object[size1Key];
					}
			}
			
			//Remove unwanted size 2's
			//
			for ( var size2Key in size2Object) 
			{
				if(itemSize2s.indexOf(size2Object[size2Key][0]) < 0)
					{
						delete size2Object[size2Key];
					}
			}
			
			//Remove unwanted colours
			//
			for ( var colourKey in colourObject) 
			{
				if(itemColours.indexOf(colourObject[colourKey][0]) < 0)
					{
						delete colourObject[colourKey];
					}
			}
			
			//Sort Size 1's
			//
			const orderedsize1Object = {};
			Object.keys(size1Object).sort().forEach(function(key) {
				orderedsize1Object[key] = size1Object[key];
			});
			
			//Sort Size 2's
			//
			const orderedsize2Object = {};
			Object.keys(size2Object).sort().forEach(function(key) {
				orderedsize2Object[key] = size2Object[key];
			});
			
			//Sort Colours
			//
			const orderedcolourObject = {};
			Object.keys(colourObject).sort().forEach(function(key) {
				orderedcolourObject[key] = colourObject[key];
			});
			

	
			//Start a new pdf for the new contact
			//
							
			//Header & style sheet
			//
			xml += "<pdf>"
			xml += "<head>";
	        xml += "<style type=\"text/css\">table {font-family: Calibri, Candara, Segoe, \"Segoe UI\", Optima, Arial, sans-serif;font-size: 9pt;table-layout: fixed;}";
	        xml += "th {font-weight: bold;font-size: 8pt;padding: 0px;border-bottom: 1px solid black;border-collapse: collapse;}";
	    	xml += "td {padding: 0px;vertical-align: top;font-size:10px;}";
	    	xml += "b {font-weight: bold;color: #333333;}";
	    	xml += "table.header td {padding: 0px;font-size: 10pt;}";
	    	xml += "table.footer td {padding: 0;font-size: 6pt;}";
	    	xml += "table.itemtable th {padding-bottom: 0px;padding-top: 0px;}";
	    	xml += "table.body td {padding-top: 0px;}";
	    	xml += "table.total {page-break-inside: avoid;}";
	    	xml += "table.message{border: 1px solid #dddddd;}";
	    	xml += "tr.totalrow {line-height: 200%;}";
	    	xml += "tr.messagerow{font-size: 6pt;}";
	    	xml += "td.totalboxtop {font-size: 12pt;background-color: #e3e3e3;}";
	    	xml += "td.addressheader {font-size: 10pt;padding-top: 0px;padding-bottom: 0px;}";
	    	xml += "td.address {padding-top: 0;font-size: 10pt;}";
	    	xml += "td.totalboxmid {font-size: 28pt;padding-top: 20px;background-color: #e3e3e3;}";
	    	xml += "td.totalcell {border-bottom: 1px solid black;border-collapse: collapse;}";
	    	xml += "td.message{font-size: 8pt;}";
	    	xml += "td.totalboxbot {background-color: #e3e3e3;font-weight: bold;}";
	    	xml += "span.title {font-size: 28pt;}";
	    	xml += "span.number {font-size: 16pt;}";
	    	xml += "span.itemname {font-weight: bold;line-height: 150%;}";
	    	xml += "hr {width: 100%;color: #d3d3d3;background-color: #d3d3d3;height: 1px;}";
	    	xml += "</style>";
	    	
	    	//Macros
	    	//
	    	xml += "<macrolist>";
	    	xml += "<macro id=\"nlfooter\"><table class=\"footer\" style=\"width: 100%;\">";
	    	xml += "<tr><td align=\"left\">Printed: " + now + "</td><td align=\"right\">Page <pagenumber/> of <totalpages/></td></tr>";
	    	xml += "</table></macro>";
	    	xml += "</macrolist>";
	    	
	    	xml += "</head>";
	    	
	    	//Body
	    	//
	    	xml += "<body footer=\"nlfooter\" footer-height=\"10px\" padding=\"0.5in 0.5in 0.5in 0.5in\" size=\"A4\">";
	    	
	    	xml += "<table class=\"header\" style=\"width: 100%;\">";
	    	xml += "<tr>";
	    	xml += "<td colspan=\"5\" align=\"left\" style=\"font-size:24pt;\">Specification Details</td>";
	    	xml += "<td rowspan=\"8\" align=\"right\"><img src=\"" + itemImageUrl + "\" style=\"float: right; width:200px; height:200px; border: 1px solid black\" /></td>";
	    	xml += "</tr>";
	    	
	    	xml += "<tr>";
	    	xml += "<td align=\"left\" style=\"font-size:10pt;\">&nbsp;</td>";
	    	xml += "<td align=\"left\" style=\"font-size:10pt;\">&nbsp;</td>";
	    	xml += "<td align=\"left\" style=\"font-size:10pt;\">&nbsp;</td>";
	    	xml += "<td align=\"left\" style=\"font-size:10pt;\">&nbsp;</td>";
	    	xml += "<td align=\"left\" style=\"font-size:10pt;\">&nbsp;</td>";
	    	xml += "</tr>";
	    	
	    	xml += "<tr>";
	    	xml += "<td align=\"left\" style=\"font-size:10pt; padding: 5px;\">Style Code</td>";
	    	xml += "<td colspan=\"4\" align=\"left\" style=\"font-size:10pt; padding: 5px;\">" + itemCode + "</td>";
	    	//xml += "<td align=\"left\" style=\"font-size:10pt; padding: 5px;\">&nbsp;</td>";
	    	xml += "</tr>";
	    	
	    	xml += "<tr>";
	    	xml += "<td align=\"left\" style=\"font-size:10pt; padding: 5px;\">Style Name</td>";
	    	xml += "<td colspan=\"4\" align=\"left\" style=\"font-size:10pt; padding: 5px;\">" + itemName + "</td>";
	    	//xml += "<td align=\"left\" style=\"font-size:10pt; padding: 5px;\">&nbsp;</td>";
	    	xml += "</tr>";
	    	
	    	xml += "<tr>";
	    	xml += "<td align=\"left\" style=\"font-size:10pt;\">&nbsp;</td>";
	    	xml += "<td align=\"left\" style=\"font-size:10pt; padding: 5px;\">&nbsp;</td>";
	    	xml += "<td align=\"left\" style=\"font-size:10pt;\">&nbsp;</td>";
	    	xml += "<td align=\"left\" style=\"font-size:10pt;\">&nbsp;</td>";
	    	xml += "<td align=\"left\" style=\"font-size:10pt;\">&nbsp;</td>";
	    	xml += "</tr>";
	    	
	    	xml += "<tr>";
	    	xml += "<td align=\"left\" style=\"font-size:10pt;\">&nbsp;</td>";
	    	xml += "<td align=\"left\" style=\"font-size:10pt; padding: 5px;\">&nbsp;</td>";
	    	xml += "<td align=\"left\" style=\"font-size:10pt;\">&nbsp;</td>";
	    	xml += "<td align=\"left\" style=\"font-size:10pt;\">&nbsp;</td>";
	    	xml += "<td align=\"left\" style=\"font-size:10pt;\">&nbsp;</td>";
	    	xml += "</tr>";
	    	
	    	xml += "<tr>";
	    	xml += "<td align=\"left\" style=\"font-size:10pt;\">&nbsp;</td>";
	    	xml += "<td align=\"left\" style=\"font-size:10pt; padding: 5px;\">&nbsp;</td>";
	    	xml += "<td align=\"left\" style=\"font-size:10pt;\">&nbsp;</td>";
	    	xml += "<td align=\"left\" style=\"font-size:10pt;\">&nbsp;</td>";
	    	xml += "<td align=\"left\" style=\"font-size:10pt;\">&nbsp;</td>";
	    	xml += "</tr>";
	    	
	    	xml += "<tr>";
	    	xml += "<td align=\"left\" style=\"font-size:10pt;\">&nbsp;</td>";
	    	xml += "<td align=\"left\" style=\"font-size:10pt; padding: 5px;\">&nbsp;</td>";
	    	xml += "<td align=\"left\" style=\"font-size:10pt;\">&nbsp;</td>";
	    	xml += "<td align=\"left\" style=\"font-size:10pt;\">&nbsp;</td>";
	    	xml += "<td align=\"left\" style=\"font-size:10pt;\">&nbsp;</td>";
	    	xml += "</tr>";

	    	xml += "</table>";
	    	xml += "<p/>";
	    	
	    	//Item Description
	    	//
	    	xml += "<table class=\"header\" style=\"width: 100%;\">";
	    	xml += "<tr>";
	    	xml += "<th align=\"left\" style=\"font-size:10pt;\">Item Description</th>";
	    	xml += "</tr>";
	    	xml += "<tr>";
	    	xml += "<td align=\"left\" style=\"font-size:10pt;\">" + itemDescription + "</td>";
	    	xml += "</tr>";
	    	
	    	xml += "</table>";
	    	xml += "<p/>";
	    	
	    	//Features
	    	//
	    	xml += "<table class=\"header\" style=\"width: 100%;\">";
	    	xml += "<tr>";
	    	xml += "<th align=\"left\" style=\"font-size:10pt;\">Features</th>";
	    	xml += "</tr>";

	    	xml += (itemProdAttrib1 == '' ? '' : "<tr><td align=\"left\" style=\"font-size:10pt;\">" + itemProdAttrib1 + "</td></tr>");
	    	xml += (itemProdAttrib2 == '' ? '' : "<tr><td align=\"left\" style=\"font-size:10pt;\">" + itemProdAttrib2 + "</td></tr>");
	    	xml += (itemProdAttrib3 == '' ? '' : "<tr><td align=\"left\" style=\"font-size:10pt;\">" + itemProdAttrib3 + "</td></tr>");
	    	xml += (itemProdAttrib4 == '' ? '' : "<tr><td align=\"left\" style=\"font-size:10pt;\">" + itemProdAttrib4 + "</td></tr>");
	    	xml += (itemProdAttrib5 == '' ? '' : "<tr><td align=\"left\" style=\"font-size:10pt;\">" + itemProdAttrib5 + "</td></tr>");
	    	xml += (itemProdAttrib6 == '' ? '' : "<tr><td align=\"left\" style=\"font-size:10pt;\">" + itemProdAttrib6 + "</td></tr>");
	    	xml += (itemProdAttrib7 == '' ? '' : "<tr><td align=\"left\" style=\"font-size:10pt;\">" + itemProdAttrib7 + "</td></tr>");
	    	xml += (itemProdAttrib8 == '' ? '' : "<tr><td align=\"left\" style=\"font-size:10pt;\">" + itemProdAttrib8 + "</td></tr>");
	    	xml += (itemProdAttrib9 == '' ? '' : "<tr><td align=\"left\" style=\"font-size:10pt;\">" + itemProdAttrib9 + "</td></tr>");
	    	xml += (itemProdAttrib10 == '' ? '' : "<tr><td align=\"left\" style=\"font-size:10pt;\">" + itemProdAttrib10 + "</td></tr>");
	    	xml += (itemProdAttrib11 == '' ? '' : "<tr><td align=\"left\" style=\"font-size:10pt;\">" + itemProdAttrib11 + "</td></tr>");
	    	xml += (itemProdAttrib12 == '' ? '' : "<tr><td align=\"left\" style=\"font-size:10pt;\">" + itemProdAttrib12 + "</td></tr>");
	    	xml += (itemProdAttrib13 == '' ? '' : "<tr><td align=\"left\" style=\"font-size:10pt;\">" + itemProdAttrib13 + "</td></tr>");
	    	xml += (itemProdAttrib14 == '' ? '' : "<tr><td align=\"left\" style=\"font-size:10pt;\">" + itemProdAttrib14 + "</td></tr>");
	    	xml += (itemProdAttrib15 == '' ? '' : "<tr><td align=\"left\" style=\"font-size:10pt;\">" + itemProdAttrib15 + "</td></tr>");

	    	xml += "</table>";
	    	xml += "<p/>";
	    	
	    	//Ideal For Use In
	    	//
	    	xml += "<table class=\"header\" style=\"width: 100%;\">";
	    	xml += "<tr>";
	    	xml += "<th align=\"left\" style=\"font-size:10pt;\">Ideal For Use In</th>";
	    	xml += "</tr>";

	    	xml += (itemAppAttrib1 == '' ? '' : "<tr><td align=\"left\" style=\"font-size:10pt;\">" + itemAppAttrib1 + "</td></tr>");
	    	xml += (itemAppAttrib2 == '' ? '' : "<tr><td align=\"left\" style=\"font-size:10pt;\">" + itemAppAttrib2 + "</td></tr>");
	    	xml += (itemAppAttrib3 == '' ? '' : "<tr><td align=\"left\" style=\"font-size:10pt;\">" + itemAppAttrib3 + "</td></tr>");
	    	xml += (itemAppAttrib4 == '' ? '' : "<tr><td align=\"left\" style=\"font-size:10pt;\">" + itemAppAttrib4 + "</td></tr>");
	    	xml += (itemAppAttrib5 == '' ? '' : "<tr><td align=\"left\" style=\"font-size:10pt;\">" + itemAppAttrib5 + "</td></tr>");
	    	xml += (itemAppAttrib6 == '' ? '' : "<tr><td align=\"left\" style=\"font-size:10pt;\">" + itemAppAttrib6 + "</td></tr>");
	    	xml += (itemAppAttrib7 == '' ? '' : "<tr><td align=\"left\" style=\"font-size:10pt;\">" + itemAppAttrib7 + "</td></tr>");
	    	xml += (itemAppAttrib8 == '' ? '' : "<tr><td align=\"left\" style=\"font-size:10pt;\">" + itemAppAttrib8 + "</td></tr>");
	    	xml += (itemAppAttrib9 == '' ? '' : "<tr><td align=\"left\" style=\"font-size:10pt;\">" + itemAppAttrib9 + "</td></tr>");
	    	xml += (itemAppAttrib10 == '' ? '' : "<tr><td align=\"left\" style=\"font-size:10pt;\">" + itemAppAttrib10 + "</td></tr>");
	    	xml += (itemAppAttrib11 == '' ? '' : "<tr><td align=\"left\" style=\"font-size:10pt;\">" + itemAppAttrib11 + "</td></tr>");
	    	xml += (itemAppAttrib12 == '' ? '' : "<tr><td align=\"left\" style=\"font-size:10pt;\">" + itemAppAttrib12 + "</td></tr>");
	    	xml += (itemAppAttrib13 == '' ? '' : "<tr><td align=\"left\" style=\"font-size:10pt;\">" + itemAppAttrib13 + "</td></tr>");
	    	xml += (itemAppAttrib14 == '' ? '' : "<tr><td align=\"left\" style=\"font-size:10pt;\">" + itemAppAttrib14 + "</td></tr>");
	    	xml += (itemAppAttrib15 == '' ? '' : "<tr><td align=\"left\" style=\"font-size:10pt;\">" + itemAppAttrib15 + "</td></tr>");

	    	xml += "</table>";
	    	xml += "<p/>";
	    	
		
	    	//Standards
	    	//
	    	xml += "<table class=\"header\" style=\"width: 100%;\">";
	    	xml += "<tr>";
	    	xml += "<th align=\"left\" style=\"font-size:10pt;\">Standards</th>";
	    	xml += "</tr>";

	    	xml += (itemR1 == '' ? '' : "<tr><td align=\"left\" style=\"font-size:10pt;\">" + itemR1 + " " + itemR1Rating + "</td></tr>");
	    	xml += (itemR2 == '' ? '' : "<tr><td align=\"left\" style=\"font-size:10pt;\">" + itemR2 + " " + itemR2Rating + "</td></tr>");
	    	xml += (itemR3 == '' ? '' : "<tr><td align=\"left\" style=\"font-size:10pt;\">" + itemR3 + " " + itemR3Rating + "</td></tr>");
	    	xml += (itemR4 == '' ? '' : "<tr><td align=\"left\" style=\"font-size:10pt;\">" + itemR4 + " " + itemR4Rating + "</td></tr>");
	    	xml += (itemR5 == '' ? '' : "<tr><td align=\"left\" style=\"font-size:10pt;\">" + itemR5 + " " + itemR5Rating + "</td></tr>");
	    	
	    	xml += "</table>";
	    	xml += "<p/>";
	    	
	    	//Colours
	    	//
	    	xml += "<table class=\"header\" style=\"width: 100%;\">";
	    	xml += "<tr>";
	    	xml += "<th align=\"left\" style=\"font-size:10pt;\">Colours</th>";
	    	xml += "</tr>";

	    	xml += "<tr>";
	    	xml += "<td align=\"left\" style=\"font-size:10pt;\">";
	    		
	    	for ( var orderedcolour in orderedcolourObject) 
		    	{
					xml += orderedcolourObject[orderedcolour][1] + ", ";
				}
	    	xml = xml.substring(0, xml.length -2);
	    	
	    	xml += "</td>";
	    	xml += "</tr>";
	    	xml += "</table>";
	    	xml += "<p/>";
	    	
	    	
	    	//Size 1
	    	//
	    	xml += "<table class=\"header\" style=\"width: 100%;\">";
	    	xml += "<tr>";
	    	xml += "<th align=\"left\" style=\"font-size:10pt;\">Size(s)</th>";
	    	xml += "</tr>";

	    	xml += "<tr>";
	    	xml += "<td align=\"left\" style=\"font-size:10pt;\">";
	    		
	    	for ( var orderedsize1 in orderedsize1Object) 
		    	{
					xml += orderedsize1Object[orderedsize1][1] + ", ";
				}
	    	xml = xml.substring(0, xml.length -2);
	    	
	    	xml += "</td>";
	    	xml += "</tr>";
	    	xml += "</table>";
	    	xml += "<p/>";
	    	
	    	//Size 2
	    	//
	    	xml += "<table class=\"header\" style=\"width: 100%;\">";
	    	xml += "<tr>";
	    	xml += "<th align=\"left\" style=\"font-size:10pt;\">Length(s)</th>";
	    	xml += "</tr>";

	    	xml += "<tr>";
	    	xml += "<td align=\"left\" style=\"font-size:10pt;\">";
	    		
	    	for ( var orderedsize2 in orderedsize2Object) 
		    	{
					xml += orderedsize2Object[orderedsize2][1] + ", ";
				}
	    	xml = xml.substring(0, xml.length -2);
	    	
	    	xml += "</td>";
	    	xml += "</tr>";
	    	xml += "</table>";
	    	xml += "<p/>";
	    	
	    	
			//Finish the body
			//
	    	
			xml += "</body>";
			
			//Finish the pdf
			//
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
