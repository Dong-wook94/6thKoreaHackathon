#!/usr/bin/env node
var WebSocketServer = require('websocket').server;
var http = require('http');
var Client = [];

var server = http.createServer(function (request, response) {//서버 열고
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(9000, function () { //포트 9000
    console.log((new Date()) + ' Server is listening on port 9000');
});

wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    return true;
}


wsServer.on('request', function (request) {
    if (!originIsAllowed(request.origin)) {
        // Make sure we only accept requests from an allowed origin
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        return;
    }

    var flag = 0;
    var connection = request.accept(null, request.origin);
   
    console.log((new Date()) + ' Connection accepted.');//connnect 됨.
    connection.on('message', function (message) {// 메시지 오면
        if (message.type === 'utf8') {
            var received_msg= message.utf8Data;
            console.log('Received Message: ' + received_msg + "address : " + connection.remoteAddress);
            var parsed_msg = received_msg.split(': ');
            console.log(parsed_msg[0]);
            console.log(parsed_msg[1]);
            if(parsed_msg[0]=="level_alert"){
                if(parsed_msg[1]==1){//수위 높을때
                    console.log("수위높음");
                }
                else{//수위 낮을때
                    console.log("수위낮음");
                }

            }

            
        }

        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });
    connection.on('close', function (reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});
