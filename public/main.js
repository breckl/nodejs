$(document).ready(function(){

	//google.setOnLoadCallback(drawVisualization);


	$("#sales-by-date").click(function(){ getReportData(1, 1); });

	$("#stats-by-date").click(function(){ getReportData(2, 1); });

	$("#daily-sales-chart").click(function(){ getReportData(101, 1); });

	$("#order-detail").click(function(){ getReportData(3, 2); });

	$("#login-submit").click(loginPost);

	$("#signup-submit").click(signupPost);

	$(".date").datepicker();


	// DataTables Bootstrap setup
	// $.extend( true, $.fn.dataTable.defaults, {
	//     "sDom": "<'row'<'col-6'f><'col-6'l>r>t<'row'<'col-6'i><'col-6'p>>",
	//     "sPaginationType": "bootstrap",
	//     "oLanguage": {
	//         "sLengthMenu": "Show _MENU_ Rows",
	//                 "sSearch": ""
	//     }
 //    });


}); // document ready end


function drawVisualization(chartData) {
        // Create and populate the data table.
        console.log(chartData);

		var data = new google.visualization.DataTable();
      	data.addColumn('date', 'Business Day');
      	data.addColumn('number', 'Sales');

		for (var rowIndex = 0; rowIndex <= (chartData.length - 1); rowIndex++){

			data.addRow([new Date(chartData[rowIndex]['Business Day']), chartData[rowIndex]['Total Sales']]);
			console.log(chartData[rowIndex]['Business Day'] + ' ' + chartData[rowIndex]['Total Sales']);
		}

		var options = {
						curveType: "function",
                        width: 1000, height: 400,
                        vAxis: {maxValue: 10}
                    };

		// create chart object
		//var chart = new google.visualization.LineChart(document.getElementById('visualization'));
		var reportDiv = $(".dashboard-report")[0];
		var chart = new google.visualization.LineChart(reportDiv);

		// draw chart
		chart.draw(data, options);
}



function reportToTable(reportArray){

	var tableHTML = '<table>';

	for (var rowIndex = 0; rowIndex <= (reportArray.length - 1); rowIndex++) {
		tableHTML += '<tr>';

		tableHTML += '<td'
	}
}


var signupPost = function(){

	var $form = $("#signup-form");
	var serializedData = $form.serialize();

	request = $.ajax({
		url: '/signup',
		method: 'post',
		data : serializedData
	});

	request.done(function(response){
		var responseId = response.charAt(0);
		response = response.substr(1);

		var output = '';

		switch (responseId)
		{
			case "0":
				output = response;
			break;

			case "1":
				window.location.replace('login');
			break;
		}

		if (output !== '') {
			$(".error-message").html(output);
		}

	});

	request.fail(function(jqXHR, textStatus, errorThrown){
		$(".error-message").html(errorThrown);
	});
};


var loginPost = function(){

	var serializedData = $("#login-form").serialize();

	mrAjax("/login", "post", serializedData, $(".form-message"), function(id, content){

		if (id == "1") {
			window.location.replace('dashboard');
		}

	});


};

var getStoredData = function(reportId){
	mrAjax("/saved-data", "get", "reportId=" + reportId, $(".dashboard-report"), function(id, content){

		if (id == "1") {
			$(".dashboard-report").html(content);
		}

	});
};



function getReportData(reportId, reportType) {

	// Set URI depending upon reportType 1 = fetch from server 2 = local MySQL
	if (reportType == 1) {
		var routeURI = '/sales';
	}
	else if (reportType == 2) {
		var routeURI = '/saved-data';
	}

	mrAjax(routeURI, "get", "reportId=" + reportId, $(".dashboard-report"), function(id, content){

		// Id 1 = success
		if (id == "1") {

			// Tables
			if ((reportId >= "1") && (reportId <= "100")) {

				if (reportId == "3") {

					var reportArray = JSON.parse(content, function(key, value){
						if (key == 'Business_Day') {
							return 'Business Day';
						}

						return value;
					});
				}
				else {
					var reportArray = JSON.parse(content);
				}

				$(".dashboard-report").html(ConvertJsonToTable(reportArray, 'report-results', 'table table-striped table-hover'));
				$("#report-results").dataTable({
	 					"sPaginationType" : "bs_full"
	 			});

			}

			// Charts
			else if ((reportId >= "101") && (reportId <= "199")) {

				var reportArray = JSON.parse(content);
 				drawVisualization(reportArray);

 			}
      	}

	});
}


function mrAjax(url, type, data, messageElement, callback) {

	var id, content = '';

	// AJAX, YO!
	request = $.ajax({
		url : url,
		type : type,
		data : data
	});

	// IF SUCEEDS
	request.done(function(response){
		id = response.charAt(0);
		content = response.substr(1);

	});

	// IF FAILS
	request.fail(function(jqXHR, textStatus, errorThrown){
		id = "0";
		content = errorThrown;
	});

	request.always(function(){
		// SET MESSAGE ELEMENT
		if (id == "0") {
			messageElement.html('Error: ' + content);
		}

		callback(id, content);
	});
}


// Replaced with GetReportData
// var salesByDate = function(){
// 	request = $.ajax({
// 		url : "/sales",
// 		type : "get",
// 		data : "method=sales_by_date"
// 	});

// 	request.done(function(response){
// 		var responseId = response.charAt(0);
// 		response = response.substr(1);

// 		var output = '';

// 		switch (responseId)
// 		{
// 			case "1":
// 				reportArray = JSON.parse(response);
// 				// output = response;
// 				//console.log(response);
// 				output = ConvertJsonToTable(reportArray, 'report-results', 'table table-striped table-hover');
// 				$("#report-results").dataTable({
// 					"sPaginationType" : "bs_full"
// 				});
// 			break;

// 			case "2":
// 				output = "Error: " + response;
// 			break;

// 		}

// 		if (output !== '') {
// 			$(".report").html(output);
// 		}

// 	});

// 	request.fail(function(jqXHR, textStatus, errorThrown){
// 		$(".report-results").html(errorThrown);
// 	});

// };