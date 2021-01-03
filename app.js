var express = require('express'),
    app = express(),
    http = require('http').createServer(app),
    io = require('socket.io')(http),
    mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    User = require('./models/user.js'),
    mysql = require('mysql');

var connection = mysql.createConnection({
  host    : '127.0.0.1',
  user    : 'root',
  password: 'xD#X3227l!7K&LW4k4av',
  database: 'interrobang_db',
  port    : '3306'
});

mongoose.connect('mongodb://localhost:27017/interrobang_db', {useNewUrlParser: true});
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(require("express-session")({
  secret: "p*51nvfy8ZX8NI@M*x7BkUg37BhVpP85v8M3z^%qBcyBrUpLct!^eV6^ejd702c0hcAYe&SM*lEadf9XIxT%IBw0l&yQOSAOn8f",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/login');
}

http.listen(50002, function(){
  console.log('Server Running');
});

app.get('/', function(req, res){
  res.render('index.ejs', {currentUser: req.user});
});

app.get('/home', isLoggedIn, function(req, res){
  connection.query('SELECT chat_rooms.room_name AS room_name FROM users JOIN room_members ON room_members.user_id = users.id JOIN chat_rooms ON chat_rooms.room_name = room_members.room_name WHERE users.username = "' + req.user.username + '";', function(err, results, fields){
    if(err) throw err;
    res.render('home.ejs', {currentUser: req.user,chatRoom: results});
  });
});

app.get('/login', function(req, res){
  res.render('login.ejs', {currentUser: res.user});
});
app.post("/login", passport.authenticate("local", {
  successRedirect: "/home",
  failureRedirect: "/login"
}), function(req, res){
  res.redirect("/home");
});

app.get('/register', function(req, res){
  res.render('register.ejs', {currentUser: res.user});
});
app.post('/register', function(req, res){
  var newUser = new User({username: req.body.username});
  User.register(newUser, req.body.password, function(err, user){
    var q = {
      username: req.body.username,
      f_name: req.body.f_name,
      l_name: req.body.l_name
    };
    connection.query('INSERT INTO users SET ?', q, function(err, results){
      if(err){
        throw err;
      }
    });
    if(err){
      console.log(err);
      return res.render("/register");
    }
    passport.authenticate("local")(req, res, function(){
      res.redirect('/home');
    });
  });
});

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

app.post('/home/newRoom', isLoggedIn, function(req, res){
  connection.query('SELECT id FROM users WHERE users.username = "' + req.user.username + '";', function(uErr, uResults, uFields){
    if(uErr) throw uErr;
    var q = {
      room_name: req.body.name,
      host_id: uResults[0].id
    };
    var q2 = {
      room_name: req.body.name,
      user_id: uResults[0].id
    };
    connection.query('INSERT INTO chat_rooms SET ?', q, function(err){
      if(err){
        return 0;
      }
      connection.query('INSERT INTO room_members SET ?', q2);
    });
  });
  res.redirect('/home');
});

app.get('/home/chat/:roomName', isLoggedIn, function(req, res){
  connection.query('SELECT chat_rooms.room_name AS room_name FROM users JOIN room_members ON room_members.user_id = users.id JOIN chat_rooms ON chat_rooms.room_name = room_members.room_name WHERE users.username = "' + req.user.username + '";', function(err, results, fields){
    if(err) throw err;
    res.render('chat.ejs', {currentUser: req.user,chatRoom: results,roomName: req.params.roomName});
  });
});

app.post('/home/deleteRoom/:roomName', isLoggedIn, function(req, res){
  connection.query('SELECT id FROM users WHERE username = "' + req.user.username + '";', function(err, results, fields){
    if(err) throw err;
    connection.query('SELECT host_id FROM chat_rooms WHERE room_name = "' + req.params.roomName + '";', function(rErr, rResults, rFields){
      if(rErr) throw rErr;
      if(rResults[0].host_id == results[0].id){
        connection.query('DELETE FROM room_members WHERE room_name = "' + req.params.roomName + '";');
        connection.query('DELETE FROM chat_rooms WHERE room_name = "' + req.params.roomName + '";');
      }
    });
  });
  res.redirect('/home');
});

app.get('/home/chat/*', isLoggedIn, function(req, res){
  res.redirect('/home');
});

io.on('connection', function(socket){
  console.log('Connected');

  socket.on('msg', function(msg, username){
    io.emit('msg', username + ": " + msg);
  });
});
