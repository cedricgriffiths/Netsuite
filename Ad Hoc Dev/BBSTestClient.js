/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       25 Jan 2018     cedricgriffiths
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
	
	var items = nlapiGetLineItemCount('item');
	
	for (var int = 1; int <= items; int++) 
	{
		nlapiSelectLineItem('item', int);
		
		var hide = nlapiGetCurrentLineItemValue('item', 'custcol_bbs_hide_price');
		
		if(hide == 'T')
			{
				nlapiSetCurrentLineItemValue('item', 'rate', 0, false, true);
				nlapiSetCurrentLineItemValue('item', 'amount', 0, false, true);
				nlapiCommitLineItem('item');
			}

	}
	
	var tdColor = '#B2FF33';

	for (var int = 1; int <= items; int++) 
		{
				var trDom = document.getElementById('item_row_' + int.toString());
				var trDomChild = trDom.children;
				for (var t=0; t < (trDomChild.length); t+=1)
				{
					//get the child TD DOM element
					var tdDom = trDomChild[t];
					
					if([8,10,12,13].indexOf(t) > -1)
						{
							tdDom.style.display = 'none';
							tdDom.setAttribute('style','background-color: '+tdColor+'!important;border-color: white '+tdColor+' '+tdColor+' '+tdColor+'!important;');
						}
				}
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
	if(type == 'item' && name == 'item')
	{
		var hide = nlapiGetCurrentLineItemValue(type, 'custcol_bbs_hide_price');
		
		if(hide == 'T')
			{
				nlapiSetCurrentLineItemValue(type, 'amount', '0', true, true);
				nlapiSetCurrentLineItemValue(type, 'rate', '0', true, true);
			}
		}
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
 
    return true;
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
  
    return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to continue line item delete, false to abort delete
 */
function clientValidateDelete(type){
   
    return true;
}
