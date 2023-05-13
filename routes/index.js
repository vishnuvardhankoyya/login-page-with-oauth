const express = require('express');
const router = express.Router();
const model = require('../models/user');
const bcrypt = require('bcrypt');
const passport = require('passport');

const jwt = require("jsonwebtoken");
const keys = require('../config/keys');


const saltRounds = 10;


router.get('/', function (req, res, next) {
	console.log("in /")
	return res.render('index.ejs');
});


// auth with google
router.get('/auth/google', passport.authenticate('google', {
    scope: ['profile']
}));

// callback route for google to redirect to
// hand control to passport to use code to grab profile info
router.get('/auth/google/redirect', passport.authenticate('google'), (req, res) => {
    // res.send(req.user);
	res.redirect('/profile');
});


router.get('/register', function (req, res, next) {
	return res.render('registration.ejs');
});

router.post('/api/register', function(req, res, next) {
	
	var personInfo = req.body;


	if(!personInfo.email || !personInfo.username || !personInfo.password || !personInfo.passwordConf){
		res.send();
	} else {
		if (personInfo.password == personInfo.passwordConf) {
			model.User.findOne({email:personInfo.email},function(err,data){
				if(!data){
					var c;
					model.User.findOne({},function(err,data){

						if (data) {
							console.log("if");
							c = data.unique_id + 1;
						}else{
							c=1;
						}
						
						bcrypt.hash(personInfo.password, saltRounds, function (err,   hash){
						console.log(hash);
						var newPerson = new model.User({
							unique_id:c,
							email:personInfo.email,
							username: personInfo.username,
							password: hash,
							passwordConf: hash,
							thumbnail: "/img/profile.png"
						});

						newPerson.save(function(err, Person){
							if(err)
								console.log(err);
							else
								console.log('Success');
						});

					});
					res.send({"Success":"You are regestered,You can login now."});
				});
				}else{
					res.send({"Success":"Email is already used."});
				}

			});
		}else{
			res.send({"Success":"password is not matched"});
		}
	}
});

router.get('/login', function (req, res, next) {
	return res.render('login.ejs');
});

router.post('/api/login', function (req, res, next) {
	console.log("in login : ", req.body);
	model.User.findOne({email:req.body.email},function(err,data){
		if(data){
			bcrypt.compare(req.body.password, data.password, function (err, result){
			if(result){
				const token = jwt.sign(
					{ user_id: data._id, email: data.email },
					keys.jwt_secret_key,
					{
					  expiresIn: "2h",
					}
				  );
				//console.log("Done Login");
				req.session.userId = data._id;
				console.log(data);
				//console.log(req.session.unique_id);
				res.cookie('token', token).send({"Success":"Success!"});
				
			}else{
				res.send({"Success":"Wrong password!"});
			}})
		}else{
			res.send({"Success":"This Email Is not regestered!"});
		}
	});
});

router.get('/profile', function (req, res, next) {
	console.log("profile");
	var googleId = null;
	if (req.user) {
		googleId = req.user.googleId;
	}
	if (googleId) {
		model.User.findOne({googleId:req.user.googleId},function(err,data){
			console.log("data");
			console.log(data);
			if(!data){
				res.redirect('/login');
			}else{
				//console.log("found");
				return res.render('data.ejs', {
					"name": data.username,
					"email": data.email,
					"image": data.thumbnail
				});
			}
		});
	}
	else{
		model.User.findById(req.session.userId,function(err,data){
			console.log("data");
			console.log(data);
			if(!data){
				res.redirect('/login');
			}else{
				//console.log("found");
				return res.render('data.ejs', {
					"name": data.username,
					"email": data.email,
					"image": data.thumbnail
				});
			}
		});
	}
});

router.get('/logout', function (req, res, next) {
	console.log("logout", req.session)
	var newlogout = new model.Blacklistjwt({
		token: req.cookies.token
	});
	newlogout.save(function(err, result){
		if(err)
			console.log(err);
		else
			console.log('Success');
	});
	req.session.destroy((e) => {
        req.logout();
    });
	res.clearCookie('token');
	return res.redirect('/login');
});

router.get('/forgetpass', function (req, res, next) {
	res.render("forget.ejs");
});

router.post('/api/forgetpass', function (req, res, next) {
	//console.log('req.body');
	//console.log(req.body);
	model.User.findOne({email:req.body.email},function(err,data){
		console.log(data);
		if(!data){
			res.send({"Success":"This Email Is not regestered!"});
		}else{
			// res.send({"Success":"Success!"});
			if (req.body.password==req.body.passwordConf) {
			data.password=req.body.password;
			data.passwordConf=req.body.passwordConf;

			data.save(function(err, Person){
				if(err)
					console.log(err);
				else
					console.log('Success');
					res.send({"Success":"Password changed!"});
			});
		}else{
			res.send({"Success":"Password does not matched! Both Password should be same."});
		}
		}
	});
	
});

module.exports = router;