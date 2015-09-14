var app = angular.module('ludoApp', ['ngRoute', 'ngCookies', 'ludoControllers'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider
	  .when('/login', {
	    templateUrl: 'partials/login.html',
	    controller: 'LoginCtrl'
	  })
	  .when('/lobby', {
	    templateUrl: 'partials/lobby.html',
	    controller: 'LobbyCtrl'
	  })
	  .when('/game', {
	    templateUrl: 'partials/game.html',
	    controller: 'BoardCtrl'
	  })
	  .otherwise({
	    redirectTo: '/login'
	  });
}])
.factory('Authenticate', ['$cookies', function($cookies){
var cookieKey = 'ludoApp_user',
	user = $cookies.get(cookieKey);

return {
	cookieKey: cookieKey,
    setUser : function(username){
    	$cookies.put(cookieKey, username);
        user = username;
    },
    removeUser : function(){
    	if(user)
    		$cookies.remove(cookieKey);
        user = undefined;
    },
    isLoggedIn : function(){
        return (user)? user : false;
    }
  };
}])
.factory('socket', ['$rootScope', '$location', 'Authenticate', function ($rootScope, $location, Authenticate) {
  
  var socket = io.connect(),
  	  user = Authenticate.isLoggedIn();
  if (user)
  	{
		socket.on('relogin', function(){
			console.log('Reconnected. Redirecting to home');
			Authenticate.setUser(user);
			$location.path('/lobby');
		});
		socket.emit('relogin', user);
	}
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
}])
.run(['$rootScope', '$location', '$cookies', 'Authenticate', function($rootScope, $location, $cookies, Authenticate) {

    $rootScope.$on('$routeChangeStart', function (event) {

        if (!Authenticate.isLoggedIn()) {
            // event.preventDefault();
            $location.path('/login');
        }
        else
        	$location.path('/lobby');
    });

}]);
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
