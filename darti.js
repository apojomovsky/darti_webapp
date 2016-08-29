//Colecciones
Datos= new Meteor.Collection("Datos");
//Logs= new Meteor.Collection("Logs");
Get= new Meteor.Collection("Get");
Inbound = new Meteor.Collection("Inbound");
Maps = new Meteor.Collection("Maps");
Markers = new Mongo.Collection('Markers');

Router.configure({
	layoutTemplate:'main'
});

Router.route('/',{
	name:'home',
	template:'home'
});

Router.route("datos", function() {
  var query = this.request.query;
  this.response.statusCode = 200;
  this.response.end('Recibido');
  ayuda={
	  dirviento:query.dirviento,
	  velviento:query.velviento,
	  lluvia:query.lluvia,
	  temp_ext:query.temp_ext,
	  temp_int:query.temp_int,
	  humedad:query.humedad,
	  presion:query.presion,
	  gps:query.gps,
	  fuente:query.fuente,
	  estado:query.estado,
	  fecha:new Date()
  };
  Meteor.call("cargarDatosGet",ayuda);
  console.log(query);
  // Do something with our found user here (see below).
}, { where: "server" });

Router.route('/informes',{
	name:'informes',
	template:'informes'
});

Router.route('/usuarios',{
	name:'usuarios',
	template:'usuarios'
});

Router.route('/marcadores',{
	name:'marcadores',
	template:'marcadores'
});

Router.route('/agregarMarcador',{
	name:'agregarMarcador',
	template:'agregarMarcador'
});

Router.route('/configuracion',{
	name:'configuracion',
	template:'configuracion'
});

Router.route('/exportarLogsEstacion',{
	name:'exportarLogsEstacion',
	template:'exportarLogsEstacion'
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
	res.statusCode = 200;
	res.end('email received\n');
	if (emailSubject=="trampas"){
		var mensaje1=String(emailBody);
		var mensaje2=mensaje1.slice(1,-1);
		var mensaje3= mensaje2.split("#");
		Inbound.insert({
			Body: emailBody,
			Aldea: mensaje3[0],
			Casa:mensaje3[1],
			Sensor:mensaje3[2],
			Date: emailDate,
			Ack: false,
		});
	}
}, {where: 'server'});

T9n.setLanguage('es');
T9n.map('es', {
    "User not found": "Usuario no encontrado",
    "Match failed": "Por favor introduzca su usuario y contraseña",
    "Incorrect password": "Contraseña equivocada",
    "Email already exists.": "Ya existe un usuario registrado con este correo",
    "Need to set a username or email": "Por favor introduzca su direccion de correo",
    "Password may not be empty": "Por favor introduzca su contraseña"
});

if (Meteor.isServer) {
    if (Markers.find({}).count() === 0) {
        Markers.insert({
			lat: -25.305609,
			lng: -57.560252,
			map: "mapa1",

        });
        Markers.insert({
            'translation': 'en_US',
            'value1': 'translation1',
            'value2': 'translation2'
        });
    }
	Meteor.startup(function () {
		Meteor.publish('Datos',function(){
			//var currentUserId=this.userId;
			//return Datos.find({createdBy: currentUserId})
			return Datos.find()
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
		Meteor.publish('Markers',function(){
			return Markers.find()
		});
	});

	Router.configureBodyParsers = function(){
    	Router.onBeforeAction( Iron.Router.bodyParser.raw({type: '*/*', only: ['inbound'],
    		verify: function(req, res, body){
    		req.rawBody = body.toString();
    	}, where: 'server'}));
	};


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
      	},
		'ultimaDeteccion':function(){
			return Inbound.findOne({}, {sort: {Date: -1, limit: 1}});
		},
		'insertarMarcador':function(uno){
			Markers.insert(uno);
		},
		exportAllContacts: function() {		
		var fields = [
			"Direccion del Viento",
			"Velocidad del Viente",
			"Lluvia",
			"Temperatura Exterior",
			"Temperatura Interior",
			"Humedad",
			"Presion",
			"GPS",
			"Fuente",
			"Estado",
			"Fecha"			
		];
 
		var data = [];		
 
		var logs = Datos.find().fetch();
		_.each(logs, function(c) {
			data.push([
				c.dirviento,
				c.velviento,
				c.lluvia,				
				c.temp_ext,
				c.temp_int,
				c.humedad,
				c.presion,
				c.gps,
				c.fuente,
				c.estado,
				moment.utc(c.fecha).format("DD/MM/YYYY")
			]);
		});
 
		return {fields: fields, data: data};
		},
		exportAllContacts2: function() {		
		var fields = [
			"Aldea",
			"Casa",
			"Sensor",
			"Fecha"		
		];
 
		var data = [];		
 
		var logs = Inbound.find().fetch();
		_.each(logs, function(c) {
			data.push([
				c.Aldea,
				c.Casa,
				c.Sensor,
				c.Date
			]);
		});
 
		return {fields: fields, data: data};
		},
		'updateAck':function(id){
			Inbound.update(id,{$set: {
					Ack:true
			}
			});
		}
	});

	Inbound.find().observeChanges({
	  added: function() {
	    console.log("Se agrego algo a la BD!")
	  },
	  changed: function() {
	    console.log("Se cambio algo de la BD!")
	  },
	  removed: function() {
	    console.log("Se quito algo a la BD!")
	  }
	});
}

if (Meteor.isClient) {
	Meteor.subscribe ('Datos');
	Meteor.subscribe ('Get');
	Meteor.subscribe ('Inbound');
	Meteor.subscribe ('Markers');

	Template.mapview1.onRendered(function () {
		var numSensores=2;
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
		//Logs.findOne({}, {sort: {fecha: -1, limit: 1}}).fetch()
		this.autorun(function() {
				Meteor.call ("ultimaDeteccion", function(error,result){
				if(error){
						console.log(error);
				} else{
						if(result.Sensor=="01" && result.Ack==false){
								Meteor.call("updateAck",result._id);
								marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
						}
				}
				});
		});

		marker.addListener('click', function() {
    		marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
  		});
  		marker2.addListener('click', function() {
	    	marker2.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
  		});
	});

	Template.mapview2.onRendered(function () {
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
			return Inbound.find({}, {sort: {Date: -1} })
		},
		'getDatos':function(){
			return Datos.findOne({}, {sort: {fecha: -1}});
		}
	});

/*
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
*/

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

	Template.exportarLogsEstacion.events({
 		"click #export": function() {
 			MyAppExporter.exportAllContacts();
 		},
 		"click #export2": function(){
 			MyAppExporter.exportAllContacts2();
 		}
 	});

 	Template.agregarMarcador.events({
 		"click #guardarNuevoMarcador": function(){
			var marcadorNuevo = {
 				name: $('.nuevoMarcador #nuevoMarcadorNombre').val(),
 				lat: parseFloat($('.nuevoMarcador #nuevoMarcadorLatitud').val()),
 				long: parseFloat($('.nuevoMarcador #nuevoMarcadorLongitud').val()),
 				aldea: $('.nuevoMarcador #nuevoMarcadorAldea').val(),
 				casa: $('.nuevoMarcador #nuevoMarcadorCasa').val()
 			};

 			console.log(marcadorNuevo);
 			Meteor.call("insertarMarcador",marcadorNuevo);
 			clearForm();
 			$('#limpiarCampos').click();
 		},
 		"click #limpiarCampos":function(){
 			clearForm();
 		}
 	});

 	function clearForm() {
	    $('.nuevoMarcador #nuevoMarcadorNombre').val("");
	    $('.nuevoMarcador #nuevoMarcadorLatitud').val("");
	    $('.nuevoMarcador #nuevoMarcadorLongitud').val("");
	    $('.nuevoMarcador #nuevoMarcadorAldea').val("");
	    $('.nuevoMarcador #nuevoMarcadorCasa').val("");
	};

 	MyAppExporter = {
 		exportAllContacts: function() {
 			var self = this;
 			Meteor.call("exportAllContacts", function(error, data) {

 				if ( error ) {
 					alert(error); 
 					return false;
 				}

 				var csv = Papa.unparse(data);
 				self._downloadCSV(csv);
 			});
 		},
 		exportAllContacts2: function() {
 			var self = this;
 			Meteor.call("exportAllContacts2", function(error, data) {

 				if ( error ) {
 					alert(error); 
 					return false;
 				}

 				var csv = Papa.unparse(data);
 				self._downloadCSV2(csv);
 			});
 		},
 		exportContact: function(id) {
 			var self = this;
 			Meteor.call("exportContact", id, function(error, data) {

 				if ( error ) {
 					alert(error); 
 					return false;
 				}

 				var csv = Papa.unparse(data);
 				self._downloadCSV(csv);
 			});
 		},

 		_downloadCSV: function(csv) {
 			var blob = new Blob([csv]);
 			var a = window.document.createElement("a");
 			a.href = window.URL.createObjectURL(blob, {type: "text/plain"});
 			fecha=moment.utc().format("DD/MM/YYYY");
 			a.download = "Datos_Estacion_"+fecha+".csv";
 			document.body.appendChild(a);
 			a.click();
 			document.body.removeChild(a);
 		},
 		_downloadCSV2: function(csv) {
 			var blob = new Blob([csv]);
 			var a = window.document.createElement("a");
 			a.href = window.URL.createObjectURL(blob, {type: "text/plain"});
 			fecha=moment.utc().format("DD/MM/YYYY");
 			a.download = "Datos_Detecciones_" +fecha+".csv";
 			document.body.appendChild(a);
 			a.click();
 			document.body.removeChild(a);
 		}
 	}
}
