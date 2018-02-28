/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       27 Oct 2016     dgeronimo
 *
 */


function cleanupOrphanCIL_scheduled(type) {

    var arrFils = [];
    var arrCol = [];
    arrCol.push( new nlobjSearchColumn(FLD_CUSTBODY_NSTS_CI_LINK, FLD_CUSTRECORD_NSTS_CIL_INVOICE));
    
    var intCnt = 0;
    var func = function(res){
        nlapiLogExecution('DEBUG', 'scheduled', 'Call Back is Triggered!');
        if(!isEmpty(res)){
            for(var i=0; i< res.length; i++){
               var id = res[i].getId();
               var intInvCLIId = res[i].getValue(FLD_CUSTBODY_NSTS_CI_LINK, FLD_CUSTRECORD_NSTS_CIL_INVOICE);
               nlapiLogExecution('DEBUG', 'scheduled', 'id:' + id  + " intInvCLIId:" + intInvCLIId);
               if(id != intInvCLIId){
                   nlapiDeleteRecord(RECTYPE_CUSTOMRECORD_NSTS_CI_GEN_CI_LINKS,id);
                   nlapiLogExecution('DEBUG', 'scheduled', 'Deleted CIL orphan record:' + id  + " intInvCLIId:" + intInvCLIId);
                   intCnt++;
               }
            }
        }
    }

    var objSearch = getAllResults(RECTYPE_CUSTOMRECORD_NSTS_CI_GEN_CI_LINKS, null, null, arrCol,null,func);
    nlapiLogExecution('DEBUG', 'scheduled', 'COMPLETE CIL DELETED COUNT ' + intCnt);
}