DROP DATABASE interrobang_db;

CREATE DATABASE interrobang_db;

USE interrobang_db;

CREATE TABLE users(
  id INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL,
  f_name VARCHAR(100) NOT NULL,
  l_name VARCHAR(100) NOT NULL,
  time_pereference VARCHAR(4) DEFAULT 'MST',
  PRIMARY KEY(id)
);

CREATE TABLE chat_rooms(
  room_name VARCHAR(100) NOT NULL,
  host_id INT NOT NULL,
  date_created TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY(room_name),
  FOREIGN KEY(host_id) REFERENCES users(id)
);

CREATE TABLE room_members(
  id INT NOT NULL AUTO_INCREMENT,
  room_name VARCHAR(100) NOT NULL,
  user_id INT NOT NULL,
  PRIMARY KEY(id),
  FOREIGN KEY(room_name) REFERENCES chat_rooms(room_name),
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE chat_messages(
  id INT NOT NULL AUTO_INCREMENT,
  member_id INT NOT NULL,
  message VARCHAR(400) NOT NULL,
  time_chatted TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY(id),
  FOREIGN KEY(member_id) REFERENCES room_members(id)
);
