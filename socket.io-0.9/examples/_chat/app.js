// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('../..')(server);
var port = process.env.PORT || 3001;

var db, Db = require('mongodb').Db,
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    ReplSetServers = require('mongodb').ReplSetServers,
    ObjectID = require('mongodb').ObjectID,
    Binary = require('mongodb').Binary,
    GridStore = require('mongodb').GridStore,
    Grid = require('mongodb').Grid,
    Code = require('mongodb').Code,
    BSON = require('mongodb').pure().BSON,
    assert = require('assert');

var mongoclient = new MongoClient(new Server("localhost", 27017), {"native_parser": true});
  // Open the connection to the server
    mongoclient.open(function(err, mongoclient) {

    console.log("mongo open");

    // Get the first db and do an update document on it
    db = mongoclient.db("chat_app");
    
  });

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

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {

  // console.log(data);

    db.collection('chat_messages').insert({ 
      "from" : socket.username, 
      "to" : data.to, 
      "device_id" : data.device_id, 
      "device_os": data.device_os, 
      "message": data.message, 
      "app_version": data.app_version, 
      "lang": data.lang, 
      "country": data.country 
    }, function(o, a) {
        console.log(o);
        console.log(a);
    });


    // console.log(socket.rooms);

    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data.message
    });

    // console.log("rooms:" + socket.rooms)
    // console.log("data:" + data)
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (res) {

    // console.log(res.me + " > " + res.target);
    // console.log();

    // we store the username in the socket session for this client
    socket.username = res.me;
    // socket.rooms = [username]
    // add the client's username to the global list
    usernames[res.me] = res.me;
    ++numUsers;
    addedUser = true;


    //send event to all connected clients
    socket.emit('login', {
      numUsers: numUsers,
      success : true
    });

    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });


    db.collection("chat_app", function(err, collection) {
        collection.find({}, function(err, cursor) {
             cursor.each(function(err, item) {
                console.log(item);
            });
          })
    });


    // oldMessages.forEach(function(oldMessage) {
    //     console.log(oldMessage)
    // });
    //   console.log(oldMessages[m].message);
    //   socket.broadcast.emit('new message', {
    //   username: socket.username,
    //   message: oldMessages[m].message
    // });
    // }

    // console.log("rooms:" + socket.rooms)

    // socket.join("dd", function(r) {
    //   console.log(r);
    // })

  if(res.me == "testUser" || res.me == "mobileUser") {
    // socket.rooms = [
    //   "room1"
    // ]

    console.log("room1 join")

    socket.join("room1");
  }

  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    // remove the username from global usernames list
    if (addedUser) {
      delete usernames[socket.username];
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});
