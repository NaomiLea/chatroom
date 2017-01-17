var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var express = require("express");
var port = 3000;
var onlineUsers = [];
var formidable = require('formidable');
var path = require('path');
var fs = require('fs');
app.use(express.static(__dirname + '/'));
app.use(express.static(path.join(__dirname, 'public')));


app.get('/index', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.post("/loaded", function(req, res) {
    console.log("Hello");
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
        min = min > 9 ? min : '0' + min;
        var time = hour + ":" + min;
        var nickname = socket.nickname;
        io.emit('user message', time + " " + nickname);
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
