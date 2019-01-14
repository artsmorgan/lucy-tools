const _ = require('lodash');
const request = require('request');

const __server = '107.170.47.77';
const __port = 4501;

var client = function(config){
	const server = __server;
	const port = __port;	
	const organizationID = config.organization;
	const projectID =  config.project;
	const secretToken = config.secretToken;
	const protocol = 'http';
	var path = __server+':'+__port;
	var body = [];

	this.addField = function(fieldName, fieldValue){
		fieldValue = fieldValue ? fieldValue : '';
		return body.push({field:fieldName,value:fieldValue});
	}

	const resetBody = function(){
		body = [];
	}

	const prepareLeadTransport = function (){
				
		let __extra = {};

		let email = _.find(body, { 'field': 'email'});
		//validate email field required or duplicated
		let name = _.find(body, { 'field': 'name'});
		let lastname = _.find(body, { 'field': 'lastname'});
		let phone = _.find(body, { 'field': 'phone'});
		
		if(email){
			_.remove(body, { 'field': 'email'});
		}
		if(name){
			_.remove(body, { 'field': 'name'});
		}
		if(lastname){
			_.remove(body, { 'field': 'lastname'});
		}
		if(phone){
			_.remove(body, { 'field': 'phone'});
		}

		body.forEach(function(prop,index) {
		   __extra[prop.field] = prop.value;
		});

		return {			
			leademail			: email 	?  email.value 		: '',
			leadname 			: name 		?  name.value 		: '',
			leadfirst_lastname	: lastname 	?  lastname.value 	: '',
			leadphone			: phone 	?  phone.value 		: '',
			extra 				: __extra
		}		

	}

	const prepareSendemailTransport = function (){
				
		let message = {};

		let subject = _.find(body, { 'field': 'subject'});		
		
		if(subject){
			_.remove(body, { 'field': 'subject'});
		}
		
		body.forEach(function(prop,index) {
		   message[prop.field] = prop.value;
		});

		return {			
			subject			: subject 	?  subject.value 		: '',
			message 		: message 	?  message		 		: '',			
		}		

	}

	const prepareRequest = function (transport){
		let auth = "Basic " + new Buffer(config.secretToken+ ":").toString("base64");
		let header = {
			'content-type' : 'application/x-www-form-urlencoded',
			"authorization": auth
		};
		let body = {
			organizationId: organizationID,
			projectId: projectID,
			transport: transport
		}	


		return[header, body];
	}
	

	const sendRequest = function(){
		
	}

	const makeRequest = function(_headers,url,_body){
		return new Promise(function(resolve, reject) {

     		request.post({
			  headers: _headers,
			  url:     url,
			  form:    _body
			},function(err, resp, body) {
	            if (err) {
	                reject(err);
	            } else {
	            	console.log('body',body)
	            	console.log('type of', typeof body)
	            	try{
	            		var rst = JSON.parse(body);	
	            	}catch(e){
	            		var rst = {};	
	            	}
	            	
	                resetBody();
	                resolve(rst);	                
	            }
	        });
	        
	    })
	}

	this.sendRequestNewLead = function(){	
		let leadTransport = prepareLeadTransport();
		let requestObject = prepareRequest(leadTransport);
		let url = protocol+'://'+path+'/api/leadcreation';
		let _headers = requestObject[0];
		let _body = requestObject[1];
		return makeRequest(_headers,url,_body)
	};

	this.sendRequestSendmail = function(){	
		let emailTransport = prepareSendemailTransport()
		let requestObject = prepareRequest(emailTransport);
		let url = protocol+'://'+path+'/api/sendemail';
		console.log('requestObject',requestObject)
		console.log('url',url)
		let _headers = requestObject[0];
		let _body = requestObject[1];
		return makeRequest(_headers,url,_body)
	};
};

module.exports = {
	client
}