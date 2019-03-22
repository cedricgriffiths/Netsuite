// JavaScript Document
function validate_Field(type, name)// Actions run when a field is being validated
 {
	 //alert('Type: '+type+' Name: '+name);
	 //Set Arrival Date to be the same as Departure Date
	 if(type == 'recmachcustrecord_sector_transaction' && name == 'custrecord_sector_departuredate')
	 {
		var depDate = nlapiGetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_departuredate');
		nlapiSetCurrentLineItemValue('recmachcustrecord_sector_transaction', 'custrecord_sector_arrivaldate', depDate, false, false);
		nlapiSetCurrentLineItemValue('recmachcustrecord_sector_transaction', 'custrecord_sector_arrivaltime', '00:00', false, false);
        return true;
	 } 
	return true;
 }
function pageInit(type)
{
  nlapiLogExecution('DEBUG', 'type is..', type);
	if(type == 'view')
    {
      	var trawlOfferSearch = nlapiGetFieldValue('inpt_searchid1');
		//Trawl Offer Buttons
		document.getElementById("tbl_newrecrecmachcustrecord_irfq_enquiry").style.visibility = "hidden";
		document.getElementById("newrec585").style.visibility = "hidden";
		//Interior Proposal Buttons
		document.getElementById("newrec602").style.visibility = "hidden";
      	nlapiLogExecution('DEBUG', 'trawlOfferSearch is..', trawlOfferSearch);
    }	
  if(type == 'create')
	{
		var currentUser = nlapiGetUser();
		var currentForm = nlapiGetFieldValue('customform');
		var context = nlapiGetContext();
		var userDeptId = context.getDepartment();
      	var userSubsidiary = nlapiGetSubsidiary();
      	var userLocation = nlapiGetLocation()//context.getLocation();
        //nlapiSetFieldValue('projectedtotal', 1000, true, true);
		nlapiLogExecution('DEBUG', 'pageInit: userDeptId is..', userDeptId);
		nlapiLogExecution('DEBUG', 'userSubsidiary is..', userSubsidiary);
		nlapiLogExecution('DEBUG', 'userLocation is..', userLocation);
      	nlapiSetFieldValue('location',userLocation, true, true);
      	nlapiSetFieldValue('subsidiary',userSubsidiary, true, true);
      	
      var stLineNum = nlapiGetLineItemCount('salesteam');
            nlapiLogExecution('DEBUG', 'stLineNum is..', stLineNum);
			if(stLineNum == 0)
				{
					nlapiLogExecution('DEBUG', 'stLineNum is..', stLineNum);
					nlapiSelectNewLineItem('salesteam');
					nlapiSetCurrentLineItemValue('salesteam','employee',currentUser); 
					nlapiSetCurrentLineItemValue('salesteam', 'contribution', 100);
					nlapiSetCurrentLineItemValue('salesteam', 'isprimary', 'T');
					nlapiCommitLineItem('salesteam');
					//return true;
				}
        if(currentForm == 112)//ACMI Long Term
		{
			nlapiSetFieldValue('department', 11, true, true);
			nlapiSetFieldValue('class', 5, true, true);
			nlapiSetFieldValue('custbody_acc_enquiry_source', '', true, true);
			//nlapiSetFieldValue('projectedtotal', 1000, true, true);
			return true;
		}
		if(currentForm == 115)//ACMI Short Term
		{
			nlapiSetFieldValue('department', 10, true, true);
			nlapiSetFieldValue('class', 5, true, true);
			nlapiSetFieldValue('custbody_acc_enquiry_source', 1, true, true);
			nlapiSetFieldValue('projectedtotal', 1000, true, true);
			return true;
		}
		if(currentForm == 144)//Charter Shuttle
		{
			nlapiSetFieldValue('department', 4, true, true);
			nlapiSetFieldValue('class', 5, true, true);
          	nlapiSetFieldValue('custbody_acc_status_reason', 3, true, true);
			return true;
		}
		if(currentForm == 141)//Group Charter
		{
			nlapiSetFieldValue('department', 2, true, true);
			nlapiSetFieldValue('class', 5, true, true);
			nlapiSetFieldValue('custbody_acc_enquiry_source', '', true, true);
          	nlapiSetFieldValue('custbody_acc_status_reason', 3, true, true);
			
			try
			{
			nlapiSelectNewLineItem('recmachcustrecord_sector_transaction');
			nlapiSetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_scheduletype',1); 
			}
			catch(err2)
			{
				nlapiLogExecution('DEBUG', 'SEC Catch error is..', err2.message);
			}
			var tranDate = nlapiStringToDate(nlapiGetFieldValue('trandate'));
			var newTranDate = nlapiAddDays(tranDate, 1);;
			if(newTranDate.getDay() == '0')//Sunday
				{
					newTranDate = nlapiAddDays(newTranDate, 1);
				}
			if(newTranDate.getDay() == '6')//Saturday
				{
					newTranDate = nlapiAddDays(newTranDate, 2);
				}
			nlapiSetFieldValue('expectedclosedate', nlapiDateToString(newTranDate,'DD-Mon-YYYY'), false, false);
			return true;
		}
		if(currentForm == 142)//Charter Exec
		{
			nlapiSetFieldValue('department', 3, true, true);
			nlapiSetFieldValue('class', 5, true, true);
			nlapiSetFieldValue('custbody_acc_enquiry_source', '', true, true);
          	nlapiSetFieldValue('custbody_acc_status_reason', 3, true, true);
			try
			{
			nlapiSelectNewLineItem('recmachcustrecord_sector_transaction');
			nlapiSetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_scheduletype',1); 
			}
			catch(err2)
			{
				nlapiLogExecution('DEBUG', 'SEC Catch error is..', err2.message);
			}
			var tranDate = nlapiStringToDate(nlapiGetFieldValue('trandate'));
			var newTranDate = tranDate;
			if(newTranDate.getDay() == '0')//Sunday
				{
					newTranDate = nlapiAddDays(newTranDate, 1);
				}
			if(newTranDate.getDay() == '6')//Saturday
				{
					newTranDate = nlapiAddDays(newTranDate, 2);
				}
			nlapiSetFieldValue('expectedclosedate', nlapiDateToString(newTranDate,'DD-Mon-YYYY'), false, false);
			return true;
		}
		if(currentForm == 143)//Charter Series
		{
			nlapiSetFieldValue('department', 9, true, true);
			nlapiSetFieldValue('class', 5, true, true);
			nlapiSetFieldValue('custbody_acc_enquiry_source', '', true, true);
          	nlapiSetFieldValue('custbody_acc_status_reason', 3, true, true);
			try
			{
			nlapiSelectNewLineItem('recmachcustrecord_sector_transaction');
			nlapiSetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_scheduletype',1); 
			}
			catch(err2)
			{
				nlapiLogExecution('DEBUG', 'SEC Catch error is..', err2.message);
			}
			return true;
		}
		if(currentForm == 137 || currentForm == 110)//Charter Corporate Shuttle
		{
			nlapiSetFieldValue('department', 4, true, true);
			nlapiSetFieldValue('class', 5, true, true);
			nlapiSetFieldValue('custbody_acc_enquiry_source', '', true, true);
          	nlapiSetFieldValue('custbody_acc_status_reason', 3, true, true);
			try
			{
			nlapiSelectNewLineItem('recmachcustrecord_sector_transaction');
			nlapiSetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_scheduletype',1); 
			}
			catch(err2)
			{
				nlapiLogExecution('DEBUG', 'SEC Catch error is..', err2.message);
			}
			return true;
		}
		if(currentForm == 109)//Interiors
		{
			nlapiSetFieldValue('department', 5, true, true);
			nlapiSetFieldValue('class', 5, true, true);
            nlapiSetFieldValue('custbody_acc_enquiry_source', 3, true, true);
			var tranDate = nlapiStringToDate(nlapiGetFieldValue('trandate'));
			var newTranDate = nlapiAddDays(tranDate, 2); 
			if(newTranDate.getDay() == '0')//Sunday
				{
					newTranDate = nlapiAddDays(newTranDate, 1);
				}
			if(newTranDate.getDay() == '6')//Saturday
				{
					newTranDate = nlapiAddDays(newTranDate, 2);
				}
			nlapiSetFieldValue('expectedclosedate', nlapiDateToString(newTranDate,'DD-Mon-YYYY'), false, false);
		}
		return true;
		
	}
	else
	{
		return true;
	}
	
}
function lineInit(type)
{
	if(type=='recmachcustrecord_sector_transaction')
	{
		
		try
		{
		nlapiSetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_scheduletype',1);
		var depDate = nlapiGetFieldValue('custbody_flight_end_date');
		nlapiSetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_departuredate',depDate);
		}
		catch(err3)
		{
			nlapiLogExecution('DEBUG', 'LI SEC Catch error is..', err3.message);
		}
	}
	
}
function validateLine(type, name, linenum)
{
	if(type=='recmachcustrecord_sector_transaction')
	{
	  	var liSshedType = nlapiGetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_scheduletype');
		var departDate = nlapiGetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_departuredate');
		var depZulu = nlapiGetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_deputcdt');
			departDate = nlapiStringToDate(departDate+' '+depZulu);
		var arriveDate = nlapiGetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_arrivaldate');
		var arrZulu = nlapiGetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_arrutcdt');
			arriveDate = nlapiStringToDate(arriveDate+' '+arrZulu);
		var hours = Math.abs(arriveDate - departDate) / 3600000;
		if(departDate > arriveDate)
			{
				if(depZulu != '0:00' && arrZulu != '0:00')
					{
						var depConf = confirm('Your Departure is before your Arrival. Are you sure?');
						if(depConf == true)
							{
								return true;
							}
						else
							{
								return false;
							}
						
						//nlapiSetCurrentLineItemValue('recmachcustrecord_sector_transaction', 'custrecord_sector_arrivaldate', date1);
						return false;
					}
				else
					{
						nlapiSetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_hours', 0);
						return true;
					}
				
			}
		if(depZulu != '0:00' && arrZulu != '0:00')
			{
				nlapiSetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_hours', hours.toFixed(2));
			}
		
		
		
		//var useZulu = 0;
			//hourslocal = 
		//nlapiSetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_hours', hours);
		if(liSshedType == null || liSshedType == '')
		{
			nlapiSetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_scheduletype',1);
		}
		var dt1 = nlapiGetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_departuredate');
		var dt2 = nlapiGetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_arrivaldate');
		/**if(depZulu)
		{
			var ti1 = depZulu;
			//var tz1 = 0;
			var depap = nlapiGetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_departureiata');
			var arrap = nlapiGetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_arrivaliata');
			var tz1 = parseFloat(nlapiLookupField('customrecord_acc_airport', depap, 'custrecord_ap_utcplusminus'));
			useZulu = 1;
		}
		if(depLocal)
		{
			var ti1 = depLocal;
			var depap = nlapiGetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_departureiata');
			var arrap = nlapiGetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_arrivaliata');
			var tz1 = parseFloat(nlapiLookupField('customrecord_acc_airport', depap, 'custrecord_ap_utcplusminus'));
			useZulu = 0;
		}
		if(arrZulu)
		{
			var ti2 = arrZulu;
			//var tz2 = 0;
			var depap = nlapiGetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_departureiata');
			var arrap = nlapiGetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_arrivaliata');
			var tz2 = parseFloat(nlapiLookupField('customrecord_acc_airport', arrap, 'custrecord_ap_utcplusminus'));
			useZulu = 1;
		}
		if(arrLocal)
		{
			var ti2 = arrLocal;
			var depap = nlapiGetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_departureiata');
			var arrap = nlapiGetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_arrivaliata');
			var tz2 = parseFloat(nlapiLookupField('customrecord_acc_airport', arrap, 'custrecord_ap_utcplusminus'));
			useZulu = 0;
		}
		var date1 = nlapiStringToDate(dt1+' '+ti1);
		var date2 = nlapiStringToDate(dt2+' '+ti2);
		nlapiLogExecution('DEBUG','date1 is..', date1);
		nlapiLogExecution('DEBUG','ti2 is..', ti2);
		nlapiLogExecution('DEBUG','tz1 is..', tz1);
		nlapiLogExecution('DEBUG','date2 is..', date2);
		nlapiLogExecution('DEBUG','tz2 is..', tz2);
		nlapiLogExecution('DEBUG','tz1 times minus 1 is..', (tz1*-1));
		nlapiLogExecution('DEBUG','tz2 times minus 1 is..', (tz2*-1));
		if(tz1 < 0 && ti2 != '0:00')
		{
			var date1local = date1.setHours(date1.getHours()+(tz1*-1));
			var date1utc = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate(),  date1.getHours(), date1.getMinutes(), date1.getSeconds());
			date1utc.setUTCHours(date1utc.getUTCHours()+(tz1*-1));
			hours = parseFloat(Math.abs(date2 - date1) / 3600000).toFixed(2);
			if(useZulu == 0)
			{
			var hoursutc = Math.abs(date2utc - date1utc) / 3600000;
			var deputchrs = ((date1.getHours()-1)+':'+date1.getMinutes());
			var arrutchrs = ((date2.getHours()-1)+':'+date2.getMinutes());
			nlapiSetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_deputcdt', deputchrs);
			nlapiSetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_arrutcdt', arrutchrs);
			}
			if(useZulu == 1)
			{
			var hourslocal = Math.abs(date2utc - date1utc) / 3600000;
			var depLocal1 = ((date1.getHours()-1)+':'+date1.getMinutes());
			var arrLocal1 = ((date2.getHours()-1)+':'+date2.getMinutes());
			nlapiSetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_departuretime', depLocal1);
			nlapiSetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_arrivaltime', arrLocal1);
			}
			nlapiSetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_hours', hours);
			
			nlapiLogExecution('DEBUG','ltz date1s are ..', date1utc);
		}
		if(tz1 >= 0 && ti2 != '0:00')
		{
			var date1local = date1.setHours(date1.getHours()-tz1);
			var date1utc = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate(),  date1.getHours(), date1.getMinutes(), date1.getSeconds());
			date1utc.setHours(date1utc.getHours()+tz1);
			hours = parseFloat(Math.abs(date2 - date1) / 3600000).toFixed(2);
			if(useZulu == 0)
			{
			var hoursutc = Math.abs(date2utc - date1utc) / 3600000;
			var deputchrs = ((date1.getHours()-1)+':'+date1.getMinutes());
			var arrutchrs = ((date2.getHours()-1)+':'+date2.getMinutes());
			nlapiSetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_deputcdt', deputchrs);
			nlapiSetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_arrutcdt', arrutchrs);
			}
			if(useZulu == 1)
			{
			var hourslocal = Math.abs(date2utc - date1utc) / 3600000;
			var depLocal1 = ((date1.getHours()-1)+':'+date1.getMinutes());
			var arrLocal1 = ((date2.getHours()-1)+':'+date2.getMinutes());
			nlapiSetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_departuretime', depLocal1);
			nlapiSetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_arrivaltime', arrLocal1);
			}
			nlapiSetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_hours', hours);
			nlapiLogExecution('DEBUG','gtz date1local is..', date1utc);
		}
		if(tz2 < 0 && ti2 != '0:00')
		{
			var date2local = date2.setHours(date2.getHours()+(tz2*-1));
			var date2utc = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate(),  date2.getHours(), date2.getMinutes(), date2.getSeconds());
			date2utc.setHours(date2utc.getHours()+(tz2*-1));
			hours = parseFloat(Math.abs(date2 - date1) / 3600000).toFixed(2);
			if(useZulu == 0)
			{
			var hoursutc = Math.abs(date2utc - date1utc) / 3600000;
			var deputchrs = ((date1.getHours()-1)+':'+date1.getMinutes());
			var arrutchrs = ((date2.getHours()-1)+':'+date2.getMinutes());
			nlapiSetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_deputcdt', deputchrs);
			nlapiSetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_arrutcdt', arrutchrs);
			}
			if(useZulu == 1)
			{
			var hourslocal = Math.abs(date2utc - date1utc) / 3600000;
			var depLocal1 = ((date1.getHours()-1)+':'+date1.getMinutes());
			var arrLocal1 = ((date2.getHours()-1)+':'+date2.getMinutes());
			nlapiSetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_departuretime', depLocal1);
			nlapiSetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_arrivaltime', arrLocal1);
			}
			nlapiSetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_hours', hours);
			nlapiLogExecution('DEBUG','ltz date2local is..', date2utc);
		}
		if(tz2 >= 0 && ti2 != '0:00')
		{
			var date2local = date2.setHours(date2.getHours()-tz2);
			var date2utc = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate(),  date2.getHours(), date2.getMinutes(), date2.getSeconds());
			date2utc.setHours(date2utc.getHours()+tz2);
			hours = parseFloat(Math.abs(date2 - date1) / 3600000).toFixed(2);
			var hoursutc = Math.abs(date2utc - date1utc) / 3600000;
			if(useZulu == 0)
			{
			var deputchrs = ((date1.getHours()-1)+':'+date1.getMinutes());
			var arrutchrs = ((date2.getHours()-1)+':'+date2.getMinutes());
			nlapiSetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_deputcdt', deputchrs);
			nlapiSetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_arrutcdt', arrutchrs);
			}
			if(useZulu == 1)
			{
			var hourslocal = Math.abs(date2utc - date1utc) / 3600000;
			var depLocal1 = ((date1.getHours()-1)+':'+date1.getMinutes());
			var arrLocal1 = ((date2.getHours()-1)+':'+date2.getMinutes());
			nlapiSetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_departuretime', depLocal1);
			nlapiSetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_arrivaltime', arrLocal1);
			}
			nlapiSetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_hours', hours);
			nlapiLogExecution('DEBUG','gtz date2local is..', +date2utc);
		}**/

	  return true;
	}
	else
	{
		return true;
	}
}

function reCalcLine(type)
{
	if(type=='recmachcustrecord_sector_transaction')
	{
	  	//Start - Add all line values up to the Header Fields
		var livehourstotal =0.00;
		var positioninghourstotal = 0.00;
		var linesectortype = 0;
		var line_live = 0.00;
		var line_pos = 0.00;
		var flightdate = '';
		var returndate = '';
		var route = '';
		var routefrom = ''
		var routeto = '';
		var sectorcount = nlapiGetLineItemCount('recmachcustrecord_sector_transaction');
			for ( i = 1; i <= nlapiGetLineItemCount('recmachcustrecord_sector_transaction'); i++)
			{
				linesectortype = nlapiGetLineItemValue('recmachcustrecord_sector_transaction', 'custrecord_sector_type', i);
				//nlapiLogExecution('DEBUG','I is..', i);
				if(linesectortype == 1)//Positioning
				  {
					  line_pos = parseFloat(nlapiGetLineItemValue('recmachcustrecord_sector_transaction', 'custrecord_sector_hours', i));
					  positioninghourstotal += line_pos;
				  }
				if(linesectortype == 2)//Live
				  {
					  line_live = parseFloat(nlapiGetLineItemValue('recmachcustrecord_sector_transaction', 'custrecord_sector_hours', i));
					  livehourstotal += line_live;
				  }
				 if(i == 1)
				 {
					//nlapiLogExecution('DEBUG','I2 is..', i);
					flightdate = nlapiGetLineItemValue('recmachcustrecord_sector_transaction', 'custrecord_sector_departuredate', i);
					returndate = nlapiGetLineItemValue('recmachcustrecord_sector_transaction', 'custrecord_sector_arrivaldate', i);
					routefrom = nlapiGetLineItemText('recmachcustrecord_sector_transaction', 'custrecord_sector_departureiata', i);
					routeto = nlapiGetLineItemText('recmachcustrecord_sector_transaction', 'custrecord_sector_arrivaliata', i);
					route = routefrom.substring(0,3)+' - '+routeto.substring(0,3)+' - '+flightdate;
					nlapiSetFieldValue('custbody_fs_start_date', flightdate, false, false);
					nlapiSetFieldValue('custbody_flight_end_date', returndate, false, false);
					nlapiSetFieldValue('custbody_acc_route_date', route, false, false);
					
				 }
				 if(i == sectorcount)
				 {
				 	returndate = nlapiGetLineItemValue('recmachcustrecord_sector_transaction', 'custrecord_sector_arrivaldate', i);
					nlapiSetFieldValue('custbody_flight_end_date', returndate, false, false);
				 }
				
			}
			if(livehourstotal !== 'NaN')
			{
				nlapiSetFieldValue('custbody_fs_liveblockhours', livehourstotal, false, false);
			}
			else
			{
				nlapiSetFieldValue('custbody_fs_liveblockhours', 0, false, false);
			}
			if(positioninghourstotal !== 'NaN')
			{
				nlapiSetFieldValue('custbody_fs_poistionblockhours', positioninghourstotal, false, false);
			}
			else
			{
				nlapiSetFieldValue('custbody_fs_poistionblockhours', 0, false, false);
			}
			if(sectorcount !== 'NaN')
			{
				nlapiSetFieldValue('custbody_fs_noofsectors', sectorcount, false, false);
			}
			else
			{
				nlapiSetFieldValue('custbody_fs_noofsectors', 0, false, false);
			}
			//End - Add all line values up to the Header Fields
	}
		  
}

function saveRecord(type)
{
	var projectedTotal = nlapiGetFieldValue('projectedtotal');
	if(projectedTotal == '0.00')
	{
		alert('Please enter a valid Projected Total');
		return false;
	}
	else
	{
		return true;
	}
}

function postSourcing(type, name)
{
	if(name == 'custbody_acc_chx_comparerfqsin')
		{
			var convertCurrency = nlapiGetFieldValue('custbody_acc_chx_comparerfqsin');
			var convertCurrencyTxt = nlapiGetFieldText('custbody_acc_chx_comparerfqsin');
			var lineQuotePrice = 0.00;
			var lineQuoteCost = 0.00;
			var lineQuoteMargin = 0.00;
			var lineCurrency = 0;
			var lineCostCurrency = 0;
			var lineCurrencyTxt = '';
			var lineMargin = 0.00;
			var lineConvertedPrice = 0.00;
			var lineConvertedCost = 0.00;
			var lineConvertedMargin = 0.00;
			var lineSellPrice = 0.00;
			var lineSellConverted = 0.00;
			var lineSellCurrency = 0;
			var lineSellCurrenctTxt = '';
			var enqDepartment = nlapiGetFieldValue('department');
			//alert('Doing Compare Options In For '+enqDepartment);
			var toGBP = nlapiGetFieldValue('custbody_acc_chx_togbp');
			var toEUR = nlapiGetFieldValue('custbody_acc_chx_toeur');
			var toUSD = nlapiGetFieldValue('custbody_acc_chx_tousd');
			if(enqDepartment != '5')// Not Interiors Compare
				{
					var toCount = nlapiGetLineItemCount('recmachcustrecord_rfq_enquiry');
					nlapiLogExecution('DEBUG', 'Charter toCount', toCount);
					for ( r = 1; r <= toCount; r++)
					{
						nlapiLogExecution('DEBUG', 'r', r);
						nlapiSelectLineItem('recmachcustrecord_rfq_enquiry', r);
						lineQuotePrice = nlapiGetCurrentLineItemValue('recmachcustrecord_rfq_enquiry', 'custrecord_rfq_price');
						lineQuoteMargin = nlapiGetCurrentLineItemValue('recmachcustrecord_rfq_enquiry', 'custrecord_acc_rfq_margin');
						lineCurrencyTxt = nlapiGetCurrentLineItemValue('recmachcustrecord_rfq_enquiry', 'custrecord_rfq_currency');
						lineCurrency = nlapiGetCurrentLineItemValue('recmachcustrecord_rfq_enquiry', 'custrecord_rfq_currency');
						lineSellPrice = nlapiGetCurrentLineItemValue('recmachcustrecord_rfq_enquiry', 'custrecord_acc_rfq_totalsaleprice');
						lineSellCurrency = nlapiGetCurrentLineItemValue('recmachcustrecord_rfq_enquiry', 'custrecord_rfq_requotein');
						nlapiLogExecution('DEBUG', 'lineQuotePrice', lineQuotePrice);
						nlapiLogExecution('DEBUG', 'lineCurrency', lineCurrency);
						nlapiLogExecution('DEBUG', 'lineSellPrice', lineSellPrice);
						nlapiLogExecution('DEBUG', 'lineSellCurrency', lineSellCurrency);
						if(lineCurrency == 1 && lineQuotePrice > 0.00)//GBP
							{
								lineConvertedPrice = parseFloat(lineQuotePrice*toGBP).toFixed(2);
								lineConvertedMargin = parseFloat(lineQuoteMargin*toGBP).toFixed(2);
								nlapiSetCurrentLineItemValue('recmachcustrecord_rfq_enquiry','custrecord_rfq_convertedcost', lineConvertedPrice);
								//nlapiSetCurrentLineItemValue('recmachcustrecord_rfq_enquiry','custrecordacc_rfq_convertedmargin', lineConvertedMargin);
								//nlapiCommitLineItem('recmachcustrecord_rfq_enquiry');

							}
						if(lineSellCurrency == 1 && lineSellPrice > 0.00)//GBP
							{
								lineSellConverted = parseFloat(lineSellPrice*toGBP).toFixed(2);
								nlapiLogExecution('DEBUG', 'lineSellConverted', lineSellConverted);
								nlapiSetCurrentLineItemValue('recmachcustrecord_rfq_enquiry','custrecord_acc_rfq_convertedsell', lineSellConverted);
								//nlapiCommitLineItem('recmachcustrecord_rfq_enquiry');

							}
						if(lineCurrency == 2 && lineQuotePrice > 0.00)//USD
							{
								lineConvertedPrice = parseFloat(lineQuotePrice*toUSD).toFixed(2);
								lineConvertedMargin = parseFloat(lineQuoteMargin*toUSD).toFixed(2);
								nlapiSetCurrentLineItemValue('recmachcustrecord_rfq_enquiry','custrecord_rfq_convertedcost', lineConvertedPrice);
								//nlapiSetCurrentLineItemValue('recmachcustrecord_rfq_enquiry','custrecordacc_rfq_convertedmargin', lineConvertedMargin);
								//nlapiCommitLineItem('recmachcustrecord_rfq_enquiry');
							}
						if(lineSellCurrency == 2 && lineSellPrice > 0.00)//USD
							{
								lineSellConverted = parseFloat(lineSellPrice*toUSD).toFixed(2);
								nlapiLogExecution('DEBUG', 'lineSellConverted', lineSellConverted);
								nlapiSetCurrentLineItemValue('recmachcustrecord_rfq_enquiry','custrecord_acc_rfq_convertedsell', lineSellConverted);
								//nlapiCommitLineItem('recmachcustrecord_rfq_enquiry');

							}
						if(lineCurrency == 4 && lineQuotePrice > 0.00)//EUR
							{
								lineConvertedPrice = parseFloat(lineQuotePrice*toEUR).toFixed(2);
								lineConvertedMargin = parseFloat(lineQuoteMargin*toEUR).toFixed(2);
								nlapiSetCurrentLineItemValue('recmachcustrecord_rfq_enquiry','custrecord_rfq_convertedcost', lineConvertedPrice);
								//nlapiCommitLineItem('recmachcustrecord_rfq_enquiry');
							}
						if(lineSellCurrency == 4 && lineSellPrice > 0.00)//EUR
							{
								lineSellConverted = parseFloat(lineSellPrice*toEUR).toFixed(2);
								nlapiLogExecution('DEBUG', 'lineSellConverted', lineSellConverted);
								nlapiSetCurrentLineItemValue('recmachcustrecord_rfq_enquiry','custrecord_acc_rfq_convertedsell', lineSellConverted);
								//nlapiCommitLineItem('recmachcustrecord_rfq_enquiry');

							}
						nlapiCommitLineItem('recmachcustrecord_rfq_enquiry');
						//alert('This line Price is '+lineQuotePrice+lineCurrency);
					}
				}
			else//Interiors Compare
				{
					var toCount = nlapiGetLineItemCount('recmachcustrecord_irfq_enquiry');
					nlapiLogExecution('DEBUG', 'Interior toCount', toCount);
					for ( r = 1; r <= toCount; r++)
					{
						nlapiLogExecution('DEBUG', 'r', r);
						nlapiSelectLineItem('recmachcustrecord_irfq_enquiry', r);
						lineQuotePrice = nlapiGetCurrentLineItemValue('recmachcustrecord_irfq_enquiry', 'custrecord_irfq_selltotal');
						lineQuoteCost = nlapiGetCurrentLineItemValue('recmachcustrecord_irfq_enquiry', 'custrecord_irfq_buytotal');
						lineCurrencyTxt = nlapiGetCurrentLineItemValue('recmachcustrecord_irfq_enquiry', 'custrecord_irfq_sellcurrency');
						lineCurrency = nlapiGetCurrentLineItemValue('recmachcustrecord_irfq_enquiry', 'custrecord_irfq_sellcurrency');
						lineCostCurrency = nlapiGetCurrentLineItemValue('recmachcustrecord_irfq_enquiry', 'custrecord_irq_purchasecurrency');
						nlapiLogExecution('DEBUG', 'lineQuotePrice', lineQuotePrice);
						nlapiLogExecution('DEBUG', 'lineCurrency', lineCurrency);
						if(lineCurrency == 1 && lineQuotePrice > 0.00)//GBP
							{
								lineConvertedPrice = parseFloat(lineQuotePrice*toGBP).toFixed(2);
								lineConvertedMargin = parseFloat(lineQuoteMargin*toGBP).toFixed(2);
								lineConvertedCost = parseFloat(lineQuoteCost*toGBP).toFixed(2);
								nlapiSetCurrentLineItemValue('recmachcustrecord_irfq_enquiry','custrecord_io_sellcompare', lineConvertedPrice);
								nlapiSetCurrentLineItemValue('recmachcustrecord_irfq_enquiry','custrecord_io_buycompare', lineConvertedCost);
								nlapiCommitLineItem('recmachcustrecord_irfq_enquiry');

							}
						if(lineCurrency == 2 && lineQuotePrice > 0.00)//USD
							{
								lineConvertedPrice = parseFloat(lineQuotePrice*toUSD).toFixed(2);
								lineConvertedMargin = parseFloat(lineQuoteMargin*toUSD).toFixed(2);
								lineConvertedCost = parseFloat(lineQuoteCost*toUSD).toFixed(2);
								nlapiSetCurrentLineItemValue('recmachcustrecord_irfq_enquiry','custrecord_io_sellcompare', lineConvertedPrice);
								nlapiSetCurrentLineItemValue('recmachcustrecord_irfq_enquiry','custrecord_io_buycompare', lineConvertedCost);
								nlapiCommitLineItem('recmachcustrecord_irfq_enquiry');
							}
						if(lineCurrency == 4 && lineQuotePrice > 0.00)//EUR
							{
								lineConvertedPrice = parseFloat(lineQuotePrice*toEUR).toFixed(2);
								lineConvertedMargin = parseFloat(lineQuoteMargin*toEUR).toFixed(2);
								lineConvertedCost = parseFloat(lineQuoteCost*toEUR).toFixed(2);
								nlapiSetCurrentLineItemValue('recmachcustrecord_irfq_enquiry','custrecord_io_sellcompare', lineConvertedPrice);
								nlapiSetCurrentLineItemValue('recmachcustrecord_irfq_enquiry','custrecord_io_buycompare', lineConvertedCost);
								nlapiCommitLineItem('recmachcustrecord_irfq_enquiry');
							}
						//alert('This line Price is '+lineQuotePrice+lineCurrency);
					}
				}
			//var toCount = nlapiGetLineItemCount('recmachcustrecord_rfq_enquiry');
			//nlapiLogExecution('DEBUG', 'toCount', toCount);
			//alert('All '+toCount+' prices will be converted into '+convertCurrencyTxt);
			
			
			
		}
	if(name == 'custbody_acc_chx_cp_in')
		{
			var convertCurrency = nlapiGetFieldValue('custbody_acc_chx_cp_in');
			var convertCurrencyTxt = nlapiGetFieldText('custbody_acc_chx_cp_in');
			var lineQuotePrice = 0.00;
			var lineQuoteMargin = 0.00;
			var lineCurrency = 0;
			var lineCurrencyTxt = '';
			var lineMargin = 0.00;
			var lineConvertedPrice = 0.00;
			var lineConvertedMargin = 0.00;
			var toGBP = nlapiGetFieldValue('custbody_acc_chxp_togbp');
			var toEUR = nlapiGetFieldValue('custbody__acc_chxp_toeur');
			var toUSD = nlapiGetFieldValue('custbody_acc_chxp_tousd');
			var toCount = nlapiGetLineItemCount('recmachcustrecord_cpo_enquiry');
			nlapiLogExecution('DEBUG', 'toCount', toCount);
			//alert('All '+toCount+' prices will be converted into '+convertCurrencyTxt);
			for ( r = 1; r <= toCount; r++)
				{
					nlapiLogExecution('DEBUG', 'r', r);
					nlapiSelectLineItem('recmachcustrecord_cpo_enquiry', r);
					lineQuotePrice = nlapiGetCurrentLineItemValue('recmachcustrecord_cpo_enquiry', 'custrecord_cpo_totalsellprice');
					//lineQuoteMargin = nlapiGetCurrentLineItemValue('recmachcustrecord_cpo_enquiry', 'custrecord_acc_rfq_margin');
					lineCurrencyTxt = nlapiGetCurrentLineItemValue('recmachcustrecord_cpo_enquiry', 'custrecord_cpo_sellcurrency');
					lineCurrency = nlapiGetCurrentLineItemValue('recmachcustrecord_cpo_enquiry', 'custrecord_cpo_sellcurrency');
					nlapiLogExecution('DEBUG', 'lineQuotePrice', lineQuotePrice);
					nlapiLogExecution('DEBUG', 'lineCurrency', lineCurrency);
					if(lineCurrency == 1 && lineQuotePrice > 0.00)//GBP
						{
							lineConvertedPrice = parseFloat(lineQuotePrice*toGBP).toFixed(2);
							lineConvertedMargin = parseFloat(lineQuoteMargin*toGBP).toFixed(2);
							nlapiSetCurrentLineItemValue('recmachcustrecord_cpo_enquiry','custrecord_cpo_estsellconvert', lineConvertedPrice);
							//nlapiSetCurrentLineItemValue('recmachcustrecord_rfq_enquiry','custrecordacc_rfq_convertedmargin', lineConvertedMargin);
							nlapiCommitLineItem('recmachcustrecord_cpo_enquiry');
							
						}
					if(lineCurrency == 2 && lineQuotePrice > 0.00)//USD
						{
							lineConvertedPrice = parseFloat(lineQuotePrice*toUSD).toFixed(2);
							lineConvertedMargin = parseFloat(lineQuoteMargin*toUSD).toFixed(2);
							nlapiSetCurrentLineItemValue('recmachcustrecord_cpo_enquiry','custrecord_cpo_estsellconvert', lineConvertedPrice);
							//nlapiSetCurrentLineItemValue('recmachcustrecord_rfq_enquiry','custrecordacc_rfq_convertedmargin', lineConvertedMargin);
							nlapiCommitLineItem('recmachcustrecord_cpo_enquiry');
						}
					if(lineCurrency == 4 && lineQuotePrice > 0.00)//EUR
						{
							lineConvertedPrice = parseFloat(lineQuotePrice*toEUR).toFixed(2);
							lineConvertedMargin = parseFloat(lineQuoteMargin*toEUR).toFixed(2);
							nlapiSetCurrentLineItemValue('recmachcustrecord_cpo_enquiry','custrecord_cpo_estsellconvert', lineConvertedPrice);
							//nlapiSetCurrentLineItemValue('recmachcustrecord_rfq_enquiry','custrecordacc_rfq_convertedmargin', lineConvertedMargin);
							nlapiCommitLineItem('recmachcustrecord_cpo_enquiry');
						}
					//alert('This line Price is '+lineQuotePrice+lineCurrency);
				}
			
			
		}
	if(name == 'entity')
		{
		var currentUser = nlapiGetUser();
			var currentForm = nlapiGetFieldValue('customform');
			var context = nlapiGetContext();
			var userDeptId = context.getDepartment();
			nlapiSetFieldValue('class', 5, false, false);
			//nlapiSetFieldValue('projectedtotal', 1000, true, true);
			nlapiLogExecution('DEBUG', 'postSourcing: userDeptId is..', userDeptId);
		  	var stLineNum = nlapiGetLineItemCount('salesteam');
				nlapiLogExecution('DEBUG', 'stLineNum is..', stLineNum);
				if(stLineNum == 0)
					{
						nlapiLogExecution('DEBUG', 'stLineNum is..', stLineNum);
						nlapiSelectNewLineItem('salesteam');
						nlapiSetCurrentLineItemValue('salesteam','employee',currentUser); 
						nlapiSetCurrentLineItemValue('salesteam', 'contribution', 100);
						nlapiSetCurrentLineItemValue('salesteam', 'isprimary', 'T');
						nlapiCommitLineItem('salesteam');
						//return true;
					}
		}
	if(name == 'customform'|| name =='entity')
	{
        var userLocation = context.getLocation();
		var customForm = nlapiGetFieldValue('customform');
		nlapiLogExecution('DEBUG', 'postSourcing: userLocation is..', userLocation);
		//var department = nlapiGetDepartment();
    	// customer has been changed, reset the subsidiary to the user's subsidiary
    	// this will override the customer's primary subsidiary
    	var userSubsidiary = nlapiGetSubsidiary();
		nlapiLogExecution('DEBUG', 'postSourcing: userSubsidiary is..', userSubsidiary);
		if(customForm == 112)//ACMI - Long Term = 112 - ACMI Leasing : ACMI Long Term = 11
		{
			nlapiSetFieldValue('department', 11, false, false);
      		nlapiSetFieldValue('location',userLocation, false, false);
	    	nlapiSetFieldValue('subsidiary',userSubsidiary, true, true);
			return true;
		}
		if(customForm == 115)//ACMI - Short Term = 115 - ACMI Leasing : ACMI Short Term = 10
		{
			nlapiSetFieldValue('department', 10, false, false);
      		nlapiSetFieldValue('location',userLocation, false, false);
	    	nlapiSetFieldValue('subsidiary',userSubsidiary, true, true);
			return true;
		}
		if(customForm == 142)//Charter – Exec- Charter = 142 : Executive Charter = 3
		{
			nlapiSetFieldValue('department', 3, false, false);
      		nlapiSetFieldValue('location',userLocation, false, false);
	    	nlapiSetFieldValue('subsidiary',userSubsidiary, true, true);
			return true;
		}
		if(customForm == 141)//Charter – Group- Charter = 141 : Group Charter = 2
		{
			nlapiSetFieldValue('department', 2, false, false);
      		nlapiSetFieldValue('location',userLocation, false, false);
	    	nlapiSetFieldValue('subsidiary',userSubsidiary, true, true);
			return true;
		}
		if(customForm == 143)//Charter – Series- Charter = 143 : Series Charter = 9
		{
			nlapiSetFieldValue('department', 9, false, false);
      		nlapiSetFieldValue('location',userLocation, false, false);
	    	nlapiSetFieldValue('subsidiary',userSubsidiary, true, true);
			return true;
		}
		if(customForm == 144)//Charter – Shuttle = 144 - Corporate Shuttle = 4
		{
			nlapiSetFieldValue('department', 4, false, false);
      		nlapiSetFieldValue('location',userLocation, false, false);
	    	nlapiSetFieldValue('subsidiary',userSubsidiary, true, true);
			return true;
		}
		if(customForm == 109)//Interiors Enquiry = 109 - Interiors = 5
		{
			nlapiSetFieldValue('department', 5, false, false);
      		nlapiSetFieldValue('location',userLocation, false, false);
	    	nlapiSetFieldValue('subsidiary',userSubsidiary, true, true);
		}
		return true;
	}
	else
	{
		return true;
	}
}

function validate_Field(type, name)// Actions run when a field is being validated
 {
	 //alert('Type: '+type+' Name: '+name);
	 //Set Arrival Date to be the same as Departure Date
	 if(type == 'recmachcustrecord_sector_transaction' && name == 'custrecord_sector_departuredate')
	 {
		var depDate = nlapiGetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_departuredate');
		nlapiSetCurrentLineItemValue('recmachcustrecord_sector_transaction', 'custrecord_sector_arrivaldate', depDate, false, false);
		//nlapiSetCurrentLineItemValue('recmachcustrecord_sector_transaction', 'custrecord_sector_arrivaltime', '00:00', false, false);
        return true;
	 } 
	return true;
 }

function fieldChanged(type, name, linenum)
{
	/**if(name == 'custrecord_sector_departuredate')
		{
		var date1val = nlapiGetCurrentLineItemValue('recmachcustrecord_sector_transaction', 'custrecord_sector_departuredate');
		var flightStartDate = nlapiGetFieldValue('custbody_fs_start_date');
			if(flightStartDate && flightStartDate > date1val)
				{
					alert('This sector cannot depart before the Flight Start Date');
					return false;
				}
		}
	if(name == 'custrecord_sector_arrivaldate' | name == 'custrecord_sector_arrutcdt')
		{
		var date1val = nlapiGetCurrentLineItemValue('recmachcustrecord_sector_transaction', 'custrecord_sector_departuredate');
		var date2val = nlapiGetCurrentLineItemValue('recmachcustrecord_sector_transaction', 'custrecord_sector_arrivaldate');
		var dt1 = nlapiGetCurrentLineItemValue('recmachcustrecord_sector_transaction', 'custrecord_sector_deputcdt');
		var dt2 = nlapiGetCurrentLineItemValue('recmachcustrecord_sector_transaction', 'custrecord_sector_arrutcdt');
		var date1 = nlapiStringToDate(date1val+' '+dt1);
		var date2 = nlapiStringToDate(date2val+' '+dt2);
		if(date1 > date2)
			{
				if(dt1 != '0:00' && dt2 != '0:00')
					{
						var arrConf = confirm('Your Departure is before your Arrival. Are you sure?');
				//nlapiSetCurrentLineItemValue('recmachcustrecord_sector_transaction', 'custrecord_sector_arrivaldate', date1);
				return false;
					}
				
				else
					{
						return true;
					}
			}
		}
	if(name == 'custrecord_sector_deputcdt')//Calc Depart Local From UTC
		{
			var departFrom = nlapiGetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_departureiata');
			var departUTC = nlapiGetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_deputcdt');
			if(departFrom && departUTC != '0:00')
				{
					//alert('Working Departure Local from UTC');
					var departFromTZ = parseInt(nlapiLookupField('customrecord_acc_airport', departFrom, 'custrecord_ap_utcplusminus'));
					var departUTCNum = parseInt(departUTC.substring(0,2));
					var departUTCMins = departUTC.slice(-2);
						departUTCNum = (parseInt(departUTCNum*1)+departFromTZ);
						//alert(departUTCNum);
					var departUTCTxt = departUTCNum+':'+departUTCMins;
					nlapiSetCurrentLineItemValue('recmachcustrecord_sector_transaction', 'custrecord_sector_departuretime', departUTCTxt, false, false);
					
					return true;
				}
			return true;
		}
	if(name == 'custrecord_sector_departuretime')//Calc Depart UTC From Local
		{
			var departFrom = nlapiGetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_departureiata');
			var departLocal = nlapiGetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_departuretime');
			if(departFrom && departLocal != '0:00')
				{
					//alert('Working Departure UTC from Local');
					var departFromTZ = parseInt(nlapiLookupField('customrecord_acc_airport', departFrom, 'custrecord_ap_utcplusminus'));
					var departLocNum = parseInt(departLocal.substring(0,2));
					var departLocMins = departLocal.slice(-2);
						departLocNum = (parseInt(departLocNum*1)-departFromTZ);
						//alert(departUTCNum);
					var departLocTxt = departLocNum+':'+departLocMins;
					nlapiSetCurrentLineItemValue('recmachcustrecord_sector_transaction', 'custrecord_sector_deputcdt', departLocTxt, false, false);
					return true;
				}
			return true;
		}
	if(name == 'custrecord_sector_arrutcdt')//Calc Arrive Local From UTC
		{
			var arriveTo = nlapiGetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_arrivaliata');
			var arriveUTC = nlapiGetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_arrutcdt');
			if(arriveTo && arriveUTC != '0:00')
				{
					//alert('Working Arrive Local from UTC');
					var arriveToTZ = parseInt(nlapiLookupField('customrecord_acc_airport', arriveTo, 'custrecord_ap_utcplusminus'));
					var arriveUTCNum = parseInt(arriveUTC.substring(0,2));
					var arriveUTCMins = arriveUTC.slice(-2);
						arriveUTCNum = (parseInt(arriveUTCNum*1)+arriveToTZ);
						//alert(departUTCNum);
					var arriveUTCTxt = arriveUTCNum+':'+arriveUTCMins;
					nlapiSetCurrentLineItemValue('recmachcustrecord_sector_transaction', 'custrecord_sector_arrivaltime', arriveUTCTxt, false, false);
					return true;
				}
			return true;
		}
	if(name == 'custrecord_sector_arrivaltime')//Calc Arrive UTC From Local
		{
			var arriveTo = nlapiGetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_arrivaliata');
			var arriveLocal = nlapiGetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_arrivaltime');
			if(arriveTo && arriveLocal != '0:00')
				{
					//alert('Working Arrive UTC from Local');
					var arriveToTZ = parseInt(nlapiLookupField('customrecord_acc_airport', arriveTo, 'custrecord_ap_utcplusminus'));
					var arriveLocNum = parseInt(arriveLocal.substring(0,2));
					var arriveLocMins = arriveLocal.slice(-2);
						arriveLocNum = (parseInt(arriveLocNum*1)-arriveToTZ);
						//alert(departUTCNum);
					var arriveLocTxt = arriveLocNum+':'+arriveLocMins;
					nlapiSetCurrentLineItemValue('recmachcustrecord_sector_transaction', 'custrecord_sector_arrutcdt', arriveLocTxt, false, false);
					return true;
				}
			return true;
		}**/
  if(name == 'custrecord_sector_arrivaldate' | name == 'custrecord_sector_arrutcdt')
		{
		var date1val = nlapiGetCurrentLineItemValue('recmachcustrecord_sector_transaction', 'custrecord_sector_departuredate');
		var date2val = nlapiGetCurrentLineItemValue('recmachcustrecord_sector_transaction', 'custrecord_sector_arrivaldate');
		var departFrom = nlapiGetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_departureiata');
		var departUTC = nlapiGetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_deputcdt');
		var dt1 = nlapiGetCurrentLineItemValue('recmachcustrecord_sector_transaction', 'custrecord_sector_deputcdt');
		var dt2 = nlapiGetCurrentLineItemValue('recmachcustrecord_sector_transaction', 'custrecord_sector_arrutcdt');
		var date1 = nlapiStringToDate(date1val+' '+dt1);
		var date2 = nlapiStringToDate(date2val+' '+dt2);
		/**if(date1 > date2)
			{
				if(dt1 != '0:00' && dt2 != '0:00')
					{
						var arrConf = confirm('Your Departure is before your Arrival. Are you sure?');
				//nlapiSetCurrentLineItemValue('recmachcustrecord_sector_transaction', 'custrecord_sector_arrivaldate', date1);
				return false;
					}
				
				else
					{
						return true;
					}
			}*/
		}
	if(name == 'custrecord_sector_deputcdt')//Calc Depart Local From UTC
		{
			var departFrom = nlapiGetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_departureiata');
			var departUTC = nlapiGetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_deputcdt');
			nlapiLogExecution('DEBUG','departUTC',departUTC);
			var departUTCMins = departUTC.slice(-2);//minutes of the time entered
			nlapiLogExecution('DEBUG','departUTCMins',departUTCMins);
			if(departFrom && departUTC != '0:00')
				{
					var departFromTZ = parseInt(nlapiLookupField('customrecord_acc_airport', departFrom, 'custrecord_ap_utcplusminus'));
					var numDay=0;
					
					var departFromTZMins = nlapiLookupField('customrecord_acc_airport', departFrom, 'custrecord_ap_utcplusminus');
						departFromTZMins = parseFloat(departFromTZMins - departFromTZ);
						departFromTZMins = parseFloat(departFromTZMins * 60);
						nlapiLogExecution('DEBUG','departFromTZMins',departFromTZMins);
					//var departUTCMins = departUTC.slice(-2);//minutes of the time entered
						departUTCMins = parseFloat(+departUTCMins + departFromTZMins);
						nlapiLogExecution('DEBUG','departUTCMins - 2',departUTCMins);
                    var departUTCNum = parseInt(departUTC);
						departUTCNum = (parseInt(departUTCNum*1)+departFromTZ);
					//nlapiLogExecution('DEBUG','')
                  	if(departUTCMins <= 0)
                          {
                            departUTCMins = +60+departUTCMins;
                            departUTCNum = departUTCNum - 1;
                          }
                  	if(departUTCMins > 60)
                          {
                            departUTCMins = 60-departUTCMins;
                            departUTCNum = +departUTCNum + 1;
                          }
                  	if(departUTCMins == 60)
                          {
                            departUTCMins = 00;
                            departUTCNum = +departUTCNum + 1;
                          }
					if(departUTCNum < 0 && departFromTZ > 0)
						{
							departUTCNum = parseInt(24-departUTCNum);
						}
                   if(departUTCNum < 0 && departFromTZ <= 0)
						{
							departUTCNum = parseInt(24+departUTCNum);
						}
					if(departUTCNum > 24 && departFromTZ > 0)
						{
							departUTCNum = parseInt((departUTCNum*1)-24);
						}
                  	if(departUTCNum > 24 && departFromTZ <= 0)
						{
							departUTCNum = parseInt((departUTCNum*1)+24);
						}
                  	if(departUTCNum == 24)
                      {
                        departUTCNum = 0;
                      }
                  	
                  	//DLS Time Calculation 
                  	//
					var deptDate = nlapiGetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_departuredate');
					deptDate = nlapiDateToString(nlapiAddDays(nlapiStringToDate(deptDate),numDay));
					var deptYYYY = nlapiStringToDate(deptDate).getFullYear();
					var dls = isDayLightSaving(departFrom, departUTCNum, departUTCMins,deptDate, deptYYYY);
					
					if (dls == true)
						{
							departUTCNum = departUTCNum + 1;
							
							if(departUTCNum < 0 )	
								{
									departUTCNum = parseInt(24-departUTCNum);
								}
							
							if(departUTCNum > 24)	
								{
									departUTCNum = parseInt((departUTCNum*1)-24);
								}
							
							if(departUTCNum == 24)	
								{
									departUTCNum = 0;
								}
						}
					//
					//DLS Time Calculation 
					
					var departUTCTxt = departUTCNum+':'+departUTCMins;
					
					nlapiSetCurrentLineItemValue('recmachcustrecord_sector_transaction', 'custrecord_sector_departuretime', departUTCTxt, false, false);
					
					return true;
				}
			return true;
		}
	if(name == 'custrecord_sector_departuretime')//Calc Depart UTC From Local
		{
			var departFrom = nlapiGetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_departureiata');
			var departLocal = nlapiGetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_departuretime');
			nlapiLogExecution('DEBUG','departLocal',departLocal);
			var departLocalMins = departLocal.slice(-2);//minutes of the time entered
			nlapiLogExecution('DEBUG','departLocalMins',departLocalMins);
			if(departFrom && departLocal != '0:00')
				{
					var numDay=0;
				
					var departFromTZ = parseInt(nlapiLookupField('customrecord_acc_airport', departFrom, 'custrecord_ap_utcplusminus'));
					var departFromTZMins = nlapiLookupField('customrecord_acc_airport', departFrom, 'custrecord_ap_utcplusminus');
						departFromTZMins = parseFloat(departFromTZMins - departFromTZ);
						departFromTZMins = parseFloat(departFromTZMins * 60);
						nlapiLogExecution('DEBUG','departFromTZMins',departFromTZMins);
					//var departUTCMins = departUTC.slice(-2);//minutes of the time entered
						departLocalMins = parseFloat(+departLocalMins + departFromTZMins);
						nlapiLogExecution('DEBUG','departLocalMins - 2',departLocalMins);
                    var departLocalNum = parseInt(departLocal);
						nlapiLogExecution('DEBUG','departLocalNum 1',departLocalNum);
						departLocalNum = (parseInt(departLocalNum*1)-departFromTZ);
						nlapiLogExecution('DEBUG','departLocalNum 2',departLocalNum);
					//nlapiLogExecution('DEBUG','')
                  	if(departLocalMins < 00)
                          {
                            departLocalMins = +60+departLocalMins;
                            //departLocalNum = departLocalNum - 1;
                          }
                  	if(departLocalMins > 60)
                          {
                            departLocalMins = 60-departLocalMins;
                            //departLocalNum = +departLocalNum + 1;
                          }
                  	if(departLocalMins == 60)
                          {
                            departLocalMins = 00;
                            //departLocalNum = +departLocalNum + 1;
                          }
					if(departLocalNum < 0 && departFromTZ > 0)
						{
							departLocalNum = parseInt(24+departLocalNum);    //CSG changed - to +
						}
                   if(departLocalNum < 0 && departFromTZ <= 0)
						{
							departLocalNum = parseInt(24-departLocalNum);
						}
					if(departLocalNum > 24 && departFromTZ > 0)
						{
							departLocalNum = parseInt((departLocalNum*1)+24);
						}
                  	if(departLocalNum > 24 && departFromTZ <= 0)
						{
							departLocalNum = parseInt((departLocalNum*1)-24);
						}
                  	if(departLocalNum == 24)
                      {
                        departLocalNum = 0;
                      }
                  	
                  	//DLS Time Calculation 
                  	//
					var deptDate = nlapiGetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_departuredate');
					deptDate = nlapiDateToString(nlapiAddDays(nlapiStringToDate(deptDate),numDay));
					var deptYYYY = nlapiStringToDate(deptDate).getFullYear();
					var dls = isDayLightSaving(departFrom, departLocalNum, departLocalMins,deptDate, deptYYYY);
					
					if (dls == true)
						{
							departLocalNum = departLocalNum - 1;
							
							if(departLocalNum < 0 )	
								{
									departLocalNum = parseInt(24-departLocalNum);
								}
							
							if(departUTCNum > 24)	
								{
									departLocalNum = parseInt((departLocalNum*1)-24);
								}
							
							if(departLocalNum == 24)	
								{
									departLocalNum = 0;
								}
						}
					//
					//DLS Time Calculation              	
                  	
					var departLocTxt = departLocalNum+':'+departLocalMins;

					nlapiSetCurrentLineItemValue('recmachcustrecord_sector_transaction', 'custrecord_sector_deputcdt', departLocTxt, false, false);
					return true;
				}
			return true;
		}
	if(name == 'custrecord_sector_arrutcdt')//Calc Arrive Local From UTC
		{
			var arriveTo = nlapiGetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_arrivaliata');
			var arriveUTC = nlapiGetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_arrutcdt');
			nlapiLogExecution('DEBUG','arriveUTC',arriveUTC);
			var arriveUTCMins = arriveUTC.slice(-2);//minutes of the time entered
			nlapiLogExecution('DEBUG','arriveUTCMins',arriveUTCMins);
			if(arriveTo && arriveUTC != '0:00')
				{
					var arriveFromTZ = parseInt(nlapiLookupField('customrecord_acc_airport', arriveTo, 'custrecord_ap_utcplusminus'));
					var numDay=0;
					
					var arriveFromTZMins = nlapiLookupField('customrecord_acc_airport', arriveTo, 'custrecord_ap_utcplusminus');
						arriveFromTZMins = parseFloat(arriveFromTZMins - arriveFromTZ);
						arriveFromTZMins = parseFloat(arriveFromTZMins * 60);
						nlapiLogExecution('DEBUG','arriveFromTZMins',arriveFromTZMins);
					//var departUTCMins = departUTC.slice(-2);//minutes of the time entered
						arriveUTCMins = parseFloat(+arriveUTCMins + arriveFromTZMins);
						nlapiLogExecution('DEBUG','arriveUTCMins - 2',arriveUTCMins);
                    var arriveUTCNum = parseInt(arriveUTC);
						arriveUTCNum = (parseInt(arriveUTCNum*1)+arriveFromTZ);
					//nlapiLogExecution('DEBUG','')
                  	if(arriveUTCMins < 0)
                          {
                            arriveUTCMins = +60+arriveUTCMins;
                            arriveUTCNum = arriveUTCNum - 1;
                          }
                  	if(arriveUTCMins > 60)
                          {
                            arriveUTCMins = 60-arriveUTCMins;
                            arriveUTCNum = +arriveUTCNum + 1;
                          }
                  	if(arriveUTCMins == 60)
                          {
                            arriveUTCMins = 00;
                            arriveUTCNum = +arriveUTCNum + 1;
                          }
					if(arriveUTCNum < 0 && arriveFromTZ > 0)
						{
							arriveUTCNum = parseInt(24-arriveUTCNum);
						}
                   if(arriveUTCNum < 0 && arriveFromTZ <= 0)
						{
							arriveUTCNum = parseInt(24+arriveUTCNum);
						}
					if(arriveUTCNum > 24 && arriveFromTZ > 0)
						{
							arriveUTCNum = parseInt((arriveUTCNum*1)-24);
						}
                  	if(arriveUTCNum > 24 && arriveFromTZ <= 0)
						{
							arriveUTCNum = parseInt((arriveUTCNum*1)+24);
						}
                  	if(arriveUTCNum == 24)
                      {
                        arriveUTCNum = 0;
                      }
                  	
                 // DLS Time Calculation 
					var arrDate = nlapiGetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_arrivaldate');
					arrDate = nlapiDateToString(nlapiAddDays(nlapiStringToDate(arrDate),numDay));
					var arrYYYY = nlapiStringToDate(arrDate).getFullYear();
					nlapiLogExecution('DEBUG','** Test param arriveTo-',arriveTo+', arriveUTCNum-'+arriveUTCNum+', arriveUTCMins-'+arriveUTCMins+', deptYYYY-'+arrYYYY);
					var dls = isDayLightSaving(arriveTo, arriveUTCNum, arriveUTCMins,arrDate, arrYYYY);
					nlapiLogExecution('DEBUG','** Arrival Local From UTC dls-',dls);
					
					if (dls == true){
						arriveUTCNum = arriveUTCNum + 1;
						if(arriveUTCNum < 0 )	{
							//nlapiLogExecution('DEBUG',' a arriveUTCNum',arriveUTCNum);
							arriveUTCNum = parseInt(24-arriveUTCNum);
							//nlapiLogExecution('DEBUG',' a.1 arriveUTCNum',arriveUTCNum+', arriveFromTZ-'+arriveFromTZ);
						}
						if(arriveUTCNum > 24)	{
							//nlapiLogExecution('DEBUG',' b arriveUTCNum',arriveUTCNum);
							arriveUTCNum = parseInt((arriveUTCNum*1)-24);
							//nlapiLogExecution('DEBUG',' b.1 arriveUTCNum',arriveUTCNum+', arriveFromTZ-'+arriveFromTZ);
						}
						if(arriveUTCNum == 24)	{
							arriveUTCNum = 0;
						}
					}
					// DLS Time Calculation 
                  	
					var arriveUTCTxt = arriveUTCNum+':'+arriveUTCMins;
					//alert(arriveUTCTxt);
					nlapiSetCurrentLineItemValue('recmachcustrecord_sector_transaction', 'custrecord_sector_arrivaltime', arriveUTCTxt, false, false);
					return true;
				}
			return true;
		}
	if(name == 'custrecord_sector_arrivaltime')//Calc Arrive UTC From Local
		{
			var arriveTo = nlapiGetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_arrivaliata');
			var arriveLocal = nlapiGetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_arrivaltime');
			nlapiLogExecution('DEBUG','arriveLocal',arriveLocal);
			var arriveLocalMins = arriveLocal.slice(-2);//minutes of the time entered
			nlapiLogExecution('DEBUG','arriveLocalMins',arriveLocalMins);
			if(arriveTo && arriveLocal != '0:00')
				{
					var numDay=0;
				
					var arriveFromTZ = parseInt(nlapiLookupField('customrecord_acc_airport', arriveTo, 'custrecord_ap_utcplusminus'));
					var arriveFromTZMins = nlapiLookupField('customrecord_acc_airport', arriveTo, 'custrecord_ap_utcplusminus');
						arriveFromTZMins = parseFloat(arriveFromTZMins - arriveFromTZ);
						arriveFromTZMins = parseFloat(arriveFromTZMins * 60);
						nlapiLogExecution('DEBUG','arriveFromTZMins',arriveFromTZMins);
					//var departUTCMins = departUTC.slice(-2);//minutes of the time entered
						arriveLocalMins = parseFloat(+arriveLocalMins + arriveFromTZMins);
						nlapiLogExecution('DEBUG','arriveLocalMins - 2',arriveLocalMins);
                    var arriveLocalNum = parseInt(arriveLocal);
						arriveLocalNum = (parseInt(arriveLocalNum*1)-arriveFromTZ);
					//nlapiLogExecution('DEBUG','')
                  	if(arriveLocalMins < 0)
                          {
                            arriveLocalMins = +60+arriveLocalMins;
                            //arriveLocalNum = arriveLocalNum - 1;
                          }
                  	if(arriveLocalMins > 60)
                          {
                            arriveLocalMins = 60-arriveLocalMins;
                            //arriveLocalNum = +arriveLocalNum + 1;
                          }
                  	if(arriveLocalMins == 60)
                          {
                            arriveLocalMins = 00;
                            //arriveLocalNum = +arriveLocalNum + 1;
                          }
					if(arriveLocalNum < 0 && arriveFromTZ > 0)
						{
							arriveLocalNum = parseInt(24+arriveLocalNum);    //CSG changed - to +
						}
                   if(arriveLocalNum < 0 && arriveFromTZ <= 0)
						{
							arriveLocalNum = parseInt(24-arriveLocalNum);
						}
					if(arriveLocalNum > 24 && arriveFromTZ > 0)
						{
							arriveLocalNum = parseInt((arriveLocalNum*1)+24);
						}
                  	if(arriveLocalNum > 24 && arriveFromTZ <= 0)
						{
							arriveLocalNum = parseInt((arriveLocalNum*1)-24);
						}
                  	if(arriveLocalNum == 24)
                      {
                        arriveLocalNum = 0;
                      }
                  	
                  	// DLS Time Calculation 
                  	//
					var arrDate = nlapiGetCurrentLineItemValue('recmachcustrecord_sector_transaction','custrecord_sector_arrivaldate');
					arrDate = nlapiDateToString(nlapiAddDays(nlapiStringToDate(arrDate),numDay));
					var arrYYYY = nlapiStringToDate(arrDate).getFullYear();
					var dls = isDayLightSaving(arriveTo, arriveLocalNum, arriveLocalMins,arrDate, arrYYYY);
					
					if (dls == true)
						{
							arriveLocalNum = arriveLocalNum - 1;
							
							if(arriveLocalNum < 0 )	
								{
									arriveLocalNum = parseInt(24-arriveLocalNum);
								}
							
							if(arriveLocalNum > 24)	
								{
									arriveLocalNum = parseInt((arriveLocalNum*1)-24);
								}
							
							if(arriveLocalNum == 24)	
								{
									arriveLocalNum = 0;
								}
						}
					//
					// DLS Time Calculation 
                  	
                  	
                  	
					var arriveLocTxt = arriveLocalNum+':'+arriveLocalMins;
					//alert(arriveLocTxt);
					nlapiSetCurrentLineItemValue('recmachcustrecord_sector_transaction', 'custrecord_sector_arrutcdt', arriveLocTxt, false, false);
					return true;
				}
			return true;
		}
	if(name == 'custbody_int_economy_seats'|name == 'custbody_int_p_economy_seats'|name == 'custbody_int_business_seats'|name == 'custbody_int_first_seats')
	   {
	   		var economySeats = parseInt(nlapiGetFieldValue('custbody_int_economy_seats'));
		   	var premiumSeats = parseInt(nlapiGetFieldValue('custbody_int_p_economy_seats'));
			var businessSeats = parseInt(nlapiGetFieldValue('custbody_int_business_seats'));
			var firstSeats = parseInt(nlapiGetFieldValue('custbody_int_first_seats'));
		   	var totalSeats = +economySeats+premiumSeats+businessSeats+firstSeats;
		   	nlapiSetFieldValue('custbody_number_of_seats', totalSeats, false, false);
		   	return true;
	   }
	if(name == 'custbody_int_economy_sets'|name == 'custbody_int_p_economy_sets'|name == 'custbody_int_business_sets'|name == 'custbody_int_first_sets')
	   {
	   		var economySets = parseInt(nlapiGetFieldValue('custbody_int_economy_sets'));
		   	var premiumSets = parseInt(nlapiGetFieldValue('custbody_int_p_economy_sets'));
			var businessSets = parseInt(nlapiGetFieldValue('custbody_int_business_sets'));
			var firstSets = parseInt(nlapiGetFieldValue('custbody_int_first_sets'));
		   	var totalSets = +economySets+premiumSets+businessSets+firstSets;
		   	nlapiSetFieldValue('custbody_number_of_sets', totalSets, false, false);
		   	return true;
	   }
  
  if (name =='entity' || name == 'customform') {
    // customer has been changed, reset the subsidiary to the user's subsidiary
    // this will override the customer's primary subsidiary
    var userSubsidiary = nlapiGetSubsidiary();
    nlapiLogExecution('DEBUG','fieldChanged: userSubsidiary: ', userSubsidiary);
    nlapiSetFieldValue('subsidiary',userSubsidiary, true, true);
  }
  
  
  //check whether Sales Team has been edited, to prevent/allow the UE script to set the current user as the Broker
  	var mode = nlapiGetRecordId(); // if null then enquiry is being created
	if (type == 'salesteam' && mode == '') {
      // check if Sales Team line has been edited
      nlapiSetFieldValue('salesteamChanged','T',false,false);
      nlapiLogExecution('DEBUG','Sales Team', 'Line '+linenum+' changed in create mode');
    }
  	else if (type == 'salesteam')
    {
        // for testing only
	    nlapiLogExecution('DEBUG','Sales Team', 'Line '+linenum+' changed in edit mode');
    }

}
function isNullOrEmpty(strVal){return(strVal == undefined || strVal == null || strVal === "");}
function isDayLightSaving(fromAiport, UTCTime,UTCMins, depArrDate, dlsYYYY) {
	var dls = false;
	var dlsSearch = nlapiSearchRecord("customrecord_acc_day_light_saving",null,
			[
			 	["custrecord_acc_dls_airport","anyof",fromAiport], 
			 	"AND", 
				["custrecord_acc_dls_year","equalto",dlsYYYY], 
				"AND", 
				["custrecord_acc_dls_required","is","T"]
			], 
			[
			 	new nlobjSearchColumn("custrecord_acc_dls_airport"), 
			 	new nlobjSearchColumn("custrecord_acc_dls_year"), 
			 	new nlobjSearchColumn("custrecord_acc_dls_start_date"), 
			 	new nlobjSearchColumn("custrecord_acc_dls_end_date"), 
			 	new nlobjSearchColumn("custrecord_acc_dls_start_time"), 
			 	new nlobjSearchColumn("custrecord_acc_dls_end_time"), 
			 	new nlobjSearchColumn("custrecord_acc_dls_required")
			]
		);
	if(!isNullOrEmpty(dlsSearch)) {
			
			var dslAirport   = dlsSearch[0].getValue('custrecord_acc_dls_airport');
			var dslYYYY      = dlsSearch[0].getValue('custrecord_acc_dls_year');
			var dslStDate    = dlsSearch[0].getValue('custrecord_acc_dls_start_date');
			var dslEdDate    = dlsSearch[0].getValue('custrecord_acc_dls_end_date');
			var dslStTime    = dlsSearch[0].getValue('custrecord_acc_dls_start_time');
			var dslEdTime    = dlsSearch[0].getValue('custrecord_acc_dls_start_time');
						
			var depArrUTCInMins = parseInt(UTCTime) * 60 + parseInt(UTCMins);
			var dslStInMins  = parseInt(dslStTime) * 60 + parseInt(dslStTime.slice(-2));
			var dslEdInMins  = parseInt(dslEdTime) * 60 + parseInt(dslEdTime.slice(-2));
			if (nlapiStringToDate(depArrDate) > nlapiStringToDate(dslStDate) && nlapiStringToDate(depArrDate) < nlapiStringToDate(dslEdDate)){
				dls = true;
				//nlapiLogExecution('DEBUG', ' @@ 1 dsl-',dls);
			}else if (depArrDate == dslStDate && depArrUTCInMins > dslStInMins ){
				dls = true;
				//nlapiLogExecution('DEBUG', ' @@ 2 dsl-',dls);
			}else if (depArrDate == dslEdDate && depArrUTCInMins < dslEdInMins ){
				dls = true;
				//nlapiLogExecution('DEBUG', ' @@ 3 dsl-',dls);
			}
						
			//nlapiLogExecution('DEBUG', 'dep utc hh-',parseInt(UTCTime)+', dep utc mm-'+UTCMins+', depArrUTCInMins-'+depArrUTCInMins+', dslStInMins-'+dslStInMins);
			//nlapiLogExecution('DEBUG','departFrom',departFrom+', deptDate-'+deptDate+', deptYYYY-'+deptYYYY);
			//nlapiLogExecution('DEBUG','dslAirport',dslAirport+', dslYYYY-'+dslYYYY+', dslStDate-'+dslStDate+', dslEdDate-'+dslEdDate+', dslStTime-'+dslStTime+', dslEdTime-'+dslEdTime+', dls-'+dls);
	}	
	return dls;
}