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

function addUser(u)
{
	div = document.createElement('div');
	div.className = 'user';
	div.innerHTML = u;
	userList.appendChild( div );
}

function register()
{
	username = document.getElementById('username').value;
	if(username)
		socket.emit('register', username);
}

document.getElementById('register').addEventListener('click', register);