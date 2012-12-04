Performance Framework
=====================

##Description
###Simple framework for a benchmark test

This framework generates a html with the result of a benchmark test, including CPU and memory graphs and an additional 
graph that can be customized depending on your test.
The log is a simple table that contains the sentences that tests have generated.
The additional graph is a 2D graph where you can choose the meaning of X and Y.
(Example: "X" can be the number of clients of a server and "Y" can be the number of transactions per second).
* NOTE: You can download all graphs generated on different PNG files and log on a TXT file. (only when bootstrap template is used)

##How to use

To configure the benchmark, you must create a JS file and include the performaceFramework. Then you must configure the
benchmark as follows:
```
var scenario = describe(NAME, DESCRIPTION, TEMPLATE, ['X Axis Name', 'Y Axis Name'], [MONITORS HOST], PATH_TO_FOLDER_WRITE_RESULT);
```
There are two possible templates now: wijmo or bootstrap.

In each benchmark, some tests can be created. To create a test you must run the following code:
```
scenario.test(function(log,point){
    //Your code here
});
```
Then you can write your test on the indicated area. log and point are functions to register logs and points. The log(val)
function recives an string and the point(val1, val2) function recieves two numbers.

Once the benchmark has finished (all test has been completed), you must execute the done() function to create the file
with results. The file will be generated 10 seconds later to monitor possible memory leaks on your code.
```
scenario.done();
```

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

The next example shows how to run the framework with TWO monitors:
```
var pf = require('performanceFramework');

//monitors on localhost and 192.168.1.65
var scenario = pf.describe('TEST', 'This is an example...', 'wijmo', ['Petitions', 'Seconds'], ['localhost', '192.168.1.65'], '.'); 

scenario.test(function(log,point){
    log("20 petitions in 10 seconds");
    point(20,10);
    
    log("100 petitions in 60 seconds");
    point(100,60);
});

setTimeout(function() {
    //done function must be called when the benchmark has finished
    scenario.done();
}, 10000); 
```

###Without Monitor:

That option can only generate the customize graph and log.

The next example shows how to run the framework without monitors:
```
var pf = require('performanceFramework');

//without monitors
var scenario = pf.describe('TEST', 'This is an example...', 'wijmo', ['Petitions', 'Seconds'], [], '.'); 

scenario.test(function(log,point){
    log("20 petitions in 10 seconds");
    point(20,10);
    
    log("100 petitions in 60 seconds");
    point(100,60);
});

setTimeout(function() {
    //done function must be called when the benchmark has finished
    scenario.done();
}, 10000); 
```
