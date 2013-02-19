var net = require('net');
var fs = require('fs');
var ejs = require('ejs');
var path = require('path');

var DIR_MODULE = path.dirname(module.filename);
var MESSAGE_TEST_START = 'Test starts';
var MESSAGE_TEST_END = 'Test ends';

var test = function (name, callback) {
  'use strict';

  var nameUnderscore = name.replace(/\s/g, "_");
  var tests = this.tests;
  tests[nameUnderscore] = {name:name, logs:[], points:[]};

  var start = new Date().toTimeString().slice(0, 8);
  tests[nameUnderscore].logs.push({time:start, message:MESSAGE_TEST_START});
  tests[nameUnderscore].logs.push({time:start, message:MESSAGE_TEST_END});

  var log = function (log) {

    //Last tests ends is overwritten and a new one is added
    var now = new Date();
    var nowToString = now.toTimeString().slice(0, 8);
    var lastLogPos = tests[nameUnderscore].logs.length - 1;
    tests[nameUnderscore].logs[lastLogPos] = {time:nowToString, message:log};

    var end = new Date().toTimeString().slice(0, 8);
    tests[nameUnderscore].logs.push({time:end, message:MESSAGE_TEST_END});
  };

  var point = function (x, y) {
    var p = {x:x, y:y};
    tests[nameUnderscore].points.push(p);
  };

  callback(log, point);
};

var done = function () {
  'use strict'

  var name = this.name;
  var description = this.description;
  var template = this.template;
  var axes = this.axes;
  var tests = this.tests;
  var path = this.path;
  var clients = this.clients;

  function writeAndClose(cpuMem) {
    fs.readFile(DIR_MODULE + '/templates/' + template + '.ejs', function (err, data) {

      if (!err) {

        var html = ejs.render(data.toString(), {
          name:name,
          description:description,
          xAxis:axes[0],
          yAxis:axes[1],
          tests:tests,
          cpuMem:JSON.stringify(cpuMem)
        });

        var now = new Date();
        var nowToString = now.toTimeString().slice(0, 8);
        var file = path + '/' + name + '-' + nowToString + '.html';

        fs.writeFile(file, html, function (err) {
          if (err) {
            console.log(err);
          } else {
            console.log('The file ' + file + ' has been created successfully');
          }
        });


      } else {
        console.log('ERROR: The chosen template does not exist')
      }
    });

    for (var i = 0; i < clients.length; i++) {
      clients[i].removeAllListeners();
      clients[i].end();
    }
  };

  setTimeout(writeAndClose.bind({}, this.cpuMem), 10000);
};

var Describe = function (name, description, template, axes, hosts, path) {
  'use strict'

  this.name = name;
  this.description = description;
  this.template = template;
  this.axes = axes;
  this.path = path;
  this.test = test;
  this.done = done;
  this.tests = {};
  this.createAndLaunchMonitors = createAndLaunchMonitors;
  this.clients = [];

  if (hosts.length !== 0) {
    this.cpuMem = {};
    this.createAndLaunchMonitors(hosts, this.clients);
  }

  try {
    var stats = fs.lstatSync(path);
    if (!stats.isDirectory()) {
      console.log('Can\'t create directory ' + path + ': the file already exists');
      process.exit();
    }
  } catch (e) {

    var directories = path.split('/');
    var aux = '';

    for (var i = 0; i < directories.length; i++) {
      if (directories[i] !== '') {
        aux += directories[i] + '/';
        fs.mkdir(aux);
      }
    }

    console.log('The directory ' + aux + ' has been created');
  }
};


var createAndLaunchMonitors = function (hosts, clients) {
  'use strict';

  var i = 0;
  var CPU_Mem = this.cpuMem;
  var start = this.start;

  for (i = 0; i < hosts.length; i++) {
    var host = hosts[i];
    var client = new net.Socket();

    clients.push(client);
    client.connect(8091, host, function () {
      client.on('data', function (data) {

        var splitted = data.toString().split('\n');

        //The last is not a JSON. Is an empty string so it should not be parsed.
        for (var i = 0; i < splitted.length - 1; i++) {
          var validData = splitted[i];
          var jsonData = JSON.parse(validData);
          var id = jsonData.host + '_' + jsonData.name + '_' + jsonData.pid;

          if (!(CPU_Mem.hasOwnProperty(id))) {
            CPU_Mem[id] = [];
          }

          CPU_Mem[id].push({
            host:jsonData.host, name:jsonData.name,
            pid:jsonData.pid, cpu:jsonData.cpu.percentage,
            memory:parseInt(jsonData.memory.value)
          });
        }
      });

    });

    client.on('error', function (host, err) {
      console.log('monitor on \'' + host + '\' is not connected or is not working');
    }.bind(null, host));
  }
};

var describe = function (name, description, template, axes, hosts, path) {
  return new Describe(name, description, template, axes, hosts, path);
};

exports.describe = describe;