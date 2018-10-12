/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       12 Jul 2017     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function checkAssemblyBeforeLoad(type, form, request)
{
	if (type == 'edit')
	{
		var itemSublist = form.getSubList('item');
		
		if(itemSublist)
			{
				itemSublist.addButton('custpage_but_chk_assm', 'Check Assemblies', 'libCheckAssembly()');
			}
	}
	
	if (type == 'view')
		{
			var itemCount = nlapiGetLineItemCount('item');
			var hasAssemblies = false;
			
			for (var int = 1; int <= itemCount; int++) 
				{
					var itemType = nlapiGetLineItemValue('item', 'itemtype', int);
					
					if(itemType == 'Assembly')
						{
							hasAssemblies = true;
							break;
						}
				}
			
			if(hasAssemblies)
				{
					form.setScript('customscript_bbs_chk_assm_global');
					form.addButton('custpage_but_chk_assm', 'Check Assemblies', 'gblCheckAssembly()');
				}
		}
}

function checkAssemblyAfterSubmit(type)
{
	if (type == 'edit' || type == 'create')
	{
		var salesId = nlapiGetRecordId();
		var params = new Array();
		
		params['salesorderid'] = salesId;
		params['mode'] = 'showmenu';
		nlapiSetRedirectURL('SUITELET', 'customscript_bbs_chk_assm_suitelet', 'customdeploy_bbs_chk_assm_suitelet', null, params);
	}
	
	
}