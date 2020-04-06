var express = require('express'),
    app = express(),
    mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    User = require('./models/user.js');

mongoose.connect('mongodb://localhost:27017/tsaWebApp', {useNewUrlParser: true});
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

app.listen(80, function(){
  console.log('Server Running');
});

app.get('/', function(req, res){
  res.render('index.ejs');
});
