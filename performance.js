/**
 * Created with JetBrains WebStorm.
 * User: oelmaallem
 * Date: 5/11/12
 * Time: 11:59
 * To change this template use File | Settings | File Templates.
 */

var sender = require('./sender');

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
    createAndLaunchAgents(test_id, hosts);
    sendMessage(webSocket, 'newScenario', {id: test_id, name: name, description: description, type: axes.length, axes: axes});
};

describe.prototype.test = function (callback) {
    var id = this.test_id;

    var log = function (log) {
        sendMessage(webSocket, 'endLog', {host: benchmark.nameHost[auxHost], time: nowToString, message: log});
    };

    var points = function (x, y, z) {


    };
    receiveMessage(webSocket, 'newTest', function (req) {
        if (req.id === id) {
            callback(log, points);
        }
    });
};

var createAndLaunchAgents = function (hosts) {
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

                sendMessage(webSocket, 'cpu', {host: JSONdata.host, cpu: JSONdata.cpu.percentage});
                sendMessage(webSocket, 'memory', {host: JSONdata.host, memory: parseInt(JSONdata.memory.value)});
            });

        }.bind({}, client));
    }
};