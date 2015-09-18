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
		$location.path('/lobby');
	});
});

ludoControllers.controller('LobbyCtrl', function ($scope, socket, $location, Authenticate, $window) {
  	
  	$scope.userList = {};
  	$scope.invites = [];
  	$scope.animateClass = 'slideLeft';
  	$scope.message = 'Click Ready to join a game!';
	
	$scope.engageUser = function (){
		socket.emit('readyToPlay');
		$scope.animateClass = 'slideRight';
	};

	$scope.inviteFriend = function (){
		socket.emit('invite',this.user);
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
		$scope.userList[user] = 'searching';
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

    socket.on('invited',function(host){
    	$scope.invites.push(host);
    });

});

ludoControllers.controller('BoardCtrl', function ($q, $scope, Authenticate) {
	
	function loadScript(link) {
		var deferred = $q.defer();

	    var script = document.createElement('script'); // use global document since Angular's $document is weak
	    script.src = link;
	    document.body.appendChild(script);

	    script.addEventListener('load', function(s) {
	    	console.log('Loaded ' + s.srcElement.src);
			deferred.resolve();
		}, false);
		
		return deferred.promise;
	}

    $scope.dependencies =[
               	'js/lib/three.min.js',
               	'js/lib/stats.min.js',
               	'js/lib/OrbitControls.js',
               	'js/lib/Detector.js',
               	'js/app.js'
            ];
 	
 	$scope.promiseChain = [];
 	angular.forEach($scope.dependencies, function(link){
 		console.log('Loading '+link);
 		if ($scope.prevPromise)
 			$scope.prevPromise[$scope.prevPromise.length-1].then(loadScript(link));
 		else
 			$scope.promiseChain.push( loadScript(link) );
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
