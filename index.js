/*
 *  CLIENT SIDE CODE IN THIS FILE  *
 * 
 * 
 * 
 * Example SQL query:
 * sqlcon.query("select username from userDB.userStorage where userID=1", function (err, result, fields) {
		  if(err) console.log(err);
		    console.log(result);
		  });		  
 * */


//require vars
const express = require("express");
const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var sql = require('mysql');

//clients and username array are used to store usernames without having to query database every time.
//when a user connects, it stores their socket ID in clients and their username in username[] at the same index
//when a user sends a message, it pulls their username from username[clients.indexOf(socket)]
//for private messages, can search for index of a specific username and get socket.id of that username from clients[]
var clients = [];
var username = [];


//sql connection
var sqlcon = sql.createConnection({
	  host: "localhost",
	  user: "student",
	  password: "password"
	});

//connect to database
sqlcon.connect(function(err) {
	if(err) console.log(err);
	else console.log("Database connected.");
});

//load public directory
app.use(express.static('public'));

//do this when user connects
io.on('connection', function(socket){
  console.log('a user connected');
  clients.push(socket.id); 
  username[clients.indexOf(socket)] = "Anonymous";
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
  });
  
  //do this when user sends a message
  //when implementing private chats, io.emit will change to io.to(socket.id [of appropriate socket] ).emit
  socket.on('chat message', function(msg){
    io.emit('chat message',username[clients.indexOf(socket)]+": "+ msg);
  });
  
//do this when user attempts to login
socket.on('loginid', function(loginid,pass){
	    //query login and pass from database, if exists login and change user name
	  sqlcon.query("select username from userDB.userStorage where username = \""+loginid+"\" and userpass = \""+pass+"\";", function (err, result, fields) {
		  if(err) console.log(err);
		  if(result[0] != null) {
		  io.to(socket.id).emit('loginsuccess');
		    username[clients.indexOf(socket)] = result[0].username; }
		  else{
			  io.to(socket.id).emit('loginfailure');
		  }
		  });		 
});
  
//do this when user attempts to create an account
  socket.on('submit', function(loginid,pass,email){
	    //take user input to create an account in database
	  if(loginid=="" || pass ==""){//if there's nothing in user or pass fields, stop here
		  io.to(socket.id).emit('createfailure');
	  }
	  else{ //if this query has something, the username is taken
		  sqlcon.query("select username from userDB.userStorage where username = \""+loginid+"\";", function (err, result, fields) {
		  if(err) console.log(err);
		  if(result[0] != null) {
			  io.to(socket.id).emit('createtaken');
		  }
		  else{ //if not, go ahead and insert into database
			  sqlcon.query("insert into userDB.userStorage values(default,\""+loginid+"\",\""+pass+"\",\""+email+"\",curdate(),0,null);", function (err, result, fields) {
				  if(err) {console.log(err);  }
				  else{ io.to(socket.id).emit('createsuccess'); }
				  });	
		  }
		  });
	  }
  });

//do this when user disconnects
  socket.on('disconnect', function(){
	clients.splice(clients.indexOf(socket), 1);
	username.splice(clients.indexOf(socket), 1);
    console.log('user disconnected');
  });
});

//socket listen
http.listen(3000, function(){
  console.log('listening on *:3000');
});