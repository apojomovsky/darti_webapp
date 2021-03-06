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
	template:'marcadores',
	onBeforeAction: function(){
		var currentUser = Meteor.userId();
		if(currentUser){
			this.next();
		} else {
			this.render("login");
		}
	}
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
	console.log(rawEmail);
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
		console.log(mensaje1);
		var mensaje2=mensaje1.slice(1,-1);
		console.log(mensaje2);
		var mensaje3= mensaje2.split("#");
		console.log(mensaje3);
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
		'removerMarcador': function(id){
			Markers.remove(id);
		},

		'modificarMarcador': function(id1, name1, aldea1, casa1, lat1, long1){
			Markers.update({_id:id1} ,{$set: {
				name:name1,
				aldea:aldea1,
				casa:casa1,
				lat:lat1,
				long:long1
			}
		});
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

	Meteor.startup(function() {
		GoogleMaps.load();
	});

	Template.map.onCreated(function() {
		GoogleMaps.ready('map', function(map) {
			google.maps.event.addListener(map.instance, 'click', function(event) {
				Markers.insert({ lat: event.latLng.lat(), lng: event.latLng.lng(), ack: false });
			});

			var markers = {};

			Markers.find().observe({
				added: function (document) {
					var marker = new google.maps.Marker({
						draggable: false,
						position: new google.maps.LatLng(document.lat, document.long),
						map: map.instance,
						id: document._id
					});

					markers[document._id] = marker;
				},
				changed: function (newDocument, oldDocument) {
					markers[newDocument._id].setPosition({ lat: newDocument.lat, lng: newDocument.lng });
				},
				removed: function (oldDocument) {
					markers[oldDocument._id].setMap(null);
					google.maps.event.clearInstanceListeners(markers[oldDocument._id]);
					delete markers[oldDocument._id];
				}
			});
		});

		Template.map.helpers({
			mapOptions: function() {
				if (GoogleMaps.loaded()) {
					return {
						center: new google.maps.LatLng(-25.304251,-57.560504),
						zoom: 16
					};
				}
			}
		});
	});

	Template.map2.onCreated(function() {
		GoogleMaps.ready('map2', function(map) {
			google.maps.event.addListener(map2.instance, 'click', function(event) {
				Markers.insert({ lat: event.latLng.lat(), lng: event.latLng.lng(), ack: false });
			});

			var markers = {};

			Markers.find().observe({
				added: function (document) {
					var marker = new google.maps.Marker({
						draggable: false,
						position: new google.maps.LatLng(document.lat, document.long),
						map: map2.instance,
						id: document._id
					});

					markers[document._id] = marker;
				},
				changed: function (newDocument, oldDocument) {
					markers[newDocument._id].setPosition({ lat: newDocument.lat, lng: newDocument.lng });
				},
				removed: function (oldDocument) {
					markers[oldDocument._id].setMap(null);
					google.maps.event.clearInstanceListeners(markers[oldDocument._id]);
					delete markers[oldDocument._id];
				}
			});
		});

		Template.map2.helpers({
			mapOptions: function() {
				if (GoogleMaps.loaded()) {
					return {
						center: new google.maps.LatLng(-25.342111,-57.625373),
						zoom: 16
					};
				}
			}
		});
	});

	Template.map3.onCreated(function() {
		GoogleMaps.ready('map3', function(map) {
			google.maps.event.addListener(map3.instance, 'click', function(event) {
				Markers.insert({ lat: event.latLng.lat(), lng: event.latLng.lng(), ack: false });
			});

			var markers = {};

			Markers.find().observe({
				added: function (document) {
					var marker = new google.maps.Marker({
						draggable: false,
						position: new google.maps.LatLng(document.lat, document.long),
						map: map3.instance,
						id: document._id
					});

					markers[document._id] = marker;
				},
				changed: function (newDocument, oldDocument) {
					markers[newDocument._id].setPosition({ lat: newDocument.lat, lng: newDocument.lng });
				},
				removed: function (oldDocument) {
					markers[oldDocument._id].setMap(null);
					google.maps.event.clearInstanceListeners(markers[oldDocument._id]);
					delete markers[oldDocument._id];
				}
			});
		});

		Template.map3.helpers({
			mapOptions: function() {
				if (GoogleMaps.loaded()) {
					return {
						center: new google.maps.LatLng(-25.304251,-57.560504),
						zoom: 16
					};
				}
			}
		});
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

Template.marcadores.helpers({
	'marcador': function(){
		return Markers.find();
	}
});

Template.marcadores.events({
	'click #removerMarcador':function(){
		if(confirm("Estas seguro que desea borrar este marcador?") == true)
		Meteor.call("removerMarcador",this._id);
	},
	'click #modifyMarker':function(){
		$(".modal-body #modifyMarkerName").val(this.name);
		$(".modal-body #modifyMarkerAldea").val(this.aldea);
		$(".modal-body #modifyMarkerCasa").val(this.casa);
		$(".modal-body #modifyMarkerId").val(this._id);
		$(".modal-body #modifyMarkerLat").val(this.lat);
		$(".modal-body #modifyMarkerLong").val(this.long);
	}
});

Template.marcadorModal.events({
	'click #guardarMarcadorMod':function(){
		var name=$('#modifyMarkerName').val();
		var aldea=$('#modifyMarkerAldea').val();
		var casa=$('#modifyMarkerCasa').val();
		var lat=$('#modifyMarkerLat').val();
		var long=$('#modifyMarkerLong').val();
		var id= $('#modifyMarkerId').val();
		Meteor.call("modificarMarcador",id, name, aldea, casa, lat, long);
		$('#marcadorModal').modal('hide');
	}
});

function clearForm() {
	$('.nuevoMarcador #nuevoMarcadorNombre').val("");
	$('.nuevoMarcador #nuevoMarcadorLatitud').val("");
	$('.nuevoMarcador #nuevoMarcadorLongitud').val("");
	$('.nuevoMarcador #nuevoMarcadorAldea').val("");
	$('.nuevoMarcador #nuevoMarcadorCasa').val("");
};

$(document).ready(function(){
	$('.filterable .btn-filter').click(function(){
		var $panel = $(this).parents('.filterable'),
		$filters = $panel.find('.filters input'),
		$tbody = $panel.find('.table tbody');
		if ($filters.prop('disabled') == true) {
			$filters.prop('disabled', false);
			$filters.first().focus();
		} else {
			$filters.val('').prop('disabled', true);
			$tbody.find('.no-result').remove();
			$tbody.find('tr').show();
		}
	});

	$('.filterable .filters input').keyup(function(e){
		/* Ignore tab key */
		var code = e.keyCode || e.which;
		if (code == '9') return;
		/* Useful DOM data and selectors */
		var $input = $(this),
		inputContent = $input.val().toLowerCase(),
		$panel = $input.parents('.filterable'),
		column = $panel.find('.filters th').index($input.parents('th')),
		$table = $panel.find('.table'),
		$rows = $table.find('tbody tr');
		/* Dirtiest filter function ever ;) */
		var $filteredRows = $rows.filter(function(){
			var value = $(this).find('td').eq(column).text().toLowerCase();
			return value.indexOf(inputContent) === -1;
		});
		/* Clean previous no-result if exist */
		$table.find('tbody .no-result').remove();
		/* Show all rows, hide filtered ones (never do that outside of a demo ! xD) */
		$rows.show();
		$filteredRows.hide();
		/* Prepend no-result row if all rows are filtered */
		if ($filteredRows.length === $rows.length) {
			$table.find('tbody').prepend($('<tr class="no-result text-center"><td colspan="'+ $table.find('.filters th').length +'">No result found</td></tr>'));
		}
	});
});


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
