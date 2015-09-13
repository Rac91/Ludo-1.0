var ludoControllers = angular.module('ludoControllers', []);

ludoControllers.controller('LoginCtrl', function ($scope, $rootScope, $location, Authenticate, socket) {

	$scope.register = function(u){
		username = $scope.username || u;
		if(username)
			socket.emit('register', username);
	};

	socket.on('newUser', function(user){
		Authenticate.setUser(user);
		console.log('Redirecting to home');
		$location.path('/home');
	});
});

ludoControllers.controller('LobbyCtrl', function ($scope, socket, $location, Authenticate) {
  	
  	$scope.userList = {};
  	$scope.animateClass = 'slideLeft';
  	$scope.message = 'Click Ready to join a game!';
	
	$scope.engageUser = function (){
		socket.emit('readyToPlay');
		$scope.animateClass = 'slideRight';
	};

	$scope.logoutUser = function(){
		socket.emit('logout');
	}

	socket.on('setUsers', function(users){
		console.log('Fresh list of users');
		$scope.userList = users;
    });
    socket.emit('getUsers');
	
	socket.on('userReady', function(user){
		$scope.userList[user] = 'active';
	});

	socket.on('newUser', function(user){
		$scope.userList[user] = 'idle';
	});

	socket.on('disconnected', function (user) {
		$scope.userList[user] = 'dc';
	});

	socket.on('loggedOut', function (user) {
		delete $scope.userList[user];
	});

	socket.on('logout', function(user){
		Authenticate.removeUser();
		$location.path('/login');
	});

});

ludoControllers.controller('BoardCtrl', function ($scope, Authenticate) {
	alert('In game');
});
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
