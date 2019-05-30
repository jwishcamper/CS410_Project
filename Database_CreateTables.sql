--drop schema userDB;
create schema userDB;

CREATE TABLE userStorage (
  userID	    int auto_increment not null,
  username      varchar(40) not null,
  userpass      varchar(40) not null,
  useremail     varchar(40), 
  datecreated   DATETIME not null,
  isModerator   boolean default false,
  chatLogs		mediumtext, -- storage for about 3 million words
  primary key (userID)
);
CREATE TABLE friendsList (
  userID1	int not null,
  userID2	int not null,
  primary key (userID1,userID2),
  foreign key (userID1) references userStorage(UserID),
  foreign key (userID2) references userStorage(UserID)
);
CREATE TABLE accRecovery (
  recoveryID    int not null,
  userID	    int not null,
  datesubmitted datetime not null,
  primary key (recoveryID),
  foreign key (userID) references userStorage(userID)
);