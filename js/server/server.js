var express = require('express');
var bodyparser = require('body-parser');
var router = express.Router();

require('./ip_module.js')();
app = express();
app.use(express.static(__dirname+'/../../.'));
var Board = require('./board.js');


var server = app.listen(process.env.PORT || 7896);
var io = require('socket.io').listen(server);

router.use(bodyparser.urlencoded({ extended: true }));

app.use('/', router); 

router.get('/',function(req,res){
    res.sendFile('index.html', { root: __dirname});
});

router.post('/register',function(req,res){
    var username = '' || req.body['user'];
    if(username)
    {
    	if (Object.keys(userStatus).indexOf(username)==-1)
    	{
    		userStatus[username] = 'disconnected';
    		return res.sendStatus(200);
    	}
    	else	
    		return res.status(400).send({'error': 'username already in use'});
    }
    else 
    	return res.status(400).send({'error': 'No username sent'});
});

function generateId()
{
	while(true)
	{
	    var text = '';
	    var possible = 'abcdefghijklmnopqrstuvwxyz012345ABCDEFGHIJKLMNOPQRSTUVWXYZ6789';

	    for( var i=0; i < 5; i++ )
	        text += possible.charAt(Math.floor(Math.random() * possible.length));
	    if (Object.keys(gameRooms).indexOf(text)==-1)
	    	return text;
	}
}

function startGame(minUsers, gameBoat)
{

}

var userStatus = {}, userSockets = {}, lobbyRoom = {},userLobby = {},
	gameRooms = [],
	queuedUsers = [],
	twoPlayer = [], threePlayer = [], fourPlayer= [],
	queueCount = 0;

io.on('connection', function(socket){
	console.log( socket.id, ' turned up. Late.');

	socket.on('register', function(username){
		
  		if(username && !userStatus[username])
  		{
  			console.log('Registering ', username);
  			socket.username = username;
  			userSockets[username] = socket;
  			userStatus[username] = 'idle';
  			socket.join('registered');
  			io.sockets.in('registered').emit('newUser', username );
  		}
  		else
  			socket.emit('failure', "Santa doesn't like naughty children");
	});

	socket.on('getUsers', function(){
		if(socket.username && userStatus[socket.username])
			socket.emit('setUsers', userStatus );
	});

	socket.on('invite', function(inviteRequest){
		console.log(inviteRequest);
		lobbyId = inviteRequest['userLobby'];
		invitee = inviteRequest['invitee']
		if(invitee && socket.username && userSockets[invitee]  && userStatus[invitee] =='idle' && invitee != socket.username)
		{
			if(!lobbyId)
			{
				lobbyId = generateId();
				lobbyRoom[lobbyId] = [];
				lobbyRoom[lobbyId].push(socket.username);
				socket.join(lobbyId);
			}
			console.log('in invite',lobbyId);
			userSockets[invitee].emit('invited', {'id' : lobbyId, 'host' : socket.username});
 			socket.emit('inviteSent');
			console.log(socket.username + ' invited '  + invitee);
		}
		else
			socket.emit('failure', "Couldn't find "+invitee+"!");
	});

	socket.on('acceptInvite', function(party){
		// lobbyId = null;
		// console.log(lobbyRoom);
		// for(key in lobbyRoom)
		// {
		// 	if (lobbyRoom[key].indexOf(requestedUser) != -1 || lobbyRoom[key].indexOf(socket.username) != -1)
		// 	{
		// 		lobbyId = key;
		// 		break;
		// 	}
		// }
		// console.log(lobbyId);
		// if(! lobbyId)
		// {
		// 	lobbyId = generateId();
		// 	lobbyRoom[lobbyId] = [];
		// 	lobbyRoom[lobbyId].push(requestedUser);
		// 	userSockets[requestedUser].join(lobbyId);
		// }
		invitedLobby = party['invitedLobby'];
		userLobby = party['userLobby']
		console.log(invitedLobby, userLobby)
		if (!userLobby)
			userLobbyLen = 0;
		else 
			userLobbyLen = lobbyRoom[userLobby].length ;
		if(lobbyRoom[invitedLobby].length < 4 && lobbyRoom[invitedLobby].indexOf(socket.username) == -1 && userLobbyLen < 2)
		{
			socket.join(invitedLobby);
			lobbyRoom[invitedLobby].push(socket.username);
			io.sockets.in(invitedLobby).emit('inviteAccepted',{'lobbyId' : invitedLobby, 'users': lobbyRoom[invitedLobby]});
			console.log('invitedlobby: ', lobbyRoom[invitedLobby]);
		}
	});

	socket.on('removeInvite', function(requestedUser){
			console.log('removing request from ' + requestedUser);
			userSockets[requestedUser].emit('inviteRemoved', socket.username);
	});

	socket.on('readyToPlay', function(party){
		var gameBoat = [];

		minUsers = party['mode'];
		partyUsers = party['users'];
		required = minUsers - partyUsers.length;
		console.log(required, partyUsers, minUsers);
		if (required === 0)
		{
			for (i= 0; i<partyUsers.length; i++)
			{
				user = partyUsers[i]
				userStatus[user] = 'engaged';
				gameBoat.push(userSockets[user]);
			}
		}
		else
		{
			if(minUsers === 2)
			{
				twoPlayer.push(userSockets[partyUsers[0]]);
				gameBoat = twoPlayer;
			}
			else if(minUsers === 3)
			{
				for(i= 0; i<party['users'].length; i++)
					threePlayer.push(userSockets[partyUsers[i]])
				gameBoat = threePlayer;
			}
			else
			{
				for(i= 0; i<party['users'].length; i++)
					fourPlayer.push(userSockets[partyUsers[i]])
				gameBoat = fourPlayer;;
			}
		}

		if(gameBoat && gameBoat.length>=minUsers)
		{
			freezeCount = minUsers+1;
			gameRoom = generateId();
			console.log(gameRoom);
			var lockUserSockets = [],
				lockUserNames = [];
			while(--freezeCount)
			{
				userStatus[socket.username] = 'engaged';
				userSocket = gameBoat.shift();
				lockUserSockets.push( userSocket );
				lockUserNames.push( userSocket.username );
				userSocket.join(gameRoom);
			}
			console.log('Constructing board');
			var game = gameRooms[gameRoom] = new Board(io, gameRoom, lockUserSockets);
			console.log('Emitting locked users', lockUserNames);
			io.sockets.in('registered').emit('lockUsers', lockUserNames);
		}
		else
			io.sockets.in('registered').emit('userReady', socket.username );
		
		// if (userStatus[socket.username] === 'idle')
		// {
		// 	userStatus[socket.username] = 'searching';
		// 	queuedUsers.push(socket);
		// 	queueCount++;
		// 	console.log('Queue length ', queuedUsers.length);
		// 	if(queuedUsers.length>=minUsers)
		// 	{
		// 		freezeCount = queuedUsers.length+1;
		// 		gameRoom = generateId();
		// 		var lockUsers = [];
		// 		while(--freezeCount > 0)
		// 		{
		// 			userStatus[socket.username] = 'engaged';
		// 			userSocket = queuedUsers.shift();
		// 			lockUsers.push( userSocket );
		// 			userSocket.join(gameRoom);
		// 		}
		// 		console.log('Constructing board');
		// 		var game = gameRooms[gameRoom] = new Board(io, gameRoom, lockUsers);
		// 		console.log('Emitting locked users');
		// 		io.sockets.emit('lockUsers', lockUsers);
		// 	}
		// 	else
		// 	{
		// 		io.sockets.in('registered').emit('userReady', socket.username );
		// 	}
		// }
	});

	socket.on('relogin', function(username){
		console.log('Reconnect check: '+ userStatus[username]);
		if(userStatus[username]==='disconnected')
		{
			console.log('Reconnecting ', username);
			socket.username = username;
			userStatus[username] = 'idle';
	  		socket.join('registered');
	  		socket.to('registered').broadcast.emit('relogin', username);
	  		socket.emit('relogin');
	  	}
	});
	
	socket.on('disconnect', function(){
		console.log(socket.username+' disconnected');
		if (userStatus[socket.username])
		{
			username = socket.username;

	      	for(var i=0;i<queuedUsers.length;i++)
		      	if(queuedUsers[i].username==username)
		      	{
		      		queuedUsers.splice(i,1);
		      		break;
		      	}
	      	userStatus[username] = 'disconnected';

	      	socket.to('registered').broadcast.emit('disconnected', username);
	    }
	    else
	    	console.log( socket.id, ' just left without a word.');
	});

	socket.on('logout', function(){
		if (userStatus[socket.username])
		{
			username = socket.username;
			console.log('logging out ', username);

			socket.leave('registered');
			delete userSockets[username];
	      	delete userStatus[username];

	      	socket.emit('logout');
	      	socket.to('registered').broadcast.emit('loggedOut', username);
		}
	});
});
