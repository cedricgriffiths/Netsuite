/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       27 Jun 2018     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Boolean} True to continue changing field value, false to abort value change
 */
function itemValidateField(type, name, linenum)
{
   
	if (name === 'itemid')
	   {   
	      var fieldLength = String(nlapiGetFieldValue('itemid')).length;
	      
	      if (fieldLength > 20)
		      {   
		         alert("Item Name/Number can only be upto 20 characters in length.");
		         return false;
		      }
	   }
	
	   //  Always return true at this level, to continue validating other fields
	   return true;
	   
}

function itemSaveRecord()
{
	var fieldLength = String(nlapiGetFieldValue('itemid')).length;
    
    if (fieldLength > 20)
	      {   
	         alert("Item Name/Number can only be upto 20 characters in length.");
	         return false;
	      }
    
    return true;
}