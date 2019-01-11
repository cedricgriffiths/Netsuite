/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       11 Jan 2019     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function custRoleAccessAfterSubmit(type)
{
	//Upload a JSON version of the roles to the corresponding customer
	//
	var roleRecord = null;
	
	if(type == 'delete')
		{
			roleRecord = nlapiGetOldRecord();
		}
	else
		{
			roleRecord = nlapiGetNewRecord();
		}
	
	var roleCustomer = roleRecord.getFieldValue('custrecord_bbs_customer');
	var roles = [];
	
	if(roleCustomer != null && roleCustomer != '')
		{
			var customrecord_bbs_cust_role_accessSearch = nlapiSearchRecord("customrecord_bbs_cust_role_access",null,
					[
					   ["custrecord_bbs_customer","anyof",roleCustomer], 
					   "AND", 
					   ["isinactive","is","F"]
					], 
					[
					   new nlobjSearchColumn("custrecord_bbs_role"), 
					   new nlobjSearchColumn("custrecord_bbs_add_manpack_user"), 
					   new nlobjSearchColumn("custrecord_bbs_amend_ind_address"), 
					   new nlobjSearchColumn("custrecord_bbs_amend_del_address"), 
					   new nlobjSearchColumn("custrecord_bbs_customer"), 
					   new nlobjSearchColumn("custrecord_bbs_manpack_orders"), 
					   new nlobjSearchColumn("custrecord_bbs_orders_authorised"), 
					   new nlobjSearchColumn("custrecord_bbs_stock_orders"), 
					   new nlobjSearchColumn("custrecord_bbs_view_order_history"), 
					   new nlobjSearchColumn("custrecord_bbs_view_reporting")
					]
					);
			
			if(customrecord_bbs_cust_role_accessSearch != null && customrecord_bbs_cust_role_accessSearch.length > 0)
				{
					for (var int = 0; int < customrecord_bbs_cust_role_accessSearch.length; int++) 
						{
							var roleId 					= customrecord_bbs_cust_role_accessSearch[int].getValue('custrecord_bbs_role');
							var roleName				= customrecord_bbs_cust_role_accessSearch[int].getText('custrecord_bbs_role');
							var addManpackUser 			= customrecord_bbs_cust_role_accessSearch[int].getValue('custrecord_bbs_add_manpack_user');
							var amendIndividualAddress 	= customrecord_bbs_cust_role_accessSearch[int].getValue('custrecord_bbs_amend_ind_address');
							var amendDeliveryAddress 	= customrecord_bbs_cust_role_accessSearch[int].getValue('custrecord_bbs_amend_del_address');
							var manpackOrders 			= customrecord_bbs_cust_role_accessSearch[int].getValue('custrecord_bbs_manpack_orders');
							var ordersAuthorised 		= customrecord_bbs_cust_role_accessSearch[int].getValue('custrecord_bbs_orders_authorised');
							var stockOrders 			= customrecord_bbs_cust_role_accessSearch[int].getValue('custrecord_bbs_stock_orders');
							var viewOrderHistory 		= customrecord_bbs_cust_role_accessSearch[int].getValue('custrecord_bbs_view_order_history');
							var viewReporting 			= customrecord_bbs_cust_role_accessSearch[int].getValue('custrecord_bbs_view_reporting');
							
							var rolePermissions = new Object();
							rolePermissions['roleId'] 					= roleId;
							rolePermissions['roleName'] 				= roleName;
							rolePermissions['AddManpackUser'] 			= addManpackUser;
							rolePermissions['amendIndividualAddress'] 	= amendIndividualAddress;
							rolePermissions['amendDeliveryAddress'] 	= amendDeliveryAddress;
							rolePermissions['manpackOrders'] 			= manpackOrders;
							rolePermissions['ordersAuthorised'] 		= ordersAuthorised;
							rolePermissions['stockOrders'] 				= stockOrders;
							rolePermissions['viewOrderHistory'] 		= viewOrderHistory;
							rolePermissions['viewReporting'] 			= viewReporting;
							
							roles.push(rolePermissions);
						}
					
					var rolesText = JSON.stringify(roles);
					
					nlapiSubmitField('customer', roleCustomer, 'custentity_bbs_role_access_json', rolesText, false);
				}
		
		}
}
