var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var express = require("express");
var port = 3000;
var onlineUsers = [];
console.log(onlineUsers);
app.use(express.static(__dirname + '/'));


app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
    console.log('a user connected');

    socket.on("join", function(user) {
        var people = {};
        people.name = user;
        people.socketid = socket.id;
        io.emit("update-people", people);
        socket.nickname = user;
        onlineUsers.push(people);
        io.emit("user list", onlineUsers);


    });
    socket.on('chat message', function(msg) {

        var today = new Date();
        var hour = today.getHours();
        var min = today.getMinutes();
        min = min > 9 ? min: '0' + min;
        var time = hour + ":" + min;
        var nickname = socket.nickname;
        io.emit('user message', time + "   " + nickname);
        io.emit('chat message', msg);


    });
    socket.on('disconnect', function() {

        console.log('user disconnected');


        for (var i = 0; i < onlineUsers.length; i++) {
            if (onlineUsers[i].socketid == socket.id) {
                onlineUsers.splice(i, 1);
            };

        }
        io.emit("user list", onlineUsers);

    });


});

http.listen(port, function() {
    console.log('listening on *:' + port);
});
