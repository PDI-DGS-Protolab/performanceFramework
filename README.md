Performance Framework
=====================

##Description
###Simple framework for a benchmark test

This framework generates a html with the result of a benchmark test, including gCPU and memory graphs and an additional 
graph that can be customized depending on your test.
The log is a simple table that contains the sentences that tests have generated.
The additional graph is a 2D graph where you can choose the meaning of X and Y.
(Example: "X" can be the number of clients of a server and "Y" can be the number of transactions per second).
* NOTE: You can download all graphs generated on different PNG files and log on a TXT file.

##How to use

There are two options to use the framework:


###With Monitor:

When you install this framework in your repository you can monitor the CPU and memory of your processes. For this purpose
the framework has an app called "monitor.js" that is located in node_modules/performanceFramework.

If you want CPU and memory monitoring you must run "monitor.js" in the host where you run the process to test. In order to
monitor the processs, "monitor.js" must receive the paths of the programs that you want to monitor in this way: "program-to-run 
arguments" (e.g: if you want to run node app named app.js you need to run monitor.js "node path/app.js").
The CPU and memory of each process will be represented in two graphs with one colour for each process being monitored.

###Without Monitor:

That option can only generate the customize graph and log.