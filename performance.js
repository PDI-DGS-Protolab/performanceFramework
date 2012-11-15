var net = require('net');
var fs = require('fs');
var ejs = require('ejs');
var path = require('path');

var DIR_MODULE = path.dirname(module.filename);

var test = function (callback) {
    var id = this.test_id;
    var points = this.points;
    var logs = this.logs;


    var log = function (log) {
        var now = new Date();
        var nowToString = now.toTimeString().slice(0, 8);
        logs.push({time: nowToString, message: log});

    };

    var point = function (x, y) {
        var now = new Date();
        var nowToString = now.toTimeString().slice(0, 8);
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

    fs.readFile(DIR_MODULE + '/template.ejs', function (err, data) {

        if (!err) {
            var html = ejs.render(data.toString(), {
                name: name,
                description: description,
                logs1: logs,
                logs2: JSON.stringify(logs),
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
    for (var i=0; i<this.clients.length; i++){
        this.clients[i].removeAllListeners();
        this.clients[i].end();
    }
};
var Describe = function (name, description, axes, hosts, path) {
    'use strict'
    this.name = name;
    this.description = description;
    this.axes = axes;
    this.path = path;
    this.test = test;
    this.done = done;
    this.logs = [];
    this.points = [];
    this.createAndLaunchMonitors = createAndLaunchMonitors;
    this.start = new Date();
    this.clients = [];

    if (hosts.length!==0)  {
        this.CPU_Mem = {};
        this.createAndLaunchMonitors(hosts, this.clients);
    }
    try {
        var stats = fs.lstatSync(path);
        if (!stats.isDirectory()) {
            console.log('Can\'t create directory ' + path + ' :the file exists');
            process.exit();
        }
    } catch (e) {
        var directories=path.split('/');
        var aux='';
        for (var i=0;i<directories.length;i++){
            if (directories[i]!==''){
                aux+=directories[i]+'/';
                fs.mkdir(aux);
            }
        }
        console.log('The directory ' + aux + ' has been created');
    }
};


var createAndLaunchMonitors = function (hosts, clients) {
    'use strict';
    var i = 0;
    var CPU_Mem = this.CPU_Mem;
    var start = this.start;
    for (i = 0; i < hosts.length; i++) {
        var host = hosts[i];
        var client = new net.Socket();
        clients.push(client);
        client.connect(8091, host, function (client) {
            client.on('data', function (data) {

                var splitted = data.toString().split('\n');
                var validData = splitted[splitted.length - 2];
                var JSONdata = JSON.parse(validData);
                console.log(JSONdata);

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

var describe = function (name, description, axes, hosts, path) {
    return new  Describe(name, description, axes, hosts, path);
};

exports.describe = describe;