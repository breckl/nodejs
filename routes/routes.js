var database = require('../common/database'),
    request = require('request'),
    moment = require('moment');	// for date formatting

var connection = database.connectToData();

// ****************************
//
//      SIGN UP / LOGIN
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

	//console.log(req.body.user);
	//console.log('signup post');


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
			console.log('Signed up: ' + user);
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
		password : req.body.password
	};

	loginUser(user, function(resultId, resultMessage){

		// Logged in
		if (resultId == 1) {

			// Set session variables
			req.session.userID = user.ID;
			req.session.username = user.name;
			req.session.useremail = user.email;

			res.send("1" + user.name);
		}
		else {
			res.send(resultId + resultMessage);
		}

	});

/*
DEPRECATED - REPLACED BY loginUser
if (user.email && user.password) {

		// Find the user by email
		connection.query('SELECT ID, Email, Username FROM users WHERE Email = ?', [user.email], function(err, rows, fields) {

			console.log('Login: ' + rows);

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
						req.session.userID = rows[0].ID.toString();
						req.session.username = user.name;
						req.session.useremail = user.email;
						res.send("1" + user.name);
					}
					else {
						res.send("0" + "Incorrect password");
					}
				}
				// If we didn't find the email
				else {
					res.send("0" + "Email not found");
				}
			}

		});
	} */
};


function loginUser(user, callback){

	// for the callback
	var result = {};

	// Check to be sure both are not blank
	if (user.email && user.password) {

		connection.query('SELECT ID, Email, Username, Password FROM users WHERE Email = ?', [user.email], function(err, rows, fields) {

			// Error check
			if (err) {
				return ("0" + err);
			}

			if (rows.length > 0) {

				if (rows[0].Password == user.password){

					user.name = rows[0].Username;
					user.ID = rows[0].ID;

					result.id = 1;

					console.log('%s logged in', user.name);


				}
				else {
					result.id = 0;
					result.message = "Incorrect Password";
				}
			}
			else {
				result.id = 0;
				result.message = "Email not found";
			}

			callback(result.id, result.message);
		});
	}
	else {
		result.id = 0;
		result.message ="Email or password was blank";
	}

	// Handle error result
	if (result.id == 0){

		console.log(result.message);

		callback(result.id, result.message);
	}
}



// ****************************
//
//          DATA API
//
// ****************************

exports.update = function(req, res){

	console.log('API update from %s', req.ip);

	// the JSON object
	// -- header (email, password)
	// -- content (actual pos data)
	var JSON = req.body;


	// Create user object
	var user = {
		email : JSON.header[0].Email,
		password : JSON.header[0].Password
	};

	// Login user
	loginUser(user, function(resultId, resultMessage){

		// Passed login
		if (resultId == 1) {

			console.log('%s logged in for update', user.name);

			var name;

			// Get fieldnames
			var fieldNames = [];
			for (name in JSON.content[0]){
				fieldNames.push(name);
			}

			fieldNames.push('User_ID'); // add user id

			// Create array from JSON
			var newValues = [];

			for (var recordIndex = 0; recordIndex < JSON.content.length; recordIndex++){
				var businessDay = "'" + JSON.content[recordIndex].Business_Day + "'";
				var userID = "'" + JSON.header[0] + "'"; // not working
				newValues.push('(' +
								businessDay + ',' +
								JSON.content[recordIndex].Total_Amount + ',' +
								JSON.content[recordIndex].Tips + ',' +
								JSON.content[recordIndex].Discounts + ',' +
								JSON.content[recordIndex].Taxes + ',' +
								JSON.content[recordIndex].Number + ',' +
								user.ID + ')');
			}

			// console.log(newValues);

			connection.query('INSERT INTO orders (' + fieldNames.join(',') + ') VALUES ' + newValues.join(','), function(err, result){
				if (err) throw err;

				console.log('%s data inserted', user.name);
				res.send('Data successfully received');

			});
		}

		// Error logging in - result = 0
		else {

			console.log(resultMessage);
			res.send(resultMessage);

		}
	});
};


// ****************************
//
//      GET SAVED DATA
//
// ****************************

exports.saved = function(req, res){

	switch (req.query.reportId)
	{

		// Order Totals by Day
		case "1" :
			sql = {	start : 'SELECT Business_Day AS "Business Day",' +
								'SUM(Total_Amount) AS "Sales",' +
								'SUM(Tips) AS "Tips",' +
								'SUM(Discounts) As Discounts,' +
								'SUM(Taxes) AS Taxes ' +
								'FROM orders ',
					end : 'GROUP BY Business_Day'
				};
		break;

		// Order Detail
		case "3" :

			sql = {	start : 'SELECT * FROM orders '

				};
		break;

		// Daily Sales Chart
		case "101" :

			sql = {	start : 'SELECT Business_Day AS "Business Day", SUM(Total_Amount) AS "Total Sales" ' +
								'FROM orders ',

							end : 'GROUP BY Business_Day'
						};
		break;
	}


	// Build final sql
	sql.complete = sql.start +
					' WHERE User_ID = ? ';
	if (!!sql.end) { sql.complete = sql.complete + sql.end; }


	// Respond with JSON or error
	SQLtoJSON(sql.complete, [req.session.userID], function(result){
		res.send(result);
	});

};

// Takes SQL and returns JSON - callback includes ResultID + JSON (or error)
function SQLtoJSON(sql, values, callback) {

	//sqlParams = mySQLParams(sql);

	console.log('SQL %s', sql);

	connection.query(sql, values, function(err, results){

		if (err) {

			callback('0' + 'Error:' + err);
			throw err;

		}
		else {

			var JSONtoSend = JSON.stringify(results);

			//console.log("JSON stringify: %s", JSONtoSend);

			callback('1' + JSONtoSend);
		}
	});

}

// Takes node-sql date and converts from full date and time to string date
function mySQLParamsWithDate(sql){
	var sqlParams = { sql : sql,

				  // required that you use field.string(), field.buffer() or field.geometry() with
				  // custom typecasting
				  typeCast : function(field, next) {
				  	if (field.type == 'DATE') {
				  		return moment(Date(field.buffer())).format('YYYY-MM-DD');
				  	}
				  	return next();
				  }

				};

	return sqlParams;
}


exports.sales = function(req, res){

	/*console.log(req.query.reportId);
	request.get('http://localhost:3000/?userID=100&reportId=' + req.query.reportId, function(error, response, body){

		if (!error) {

			console.log(body);

			// Error responses from restaurant server
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
	});*/

};

exports.dashboard = function(req, res){
	console.log('%s logged in to dashboard', req.session.username);
	//console.log("log:" + req.params.userID);
	//console.log("body:" + req.body[userId]);

	// do a second check and matchup username and email
	// ADD THIS BACK IN LATER
	// if (req.session.userID) {
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
	//console.log('Got ' + req.query.firstname + ' ' + req.query.lastname);
};

exports.report = function(req, res){
	res.render('report');
};





