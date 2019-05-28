/*
 * Example SQL query:
 * sqlcon.query("select username from userDB.userStorage where userID=1", function (err, result, fields) {
		  if(err) console.log(err);
		    console.log(result);
		  });		  
 * */



var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var sql = require('mysql')
var clients = [];
var username = [];
var sqlcon = sql.createConnection({
	  host: "localhost",
	  user: "student",
	  password: "password"
	});

sqlcon.connect(function(err) {
	if(err) console.log(err);
	else console.log("Database connected.");
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  clients.push(socket); 
  username[clients.indexOf(socket)] = "Anonymous";
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
  });
  
  socket.on('chat message', function(msg){
    io.emit('chat message',username[clients.indexOf(socket)]+": "+ msg);
  });
  
  socket.on('loginid', function(loginid,pass){
	    //query login and pass from database, if exists login and change user name
	  sqlcon.query("select username from userDB.userStorage where username = \""+loginid+"\" and userpass = \""+pass+"\";", function (err, result, fields) {
		  if(err) console.log(err);
		  if(result[0] != null) {
		  io.emit('loginsuccess');
		    username[clients.indexOf(socket)] = result[0].username; }
		  else{
			  io.emit('loginfailure');
		  }
		  });		 
	  });
  
  socket.on('submit', function(loginid,pass,email){
	    //take user input to create an account in database
	  if(loginid=="" || pass ==""){//if there's nothing in user or pass fields, stop here
		  io.emit('createfailure');
	  }
	  else{
		  sqlcon.query("select username from userDB.userStorage where username = \""+loginid+"\";", function (err, result, fields) {
		  if(err) console.log(err);
		  if(result[0] != null) {
			  io.emit('createtaken'); //if this query has something, the username is taken
		  }
		  else{ //if not, go ahead and insert into database
			  sqlcon.query("insert into userDB.userStorage values(default,\""+loginid+"\",\""+pass+"\",\""+email+"\",curdate(),0,null);", function (err, result, fields) {
				  if(err) {console.log(err);  }
				  else{ io.emit('createsuccess'); }
				  });	
		  }
		  });
	  }
  });
  
  socket.on('namechange', function(chg){
	  username[clients.indexOf(socket)] = chg;
  });
  
  socket.on('disconnect', function(){
	clients.splice(clients.indexOf(socket), 1);
    console.log('user disconnected');
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});