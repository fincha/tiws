var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('../../lib/socket.io').listen(server);
var port = process.env.PORT || 3001;



server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

// Chatroom

// usernames which are currently connected to the chat
var usernames = {};
var numUsers = 0;

io.on('connection', function (socket) {
  var addedUser = false;

  // console.log("test")

  socket.on("signin", function(data) {
    console.log("User signed in: " + data.me);
  });
});






// /**
//  * App.
//  */
// var express = require("express");
//   var app = express();


// app.get('/', function (req, res) {
//   res.render('index', { layout: false });
// });
// /**
//  * App configuration.
//  */


// /**
//  * App routes.
//  */

// /**
//  * App listen.
//  */

// server.listen(3001, function () {
//   console.log('Server listening at port %d', 3001);
// });

// app.use(express.static(__dirname + '/public'));


// /**
//  * Socket.IO server (single process only)
//  */

// var io = sio.listen(app)
//   , nicknames = {};

// io.sockets.on('connection', function (socket) {
//   socket.on('user message', function (msg) {
//     socket.broadcast.emit('user message', socket.nickname, msg);
//   });

//   socket.on('nickname', function (nick, fn) {
//     if (nicknames[nick]) {
//       fn(true);
//     } else {
//       fn(false);
//       nicknames[nick] = socket.nickname = nick;
//       socket.broadcast.emit('announcement', nick + ' connected');
//       io.sockets.emit('nicknames', nicknames);
//     }
//   });

//   socket.on('disconnect', function () {
//     if (!socket.nickname) return;

//     delete nicknames[socket.nickname];
//     socket.broadcast.emit('announcement', socket.nickname + ' disconnected');
//     socket.broadcast.emit('nicknames', nicknames);
//   });
// });