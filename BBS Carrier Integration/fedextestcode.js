var cdataStart = '<![CDATA[';
var cdataEnd = ']]' + '>';

//Credentials
//
var fedex_key = '7eoabzhPwpacUoem';
var fedex_password = 'VeX7S45TLVfjJc13duGUZMsGi';
var fedex_account_number = '700636402';
var fedex_meter_number = '119142673';
var email_address = 'cedric.griffiths@brightbridgesolutions.com';

/*
Developer Test Key:	 7eoabzhPwpacUoem
Test Account Number:	 700636402
Test	Meter Number:	 119142673
Test Password: VeX7S45TLVfjJc13duGUZMsGi 
*/


//Basic shipping Info
//
var fedExSpecialServicesXml = "";
var serviceName = 'FEDEX_NEXT_DAY_END_OF_DAY';
var ifTotalWeight = '1.0';
var shipDateStr = '2019-05-01';
var shipperaccid = '';
var orderValue = '100.00';
var fedexweb_ParcelDesc = 'Samples';
var fedexweb_ShippingRef1 = '00000100101';
var fedexweb_ShippingRef2 = '00002000202';
var labelQty = '1';
var fedExMasterTrackingId = '';

//Consignee Info
//
var fedexweb_Consign_Phone = '03301335000';
var fedexweb_Consign_Organisation = 'BrightBridge Solutions';
var fedexweb_Consign_Street = 'Coventry Road';
var fedexweb_Consign_Locality = '';
var fedexweb_Consign_Town = 'Sharnford';
var fedexweb_Consign_County = 'Leicestershire';
var fedexweb_Consign_Postcode = 'LE10 3PG';
var fedexweb_Consign_CountryCode = 'GB';

//Delivery Info
//
var fedexweb_Delivery_Phone = '03301335000';
var fedexweb_Delivery_ContactName = 'Cedric Griffiths';
var fedexweb_Delivery_Organisation = '';
var fedexweb_Delivery_Street = '64 Fordwater Road';
var fedexweb_Delivery_Locality = 'Streetly';
var fedexweb_Delivery_Town = 'Sutton Coldfield';
var fedexweb_Delivery_County = 'West Midlands';
var fedexweb_Delivery_Postcode = 'B74 2BG';
var fedexweb_Delivery_Country = 'GB';
var fedexweb_DeliveryInstrucs = 'Leave behind gate';




//if(extraServiceCode) fedExSpecialServicesXml = "<SpecialServicesRequested><SpecialServiceTypes>"+extraServiceCode+"</SpecialServiceTypes></SpecialServicesRequested>";
	
	

for ( var p = 1; p <= labelQty; p++ )
	{
		
		var fedexwebXmlHead = 		'<?xml version="1.0" encoding="UTF-8"?>';
		fedexwebXmlHead +=			'<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v23="http://fedex.com/ws/ship/v23">';
		fedexwebXmlHead +=			'<soapenv:Body>';
		fedexwebXmlHead +=			'<v23:ProcessShipmentRequest>';
		fedexwebXmlHead +=			'<WebAuthenticationDetail>';
		fedexwebXmlHead +=			'<UserCredential>';
		fedexwebXmlHead +=			'<Key>'+fedex_key+'</Key>';
		fedexwebXmlHead +=			'<Password>'+fedex_password+'</Password>';
		fedexwebXmlHead +=			'</UserCredential>';
		fedexwebXmlHead +=			'</WebAuthenticationDetail>';
		fedexwebXmlHead +=			'<ClientDetail>';
		fedexwebXmlHead +=			'<AccountNumber>' + fedex_account_number + '</AccountNumber>';
		fedexwebXmlHead +=			'<MeterNumber>'+fedex_meter_number+'</MeterNumber>';
		fedexwebXmlHead +=			'</ClientDetail>';
		fedexwebXmlHead +=			'<TransactionDetail>';
		fedexwebXmlHead +=			'<CustomerTransactionId>TransactionID_WS1</CustomerTransactionId>';
		fedexwebXmlHead +=			'</TransactionDetail>';
		fedexwebXmlHead +=			'<Version>';
		fedexwebXmlHead +=			'<ServiceId>ship</ServiceId>';
		fedexwebXmlHead +=			'<Major>23</Major>';
		fedexwebXmlHead +=			'<Intermediate>0</Intermediate>';
		fedexwebXmlHead +=			'<Minor>0</Minor>';
		fedexwebXmlHead +=			'</Version>';
		
		var fedexwebXmlShipReq =	'<RequestedShipment><ShipTimestamp>'+shipDateStr+'T18:00:00</ShipTimestamp>';
		fedexwebXmlShipReq += 		'<DropoffType>REGULAR_PICKUP</DropoffType>';
		fedexwebXmlShipReq += 		'<ServiceType>'+serviceName+'</ServiceType>';
		fedexwebXmlShipReq += 		'<PackagingType>YOUR_PACKAGING</PackagingType>';
		fedexwebXmlShipReq += 		'<TotalWeight>';
		fedexwebXmlShipReq += 		'<Units>KG</Units>';
		fedexwebXmlShipReq += 		'<Value>'+ifTotalWeight+'</Value>';
		fedexwebXmlShipReq += 		'</TotalWeight>';
		

		var fedexwebXmlShipper =	'<Shipper>';
		fedexwebXmlShipper+=		'<Contact>';
		fedexwebXmlShipper+=		'<PersonName>'+fedexweb_Consign_Organisation+'</PersonName>';
		fedexwebXmlShipper+=		'<CompanyName>'+fedexweb_Consign_Organisation+'</CompanyName>';
		fedexwebXmlShipper+=		'<PhoneNumber>' + fedexweb_Consign_Phone + '</PhoneNumber>';
		fedexwebXmlShipper+=		'<EMailAddress>' + email_address + '</EMailAddress>';
		fedexwebXmlShipper+=		'</Contact>';
		fedexwebXmlShipper+=		'<Address>';
		fedexwebXmlShipper+=		'<StreetLines>' + cdataStart +fedexweb_Consign_Street + cdataEnd +'</StreetLines>';
		fedexwebXmlShipper+=		'<StreetLines>' + cdataStart +fedexweb_Consign_Locality + cdataEnd + '</StreetLines>';
		fedexwebXmlShipper+=		'<City>' + cdataStart +fedexweb_Consign_Town + cdataEnd + '</City>';
		fedexwebXmlShipper+=		'<StateOrProvinceCode>' + cdataStart +fedexweb_Consign_County + cdataEnd + '</StateOrProvinceCode>';
		fedexwebXmlShipper+=		'<PostalCode>'+fedexweb_Consign_Postcode+'</PostalCode>';
		fedexwebXmlShipper+=		'<CountryCode>'+fedexweb_Consign_CountryCode+'</CountryCode>';
		fedexwebXmlShipper+=		'</Address>';
		fedexwebXmlShipper+=		'</Shipper>';
		
		var fedexwebXmlRecipient =	'<Recipient>';
		fedexwebXmlRecipient +=		'<Contact>';
		fedexwebXmlRecipient +=		'<PersonName>'+fedexweb_Delivery_ContactName+'</PersonName>';
		fedexwebXmlRecipient +=		'<CompanyName>'+fedexweb_Delivery_Organisation+'</CompanyName>';
		fedexwebXmlRecipient +=		'<PhoneNumber>' + fedexweb_Delivery_Phone + '</PhoneNumber>';
		fedexwebXmlRecipient +=		'<EMailAddress>' + email_address + '</EMailAddress>';
		fedexwebXmlRecipient +=		'</Contact>';
		fedexwebXmlRecipient +=		'<Address>';
		fedexwebXmlRecipient +=		'<StreetLines>' + cdataStart +fedexweb_Delivery_Street + cdataEnd + '</StreetLines>';
		fedexwebXmlRecipient +=		'<StreetLines>' + cdataStart +fedexweb_Delivery_Locality + cdataEnd + '</StreetLines>';
		fedexwebXmlRecipient +=		'<City>' + cdataStart +fedexweb_Delivery_Town + cdataEnd + '</City>';
		fedexwebXmlRecipient +=		'<StateOrProvinceCode>' + cdataStart +fedexweb_Delivery_County + cdataEnd + '</StateOrProvinceCode>';
		fedexwebXmlRecipient +=		'<PostalCode>'+fedexweb_Delivery_Postcode+'</PostalCode>';
		fedexwebXmlRecipient +=		'<CountryCode>'+fedexweb_Delivery_Country+'</CountryCode>';
		fedexwebXmlRecipient +=		'</Address>';
		fedexwebXmlRecipient +=		'</Recipient>';
									
		var fedexwebXmlCustoms =	'<ShippingChargesPayment>';
		fedexwebXmlCustoms += 		'<PaymentType>SENDER</PaymentType>';
		fedexwebXmlCustoms += 		'<Payor>';
		fedexwebXmlCustoms += 		'<ResponsibleParty>';
		fedexwebXmlCustoms += 		'<AccountNumber>'+shipperaccid+'</AccountNumber>';
		fedexwebXmlCustoms += 		'<Contact/>';
		fedexwebXmlCustoms += 		'</ResponsibleParty>';
		fedexwebXmlCustoms += 		'</Payor>';
		fedexwebXmlCustoms += 		'</ShippingChargesPayment>';
		fedexwebXmlCustoms += 		fedExSpecialServicesXml;
		fedexwebXmlCustoms += 		'<CustomsClearanceDetail>';
		fedexwebXmlCustoms += 		'<DutiesPayment>';
		fedexwebXmlCustoms += 		'<PaymentType>SENDER</PaymentType>';
		fedexwebXmlCustoms += 		'<Payor>';
		fedexwebXmlCustoms += 		'<ResponsibleParty>';
		fedexwebXmlCustoms += 		'<AccountNumber>'+shipperaccid+'</AccountNumber>';
		fedexwebXmlCustoms += 		'<Contact/>';
		fedexwebXmlCustoms += 		'</ResponsibleParty>';
		fedexwebXmlCustoms += 		'</Payor>';
		fedexwebXmlCustoms += 		'</DutiesPayment>';
		fedexwebXmlCustoms += 		'<CustomsValue>';
		fedexwebXmlCustoms += 		'<Currency>UKL</Currency>';
		fedexwebXmlCustoms += 		'<Amount>'+orderValue+'</Amount>';
		fedexwebXmlCustoms += 		'</CustomsValue>';
		
		var fedexwebXmlCommods =	'<Commodities>';
		fedexwebXmlCommods += 		'<NumberOfPieces>1</NumberOfPieces>';
		fedexwebXmlCommods += 		'<Description>'+fedexweb_ParcelDesc+'</Description>';
		fedexwebXmlCommods += 		'<CountryOfManufacture>GB</CountryOfManufacture>';
		fedexwebXmlCommods += 		'<Weight>';
		fedexwebXmlCommods += 		'<Units>KG</Units>';
		fedexwebXmlCommods += 		'<Value>'+ifTotalWeight+'</Value>';
		fedexwebXmlCommods += 		'</Weight>';
		fedexwebXmlCommods += 		'<Quantity>1</Quantity>';
		fedexwebXmlCommods += 		'<QuantityUnits>EA</QuantityUnits>';
		fedexwebXmlCommods += 		'<UnitPrice>';
		fedexwebXmlCommods += 		'<Currency>UKL</Currency>';
		fedexwebXmlCommods += 		'<Amount>0</Amount>';
		fedexwebXmlCommods += 		'</UnitPrice>';
		fedexwebXmlCommods += 		'</Commodities>';
		

		var fedexwebXmlDocTab = 	'<LabelPrintingOrientation>TOP_EDGE_OF_TEXT_FIRST</LabelPrintingOrientation>';
		fedexwebXmlDocTab +=		'<CustomerSpecifiedDetail>';
		fedexwebXmlDocTab +=		'<DocTabContent>';
		fedexwebXmlDocTab +=		'<DocTabContentType>ZONE001</DocTabContentType>';
		fedexwebXmlDocTab +=		'<Zone001>';
		fedexwebXmlDocTab +=		'<DocTabZoneSpecifications>';
		fedexwebXmlDocTab +=		'<ZoneNumber>1</ZoneNumber>';
		fedexwebXmlDocTab +=		'<Header>Company</Header>';
		fedexwebXmlDocTab +=		'<DataField>REQUEST/SHIPMENT/Recipient/Contact/CompanyName</DataField>';
		fedexwebXmlDocTab +=		'</DocTabZoneSpecifications>';
		fedexwebXmlDocTab +=		'<DocTabZoneSpecifications>';
		fedexwebXmlDocTab +=		'<ZoneNumber>2</ZoneNumber>';
		fedexwebXmlDocTab +=		'<Header>Name</Header>';
		fedexwebXmlDocTab +=		'<DataField>REQUEST/SHIPMENT/Recipient/Contact/PersonName</DataField>';
		fedexwebXmlDocTab +=		'</DocTabZoneSpecifications>';
		fedexwebXmlDocTab +=		'<DocTabZoneSpecifications>';
		fedexwebXmlDocTab +=		'<ZoneNumber>3</ZoneNumber>';
		fedexwebXmlDocTab +=		'<Header>Street</Header>';
		fedexwebXmlDocTab +=		'<DataField>REQUEST/SHIPMENT/Recipient/Address/StreetLines[1]</DataField>';
		fedexwebXmlDocTab +=		'</DocTabZoneSpecifications>';
		fedexwebXmlDocTab +=		'<DocTabZoneSpecifications>';
		fedexwebXmlDocTab +=		'<ZoneNumber>4</ZoneNumber>';
		fedexwebXmlDocTab +=		'<Header>PostCode</Header>';
		fedexwebXmlDocTab +=		'<DataField>REQUEST/SHIPMENT/Recipient/Address/PostalCode</DataField>';
		fedexwebXmlDocTab +=		'</DocTabZoneSpecifications>';
		fedexwebXmlDocTab +=		'<DocTabZoneSpecifications>';
		fedexwebXmlDocTab +=		'<ZoneNumber>5</ZoneNumber>';
		fedexwebXmlDocTab +=		'<Header>TotalWt</Header>';
		fedexwebXmlDocTab +=		'<DataField>REQUEST/SHIPMENT/TotalWeight/Value</DataField>';
		fedexwebXmlDocTab +=		'</DocTabZoneSpecifications>';
		fedexwebXmlDocTab +=		'<DocTabZoneSpecifications>';
		fedexwebXmlDocTab +=		'<ZoneNumber>6</ZoneNumber>';
		fedexwebXmlDocTab +=		'<Header>TtlVal</Header>';
		fedexwebXmlDocTab +=		'<DataField>REQUEST/SHIPMENT/CustomsClearanceDetail/CustomsValue/Amount</DataField>';
		fedexwebXmlDocTab +=		'</DocTabZoneSpecifications>';
		fedexwebXmlDocTab +=		'<DocTabZoneSpecifications>';
		fedexwebXmlDocTab +=		'<ZoneNumber>7</ZoneNumber>';
		fedexwebXmlDocTab +=		'<Header>TtlPkg</Header>';
		fedexwebXmlDocTab +=		'<DataField>REQUEST/SHIPMENT/PackageCount</DataField>';
		fedexwebXmlDocTab +=		'</DocTabZoneSpecifications>';
		fedexwebXmlDocTab +=		'<DocTabZoneSpecifications>';
		fedexwebXmlDocTab +=		'<ZoneNumber>8</ZoneNumber>';
		fedexwebXmlDocTab +=		'<Header>ShipDate</Header>';
		fedexwebXmlDocTab +=		'<DataField>REQUEST/SHIPMENT/ShipTimestamp</DataField>';
		fedexwebXmlDocTab +=		'</DocTabZoneSpecifications>';
		fedexwebXmlDocTab +=		'<DocTabZoneSpecifications>';
		fedexwebXmlDocTab +=		'<ZoneNumber>9</ZoneNumber>';
		fedexwebXmlDocTab +=		'<Header>Ref</Header>';
		fedexwebXmlDocTab +=		'<LiteralValue>'+fedexweb_ShippingRef1+'_'+fedexweb_ShippingRef2+'</LiteralValue>';
		fedexwebXmlDocTab +=		'</DocTabZoneSpecifications>';
		fedexwebXmlDocTab +=		'</Zone001>';
		fedexwebXmlDocTab +=		'</DocTabContent>';
		fedexwebXmlDocTab +=		'</CustomerSpecifiedDetail>';
			
		var fedexwebXmlLabelInfo =	'</CustomsClearanceDetail>';
		fedexwebXmlLabelInfo +=		'<LabelSpecification>';
		fedexwebXmlLabelInfo +=		'<LabelFormatType>COMMON2D</LabelFormatType>';
		fedexwebXmlLabelInfo +=		'<ImageType>EPL2</ImageType>';
		fedexwebXmlLabelInfo +=		'<LabelStockType>STOCK_4X6</LabelStockType>';
		fedexwebXmlLabelInfo +=		fedexwebXmlDocTab;
		fedexwebXmlLabelInfo +=		'</LabelSpecification>';
		fedexwebXmlLabelInfo +=		'<RateRequestTypes>PREFERRED</RateRequestTypes>';
		
		var fedexwebXmlPackages =	'';
		
		if(p==1)
			{
				fedexwebXmlPackages =	'<PackageCount>'+labelQty+'</PackageCount>';
				fedexwebXmlPackages +=	'<RequestedPackageLineItems>';
				fedexwebXmlPackages +=	'<SequenceNumber>'+p+'</SequenceNumber>';
				fedexwebXmlPackages +=	'<Weight>';
				fedexwebXmlPackages +=	'<Units>KG</Units>';
				fedexwebXmlPackages +=	'<Value>'+ifTotalWeight+'</Value>';
				fedexwebXmlPackages +=	'</Weight>';
				fedexwebXmlPackages +=	'<CustomerReferences>';
				fedexwebXmlPackages +=	'<CustomerReferenceType>CUSTOMER_REFERENCE</CustomerReferenceType>';
				fedexwebXmlPackages +=	'<Value>'+fedexweb_ShippingRef1+'_'+fedexweb_ShippingRef2+'</Value>';
				fedexwebXmlPackages +=	'</CustomerReferences>';
				fedexwebXmlPackages +=	'<CustomerReferences>';
				fedexwebXmlPackages +=	'<CustomerReferenceType>INVOICE_NUMBER</CustomerReferenceType>';
				fedexwebXmlPackages +=	'<Value>'+fedexweb_ShippingRef1+'_'+fedexweb_ShippingRef2+'</Value>';
				fedexwebXmlPackages +=	'</CustomerReferences>';
				fedexwebXmlPackages +=	'<CustomerReferences>';
				fedexwebXmlPackages +=	'<CustomerReferenceType>DEPARTMENT_NUMBER</CustomerReferenceType>';
				fedexwebXmlPackages +=	'<Value>'+fedexweb_DeliveryInstrucs+'</Value>';
				fedexwebXmlPackages +=	'</CustomerReferences>';
				fedexwebXmlPackages +=	'</RequestedPackageLineItems>';

			}
		else
			{
				fedexwebXmlPackages =	'<MasterTrackingId>';
				fedexwebXmlPackages += 	'<TrackingNumber>'+fedExMasterTrackingId+'</TrackingNumber>';
				fedexwebXmlPackages += 	'</MasterTrackingId>';
				fedexwebXmlPackages += 	'<PackageCount>'+labelQty+'</PackageCount>';
				fedexwebXmlPackages += 	'<RequestedPackageLineItems>';
				fedexwebXmlPackages += 	'<SequenceNumber>'+p+'</SequenceNumber>';
				fedexwebXmlPackages += 	'<Weight>';
				fedexwebXmlPackages += 	'<Units>KG</Units>';
				fedexwebXmlPackages += 	'<Value>'+ifTotalWeight+'</Value>';
				fedexwebXmlPackages += 	'</Weight>';
				fedexwebXmlPackages += 	'<CustomerReferences>';
				fedexwebXmlPackages += 	'<CustomerReferenceType>CUSTOMER_REFERENCE</CustomerReferenceType>';
				fedexwebXmlPackages += 	'<Value>'+fedexweb_ShippingRef1+'_'+fedexweb_ShippingRef2+'</Value>';
				fedexwebXmlPackages += 	'</CustomerReferences>';
				fedexwebXmlPackages += 	'<CustomerReferences>';
				fedexwebXmlPackages += 	'<CustomerReferenceType>INVOICE_NUMBER</CustomerReferenceType>';
				fedexwebXmlPackages += 	'<Value>'+fedexweb_ShippingRef1+'_'+fedexweb_ShippingRef2+'</Value>';
				fedexwebXmlPackages += 	'</CustomerReferences>';
				fedexwebXmlPackages += 	'<CustomerReferences>';
				fedexwebXmlPackages += 	'<CustomerReferenceType>DEPARTMENT_NUMBER</CustomerReferenceType>';
				fedexwebXmlPackages += 	'<Value>'+fedexweb_DeliveryInstrucs+'</Value>';
				fedexwebXmlPackages += 	'</CustomerReferences>';
				fedexwebXmlPackages += 	'</RequestedPackageLineItems>';

			
			}
		
		var fedexwebXmlEndTags =		'</RequestedShipment>';
		fedexwebXmlEndTags += 			'</v23:ProcessShipmentRequest>';
		fedexwebXmlEndTags += 			'</soapenv:Body>';
		fedexwebXmlEndTags += 			'</soapenv:Envelope>';

		var fullFedexWebXmlPostData = 	fedexwebXmlHead;
		fullFedexWebXmlPostData +=		fedexwebXmlShipReq;
		fullFedexWebXmlPostData +=		fedexwebXmlShipper;
		fullFedexWebXmlPostData +=		fedexwebXmlRecipient;
		fullFedexWebXmlPostData +=		fedexwebXmlCustoms;
		fullFedexWebXmlPostData +=		fedexwebXmlCommods;
		fullFedexWebXmlPostData +=		fedexwebXmlLabelInfo;
		fullFedexWebXmlPostData +=		fedexwebXmlPackages;
		fullFedexWebXmlPostData +=		fedexwebXmlEndTags;



		var shipmentHeaders = new Array();
		shipmentHeaders['Accept']			= "*/*";
		shipmentHeaders['Accept-Encoding']	= "gzip, deflate";
		shipmentHeaders['Content-Type']		= "text/xml";
		shipmentHeaders['User-Agent']		= "runscope/0.1";
	


		
		//POST HERE
		try
			{
				var shipmentResponse = nlapiRequestURL('https://wsbeta.fedex.com:443/web-services', fullFedexWebXmlPostData, shipmentHeaders);
				
				var shipmentResultCode=shipmentResponse.getCode();
				var shipmentResultBody=shipmentResponse.getBody();
				
				var z = '';
			}
			
		catch (err)
			{
				var errorcode='N1';
				var errormessage="Post URL: "+postedDataObj.posturl+". Error: "+err.getDetails() + ' - nlapiRequestURL Failed';

			}
	}