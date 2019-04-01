/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       01 Apr 2019     cedricgriffiths
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response)
{

	//Get the record type & the record id from the url parameters
	//
	var recordId = request.getParameter('recordid');
	var recordType = request.getParameter('recordtype');
	
	//Get the templates from the deployment parameters
	//
	var context = nlapiGetContext();
	var templateNonConformity = context.getSetting('SCRIPT', 'custscript_bbs_template_nc');
	var templateCustComplaint = context.getSetting('SCRIPT', 'custscript_bbs_template_cc');
	var templateInvestigation = context.getSetting('SCRIPT', 'custscript_bbs_template_in');
	
	if(recordId != null && recordId != '' && recordType != null && recordType != '')
		{
			//Load the main record
			//
			var mainRecord = nlapiLoadRecord(recordType, recordId);
		
			//Get the user notes
			//
			var noteSearch = getUserNotes(recordType, recordId);
		
			//Get Tasks
			//
			var taskSearch = getTasks(recordType, recordId);

			//Get Files
			//
			var fileSearch = getFiles(recordType, recordId);

			//Load the template from the file cabinet
			//
			var templateFileId = '';
			
			switch(recordType)
				{
					case 'customrecord_acc_nonconformity':
						templateFileId = templateNonConformity;
						break;
						
					case 'customrecord_acc_customer_complaint':
						templateFileId = templateCustComplaint;
						break;
						
					case 'customrecord_acc_investigation':
						templateFileId = templateInvestigation;
						break;
				}
			
			if(templateFileId != '')
				{
					var templateFile = nlapiLoadFile(templateFileId);
					var templateContents = templateFile.getValue();
				
					//Instantiate a template renderer
					//
					var renderer = nlapiCreateTemplateRenderer();
					
					//Assign template to renderer
					//
					renderer.setTemplate(templateContents);
					
					//Add the main record as a dataset to the renderer
					//
					renderer.addRecord('record', mainRecord);
					
					//Add the user notes as a dataset to the renderer
					//
					renderer.addSearchResults('notes', noteSearch);
					
					//Add the files as a dataset to the renderer
					//
					renderer.addSearchResults('files', fileSearch);
					
					//Add the tasks as a dataset to the renderer
					//
					renderer.addSearchResults('tasks', taskSearch);
					
					//Render the template
					//
					var xml = renderer.renderToString();
					var pdfFile = nlapiXMLToPDF(xml);
				
					//Return the PDF to the client
					//
					response.setContentType('PDF', recordType + '- Custom Print', 'inline');
					response.write(pdfFile.getValue());
				}
		}
}

function getUserNotes(_recordType, _recordId)
{
	var internalIds = [];
	var noteSearch = null;
	var userNotesSearch =  [];
	
	//Search for user notes
	//
	try
		{
			userNotesSearch = nlapiSearchRecord(_recordType,null,
					[
					   ["internalid","anyof",_recordId]
					], 
					[
					   new nlobjSearchColumn("internalid","userNotes",null)
					]
					);
		}
	catch(err)
		{
			userNotesSearch =  null;
		}
	
	if(userNotesSearch != null)
		{
			for (var int = 0; int < userNotesSearch.length; int++) 
				{
					internalIds.push(userNotesSearch[int].getValue("internalid","userNotes"));
				}
		
			try
				{
					noteSearch = nlapiSearchRecord("note", null,
							[
							   ["internalid","anyof",internalIds]
							], 
							[
							   new nlobjSearchColumn("author").setSort(false), 
							   new nlobjSearchColumn("company"), 
							   new nlobjSearchColumn("notedate"), 
							   new nlobjSearchColumn("direction"), 
							   new nlobjSearchColumn("externalid"), 
							   new nlobjSearchColumn("internalid"), 
							   new nlobjSearchColumn("note"), 
							   new nlobjSearchColumn("title"), 
							   new nlobjSearchColumn("notetype")
							]
							);
				}
			catch(err)
				{
					var error = err.message;
					noteSearch = [];
				}
		}
	
	if(noteSearch == null)
		{
			noteSearch = [];
		}
	
	return noteSearch;
}

function getFiles(_recordType, _recordId)
{
	var internalIds = [];
	var fileSearch = null;
	var userFilesSearch =  [];
	
	//Search for user notes
	//
	try
		{
			var userFilesSearch = nlapiSearchRecord(_recordType,null,
					[
					   ["internalid","anyof",_recordId]
					], 
					[
					   new nlobjSearchColumn("internalid","file",null)
					]
					);	
		}
	catch(err)
		{
			userFilesSearch =  null;
		}
	
	if(userFilesSearch != null)
		{
			for (var int = 0; int < userFilesSearch.length; int++) 
				{
					internalIds.push(userFilesSearch[int].getValue("internalid","file"));
				}
		
			try
				{
					fileSearch = nlapiSearchRecord("file", null,
							[
							   ["internalid","anyof",internalIds]
							], 
							[
							   new nlobjSearchColumn("name").setSort(false), 
							   new nlobjSearchColumn("folder"), 
							   new nlobjSearchColumn("documentsize"), 
							   new nlobjSearchColumn("filetype"), 
							   new nlobjSearchColumn("internalid"), 
							   new nlobjSearchColumn("modified")
							]
							);
				}
			catch(err)
				{
					var error = err.message;
					fileSearch = [];
				}
		}
	
	if(fileSearch == null)
		{
			fileSearch = [];
		}
	
	return fileSearch;
}

function getTasks(_recordType, _recordId)
{
	var userTasksSearch =  [];
	var searchCol = '';
	
	switch(_recordType)
		{
			case 'customrecord_acc_nonconformity':
				searchCol = 'custevent_acc_nc_crm_link';
				break;
				
			case 'customrecord_acc_customer_complaint':
				searchCol = 'custevent_acc_cc_crm_link';
				break;
		}
	
	//Search for tasks
	//
	try
		{
			var userTasksSearch = nlapiSearchRecord("task",null,
					[
					   [searchCol,"anyof",_recordId]
					], 
					[
					   new nlobjSearchColumn("assigned"), 
					   new nlobjSearchColumn("duedate"), 
					   new nlobjSearchColumn("priority"), 
					   new nlobjSearchColumn("status"), 
					   new nlobjSearchColumn("title")
					]
					);
		}
	catch(err)
		{
			userTasksSearch =  [];
		}
	
	if(userTasksSearch == null)
		{
			userTasksSearch = [];
		}
	
	return userTasksSearch;
}
