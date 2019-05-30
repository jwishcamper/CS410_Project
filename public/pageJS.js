//navigate to another html page using:   window.location.replace("page.html");

$(function() { //wait for document to fully load before running javascript
      var socket = io();
      socket.emit('loginsucceeded', localStorage.getItem('username'));
      //do this when send message button clicked
      $('#sendBut').on('click', function(e) { //send message
        e.preventDefault(); // prevents page reloading
        socket.emit('chat message', $('#m').val());
        $('#m').val('');
        return false;
      });


      //these socket.on's are called by client for dialog boxes,chat messages, etc. Not directly used by client.
      socket.on('chat message', function(msg) { //receive message
        $('#messages').append($('<li>').text(msg));
        $('#messages').scrollTop($('#messages')[0].scrollHeight);
      });
     
    });