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
arguments". For example, if you want to run a node app named app.js you need to run:
```
node monitor.js "node path/to/app.js"
```
You can also monitor regular programs. For example, if you want to monitor redis-server, you must run:
```
node monitor.js "/path/to/redis-server"
```

The CPU and memory of each process will be represented in two graphs with one colour for each process being monitored.

###Without Monitor:

That option can only generate the customize graph and log.

### Example code

With two monitors:

```
var pf = require('performanceFramework');
var scenario1 = pf.describe('TEST', 'This is an example...', ['Xaxis', 'Yaxis'], ['localhost', '192.168.1.65'], '.'); //monitor on localhost
scenario1.test(function(log,point){
    log("new message");
    point(20,10);
    point(100,1);
    log("new message");
});
setTimeout(function() {
    scenario1.done();
}, 10000); 
```

Without monitors:

```
var pf = require('performanceFramework');
var scenario1 = pf.describe('TEST', 'This is an example...', ['Xaxis', 'Yaxis'], [], '.'); //no monitors
scenario1.test(function(log,point){
    log("new message");
    point(20,10);
    point(100,1);
    log("new message");
});
setTimeout(function() {
    scenario1.done();
}, 10000); 
```
