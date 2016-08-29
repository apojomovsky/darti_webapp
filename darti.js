//Colecciones
Datos= new Meteor.Collection("Datos");
//Logs= new Meteor.Collection("Logs");
Get= new Meteor.Collection("Get");
Inbound = new Meteor.Collection("Inbound");
Markers = new Meteor.Collection("Markers");

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
		//var currentUserId=this.userId;
		//return Datos.find({createdBy: currentUserId})
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
		'insertarMarcador':function(marcadoor){
			Markers.insert(marcadoor);
		},
		'removeMarker': function(markerId){
			Markers.remove(markerId);
		},
		'updateMarker':function(id,name,aldea,casa){
			Markers.update(id,{$set:{
					name:name,
					aldea:aldea,
					casa:casa
				}
			});
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
		Meteor.call ("ultimaDeteccion", function(error,result){
			if(error){
				console.log(error);
			} else{
				if(result.Sensor=="01"){
					marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
				}
			}
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

	Template.marcadores.helpers({
		'punto':function(){
			return Markers.find();
		}
	});

	Template.marcadores.events({
		'click #modifyMarker': function(){
			$(".modal-body #modifyMarkerName").val(this.name);
			$(".modal-body #modifyMarkerAldea").val(this.aldea);
			$(".modal-body #modifyMarkerCasa").val(this.casa);
			$(".modal-body #modifyMarkerId").val(this._id);
		},
		'click #removeMarker': function () {  
			if (confirm("Estas seguro que desea borrar este marcador?") == true)
				Meteor.call("removeMarker", this._id);
		},
		'keyup #filter': function (event) {
			var rex = new RegExp($(event.target).val(), 'i');
			$('.searchable tr').hide();
			$('.searchable tr').filter(function () {
				return rex.test($(this).text());
			}) .show();
		}
	});
	Template.marcadoresModal.events({
		'click #saveClientModify': function(){
			var name = $('#modifyMarkerName').val();
			var aldea = $('#modifyMarkerAldea').val();
			var casa = $('#modifyMarkerCasa').val();
			var marcador = Markers.findOne($(".modal-body #modifyMarkerId").val());
			var id = marcador._id;
			if (name === "")
				name = marcador.name;
			if (aldea === "")
				aldea = marcador.aldea;
			if (casa === "")
				casa = marcador.casa;
			Meteor.call("updateMarker", id, name, aldea, casa);
			$('#marcadoresModal').modal('hide'); 
		},
		'click #modifyClientLink': function() {
			$('#clientModal').modal('hide');
			$('body').removeClass('modal-open');
			$('.modal-backdrop').remove();
		}
	});

	Template.agregarMarcador.events({
		'click #saveNewMarker':function(){
			var markerName = $('.addMarker #newMarker').val();
			var markerLat = parseFloat($('.addMarker #newMarkerLat').val());
			var markerLong = parseFloat($('.addMarker #newMarkerLong').val());
			var markerAldea = $('.addMarker #newMarkerAldea').val();
			var markerCasa = $('.addMarker #newMarkerCasa').val();

			var marcadorNuevo = {
				name: markerName,
				lat: markerLat,
				long: markerLong,
				aldea: markerAldea,
				casa: markerCasa,
			};
			console.log(marcadorNuevo);

			Meteor.call("insertarMarcador",marcadorNuevo);
			clearForm();
			$('#clearFields').click();
		},
		'click #clearFields': function() {
			clearForm(); 
		}
	});
	
	function clearForm() {
    $('.addMarker #newMarker').val("");
    $('.addMarker #newMarkerLat').val("");
    $('.addMarker #newMarkerLong').val("");
    $('.addMarker #newMarkerAldea').val("");
    $('.addMarker #newMarkerCasa').val("");
	}


}
