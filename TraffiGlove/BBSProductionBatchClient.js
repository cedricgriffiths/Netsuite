/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       14 Jul 2017     cedricgriffiths
 *
 */

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

function assignWorksOrders()
{
	var id = nlapiGetRecordId();

	// Get the relative url of the suitelet 
	//
	var url = nlapiResolveURL('SUITELET', 'customscript_bbs_assign_wo_suitelet', 'customdeploy_bbs_assign_wo_suitelet');
	
	url = url + '&productionbatchid=' + id;
	url = url + '&stage=1';
	url = url + '&mode=U';
	
		
	// Open the contract print in a new window
	//
	window.open(url, '_self',' Assign Works Orders');
	//window.open(url, '_blank', 'Assign Works Orders', 'toolbar=no, scrollbars=no, resizable=yes');
}