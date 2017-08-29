/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       30 May 2017     cedricgriffiths
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function markInTransitSuitelet(request, response){

	if (request.getMethod() == 'GET') 
	{

				// Create a form
				//
				var form = nlapiCreateForm('Mark Consignments In Transit');
				
				// Set the client side script to be used with this form
				//
				form.setScript('customscript_bbs_mark_intransit_client');
				
				var fieldGroup1 = form.addFieldGroup('custpage_grp1', 'Header');
				
				//Add a tab and a sublist
				//
				var tab1 = form.addTab('custpage_tab1', 'Consignments');
				var list1 = form.addSubList('custpage_sublist1', 'list', 'Consignments Available To Update', 'custpage_tab1');
				
				list1.setLabel('Consignments Available To Update');
		
				var listSelect =list1.addField('custpage_col1', 'checkbox', 'Select', null);
				
				var listHyper = list1.addField('custpage_col2', 'url', 'View', null);
				listHyper.setLinkText('View');
				
				var listConsignment = list1.addField('custpage_col3', 'text', 'Consignment', null);
				var listName = list1.addField('custpage_col4', 'text', 'Name', null);
				var listExpDesp = list1.addField('custpage_col5', 'date', 'Expected Despatch', null);
				var listActDesp = list1.addField('custpage_col6', 'date', 'Actual Despatch', null);
				listActDesp.setDisplayType('entry');
				
				var listConsId = list1.addField('custpage_col7', 'text', 'Id', null);
				listConsId.setDisplayType('hidden');

				//Add a mark/unmark button
				//
				list1.addMarkAllButtons();
				form.addField('custpage_col8', 'date', 'Despatch Date For All Marked Lines', null, 'custpage_tab1');
				
				//list1.addField('custpage_col8', 'date', 'Despatch Date');
				list1.addButton('custpage_update_marked', 'Update All Marked', 'ButtonUpdateDate()');
				
				//Populate the po list based on the search criteria
				//
				libFindConsToDespatch(list1);
				
				// Add a submit button
				//
				form.addSubmitButton('Finish');

				//Write the response
				//
				response.writePage(form);
		}
	else
		{
		//Now process the selected consignment records
		//

		//See if we are using the in-transit location to move stock in & out of while in transit
		//
		var InTranLoc = null;
		var InTranAcc = null;
		
		var useInTranLoc = nlapiGetContext().getPreference('custscript_bbs_cons_use_in_transit_loc');
		
		if (useInTranLoc == 'T')
		{
			InTranLoc = nlapiGetContext().getPreference('custscript_bbs_cons_in_transit_loc');
			InTranAcc = nlapiGetContext().getPreference('custscript_bbs_cons_in_transit_account');
		}
	
		//Count the number of lines in the sublist
		//
		var lineCount = request.getLineItemCount('custpage_sublist1');
	
		for (var int = 1; int <= lineCount; int++) 
		{
			//Get the consignment details from the sublist
			//
			var consId = request.getLineItemValue('custpage_sublist1', 'custpage_col7', int);
			var consDespDate = request.getLineItemValue('custpage_sublist1', 'custpage_col6', int);
			var consChecked = request.getLineItemValue('custpage_sublist1', 'custpage_col1', int);

			//Process only the checked lines
			//
			if (consChecked == 'T')
			{
				//Load up the consignment record
				//
				var consRecord = nlapiLoadRecord('customrecord_bbs_consignment', consId);
				
				if (consRecord)
				{
					
					if (useInTranLoc == 'T')
						{
							//Call routine to stock adjust the in-transit stock to a location
							//
							libStockAdjustInTransit(consId, 'IN', InTranLoc, InTranAcc);
						}
					
					//Update the consignment status and despatch date
					//	
					consRecord = nlapiLoadRecord('customrecord_bbs_consignment', consId);
					
					consRecord.setFieldValue('custrecord_bbs_consignment_add', consDespDate);
					consRecord.setFieldValue('custrecord_bbs_consignment_status', '2');

					nlapiSubmitRecord(consRecord, false, true);
					
				}
			}
		}
		
		//Redirect back to the calling consignment record
		//
		nlapiSetRedirectURL('SUITELET', 'customscript_bbs_consignment_mark_intran', 'customdeploy_bbs_consignment_mark_intran', false, null);
		
		}
}
