/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       02 Jun 2017     cedricgriffiths
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
 
	if (name == 'weight' || name == 'weightunit')
		{
			var weight = Number(nlapiGetFieldValue('weight'));
			
			var unit = nlapiGetFieldText('weightunit');
			
			var grammes = Number('0');
			
			switch(unit)
			{
				case 'g':
					grammes = weight;
					break;
					
				case 'oz':
					grammes = weight * 28.3495;
					break;
					
				case 'kg':
					grammes = weight * 1000;
					break;
					
				case 'lb':
					grammes = weight * 453.592;
					break;
					
				default:
					grammes = weight;
					break;
			}
			
			grammes = Math.round(grammes);
			
			nlapiSetFieldValue('custitem_bbs_weight_grammes', grammes, false, true);
			
		}
}
