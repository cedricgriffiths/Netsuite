/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       16 Jan 2019     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{
	//Search for any items that have special instructions on them
	//
	var itemSearch = nlapiSearchRecord("item",null,
			[
			   ["custitem_bbs_special_instructions_item","isnotempty",""]
			], 
			[
			   new nlobjSearchColumn("type"), 
			   new nlobjSearchColumn("itemid").setSort(false), 
			   new nlobjSearchColumn("custitem_bbs_special_instructions_item")
			]
			);
	
	if(itemSearch != null && itemSearch.length > 0)
		{
			//Process each found item
			//
			for (var int = 0; int < itemSearch.length; int++) 
				{
					checkResources();
					
					var itemId = itemSearch[int].getId();
					var itemInstructions = itemSearch[int].getValue("custitem_bbs_special_instructions_item");
					
					//Now find the assembly component items that use each item in turn
					//
					var assemblyitemSearch = nlapiSearchRecord("assemblyitem",null,
							[
							   ["type","anyof","Assembly"], 
							   "AND", 
							   ["memberitem.internalid","anyof",itemId]
							], 
							[
							   new nlobjSearchColumn("itemid").setSort(false), 
							   new nlobjSearchColumn("memberitem"), 
							   new nlobjSearchColumn("memberitemsource"), 
							   new nlobjSearchColumn("memberline")
							]
							);
					
					if(assemblyitemSearch != null && assemblyitemSearch.length > 0)
						{
							for (var int2 = 0; int2 < assemblyitemSearch.length; int2++) 
								{
									checkResources();
								
									var bomItem = assemblyitemSearch[int2].getId();
									var bomMember = assemblyitemSearch[int2].getValue("memberitem");
									
									var specInstrId = checkMVF(bomItem, bomMember);
									
									if(specInstrId != null)
										{
											nlapiSubmitField('customrecord_bbs_bom_fields', specInstrId, 'custrecord_bbs_custom_field_1', itemInstructions, false);
										}
									else
								        {
								            var rec = nlapiCreateRecord('customrecord_bbs_bom_fields');
								            rec.setFieldValue('custrecord_bbs_bom_item', bomItem);
								            rec.setFieldValue('custrecord_bbs_bom_member', bomMember);
								            rec.setFieldValue('custrecord_bbs_custom_field_1', itemInstructions);
								            nlapiSubmitRecord(rec);
								        }
								}
						}
				}
		}
}

function checkMVF(item, member)
{
	if(item != null && item != '' && member != null && member != '')
		{
		    var itemFilters = new Array();
		    itemFilters[0] = new nlobjSearchFilter('custrecord_bbs_bom_item', null, 'is', item);
		    itemFilters[1] = new nlobjSearchFilter('custrecord_bbs_bom_member', null, 'is', member);
		    
		    var itemColumns = new Array();
		    itemColumns[0] = new nlobjSearchColumn('internalid', null, null);
		    
		    var searchresults = nlapiSearchRecord('customrecord_bbs_bom_fields', null, itemFilters, itemColumns);
		
		    if (numRows(searchresults) > 0) 
			    {
			        return searchresults[0].getValue('internalid');
			        
			    }
		    else
			    {
			        return null;
			    }
		}
}

function numRows(obj){
    var ctr = 0;

    for (var k in obj){
        if (obj.hasOwnProperty(k)){
            ctr++;
        }
    }
    return ctr;
}

function checkResources()
{
	var remaining = parseInt(nlapiGetContext().getRemainingUsage());
	
	if(remaining < 500)
		{
			var yieldState = nlapiYieldScript();
			nlapiLogExecution('DEBUG', 'Yield Status', yieldState.status + ' ' + yieldState.size + ' ' +  yieldState.reason + ' ' + yieldState.information);
		}
}