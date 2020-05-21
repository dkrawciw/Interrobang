var express = require('express'),
    app = express(),
    http = require('http').createServer(app),
    io = require('socket.io')(http),
    mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    User = require('./models/user.js'),
    mySql = require('mysql');

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
  connection.query('SELECT chat_rooms.room_name AS title, chat_rooms.id AS room_id FROM users JOIN room_members ON users.id = room_members.user_id JOIN chat_rooms ON room_members.room_id = chat_rooms.id WHERE users.username = "' + req.user.username + '";', function(err, results, fields){
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

io.on('connection', function(socket){
  console.log('Connected');

  socket.on('msg', function(msg, username){
    io.emit('msg', username + ": " + msg);
  });
});
