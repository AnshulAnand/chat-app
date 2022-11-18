const express = require('express');
const app = express();
const http = require('http');
server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const formatMessages = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users.js');

const BOT = 'Bot';

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

io.on('connection', socket => {
    socket.on('joinroom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);

        // welcome new user
        socket.emit('message', formatMessages(BOT, 'welcome to chat-app'));

        // broadcast when a user connects
        socket.broadcast.to(user.room).emit('message', formatMessages(BOT, `${user.username} has joined the chat`));

        // get room users
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    // listen for chat message
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessages(user.username, msg));
    });

    // when client disconnets
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        if (user) {
            io.to(user.room).emit('message', formatMessages(BOT, `${user.username} has left the chat`));
            
            // get room users
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        };
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`server running on port ${PORT}`));