//Colecciones
Datos= new Meteor.Collection("Datos");
Logs= new Meteor.Collection("Logs");
Get= new Meteor.Collection("Get");
Inbound = new Meteor.Collection("Inbound");

Router.configure({
	layoutTemplate:'main'
});

Router.route('/',{
	name:'home',
	template:'home'
});

Router.route('/datos',{
	name:'datos',
	template:'datos'
});

Router.route('/informes',{
	name:'informes',
	template:'informes'
});

Router.route('/usuarios',{
	name:'usuarios',
	template:'usuarios'
});

Router.route('/configuracion',{
	name:'configuracion',
	template:'configuracion'
});

Router.route('/account', {
  name: 'account',
  template: 'account',
  onBeforeAction: function(){
    var currentUser = Meteor.userId();
    if(currentUser){
      this.next();
    } else {
      this.render("login");
    }
  }
});

Router.route('/inbound', function () {
  var req = this.request;
  var res = this.response;

  var rawEmail = JSON.stringify(req.body.toString());
  var emailSubjectSub = rawEmail.substring(rawEmail.search("Subject: ") + 9);
  var emailSubject = emailSubjectSub.substring(0, emailSubjectSub.indexOf('\\n'));
  var emailBodySub = rawEmail.substring(rawEmail.search("ltr") + 6);
  var emailBody = emailBodySub.substring(0, emailBodySub.indexOf('<'));
  var emailDateSub = rawEmail.substring(rawEmail.search("Date: ") + 6);
  var emailDate = emailDateSub.substring(0, emailDateSub.indexOf('\\n'));
  console.log(emailSubject);
  console.log(emailBody);
  console.log(emailDate);
  res.statusCode = 200;
  res.end('email received\n');


  Inbound.insert({
      Subject: emailSubject,
      Body: emailBody,
      Date: emailDate,
  });

  console.log("HOLA " + Inbound.Body);

}, {where: 'server'});


if (Meteor.isServer) {
	Meteor.startup(function () {
		Meteor.publish('Datos',function(){
			//var currentUserId=this.userId;
			//return Datos.find({createdBy: currentUserId})
			return Datos.find()
		});
		Meteor.publish('Logs',function(){
			//var currentUserId=this.userId;
			//return Logs.find({createdBy: currentUserId})
			return Logs.find()
		});
		Meteor.publish('Get',function(){
			//var currentUserId=this.userId;
			//return Logs.find({createdBy: currentUserId})
			return Get.find()
		});
		Meteor.publish('Inbound',function(){
			//var currentUserId=this.userId;
			//return Datos.find({createdBy: currentUserId})
			return Inbound.find()
		});
	});

	Router.configureBodyParsers = function(){
    //Router.onBeforeAction( Iron.Router.bodyParser.json(), {except: ['inbound'], where: 'server'});
    // Enable incoming XML requests for creditReferral route
    	Router.onBeforeAction( Iron.Router.bodyParser.raw({type: '*/*', only: ['inbound'],
    		verify: function(req, res, body){
    		req.rawBody = body.toString();
    	}, where: 'server'}));
    //Router.onBeforeAction( Iron.Router.bodyParser.urlencoded({ extended: false }), {where: 'server'});
};
	
	/*var gmailClients = {};
	Meteor.users.find().observe({
		added: function (doc) {
			var googleConf =
			ServiceConfiguration.configurations.findOne({service: 'google'});

			var google = doc.services.google;

			gmailClients[doc._id] = new GMail.Client({
				clientId: googleConf.clientId,
				clientSecret: googleConf.secret,
		        accessToken: google.accessToken,
		        expirationDate: google.expiresAt,
		        refreshToken: google.refreshToken
    		});

			gmailClients[doc._id].onNewEmail('subject:trampas', function (message) {
				//console.log(message.snippet, message.to, message.from, message.subject);
				console.log(message.snippet, message.from);
				console.log(message.date);
				var mensaje=message.snippet;
				var mensaje1=String(mensaje);
				var mensaje2=mensaje1.slice(1,-1);
				var mensaje3= mensaje2.split("#");
				/*if(Logs.find().count()!=0){
					Logs.insert({
							ack:false,
							aldea:mensaje3[0],
							casa:mensaje3[1],
							sensor:mensaje3[2],
							mailId:message._id,
							contenido:mensaje3,
							remitente:message.from,
							fecha:message.date
						});
				}
				if (message._id!=Logs.findOne({mailId:message._id})){
					Logs.insert({
						ack:false,
						aldea:mensaje3[0],
						casa:mensaje3[1],
						sensor:mensaje3[2],
						mailId:message._id,
						//contenido:mensaje3,
						remitente:message.from,
						fecha:message.date
					});
				}
				var ultimaDeteccion = Logs.findOne({}, {sort: {fecha: -1, limit: 1}});
		var cantidadEntradas= Logs.find().count();
		console.log("entradas " + cantidadEntradas);
		console.log("aldea " +ultimaDeteccion.aldea);
		console.log("casa "+ultimaDeteccion.casa);
		if(cantidadEntradas!=0){
			if(ultimaDeteccion.aldea==1 && ultimaDeteccion.casa==1 && ultimaDeteccion.ack==false){
				console.log("Aldea 1, Casa 1 con actividad");
				Logs.update({_id : ultimaDeteccion._id},{
					$set:{ack:true}
				});
				control=1;
			}
		}
			});
		}
	});*/

	

	return Meteor.methods({
		'cargarDatosGet': function(ayuda){
			Datos.insert(ayuda);
		},
		'updateAccount': function (name, lastname) {
      	var user = Meteor.users.findOne(this.userId);
      	var profile = user.profile;
      	profile.firstName = name;
      	profile.lastName = lastname;
      	Meteor.users.update(Meteor.userId(), {$set: {profile: profile}});
      }
		/*'ultimaDeteccion':function(){
			return Logs.findOne({}, {sort: {fecha: -1, limit: 1}})
		},
		'cantidadEntradas':function(){
			return Logs.find().count()!=0;
		}*/
	});

}

if (Meteor.isClient) {
	/*Accounts.ui.config({
	    requestOfflineToken: { google: true },
	    forceApprovalPrompt: { google: true },
	    requestPermissions: { google: ["https://www.googleapis.com/auth/gmail.readonly"] }
  	});*/

	Meteor.subscribe ('Datos');
	Meteor.subscribe ('Logs');
	Meteor.subscribe ('Get');

	Template.mapview1.onRendered(function () {
		var mapOptions = {
			zoom: 16,
			center: new google.maps.LatLng(-25.304251, -57.560504)
		};
		map = new google.maps.Map(document.getElementById('map-canvas1'), mapOptions);
		directionsService = new google.maps.DirectionsService();
		directionsDisplay = new google.maps.DirectionsRenderer();
		directionsDisplay.setMap(map);
		directionsDisplay.setPanel(document.getElementById('directions-panel')); 
		var marker = new google.maps.Marker({
		position: {lat: -25.304251, lng:-57.560504},
		map: map,
		title:"Municipalidad de Asuncion"
		});
		marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
		var marker2 = new google.maps.Marker({
		position: {lat: -25.305609, lng:-57.560252},
		map: map,
		title:"Municipalidad de Asuncion 2"
		});
		marker2.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
		//Rutina de evento "click" en el mapa
		//Logs.findOne({}, {sort: {fecha: -1, limit: 1}}).fetch()
		/*var ultimaDeteccion;
		Meteor.call ("ultimaDeteccion", function(error,result){
			if(error){
				console.log(error);
			} else{
				Session.set("ultimaDeteccion",result)
			}
		});
		var datoUtil=Session.get("ultimaDeteccion");
		console.log(datoUtil);

		var la;
		Meteor.call("cantidadEntradas", function(error,result){
			if(error){
				console.log(error);
			} else{
				Session.set("la",result)
			}
		});

		if(Session.get("la")){
			if(datoUtil.aldea===1 && datoUtil.casa===1 && datoUtil.ack===false){
				marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
			}
			if(datoUtil.aldea===1 && datoUtil.casa===2 && datoUtil.ack===false){
				marker2.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
			}
		}*/

		marker.addListener('click', function() {
			/*console.log(Logs.findOne({}, {sort: {fecha: -1, limit: 1}}));
			Logs.update(ultimaDeteccion._id,{
				$set:{ack:true},
			});*/
    		marker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png');
  		});
  		marker2.addListener('click', function() {
	    	marker2.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png');
  		});
	}); 

	Template.mapview2.onRendered(function () {
		/*Logs.insert({
			ack:false,
			aldea:2,
			casa:1,
			sensor:1
		});*/
		var mapOptions = {
			zoom: 16,
			center: new google.maps.LatLng(-25.342175, -57.625492)
		};
		map = new google.maps.Map(document.getElementById('map-canvas2'), mapOptions);
		directionsService = new google.maps.DirectionsService();
		directionsDisplay = new google.maps.DirectionsRenderer();
		directionsDisplay.setMap(map);
		directionsDisplay.setPanel(document.getElementById('directions-panel'));
		var marker = new google.maps.Marker({
		position: {lat: -25.342175, lng:-57.625492},
		map: map,
		title:"Municipalidad de Lambare"
		});
		marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
	});  
	Template.mapview3.onRendered(function () {
		/*Logs.insert({
			ack:false,
			aldea:3,
			casa:1,
			sensor:1
		});*/
		var mapOptions = {
			zoom: 16,
			center: new google.maps.LatLng(-25.093469, -57.521271)
		};
		map = new google.maps.Map(document.getElementById('map-canvas3'), mapOptions);
		directionsService = new google.maps.DirectionsService();
		directionsDisplay = new google.maps.DirectionsRenderer();
		directionsDisplay.setMap(map);
		directionsDisplay.setPanel(document.getElementById('directions-panel'));
		var marker = new google.maps.Marker({
		position: {lat: -25.093469, lng:-57.521271},
		map: map,
		title:"Municipalidad de Villa Hayes",
		});
		marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
	});

	Template.todo.helpers({
		'log':function(){
			return Logs.find({}, {sort: {createdAt: -1} })
		},
		'getDatos':function(){
			return Datos.findOne({}, {sort: {fecha: -1, limit: 1}});
		}
	});

	Template.datos.onRendered(function(){
		var temperatura=Router.current().params.query.temperatura;
		var viento=Router.current().params.query.viento;
		var humedad=Router.current().params.query.humedad;
		var presion=Router.current().params.query.presion;
		var ayuda={
			temperatura1:temperatura,
			viento1:viento,
			humedad1:humedad,
			presion1:presion,
			fecha:new Date()
		};
		Meteor.call("cargarDatosGet",ayuda);
	});
	Template.login.events({
		'click #btn-signup': function(event){
			event.preventDefault();
			var email = $('#signup-useremail').val();
			var password = $('#signup-password').val();
			var firstName = $('#signup-userfirstname').val();
			var lastName = $('#signup-userlastname').val();  
			Accounts.createUser({
				email: email,
				password: password,
				firstName: firstName,
				lastName: lastName
			}, function(error){
				if(error){
					alert(T9n.get(error.reason));
				} 
			});
		},
		'click #btn-login': function(event){
			event.preventDefault();
			var email = $('#login-username').val();
			var password = $('#login-password').val();
			Meteor.loginWithPassword(email, password, function(error){
				if(error){
					alert(T9n.get(error.reason));
				}
			});
		},
		'keyup #login-password': function(event){
			if(event.keyCode == 13){
				$("#btn-login").click();
			}
		},
		'keyup #login-username': function(event){
			if(event.keyCode == 13){
				$("#btn-login").click();
			}
		}
});

Template.navbar.events({
 'click .logout': function(event){
  event.preventDefault();
  Meteor.logout();
  Router.go('home');
}
});

Template.account.events({
 'click #updateAccount': function(){
  var firstName = $('#userFistName').val();
  var lastName = $('#userLastName').val();
  if (firstName === "")
    firstName = Meteor.user().profile.firstName;
  if (lastName === "")
    lastName = Meteor.user().profile.lastName;  
  Meteor.call("updateAccount", firstName,lastName);
  Router.go('home');
},
'click #cancelUpdateAccount': function() {
  history.back();
},
'click #changePassword': function() {
  Router.go('changePassword');
}
});

Template.changePassword.events({
 'click #updatePassword': function () {
   var oldPassword = $('#oldPassword').val();
   var newPassword = $('#newPassword').val();
   var repeatedNewPassword = $('#repeatedNewPassword').val();
   var message = "";
   if (newPassword !== repeatedNewPassword) {
    $('#alertMessage').text("Las contraseñas no coindicen");
    $('#alert').show();
    return false; 
  }
  Accounts.changePassword(oldPassword, newPassword, function(error) {
    if (error) {
      message = 'Hubo un problema: ' + T9n.get(error.reason);
    } else {
      message = 'Cambiaste correctamente tu contraseña'
    }
    $('#alertMessage').text(message);
    $('#alert').show();  
  });
  $('#oldPassword').val("");
  $('#newPassword').val("");
  $('#repeatedNewPassword').val("");   
},
'click #cancelPasswordChange': function(){
  history.back();
}
});
}


