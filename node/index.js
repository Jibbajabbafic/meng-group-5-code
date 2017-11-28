var express = require('express')
    , http = require('http');

var app = express();
var path = require('path');
var http = require('http').Server(express);
var io = require('socket.io')(http);

// Define the port to run on
var port = 3000;

// Serve the files in the 'public' folder
app.use(express.static('public'));

// Listen on the specified port
// app.listen(port, function(){
//     console.log('listening on *:' + port);
// });

io.on('connection', function(socket){
    console.log('a user connected');
});

http.listen(port, function(){
    console.log('listening on *:' + port);
});