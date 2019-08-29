#!/usr/bin/env node
var WebSocketServer = require('websocket').server;
var http = require('http');
var admin = require("firebase-admin");
var FCM = require('fcm-node');
var serverKey = 'AAAA8HdkNFQ:APA91bFYeDtX4eo0UOkZpqX3xuj7j7figjBAOQGAT8HkgEvLFBjP2HKOYgCbI8GU1PxcKHHCi_8iU1N1SJyIiPFrO7K5hXLF6K716L3x9YsQ2YhtNI70eldNMtNI8CkF-4jQHIQcit62';
var serviceAccount = require("./chimchakae-1eb6bc4fce0a.json");

//var msg_data = require('./module/fcm');

var Client = [];

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://chimchakae.firebaseio.com"
});

var db = admin.database();
var ref = db.ref("users");
ref.on("value", function(snapshot) {
    console.log("----------전체 회원----------");
    console.log("전체 회원수 : "+snapshot.numChildren());
    //console.log("snapshot key : "+snapshot.val());
    snapshot.forEach(function(childSnapshot){
        console.log("key: "+childSnapshot.key);
        console.log("userID : "+childSnapshot.child("userId").val());
        console.log("deviceToken : "+childSnapshot.child("deviceToken").val());
        console.log("carNum : "+childSnapshot.child("carNum").val());
        //console.lof("user Id : "+snapshot.child(childSnapshot.key+"/userID").val());
        //val = db.ref("users/"+childSnapshot.key).val();
        //console.log("ref: "+ );
    });
    
    
  }, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
  });



function MsgData (_token,_title,_body){
    this._title = _title;
    this._body = _body;
    
    this.getData = function(){
        var push_data={
            to: _token,
        
            notification: {
              title: this._title,
              body: this._body,
              sound: "default",
              click_action: "FCM_PLUGIN_ACTIVITY",
              icon: "fcm_push_icon"
          },
          // 메시지 중요도
          priority: "high",
          // App 패키지 이름
          restricted_package_name: "com.example.chimchakae",
          // App에게 전달할 데이터
          data: {
              num1: 2000,
              num2: 3000
          }
        };
    return push_data;
    }
}


var fcm = new FCM(serverKey);

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
function send_fcm(_carNum,_title,_body){
    var query = db.ref("users");
    query.once("value").then(function(snapshot){
        snapshot.forEach(function(childSnapshot){
            if(_carNum=="all"||_carNum==childSnapshot.child("carNum").val()){
                msgdata = new MsgData (childSnapshot.child("deviceToken").val(),_title,_body);
            fcm.send(msgdata.getData(), function(err, response) {
                if (err) {
                    //console.log(client_token);
                    console.error('Push메시지 발송에 실패했습니다.');
                    console.error(err);
                    return;
                }
            
                console.log('Push메시지가 발송되었습니다.');
                console.log(response);
            });
            }
        });
    });
   
    console.log(_title);
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
                var msgdata="";
                if(parsed_msg[1]==1){//수위 높을때
                    send_fcm("all","수위높음","수위가 높습니다.");
                }
                else{//수위 낮을때
                    send_fcm("all","수위낮음","안전한 지역입니다.");
                }
                //console.log(msgdata);
            }
            else if (parsed_msg[0]=="car_num"){
                car_num = parsed_msg[1];
                console.log("차번호 : "+car_num);
                send_fcm(car_num,"차연결","차연결성공");
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
