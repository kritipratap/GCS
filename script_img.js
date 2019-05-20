

// The name of the GPS publisher name by default
var CONFIG_default_gps_topic_name = '/mavros/global_position/global';
//var CONFIG_default_img_topic_name_1 = '/csi_cam/image_raw/compressed';
//var CONFIG_default_img_topic_name_2 = '/csi_cam/image_raw/compressed';

//topic value added only when user selects
var topic_value_1 = null;
var topic_value_2 = null;

//This is used to create topic list generated from ros servicee
var x, index, value, topic;

//create new marker and store lt and ln
var lt, ln;

//count the markers
var point = [0];
var count = 1;

//access the current marker added on map with its coordinates
//var newmarker, coord;

//console.log("value is" + topic_value_2);

var CONFIG_default_img_topic_name_1 = '/csi_cam/image_raw/compressed';

var CONFIG_default_waypoint_topic = '/mavros/mission/waypoints';
var CONFIG_default_img_waypoint_reach_topic = '/mavros/mission/reached';
//'/csi_cam/image_raw/compressed';

// The number of cycles between every marker position reload
var CONFIG_cycles_number = 10;


// We can download the map online on OSM server, but
// it won't work not connected to the internet.
// If you downloaded tiles then you can
// access them in local, or else, connect to server.
// Set this config to "local" or "server".

var CONFIG_tile_source = 'local';

// If you use local tiles, set here the path to it
var CONFIG_tile_local_path = 'tiles2/{z}/{x}/{y}.png';

// Network address to ROS server (it can be localhost or an IP)
var CONFIG_ROS_server_URI = 'localhost';

var map;
var selectionMode;
var carIcon = L.icon({
    iconUrl: 'assets/car1.png',
    iconSize: [22, 22],
    iconAnchor: [0, 0],
    popupAnchor: [-3, -30]
});
var markerPosition = L.marker([0,0]);
var markerPosition2 = L.marker([0,0], {icon: carIcon});

// init the map
function mapInit() {

	// Var init

	// Fetch tiles
	if(CONFIG_tile_source === 'local')
		var tileUrl = CONFIG_tile_local_path;
	if(CONFIG_tile_source === 'server')
		var tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

	// Set attrib
	var attrib = 'Map data © OpenStreetMap contributors';

	// Map loading
	map = L.map('map');
	var osm = L.tileLayer(tileUrl, {
		minZoom: 11,
		maxZoom: 19,
		attribution: attrib
	});
	osm.addTo(map);


	map.addControl(new L.Control.LinearMeasurement({
		unitSystem: 'metric',
		color: '#FF0080'
	}));

	L.easyButton('glyphicon glyphicon-refresh', function(btn, map){
		window.location.reload();
	}).addTo(map);
	
	// marker
	map.on('click',addMarker);
        
	return map;
}


//add a new marker to the map and access the coordinates
//this adds only a single marker to the map
//change point and count values to update
//max number of markers that can be added to map

function addMarker(e){
        if (point[count]){
            map.removeLayer(point[count]);
        }
        point[count] = new L.marker(e.latlng).addTo(map);
        var coord = e.latlng;
        console.log(coord);
        lt = coord.lat;
        ln = coord.lng;
        console.log(lt + "\t" + ln);
        count = 1;
        //sessionStorage.setItem("lati", lt);
        //sessionStorage.setItem("longi", ln);
        //return newmarker;
       
} 

//clear the marker added to the map

function clrMarker(){
        
        if(point[count]){
            map.removeLayer(point[count]);
        }
        
        count = 1;
}


//  SCRIPT
var bounds;
var currentPosition = {latitude : 0, longitude : 0};
var startPoint;
var endPoint;
var zoomLevel = 17;
var routeControl;
var loadedMap = false;
var loadedMap2 = false;
var i = 0;
var listenerGPS;
var listenerPose;

//=== ROS connection
var ros = new ROSLIB.Ros({
	url : 'ws://'+ CONFIG_ROS_server_URI +':9090'
});

swal({
	title: "Connecting to ROS...",
	showConfirmButton: false,
	closeOnConfirm: false,
	showLoaderOnConfirm: true,
	allowOutsideClick: false,
	allowEscapeKey: false
});

ros.on('connection', function() {
	console.log('Connected to websocket server.');
	swal({
		title: "Waiting...",
		text: "The navigation module can't work without the GPS. Launch the GPS and the module will start automatically.",
		type: "info",
		confirmButtonText: "Reload",
		closeOnConfirm: false,
		allowOutsideClick: false,
		allowEscapeKey: false
	},
	function(){
		window.location.reload();
	});
});

ros.on('error', function(error) {
	console.log('Error connecting to websocket server: ', error);
	swal({
		title: "Error connecting the ROS server",
		text: "Unable to reach ROS server. Is rosbridge launched ?",
		type: "error",
		confirmButtonText: "Retry",
		closeOnConfirm: false,
		allowOutsideClick: false,
		allowEscapeKey: false
	},
	function(){
		window.location.reload();
	});
});

ros.on('close', function() {
	console.log("Connexion closed.");
	swal({
		title: "Error connecting the ROS server",
		text: "Unable to reach ROS server. Is rosbridge launched ?",
		type: "error",
		confirmButtonText: "Retry",
		closeOnConfirm: false,
		allowOutsideClick: false,
		allowEscapeKey: false
	},
	function(){
		window.location.reload();
	});
});

//=== Init the map
mapInit();

// Set the GPS listener
// Create param with initial value
var paramTopicNameValue = CONFIG_default_gps_topic_name;
var paramTopicNameImgValue1 = CONFIG_default_img_topic_name_1;
//var paramTopicNameImgValue2 = CONFIG_default_img_topic_name_2;
var paramNbCyclesValue = CONFIG_cycles_number;

//set up the topic
var paramTopicWayptValue = CONFIG_default_waypoint_topic;
var paramTopicWpRValue = CONFIG_default_img_waypoint_reach_topic;



//  Init the ROS param
var paramTopicName = new ROSLIB.Param({ros : ros, name : '/panel/gps_topic'});
var paramTopicImg1 = new ROSLIB.Param({ros : ros, name : '/panel/img_topic'});
//var paramTopicImg2 = new ROSLIB.Param({ros : ros, name : '/panel/img_topic'});
var paramTopicWaypt = new ROSLIB.Param({ros : ros, name : '/panel/waypt_topic'});
var paramTopicWpR = new ROSLIB.Param({ros : ros, name : '/panel/wpreach_topic'});
var paramNbCycles = new ROSLIB.Param({ros : ros, name : '/panel/nb_cycles'});

var path_ = [];
var firstloc_x;
var firstloc_y;
var polyline_;
var polyline2_;


// ros service to access all the topics
var service = new ROSLIB.Service({
        ros: ros,
        name:'/rosapi/topics',
        serviceType: 'rosapi/Topics'
});

// creation of dropdown from values generated by ros service
service.callService({},function(data){
        console.log(data.topics,data.types);

        var select = document.getElementById("vid_list");
        var options = data.topics;
        document.getElementById("vid_list").innerHTML = "";

        for(var i=0; i< options.length; i++) {
                var opt = options[i];
                var el = document.createElement("options");
                el.textContent = opt;
                el.value = i;
                select.appendChild(el);
                //console.log(el.textContent);
                document.getElementById("vid_list").innerHTML += "<option value=" + el.value +">" + el.textContent + "</option>";
        }

});

    
//   Set the value
paramTopicName.get(function(value) {
	// If the param isn't created yet, we keep the default value
	if(value !== null)
		paramTopicNameValue = value;
	else
		paramTopicName.set(paramTopicNameValue);

	paramNbCycles.get(function(value) {
		// If the param isn't created yet, we keep the default value
		if(value !== null)
			paramNbCyclesValue = value;
		else
		paramNbCycles.set(paramNbCyclesValue);


		// Set the listener information
		listenerGPS = new ROSLIB.Topic({
			ros : ros,
			name : paramTopicNameValue,
			messageType : 'sensor_msgs/NavSatFix'
			
		});

		// Set the callback function when a message from /gps is received

		var i = 0;

		listenerGPS.subscribe(function(message) {
			// We have to wait for the GPS before showing the map, because we don't know where we are
			var lat = message.latitude;
			var lon = message.longitude;

			if(loadedMap === false)
			{
				swal.close();
				// Center the map on the position
				map.setView([lat, lon], zoomLevel);
				// Add the marker on the map
				markerPosition.addTo(map);
				markerPosition2.addTo(map);

				firstloc_x = message.northing;
				firstloc_y = message.easting;

				path_.push([lat, lon]);
				polyline_ = L.polyline(path_, {color: 'red'}, {weight: 1}).addTo(map);

				// Set the flag to true, so we don't have to load the map again
				loadedMap = true;
			}

			if(i % paramNbCyclesValue === 0)
			{
				// Refresh the global variable with the position
				currentPosition.latitude = lat;
				currentPosition.longitude = lon;
				// Refresh the position of the marker on the map
				markerPosition.setLatLng([lat, lon]);

				polyline_.addLatLng([lat, lon]);

				// console.log("path: ", JSON.stringify(path_));

				// If the marker has went out of the map, we move the map
				bounds = map.getBounds();
				if(!bounds.contains([lat, lon]))
					map.setView([lat, lon], zoomLevel);

				// console.log("Update position");
			}

			i++;

		});
	});
});

var listenerImg1;
var listenerImg2;


//directly displays the image topic whenever the interface is launched

paramTopicImg1.get(function(value1) {
        if(value1!==null)
                paramTopicNameImgValue1 = value1;
        else
                paramTopicImg1.set(paramTopicNameImgValue1);
        
    var imageTag1 = document.getElementById("video1");

        listenerImg1 = new ROSLIB.Topic({
                ros: ros,
                name: paramTopicNameImgValue1,
                messageType: 'sensor_msgs/CompressedImage'
        });
                // subscription of image topic to dispaly in html
        listenerImg1.subscribe(function(imageData1)
        {
                //console.log(" image data",imageTag1);
                imageTag1.src= "data:image/jpeg;base64,"+imageData1.data;
        });

    
});


//select the value of topic from the dropdown list

function val1() {
        x = document.getElementById("vid_list");
        index = x.selectedIndex;
        value  = x.options[index].value;
        topic = x.options[index].text;
        console.log("vid is " + value);
        console.log("vid is " + topic);
        //topic_value_2 = topic;
        return topic;

};


//display the image only when the desired 
//image topic is selected from the list

//in order to change the topic to be selected
//change the topic name in the condition (if statement)
//in the function below
//Default topic is "/csi_cam/image_raw/compressed"

function on_click(){
        topic_value_2 = val1();

        console.log("topic "+topic_value_2);

        var CONFIG_default_img_topic_name_2 = topic_value_2;
        var paramTopicNameImgValue2 = CONFIG_default_img_topic_name_2;
        //topic selected
        if(topic_value_2 === '/csi_cam/image_raw/compressed') {
                var paramTopicImg2 = new ROSLIB.Param({ros : ros, name : '/panel/img_topic'});
        }

        if(topic_value_2 === '/csi_cam/image_raw/compressed'){

                paramTopicImg2.get(function(value2) {
                        if(value2!==null)
                                paramTopicNameImgValue2 = value2;
                        else
                                paramTopicImg2.set(paramTopicNameImgValue2);
                        
                    var imageTag2 = document.getElementById("video2");

                        listenerImg2 = new ROSLIB.Topic({
                                ros: ros,
                                name: paramTopicNameImgValue2,
                                messageType: 'sensor_msgs/CompressedImage'
                        });
                        // subscription of image topic to dispaly in html
                        listenerImg2.subscribe(function(imageData2)
                        {
                                //console.log(" image data",imageTag2);
                                imageTag2.src= "data:image/jpeg;base64,"+imageData2.data;
                        });


                });

        }

}

//  NAVIGATION

//functions to implement wapypoint navigation using mavros


// console.log("wp: " + lt + "\t" + ln);
var i = 0, index;
var yaw_value;


//update the home coordinates to set up 
//initial take off location

var home_lt = 0;
var home_ln = 0;

//change the yaw value during hover

var slider = document.getElementById("myRange");
var output = document.getElementById("sp");
output.innerHTML = slider.value;
slider.oninput = function() {
    output.innerHTML = this.value;
    yaw_value = this.value;
};


//setup the arming state before takeoff

function arm(){
    
        //select the mode of flight: auto, offboard, manual
        var mode_srv = new ROSLIB.Service({
                ros: ros,
                name: 'mavros/set_mode',
                type: 'mavros_msgs/SetMode'
        });

         mode_srv.callService({}, function(data1) {
                data1.base_mode = 0;
                data1.custom_mode = 'OFFBOARD';
                data1.mode_sent = true;
        });


        //set the arming state to initiate flight
        var arm_srv = new ROSLIB.Service({
                ros: ros,
                name: 'mavros/cmd/arming',
                type: 'mavros_msgs/CommandBool'
        });

        arm_srv.callService({}, function(data2){
                data2.value = true;
                if(data2.value) {
                    data2.success = true;
                    console.log("Arm status ok");
                }
        });

}


//takeoff from given position or current position

function take_off(){
    
         console.log("wp: " + lt + "\t" + ln);
       
         index = i++;
         
        //set the flight to takeoff
        var takeoff_srv = new ROSLIB.Service({
                ros: ros,
                name: 'mavros/cmd/takeoff',
                type: 'mavros_msgs/CommandTOL'
        });

        takeoff_srv.callService({}, function(data3){
                data3.altitude = 10;
                data3.latitude = home_lt;
                data3.longitude = home_ln;
                data3.min_pitch = 0;
                data3.yaw = 0;
                data3.success = true;
        });


        //new waypoint description
        
        paramTopicWaypt.get(function(value3) {
                if(value3!==null)
                        paramTopicWayptValue = value3;
                else
                        paramTopicWaypt.set(paramTopicWayptValue);

                var wayp = new ROSLIB.Topic({
                        ros: ros,
                        name: paramTopicWayptValue,
                        type: 'mavros_msgs/WaypointList' //
                });

                var new_wp = wayp.subscribe(function(wpdata){
                        wpdata.is_current = true;
                        wpdata.autocontinue = false; //
                        wpdata.param1 = 0;
                        wpdata.param2 = 0;
                        wpdata.param3 = 0;
                        wpdata.param4 = 0;
                        wpdata.x_lat = lt;
                        wpdata.y_long = ln;
                        wpdata.z_alt = 0;
                });
        
        

                //add new waypint 
                var wpush_srv = new ROSLIB.Service({
                        ros: ros,
                        name: 'mavros/mission/push',
                        type: 'mavros_msgs/WaypointPush'
                });

                wpush_srv.callService(new_wp, function(data4){
                        data4.start_index = index;
                        data4.waypoints = new_wp;
                        data4.success = true;
                        console.log("Index of WP: " + data4.start_index);
                });

        });
}


//land on the current position and disarm

function land(){
        var check = false;
        //check if reached the waypoint
        
         paramTopicWpR.get(function(value3) {
                if(value3!==null)
                        paramTopicWpRValue = value3;
                else
                        paramTopicWpR.set(paramTopicWpRValue);
                    
                    
                var wreach = new ROSLIB.Topic({
                        ros: ros,
                        name: paramTopicWpRValue,
                        type: 'mavros_msgs/WaypointReached'
                });

                wreach.subscribe(function(wrdata){
                        wrdata.wp_seq = index;
                });
        
        
                //set the flight to land
                
                var land_srv = new ROSLIB.Service({
                        ros: ros,
                        name: 'mavros/cmd/land',
                        type: 'mavros_msgs/CommandTOL'
                });

                land_srv.callService({}, function(data5){
                        data5.altitude = 10;
                        data5.latitude = 0;
                        data5.longitude = 0;
                        data5.min_pitch = 0;
                        data5.yaw = 0;
                        data5.success = true;
                        check = true;
                });

                if(check) {
                    console.log("Landed successfully");
                }

        });
       
}


//disarm after successful landing

function disarm(){
	var disarm_srv = new ROSLIB.Service({
                ros: ros,
                name: 'mavros/cmd/arming',
                type: 'mavros_msgs/CommandBool'
        });
        
        disarm_srv.callService({}, function(data7){
                data7.value = false;
                if(!data7.value)  {
                    data7.success = true;
                    console.log("Disarm success");
                }
        });
}


//pause in between the waypoint to hover

function pause(){
        console.log(yaw_value);
        var is_relative = false;
        
        var cmdyaw = new ROSLIB.Service({
                ros: ros,
                name: 'mavros/cmd/command',
                type: 'mavros_msgs/CommandLong'
        });
        
        cmdyaw.callService({}, function(data6){
                data6.command = 'MAV_CMD_CONDITION_YAW';
                data6.confirmation = 0;
                data6.param1 = yaw_value;
                data6.param2 = 0;
                data6.param3 = 1;
                data6.param4 = is_relative;
                data6.param5 = 0;
                data6.param6 = 0;
                data6.param7 = 0;
        });
        
}
