//Colecciones
Datos= new Meteor.Collection("Datos");
Logs= new Meteor.Collection("Logs");
Get= new Meteor.Collection("Get");

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
	});
	
	var gmailClients = {};
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
				}*/
				if (message._id!=Logs.findOne({mailId:message._id})){
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
			});
		}
	});

	return Meteor.methods({
		'cargarDatosGet': function(ayuda){
			Datos.insert(ayuda);
		},
		'ultimaDeteccion':function(){
			var loco=Logs.findOne({}, {sort: {fecha: -1, limit: 1}});
			return loco;
		}
	});

}

if (Meteor.isClient) {
	Accounts.ui.config({
	    requestOfflineToken: { google: true },
	    forceApprovalPrompt: { google: true },
	    requestPermissions: { google: ["https://www.googleapis.com/auth/gmail.readonly"] }
  	});

	Meteor.subscribe ('Datos');
	Meteor.subscribe ('Logs');
	Meteor.subscribe ('Get');

	Template.mapview1.onRendered(function () {
		/*Logs.insert({
			ack:false,
			aldea:1,
			casa:1,
			sensor:1
		});
		Logs.insert({
			ack:false,
			aldea:1,
			casa:2,
			sensor:1
		});*/
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
		//var ultimaDeteccion= Logs.findOne({}, {sort: {fecha: -1, limit: 1}}).fetch();
		console.log(Logs.findOne({}, {sort: {fecha: -1, limit: 1}}));
		if(Logs.find().count()!=0){
			if(ultimaDeteccion.aldea===1 && ultimaDeteccion.casa===1 && ultimaDeteccion.ack===false){
				marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
			}
			if(ultimaDeteccion.aldea===1 && ultimaDeteccion.casa===2 && ultimaDeteccion.ack===false){
				marker2.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
			}
		}
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

	/*Template.mapview1.helpers({
		'ultimo':function(){
			return Logs.findOne({}, {sort: {fecha: -1, limit: 1}})
		}
	});*/

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
}


