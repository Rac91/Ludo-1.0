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

socket.on('failure', function(msg){
	alert(msg);
});

socket.on('disconnect', function () {
	alert('You got disconnected from the server');
});

function addUser(u)
{
	div = document.createElement('div');
	div.className = 'user';
	div.innerHTML = u;
	userList.appendChild( div );
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

document.getElementById('register').addEventListener('click', getUserName);