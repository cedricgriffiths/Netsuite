/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       21 May 2018     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{
	var messages = '';
	
	var transactionSearch = nlapiSearchRecord("transaction",null,
			[
			   ["subsidiary","anyof","1"], 
			   "AND", 
			   ["department","noneof","@NONE@"], 
			   "AND", 
			   ["mainline","is","T"],
			   "AND",
			   ["custbody_cseg_bbs_sector_uk","anyof","@NONE@"], 
			   "AND", 
			   ["type","noneof","ItemShip"]
			], 
			[
			   new nlobjSearchColumn("trandate").setSort(false), 
			   new nlobjSearchColumn("type"), 
			   new nlobjSearchColumn("tranid"), 
			   new nlobjSearchColumn("entity"), 
			   new nlobjSearchColumn("department"), 
			   new nlobjSearchColumn("custbody_cseg_bbs_sector_uk")
			]
			);
	
	if(transactionSearch)
		{
			for (var int = 0; int < transactionSearch.length; int++) 
				{
					 var recId = transactionSearch[int].getId();
					 var recType = transactionSearch[int].getValue('type');
					 var apiRecType = getRecType(recType);
					 
					 var remaining = nlapiGetContext().getRemainingUsage();
					 
					 if(remaining < 50)
						 {
						 	nlapiYieldScript();
						 }
					 
					 try
						 {
							 var record = nlapiLoadRecord(apiRecType, recId);
							 
							 var department = record.getFieldValue('department');
							 var newSector = getNewSector(department);
							 
							 if(newSector != null)
								 {
									 record.setFieldValue('custbody_cseg_bbs_sector_uk', newSector);
									 
									 nlapiSubmitRecord(record, false, true);
								 }
							 else
								 {
								 	messages += 'No mapping for department ' + department + '\n';
								 }
						 }
					 catch(err)
					 	{
						 	messages += apiRecType + ' (' + recId  + ') '+ err.message + '\n';
					 	}
				}
		}

	nlapiLogExecution('DEBUG', 'Error Summary', messages);
}

function getNewSector(dept)
{
	var sector = null;
	
	switch(Number(dept))
		{
			case 20:
				sector = 5;
				break;
				
			case 25:
				sector = 6;
				break;

			case 19:
				sector = 7;
				break;

			case 8:
				sector = 8;
				break;

			case 24:
				sector = 9;
				break;

			case 22:
				sector = 10;
				break;

			case 9:
				sector = 11;
				break;

			case 21:
				sector = 12;
				break;

			case 23:
				sector = 13;
				break;

			case 10:
				sector = 14;
				break;

			case 11:
				sector = 15;
				break;

			case 13:
				sector = 16;
				break;

			case 12:
				sector = 17;
				break;

			case 14:
				sector = 18;
				break;

			case 15:
				sector = 19;
				break;
			
			case 17:
				sector = 20;
				break;

			case 16:
				sector = 21;
				break;

			case 18:
				sector = 22;
				break;

			case 6:
				sector = 23;
				break;

			case 7:
				sector = 24;
				break;

			case 4:
				sector = 25;
				break;

			case 5:
				sector = 26;
				break;
				
		}
	
	return sector;
}


function getRecType(type)
{
	var recType = '';
	
	switch(type)
	{
		case 'CustPymt':
			recType = 'customerpayment';
			break;
		
		case 'CustInvc':
			recType = 'invoice';
			break;
			
		case 'Estimate':
			recType = 'estimate';
			break;
			
		case 'RtnAuth':
			recType = 'returnauthorization';
			break;
			
		case 'SalesOrd':
			recType = 'salesorder';
			break;
			
		case 'ItemShip':
			recType = 'itemfulfillment';
			break;
		
		case 'ItemRcpt':
			recType = 'itemreceipt';
			break;
			
		default:
			recType = type;
			break;
	}

	return recType;
}
