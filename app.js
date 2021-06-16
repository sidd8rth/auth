require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session')
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
// const bcrypt = require('bcrypt');
// const saltRounds = 12;
const app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));
app.set('view engine', 'ejs');
app.use(express.static("public"));

//Passport Setup
app.use(session({
  secret: 'IwillbecomeanIAS.',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

//Mongoose setup
mongoose.connect('mongodb://localhost:27017/userDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.set('useCreateIndex', true);
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});
//passportsetupagain
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

//passport work
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res) {
  res.render("home");
})

app.get("/register", function(req, res) {
  res.render("register");
})

app.get("/login", function(req, res) {
  res.render("login");
})


app.get("/secrets", function(req, res) {
  if (req.isAuthenticated()) {
    res.render('secrets');
  } else {
    res.render('login');
  }
})

app.get("/logout", function(req,res){
  req.logout();
  res.redirect('/');
})
app.post('/register', function(req, res) {
  User.register({
    username: req.body.username
  }, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect('/register')
    } else {
      passport.authenticate('local')(req, res, function() {
        res.redirect('/secrets')
      });
    }
  });
});

app.post("/login", function(req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  })
  req.login(user, function(err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate('local')(req, res, function() {
        res.redirect('/secrets')
      });
    }
  });
});


app.listen(3000, function() {
  console.log("Server started at port 3000");
})

//level 4 login
// const username = req.body.username;
// const password = req.body.password;
// User.findOne({
//     email: username
//   }, function(err, foundUser) {
//     if (err) {
//       console.log(err);
//     } else {
//       if (foundUser) {
//         bcrypt.compare(req.body.password, foundUser.password, function(err, result) {
//           res.render("secrets");
//         });
//       }
//     }
//   });


//level 4 Register
// bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
//   const newUser = new User({
//     email: req.body.username,
//     password: hash
//   })
//   newUser.save(function(err) {
//     if (err) {
//       console.log(err);
//     } else {
//       res.render('secrets')
//     }
//   });
// });
