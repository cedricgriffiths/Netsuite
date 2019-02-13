/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       24 Jan 2019     cedricgriffiths
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
function projectTaskAS(type)
{
	if(type == 'delete')
		{
			var oldTaskRecord = nlapiGetOldRecord();
			var oldGoLiveTask = oldTaskRecord.getFieldValue('custevent3');
			
			//If we are deleting the task that was marked as the go live task, then we need to un-set the dates on the project
			//
			if(oldGoLiveTask == 'T')
				{
					//Get the project id
					//
					var projectId = oldTaskRecord.getFieldValue('company');
					
					//Update the project estimated go live dates
					//
					var fieldsToUpdate = ['custentity_bbs_actual_website_golive'];
					var valuesToUpdate = [''];
					
					try
						{
							nlapiSubmitField('job', projectId, fieldsToUpdate, valuesToUpdate, false);
						}
					catch(err)
						{
						
						}
				}
		}
	
	if(type == 'create' || type == 'edit')
		{
			//Get old & new records
			//
			var oldTaskRecord = nlapiGetOldRecord();
			var newTaskRecord = nlapiGetNewRecord();
			
			var oldGoLiveTask = null;
			//var oldStartDate = null;
			
			//Only get the 'old' values if we are in edit mode, in create mode there will be no 'old' version of the record
			//
			if(type == 'edit')
				{
					oldGoLiveTask = oldTaskRecord.getFieldValue('custevent3');
					//oldStartDate = oldTaskRecord.getFieldValue('startdate');
				}
			
			var newGoLiveTask = newTaskRecord.getFieldValue('custevent3');
			var newStartDate = getTaskEndDate(newTaskRecord.getId()); //newTaskRecord.getFieldValue('startdate');
			
			//If we have just ticked the go live project task tick box, then wee need to process
			//
			if((oldGoLiveTask == 'F' || oldGoLiveTask == null) && newGoLiveTask == 'T')
				{
					//Get the project id
					//
					var projectId = newTaskRecord.getFieldValue('company');
					
					//Get the start date of this task
					//
					var taskStartDate = getTaskEndDate(newTaskRecord.getId()); //newTaskRecord.getFieldValue('startdate');
					
					//Get the current value of the baseline field from the task
					//
					var currentBaseline = null;
					
					try
						{
							currentBaseline = nlapiLookupField('job', projectId, 'custentity_bbs_webs_estgo_live_date', false);
						}
					catch(err)
						{
							currentBaseline = null;
						}
					
					//Update the project estimated go live dates
					//
					var fieldsToUpdate = '';
					var valuesToUpdate = '';
					
					if(currentBaseline == null || currentBaseline == '')
						{
							//If the baseline is empty then we can set it
							//
							fieldsToUpdate = ['custentity_bbs_webs_estgo_live_date','custentity_bbs_actual_website_golive'];
							valuesToUpdate = [taskStartDate,taskStartDate];
						}
					else
						{
							//If the baseline already has a value, then leave it alone
							//
							fieldsToUpdate = ['custentity_bbs_actual_website_golive'];
							valuesToUpdate = [taskStartDate];
						}
					
					try
						{
							nlapiSubmitField('job', projectId, fieldsToUpdate, valuesToUpdate, false);
						}
					catch(err)
						{
						
						}
				}
			
			//If we have just un-ticked the go live project task tick box, then we need to process
			//
			if(oldGoLiveTask == 'T' && newGoLiveTask == 'F')
				{
					//Get the project id
					//
					var projectId = newTaskRecord.getFieldValue('company');
					
					//Update the project estimated go live dates
					//
					var fieldsToUpdate = ['custentity_bbs_actual_website_golive'];
					var valuesToUpdate = [''];
					
					try
						{
							nlapiSubmitField('job', projectId, fieldsToUpdate, valuesToUpdate, false);
						}
					catch(err)
						{
						
						}
				}
			
			//If the go live project task tick box is ticked but we have changed the task start date, then we need to process
			//
			//if(oldGoLiveTask == 'T' && newGoLiveTask == 'T' && oldStartDate != newStartDate)
			if(oldGoLiveTask == 'T' && newGoLiveTask == 'T')
						{
					//Get the project id
					//
					var projectId = newTaskRecord.getFieldValue('company');
					
					//Update the project go live date
					//
					try
						{
							nlapiSubmitField('job', projectId, 'custentity_bbs_actual_website_golive', newStartDate, false);
						}
					catch(err)
						{
						
						}
				}
			
			//See if the task belongs to a template project, if so unset the go live flag
			//
			
			//Get the project id
			//
			var projectId = newTaskRecord.getFieldValue('company');
			var taskId = newTaskRecord.getId();
			
			//See if the project is marked as a template
			//
			var templateRecord = null;
			
			try
				{
					var templateRecord = nlapiLoadRecord('projecttemplate', projectId);
				}
			catch(err)
				{
					templateRecord = null;
				}
			
			//If we have found that the task relates to a template project then we do not want to allow the task to be set as a start task
			//
			if(templateRecord != null)
				{
					try
						{
							nlapiSubmitField('projecttask', taskId, 'custevent3', 'F', false);
						}
					catch(err)
						{
						
						}
					
				}
		}
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function projectTaskBL(type, form, request)
{
	//Only work for create or edit mode
	//
	if(type == 'edit' || type == 'create')
		{
			//See if this task has the go live project task ticked or not
			//
			var goLiveTask = nlapiGetFieldValue('custevent3');
			
			//If the field is not ticked, see if another task for this project has got it ticked
			//
			if(goLiveTask == 'F')
				{
					//Get the project that this task belongs to
					//
					var projectId = nlapiGetFieldValue('company');
					var taskId = nlapiGetRecordId();
					
					//See if the project is marked as a template
					//
					var templateRecord = null;
					
					try
						{
							var templateRecord = nlapiLoadRecord('projecttemplate', projectId);
						}
					catch(err)
						{
							templateRecord = null;
						}
					
					//If we have found that the task relates to a template project then we do not want to allow the task to be set as a start task
					//
					if(templateRecord != null)
						{
							var goLiveTickField = form.getField('custevent3');
							goLiveTickField.setDisplayType('disabled');
						}
					else
						{
							//Search for other tasks
							//
							var filters = [
										   ["project","anyof",projectId], 
										   "AND", 
										   ["custevent3","is","T"]];
							
							if(taskId != null && taskId != '')
								{
									filters.push("AND",["internalid","noneof",taskId]);
								}
							
							var projecttaskSearch = nlapiSearchRecord("projecttask",null,
									filters, 
									[
									   new nlobjSearchColumn("id").setSort(false), 
									   new nlobjSearchColumn("title")
									]
									);
						
							//We have found another task on this project that has the field ticked
							//
							if(projecttaskSearch != null && projecttaskSearch.length > 0)
								{
									//Make the tick box disabled
									//
									var goLiveTickField = form.getField('custevent3');
									goLiveTickField.setDisplayType('disabled');
								}
						}
				}
			else
				{
					//If the go live task is ticked, then we need to see if it belongs to a template & if so disable the field
					//
				
					//Get the project that this task belongs to
					//
					var projectId = nlapiGetFieldValue('company');
					var taskId = nlapiGetRecordId();
					
					//See if the project is marked as a template
					//
					var templateRecord = null;
					
					try
						{
							var templateRecord = nlapiLoadRecord('projecttemplate', projectId);
						}
					catch(err)
						{
							templateRecord = null;
						}
					
					//If we have found that the task relates to a template project then we do not want to allow the task to be set as a start task
					//
					if(templateRecord != null)
						{
							var goLiveTickField = form.getField('custevent3');
							goLiveTickField.setDisplayType('disabled');
							
						}
				}
		}
}

function getTaskEndDate(_taskId)
{
	var returnedDate = '';
	
	var projecttaskSearch = nlapiSearchRecord("projecttask",null,
			[
			   ["internalid","anyof",_taskId]
			], 
			[
			   new nlobjSearchColumn("enddate")
			]
			);
	
	if(projecttaskSearch != null && projecttaskSearch.length == 1)
		{
			returnedDate = projecttaskSearch[0].getValue("enddate");
		}
	
	return returnedDate;
}