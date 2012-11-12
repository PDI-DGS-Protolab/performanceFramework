/**
 * Created with JetBrains WebStorm.
 * User: oelmaallem
 * Date: 5/11/12
 * Time: 11:59
 * To change this template use File | Settings | File Templates.
 */

var net = require('net');
var fs = require('fs');
var ejs = require('ejs');

var number_scenarios = 0;
var webSocket;

var test = function (callback) {
    var id = this.test_id;
    var points = this.points;
    var logs = this.logs;


    var log = function (log) {
        var now = new Date();
        var nowToString = now.toTimeString().slice(0, 8);

        //sender.sendMessage(webSocket, 'endLog', {id: id, time: nowToString, message: log});

        logs.push({time: nowToString, message: log});

    };

    var point = function (x, y) {
        var now = new Date();
        var nowToString = now.toTimeString().slice(0, 8);
        //var data = {time: nowToString, message: {id: id, point: arrayPoints}, version: 0};
        var p = {x: x, y: y};
        points.push(p);

    };
    callback(log, point);
};

var done = function () {
    var axes = this.axes;
    var name = this.name;
    var points = this.points;
    var logs = this.logs;
    var description = this.description;
    var path = this.path;
    var CPU_Mem = this.CPU_Mem;
    var memory = this.memory;
    var start = this.start;
    var end = new Date();
    fs.readFile('./log/template.ejs', function (err, data) {
        if (!err) {
            console.log(JSON.stringify(CPU_Mem));
            var html = ejs.render(data.toString(), {
                name: name,
                description: description,
                logs: logs,
                Xaxis: axes[0],
                Yaxis: axes[1],
                points: JSON.stringify(points),
                CPU_Mem: JSON.stringify(CPU_Mem),
                start : start.toTimeString().slice(0, 8),
                end : end.toTimeString().slice(0, 8)

        });


            var now = new Date();
            var nowToString = now.toTimeString().slice(0, 8);
            var file = name + '-' + nowToString + '.html';
            file = path + '/' + file;
            fs.writeFile(file, html, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('The file ' + file + ' was saved');
                }
            });


        }
    });
};
var Describe = function (name, description, axes, hosts, path) {
    'use strict'
    this.test_id = number_scenarios++;
    this.name = name;
    this.description = description;
    this.axes = axes;
    this.path = path;
    this.test = test;
    this.done = done;
    this.logs = [];
    this.points = [];
    this.CPU_Mem = {};
    this.createAndLaunchMonitors = createAndLaunchMonitors;
    this.start = new Date();
    this.createAndLaunchMonitors(hosts);
};


var createAndLaunchMonitors = function (hosts) {
    'use strict';
    var i = 0, client;
    var CPU_Mem = this.CPU_Mem;
    var start = this.start;
    for (i = 0; i < hosts.length; i++) {
        var host = hosts[i];
        var client = new net.Socket();
        client.connect(8091, host, function (client) {
            client.on('data', function (data) {

                var splitted = data.toString().split('\n');
                var validData = splitted[splitted.length - 2];
                var JSONdata = JSON.parse(validData);
                console.log(JSONdata);

                //sendMessage(webSocket, 'cpu', {id:id, host:JSONdata.host, cpu:JSONdata.cpu.percentage});
                //sendMessage(webSocket, 'memory', {id:id, host:JSONdata.host, memory:parseInt(JSONdata.memory.value)});

                //var now = (new Date().valueOf()) - start.valueOf();
                //var nowToString = now.toTimeString().slice(0, 8);
                var id = JSONdata.host + JSONdata.name;
                if (!(CPU_Mem.hasOwnProperty(id))) {
                    CPU_Mem[id] = [];
                }
                CPU_Mem[id].push({host: JSONdata.host, name: JSONdata.name, cpu: JSONdata.cpu.percentage, memory: parseInt(JSONdata.memory.value)});
            });

        }.bind({}, client));

        client.on('error', function (err) {
            console.log(err);
        });
    }
};


var Scenario1 = new Describe("hola", "hola", ['X', 'Y'], ['localhost'], 'log');
Scenario1.test(function (log, point) {
    point(6, 2);
    log('Holaaa');
});
setTimeout(function () {
    Scenario1.done();
}, 5000);

module.exports = Describe;
module.exports = test;
