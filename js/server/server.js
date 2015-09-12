var express = require('express');
var bodyparser = require('body-parser');
var router = express.Router();

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
    	if (Object.keys(users).indexOf(username)==-1)
    		return res.sendStatus(200);
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
	    var text = "";
	    var possible = "abcdefghijklmnopqrstuvwxyz012345ABCDEFGHIJKLMNOPQRSTUVWXYZ6789";

	    for( var i=0; i < 5; i++ )
	        text += possible.charAt(Math.floor(Math.random() * possible.length));
	    if (Object.keys(gameRooms).indexOf(text)==-1)
	    	return text;
	}
}

var minUsers = 3;

var users = {},
	gameRooms = [],
	queuedUsers = [];

io.on('connection', function(socket){
	console.log( socket.id, ' turned up. Late.');
	socket.on('register', function(username){
		
  		if(username && !users[username])
  		{
  			console.log('Registering ', username);
  			socket.username = username;
  			users[username] = 'idle';
  			socket.join('registered');
  			io.sockets.in('registered').emit('userRegistered', username );
  		}
  		else
  			socket.emit('failure', "Santa doesn't like naughty children");
	});

	socket.on('getUsers', function(){
		socket.emit('usersList', users );
	});

	// socket.on('createRoom', function(roomName){
	// 	if(socket.username && gameRooms.indexOf(roomName)===-1)
	// 	{
	// 		gameRooms.push( roomName );
	// 		socket.broadcast.emit('addRoom', roomName );
	// 	}
	// 	else
	// 		socket.emit('failure', "Santa doesn't like naughty children");
	// });

	socket.on('readyToPlay', function(){
		queuedUsers.push(socket);
		users[socket.username] = 'active';
		console.log('Queue length ', queuedUsers.length);
		if(queuedUsers.length>=minUsers)
		{
			freezeCount = queuedUsers.length;
			gameRoom = generateId();
			var lockUsers = [];
			while(--freezeCount > 0)
			{
				userSocket = queuedUsers.shift();
				lockUsers.push( userSocket.username );
				userSocket.join(gameRoom);
			}
			var game = gameRooms[gameRoom] = new Board(gameRoom, lockUsers);
			io.sockets.emit('lockUsers', lockUsers);
		}
		else
		{
			io.sockets.in('registered').emit('userReady', socket.username );
		}
	});
	
	socket.on('disconnect', function(){
		if (users[socket.username])
		{
			username = socket.username;
			console.log('Deregistering ', username);
	      	delete users[username];
	      	for(var i=0;i<queuedUsers.length;i++)
		      	if(queuedUsers[i].username==username)
		      	{
		      		queuedUsers.splice(i,1);
		      		break;
		      	}

	      	socket.to('registered').broadcast.emit('deregister', username);
	    }
	    else
	    	console.log( socket.id, ' just left without a word.');
	});
});
