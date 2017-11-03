/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       01 Nov 2017     cedricgriffiths
 *
 */

/**
 * @param {String} recType Record type internal id
 * @param {Number} recId Record internal id
 * @returns {Void}
 */
function massUpdate(recType, recId) 
{
	var consDetail = nlapiLoadRecord(recType, recId);
	
	if (consDetail)
		{
			var poId = consDetail.getFieldValue('custrecord_bbs_con_det_po_id');
			
			if(poId)
				{
					var poRecord = nlapiLoadRecord('purchaseorder', poId);
					
					if(poRecord)
						{
							var exchangeRate = poRecord.getFieldValue('exchangerate');
							var currency = poRecord.getFieldValue('currency');
							
							consDetail.setFieldValue('custrecord_bbs_con_det_exch_rate', exchangeRate);
							consDetail.setFieldValue('custrecord_bbs_con_det_currency', currency);
							
							nlapiSubmitRecord(consDetail, false, true);
						}
				}
			
		}
}
