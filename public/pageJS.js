$(function() { //wait for document to fully load before running javascript
      var socket = io();
      
      //contains a list of userID's of friends, updated every time populateFriends(); is called
      var friends = [];
      
      //Cache DOM
      var $sendButton = $('#sendBut');
      var $messageBox = $('#m');
      var $messageWindow = $('#messages');
      
      socket.emit('loginsucceeded', localStorage.getItem('username'));
      populateFriends(); //initial populate
      
      //do this when send message button clicked
      $sendButton.on('click', function(e) { //send message
        e.preventDefault(); // prevents page reloading
        socket.emit('chat message', $messageBox.val());
        $messageBox.val('');
        return false;
      });


      //these socket.on's are called by client for dialog boxes,chat messages, etc. Not directly called by client.
      socket.on('chat message', function(msg) { //receive message
        $messageWindow.append($('<li>').text(msg));
        $messageWindow.scrollTop($messageWindow[0].scrollHeight);
      });
      
      //called when friend added successfully
      socket.on('friendAdded', function() {
    	  populateFriends();
    	  alert("Friend added!"); 
      });
      
      //called to populate friends list
      socket.on('friendsList',function(name){
    	  friends.push(name);
      });
      
      //helper function to populate user's friends list
      function populateFriends(){
    	  friends.length=0;
    	  socket.emit('populateFriends');
      }
      
    });