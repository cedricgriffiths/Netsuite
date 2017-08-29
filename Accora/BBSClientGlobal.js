/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       21 Aug 2017     cedricgriffiths
 *
 */
function glbExportOrderAck()
{
	libExportOrderAck();
}

function glbExportInvoice()
{
	libExportDSSI('I');	
}

function glbExportCredit()
{
	libExportDSSI('C');	
}