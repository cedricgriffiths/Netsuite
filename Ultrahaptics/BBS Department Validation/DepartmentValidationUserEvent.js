/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       16 Mar 2017     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */
function userEventBeforeSubmit(type){
 
	if (type == 'create' || type == 'edit')
		{
			var context = nlapiGetContext().getExecutionContext();
			
			if (context == 'csvimport')
				{
					var record = nlapiGetNewRecord();
					
					var clas = nlapiGetFieldValue('class');
					var dept = nlapiGetFieldValue('department');
					
					if (dept)
						{
							if (!validDepartment(clas, dept))
								{
									var err = nlapiCreateError('BBS_INVALID_DEPT_ON_HEADER', 'Department not valid for chosen class on header', true);
								}
						}
					
					var items = record.getLineItemCount('item');
					
					if (items > 0)
						{
							for (var int = 1; int <= items; int++) 
							{
								var lineDept = nlapiGetLineItemValue('item', 'department', int);
								var lineClass = nlapiGetLineItemValue('item', 'class', int);
								
								if (lineDept)
									{
										if (!validDepartment(lineClass, lineDept))
										{
											var err = nlapiCreateError('BBS_INVALID_DEPT_ON_LINE', 'Department not valid for chosen class on line ' + int.toString(), true);
										}
									}
							}
						}
				}
		}
}

function validDepartment(clas, dept) 
{
	var result = true;
	
	var deptRecord = nlapiLoadRecord('department', dept );
	
	var classId = deptRecord.getFieldValue('custrecord_bbs_related_class');
	
	if (classId != clas)
		{
			result = false;
		}
	
	return result;
}
