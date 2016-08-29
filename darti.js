//Colecciones
Datos= new Meteor.Collection("Datos");
Logs= new Meteor.Collection("Logs");

Router.configure({
	layoutTemplate:'main'
});

Router.route('/',{
	name:'home',
	template:'home'
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
			var currentUserId=this.userId;
			return Datos.find({createdBy: currentUserId})
		});
	});
	Meteor.methods({
		'updateAccount': function (data) {
			Meteor.users.update(Meteor.userId(), {$set: {profile: data}});
		},   
	});
	var googleConf =
	ServiceConfiguration.configurations.findOne({service: 'google'});

	var google = user.services.google;

	var client = new GMail.Client({
		clientId: googleConf.clientId,
		clientSecret: googleConf.secret,
		accessToken: google.accessToken,
		expirationDate: google.expiresAt,
		refreshToken: google.refreshToken
	});
}

if (Meteor.isClient) {
	Meteor.subscribe ("Datos");

	Template.registerHelper('userEmail', function () {
		return Meteor.user().emails[0].address;
	});

	Template.registerHelper('userName', function () {
		return Meteor.user().profile.firstName;
	});

	Template.registerHelper('userLastName', function () {
		return Meteor.user().profile.lastName;
	});

	Template.registerHelper('sum', function (number1, number2) {
		return number1+number2;
	});

	Template.registerHelper('date', function (date) {
		return moment(date).format('DD-MM-YYYY, HH:mm');
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
					alert(error.reason);
				} 
			});
		},
		'click #btn-login': function(event){
			event.preventDefault();
			var email = $('#login-username').val();
			var password = $('#login-password').val();
			Meteor.loginWithPassword(email, password, function(error){
				if(error){
					alert(error.reason);
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
	Template.account.events({
		'click #updateAccount': function(){
			var firstName = $('#userFistName').val();
			var lastName = $('#userLastName').val();
			if (firstName === "")
				firstName = Meteor.user().profile.firstName;
			if (lastName === "")
				lastName = Meteor.user().profile.lastName;  
			var data = {
				firstName: firstName,
				lastName:  lastName
			};
			Meteor.call("updateAccount", data);
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
					message = 'Hubo un problema: ' + error.reason;
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
	Template.navbar.events({
		'click .logout': function(event){
			event.preventDefault();
			Meteor.logout();
			Router.go('home');
		}
	});
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
	Meteor.loginWithGoogle({
	  requestOfflineToken: true,
	  forceApprovalPrompt: true,
	  requestPermissions: ["https://www.googleapis.com/auth/gmail.readonly"]
	});
}


