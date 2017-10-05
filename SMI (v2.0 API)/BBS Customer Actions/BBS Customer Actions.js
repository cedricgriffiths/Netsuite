/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */


define(['N/record','N/ui/dialog'],

function(record, dialog) 
{
	var DIALOGMODULE = dialog;
	//This global is used to detect if user has pressed "OK" in the prompt box
	//
	var IS_CONFIRMED; 

	//Function called on record save
	//
    function saveRecord(scriptContext) 
    {
    	var customerActions = '';
    	
    	//Get the current record
    	//
    	var currentRec = scriptContext.currentRecord;
	    
    	//Get the customer id
    	//
      	var customerId = currentRec.getValue({fieldId: 'entity'});
      	
      	//Check to see if we have a customer
      	//
      	if (customerId != null && customerId != '')
      		{
      			//Load the customer record
      			//
      			var custRecord = record.load({type: record.Type.CUSTOMER, id: customerId });
      
      			//Check to see if we have a customer record
      			//
      			if (custRecord)
      			{	
      				//Get the customer actions text
      				//
      				customerActions = custRecord.getValue({fieldId: 'custentity_bbs_customer_actions'});
      			}
      		}
      	
      	//If we have clicked ok on the dialogue or there are no customer actions, then return true
      	//
    	if(IS_CONFIRMED || (customerActions == null || customerActions == ''))
    	  	{
    	  		return true;
    	  	}
    	else
    	  	{
    			//Set up the options for the dialogue box
    			//
	      		var options = {
		      				title: "Confirmation Required",
		      				message: customerActions
		      					};
		  
	      		//Function that is called when the dialogue box completes
	      		//
		      	function success(result) 
		      	{ 
		      		//See if we have clicked ok in the dialogue
		      		//
		      		if (result)
		      			{
		      				//Update the global variable to show that we have clicked ok
		      				//
		      				IS_CONFIRMED = true;
		      				
		      				//Spoof pressing the save button on the form
		      				//
		      				getNLMultiButtonByName('multibutton_submitter').onMainButtonClick(this); 
		      			}
		      	}

		      	//Display the dialogue box
		      	//
		      	dialog.confirm(options).then(success);

    	  	}
    }

    return 	{
        		saveRecord: saveRecord
    		};
});
