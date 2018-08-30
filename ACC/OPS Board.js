/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       12 Jun 2018     krish
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function opsFullSuitelet(request, response) {

   
    var holder = "";
    if (request.getMethod() == 'GET') {
    	var context = nlapiGetContext();
    	var remUsage = context.getRemainingUsage();
        var headerColour = context.getSetting('SCRIPT', 'custscript_sl_obp_headercolour_full');
    	var NMinutes = (86400 * 1000);//24 Hours in Millisecnds..
    	var NDate = new Date(Date.now() - NMinutes);//24hrs from now..
    	
    	if(NDate.getMinutes() < 30)
    		{
    			NDate.setMinutes(0);
    			NDate.setSeconds(0);
    			NDate.setMilliseconds(0);
    		}
    	else
    		{
    			NDate.setMinutes(30);
    			NDate.setSeconds(0);
    			NDate.setMilliseconds(0);
    		}
    	var NHrsTxt = '';
    	var NMinsTxt = '';
    	var	NTime = '';
    	
    	
    	
    	var content = '<html>';
    	content += '<head>';
    	content += '<link rel="stylesheet" type="text/css" ';
    	content += 'href="https://system.eu1.netsuite.com/core/media/media.nl?id=10763&c=4105181_SB1&h=6d6e5e2b2c7500155ea9&_xt=.css">';
    	//@@@content += '<script>function scrollWin() {	window.scrollTo(2200, 0); scrolldelay = setTimeout("scrollWin()",4000);}</script>';
    	//@@@content += '<script>function pageloadEvery(t) {setTimeout("location.reload(true)", t);}</script>';
    	content += '</head>';
    	content += '<body onload="javascript:pageloadEvery(3000); scrollWin()">';//onload="scrollWin()"
    	 
    	
    	content += '<table align="center" border="1" cellpadding="3" cellspacing="0" width="5760">';
		content +='<tbody>';
    	content +='<tr>';
      	content +='<td border="0">';
		content +='<table width="5880" border="0">';
  		content +='<tbody>';
    	content +='<tr>';
		content +='<td border="0" colspan="24" align="center">Yesterday</td>';
      	content +='<td border="0" colspan="48" align="center">Today</td>';
      	content +='<td border="0" colspan="26" align="center">Tomorrow</td>';
    	content +='</tr align="center"><tr>';
		var timeID = 1;
		var times = 1;
		var timesEnd = 96;
		var tdvalues = [];
		var tdTimeIndex = [];
		var dateVal;
		// Flight Detail Column
		content +='<td border="0" width ="30" align="center" id=-2 bgcolor="'+headerColour+'"></td>';
		content +='<td border="0" width ="30" align="center" id=-1 bgcolor="'+headerColour+'"></td>';
		// Flight Detail Column
		
		
     	for ( var z = 0;  z < 96; z++ )
 		{
     		tdvalues.push(0);
 		}
     	for(var n in tdvalues)
		{
			//nlapiLogExecution('DEBUG', 'times is..', times);
			//nlapiLogExecution('DEBUG', 'NDate is..', NDate);//NDate.getUTCDate()
			NHrsTxt = NDate.getUTCHours();
			
			if(parseInt(NHrsTxt) < 10)
				{
					NHrsTxt = '0'+NHrsTxt;
				}
			NMinsTxt = NDate.getUTCMinutes();
			if(NMinsTxt == 0)
				{
					NMinsTxt = '0'+NMinsTxt;
				}
			NTime = NHrsTxt +':'+ NMinsTxt;
			if(n == 48)
				{
					content +='<td border="0" width ="30" align="center" id="'+n+'" bgcolor=#FFFF00">Now<br>'+NTime+'</td>';
				}
			else
				{
					content +='<td border="0" width ="30" align="center" id="'+n+'" bgcolor="'+headerColour+'">'+NTime+'</td>';
				}
			if(parseInt(NDate.getUTCDate()) < 10)
				{
					dateVal = '0'+ NDate.getUTCDate()+':'+NTime;
				}
			else
				{
					dateVal = NDate.getUTCDate()+':'+NTime;
				}
			tdTimeIndex.push({
				'id': n,
				'val': dateVal
			});
			NMinutes = NMinutes - (1800 * 1000);
			NDate = new Date(Date.now() - NMinutes);
			if(NDate.getMinutes() < 30)
				{
					NDate.setMinutes(0);
					NDate.setSeconds(0);
					NDate.setMilliseconds(0);
				}
			else
				{
					NDate.setMinutes(30);
					NDate.setSeconds(0);
					NDate.setMilliseconds(0);
				}
		}
	
     	for (var ai = 0; tdTimeIndex != null && ai < tdTimeIndex.length; ai++) {
     		//nlapiLogExecution('DEBUG', '@tdTimeIndex ',ai+', id-'+tdTimeIndex[ai].id+', NTime-'+tdTimeIndex[ai].val);
     	}
     	content +='</tr>';
	
     	//Get Scetor data first time
    	var sectorColumnValue = [];
    	for (var z = 0; z < 30; z++) {
    		sectorColumnValue.push(0)
    	}
    	var sector_search = nlapiLoadSearch('customrecord_fs_sectors','customsearch_bb_ops_bod_list_2');
    	var sectorNewSearch = nlapiCreateSearch(sector_search.getSearchType(),null, null);
    	sectorNewSearch.setFilters(sector_search.getFilters());

    	sectorNewSearch.setColumns(sector_search.getColumns());
    	var sectorSearchResults = sectorNewSearch.runSearch();
    	var sectorSearchChunk = sectorSearchResults.getResults(0, 1000);
	
     	var processedFlight = [];
     	var processed = false;
     	for ( var t = 0; sectorSearchChunk != null && t < sectorSearchChunk.length; t++) { // Start of Main Result
		 
     		var sectorResults = sectorSearchChunk[t]; 
     		var sectorColumns =	sectorResults.getAllColumns(); 
     		for(var n in sectorColumns) {
     			if (n != 16 && n != 17 && n != 2 && n != 3)
	 			{
	 				sectorColumnValue[n] = sectorResults.getValue(sectorColumns[n]); 
	 			}
     			else
	 			{
	 				sectorColumnValue[n] = sectorResults.getText(sectorColumns[n]);
	 			}
     		}
     		var acReg  = sectorColumnValue[0];
     		var flitNo = sectorColumnValue[24];
     		var fixLnk = sectorColumnValue[25];//22 Fixture internal id
     		for (var proFli = 0; proFli <= processedFlight.length; proFli++) {
				//nlapiLogExecution('DEBUG', 'All ProcessedAc : ',flitNo);
				if (processedFlight[proFli] == acReg) {
					processed = true;
				}
			}
     		if(processed == false){
     			
     			var tdBodEst = [];
     			var mIs = 0;
     			var mIs3 = 0;
         	    for ( var y = 0;  y < 96; y++ )	{
         	    	tdBodEst.push(0);
         	 	}
     			
     			var sector2ColumnValue = [];
     	    	for (var zz = 0; zz < 30; zz++) {
     	    		sector2ColumnValue.push(0)
     	    	}
     	    	var sector3ColumnValue = [];
     	    	for (var zzz = 0; zzz < 30; zzz++) {
     	    		sector3ColumnValue.push(0)
     	    	}
     	    	var sector2_search = nlapiLoadSearch('customrecord_fs_sectors','customsearch_bb_ops_bod_list_2');
     	    	var sector2NewSearch = sectorNewSearch; //nlapiCreateSearch(sector2_search.getSearchType(),null, null);
     	    	sector2NewSearch.setFilters(sector2_search.getFilters());
     	    	
     	    	if(acReg)	{
     	    		sector2NewSearch.addFilter(new nlobjSearchFilter('custrecord_fw_acreg', null, 'startswith', acReg));
				}
     	    	if(fixLnk)	{
     	    		sector2NewSearch.addFilter(new nlobjSearchFilter('custrecord_sector_fixture', null, 'anyof', fixLnk));
				}

     	    	sector2NewSearch.setColumns(sector2_search.getColumns());
     	    	var sector2SearchResults = sector2NewSearch.runSearch();
     	    	var sector2SearchChunk = sector2SearchResults.getResults(0, 1000);
     			//nlapiLogExecution('DEBUG','2.0 SEARCH length-',sector2SearchChunk.length);
     	    	//for ( var tt = 0; sector2SearchChunk != null && tt < sector2SearchChunk.length; tt++){ // Start of second search with aditional filters
     	    	var tt = 0;
     	    		beginning: do {
     	    			//nlapiLogExecution('DEBUG','Goto Called tt-',tt);
     	    		var sector2Results = sector2SearchChunk[tt]; 
     	     		var sector2Columns =	sector2Results.getAllColumns(); 
     	     		for(var nn in sector2Columns) {
     	     			if (nn != 16 && nn != 17 && nn != 2 && nn != 3)
     		 			{
     		 				sector2ColumnValue[nn] = sector2Results.getValue(sector2Columns[nn]); 
     		 			}
     	     			else
     		 			{
     		 				sector2ColumnValue[nn] = sector2Results.getText(sector2Columns[nn]);
     		 			}
     	     		}
     	     		var acReg2  = sector2ColumnValue[0];
     	     		var flitNo2 = sector2ColumnValue[24];
     	     		var fixLnk2 = sector2ColumnValue[25];//22 Fixture internal id
     	    		
     	     		var acNo2   = sector2ColumnValue[1];
             		var fixNo2  = sector2ColumnValue[2];
             		var fixTyp2 = sector2ColumnValue[3];
             		fixNo2 = fixNo2.substring(8, fixNo2.lenght);
             		var offBlk2 = sector2ColumnValue[9];
             		var airBor2 = sector2ColumnValue[10];
             		var etaTim2 = sector2ColumnValue[11];
             		var touDwn2 = sector2ColumnValue[12];
             		var onnBlk2 = sector2ColumnValue[13];
             		var depIat2 = sector2ColumnValue[16];
             		var ariIat2 = sector2ColumnValue[17];
        	 	
             		
             		var secLnk2 = sector2ColumnValue[26];//23
             		//var flitNo  = sectorColumnValue[24];
             		fixLnk2 = '<a href="/app/accounting/transactions/salesord.nl?id='+fixLnk2+'"target="_blank">'+'<div style="color:#000000">'+fixLnk2+'</div>'+'</a>'; /// FONT COLOUR HAVE TO CHANGE AS PER RULE
             		secLnk2 = '<a href="/app/common/custom/custrecordentry.nl?rectype=34&id='+secLnk2+'"target="_blank">'+'<div style="color:#008000">'+secLnk2+'</div>'+'</a>';  /// FONT COLOUR HAVE TO CHANGE AS PER RULE
             		var staBlk2 = parseInt(offBlk2 / 30);
             		var endBlk2 = parseInt(onnBlk2 / 30);
             		
             		var totMin2 = onnBlk2 - offBlk2;
             		var numBlk2 = parseInt(totMin2 / 30);
             		//nlapiLogExecution('DEBUG','Black Bar offBlk-', offBlk+', airBor-'+airBor+', etaTim-'+etaTim+', touDwn-'+touDwn+', onnBlk-'+onnBlk+', totMin-'+totMin+', offBlkDat-'+offBlkDat+', offBlkTim-'+offBlkTim);
             		//nlapiLogExecution('DEBUG','Black Bar staBlk-', staBlk+', endBlk-'+endBlk+', numBlk-'+numBlk);
             		//nlapiStringToDate(offBlkDat).getDate()
             		//nlapiLogExecution('DEBUG','Flight acReg-', acReg+', acNo-'+acNo+', fixNo-'+fixNo+', fixTyp-'+fixTyp);
             		// Get Depart UTC Date & Time Format 
             		var depBlkDat2 = sector2ColumnValue[18];
             		var depBlkTim2 = sector2ColumnValue[19];
             		var depBlkDatTim2;
             		depBlkDatTim2 = depatureBlkDatTim(depBlkDat2, depBlkTim2);
        	 	
             		// Get Arrival UTC Date & Time Format 
             		var ariDat2 = sector2ColumnValue[20];
             		var ariTim2 = sector2ColumnValue[21];
             		var ariDatTim2;
             		ariDatTim2 = arrivalDatTim(ariDat2, ariTim2);
        	 	
        	 	
             		// Get offBlk Date & Time Format 
             		var offBlkDat2 = sector2ColumnValue[4];
             		var offBlkTim2 = sector2ColumnValue[14];
             		var offBlkDatTim2;
             		offBlkDatTim2 = getOffOnBlkDatTim(offBlk2, offBlkDat2);
             		
             		// Get onBlk Date & Time Format 
             		var onBlkDat2 = sector2ColumnValue[8];
             		var onBlkTim2 = sector2ColumnValue[15];
             		var onBlkDatTim2;
             		onBlkDatTim2 = getOffOnBlkDatTim(onnBlk2, onBlkDat2);
             		
             		//nlapiLogExecution('DEBUG', '*** onBlkDat- ', onBlkDat+', onBlkTim-'+onBlkTim+' ,onBlkDatTim-'+onBlkDatTim);
             		// Get index
             		var offBlkIndx = null;
             		var onBlkIndx = null;
             		var depIndx = null;
             		var ariIndx = null;
             		for (var ai = 0; tdTimeIndex != null && ai < tdTimeIndex.length; ai++) {
             			if(!isNullOrEmpty(tdTimeIndex[ai].val) && tdTimeIndex[ai].val == depBlkDatTim2){
             				depIndx = ai;
             				//nlapiLogExecution('DEBUG', '***dep index - ', depIndx);
             			}
             			if(!isNullOrEmpty(tdTimeIndex[ai].val) && tdTimeIndex[ai].val == ariDatTim2){
             				ariIndx = ai;
             				//nlapiLogExecution('DEBUG', '***ari index - ', ariIndx);
             			}
             			if(!isNullOrEmpty(tdTimeIndex[ai].val) && tdTimeIndex[ai].val == offBlkDatTim2){
             				offBlkIndx = ai;
             				//nlapiLogExecution('DEBUG', '***off index - ', offBlkIndx);
             			}
             			if(!isNullOrEmpty(tdTimeIndex[ai].val) && tdTimeIndex[ai].val == onBlkDatTim2){
             				onBlkIndx = ai;
             				//nlapiLogExecution('DEBUG', '***on index - ', onBlkIndx);
             			}
             		}
             		
             		
             		
             		
             		if (tt == 0){
             			content +='<tr>';
             			content +='<td border="0" width=30px bgcolor=#FFFFFF><font color=#000000>'+acReg2+'</font></td>';   
             			content +='<td border="0" width=30px bgcolor=#FFFFFF><font color=#000000>'+acNo2+'</font></td>';
             		}
             		var midleEstIndex = depIndx + parseInt((ariIndx - depIndx)/2);
             		var m = mIs;
             		//nlapiLogExecution('DEBUG','*****mm-',m+', tt-'+tt+', depIndx-'+depIndx+', midleEstIndex-'+midleEstIndex+', ariIndx-'+ariIndx);
             		loop1: for ( m ;  m < 96; m++ )	{
             	    //for(m in tdBodEst)	{
             		//for(m=mmm; tdBodEst!=null && m<tdBodEst.lenght; m++)	{
             	    	if (m >= (depIndx - 1) && m <= (ariIndx + 1))	{	
             	    		if(m == (depIndx-1))	{
                 	    		content +='<td border="0" width=30px bgcolor=#FFFFFF>'+depIat2+'</td>';
                 	    	}
             	    		if (m == depIndx)	{
             	    			content +='<td border="0" width=30px bgcolor=#000000><font color=#FFFFFF>'+depBlkTim2+'</font></td>';
             	    		}
             	    		if(m == midleEstIndex)	{
             	    			content +='<td border="0" width=30px bgcolor=#000000><font color=#FFFFFF>'+flitNo2+'</font></td>';
             				}
             	    		if(m == ariIndx)	{
             	    			content +='<td border="0" width=30px bgcolor=#000000><font color=#FFFFFF>'+ariTim2+'</font></td>';
             	    		}
             	    		if (m > depIndx && m < ariIndx && m != midleEstIndex){
             	    			content +='<td border="0" width=30px bgcolor=#000000><font color=#000000>'+fixLnk2+'</font></td>';
             	    		}
             	    		if(m == (ariIndx+1))	{
                 	    		content +='<td border="0" width=30px bgcolor=#FFFFFF>'+ariIat2+'</td>';
                 	    		mIs = ariIndx + 2;
                 	    		tt = tt+1;
                 	    		//nlapiLogExecution('DEBUG','mmmmmm-',m+', tt-'+tt);
                 	    		//continue beginning;
                 	    		break loop1;
                 			}
             	    	} else if (m < (depIndx-1)) {
             	    		content +='<td border="0" width=30px bgcolor=#FFFFFF></td>';
             	    	}
             	    			
             		}
     	    		
     	    	} while(sector2SearchChunk != null && tt < sector2SearchChunk.length);
     	    	//} // End of second search with aditional filters
     			
     	    	content +='</tr>';
 	    		// Estimate End
     	    
     	    	
     	    	var ttt = 0;
 	    		beginning2: do {
 	    			//nlapiLogExecution('DEBUG','Goto Called tt-',ttt);
 	    		var sector3Results = sector2SearchChunk[ttt]; 
 	     		var sector3Columns =	sector3Results.getAllColumns(); 
 	     		for(var nnn in sector3Columns) {
 	     			if (nnn != 16 && nnn != 17 && nnn != 2 && nnn != 3)
 		 			{
 		 				sector3ColumnValue[nnn] = sector3Results.getValue(sector3Columns[nnn]); 
 		 			}
 	     			else
 		 			{
 		 				sector3ColumnValue[nnn] = sector3Results.getText(sector3Columns[nnn]);
 		 			}
 	     		}
 	     		var acReg3  = sector3ColumnValue[0];
 	     		var flitNo3 = sector3ColumnValue[24];
 	     		var fixLnk3 = sector3ColumnValue[25];//22 Fixture internal id
 	    		
 	     		var acNo3   = sector3ColumnValue[1];
         		var fixNo3  = sector3ColumnValue[2];
         		var fixTyp3 = sector3ColumnValue[3];
         		fixNo3 = fixNo3.substring(8, fixNo3.lenght);
         		var offBlk3 = sector3ColumnValue[9];
         		var airBor3 = sector3ColumnValue[10];
         		var etaTim3 = sector3ColumnValue[11];
         		var touDwn3 = sector3ColumnValue[12];
         		var onnBlk3 = sector3ColumnValue[13];
         		var depIat3 = sector3ColumnValue[16];
         		var ariIat3 = sector3ColumnValue[17];
    	 	
         		
         		var secLnk3 = sector3ColumnValue[26];//23
         		//var flitNo  = sectorColumnValue[24];
         		fixLnk3 = '<a href="/app/accounting/transactions/salesord.nl?id='+fixLnk3+'"target="_blank">'+'<div style="color:#000000">'+fixLnk3+'</div>'+'</a>'; /// FONT COLOUR HAVE TO CHANGE AS PER RULE
         		secLnk3 = '<a href="/app/common/custom/custrecordentry.nl?rectype=34&id='+secLnk3+'"target="_blank">'+'<div style="color:#008000">'+secLnk3+'</div>'+'</a>';  /// FONT COLOUR HAVE TO CHANGE AS PER RULE
         		var staBlk3 = parseInt(offBlk3 / 30);
         		var endBlk3 = parseInt(onnBlk3 / 30);
         		
         		var totMin3 = onnBlk3 - offBlk3;
         		var numBlk3 = parseInt(totMin3 / 30);
         		//nlapiLogExecution('DEBUG','Black Bar offBlk-', offBlk+', airBor-'+airBor+', etaTim-'+etaTim+', touDwn-'+touDwn+', onnBlk-'+onnBlk+', totMin-'+totMin+', offBlkDat-'+offBlkDat+', offBlkTim-'+offBlkTim);
         		//nlapiLogExecution('DEBUG','Black Bar staBlk-', staBlk+', endBlk-'+endBlk+', numBlk-'+numBlk);
         		//nlapiStringToDate(offBlkDat).getDate()
         		//nlapiLogExecution('DEBUG','Flight acReg-', acReg+', acNo-'+acNo+', fixNo-'+fixNo+', fixTyp-'+fixTyp);
         		// Get Depart UTC Date & Time Format 
         		var depBlkDat3 = sector3ColumnValue[18];
         		var depBlkTim3 = sector3ColumnValue[19];
         		var depBlkDatTim3;
         		depBlkDatTim3 = depatureBlkDatTim(depBlkDat3, depBlkTim3);
    	 	
         		// Get Arrival UTC Date & Time Format 
         		var ariDat3 = sector3ColumnValue[20];
         		var ariTim3 = sector3ColumnValue[21];
         		var ariDatTim3;
         		ariDatTim3 = arrivalDatTim(ariDat3, ariTim3);
    	 	
    	 	
         		// Get offBlk Date & Time Format 
         		var offBlkDat3 = sector3ColumnValue[4];
         		var offBlkTim3 = sector3ColumnValue[14];
         		var offBlkDatTim3;
         		offBlkDatTim3 = getOffOnBlkDatTim(offBlk3, offBlkDat3);
         		
         		// Get onBlk Date & Time Format 
         		var onBlkDat3 = sector3ColumnValue[8];
         		var onBlkTim3 = sector3ColumnValue[15];
         		var onBlkDatTim3;
         		onBlkDatTim3 = getOffOnBlkDatTim(onnBlk3, onBlkDat3);
         		
         		//nlapiLogExecution('DEBUG', '*** onBlkDat- ', onBlkDat+', onBlkTim-'+onBlkTim+' ,onBlkDatTim-'+onBlkDatTim);
         		// Get index
         		var offBlkIndx3 = null;
         		var onBlkIndx3 = null;
         		var depIndx3 = null;
         		var ariIndx3 = null;
         		for (var ai = 0; tdTimeIndex != null && ai < tdTimeIndex.length; ai++) {
         			if(!isNullOrEmpty(tdTimeIndex[ai].val) && tdTimeIndex[ai].val == depBlkDatTim3){
         				depIndx3 = ai;
         				//nlapiLogExecution('DEBUG', '***dep index - ', depIndx);
         			}
         			if(!isNullOrEmpty(tdTimeIndex[ai].val) && tdTimeIndex[ai].val == ariDatTim3){
         				ariIndx3 = ai;
         				//nlapiLogExecution('DEBUG', '***ari index - ', ariIndx);
         			}
         			if(!isNullOrEmpty(tdTimeIndex[ai].val) && tdTimeIndex[ai].val == offBlkDatTim3){
         				offBlkIndx3 = ai;
         				//nlapiLogExecution('DEBUG', '***off index - ', offBlkIndx);
         			}
         			if(!isNullOrEmpty(tdTimeIndex[ai].val) && tdTimeIndex[ai].val == onBlkDatTim3){
         				onBlkIndx3 = ai;
         				//nlapiLogExecution('DEBUG', '***on index - ', onBlkIndx);
         			}
         		}
         		
         		
         		
         	
         	// Actual Start
         	if (ttt == 0){
        		content +='<tr>';
        		content +='<td border="0" width=30px bgcolor=#FFFFFF><font color=#000000>'+fixNo3+'</font></td>';
        		content +='<td border="0" width=30px bgcolor=#FFFFFF><font color=#000000>'+fixTyp3+'</font></td>';
         	}
         	var tdBodVal = [];
    		var midleIndex3 = offBlkIndx3 + parseInt((onBlkIndx3 - offBlkIndx3)/2);
    		var m = mIs3;
    		loop2: for ( m ;  m < 96; m++ )	{
    			
    			if (m >= offBlkIndx3 && m <= onBlkIndx3)	{	
    				if (m == offBlkIndx3)	{
    						content +='<td border="0" width=30px bgcolor=#008000><font color=#FFFFFF>'+offBlkTim3+'</font></td>';
    				}
    				if(m == midleIndex3)	{
						content +='<td border="0" width=30px bgcolor=#008000><font color=#FFFFFF></font></td>';
					}
    				if (m > offBlkIndx3 && m < onBlkIndx3 && m != midleIndex3)	{
						content +='<td border="0" width=30px bgcolor=#008000><font color=#008000>'+secLnk3+'</font></td>';
					}
    				if(m == onBlkIndx3)	{
						content +='<td border="0" width=30px bgcolor=#008000><font color=#FFFFFF>'+onBlkTim3+'</font></td>';
						//mIs3 = ariIndx3 + 1;
						if (ttt == 0){
							mIs3 = ariIndx3 + (2 + ttt);
						}else {
							mIs3 = ariIndx3 +  ttt;
						}
         	    		ttt = ttt+1;
         	    		
         	    		//nlapiLogExecution('DEBUG','mmmmmm-',m+', ttt-'+ttt);
         	    		//continue beginning2;
         	    		break loop2;
					}
    			}
    			else if(m < offBlkIndx3)	{
					content +='<td border="0" width=30px bgcolor=#FFFFFF></td>';
    			}
    			
    		}
        		// Actual End
 	    		
 	    	} while(sector2SearchChunk != null && ttt < sector2SearchChunk.length);
 	    	//} // End of second search with aditional filters
 			
 	    	content +='</tr>';
 	    	// End of Actuals
     	    
     	    	
     	    	processedFlight.push(acReg);

        	
        		// Add An empty row after each flight
        		content +='<tr>';
        		var emptRow = [];
        		for ( var er = 0;  er < 96; er++ )
        		{
        			emptRow.push(0);
        		}
        		for(var o in emptRow)
        		{
        			content +='<td border="0" width=30px bgcolor=#FFFFFF>'+' '+'</td>';
        		
        		}
        		content +='</tr>';
        		// Add An empty row after each flight
     	    
   	      	
     	    		
         		
         		
         		
     		} // END OFProcessed if
     		
     		
     		
     	}
     	//End of the Table
		content +='</tbody>';
		content +='</table>';
		content += '<br/>';
	    content += '</body>';
	   	content += '</html>';

    	response.write(content);
    } else {
        holder = request.getParameter("");
        //nlapiLogExecution("Debug", "Input Value", something);
       
        response.write(content);
    }
}

function getOffOnBlkDatTim(offBlk, offBlkDat) {
	var offBlkDatTim;
	if (nlapiStringToDate(offBlkDat).getDate() < 10)	{
		offBlkDatTim = '0'+nlapiStringToDate(offBlkDat).getDate();
	}
	else 	{
		offBlkDatTim = nlapiStringToDate(offBlkDat).getDate();
	}
	
	var ofhr = parseInt(offBlk/60);
	var ofmi = offBlk%60;
	var offBlkRound;
	if(ofmi < 30)	{
		offBlkRound = ofhr+':00';
	}
	else	{
		offBlkRound = ofhr+':30';
	}
	
	if(offBlkRound.length == 4)	{
		offBlkDatTim += ':0'+offBlkRound;
	}
	else	{
		offBlkDatTim += ':'+offBlkRound;
	}
	
	return offBlkDatTim;
}
function arrivalDatTim(ariDat, ariTim) {
	var ariDatTim;
	if (nlapiStringToDate(ariDat).getDate() < 10)	{
		ariDatTim = '0'+nlapiStringToDate(ariDat).getDate();
	}
	else 	{
		ariDatTim = nlapiStringToDate(ariDat).getDate();
	}
	var arihr = ariTim.toString().split(":")[0];
	var arimi = ariTim.toString().split(":")[1];
	var ariBlkRound;
	if(arimi < 30)	{
		ariBlkRound = arihr+':00';
	}
	else	{
		ariBlkRound = arihr+':30';
	}
	if(ariBlkRound.length == 4)	{
		ariDatTim += ':0'+ariBlkRound;
	}
	else	{
		ariDatTim += ':'+ariBlkRound;
	}
	//nlapiLogExecution('DEBUG', '@@@ - dephr', arihr+', depmi-'+arimi+', depBlkDatTim-'+ariDatTim);
	
	return ariDatTim;
}
function depatureBlkDatTim(depBlkDat, depBlkTim) {
	var depBlkDatTim;
	if (nlapiStringToDate(depBlkDat).getDate() < 10)	{
		depBlkDatTim = '0'+nlapiStringToDate(depBlkDat).getDate();
	}
	else 	{
		depBlkDatTim = nlapiStringToDate(depBlkDat).getDate();
	}
	var dephr = depBlkTim.toString().split(":")[0];
	var depmi = depBlkTim.toString().split(":")[1];
	var depBlkRound;
	if(depmi < 30)	{
		depBlkRound = dephr+':00';
	}
	else	{
		depBlkRound = dephr+':30';
	}
	if(depBlkRound.length == 4)	{
		depBlkDatTim += ':0'+depBlkRound;
	}
	else	{
		depBlkDatTim += ':'+depBlkRound;
	}
	//nlapiLogExecution('DEBUG', '@@@ - dephr', dephr+', depmi-'+depmi+', depBlkDatTim-'+depBlkDatTim);
	return depBlkDatTim;
}
function isNullOrEmpty(strVal){return(strVal == undefined || strVal == null || strVal === "");}
