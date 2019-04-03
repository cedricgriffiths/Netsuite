
var topLevelAssemblyId = '14628';

var bomList = new Array();
var lineNo = Number(0);
var level = Number(1);
var componentSummary = {};

explodeBom(topLevelAssemblyId, bomList, componentSummary, level);

var y = componentSummary;
var z = bomList;


function explodeBom(topLevelAssemblyId, bomList, componentSummary, level)
{
	var assemblyRecord = nlapiLoadRecord('assemblyitem', topLevelAssemblyId);
	
	var memberCount = assemblyRecord.getLineItemCount('member');
	
	for (var int = 1; int <= memberCount; int++) 
	{
		var memberItem = assemblyRecord.getLineItemValue('member', 'item', int);
		var memberItemText = assemblyRecord.getLineItemText('member', 'item', int);
		var memberDesc = assemblyRecord.getLineItemValue('member', 'memberdescr', int);
		var memberUnit = assemblyRecord.getLineItemValue('member', 'memberunit', int);
		var memberQty = assemblyRecord.getLineItemValue('member', 'quantity', int);
		var memberType = assemblyRecord.getLineItemValue('member', 'sitemtype', int);
		var memberSource = assemblyRecord.getLineItemValue('member', 'itemsource', int);

		var lineData = [level,memberItem,memberItemText,memberDesc,memberUnit,memberQty,memberType,memberSource];
		
		bomList.push(lineData);
		
		if(!componentSummary[memberItem])
			{
				componentSummary[memberItem] = [memberItem,memberItemText,memberQty];
			}
		else
			{
				componentSummary[memberItem][2] = componentSummary[memberItem][2] + memberQty;
			}
		
		if(memberType == 'Assembly')
			{
				explodeBom(memberItem, bomList, componentSummary, level + 1);
			}
	}
}

