function calculateTotalWeight(type){
 
      var lines = nlapiGetLineItemCount('item');
      var totalWeight = Number(0) ;
      var totalItems = Number(0) ;
  
  
      for(var i=1; i< lines+1 ; i++){   
           var weight = Number(nlapiGetLineItemValue('item', 'custcol_bbs_individual_weight', i));
           var quantity = Number(nlapiGetLineItemValue('item', 'quantity', i));
           var weightTimesQuantity = weight * quantity;
  
           if(weight != NaN && quantity != NaN){
   
                totalWeight += weightTimesQuantity ;
                totalItems += quantity;
           }
      }
      nlapiSetFieldValue('custbody_bbs_total_order_weight', totalWeight);
      //nlapiSetFieldValue('custbody_bbs_total_order_items', totalItems);

}
