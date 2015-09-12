var ludoControllers = angular.module('ludoControllers', []);

ludoControllers.controller('LoginCtrl', function ($scope, $rootScope, $location, socket) {
  	
  	$scope.username = '';

	$scope.register = function(u){
		username = $scope.username || u;
		if(username)
			socket.emit('register', username);
	};

	socket.on('userRegistered', function(user){
		$rootScope.username=user;
		console.log('Redirecting to home')
		$location.path("/home");
	});
});

ludoControllers.controller('BoardCtrl', function ($scope, socket) {
  	
  	$scope.userList = {};
	socket.on('usersList', function(users){
		console.log('Fresh list of users');
		$scope.userList = users;
     });
     socket.emit('getUsers');
	
	socket.on('userReady', function(user){
		$scope.userList[user] = 'active';
		// statusDiv = document.getElementById(user).firstChild.firstChild;
		// statusDiv.className = statusDiv.className.split(' ')[0] + '  active';
	});
	$scope.engageUser = function ()
						 {
							socket.emit('readyToPlay');
						 }

	socket.on('userRegistered', function(user){
		$scope.userList[user] = 'idle';
	});

	socket.on('deregister', function (user) {
		if ($scope.userList[user])
    		delete $scope.userList[user];
});

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
