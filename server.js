const express = require('express');
const env = require('dotenv').config()
const ejs = require('ejs');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const uploadRouter = require('./routes/uploadRoutes');

const passportConfig = require('./config/passportConfig');
const cookieSession = require('cookie-session');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');
const keys = require('./config/keys')
var cookieParser = require('cookie-parser');
app.use(cookieParser());



mongoose.connect('mongodb+srv://koyyavardhan:koyya9010@cluster0.cjpwbp5.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, (err) => {
  if (!err) {
    console.log('MongoDB Connection Succeeded.');
  } else {
    console.log('Error in DB connection : ' + err);
  }
});

// Connect to MongoDB
mongoose.connect('mongodb://localhost/file-uploader', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Set up routes
app.use('/upload', uploadRouter);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');	

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));


// initialize passport
app.use(passport.initialize());
app.use(passport.session());


app.use(express.static(__dirname + '/views'));

var index = require('./routes/index');
app.use('/', index);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// error handler
// define as the last app.use callback
app.use(function (err, req, res, next) {
  res.status(err.status || 800);
  res.send(err.message);
});

// Define a route for file uploads
//app.use('/upload', uploadRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, function () {
  console.log('Server is started on http://127.0.0.1:'+PORT);
});




