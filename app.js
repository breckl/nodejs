// REQUIRES
var express = require('express'),
    mongodb = require('mongodb'),
    app = express(), // express
    hbs = require('hbs'),	// handlebars.js
    routes = require('./routes/routes'),
    database = require('./common/database');


// SETUP
app.set('view engine', 'html');
app.engine('html', hbs.__express);	// set handlebars as template/view engine
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({secret: 'F6A6F7E35D3F22C7'}));
app.use(express.static('public'));	// makes all resources in public folder available


// CONNECT TO 'reports' DATABASE
var mongodbURI = 'ds053808.mongolab.com';
var mongodbPort = 53808;

// var mongoURI = '127.0.0.1';
// var mongoPort = 27017;



var server = new mongodb.Server(mongodbURI, mongodbPort);

new mongodb.Db('reports', server, {journal:true}).open(function(err, client){

	if (err) throw err;

	client.authenticate('superuser', 'NQu69KyZu7S', function(err, success){

		if (err) throw err;

		console.log('\033[96m + \033[39m connected to mongodb');

		app.users = new mongodb.Collection(client, 'users');

		app.listen(8888, function(){
			console.log('\033[96m + \033[39m Listening on port 8888');
		});
	});

});


// INDEX ROUTE
app.get('/', routes.index);

// SIGNUP ROUTE
app.get('/signup', routes.signup);


// LOGIN ROUTE
app.get('/login', routes.login);

// LOGIN ROUTE
app.get('/login/:signupEmail', function(req, res){
	res.render('login', { signupEmail : req.params.signupEmail });

});

// REPORT ROUTE
app.get('/report', routes.report);

// REPORT ROUTE
app.get('/sales', routes.sales);

// DASHBOARD
app.get('/dashboard', routes.dashboard);

// {
// 	console.log(req.params.username);
// 	console.log(req.params);

// });

	//routes.dashboard);


// SIGNUP POST
app.post('/signup', function(req, res) {

	console.log(req.body.user);
	console.log('signup post');

	app.users.count({email : req.body.user.email}, function(err, count){

		// If email exists in db
		if (count >= 1) {
			res.send("0" + "Email already used");
		}

		// if new email
		else {

			app.users.insert(req.body.user, function(err, doc){

				if (err) {
					res.send("0" + err);
					return next(err);
				}
				else {
					res.send("1");
				}
				//res.redirect('/login/' + doc[0].email);
			});
		}
	});
});

app.post('/login', function(req, res){

	var user = {
		email : req.body.email,
		password : req.body.password
	};

	console.log(req.body);

	if (user.email && user.password) {

		console.log('step 1');

		// Find the user by email
		app.users.findOne({email : user.email}, function(err, doc){

			console.log(doc);

			if (err) {
				res.send("0" + err);
				return next(err);
			}
			else {

				// If we found the email
				if (doc) {
					user.name = doc.name;
					// Check password
					if (doc.password == user.password) {
						req.session.userId = doc._id.toString();
						req.session.username = user.name;
						req.session.useremail = user.email;
						res.send("1" + user.name);
					}
					else {
						console.log('wrong password');
						res.send("0" + "Incorrect password");
					}
				}
				// If we didn't find the email
				else {
					console.log('email not found');
					res.send("0" + "Email not found");
				}
			}

		});
	}
});

