/**
 * Module Description
 * 
 * Version Date Author Remarks 1.00 29 Mar 2016 cedric
 * 
 */

function SalesOrderInit()
{
	LibSalesOrderInit();
}

function SalesFieldChanged(type, name, linenum)
{
	LibProcessFieldChanges(type, name, linenum, 'porate');
}