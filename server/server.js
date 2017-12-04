var config = require('../config');
var app = require('http').createServer()
var io = require('socket.io')(app);
var fs = require('fs');
var a1=0;
var a2=0;
var a3=0;
var a4=0;
var a5=0;
require('colors');
app.listen(config.serverPort);

console.log(("Boot UP!").red.bold);
console.log(("Server booted up!").green.bold);
console.log(("...").white);
console.log(("Connected with Feeder.").green.bold);
console.log(("                                                         [INFO] ").green.bold );
console.log(("Max. Bots: " + config.maxBots).white);
console.log(("Port: " + config.serverPort).white);
console.log("Random Skin: "+ config.useRandomSkinName);
io.on('connection', function(socket) {

  socket.on('login', function(data) {
	if(data.uuid!=config.client_uuid)return;
    /*console.log("User connected with id:" + "qyuXlxCOLL5lcld");
    socket.room = "qyuXlxCOLL5lcld";
    socket.join("qyuXlxCOLL5lcld");*/
   console.log("Feeder using UUID: " + data.uuid);
    console.log("");
    socket.room = data.uuid;
    socket.join(data.uuid);
    if (data.type == "server") {      
      io.sockets.in(socket.room).emit("force-login", "Spawning Bots");
    }

  });

  socket.on('pos', function(data) {
	  if(socket.room!=config.client_uuid)return;
    //console.log(data, "s");
    io.sockets.in(socket.room).emit('pos', data);
  });

  socket.on('cmd', function(data) {
	  if(socket.room!=config.client_uuid)return;
    console.log(data);
    io.sockets.in(socket.room).emit('cmd', data);
	    io.sockets.in(socket.room).emit('cmd1', data);
		    io.sockets.in(socket.room).emit('cmd2', data);
  });
  
  socket.on("spawn-count1", function(data) {
	  if(socket.room!=config.client_uuid)return;
	  a1=data;
    io.sockets.in(socket.room).emit("spawn-count", a1+a2+a3+a4+a5);
	    io.sockets.in(socket.room).emit("tyt", a1+a2+a3+a4+a5);
    });
	  socket.on("spawn-count2", function(data) {
		  if(socket.room!=config.client_uuid)return;
		  	  a2=data;
    io.sockets.in(socket.room).emit("spawn-count", a1+a2+a3+a4+a5);
	    io.sockets.in(socket.room).emit("tyt", a1+a2+a3+a4+a5);
    });
	  socket.on("spawn-count3", function(data) {
		  if(socket.room!=config.client_uuid)return;
		  	  a3=data;
    io.sockets.in(socket.room).emit("spawn-count", a1+a2+a3+a4+a5);
	    io.sockets.in(socket.room).emit("tyt", a1+a2+a3+a4+a5);
    });
	  socket.on("spawn-count4", function(data) {
		  if(socket.room!=config.client_uuid)return;
		  	  a4=data;
    io.sockets.in(socket.room).emit("spawn-count", a1+a2+a3+a4+a5);
	    io.sockets.in(socket.room).emit("tyt", a1+a2+a3+a4+a5);
    });
	  socket.on("spawn-count5", function(data) {
		  if(socket.room!=config.client_uuid)return;
		  	  a5=data;
    io.sockets.in(socket.room).emit("spawn-count", a1+a2+a3+a4+a5);
	    io.sockets.in(socket.room).emit("tyt", a1+a2+a3+a4+a5);
    });

  socket.emit("force-login", "Checked!");

});