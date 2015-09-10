var username;
var socket = io();
var userList = document.getElementById('users');

socket.on('usersList', function(users){
	console.log('Fresh list of users');
	userList.innerHTML = '';
	for(var i=0; i<users.length;i++)
		addUser(users[i]);
});

socket.on('userRegistered', function(user){
	console.log('I signed up!');
	addUser(user);
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

function addUser(u)
{
	user = document.createElement('div');
	user.className = 'user';
	user.id = u;
	
	statusWrap = document.createElement('div');
	statusWrap.className = 'statusWrap';
	icon = document.createElement('div');
	icon.className = 'status idle';
	statusWrap.appendChild(icon);

	username = document.createElement('div');
	username.className = 'name';
	username.innerHTML = u;

	user.appendChild(statusWrap);
	user.appendChild(username);

	userList.appendChild( user );
}

function getUserName()
{
	username = document.getElementById('username').value;
	if(username)
		register(username)
}

function register(u)
{
	socket.emit('register', u);
}

function engageUser()
{
	socket.emit('readyToPlay');
}

document.getElementById('register').addEventListener('click', getUserName);
document.getElementById('ready').addEventListener('click', engageUser);
