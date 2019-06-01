//navigate to another html page using:   window.location.replace("page.html");

$(function() { //wait for document to fully load before running javascript
      var socket = io();
      
      //Cache DOM
      var $sendButton = $('#sendBut');
      var $messageBox = $('#m');
      var $messageWindow = $('#messages');
      
      socket.emit('loginsucceeded', localStorage.getItem('username'));
      //do this when send message button clicked
      $sendButton.on('click', function(e) { //send message
        e.preventDefault(); // prevents page reloading
        socket.emit('chat message', $messageBox.val());
        $messageBox.val('');
        return false;
      });


      //these socket.on's are called by client for dialog boxes,chat messages, etc. Not directly used by client.
      socket.on('chat message', function(msg) { //receive message
        $messageWindow.append($('<li>').text(msg));
        $messageWindow.scrollTop($messageWindow[0].scrollHeight);
      });
     
    });