exports.login = function(req, res){
	res.render('login');
};


exports.signup = function(req, res){
	res.render('signup');
};

// exports.signupPost = function(req, res) {

// 	console.log(req.body.user);
// 	console.log('signup post');

// 	app.users.count({email : req.body.user.email}, function(err, count){

// 		// If email exists in db
// 		if (count >= 1) {
// 			res.send("0" + "Email already used");
// 		}

// 		// if new email
// 		else {

// 			app.users.insert(req.body.user, function(err, doc){

// 				if (err) {
// 					res.send("0" + errr);
// 					return next(err);
// 				}
// 				else {
// 					res.send("1");
// 				}
// 				//res.redirect('/login/' + doc[0].email);
// 			});
// 		}

// 	});


// };


exports.index = function(req, res){
	// var firstname = req.query.firstname;
	// var lastname = req.query.lastname;
	//res.type('html');
	//res.send('<h1>' + firstname + ' ' + lastname + '</h1>');
	// console.log(req.body);

	res.render('index', {firstname:'Breck', lastname:'LeSueur'});
	//res.send(req.body);
	console.log('Got it');
};

exports.report = function(req, res){
	res.render('report');
};



var request = require('request');

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

