/**
 * Created with JetBrains WebStorm.
 * User: oelmaallem
 * Date: 5/11/12
 * Time: 11:59
 * To change this template use File | Settings | File Templates.
 */

var sender = require('./sender');
var net = require('net');

var number_scenarios = 0;
var webSocket;

var receiveMessage = sender.receiveMessage;
var sendMessage = sender.sendMessage;

var performance = function (connected) {
    sender.createSocket(8090, function (socket) {
        'use strict';
        webSocket = socket;
        connected();
    });
};

var test = function (callback) {
    var id = this.test_id;

    var log = function (log) {
        var now = new Date();
        var nowToString = now.toTimeString().slice(0, 8);
        sender.sendMessage(webSocket, 'endLog', {id: id, time: nowToString, message: log});
    };

    var points = function (x, y, z) {
        var now = new Date();
        var nowToString = now.toTimeString().slice(0, 8);
        var data = {time: nowToString, message: {id: id, point: [x, y, z]}, version: 0};
        sendMessage(webSocket, 'newPoint', data);
    };
    receiveMessage(webSocket, 'newTest', function (req) {
        if (req.id === id) {
            callback(log, points);
        }
    });
    callback(log, points);
};

var Describe = function (name, description, axes, hosts) {
    'use strict'
    this.test_id = number_scenarios++;
    this.test = test;
    createAndLaunchMonitors(this.test_id, hosts);
    sendMessage(webSocket, 'newScenario', {id: this.test_id, name: name, description: description, type: axes.length, axes: axes});
};

var createAndLaunchMonitors = function (id, hosts) {
    'use strict';
    var hostsRec = 0, i = 0, client;

    for (i = 0; i < hosts.length; i++) {
        var host = hosts[i].host;
        var port = hosts[i].port;
        var client = new net.Socket();
        client.connect(port, host, function (client) {
            client.on('data', function (data) {

                var splitted = data.toString().split('\n');
                var validData = splitted[splitted.length - 2];

                var JSONdata = JSON.parse(validData);

                sendMessage(webSocket, 'cpu', {id: id, host: JSONdata.host, cpu: JSONdata.cpu.percentage});
                sendMessage(webSocket, 'memory', {id: id, host: JSONdata.host, memory: parseInt(JSONdata.memory.value)});
            });

        }.bind({}, client));

        client.on('error', function (err) {
            console.log(err);
        });
    }
};
performance(function () {

    var Scenario1 = new Describe("hola", "hola", ['x', 'y'], [
        {host: 'localhost', port: 8091}
    ]);
    Scenario1.test(function (log,points) {
        points(1,2);
        log('Holaaa');
    });
});

module.exports = Describe;
module.exports = test;
