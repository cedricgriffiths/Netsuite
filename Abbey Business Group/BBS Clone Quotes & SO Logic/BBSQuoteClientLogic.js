/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       10 Feb 2017     cedricgriffiths
 *
 */

function QuoteFieldChanged(type, name, linenum)
{
	LibProcessFieldChanges(type, name, linenum, 'custcol_bbs_quote_cost', false);
}