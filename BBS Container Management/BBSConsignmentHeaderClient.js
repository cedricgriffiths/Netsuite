/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       17 Feb 2017     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function clientPageInit(type){

   //setFieldAndLabelVisibility('tbl_newrecrecmachcustrecord_bbs_consignment_header_id', false);
   
   if (type == 'create')
	   {
	   		nlapiSetFieldValue('custrecord_bbs_consignment_status', '1', false, true);
	   }

}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord(){

    return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Boolean} True to continue changing field value, false to abort value change
 */
function clientValidateField(type, name, linenum){
   
    return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function clientFieldChanged(type, name, linenum){
 
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @returns {Void}
 */
function clientPostSourcing(type, name) {
   
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Void}
 */
function clientLineInit(type) {
     
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to save line item, false to abort save
 */
function clientValidateLine(type){
	var context = nlapiGetContext().getExecutionContext();
	
	if (context == 'userinterface')
		{
			alert('Please add consignment details using "Assign P/Os"');
			
			return false;
		}
	else
		{
			return true;
		}
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Void}
 */
function clientRecalc(type){
 
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to continue line item insert, false to abort insert
 */
function clientValidateInsert(type){
  
	var context = nlapiGetContext().getExecutionContext();
	
	if (context == 'userinterface')
		{
	    	return false;
		}
	else
		{
			return true;
		}
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to continue line item delete, false to abort delete
 */
function clientValidateDelete(type){
   
	var context = nlapiGetContext().getExecutionContext();
	
	if (context == 'userinterface')
		{
	    	return false;
		}
	else
		{
			return true;
		}	
}

function assignPurchaseOrders() 
{
	var status = nlapiGetFieldValue('custrecord_bbs_consignment_status');
	
	if (status != 1)
		{
			alert('Can only assign purchase orders when consignment is Open');
		}
	else
		{
			//Call the suitelet
			//
			var url = nlapiResolveURL('SUITELET', 'customscript_bbs_cons_alloc_po', 'customdeploy_bbs_cons_alloc_po');
		
			var consId = nlapiGetRecordId();
		
			// Add the consignment id to the url
			//
			url += '&consignmentid=' + consId;
		
			// Open the suitelet in a new window
			//
			window.open(url, '_self','Allocate PO');
		}	
}

function unAssignPurchaseOrders() 
{
	var status = nlapiGetFieldValue('custrecord_bbs_consignment_status');
	
	if (status != 1)
		{
			alert('Can only un-assign purchase orders when consignment is Open');
		}
	else
		{
			//Call the suitelet
			//
			var url = nlapiResolveURL('SUITELET', 'customscript_bbs_cons_unalloc_po', 'customdeploy_bbs_cons_unalloc_po');
		
			var consId = nlapiGetRecordId();
		
			// Add the consignment id to the url
			//
			url += '&consignmentid=' + consId;
		
			// Open the suitelet in a new window
			//
			window.open(url, '_self','Allocate PO');
		}	
}

