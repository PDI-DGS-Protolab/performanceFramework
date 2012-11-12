Performance Framework
=====================

##Description
###Simple framework for a benchmark test

This framework generates a html with the result of a benchmark test, including gCPU and memory graphs and an additional 
graph that can be customized depending on your test.
The log is a simple table that contains the sentences that tests have generated.
The additional graph is a 2D graph where you can choose the meaning of X and Y.
(Example: "X" can be the number of clients of a server and "Y" can be the number of transactions per second).
* NOTE: You can download all graphs generated on PNG file and log on TXT file.

##How to use

There are two options to use the framework:


###With Monitor:

monitor.js (performanceFramework/monitor.js) must be run in the host where you execute the program to test.
monitor.js must receive as arguments the path of the programs to test and it will execute them. 
Using this option, CPU and memory graphs will be generated automatically (monitor.js will generate this data). 
If you have more than one program to test, the CPU and memory of each one will be represented with different colours.

###Without Monitor:

That option can only generate the customize graph and log.