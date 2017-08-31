/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       09 Jan 2017     cedricgriffiths
 *
 */

/**
 * @param {Object} dataIn Parameter object
 * @returns {Object} Output object
 */
function getRESTlet(dataIn) {

	return dataIn;
}

/**
 * @param {Object} dataIn Parameter object
 * @returns {Object} Output object
 */
function postRESTlet(dataIn) {
	
	for (var fieldname in dataIn)
    {
        //if (dataIn.hasOwnProperty(fieldname))
        //{
        	nlapiLogExecution('DEBUG', fieldname, dataIn[fieldname]);
            
        //}
    }
	
	
	return dataIn;
}

/**
 * @param {Object} dataIn Parameter object
 * @returns {Void} 
 */
function deleteRESTlet(dataIn) {
	
}

/**
 * @param {Object} dataIn Parameter object
 * @returns {Object} Output object 
 */
function putRESTlet(dataIn) { 
	
	return {};
}

//Testing code
//
/*
function credentials()
{
    this.email='cedric.griffiths@brightbridgesolutions.com';
    this.account='4136219';
    this.role='1020';
    this.password='Netsuite1234';
}

function custrec(firstName, lastName, phone)
{
this.fname = firstName;
this.lname = lastName;
this.pnum = phone;
}


var url = 'https://rest.eu2.netsuite.com/app/site/hosting/restlet.nl?script=225&deploy=1&recordtype=customer&recid=1234&recmode=update';

var cred = new credentials();
   
   var headers = new Array();
   headers['User-Agent-x'] = 'SuiteScript-Call';
   headers['Authorization'] = 'NLAuth nlauth_account='+cred.account+', nlauth_email='+cred.email+', nlauth_signature='+cred.password+', nlauth_role='+cred.role;
   headers['Content-Type'] = 'application/json';
   

//Send a GET
//
var resp = nlapiRequestURL( url, null, headers );

var result = resp.getBody();
var result1 = JSON.parse(resp.getBody());

var newRec = new custrec('Peter','Jones','012023982392');
var newRecJ = JSON.stringify(newRec);

//Send a POST
//
var resp = nlapiRequestURL( url, newRecJ, headers );
var result = resp.getBody();
var result1 = JSON.parse(resp.getBody());


var a = '';
*/


