//navigate to another html page using:   window.location.replace("page.html");

$(function() { //wait for document to fully load before running javascript
      var socket = io();
      
      //toggle off all elements we dont want to see immediately

      //do this when login button clicked
      $('#login').on('click', function(login) {
        login.preventDefault(); // prevents page reloading
        socket.emit('loginid', $('#usernameBox').val(), $('#passwordBox').val());
        $('#usernameBox').val('');
        $('#passwordBox').val('');
        return false;
      });

      //do this when create account button clicked
      $('#create').on('click', function(create) { //bring up create account page
        create.preventDefault(); // prevents page reloading
        $('#overlay').toggle(300, function() {$('#createoverlay').toggle(300); });
        return false;
      });

      //do this when back button clicked
      $('#back').on('click', function(back) { //close create account page
        back.preventDefault(); // prevents page reloading
        $('#createoverlay').toggle(300, function() {$('#overlay').toggle(300); });
        return false;
      });

      //do this when submit button clicked
      $('#submit').on('click', function(submit) { //submit account creation
        submit.preventDefault(); // prevents page reloading
        socket.emit('submit', $('#usernameBoxCreate').val(), $('#passwordBoxCreate').val(), $('#emailBoxCreate').val());
        return false;
      });

      //if you press enter after typing password, will attempt login
      $("#passwordBox").keyup(function(event) {
        if (event.keyCode === 13) {
          $("#login").click();
        }
      });

      //these socket.on's are called by client for dialog boxes,chat messages, etc. Not directly used by client.
      socket.on('loginsuccess', function(username) { //login succeeded
    	localStorage.setItem('username', username);
        $('#overlay').fadeOut(300, function() { window.location.replace("chatPage.html"); });
      });
      socket.on('loginfailure', function() { //dialog box that login failed
        alert("Invalid Login Info, please try again");
      });
      socket.on('createfailure', function() { //dialog box that create failed
        alert("Account Creation Failed, username and password fields required");
      });
      socket.on('createtaken', function() { //dialog box that username already taken
        alert("Account Creation Failed, username already taken");
      });
      socket.on('createsuccess', function() { //dialog box that create succeeded
        alert("Account Created, please login");
        $('#createoverlay').toggle(300, function() { $('#overlay').toggle(300); });
      });
});