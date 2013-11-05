var request = require('request');
var  express = require ('express');

// request.use(express.bodyParser());

request.get('http://localhost:3000/?userID=100&reportId=1', function(error, response, body){
	if (!error && response.statusCode == 200){
		console.log(body);
		// response.send(body);
	}
	else {
		console.log(response.statusCode);
	}


});