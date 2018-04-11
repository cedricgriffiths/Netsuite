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
function prePickingTicketSuitelet(request, response)
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
			var form = nlapiCreateForm('Print Picking Tickes Pre-Processing', false);
			form.setTitle('Print Picking Tickes Pre-Processing');
					
			
			//=====================================================================
			// Field groups creation
			//=====================================================================
			//
							
			//Add a field group for header info
			//
			var fieldGroupHeader = form.addFieldGroup('custpage_grp_header', 'Information');
			fieldGroupHeader.setSingleColumn(true);
							
			
			//=====================================================================
			// Fields creation
			//=====================================================================
			//
			
			///Add a message field 
			//
			var messageField = form.addField('custpage_message', 'textarea', 'Message', null, 'custpage_grp_header');
			messageField.setDisplaySize(120, 4);
			messageField.setDisplayType('readonly');
			messageField.setDefaultValue('Sales orders will be updated with the latest manpack values before continuing to the print picking tickets form.');
						
			form.addSubmitButton('Update & Continue');
					
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
					
			var salesorderSearch = nlapiSearchRecord("salesorder",null,
					[
					   ["type","anyof","SalesOrd"], 
					   "AND", 
					   ["mainline","is","F"], 
					   "AND", 
					   ["status","anyof","SalesOrd:D","SalesOrd:E","SalesOrd:B"], 
					   "AND", 
					   ["custbody_bbs_manpack_info","startswith","MANPACK 0 (0)"], 
					   "AND", 
					   ["custcol_bbs_sales_line_contact","noneof","@NONE@"], 
					   "AND", 
					   ["quantitycommitted","greaterthan","0"]
					], 
					[
					   new nlobjSearchColumn("internalid",null,"GROUP")
					]
					);  //10GU's
					
			if(salesorderSearch && salesorderSearch.length > 0)
				{
					for (var int2 = 0; int2 < salesorderSearch.length; int2++) 
						{
							var remaining = Number(nlapiGetContext().getRemainingUsage());
							
							if(remaining >= 20)
								{
									var salesOrderId = salesorderSearch[int2].getValue("internalid",null,"GROUP");
									
									var salesOrderRecord = nlapiLoadRecord('salesorder', salesOrderId);  //10GU's
								  	
								  	if(salesOrderRecord)
								  		{
								  			var manpackItemCount = Number(0);
								  			var manpackPeople = {};
										  			
								  			var items = salesOrderRecord.getLineItemCount('item');
								  			var currentManpackInfo = salesOrderRecord.getFieldValue('custbody_bbs_manpack_info');
										  			
								  			for (var int = 1; int <= items; int++) 
									  			{
													var manpackPerson = salesOrderRecord.getLineItemValue('item', 'custcol_bbs_sales_line_contact', int);
													var manpackItemQty = Number(salesOrderRecord.getLineItemValue('item', 'quantitycommitted', int));
															
													if(manpackItemQty > 0 && manpackPerson != null && manpackPerson != '')
														{
															manpackItemCount += manpackItemQty;
															manpackPeople[manpackPerson] = manpackPerson;
														}
												}
										  			
								  			var manpackInfo = 'MANPACK ' + (Object.keys(manpackPeople).length).toString() + ' (' + manpackItemCount.toString() + ')';
								  			
								  			if(manpackInfo != currentManpackInfo)
								  				{
								  					nlapiSubmitField('salesorder', salesOrderId, 'custbody_bbs_manpack_info', manpackInfo, false);  //10GU's
									  					
							  					//salesOrderRecord.setFieldValue('custbody_bbs_manpack_info', manpackInfo);
							  					//nlapiSubmitRecord(salesOrderRecord, false, true);  //20GU's
								  				}
								  		}
								}
							else
								{
									break;
								}
						}
				}
			
			//Redirect to the picking tickets form
			//
			response.sendRedirect('TASKLINK', 'TRAN_PRINT_PICKINGTICKET');
			
		}
}

//=====================================================================
// Functions
//=====================================================================
//

