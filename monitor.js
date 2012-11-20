var childProcess = require('child_process');
var utils = require('./utils.js');
var net = require('net');
var os = require('os');

var paths = [];

for (var i = 2; i < process.argv.length; i++) {
    paths.push(process.argv[i]);
}

var programs = [];
var pid;
var pids = [];
programs = createProcessList(paths);

for (var i = 0; i < programs.length; i++) {
    var aux = new Array()
    pid = runProgram(programs[i].process);
    console.log('A new process has been launched with PID: ' + pid);

    setTimeout(function () {
        aux = utils.getchildProcesses(pid);
        aux.push(pid);
        pids.push(aux);
    }, 1000);
}

var server = net.createServer(function (connection, programs) {

    var monitorInterval;

    if (server.connections === 1) {

        console.log('Client open the connection...');

        //Monitoring an agent sending the client information about the usage of CPU and RAM
        monitorInterval = setInterval(function () {
            for (var i = 0; i < pids.length; i++) {
                function iterate(i) {
                    var res = utils.monitor(pids[i], function (res) {
                        console.log('CPU: ' + res.cpu + ' - Memory: ' + res.memory);
                        console.log(names[0]);
                        connection.write(JSON.stringify({host: os.hostname(), name: programs[i], cpu: {percentage: res.cpu}, memory: {value: res.memory}}) + '\n');
                    });
                }
                iterate(i);
            }
        }, 500);

        /*connection.on('data', function(data){
         config.tranRedisServer = JSON.parse(data);
         });*/

        connection.on('end', function () {
            console.log('Client closed connection...');
            clearInterval(monitorInterval);
            connection.end();

        });

    } else {
        connection.end();
    }
}).listen(8091);

/**
 * Runs a process
 * @return The PID of the process
 */
function runProgram(prog, arguments){
    var child = childProcess.spawn(prog, arguments);
    var pid = child.pid;
    return pid;
}

function splitAndName(path) {
    var elems = [];
    var res;
    elems = path.split('/');
    res = elems[elems.length - 1];
    return res;
}

function createProcessList(paths){
    var elems = [];
    var programsWithArgs = [];
    var programs = [];

    for(var i = 2; i < process.argv.length; i++){
        elems = process.argv[i].split(' ');
        if(elems.length > 1){
            programsWithArgs.push({process: elems[0], name: elems[0], arguments: elems.slice(1)});
        }
        if(elems.length === 1){
            programs.push({process: elems[0], name: splitAndName(elems[0])});
        }
    }

    programs = programs.concat(programsWithArgs);
    return programs;
}

process.on('uncaughtException', function onUncaughtException(err) {
    'use strict';
    //logger.warning('onUncaughtException', err);
    console.log(err.stack);
});