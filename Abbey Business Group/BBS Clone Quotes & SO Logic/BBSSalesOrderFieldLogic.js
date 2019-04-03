/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       14 Feb 2017     cedricgriffiths
 *
 */
function SalesOrderFieldChanged(type, name, linenum)
{
	LibProcessFieldChanges(type, name, linenum, 'custcol_bbs_quote_cost', true);

}
