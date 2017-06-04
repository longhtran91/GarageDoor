var lastupdate = 0;
var device_id;

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    device_id = device.uuid;
    uptime();
	poll();

    // Header
    var oHeader = {alg: 'HS256', typ: 'JWT'};
    // Payload
    var oPayload = {};
    oPayload.uuid = device_id;
    // Sign JWT, password=616161
    var sHeader = JSON.stringify(oHeader);
    var sPayload = JSON.stringify(oPayload);
    //var prvKey = KEYUTIL.getKey(sPKCS8PEM, "altamira");
    var prvKey = "altamira";
    var sJWT = KJUR.jws.JWS.sign("HS256", sHeader, sPayload, prvKey);

    $.ajax({
    type : "POST",
	url:"https://joe.vpham.com/cfg",
	data:{'data': sJWT},
	success: function(data) {
        for (var i = 0; i < data.length; i++) {
            var id = data[i][0];
            var name = data[i][1];
            var state = data[i][2];
            var time = data[i][3];
            var li = '<li id="' + id + '" data-icon="false">';
            li = li + '<a href="javascript:click(\'' + id + '\');">';
            li = li + '<img src="img/'+state + '.png" />';
            li = li + '<h3>' + name + '</h3>';
            li = li + '<p>' + formatState(state, time) + '</p>';
            li = li + '</a></li>';
            $("#doorlist").append(li);
            $("#doorlist").listview('refresh');
	    }
	}
    });
}

function formatState(state, time)
{   
	dateStr = dateFormat(new Date(parseInt(time)*1000), "mmm dS, yyyy, h:MM TT");
	return state.charAt(0).toUpperCase() + state.slice(1) + " as of " + dateStr;
};

function click(name) 
{
    // Header
    var oHeader = {alg: 'HS256', typ: 'JWT'};
    // Payload
    var oPayload = {};
    oPayload.id = name;
    oPayload.uuid = device_id;
    // Sign JWT, password=616161
    var sHeader = JSON.stringify(oHeader);
    var sPayload = JSON.stringify(oPayload);
    //var prvKey = KEYUTIL.getKey(sPKCS8PEM, "altamira");
    var prvKey = "altamira";
    var sJWT = KJUR.jws.JWS.sign("HS256", sHeader, sPayload, prvKey);

	$.ajax({
	type : "POST",
	url:"https://joe.vpham.com/clk",
	data:{'data': sJWT}
	})
};

function uptime() {

    // Header
    var oHeader = {alg: 'HS256', typ: 'JWT'};
    // Payload
    var oPayload = {};
    oPayload.uuid = device_id;
    // Sign JWT, password=616161
    var sHeader = JSON.stringify(oHeader);
    var sPayload = JSON.stringify(oPayload);
    //var prvKey = KEYUTIL.getKey(sPKCS8PEM, "altamira");
    var prvKey = "altamira";
    var sJWT = KJUR.jws.JWS.sign("HS256", sHeader, sPayload, prvKey);

	 $.ajax({
	type : "POST",
	url:"https://joe.vpham.com/upt",
	data:{'data': sJWT},
	success: function(data) {
		$("#uptime").html(data)
		setTimeout('uptime()', 60000)
	},
	error: function(XMLHttpRequest, textStatus, errorThrown) {
		setTimeout('uptime()', 60000)
	},
	dataType: "json",
	timeout: 60000	
	 });
}


function poll(){

	$.ajax({
	    type : "POST",
		url: "https://joe.vpham.com/upd",
		data: {'lastupdate': lastupdate},
		success: function(response, status) {
			lastupdate = response.timestamp;
			for (var i = 0; i < response.update.length; i++) {
			var id = response.update[i][0];
			var state = response.update[i][1];
			var time = response.update[i][2];
			$("#" + id + " p").html(formatState(state, time));
			$("#" + id  + " img").attr("src", "img/" + state + ".png")
			$("#doorlist").listview('refresh');
			}
			setTimeout('poll()', 1000);
		},
		// handle error
		error: function(XMLHttpRequest, textStatus, errorThrown){
			// try again in 10 seconds if there was a request error
			setTimeout('poll();', 10000);
		},
		//complete: poll,
		dataType: "json", 
		timeout: 30000
	});    
};

/*function init() {
	uptime()
	poll()
}*/

//$(document).live('pageinit', init);

