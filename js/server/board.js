module.exports = Board;
var _ = require('lodash');

function Board(io, roomName, userSockets) 
{
    this.room = roomName;
    this.users = {};

	console.log('Constructing board for game room ' + roomName + ' with '+ userSockets.length + ' players in it');
	// console.log(userSockets);

	quadrantSigns = [ [-1,1], [1,1], [1,-1], [-1,-1] ];
    this.gameTextures = {};

    for (var i=0; i < userSockets.length; i++)
    {
    	var userSocket = userSockets[i],
    		key = userSocket.username;
    	
    	if(i===1 && userSockets.length==2)
    		q=i+1;				//If only two users then diagonally opposite quadrants
    	else
    		q=i;

    	console.log('Creating player object for '+ userSocket.username);
    	var user = new Player(this, q, key);

    	setupBoardListeners(this, userSocket);
    	this.users[key] = user;
    	console.log(key + ' ready');
    }

	function Player(board, quadrant, name)
	{
		this.name = name;

		this.xSign = quadrantSigns[quadrant][0],
		this.ySign = quadrantSigns[quadrant][1];
		this.startRotation = (q-2)*Math.PI/2;

		this.active = false;

		this.base = quadrant;
		this.startTile = quadrant*13 + 1;
		this.endTile = quadrant*13 - 1;
		if (this.endTile!=-1)
			this.endTile=52;
		
		var loadoutSets = null; //Load saved configuration
		if (loadoutSets)
		{
			var loadoutKeys = Object.keys(config); 
			for (var i=0; i < loadoutKeys.length; i++)
			{
				var key = loadoutKeys[i],
					texture = loadoutSets[ key ];
				if ( !(_.contains( board.gameTextures, texture)) )
					board.gameTextures[key] =texture;
			}
			// this.texture = config.texture;
		}
		else
		{
			board.gameTextures['coin_default'] = [];
			board.gameTextures['base_default'] = [];
			board.gameTextures['fort_default'] = [];
		}

		// if ( !(_.contains( board.gameTextures, this.texture)) )
		// 	board.gameTextures.push(this.texture);

		this.coins = [];
		for(var i=0;i<4;i++)
			this.coins.push( new Coin(i) );

		this.diceValue = 0;
		this.remainingMoves = 0;

		//Used to figure out what kind of action 
		this.playState = 0;

		console.log('Player object created for ' + name);
	}

	function Coin(index)
	{
		this.index = index;
		this.position = -1;
	}

	function setupBoardListeners(board, socket)
	{
		socket.on('readyToLoad', function(){
			console.log(socket.username + ' ready to load');
			console.log('Sending textures ' + board.gameTextures);
			socket.emit('assetsToLoad', board.gameTextures);
		});

		socket.on('texturesLoaded', function(){
			console.log(socket.username + ' textures loaded');
			socket.emit('userInit', board.users[socket.username]);
		});

		console.log('Sockets ready for user ' + socket.username);
	}
}
