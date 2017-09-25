/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */


define(['N/record','N/ui/dialog'],

function(record, dialog) 
{
	var DIALOGMODULE = dialog;
    var IS_CONFIRMED; //This global is used to detect if user has pressed "OK" in the prompt box

    function saveRecord(scriptContext) 
    {
    	//debugger;
    	
    	var customerActions = '';
    	
    	var currentRec = scriptContext.currentRecord;
	      
      	var customerId = currentRec.getValue({fieldId: 'entity'});
      	
      	if (customerId != null && customerId != '')
      		{
      			var custRecord = record.load({type: record.Type.CUSTOMER, id: customerId });
      
      			if (custRecord)
      			{	
      				customerActions = custRecord.getValue({fieldId: 'custentity_bbs_customer_actions'});
      			}
      		}
      	
    	if(IS_CONFIRMED || (customerActions == null || customerActions == ''))
    	  	{
    	  		return true;
    	  	}
    	else
    	  	{
	      		var options = {
		      				title: "Confirmation Required",
		      				message: customerActions
		      					};
		  
		      	function success(result) 
		      	{ 
		      		if (result)
		      			{
		      				IS_CONFIRMED = true;
		      				getNLMultiButtonByName('multibutton_submitter').onMainButtonClick(this); //NS Hack to call simulate user clicking Save Button
		      			}
		      	}

		      	dialog.confirm(options).then(success);

    	  	}
    }

    return 	{
        		saveRecord: saveRecord
    		};
});
