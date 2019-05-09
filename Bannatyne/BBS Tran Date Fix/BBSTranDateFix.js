/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       09 May 2019     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{

	var cashsaleSearch = nlapiSearchRecord("cashsale",null,
			[
			   ["type","anyof","CashSale"], 
			   "AND", 
			   ["customform","anyof","128"], 
			   "AND", 
			   ["systemnotes.type","is","T"], 
			   "AND", 
			   ["systemnotes.date","on","30/4/2019"], 
			   "AND", 
			   ["mainline","is","T"], 
			   "AND", 
			   ["trandate","on","1/5/2019"]
			], 
			[
			   new nlobjSearchColumn("trandate"), 
			   new nlobjSearchColumn("asofdate"), 
			   new nlobjSearchColumn("postingperiod"), 
			   new nlobjSearchColumn("custbodybbs_merchant_id"), 
			   new nlobjSearchColumn("tranid"), 
			   new nlobjSearchColumn("entity"), 
			   new nlobjSearchColumn("memo"), 
			   new nlobjSearchColumn("amount")
			]
			);
	
	if(cashsaleSearch != null && cashsaleSearch.length > 0)
		{
			for (var int = 0; int < cashsaleSearch.length; int++) 
				{
					var tranId = cashsaleSearch[int].getId();
					
					nlapiSubmitField('cashsale', tranId, 'trandate', "30/4/2019", false);
				}
		}
}
