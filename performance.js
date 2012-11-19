var net = require('net');
var fs = require('fs');
var ejs = require('ejs');
var path = require('path');

var DIR_MODULE = path.dirname(module.filename);

var test = function (name, callback) {
    var tests = this.tests;
    tests[name] = {name : name, logs: [], points : []};
    var start  = new Date().toTimeString().slice(0, 8);
    tests[name].logs.push({time: start, message: "Tests starts"});
    tests[name].logs.push({time: start, message: "Tests ends"});

    var log = function (log) {
        var now = new Date();
        var nowToString = now.toTimeString().slice(0, 8);
        tests[name].logs[(tests[name].logs.length-1)] = {time: nowToString, message: log};
        var end  = new Date().toTimeString().slice(0, 8);
        tests[name].logs.push({time: end, message: "Tests ends"});
    };

    var point = function (x, y) {
        var p = {x: x, y: y};
        tests[name].points.push(p);
    };
    callback(log, point);
};

var done = function () {
    var axes = this.axes;
    var name = this.name;
    var tests = this.tests;
    var description = this.description;
    var path = this.path;
    var CPU_Mem = this.CPU_Mem;
    var memory = this.memory;
    var start = this.start;
    var end = new Date();
    fs.readFile(DIR_MODULE + '/wijmo.ejs', function (err, data) {
        if (!err) {
            console.log(tests.test2.name);
            var html = ejs.render(data.toString(), {
                name: name,
                description: description,
                Xaxis: axes[0],
                Yaxis: axes[1],
                tests: tests,
                CPU_Mem: JSON.stringify(CPU_Mem),

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
    this.tests = {};
    this.createAndLaunchMonitors = createAndLaunchMonitors;
    this.clients = [];

    this.num_tests = 0;

    this.test_done = function(){

    }

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

var test = describe('TEST', 'This is an example...', ['X', 'Y'], [], '.');

test.test("test2", function(log,point){
    log('hola');
    point(20,10);
    point(33,12);
});

test.test("test3", function(log,point){
    log("rgdfg");
    point(2,4);
    point(34,1);
});


setTimeout(function() {
    test.done();
}, 0);

exports.describe = describe;
