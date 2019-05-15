/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 May 2019     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function copyManifestAfterSubmit(type)
{
	if(type == 'create' || type == 'edit')
		{
			//Get initial values
			//
			var sectorRecord = nlapiGetNewRecord();
			var sectorId = sectorRecord.getId();
			var fixtureId = sectorRecord.getFieldValue('custrecord_sector_fixture');
			var copyManifest = sectorRecord.getFieldValue('custrecord_sector_copy_manifest');
			var sectorRecordType = sectorRecord.getRecordType();
			
			//See if we have ticked the copy manifest checkbox
			//
			if(copyManifest == 'T')
				{
					//Reset the copy flag
					//
					nlapiSubmitField(sectorRecordType, sectorId, 'custrecord_sector_copy_manifest', 'F', false); //4 GU's
					
					//Remove any other manifest records
					//
					removeManifests(fixtureId, sectorId);
					
					//Copy manifest records
					//
					copyManifests(fixtureId, sectorId);
				}
		}
}

function removeManifests(_fixtureId, _sectorId)
{	
	//Find all of the sectors on the fixture that are not the current sector
	//
	var sectorIds = getAllOtherSectors(_fixtureId, _sectorId);
	
	//Find any manifest records belonging to those sectors so we can delete them
	//
	if(sectorIds.length > 0)
		{
			var customrecord_bbs_passenger_manifestSearch = getResults(nlapiCreateSearch("customrecord_bbs_passenger_manifest",
					[
					   ["custrecord_bbs_mani_sector","anyof",sectorIds]
					], 
					[
					   new nlobjSearchColumn("id").setSort(false)
					]
					));  //10 GU's
		
			if(customrecord_bbs_passenger_manifestSearch != null && customrecord_bbs_passenger_manifestSearch.length > 0)
				{
					for (var int2 = 0; int2 < customrecord_bbs_passenger_manifestSearch.length; int2++) 
						{
							var manifestId = customrecord_bbs_passenger_manifestSearch[int2].getId();
							
							nlapiDeleteRecord('customrecord_bbs_passenger_manifest', manifestId); //4 GU's
						}
				}
		}
}

function copyManifests(_fixtureId, _sectorId)
{	
	//Find all of the sectors on the fixture that are not the current sector
	//
	var sectorIds = getAllOtherSectors(_fixtureId, _sectorId);
	
	//Find any manifest records belonging to this sector
	//
	var customrecord_bbs_passenger_manifestSearch = getResults(nlapiCreateSearch("customrecord_bbs_passenger_manifest",
			[
			   ["custrecord_bbs_mani_sector","anyof",_sectorId]
			], 
			[
			   new nlobjSearchColumn("id").setSort(false)
			]
			));  //10 GU's
		
	if(customrecord_bbs_passenger_manifestSearch != null && customrecord_bbs_passenger_manifestSearch.length > 0)
		{
			for (var int2 = 0; int2 < customrecord_bbs_passenger_manifestSearch.length; int2++) 
				{
					var manifestId = customrecord_bbs_passenger_manifestSearch[int2].getId();
					
					//Loop through al the sectors we need to ciopy to
					//
					for (var int3 = 0; int3 < sectorIds.length; int3++) 
					{
						sectorIdForNewManifest = sectorIds[int3];
						
						var newManifestRecord = nlapiCopyRecord("customrecord_bbs_passenger_manifest", manifestId); //2 GU's
						
						newManifestRecord.setFieldValue('custrecord_bbs_mani_sector', sectorIdForNewManifest);
						
						try
							{
								nlapiSubmitRecord(newManifestRecord, false, true); //4GU's
							}
						catch(err)
							{
								nlapiLogExecution('ERROR', 'Error createing new manifest record', 'Sector = ' + sectorIdForNewManifest + ' Error = ' + err.message);
							}
					}
				}
		}

}

function getResults(search)
{
	var searchResult = search.runSearch();
	
	//Get the initial set of results
	//
	var start = 0;
	var end = 1000;
	var searchResultSet = searchResult.getResults(start, end);
	
	if(searchResultSet != null)
		{
			var resultlen = searchResultSet.length;
		
			//If there is more than 1000 results, page through them
			//
			while (resultlen == 1000) 
				{
						start += 1000;
						end += 1000;
		
						var moreSearchResultSet = searchResult.getResults(start, end);
						
						if(moreSearchResultSet != null && moreSearchResultSet.length > 0)
							{
								resultlen = moreSearchResultSet.length;
		
								searchResultSet = searchResultSet.concat(moreSearchResultSet);
							}
				}
		}
	return searchResultSet;
}

function getAllOtherSectors(_fixtureId, _sectorId)
{
	var sectorIds = [];
	
	//Find all of the sectors on the fixture that are not the current sector
	//
	var customrecord_fs_sectorsSearch = getResults(nlapiCreateSearch("customrecord_fs_sectors",
			[
			   ["custrecord_sector_fixture","anyof",_fixtureId], 
			   "AND", 
			   ["internalid","noneof",_sectorId]
			], 
			[
			   new nlobjSearchColumn("id").setSort(false)
			]
			)); //10 GU's
	
	if(customrecord_fs_sectorsSearch != null && customrecord_fs_sectorsSearch.length > 0)
		{
			for (var int = 0; int < customrecord_fs_sectorsSearch.length; int++) 
				{
					var thisSectorId = customrecord_fs_sectorsSearch[int].getId();
					sectorIds.push(thisSectorId);
				}
		
		}
	
	return sectorIds;
}