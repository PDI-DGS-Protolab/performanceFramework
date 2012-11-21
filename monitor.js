var childProcess = require('child_process');
var utils = require('./utils.js');
var net = require('net');
var os = require('os');
var cluster = require('cluster');

var paths = new Array();

for (var i = 2; i < process.argv.length; i++) {
    paths.push(process.argv[i]);
}

paths = paths.sort();

var names = [];
names = splitAndName(paths);
console.log(names[0]);

server = net.createServer(function (connection) {

    var pid;
    var monitorInterval;
    var pids = new Array();

    if (server.connections === 1) {

        console.log('Client open the connection...');

        for (var i = 0; i < paths.length; i++) {
            var aux = new Array()
            pid = createAgent(paths[i]);
            console.log('A new program has been launched with PID: ' + pid);

            setTimeout(function () {
                aux = utils.getchildProcesses(pid);
                aux.push(pid);
                pids.push(aux);
            }, 1000);
        }

        //Monitoring an agent sending the client information about the usage of CPU and RAM
        monitorInterval = setInterval(function () {
            for (var i = 0; i < pids.length; i++) {
                function iterate(i) {
                    var res = utils.monitor(pids[i], function (res) {
                        console.log('CPU: ' + res.cpu + ' - Memory: ' + res.memory);
                        console.log(names[0]);
                        connection.write(JSON.stringify({host: os.hostname(), name: names[i], cpu: {percentage: res.cpu}, memory: {value: res.memory}}) + '\n');
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
            process.kill(pid);
            connection.end();

        });

    } else {
        connection.end();
    }
}).listen(8091);

/**
 * Creates an agent
 * @return The PID of the agent
 */
var createAgent = function (path) {
    var child = childProcess.fork(path);
    var pid = child.pid;
    return pid;
}

function splitAndName(programs) {

    var listRes = [];

    for (var i = 0; i < programs.length; i++) {
        var elems = programs[i].split('/');
        elems = elems[elems.length - 1].split('.');
        var res = elems[0];
        listRes.push(res);
    }

    listRes = listRes.sort();
    var aux = listRes[1];
    var cont = 1;

    for (var i = 0; i < listRes.length; i++) {
        if (aux === listRes[i]) {
            listRes[i] = listRes[i] + cont.toString();
            cont++;
        }
        else {
            cont = 1;
            aux = listRes[i];
            listRes[i] = listRes[i] + cont.toString();
            cont++;
        }
    }
    console.log(listRes);
    return listRes;
}

process.on('uncaughtException', function onUncaughtException(err) {
    'use strict';
    //logger.warning('onUncaughtException', err);
    console.log(err.stack);
});