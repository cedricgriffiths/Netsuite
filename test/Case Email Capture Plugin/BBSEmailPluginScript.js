/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       05 Jan 2017     cedricgriffiths
 *
 */
function process(email)
{
	
	var caseNumber = email.getSubject();
	
	if (caseNumber != null && caseNumber != '')
		{
		
		//nlapiLogExecution('DEBUG', 'Case Number Is', caseNumber);
		
		var filters = new Array();
		filters[0] = new nlobjSearchFilter('casenumber', null, 'is', caseNumber);
		
		var columns = new Array();
		columns[0] = new nlobjSearchColumn('title');
		
		var results = nlapiSearchRecord('supportcase', null, filters, columns);
		
		try
		{
			if (results != null && results.length> 0 ) 
			{
				
				var caseId = results[0].getId();
				
				if (caseId != null && caseId != '')
				{
					
					//nlapiLogExecution('DEBUG', 'Case Id', caseId);
					
					var caseRecord = nlapiLoadRecord('supportcase', caseId);
					
					if (caseRecord != null)
					{
						
						var author = caseRecord.getFieldValue('company');
						
						var newMessage = nlapiCreateRecord('message');
						
						newMessage.setFieldValue('activity', caseId);
						newMessage.setFieldValue('author', author);
						newMessage.setFieldValue('authoremail', email.getFrom());
						newMessage.setFieldValue('emailed', 'T');
						newMessage.setFieldValue('incoming', 'T');
						newMessage.setFieldValue('message', email.getTextBody());
						newMessage.setFieldValue('recipientemail', email.getFrom());
						newMessage.setFieldValue('subject', 'forwarded case information');
						
						
						var attachFiles = email.getAttachments();
						
						//Have we got any attachments?
						//
						if (attachFiles.length > 0)
						{
							
							//Construct the folder name to hold the attachments
							//
							var today = new Date();
							var folderName = today.getDay().toString() + "-" + (today.getMonth() + 1).toString() + "-" + today.getFullYear().toString() + "_Message_" + today.getUTCHours().toString() +
							today.getUTCMinutes().toString() + today.getUTCSeconds().toString() + today.getUTCMilliseconds().toString();
							
							//Create the folder
							//
							var folderRecord = nlapiCreateRecord('folder');
							
							folderRecord.setFieldValue('parent', '117615');
							folderRecord.setFieldValue('name', folderName);
							
							var folderId = nlapiSubmitRecord(folderRecord, true, false);
							
							
							//Loop through the attachments
							//
							for (var indexAtt in attachFiles)
							{
									var fileContent = attachFiles[indexAtt].getValue();
									var fileName = attachFiles[indexAtt].getName();
									var fileType = attachFiles[indexAtt].getType();
									
									if  (fileType == 'MISCBINARY')
									{
										fileType = 'PLAINTEXT';										
									}
	
									//Create the file
									//
									var fileObject = nlapiCreateFile(fileName, fileType, fileContent);
									
									fileObject.setFolder(folderId);
									
									var fileId = nlapiSubmitFile(fileObject);
									
									//Add the file to the sublist
									//
									newMessage.selectNewLineItem('mediaitem');
									newMessage.setCurrentLineItemValue('mediaitem', 'mediaitem', fileId);
									
									//Commit the media item
									//
									newMessage.commitLineItem('mediaitem');
							}
						}
						
						nlapiSubmitRecord(newMessage, true, false);
					}
				}
			}
		}
		catch(err)
		{
			nlapiLogExecution('ERROR', 'error', err.message);
		}
	}
}



function decode64(input) {
	var keyStr = "ABCDEFGHIJKLMNOP" +
    "QRSTUVWXYZabcdef" +
    "ghijklmnopqrstuv" +
    "wxyz0123456789+/" +
    "=";
	
   var output = "";
   var chr1, chr2, chr3 = "";
   var enc1, enc2, enc3, enc4 = "";
   var i = 0;

   // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
   var base64test = /[^A-Za-z0-9\+\/\=]/g;
   if (base64test.exec(input)) {
      alert("There were invalid base64 characters in the input text.\n" +
            "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
            "Expect errors in decoding.");
   }
   input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

   do {
      enc1 = keyStr.indexOf(input.charAt(i++));
      enc2 = keyStr.indexOf(input.charAt(i++));
      enc3 = keyStr.indexOf(input.charAt(i++));
      enc4 = keyStr.indexOf(input.charAt(i++));

      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;

      output = output + String.fromCharCode(chr1);

      if (enc3 != 64) {
         output = output + String.fromCharCode(chr2);
      }
      if (enc4 != 64) {
         output = output + String.fromCharCode(chr3);
      }

      chr1 = chr2 = chr3 = "";
      enc1 = enc2 = enc3 = enc4 = "";

   } while (i < input.length);

   return unescape(output);
}


