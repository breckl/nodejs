// REQUIRES
//require('newrelic');

var express = require('express'),
    mysql = require('mysql'),
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
// var mongodbURI = 'ds053808.mongolab.com';
// var mongodbPort = 53808;

// var mongoURI = '127.0.0.1';
// var mongoPort = 27017;
// var server = new mongodb.Server(mongodbURI, mongodbPort);

// new mongodb.Db('reports', server, {journal:true}).open(function(err, client){

// 	if (err) throw err;

// 	client.authenticate('superuser', 'NQu69KyZu7S', function(err, success){

// 		if (err) throw err;

// 		console.log('\033[96m + \033[39m connected to mongodb');

// 		app.users = new mongodb.Collection(client, 'users');

// 		app.listen(8888, function(){
// 			console.log('\033[96m + \033[39m Listening on port 8888');
// 		});
// 	});

// });

app.listen(8888, function(){
	console.log('\033[96m + \033[39m Listening on port 8888');
});


// INDEX ROUTE
app.get('/', routes.index);

// SIGNUP ROUTE
app.get('/signup', routes.signupView);

// SIGNUP POST
app.post('/signup', routes.signupPost);

// LOGIN ROUTE
app.get('/login', routes.loginView);

app.post('/login', routes.loginPost);

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

// SAVED DATA
app.get('/saved-data', routes.saved);

// API ROUTE
app.post('/update', routes.update);




