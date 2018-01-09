/**
* Implementation of a simple setup assistant with support for multiple setup steps and sequential or ad-hoc step traversal.
* State is managed throughout the life of the user's session but is not persisted across sessions. Doing so would
* require writing this information to a custom record.
*
* @param request request object
* @param response response object
*/
function showAssistant(request, response)
{
   /* first create assistant object and define its steps. */
   var assistant = nlapiCreateAssistant("Small Business Setup Assistant", true);
   assistant.setOrdered( true );
   nlapiLogExecution( 'DEBUG', "Create Assistant ", "Assistant Created" );
 
   assistant.addStep('companyinformation', 'Company Information').setHelpText("Setup your<b>important</b> company information in the fields below.");
   assistant.addStep('companypreferences', 'Company Preferences').setHelpText("Setup your<b>important</b> company preferences in the fields below.");
   assistant.addStep('enterlocations', 'Enter Locations').setHelpText("Add Locations to your account.You can create a location record for each of your company's locations. Then you can track employeesand transactions by location..");
   assistant.addStep('enteremployees', 'Enter Employees').setHelpText("Enter yourcompany employees.");
   assistant.addStep('importrecords', 'Import Records').setHelpText("Import your initial company data.");
   assistant.addStep('configurepricing', 'Configure Pricing' ).setHelpText("Configure your item pricing.");
   assistant.addStep('summary', 'Summary Information').setHelpText("Summary of your AssistantWork.<br> You have made the following choices to configure your NetSuite account.");
 
 
   /* handle page load (GET) requests. */
   if (request.getMethod() == 'GET')
   {
      /*.Check whether the assistant is finished */
      if ( !assistant.isFinished() )
      {
         // If initial step, set the Splash page and set the intial step
          if ( assistant.getCurrentStep() == null )
                     {
            assistant.setCurrentStep(assistant.getStep( "companyinformation") );

            assistant.setSplash("Welcome to the Small Business Setup Assistant!", "<b>Whatyou'll be doing</b><br>The Small Business Setup Assistant will walk youthrough the process of configuring your NetSuite account for your initial use..","<b>When you finish</b><br>your account will be ready for you to use to run your business.");
         } 
         var step = assistant.getCurrentStep();
 
         // Build the page for a step by adding fields, field groups, and sublists to the assistant
         if (step.getName() == "companyinformation")
         {
            assistant.addField('orgtypelabel','label','What type of organization are you?').setLayoutType('startrow');
            assistant.addField('orgtype', 'radio','Business To Consumer','b2c').setLayoutType('midrow');
            assistant.addField('orgtype', 'radio','Business To Business','b2b').setLayoutType('midrow');
            assistant.addField('orgtype', 'radio','Non-Profit','nonprofit').setLayoutType('endrow');
            assistant.getField( 'orgtype', 'b2b' ).setDefaultValue( 'b2b' );
 
            assistant.addField('companysizelabel','label','How big is your organization?');
            assistant.addField('companysize', 'radio','Small (0-99 employees)', 's');
            assistant.addField('companysize', 'radio','Medium (100-999 employees)','m');
            assistant.addField('companysize', 'radio','Large (1000+ employees)','l'); 
 
            assistant.addFieldGroup("companyinfo", "Company Information");
            assistant.addField("companyname", "text", "Company Name", null,"companyinfo").setMandatory( true );
            assistant.addField("legalname", "text", "Legal Name", null, "companyinfo").setMandatory( true );
            assistant.addField("shiptoattention", "text", "Ship To Attention", null,"companyinfo").setMandatory( true );
            assistant.addField("address1", "text", "Address 1", null,"companyinfo").setLayoutType("normal", "startcol");
            assistant.addField("address2", "text", "Address 2", null, "companyinfo");
            assistant.addField("city", "text", "City", null, "companyinfo"); 
            assistant.getField("legalname").setHelpText("Enter a Legal Name if it differs from your company name");
            assistant.getField("shiptoattention").setHelpText("Enter the name of someone who can sign for packages or important documents. This is important because otherwise many package carriers will not deliver to your corporate address");
            assistant.addFieldGroup("taxinfo", "Tax Information").setCollapsible(true /* collapsable */,true /* collapsed by default */);
            assistant.addField("employeeidnumber", "text", "Employee Identification Number (EIN)",null, "taxinfo").setHelpText("Enter the EID provided to you by the state or federal government");
            assistant.addField("taxidnumber", "text", "Tax ID Number", null,"taxinfo").setHelpText("Enter the Tax ID number used when you file your payroll and sales taxes");
            assistant.addField("returnmailaddress", "textarea", "Return Mail Address", null,"taxinfo").setHelpText("In the rare event someone returns your products, enter the mailing address."); 
 
         }
 
         if (step.getName() == "companypreferences")
         {
            nlapiLogExecution( 'DEBUG', "Company Preferences ",  "Begin Creating Page" );
 
            assistant.addFieldGroup("companyprefs", "Company Preferences");
            var firstDayOfWeek = assistant.addField("firstdayofweek", "select", "First Day of Week",null, "companyprefs");
            var stateAbbrs = assistant.addField("abbreviatestates", "checkbox", "Use State Abbreviations in Addresses", null, "companyprefs");
            var customerMessage = assistant.addField("customerwelcomemessage", "text", "Customer Center Welcome Message", null, "companyprefs");
            customerMessage.setMandatory( true );
 
            assistant.addFieldGroup("accountingprefs", "Accounting Preferences").setCollapsible(true,true );
            var accountNumbers = assistant.addField("accountnumbers", "checkbox", "Use Account Numbers", null, "accountingprefs");
            var creditLimitDays = assistant.addField("credlimdays", "integer", "Days Overdue for Warning or Hold", null, "accountingprefs");
            var expenseAccount = assistant.addField("expenseaccount", "select", "Default Expense Account", 'account', "accountingprefs");
            customerMessage.setMandatory( true );
 
            assistant.addField('customertypelabel','label','Please Indicate Your Default Customer Type?' );
            assistant.addField( 'customertype', 'radio', 'Individual', 'i' );
            assistant.addField('customertype', 'radio', 'Company', 'c' );
 
            // get the select options for First Day of Week
            nlapiLogExecution( 'DEBUG', "Load Configuration ",  "Company Preferences" );
            var compPrefs = nlapiLoadConfiguration( 'companypreferences' );
 
            var firstDay = compPrefs.getField( 'FIRSTDAYOFWEEK' );
            nlapiLogExecution( 'DEBUG', "Create Day of Week Field ",  compPrefs.getFieldText('FIRSTDAYOFWEEK')  );
 
            try
            {
               var selectOptions = firstDay.getSelectOptions();
            }
            catch( error )
            {
               assistant.setError( error );
            }
 
            if( selectOptions != null)
            {
               nlapiLogExecution( 'DEBUG', "Have Select Options ",  selectOptions[0].getText() );
 
               // add the options to the UI field
               for (var i = 0; i < selectOptions.length; i++)
               {
                  firstDayOfWeek.addSelectOption( selectOptions[i].getId(),
                     selectOptions[i].getText() );
               }
            }
 
            // set the default values based on the product default
            stateAbbrs.setDefaultValue( compPrefs.getFieldValue( 'ABBREVIATESTATES' ) );
            customerMessage.setDefaultValue( compPrefs.getFieldValue('CUSTOMERWELCOMEMESSAGE' ) );
 
            
         }
         else if (step.getName() == "enterlocations")
         {
            var sublist = assistant.addSubList("locations", "inlineeditor", "Locations");
 
            sublist.addField("name", "text", "Name");
            sublist.addField("tranprefix", "text", "Transaction Prefix");
            sublist.addField("makeinventoryavailable", "checkbox", "Make Inventory Available");
            sublist.addField("makeinventoryavailablestore", "checkbox", "Make Inventory Available in Web Store");
 
            sublist.setUniqueField("name");
            sublist.setLineItemValue("name", 1, 'Sharnford');
            sublist.setLineItemValue("tranprefix", 1, 'SH');
            sublist.setLineItemValue("makeinventoryavailable", 1, 'T');
            sublist.setLineItemValue("makeinventoryavailablestore", 1, 'T');
            
         }
 
         else if (step.getName() == "enteremployees")
         {
            // get the host
            var host = request.getURL().substring(0, ( request.getURL().indexOf('.com') + 4) );
 
            assistant.addFieldGroup("enteremps", "Enter Employees");
            assistant.addField("employeecount", "integer", "Number of Employees in Company", null, "enteremps").setMandatory( true );
            assistant.addField("enterempslink", "url", "", null, "enteremps" ).setDisplayType( "inline" ).setLinkText( "Click Here to Enter Your Employees").setDefaultValue( host + getLinkoutURL( 'employee', 'record') );
         }
 
         else if (step.getName() == "importrecords")
         {
            var host = request.getURL().substring(0, ( request.getURL().indexOf('.com') + 4) );
 
            assistant.addFieldGroup("recordimport", "Import Data");
            assistant.addField("recordcount", "integer", "Number of Records to Import", null,"recordimport").setMandatory( true );
            assistant.addField("importlink", "url", "", null, "recordimport" ).setDisplayType( "inline" ).setLinkText( "Click Here to Import Your Data").setDefaultValue( host + getLinkoutURL( "/app/setup/assistants/nsimport/importassistant.nl" ) );
         }
 
         else if (step.getName() == "configurepricing")
         {
            var host = request.getURL().substring(0, ( request.getURL().indexOf('.com') + 4) );
 
            assistant.addFieldGroup("pricing", "Price Configuration");
            assistant.addField("itemcount", "integer", "Number of Items to Configure", null, "pricing").setMandatory( true );
 
 
         /* When users click the ‘Click Here to Configure Pricing' link, they will be taken to 
         * another custom assistant Suitelet that has a script ID of 47 and a deploy ID of 1. Note
         * that the code for the “link out” assistant is not provided in this sample.
         *
         * Notice the use of the getLinkoutURL helper function, which sets the URL 
         * customwhence parameter so that after users finish the with the “link out” assistant,
         * they will be redirected back to this (the originating) assistant.
         */  
            assistant.addField("importlink", "url", "", null, "pricing" ).setDisplayType( "inline").setLinkText( "Click Here to Configure Pricing").setDefaultValue( host + getLinkoutURL( "/app/site/hosting/scriptlet.nl?script=47&deploy=1" ) );
         }
 
         else if (step.getName() == "summary")
         {
 
            
            assistant.addFieldGroup("companysummary", "Company Definition Summary");
            assistant.addField('orgtypelabel','label','What type of organization are you?', null,'companysummary' );
            assistant.addField('orgtype', 'radio','Business To Consumer', 'b2c','companysummary' ).setDisplayType( 'inline');
            assistant.addField('orgtype', 'radio','Business To Business','b2b', 'companysummary' ).setDisplayType( 'inline');
            assistant.addField('orgtype', 'radio','Non-Profit','nonprofit', 'companysummary' ).setDisplayType( 'inline');
 
            assistant.addField('companysizelabel','label','How big is your organization?', null, 'companysummary' );
            assistant.addField('companysize', 'radio','Small (0-99 employees)', 's', 'companysummary' ).setDisplayType( 'inline');;
            assistant.addField('companysize', 'radio','Medium (100-999 employees)','m','companysummary' ).setDisplayType( 'inline');;
            assistant.addField('companysize', 'radio','Large (1000+ employees)','l','companysummary' ).setDisplayType( 'inline');; 
            assistant.addField("companyname", "text", "Company Name", null,"companysummary").setDisplayType( 'inline');
            assistant.addField("city", "text", "City", null, "companysummary").setDisplayType('inline'); 
            assistant.addField("abbreviatestates", "checkbox", "Use State Abbreviations in Addresses",null, "companysummary").setDisplayType( 'inline');
            assistant.addField("customerwelcomemessage", "text", "Customer Center Welcome Message", null, "companysummary").setDisplayType( 'inline');
 
 
            // get previously submitted steps
            var ciStep = assistant.getStep( 'companyinformation' );
            var cpStep = assistant.getStep( 'companypreferences' );
 
            // get field values from previously submitted steps
            assistant.getField( 'orgtype', 'b2b' ).setDefaultValue( ciStep.getFieldValue( 'orgtype' ) );
            assistant.getField( 'companysize', 's' ).setDefaultValue( ciStep.getFieldValue( 'companysize' ) );
            assistant.getField( 'companyname' ).setDefaultValue( ciStep.getFieldValue( 'companyname' ) );
            assistant.getField( 'city' ).setDefaultValue( ciStep.getFieldValue( 'city' ) );
            assistant.getField( 'abbreviatestates' ).setDefaultValue( cpStep.getFieldValue( 'abbreviatestates' ) );
            assistant.getField( 'customerwelcomemessage' ).setDefaultValue( cpStep.getFieldValue( 'customerwelcomemessage' ) );
            
         
         }
         
      } 
      response.writePage(assistant);
   }
   /* handle user submit (POST) requests. */
   else
   {
 
      assistant.setError( null );
 
      /* 1. if they clicked the finish button, mark setup as done and redirect to assistant page */
      if (assistant.getLastAction() == "finish")
      {
         assistant.setFinished( "You have completed the Small Business Setup Assistant." );
 
         assistant.sendRedirect( response );
      }
      /* 2. if they clicked the "cancel" button, take them to a different page (setup tab) altogether as
         appropriate. */
      else if (assistant.getLastAction() == "cancel")
      {
         nlapiSetRedirectURL('tasklink', "CARD_-10");
      }
      /* 3. For all other actions (next, back, jump), process the step and redirect to assistant page. */
      else 
      {
 
         if (assistant.getLastStep().getName() == "companyinformation" && assistant.getLastAction() == "next" ) 
         {
            // update the company information page
            var configCompInfo = nlapiLoadConfiguration( 'companyinformation' );
 
            configCompInfo.setFieldValue( 'city', request.getParameter( 'city' ) ) ;
 
            nlapiSubmitConfiguration( configCompInfo );
         }
 
         if (assistant.getLastStep().getName() == "companypreferences" && assistant.getLastAction() == "next" ) 
         {
            // update the company preferences page
            var configCompPref = nlapiLoadConfiguration( 'companypreferences' );
 
            configCompPref.setFieldValue( 'CUSTOMERWELCOMEMESSAGE',request.getParameter( 'customerwelcomemessage' ) );
 
            nlapiSubmitConfiguration( configCompPref );
 
            // update the accounting preferences pages
            var configAcctPref = nlapiLoadConfiguration( 'accountingpreferences' );
 
            configAcctPref.setFieldValue( 'CREDLIMDAYS', request.getParameter( 'credlimdays' ) );
 
            nlapiSubmitConfiguration( configAcctPref );
         }
 
         if (assistant.getLastStep().getName() == "enterlocations" && assistant.getLastAction() == "next" ) 
         {
            // create locations
 
            for (var i = 1; i <= request.getLineItemCount( 'locations'); i++)
            {
               locationRec = nlapiCreateRecord( 'location' );
            
               locationRec.setFieldValue( 'name', request.getLineItemValue( 'locations', 'name', i ) );
               locationRec.setFieldValue( 'tranprefix', request.getLineItemValue( 'locations','tranprefix', i ) );
               locationRec.setFieldValue( 'makeinventoryavailable', request.getLineItemValue('locations', 'makeinventoryavailable', i ) );
               locationRec.setFieldValue( 'makeinventoryavailablestore',request.getLineItemValue('locations', 'makeinventoryavailablestore', i ) );
 
               try
               {
                  // add a location to the account
                  nlapiSubmitRecord( locationRec );
               }
               catch( error )
               {
                  assistant.setError( error );
               }
            }
            
         }
         if( !assistant.hasError() )
            assistant.setCurrentStep( assistant.getNextStep() );
 
         assistant.sendRedirect( response );
 
      }
   }
}
 
function getLinkoutURL( redirect, type )
{
   var url = redirect;
 
   if ( type == "record" )
      url = nlapiResolveURL('record', redirect);
 
   url += url.indexOf('?') == -1 ? '?' : '&';
 
   var context = nlapiGetContext();
   url += 'customwhence='+ escape(nlapiResolveURL('suitelet',context.getScriptId(), context.getDeploymentId()))
 
   return url; 
 
} 