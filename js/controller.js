var ludoControllers = angular.module('ludoControllers', []);

ludoControllers.controller('LoginCtrl', function ($scope, $rootScope, $location, Authenticate, socket) {

	$scope.register = function(u){
		username = $scope.username || u;
		if(username)
			socket.emit('register', username);
	};

	socket.on('registered', function(user){
		Authenticate.setUser(user);
		console.log('Redirecting to home');
		$location.path('/lobby');
	});

	if(username)
		$scope.register(username);

});

ludoControllers.controller('LobbyCtrl', function ($scope, socket, $location, Authenticate) {
  	
 	$scope.userList = {};
  	$scope.invites = {};
  	$scope.lobbyRoom = [username,'' , '', ''];
  	$scope.lobbyId = null;
  	$scope.mode = 4;
  	$scope.animateClass = 'slideLeft';
  	$scope.message = 'Click Ready to join a game!';

	$scope.engageUser = function (){
		socket.emit('readyToPlay', {'mode': $scope.mode, 'users': $scope.lobbyRoom.filter(Boolean)});
		// $scope.animateClass = 'slideRight';
	};

	$scope.inviteFriend = function (){
		socket.emit('invite',{'userLobby' : $scope.lobbyId, 'invitee' : this.user});
	};

	$scope.acceptInvite = function(lobbyId){
		socket.emit('acceptInvite', {'userLobby': $scope.lobbyId, 'invitedLobby': lobbyId});
	}

	$scope.removeInvite = function(requestedUser){
		socket.emit('removeInvite', requestedUser);
	}

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

	socket.on('lockUsers', function(users){
		console.log('Checking if', Authenticate.getUser(), ' in ', users, ' : ', users.indexOf(Authenticate.getUser()));
		if (users.indexOf(Authenticate.getUser())!=-1)
			$location.path('/game');
		else
			for(var i=0; i<users.length;i++)
				if ($scope.userList[users[i]])
					$scope.userList[users[i]] = 'engaged';
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

    socket.on('invited',function(inviteRequest){
    	$scope.invites[inviteRequest['id']] = inviteRequest['host'];
    });

    socket.on('inviteAccepted', function(lobby){
		lobbyRoom = lobby['users'];
		$scope.lobbyId = lobby['lobbyId'];
		needDummy = 4 - lobbyRoom.length;
		for(i=0;i<needDummy;i++)
			lobbyRoom.push('');
		lobbyIndex = lobbyRoom.indexOf(username) 
		lobbyRoom[0] = [username, lobbyRoom[lobbyIndex] = lobbyRoom[0]][0]
		$scope.lobbyRoom = lobbyRoom;
		delete $scope.invites[$scope.lobbyId];
    });

    socket.on('inviteRemoved', function(rejector){
    	$window.alert(rejector + 'rejected');
    });

});

ludoControllers.controller('BoardCtrl', function ($q, $scope, socket, Authenticate) {

	$scope.serverMessage = ''
	$scope.showMessage = false;

	function loadScript(index) {
		var deferred = $q.defer();
		console.log('Loading '+$scope.dependencies[index]);

	    var script = document.createElement('script');
	    script.src = $scope.dependencies[index];
	    document.body.appendChild(script);

	    script.addEventListener('load', function(s) {
	    	target = s.target || s.srcElement;
	    	console.log('Loaded ' + target.src);
			deferred.resolve(index+1);
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
	
 	var successLoad = function(i){
 		if(i<$scope.dependencies.length)
 		{
 			$scope.prevPromise = loadScript(i);
 			$scope.prevPromise.then(successLoad);
 		}
 		else
 		{
 			$scope.setupSockets();
 			// loadObjects();
 		}
 	};

 	$scope.prevPromise = loadScript(0);
 	$scope.prevPromise.then(successLoad);

 	$scope.setupSockets = function(){

 		socket.on('assetsToLoad', function(textures){
 			
 			console.log('To load');
 			console.log(textures);

			toLoad = {  //'coin': ['redCoin.json'],
						'coin': ['texturedDabba.json', 'brick.jpg'],
			   			'fort': ['fenceSingle.json', 'bark.jpg', 'wood.jpg', 'woodLight.jpg'],
			   			'base': ['grassTexture32.png'],
			   			'path': ['mudPath32.png'],
			   			'road': ['cementPath32.png']};
   			toLoadCount = Object.keys(toLoad).length;

   			loadCompleteCallback = function(){
	 			socket.emit('texturesLoaded');
 			};
 			
			loadObjects();
 		});

 		socket.on('userInit', function(userObj){
 			console.log(userObj);
	 		init(userObj, socket);
	 		user = userObj;
 		});

 		socket.on('boardsBuilt',function(userObj){
 			console.log(userObj.name+' is also ready');
 			initUser(userObj, socket);
 		});

 		socket.on('startGame', function(users){
 			console.log('Game Start!');
 			$scope.serverMessage = 'Game Start!'
 			$scope.showMessage = true;
 			animate();
 		});

 		socket.on('turnStart', function(user){
 			console.log('Turn started for ' + user);
 		});

 		socket.on('diceRolled', function(user, value){
 			console.log('Dice rolled for ' + value);
 		});

 		socket.on('coinMoved', function(coin){
 			console.log('Turn end');
 		});

 		socket.on('turnEnd', function(user){
 			console.log('Turn ended for ' + user);
 		});
 		
 		console.log('Calling server for load details');
 		socket.emit('readyToLoad');
	};
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
