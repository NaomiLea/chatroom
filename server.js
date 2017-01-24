var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var express = require("express");
var port = 3000;
var onlineUsers = [];
var formidable = require('formidable');
var path = require('path');
var fs = require('fs');
var numberOnline = 0;
var uuid = require('node-uuid');
var Room = require('./room.js');
var rooms = {};
app.use(express.static(__dirname + '/'));

app.get('/index', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
    console.log('a user connected');

    socket.on("join", function(user) {
        roomID = null;
        var people = {};
        people.name = user;
        people.socketid = socket.id;
        people[user.id] = {
            "name": user,
            "room": roomID
        };
        console.log(people.name)
        io.emit("update-people", people);
        socket.nickname = user;
        onlineUsers.push(people);
        io.emit("user list", onlineUsers);
        numberOnline++;
        console.log(numberOnline);
        io.emit('people online', "People online: " + numberOnline);
        io.emit("roomList", {
            rooms: rooms
        });


    });
    socket.on('chat message', function(msg) {
        var today = new Date();
        var hour = today.getHours();
        var min = today.getMinutes();
        min = min > 9 ? min : '0' + min;
        var time = hour + ":" + min;
        var nickname = socket.nickname;

        io.emit('user message', time + " " + nickname);
        io.emit('chat message', msg);
        io.emit("upload file", msg);
    });

    socket.on('disconnect', function() {
        numberOnline--;
        console.log('user disconnected');
        for (var i = 0; i < onlineUsers.length; i++) {
            if (onlineUsers[i].socketid == socket.id) {
                onlineUsers.splice(i, 1);
            };

        }
        io.emit("user list", onlineUsers);
        io.emit('people online', "People online: " + numberOnline);
    });
    console.log(numberOnline);
});
io.on("createRoom", function(name) {
    if (people[user.id].room === null) {
        var id = uuid.v4();
        var room = new Room(user, id, user.id);
        rooms[id] = room;
        socket.sockets.emit("roomList", {
            rooms: rooms
        }); //update the list of rooms on the frontend
        io.room = name; //name the room
        io.join(user.room); //auto-join the creator to the room
        room.addPerson(client.id); //also add the person to the room object
        people[user.id].room = id; //update the room key with the ID of the created room
    } else {
        socket.sockets.emit("update", "You have already created a room.");
    }
    console.log("hello");
});

//Uploading document

app.post('/upload', function(req, res) {
    var form = new formidable.IncomingForm();
    form.multiples = false;
    form.uploadDir = path.join(__dirname, "/uploads");
    form.on('file', function(field, file) {
        fs.rename(file.path, path.join(form.uploadDir, file.name));
    });
    form.on('error', function(err) {
        console.log('An error has occured: \n' + err);
    });

    form.on('end', function() {
        res.end('success');
    });

    form.parse(req);
});

http.listen(port, function() {
    console.log('listening on *:' + port);
});

console.log(numberOnline);
