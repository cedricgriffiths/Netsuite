/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       17 Feb 2017     cedricgriffiths
 *
 */


/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */

function configurationSuitelet(request, response){

	if (request.getMethod() == 'GET') {
		

				//Create a form
				//
				var form = nlapiCreateForm('Configuration');
				
				// Set the client side script to be used with this form
				//
				form.setScript('customscript_bbs_config_client');
				
				var intransitFieldGroup = form.addFieldGroup('custpage_grp_intransit', 'In Transit Locations');
				var vendBillFieldGroup = form.addFieldGroup('custpage_grp_vend_bill', 'Vendor Bills');
				var itemReceiptsFieldGroup = form.addFieldGroup('custpage_grp_item_recp', 'Item Receipts');
				var systemFieldGroup = form.addFieldGroup('custpage_grp_system', 'System');
				
				var postToIntransitField = form.addField('custpage_fld_post_to_intran', 'checkbox', 'Post Stock To In Transit Location', null, 'custpage_grp_intransit');
				var intransitLocationField = form.addField('custpage_fld_intran_loc', 'select', 'In Transit Location', 'location', 'custpage_grp_intransit');
				var invAdjustAccountField = form.addField('custpage_fld_inv_adj_acc', 'select', 'Inventory Adjustment Account', 'account', 'custpage_grp_intransit');
				var vendBillLocField = form.addField('custpage_fld_vend_bill_loc', 'select', 'Default Location', 'location', 'custpage_grp_vend_bill');
				var itemRecpLocField = form.addField('custpage_fld_item_rec_loc', 'select', 'Default Location', 'location', 'custpage_grp_item_recp');
				var dashboardField = form.addField('custpage_fld_dashboard', 'text', 'Dashboard Task Link Id', null, 'custpage_grp_system');
				
				vendBillLocField.setMandatory(true);
				itemRecpLocField.setMandatory(true);
				
				// Add a submit button
				//
				form.addSubmitButton('Confirm');

				//Get existing config
				//
				var compPrefs = nlapiLoadConfiguration('companypreferences');
				var useInTranPref = compPrefs.getFieldValue('custscript_bbs_cons_use_in_transit_loc');
				
				postToIntransitField.setDefaultValue(useInTranPref);
				intransitLocationField.setDefaultValue(compPrefs.getFieldValue('custscript_bbs_cons_in_transit_loc'));
				invAdjustAccountField.setDefaultValue(compPrefs.getFieldValue('custscript_bbs_cons_in_transit_account'));
				vendBillLocField.setDefaultValue(compPrefs.getFieldValue('custscript_bbs_cons_bill_loc'));
				itemRecpLocField.setDefaultValue(compPrefs.getFieldValue('custscript_bbs_cons_rec_loc'));
				dashboardField.setDefaultValue(compPrefs.getFieldValue('custscript_bbs_cons_dashboard'));
				
				if(useInTranPref == 'T')
					{
						intransitLocationField.setMandatory(true);
						invAdjustAccountField.setMandatory(true);
					}

				//Write the response
				//
				response.writePage(form);

	}
	else
	{
		var postToIntransit = request.getParameter('custpage_fld_post_to_intran');
		var intransitLocation = request.getParameter('custpage_fld_intran_loc');
		var invAdjustAccount = request.getParameter('custpage_fld_inv_adj_acc');
		var vendBillLoc = request.getParameter('custpage_fld_vend_bill_loc');
		var itemRecpLoc = request.getParameter('custpage_fld_item_rec_loc');
		var dashboard = request.getParameter('custpage_fld_dashboard');
		
		var compPrefs = nlapiLoadConfiguration('companypreferences');
		
		compPrefs.setFieldValue('custscript_bbs_cons_use_in_transit_loc',postToIntransit);
		compPrefs.setFieldValue('custscript_bbs_cons_in_transit_loc',intransitLocation);
		compPrefs.setFieldValue('custscript_bbs_cons_in_transit_account',invAdjustAccount);
		compPrefs.setFieldValue('custscript_bbs_cons_bill_loc',vendBillLoc);
		compPrefs.setFieldValue('custscript_bbs_cons_rec_loc',itemRecpLoc);
		compPrefs.setFieldValue('custscript_bbs_cons_dashboard',dashboard);
		
		nlapiSubmitConfiguration(compPrefs);

		response.sendRedirect('TASKLINK', dashboard,null,null,null);
	}
}
