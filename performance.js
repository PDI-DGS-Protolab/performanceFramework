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

sender.createSocket(8090, function (socket) {
    'use strict';
    webSocket = socket;
    exports.webSocket = webSocket;
});

var describe = function (name, description, axes, hosts, funtest) {
    'use strict'
    this.test_id = number_scenarios++;
    createAndLaunchMonitors(this.test_id, hosts);
    sendMessage(webSocket, 'newScenario', {id: test_id, name: name, description: description, type: axes.length, axes: axes});
};

var test = describe.prototype.test = function (callback) {
    var id = this.test_id;

    var log = function (log) {
        var now = new Date();
        var nowToString = now.toTimeString().slice(0, 8);
        sender.sendMessage(webSocket, 'endLog', {id:id, time: nowToString, message: log});
    };

    var points = function (x, y, z) {
        var now = new Date();
        var nowToString = now.toTimeString().slice(0, 8);
        var data={time: nowToString, message: {id: id, point: [x, y, z]}, version: version};
        sendMessage(webSocket, 'newPoint', data);
    };
    receiveMessage(webSocket, 'newTest', function (req) {
        if (req.id === id) {
            callback(log, points);
        }
    });
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

                sendMessage(webSocket, 'cpu', {id : id, host: JSONdata.host, cpu: JSONdata.cpu.percentage});
                sendMessage(webSocket, 'memory', {id : id, host: JSONdata.host, memory: parseInt(JSONdata.memory.value)});
            });

        }.bind({}, client));
    }
};

module.exports = describe;
module.exports = test;
