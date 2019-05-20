# Setup Instructions

## MAVROS 
roslaunch px4.launch steps


- `roscore`

 These instruction are for running the launch file for the first time.

- `source /opt/ros/kinetic/setup.bash`
- `ls /opt/ros/kinetic/lib/mavros`
- `rosrun mavros mavros_node _fcu_url:='udp://:14540@127.0.0.1:14557'`
		

- `source /opt/ros/kinetic/setup.bash`
- `ls /opt/ros/kinetic/lib/mavros`
- `rosrun mavros gcs_bridge  _gcs_url:='udp://@127.0.0.1'`

ctrl+c 	rosrun mavros mavros_node _fcu_url:='udp://:14540@127.0.0.1:14557'





#### PX4 Launch *

This instruction has to be executed everytime 'px4.lunch' is to be launched.

- `source /opt/ros/kinetic/setup.bash`
- `ls /opt/ros/kinetic/lib/mavros`
-`roslaunch mavros px4.launch fcu_url:='udp://:14540@127.0.0.1:14557'`

The above instructions are for first time setup of the px4 launch file

#### Execute Launch file

use  'roscore'
and instruction star-marked.





##  GAZEBO ROS NODE 

launch the gazebo_ros to initialise to launch '/gazebo' node
this open empty gazebo world

- `rosrun gazebo_ros gazebo`

check the launch
- `rosnode list`


launch world files on gazebo

- `/usr/share/gazebo-7/worlds`
- `rosrun gazebo_ros gazebo your_file_name.world`





##  GAZEBO IRIS 

- `cd your_workspace/src/Firmware`
- `source Tools/setup_gazebo.bash $(pwd) $(pwd)/build/px4_sitl_default`
- `export ROS_PACKAGE_PATH=$ROS_PACKAGE_PATH:$(pwd)`
- `export ROS_PACKAGE_PATH=$ROS_PACKAGE_PATH:$(pwd)/Tools/sitl_gazebo`

#### Launch file
- `roslaunch px4 posix_sitl.launch`

#### Launch another world

- `source Tools/setup_gazebo.bash $(pwd) $(pwd)/build/px4_sitl_default`
- `roslaunch gazebo_ros empty_world.launch world_name:=$(pwd)/Tools/sitl_gazebo/worlds/iris.world`





## GAZEBO WITH MAVROS 

if used, then only this step is required
above are used only to launch separately

current is iris.world
to change follow above steps



- `cd your_workspace/src/Firmware`
- `source Tools/setup_gazebo.bash $(pwd) $(pwd)/build/px4_sitl_default`
- `export ROS_PACKAGE_PATH=$ROS_PACKAGE_PATH:$(pwd)`
- `export ROS_PACKAGE_PATH=$ROS_PACKAGE_PATH:$(pwd)/Tools/sitl_gazebo`


#### Launch file

- `roslaunch px4 mavros_posix_sitl.launch`



