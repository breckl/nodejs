

// exports.connectToDatabase = function(){

// 	var mongodb = require('mongodb');

// 	new mongodb.Db('reports', newServer, {journal:true}).open(function(err, client){

// 		if (err) throw err;

// 		console.log('\033[96m + \033[39m connected to mongodb');

// 		app.users = new mongodb.Collection(client, 'users');

// 		app.listen(8888, function(){

// 			console.log('\033[96m + \033[39m Listening on port 8888');
// 		});

// 	});

// };

// var newServer = function(){

// 	var server = new mongodb.Server('127.0.0.1', 27017);

// };

var mysql = require('mysql');

exports.connectToData = function(){

	var db_host = 'localhost',
		db_port = '3306',
	    db_user = 'root',
	    db_name = 'reportdata',
	    db_password = '123';

	var connection = mysql.createConnection({
		host : db_host,
		port : db_port,
		user : db_user,
		database : db_name,
		password : db_password
	});

	return connection;
	//callback(connection)

};

