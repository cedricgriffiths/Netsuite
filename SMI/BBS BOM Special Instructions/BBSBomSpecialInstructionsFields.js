/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       11 Jan 2017     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function bomSpecialInstructionsBeforeLoad(type, form, request)
{
    addField(form);
}

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
function bomSpecialInstructionsAfterSubmit(type)
{
	//nlapiLogExecution('DEBUG', 'Progress', 'In userEventAfterSubmit');
	
    var members = nlapiGetLineItemCount('member'); 
    var itemid = nlapiGetRecordId();

    if(itemid != null && itemid != '')
    	{
		    for (var i = 0; members != null && i < members; i++) 
			    {
			        var memberId = nlapiGetLineItemValue('member','item',i+1);
			        var customfield = nlapiGetLineItemValue('member','custpage_bom_spec_inst',i+1);    
			
			        if (checkMVF(itemid, memberId))
				        {
				            nlapiSubmitField('customrecord_bbs_bom_fields',mvfid,'custrecord_bbs_custom_field_1',customfield);
				        }
			        else
				        {
				            var rec = nlapiCreateRecord('customrecord_bbs_bom_fields');
				            rec.setFieldValue('custrecord_bbs_bom_item', itemid);
				            rec.setFieldValue('custrecord_bbs_bom_member', memberId);
				            rec.setFieldValue('custrecord_bbs_custom_field_1', customfield);
				            nlapiSubmitRecord(rec);
				        }
			    }
    	}
}

function addField(form)
{
	
	//nlapiLogExecution('DEBUG', 'Progress', 'In addField');
	
    var sublist = form.getSubList('member');
    
    if(sublist != null )
    	{
		    var members = nlapiGetLineItemCount('member');
		    var itemId = nlapiGetRecordId();
		    sublist.addField('custpage_bom_spec_inst','textarea','BOM Special Instructions');
		    
		    for (var i = 0; members != null && i < members; i++) 
		    	{
		    		var memberId = nlapiGetLineItemValue('member','item',i+1);
		
		    		if (checkMVF(itemId, memberId)) 
		        		{
		            		var customfield = nlapiLookupField('customrecord_bbs_bom_fields',mvfid,'custrecord_bbs_custom_field_1');
		            		nlapiSetLineItemValue('member','custpage_bom_spec_inst',i+1,customfield);
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
			        mvfid = searchresults[0].getValue('internalid');
			        return true;
			    }
		    else
			    {
			        return false;
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

