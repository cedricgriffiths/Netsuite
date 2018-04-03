/**
 * @NApiVersion 2.x
 * @NScriptType restlet
 */
define([ 'N/record' ], function(record) {
   return {
      post : function(restletBody) 
     {
    	 log.debug("PRI OAuth Restlet Post Start");
         log.debug("datain ", JSON.stringify(restletBody));
         return {
             "success" : "true",
             "datain" : restletBody
         };
      }
   };
});
