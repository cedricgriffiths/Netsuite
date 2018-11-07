/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       06 Nov 2018     cedricgriffiths
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response)
{
	if (request.getMethod() == 'GET') 
		{
			var form = nlapiCreateForm('Copy Project', false);
			
			var projectSelect = form.addField('custpage_select_project', 'select', 'Select Project To Copy', 'job', null);
			projectSelect.setMandatory(true);
			
			var customerSelect = form.addField('custpage_select_customer', 'select', 'Select Customer', 'customer', null);
			customerSelect.setMandatory(true);
			customerSelect.setLayoutType('normal', 'startcol');
			
			var nameSelect = form.addField('custpage_select_name', 'text', 'New Project Name', null, null);
			nameSelect.setMandatory(true);
			
			var dateSelect = form.addField('custpage_select_date', 'date', 'New Project Start Date', null, null);
			dateSelect.setMandatory(true);
			
			var pmSelect = form.addField('custpage_select_pm', 'select', 'New Project Manager', 'employee', null);
			pmSelect.setMandatory(true);
			
			form.addSubmitButton('Copy Project');
		
			response.writePage(form);
		}
	else
		{
			var selectedProject = request.getParameter('custpage_select_project');
			var selectedCustomer = request.getParameter('custpage_select_customer');
			var selectedName = request.getParameter('custpage_select_name');
			var selectedDate = request.getParameter('custpage_select_date');
			var selectedPM = request.getParameter('custpage_select_pm');
			
			var params = {};
			params['projectid'] = selectedProject;
			params['customerid'] = selectedCustomer;
			params['name'] = selectedName;
			params['startdate'] = selectedDate;
			params['projectmanager'] = selectedPM;
			
			nlapiScheduleScript('customscript_bbs_copy_project_scheduled', null, JSON.stringify(params));
		}
}
