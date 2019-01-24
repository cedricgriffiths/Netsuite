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
	//Get old & new records
	//
	var oldTaskRecord = nlapiGetOldRecord();
	var newTaskRecord = nlapiGetNewRecord();
	
	//Get old & new values 
	//
	var oldGoLiveTask = oldTaskRecord.getFieldValue('custevent2');
	var newGoLiveTask = newTaskRecord.getFieldValue('custevent2');
	var oldStartDate = oldTaskRecord.getFieldValue('startdate');
	var newStartDate = newTaskRecord.getFieldValue('startdate');
	
	//If we have just ticked the go live project task tick box, then wee need to process
	//
	if(oldGoLiveTask == 'F' && newGoLiveTask == 'T')
		{
			//Get the project id
			//
			var projectId = newTaskRecord.getFieldValue('company');
			
			//Get the start date of this task
			//
			var taskStartDate = newTaskRecord.getFieldValue('startdate');
			
			//Update the project estimated go live dates
			//
			var fieldsToUpdate = ['custentity_bbs_webs_estgo_live_date','custentity_bbs_actual_website_golive'];
			var valuesToUpdate = [taskStartDate,taskStartDate];
			
			nlapiSubmitField('job', projectId, fieldsToUpdate, valuesToUpdate, false);
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
			var fieldsToUpdate = ['custentity_bbs_webs_estgo_live_date','custentity_bbs_actual_website_golive'];
			var valuesToUpdate = ['',''];
			
			nlapiSubmitField('job', projectId, fieldsToUpdate, valuesToUpdate, false);
		}
	
	//If the go live project task tick box is ticked but we have changed the task start date, then we need to process
	//
	if(oldGoLiveTask == 'T' && newGoLiveTask == 'T' && oldStartDate != newStartDate)
		{
			//Get the project id
			//
			var projectId = newTaskRecord.getFieldValue('company');
			
			//Update the project go live date
			//
			nlapiSubmitField('job', projectId, 'custentity_bbs_actual_website_golive', newStartDate, false);
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
			var goLiveTask = nlapiGetFieldValue('custevent2');
			
			//If the field is not ticked, see if another task for this project has got it ticked
			//
			if(goLiveTask == 'F')
				{
					var projectId = nlapiGetFieldValue('company');
					var taskId = nlapiGetRecordId();
					
					var projecttaskSearch = nlapiSearchRecord("projecttask",null,
							[
							   ["project","anyof",projectId], 
							   "AND", 
							   ["custevent2","is","T"], 
							   "AND", 
							   ["internalid","noneof",taskId]
							], 
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
							var goLiveTickField = form.getField('custevent2');
							goLiveTickField.setDisplayType('disabled');
						}
				}
		}
}