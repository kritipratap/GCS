# Ground Control Software

 This package provides a ground station control software for UAVs. It displays the OSM map with Leaflet in a browser, while connected to ROS. This displays the trajectory of GPS (/NavSatFix) using a marker and enables to add waypoints for navigation. The navigation of vehicle can be monitored using the video feed provided by the camera at the interface. An additional feed can be incorporated by selecting the appropriate topic from the list present on the interface

 **Thanks to**: 
 1) [ROS-OSM-map-integration](https://github.com/sylvainar/ROS-OSM-map-integration) for providing the ROS interface.
 2) [Leaflet Linear Measurement Plugin](https://github.com/NLTGit/Leaflet.LinearMeasurement) for providing the measurement plugin.
 3) [ROS_leaflet_gps](https://github.com/zhanghanduo/ROS_leaflet_gps) for providing Leaflet Mapping for ROS

## Installation 

This is not actually a ROS package, so you do not need to put it in catkin workspace. It connects to ROS to get information from GPS sensor, and uses some ROS functionality, for instance ROS param, ROS topic, ROS service etc. 

The flight controller used is pixhawk. To enable completely functionality of package create a catkin workspace with [px4 Firware](https://github.com/PX4/Firmware). To operate the software with simulation, use gazebo. The setup procedure is given in `SETUP.md`.

To allow this application to connect with ROS, you need to install RosBridge, which is kind of a bridge to connect some Javascript apps to the ROS core. To do so, please follow the [tutorial](http://wiki.ros.org/rosbridge_suite/Tutorials/RunningRosbridge).

Simply type:
```
 sudo apt install ROS-<ROS-VERSION>-rosbridge-suite
```

In order to launch rosbridge with the rest of your stuff, you can add this to your launch file :
```
    <launch>
        <include file="$(find rosbridge_server)/launch/rosbridge_websocket.launch" > 
            <arg name="port" value="9090"/>
        </include>
    </launch>
```

And then, open the page `index.html` with your browser, and you're ready. You can even set the default page of your browser to it, so it opens automatically on startup.

## Structure

```bash
    .
    ├── assets                  # Pictures and icons.
    ├── launch                  # Demo launch files
    ├── lib                     # All important js libraries, including leaflet, leaflet plugins, three 3D lib.
    ├── index.html              # Demo html page for displaying the map.
    ├── script_img.js	        # Implemented js script for navigation.
    ├── script_fix.js           # Demo js script to display `NavSatFix` message.
    ├── LICENSE
    ├──	SETUP.md
    └── README.md
```

##  Launch

#### Configuration

The configuration of the module can be modified just by changing the value at the top of the script.js file.

 - `CONFIG_tile_source` : Set the source of the tiles for the map. If you downloaded the maps of the area you want to move in, then you can set it to `local`. Else, set it to `server`.
 - `CONFIG_tile_local_path` : Path to the downloaded tiles
 - `CONFIG_ROS_server_URI` : Route to ROS server. It could be localhost or an IP.

#### Parameters

In the lab, we're working with two different GPS, which are not publishing on the same topic and at the same frequency. So two parameters can be set : 

- `/panel/gps_topic` for the GPS topic's name.
- `/panel/nb_cycles` for the number of cycles between each refreshing.
- `/panel/img_topic` for displaying the video feed from interface.
- `/panel/waypt_topic` for updating the waypoint list .
- `/panel/wpreach_topic` for checking if waypoint reached.

You can set those in a ROS launch file, or set it using `rosparam set`, then refreshing the page in the browser by clicking on the refresh button.


#### Execute


 1) Run `roscore`.

 2) Run `roslaunch ./launch/novatel_img.launch`

 3) Open *index.html* with a browser

 4) Play demo ROS bag file


