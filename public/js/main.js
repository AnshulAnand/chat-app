const socket = io();
const chatForm = document.querySelector('.input');
const chatContainer = document.querySelector('.chat-container');
const roomName = document.querySelector('.room-name');
const userList = document.querySelector('.user-list');

// get username and room from URL
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
}); 

// join room
socket.emit('joinroom', { username, room });

// message from server
socket.on('message', message => {
	console.log(message);
	outputMessage(message);

	// scroll down
	chatContainer.scrollTop = chatContainer.scrollHeight;
});

// get room users
socket.on('roomUsers', ({ room, users }) => {
	outputRoomName(room);
	outputUsers(users);
});

chatForm.addEventListener('submit', (e) => {
	e.preventDefault();
	const msg = e.target.elements.msg.value;

	// emit msg to server
	socket.emit('chatMessage', msg);

	// clear input
	e.target.elements.msg.value = '';
	e.target.elements.msg.focus();
});

// output message to DOM
function outputMessage(message) {
	const div = document.createElement('div');
	div.classList.add('message');
	div.innerHTML = `
	<div class="message-info">
    	<span>${message.username}</span>
        <span>${message.time}</span>
    </div>
    <p>${message.text}</p>
	`;
	document.querySelector('.chat-container').appendChild(div);
}

// add room name to DOM
function outputRoomName(room) {
	roomName.innerHTML = room;
}

// add users to user-list
function outputUsers(users) {
	userList.innerHTML = `
	${users.map(user => `<li>${user.username}</li>`).join('')}
	`;
}