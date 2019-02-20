/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       11 Apr 2018     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{

	var salesorderSearch = nlapiSearchRecord("salesorder",null,
			[
			   ["type","anyof","SalesOrd"], 
			   "AND", 
			   ["mainline","is","F"], 
			   "AND", 
			   ["status","anyof","SalesOrd:D","SalesOrd:E","SalesOrd:B"], 
//			   "AND", 
//			   ["custbody_bbs_manpack_info","startswith","MANPACK 0 (0)"], 
			   "AND", 
			   ["custcol_bbs_sales_line_contact","noneof","@NONE@"], 
			   "AND", 
			   ["quantitycommitted","greaterthan","0"]
			], 
			[
			   new nlobjSearchColumn("internalid",null,"GROUP")
			]
			);  //10GU's
	
	if(salesorderSearch && salesorderSearch.length > 0)
		{
			nlapiLogExecution('DEBUG', 'Number of sales orders to process', salesorderSearch.length)
		
			for (var int2 = 0; int2 < salesorderSearch.length; int2++) 
				{
					var salesOrderId = salesorderSearch[int2].getValue("internalid",null,"GROUP");
					
					var salesOrderRecord = nlapiLoadRecord('salesorder', salesOrderId);  //10GU's
				  	
				  	if(salesOrderRecord)
				  		{
				  			var manpackItemCount = Number(0);
				  			var manpackPeople = {};
				  			
				  			var items = salesOrderRecord.getLineItemCount('item');
				  			var currentManpackInfo = salesOrderRecord.getFieldValue('custbody_bbs_manpack_info');
				  			
				  			for (var int = 1; int <= items; int++) 
					  			{
									var manpackPerson = salesOrderRecord.getLineItemValue('item', 'custcol_bbs_sales_line_contact', int);
									var manpackItemQty = Number(salesOrderRecord.getLineItemValue('item', 'quantitycommitted', int));
									
									if(manpackItemQty > 0 && manpackPerson != null && manpackPerson != '')
										{
											manpackItemCount += manpackItemQty;
											manpackPeople[manpackPerson] = manpackPerson;
										}
								}
				  			
				  			var manpackInfo = 'MANPACK ' + (Object.keys(manpackPeople).length).toString() + ' (' + manpackItemCount.toString() + ')';
				  			
				  			if(manpackInfo != currentManpackInfo)
				  				{
				  					nlapiSubmitField('salesorder', salesOrderId, 'custbody_bbs_manpack_info', manpackInfo, false);  //10GU's
				  					
				  					//salesOrderRecord.setFieldValue('custbody_bbs_manpack_info', manpackInfo);
				  					//nlapiSubmitRecord(salesOrderRecord, false, true);  //20GU's
				  				}
				  		}
				}
		}
}
