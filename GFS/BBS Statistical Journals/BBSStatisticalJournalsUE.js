/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       13 Mar 2019     cedricgriffiths
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
function statisticalJournalsAS(type)
{
	//Only interested in create or edit mode
	//
	if(type == 'create' || type == 'edit')
		{
			//Get the parameters
			//
			var context = nlapiGetContext();
			accountParcels = context.getSetting('SCRIPT', 'custscript_bbs_acc_parcel');
			accountConsignments = context.getSetting('SCRIPT', 'custscript_bbs_acc_cons');
			
			//Init variables
			//
			var oldRecord = null;
			var newRecord = null;
			var recordType = null;
			var recordId = null;
			var summaryValues = {};
			var subsidiaryId = null;
			
			//Get info on the new version of the record
			//
			newRecord = nlapiGetNewRecord();
			recordType = newRecord.getRecordType();
			recordId = newRecord.getId();
			subsidiaryId = newRecord.getFieldValue('subsidiary');
			getSummaryValues(newRecord, 'N', summaryValues);
			
			//If in edit mode we need to get the old version of the record
			//
			if(type == 'edit')
				{
					oldRecord = nlapiGetOldRecord();
					getSummaryValues(oldRecord, 'O', summaryValues);
				}
		
			//Get the values from the new version of the record
			//
			getSummaryValues(oldRecord, 'N', summaryValues);
			
			
			//See if we need to create a statistical journal
			//
			var createJournal = false;
			
			for ( var summaryValue in summaryValues) 
				{
					if(summaryValues[summaryValue][0] != 0 || summaryValues[summaryValue][1] != 0)
						{
							createJournal = true;
							break;
						}
				}
			
			if(createJournal)
				{
					//Create the statistical journal entry
					//
					var statisticalJournal = nlapiCreateRecord('statisticaljournalentry', {recordmode: 'dynamic'});
					statisticalJournal.setFieldValue('subsidiary', subsidiaryId);
					statisticalJournal.setFieldValue('unitstype', '1');
					//statisticalJournal.setFieldValue('unit', unitId);  
					
					//Loop through the summary values
					//
					for ( var summaryValue in summaryValues) 
						{
							//See if we need to create a parcels line
							//
							if(summaryValues[summaryValue][0] != 0)
								{
									summaryParts = summaryValue.split('|');
									
								}
							
							//See if we need to create a consignments line
							//
							if(summaryValues[summaryValue][1] != 0)
								{
									summaryParts = summaryValue.split('|');
									
								}
							
						}
		/*			for (var int = 0; int < array.length; int++) 
						{
							statisticalJournal.setLineItemValue('line', 'account', int, statisticalAccountId);
							statisticalJournal.setLineItemValue('line', 'debit', int, amount); // field "debit" has label "Amount" in UI
							statisticalJournal.setLineItemValue('line', 'lineunit', int, unitId);       
							statisticalJournal.setLineItemValue('line', 'memo', int, memo); 
							statisticalJournal.setLineItemValue('line', 'class', int, classId);
							statisticalJournal.setLineItemValue('line', 'department', int, departmentId);
							statisticalJournal.setLineItemValue('line', 'location', int, locationId);
						}
					
					try
						{
							nlapiSubmitRecord(statisticalJournal, true, true);
						}
					catch(err)
						{
							nlapiLogExecution('ERROR', 'Error creating statistical journal', err.message);
						}
		*/
				}
		}
}


function getSummaryValues(_record, _type, _summaryValues)
{
	var lines = _record.getLineItemCount('item');
	var multiplier = Number(1);
	
	for (var int = 1; int <= lines; int++) 
		{
			var carrier = isNull(_record.getLineItemValue('item', 'class', int), '');
			var contract = isNull(_record.getLineItemValue('item', 'location', int), '');
			var group = isNull(_record.getLineItemValue('item', 'custcol_cseg_bbs_prodgrp', int), '');
			var service = isNull(_record.getLineItemValue('item', 'custcol_cseg_bbs_service', int), '');
			var charge = isNull(_record.getLineItemValue('item', 'custcol_cseg_bbs_chrgetype', int), '');
			var operations = isNull(_record.getLineItemValue('item', 'cseg_bbs_ops_method', int), '');
			
			var summaryKey = carrier + '|' + contract + '|' + group + '|' + service + '|' + charge + '|' + operations;
			
			var parcels = Number(_record.getLineItemValue('item', 'custcol_bbs_parcels', int));
			var consignments = Number(_record.getLineItemValue('item', 'custcol_bbs_consignments', int));
			
			switch(_type)
				{
					case 'O':
						multiplier = Number(-1);
						break;
						
					case 'N':
						multiplier = Number(1);
						break;	
				}
			
			parcels = parcels * multiplier;
			consignments = consignments * multiplier;
			
			if(!_summaryValues[summaryKey])
				{
					_summaryValues[summaryKey] = [parcels, consignments];
				}
			else
				{
					_summaryValues[summaryKey][0] += parcels;
					_summaryValues[summaryKey][1] += consignments;
				}
		}
}

function isNull(_string, _replacer)
{
	if(_string == null)
		{
			return _replacer;
		}
	else
		{
			return _string;
		}
}