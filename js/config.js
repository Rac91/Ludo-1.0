var app = angular.module('ludoApp', ['ngRoute', 'ludoControllers'])
.run(function($rootScope) {
    $rootScope.username = '';
});

app.config(['$routeProvider',
	function($routeProvider) {
	$routeProvider.
	  when('/login', {
	    templateUrl: 'partials/login.html',
	    controller: 'LoginCtrl'
	  }).
	  when('/home', {
	    templateUrl: 'partials/game.html',
	    controller: 'BoardCtrl'
	  }).
	  otherwise({
	    redirectTo: '/login'
	  });
}]);

app.factory('socket', function ($rootScope) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
});	

// socket.on('usersList', function(users){
// 	console.log('Fresh list of users');

// 	document.getElementById('login').style.opacity = '0';
// 	document.getElementById('messageBoard').style.opacity = '0.7';
// 	document.getElementById('scene').style.opacity = '0.3';

// 	userList.innerHTML = '';
// 	for(var i=0; i<users.length;i++)
// 		addUser(users[i]);
// });

// socket.on('userRegistered', function(user){
// 	addUser(user);
// });

// socket.on('userReady', function(user){
// 	statusDiv = document.getElementById(user).firstChild.firstChild;
// 	statusDiv.className = statusDiv.className.split(' ')[0] + '  active';
// });

// socket.on('failure', function(msg){
// 	alert(msg);
// });

// socket.on('deregister', function (user) {
// 	statusDiv = document.getElementById(user);
// 	userList.removeChild(statusDiv);
// });

// socket.on('disconnect', function () {
// 	console.log('You got disconnected from the server');
// });

// function addUser(u)
// {
// 	user = document.createElement('div');
// 	user.className = 'user';
// 	user.id = u;
	
// 	statusWrap = document.createElement('div');
// 	statusWrap.className = 'statusWrap';
// 	icon = document.createElement('div');
// 	icon.className = 'status idle';
// 	statusWrap.appendChild(icon);

// 	username = document.createElement('div');
// 	username.className = 'name';
// 	username.innerHTML = u;

// 	user.appendChild(statusWrap);
// 	user.appendChild(username);

// 	userList.appendChild( user );
// }

// function getUserName()
// {
// 	username = document.getElementById('username').value;
// 	if(username)
// 		register(username)
// }

// function register(u)
// {
// 	socket.emit('register', u);
// }

// function engageUser()
// {
// 	socket.emit('readyToPlay');
// }

// document.getElementById('register').addEventListener('click', getUserName);
// document.getElementById('ready').addEventListener('click', engageUser);