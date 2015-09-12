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
  	
  	$scope.username = '';
	
	$scope.getUsername = function (){
		
		if($scope.username)
			register($scope.username)
	};

	$scope.register = function(){
		socket.emit('register', u);
	};

	socket.on('usersList', function(users){
	console.log('Fresh list of users');

	document.getElementById('login').style.opacity = '0';
	document.getElementById('messageBoard').style.opacity = '0.7';
	document.getElementById('scene').style.opacity = '0.3';

	userList.innerHTML = '';
	for(var i=0; i<users.length;i++)
		addUser(users[i]);
});


socket.on('userReady', function(user){
	statusDiv = document.getElementById(user).firstChild.firstChild;
	statusDiv.className = statusDiv.className.split(' ')[0] + '  active';
});

socket.on('failure', function(msg){
	alert(msg);
});

socket.on('deregister', function (user) {
	statusDiv = document.getElementById(user);
	userList.removeChild(statusDiv);
});

socket.on('disconnect', function () {
	console.log('You got disconnected from the server');
});
});