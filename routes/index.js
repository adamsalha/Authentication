var express = require('express');
var bcrypt = require("bcryptjs")
var alert = require('alert')
var router = express.Router();
var User = require('../models/user');
var Event = require("../models/event");
var CheckIn = require("../models/checkin");
var {
	AdminInfo
} = require("../models/admin");
const url = require("url");



router.get('/', function (req, res, next) {
	return res.render('index.ejs');
});


router.post('/', function (req, res, next) { //registration
	console.log(req.body);
	var personInfo = req.body;


	if (!personInfo.email || !personInfo.username || !personInfo.password || !personInfo.passwordConf) {
		res.send();
	} else {
		if (personInfo.password == personInfo.passwordConf) {

			User.findOne({
				email: personInfo.email
			}, function (err, data) {
				if (!data) {
					var c;
					User.findOne({}, function (err, data) {

						if (data) {
							console.log("if");
							c = data.unique_id + 1;
						} else {
							c = 1;
						}

						var newPerson = new User({
							unique_id: c,
							email: personInfo.email,
							username: personInfo.username,
							password: personInfo.password,
							passwordConf: personInfo.passwordConf,
							lat: 0,
							long: 0
						});

						newPerson.save(function (err, Person) {
							if (err)
								console.log(err);
							else
								console.log('Success');
						});

					}).sort({
						_id: -1
					}).limit(1);
					res.send({
						"Success": "You are registered,You can login now."
					});
				} else {
					res.send({
						"Success": "Email is already used."
					});
				}

			});
		} else {
			res.send({
				"Success": "password is not matched"
			});
		}
	}
});

router.get('/login', function (req, res, next) { //login
	return res.render('login.ejs');
});
router.get('/home', function (req, res, next) { //login

	User.findOne({
		unique_id: req.session.userId
	}, function (err, data1) {
		console.log("data");
		console.log(data1);
		if (!data1) {
			res.redirect('/');
		} else {
			//console.log("found");
			var events
			Event.find({}, function (err, data2) {
				if (data2) {
					return res.render('home.ejs', {
						"name": data1.username,
						"email": data1.email,
						events: data2
					});
				}
			})

		}
	});

});

router.post('/login', function (req, res, next) {
	//console.log(req.body);
	User.findOne({
		email: req.body.email
	}, function (err, data) {
		if (data) {

			if (data.password == req.body.password) {
				//console.log("Done Login");
				req.session.userId = data.unique_id;
				// console.log(session);
				res.send({
					"Success": "Success!"
				});

			} else {
				res.send({
					"Success": "Wrong password!"
				});
			}
		} else {
			res.send({
				"Success": "This Email Is not registered!"
			});
		}
	});
});

router.get('/profile', function (req, res, next) { //check profile
	console.log("profile");
	User.findOne({
		unique_id: req.session.userId
	}, function (err, data) {
		console.log("data");
		console.log(data);
		if (!data) {
			res.redirect('/');
		} else {
			//console.log("found");
			return res.render('data.ejs', {
				"name": data.username,
				"email": data.email
			});
		}
	});
});

router.get('/logout', function (req, res, next) { //logout
	console.log("logout")
	if (req.session) {
		// delete session object
		req.session.destroy(function (err) {
			if (err) {
				return next(err);
			} else {
				return res.redirect('/');
			}
		});
	}
});

router.get('/forgetpass', function (req, res, next) { //forget password
	res.render("forget.ejs");
});

router.get('/propose', function (req, res, next) { //propose     res.render("propose.ejs");
	res.render("propose.ejs");
});


router.post('/forgetpass', function (req, res, next) {
	//console.log('req.body');
	//console.log(req.body);
	User.findOne({
		email: req.body.email
	}, function (err, data) {
		console.log(data);
		if (!data) {
			res.send({
				"Success": "This Email Is not registered!"
			});
		} else {
			// res.send({"Success":"Success!"});
			if (req.body.password == req.body.passwordConf) {
				data.password = req.body.password;
				data.passwordConf = req.body.passwordConf;

				data.save(function (err, Person) {
					if (err)
						console.log(err);
					else
						console.log('Success');
					res.send({
						"Success": "Password changed!"
					});
				});
			} else {
				res.send({
					"Success": "Password does not matched! Both Password should be same."
				});
			}
		}
	});
})
router.post('/home/:id', function (req, res, next) { // event check in
	var eventId = req.params.id;
	if (!checkin) {
		res.json({
			status: 'fail',
			message: 'Something went wrong'
		})
	} else {
		// console.log("id:",req.session.userId)
		User.findOne({
			unique_id: req.session.userId
		}, function (err, data) {
			if (!data) {
				res.json({
					status: 'fail',
					message: 'error!'
				})
			} else {

				var newCheckIn = new CheckIn({
					userId: req.session.userId,
					eventId: eventId
				});

				newCheckIn.save(function (err, Event) {
					if (err)
						res.json({
							status: 'fail',
							message: 'Cant join event'
						})
					else {
						// res.json({
						// 	status: 'success',
						// 	message: 'Event join!'
						// })
						// req.flash("message", "Event join!")
						alert("Event join!")
						res.redirect("/home")
					}
				});
			}
		});
	}
})

router.get('/location', function (req, res, next) { //forget password
	res.render("location.ejs");
});

router.get('/admin', function (req, res, next) { //location
	console.log("user");
	User.find(function (err, data) {
		console.log("data");
		console.log(data);
		if (!data) {
			res.redirect('/');
		} else {
			//console.log("found");
			return res.render('admin.ejs', {
				users: data
			});
		}
	});
});

router.post('/propose', function (req, res, next) { // event registration 
	var eventInfo = req.body;
	var username
	if (!eventInfo.eventName || !eventInfo.venue || !eventInfo.date) {
		res.json({
			status: 'fail',
			message: 'Please Fill-In All the fields'
		})
	} else {
		// console.log("id:",req.session.userId)
		User.findOne({
			unique_id: req.session.userId
		}, function (err, data) {
			if (!data) {
				res.json({
					status: 'fail',
					message: 'Event Has Not Been Created!'
				})
			} else {
				username = data.username

				var newEvent = new Event({

					name: eventInfo.eventName,
					venue: eventInfo.venue,
					username: username,
					date: eventInfo.date
				});

				newEvent.save(function (err, Event) {
					if (err)
						res.json({
							status: 'fail',
							message: 'Event Has Not Been Created!'
						})
					else
						res.json({
							status: 'success',
							message: 'Event Has Been Created!'
						})
				});
			}
		});
	}
})


router.post('/test', function (req, res, next) { //location into database
	//console.log('req.body');
	console.log(req.body);
	var locationInfo = req.body;
	lat = locationInfo.lat;
	long = locationInfo.long;
	console.log(lat, ",", long);

	User.findOne({
		unique_id: req.session.userId
	}, function (err, data) {
		console.log(data);
		if (!data) {
			res.send({
				"Success": "location not entered yet"
			});
		} else {
			// res.send({"Success":"Success!"});
			if (locationInfo.lat != 0 && locationInfo.long != 0) {
				data.lat = locationInfo.lat;
				data.long = locationInfo.long;

				data.save(function (err, Person) {
					if (err)
						console.log(err);
					else
						console.log('Success');
					res.send({
						"Success": "location changed!"
					});
				});
			} else {
				res.send({
					"Success": "bla"
				});
			}
		}
	});

});

router.get('/map/:id', function (req, res) {
	var id = req.params.id;
	User.findOne({
		_id: id
	}, function (err, data) {
		if (data) {
			res.render('adminmap', {
				data
			});
		}
	})
}) //event

router.get("/adminlogin", function (req, res) {
	res.render("admin/login")
})
router.get("/adminregister", function (req, res) {
	res.render("admin/register")
})

// admin
router.post("/adminregister", async function (req, res, next) {
	if (
		!req.body.email ||
		!req.body.name ||
		!req.body.password ||
		!req.body.password2
	) {
		alert("Fill in all detail required");
	} else {
		AdminInfo.findOne({
			email: req.body.email
		}).then((admin) => {
			if (admin) {
				res.send({
					"Failed": "Email already registered"
				});
			} else {
				if (req.body.password != req.body.password2) {
					res.send({
						"Failed": "Wrong password input"
					});
				} else {
					const data = new AdminInfo({
						email: req.body.email,
						name: req.body.name,
						password: req.body.password
					});
					data.save()
						.then(() => {
							req.session.adminID = data._id;
							res.send({
								"Success": "Account created"
							});
							res.redirect(url.format({
								pathname: "/adminlogin",
								query: {
									session
								}
							}));
						})
						.catch((err) => {
							res.send({
								"Failed": "Something went wrong"
							});
							console.log(err);
							res.redirect("/adminregister");
						});
				}
			}
		});
	}
});

router.post("/adminlogin", function (req, res, next) {
	AdminInfo.findOne({
		email: req.body.email
	}, function (err, data) {
		if (data) {
			bcrypt
				.compare(req.body.password, data.password)
				.then((doMatch) => {
					if (doMatch) {
						req.session.email = data.email;
						session = req.session;
						res.redirect("/admin");
					} else {
						req.flash("message", "Wrong password input");
						// alert("Wrong password input");
						res.redirect("/adminlogin");
					}
				})
				.catch((err) => {
					console.log(err);
				});
		} else {
			req.flash("message", "Email and Password does not matched");
			// alert("Email and Password does not matched");
			res.redirect("/adminlogin");
		}
	});
});

module.exports = router;