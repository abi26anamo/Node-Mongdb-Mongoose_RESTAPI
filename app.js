var express = require('express');
var path = require('path');
var logger = require('morgan');
var session = require('express-session');
var FileStore = require('session-file-store');
var passport = require('passport');
var authenticate = require('./authenticate');
// var cookieParser = require('cookie-parser');
app.use(session({
  name :'session-id',
  secret:'12345-67890-54321',
  saveUninitialized :false,
  resave:false,
  store:new FileStore()
}));
app.use(passport.initialize());
app.use(passport.session());
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');
var dishRouter = require('./routes/dishRouter');
var promoRouter = require('./routes/promoRouter');
var leaderRouter = require('./routes/leaderRouter');

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

const Dishes = require('./models/dishes');


const url = 'mongodb://localhost:27017/conFusion';
const connect = mongoose.connect(url, {
    useMongoClient: true,
  });

connect.then((db) => {
    console.log("Connected correctly to server");
}, (err) => { console.log(err); });

var app = express();


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/', index);
app.use('/users', users);
function auth (req, res, next) {
  

  if (!req.user){
      var err = new Error('You are not authenticated!');
      err.status = 403;
      next(err);
      return;
  
}
else{
    next();
  
  }
}
  
  

app.use(auth);

app.use(express.static(path.join(__dirname, 'public')));


app.use('/dishes',dishRouter);
app.use('/promotions',promoRouter);
app.use('/leaders',leaderRouter);


app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
 
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;