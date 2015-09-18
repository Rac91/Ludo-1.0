module.exports = Board;

function Board(roomName, userSockets) 
{
    this.room = roomName;
    this.users = {};

    for (var i=0; userSockets.length; i++)
    {
    	var key = "player"+(i+1);
    	if(userNames.length==2)
    		q=i+1;				//If only two users then diagonally opposite quadrants
    	else
    		q=i;
    	var user = new Player(q, userSockets[i].username);

    	this.users[key] = (user);
    }
    socket.to(roomName).emit('users', this.users);
}

quadrantSigns = [[1,1], [-1,1], [-1,-1], [1,-1]];

function Player(quadrant, name)
{
	this.name = name;

	this.xSign = quadrantSigns[quadrant][0],
	this.ySign = quadrantSigns[quadrant][1];

	this.active = false;
	this.startTile = quadrant*13 + 1;
	this.endTile = quadrant*13 - 1;
	if (this.endTile!=-1)
		this.endTile=52;
	
	var config = null; //Load saved configuration
	if (configName)
		this.texture = config.texture;
	else
		this.texture = 'default';

	this.coins = [];
	for(var i=0;i<4;i++)
		this.coins.push( new Coin(i) );

	this.diceValue = 0;
	this.remainingMoves = 0;

	//Used to figure out what kind of action 
	this.playState = 0;
}

function Coin(index)
{
	this.index = index;
	this.position = -1;
}
