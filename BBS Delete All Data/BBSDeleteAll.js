/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       27 Sep 2017     cedricgriffiths
 *
 */

for (var count = 0; count < 10; count++) 
{
	var deleteResult = deleteAll('D');
}



function deleteAll(mode)
{
	var recordTypes = ["resourceallocation",
	                   "calendarevent",
	                   "phonecall",
	                   "task",
	                   "message",
	                   "note",
	                   "genericresource",
	                   "projecttemplate",
	                   "competitor",
	                   "contact",
	                   "customer",
	                   "lead",
	                   "othername",
	                   "partner",
	                   "job",
	                   "jobstatus",
	                   "jobtype",
	                   "prospect",
	                   "vendor",
	                   "projecttask",
	                   "shipitem",
	                   "assemblyitem",
	                   "descriptionitem",
	                   "discountitem",
	                   "downloaditem",
	                   "giftcertificateitem",
	                   "inventoryitem",
	                   "itemgroup",
	                   "kititem",
	                   "lotnumberedassemblyitem",
	                   "lotnumberedinventoryitem",
	                   "markupitem",
	                   "noninventoryitem",
	                   "otherchargeitem",
	                   "paymentitem",
	                   "serializedassemblyitem",
	                   "serializedinventoryitem",
	                   "serviceitem",
	                   "subscriptionplan",
	                   "subtotalitem",
	                   "campaign",
	                   "campaignresponse",
	                   "couponcode",
	                   "promotioncode",
	                   "landedcost",
	                   "inventorydetail",
	                   "addressbookaddress",
	                   "orderschedule",
	                   "supportcase",
	                   "issue",
	                   "solution",
	                   "topic",
	                   "customerpayment",
	                   "itemfulfillment",
	                   "itemreceipt",
	                   "workorderclose",
	                   "workordercompletion",
	                   "workorderissue",
	                   "binworksheet",
	                   "deposit",
	                   "manufacturingoperationtask",
	                   "itemdemandplan",
	                   "fulfillmentrequest",
	                   "storepickupfulfillment",
	                   "depositapplication",
	                   "revenuecommitment",
	                   "revenuecommitmentreversal",
	                   "advintercompanyjournalentry",
	                   "assemblybuild",
	                   "assemblyunbuild",
	                   "bintransfer",
	                   "blanketpurchaseorder",
	                   "cashrefund",
	                   "cashsale",
	                   "subscriptionchangeorder",
	                   "charge",
	                   "check",
	                   "creditcardcharge",
	                   "creditcardrefund",
	                   "creditmemo",
	                   "customerdeposit",
	                   "customerrefund",
	                   "estimate",
	                   "expensereport",
	                   "intercompanyjournalentry",
	                   "intercompanytransferorder",
	                   "inventoryadjustment",
	                   "inventorycostrevaluation",
	                   "inventorycount",
	                   "inventorytransfer",
	                   "invoice",
	                   "itemsupplyplan",
	                   "journalentry",
	                   "opportunity",
	                   "paycheckjournal",
	                   "purchasecontract",
	                   "purchaseorder",
	                   "purchaserequisition",
	                   "returnauthorization",
	                   "revenuearrangement",
	                   "salesorder",
	                   "statisticaljournalentry",
	                   "subscription",
	                   "timebill",
	                   "usage",
	                   "vendorbill",
	                   "vendorcredit",
	                   "vendorpayment",
	                   "vendorreturnauthorization",
	                   "workorder",
	                   "transferorder"]

	var filters = [];
	var columns = [];
	var results = {};
	
	for (var int = 0; int < recordTypes.length; int++) 
	{
		var recordType = recordTypes[int];
		var search = null;
		var searchResult = null;
		
		try
		{
			search = nlapiCreateSearch(recordType, filters, columns);
			searchResult = search.runSearch();
		}
		catch(err)
		{
			search = null;
			searchResult = null;
		}
		
		if (searchResult)
			{
				//Get the initial set of results
				//
				var start = 0;
				var end = 1000;
				var resultlen = 0;
				var searchResultSet = null;
				
				try
				{
					searchResultSet = searchResult.getResults(start, end);
					resultlen = searchResultSet.length;
				}
				catch(err)
				{
					resultlen = 0;
				}
				
				//If there is more than 1000 results, page through them
				//
				while (resultlen == 1000) 
					{
							start += 1000;
							end += 1000;
		
							var moreSearchResultSet = searchResult.getResults(start, end);
							resultlen = moreSearchResultSet.length;
		
							searchResultSet = searchResultSet.concat(moreSearchResultSet);
					}
				
				if(searchResultSet && searchResultSet.length > 0)
					{
						
						var recordCount = searchResultSet.length;
						results[recordType] = recordCount;
						
						if(mode == 'D')
							{
								for (var int2 = 0; int2 < searchResultSet.length; int2++) 
								{
									var recType = searchResultSet[int2].getRecordType();
									var recId = searchResultSet[int2].getId();
									
									var remaining = parseInt(nlapiGetContext().getRemainingUsage());
									
									try
									{
										nlapiDeleteRecord(recType, recId);
									}
									catch(err)
									{

									}
								}
							}
					}
			}
	}

	return results;
}