var database = require('../common/database'),
    request = require('request');

var connection = database.connectToData();

// ****************************
//
//          SIGN UP / LOGIN
//
// ****************************


exports.loginView = function(req, res){
	res.render('login');
};

exports.signupView = function (req, res){
	res.render('signup');
};


exports.signupPost = function(req, res){
	//res.render('signup');

	console.log(req.body.user);
	console.log('signup post');


	var user = {
		Email : String(req.body.user.email).toLowerCase(),
		Username : req.body.user.name,
		Password : req.body.user.password
	};

	connection.query('SELECT Count(*) FROM users WHERE LCASE(Email) = ?', [user.email], function(err, result) {

		if (err) throw err;

		//app.users.count({email : req.body.user.email}, function(err, count){ MONGODB CODE

		// If email exists in db
		if (result.count >= 1) {
			res.send("0" + "Email already used");
		}

		// if new email
		else {

			//app.users.insert(req.body.user, function(err, doc){
			console.log(user);
			connection.query('INSERT INTO users SET ?', user, function(err, rows, fields) {

				if (err) {
					res.send("0" + err);
				}
				else {
					res.send("1");
				}
				//res.redirect('/login/' + doc[0].email);
			});
		}
	});
};

exports.loginPost = function(req, res){

	var user = {
		email : req.body.email,
		password : req.body.password,
		name : req.body.name
	};

	console.log(req.body);

	if (user.email && user.password) {

		console.log('step 1');

		// Find the user by email
		connection.query('SELECT ID, Email, Username FROM users WHERE Email = ?', [user.email], function(err, rows, fields) {

			console.log(rows);
			console.log(rows[0].Email);
			// console.log(doc);

			if (err) {
				res.send("0" + err);
				return next(err);
			}
			else {

				// If we found the email
				if (!!rows) {
					user.name = rows[0].Username;
					user.email = rows[0].Email;
					user.password = rows[0].Password;

					// Check password
					if (rows[3] == user.password) {
						req.session.userId = rows[0].ID.toString();
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
};



// ****************************
//
//          DATA API
//
// ****************************

exports.update = function(req, res){

	console.log('/update');
	//console.log(req);
	//console.log(req.body);

	var JSON = req.body;
	var name;

	// Get fieldnames
	var fieldNames = [];
	for (name in JSON[0]){
		fieldNames.push(name);
	}

	//console.log(fieldNames);

	// Create array from JSON
	var newValues = [];
	for (var fieldIndex = 0; fieldIndex < JSON.length; fieldIndex++){
		var businessDay = "'" + JSON[fieldIndex].Business_Day + "'";
		newValues.push('(' + businessDay + ',' + JSON[fieldIndex].Total_Amount + ',' +
						     JSON[fieldIndex].Tips + ',' + JSON[fieldIndex].Discounts + ',' + JSON[fieldIndex].Taxes + ')');
	}

	//console.log(newValues);

	connection.query('INSERT INTO orders (' + fieldNames.join(',') + ') VALUES ' + newValues.join(','), function(err, result){
		if (err) throw err;

		console.log('Report data imported!');
	});
};


// ****************************
//
//          GET SAVED DATA
//
// ****************************

exports.saved = function(req, res){

	if (req.query.reportId == 3) {

		connection.query('SELECT * FROM orders', function(err, results){
			if (err) {
				res.send('0' + 'Error:' + err);
				throw err;
			}
			else {

				console.log(results);

				var formattedJSON = JSON.stringify(results, function(key, value){
					if (key = "BusinessDay") return "Business Day";
					return value;
					//var newKey = key.replace('_', ' ');
					//console.log(key + ' ' + value);
					//return newKey;
				});

				console.log(formattedJSON);

				res.send('1' + JSON.stringify(results));
			}


		});
	}

};


exports.sales = function(req, res){

	console.log(req.query.reportId);
	request.get('http://localhost:3000/?userID=100&reportId=' + req.query.reportId, function(error, response, body){

		if (!error) {

			console.log(body);

			switch (response.statusCode){

				case 200 :
					// Success!
					res.send('1' + body);
				break;

				case 300 :
					// User doesn't match
					res.send('0' + body);
				break;

				case 301 :
					// Report Id not found
					res.send('0' + body);
				break;

				case 400 :
					// Report server error
					res.send('0' + body);
				break;

				case 500 :
					// Connection error
					res.send('0' + body);
				break;

				default :
					res.send('0' + 'No reponse number');
			}

		}
		else {
			//console.log(response.statusCode);
			res.send('0' + 'Unable to connect to restaurant server');
		}
	});

};

exports.dashboard = function(req, res){
	console.log(req.session.username);
	//console.log("log:" + req.params.userId);
	//console.log("body:" + req.body[userId]);

	// do a second check and matchup username and email
	// ADD THIS BACK IN LATER
	// if (req.session.userId) {
	// 	res.render('dashboard', {username:req.session.username});
	// }
	// else {
	// 	res.render('page-not-found');
	// }
	res.render('dashboard', {username:req.session.username});

};

exports.index = function(req, res){
	// var firstname = req.query.firstname;
	// var lastname = req.query.lastname;
	//res.type('html');
	//res.send('<h1>' + firstname + ' ' + lastname + '</h1>');
	// console.log(req.body);

	res.render('index', {firstname:'Breck', lastname:'LeSueur'});
	//res.send(req.body);
	console.log('Got ' + req.query.firstname + ' ' + req.query.lastname);
};

exports.report = function(req, res){
	res.render('report');
};





