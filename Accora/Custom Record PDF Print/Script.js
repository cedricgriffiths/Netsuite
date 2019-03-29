/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       29 Mar 2019     cedricgriffiths
 *
 */

var recordId = '3500';

var customRecord = nlapiLoadRecord('customrecord_acc_nonconformity', recordId);

var customrecord_acc_nonconformitySearch = nlapiSearchRecord("customrecord_acc_nonconformity",null,
		[
		   ["internalid","anyof",recordId]
		], 
		[
		   new nlobjSearchColumn("author","userNotes",null), 
		   new nlobjSearchColumn("company","userNotes",null), 
		   new nlobjSearchColumn("notedate","userNotes",null), 
		   new nlobjSearchColumn("direction","userNotes",null), 
		   new nlobjSearchColumn("externalid","userNotes",null), 
		   new nlobjSearchColumn("internalid","userNotes",null), 
		   new nlobjSearchColumn("note","userNotes",null), 
		   new nlobjSearchColumn("title","userNotes",null), 
		   new nlobjSearchColumn("notetype","userNotes",null)
		]
		);
var internalIds = [];

for (var int = 0; int < customrecord_acc_nonconformitySearch.length; int++) 
{
	internalIds.push(customrecord_acc_nonconformitySearch[int].getValue("internalid","userNotes"));
}

var noteSearch = nlapiSearchRecord("note", null
		[
		   ["internalid","anyof",internalIds]
		], 
		[
		   new nlobjSearchColumn("author").setSort(false), 
		   new nlobjSearchColumn("company"), 
		   new nlobjSearchColumn("notedate"), 
		   new nlobjSearchColumn("direction"), 
		   new nlobjSearchColumn("externalid"), 
		   new nlobjSearchColumn("internalid"), 
		   new nlobjSearchColumn("note"), 
		   new nlobjSearchColumn("title"), 
		   new nlobjSearchColumn("notetype")
		]
		);

var templateFile = nlapiLoadFile('1402905');
var templateContents = templateFile.getValue();

var renderer = nlapiCreateTemplateRenderer();

renderer.setTemplate(templateContents);
renderer.addRecord('record', customRecord);
renderer.addSearchResults('searchnotes', noteSearch);

var xml = renderer.renderToString();

var pdfFile = nlapiXMLToPDF(xml);
pdfFile.setName('BBSTestPDF.pdf');
pdfFile.setFolder('-15');

var fileId = nlapiSubmitFile(pdfFile);

var z = '';

