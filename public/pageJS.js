$(function() { //wait for document to fully load before running javascript
      var socket = io();
      
      //contains a list of userID's of friends, updated every time populateFriends(); is called
      var friends = [];
      
      //Cache DOM
      var $sendButton = $('#sendBut');
      var $messageBox = $('#m');
      var $messageWindow = $('#messages');
      var $friendsPane = $('#friends');
      var $addFriendButton = $('#addButton');
      
      socket.emit('loginsucceeded', localStorage.getItem('username'));
      var name = localStorage.getItem('username');
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
      //called by server when any user logs in or disconnects, passes array of usernames "onlineUsers"
      socket.on('populateOnline',function(onlineUsers){
    	  //for each user in list given, make an html element to display online users
    	  $(".friendObject").remove();
    	  var friendsOnline =[]; //used to store online friends so they are not displayed in offline section
    	  //populate online friends
    	  $("<div class='friendObject'><p>Online Friends:</p></div>").appendTo($friendsPane);
    	  for(var i =0;i<onlineUsers.length;i++){
    		  //create element for online users
    		  if(friends.includes(onlineUsers[i])||onlineUsers[i]==name){
    			  $("<div class='friendObject'><p>"+onlineUsers[i]+"</p></div>").appendTo($friendsPane);
    			  friendsOnline.push(onlineUsers[i]); 
    		  }
    	  }
    	  //populate offline friends
    	  $("<div class='friendObject'><p>Offline Friends:</p></div>").appendTo($friendsPane);
    	  for (var i =0;i<friends.length;i++){
    		  if(!friendsOnline.includes(friends[i])){
    			  $("<div class='friendObject'><p>"+friends[i]+"</p></div>").appendTo($friendsPane);
    		  }
    	  }
      });
      
      //helper function to populate user's friends list
      function populateFriends(){
    	  friends.length=0;
    	  socket.emit('populateFriends');
      }
      
    //Do this when add friend button is clicked
      $addFriendButton.on('click', function(e){
    	 e.preventDefault();  //Prevents page reloading
    	 var friend = prompt("Enter username", "");
    	 if(friend != null){
    		 addFriend(friend);
    	 }
      });
    //Helper function to add friends
      function addFriend(friend){
    	  socket.emit('addFriend', friend, name);
      }
    });