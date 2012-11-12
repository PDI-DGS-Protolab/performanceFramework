performanceFramework
====================

##Description
###Simple framework for a benchmark test

Generate your html with the result of a benchmark test, with graphs of CPU and memory and an additional graph 
and log that can be customized.
The log is a simple table that contains the phrases that you introduced.
The additional graph is printed with the  points [x,y] that you can choose who's "X" and who's "Y" 
(Example: "X" can be the number of clients of a server and "Y" can be TPS).
* NOTE: You can download all graphs generated on ".png" extension and log on ".txt" extension

###How to use

There are two options to use the framework:


1) With Monitor:

A monitor.js (performanceFramework/monitor.js) must be run in the same host where you want to run the program to test it.
monitor.js receives arguments that indicate a paths of the programs to run.
If you run with this option, it can generate the CPU and memory graphs (monitor.js sends this data to performance.js that
print it in the correspondig graph).
If you have more than one of programs to test, in the CPU and memory graphs you can see with different color each program.


2) Without Monitor:

That option only can print the customize graph and log.