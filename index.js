/*
 *  SERVER SIDE CODE IN THIS FILE  *
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
  console.log('a user connected: '+socket.id);
  socket.on('chat message', function(msg){
    console.log(socket.id + ' message: ' + msg);
  });
  
  //do this when user sends a message
  //when implementing private chats, io.emit will change to io.to(socket.id [of appropriate socket] ).emit
  socket.on('chat message', function(msg){
    io.emit('chat message', username[clients.indexOf(socket.id)]+": "+ msg);
  });
  
//do this when user attempts to login
socket.on('loginid', function(loginid,pass){
	    //query login and pass from database, if exists login and change user name
	  sqlcon.query("select username from userDB.userStorage where username = \""+loginid+"\" and userpass = \""+pass+"\";", function (err, result, fields) {
		  if(err) console.log(err);
		  if(result[0] != null) 
			  io.to(socket.id).emit('loginsuccess',result[0].username);
		  else
			  io.to(socket.id).emit('loginfailure');
		  });		 
});
  
//this is to store socket.id when user gets to appropriate page after login
socket.on('loginsucceeded',function(un){
	clients.push(socket.id); 
	username[clients.indexOf(socket.id)] = un; 
	setTimeout(function() {
		io.emit('populateOnline',username);
	}, 200);
	
});

//do this when user attempts to create an account
  socket.on('submit', function(loginid,pass,email){
	    //take user input to create an account in database
	  if(loginid=="" || pass ==""){//if there's nothing in user or pass fields, stop here
		  io.to(socket.id).emit('createfailure');
	  }
	  else{ 
		  sqlcon.query("select username from userDB.userStorage where username = \""+loginid+"\";", function (err, result, fields) {
		  if(err) console.log(err);
		  if(result[0] != null) {
			  io.to(socket.id).emit('createtaken'); //if this query has something, the username is taken
		  }
		  else{ //if not, go ahead and insert into database
			  if(email!=""){//if user inputted an email
				  sqlcon.query("insert into userDB.userStorage values(default,\""+loginid+"\",\""+pass+"\",\""+email+"\",curdate(),0,null);", function (err, result, fields) {
				  if(err) {console.log(err);  }
				  else{ io.to(socket.id).emit('createsuccess'); }
				  });	
			  }
			  else{//if no email, go ahead and insert null for email field
				  sqlcon.query("insert into userDB.userStorage values(default,\""+loginid+"\",\""+pass+"\",null,curdate(),0,null);", function (err, result, fields) {
					  if(err) {console.log(err);  }
					  else{ io.to(socket.id).emit('createsuccess'); }
					  });	
			  }
		  }
		  });
	  }
  });
  
//add friend, call this method when friend request accepted
//try to handle duplicate requests before this is called - ie, dont allow users to add someone already a friend
  
  socket.on('addFriend', function(user1,user2){
	  var userid1,userid2;
	  getUserID(user1, function(result){
		  userid1=result;
	  });
	  getUserID(user2, function(result){
		  userid2=result;
		  sqlcon.query("insert into userDB.friendsList values(\""+userid1+"\",\""+userid2+"\");", function (err, result, fields) {
			  if(err) { console.log(err);  }
			  else { }
		  });
		  sqlcon.query("insert into userDB.friendsList values(\""+userid2+"\",\""+userid1+"\");", function (err, result, fields) {
			  if(err) { console.log(err);  }
			  else {io.to(socket.id).emit('friendAdded');}
		  });
	  });
  });

//populate friends list, call this method from clientside js either on login or add friend
  socket.on('populateFriends', function() {
	  getUserID(username[clients.indexOf(socket.id)], function(result){
		  var userid=result;
		  sqlcon.query("select userID2 from userDB.friendsList where userID1 = \""+userid+"\";", function (err, result, fields) {
			  if(err) { console.log(err); }
			  else {
				  for (var i = 0; i < result.length; i++) {
					  sqlcon.query("select username from userDB.userStorage where userID="+result[i].userID2+";", function (err, result2, fields) {
						  if(err) console.log(err); 
						  else { io.to(socket.id).emit('friendsList',result2[0].username); }
					  });
				  }
			  }
		  }); 
	  });
  });
  
//helper function to get userid from username
   function getUserID(userToGet, callback){
	  sqlcon.query("select userID from userDB.userStorage where username=\""+userToGet+"\";", function (err, result, fields) {
		  if(err) console.log(err); 
		  else { 
			  callback(result[0].userID);}
	  });
  }
   //way to update friends list from client
  socket.on('updateList',function(){
	  io.emit('populateOnline',username);
  });
  socket.on('updateAdded',function(usernameToUpdate,otherName){
	  io.to(clients[username.indexOf(usernameToUpdate)]).emit('reqPopulate',otherName);
  });
//do this when user disconnects
  socket.on('disconnect', function(){
	  if(clients.includes(socket.id)){
		username.splice(clients.indexOf(socket.id), 1);
		clients.splice(clients.indexOf(socket.id), 1);
		io.emit('populateOnline',username);
	  }
    console.log('user disconnected');
  });
});

//socket listen
http.listen(3000, function(){
  console.log('listening on *:3000');
});