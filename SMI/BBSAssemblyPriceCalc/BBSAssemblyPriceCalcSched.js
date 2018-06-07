/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       07 Jun 2018     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{
	//Process assembly records
	//
	var assemblyitemSearch = nlapiSearchRecord("assemblyitem",null,
			[
			   ["type","anyof","Assembly"], 
			   "AND", 
			   ["matrix","is","F"], 
			   "AND", 
			   ["matrixchild","is","F"], 
			   "AND", 
			   ["isphantom","is","T"], 
			   "AND", 
			   ["isinactive","is","F"]
			], 
			[
			   new nlobjSearchColumn("itemid").setSort(false), 
			   new nlobjSearchColumn("displayname")
			]
			);
	
	//Loop through the list of assemblies
	//
	for (var int2 = 0; int2 < assemblyitemSearch.length; int2++) 
		{
			var assemblyId = assemblyitemSearch[int2].getId();
			
			checkResources();
			
			calculatePricing(assemblyId);

		}
}

function checkResources()
{
	var remaining = parseInt(nlapiGetContext().getRemainingUsage());
	
	if(remaining < 100)
		{
			nlapiYieldScript();
		}
}

