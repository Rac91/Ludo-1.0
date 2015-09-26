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
  	$scope.invites = {};
  	$scope.lobbyRoom = [username,'' , '', ''];
  	$scope.party = {};
  	$scope.party['id'] = null;
  	$scope.party['partyUsers'] = [username];
  	$scope.party['mode'] = 2;
  	$scope.animateClass = 'slideLeft';
  	$scope.message = 'Click Ready to join a game!';
	
	$scope.engageUser = function (){
		 
		socket.emit('readyToPlay', $scope.party);
		// $scope.animateClass = 'slideRight';
	};

	$scope.inviteFriend = function (){
		socket.emit('invite',{'userLobby' : $scope.party['id'], 'invitee' : this.user});
	};

	$scope.acceptInvite = function(lobbyId){
		socket.emit('acceptInvite', {'userLobby': $scope.party['id'], 'invitedLobby': lobbyId});
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
    	$scope.party['id'] = lobby['lobbyId'];
    	$scope.party['partyUsers'] = lobby['users'];
		lobbyRoom = lobby['users'];
		needDummy = 4 - lobbyRoom.length;
		for(i=0;i<needDummy;i++)
			lobbyRoom.push('');
		lobbyIndex = lobbyRoom.indexOf(username) 
		lobbyRoom[0] = [username, lobbyRoom[lobbyIndex] = lobbyRoom[0]][0]
		$scope.lobbyRoom = lobbyRoom;
		delete $scope.invites[$scope.party['id']];
    });
    socket.on('inviteRemoved', function(rejector){
    	$window.alert(rejector + 'rejected');
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
