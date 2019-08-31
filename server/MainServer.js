#!/usr/bin/env node
var WebSocketServer = require('websocket').server;
var http = require('http');
var admin = require("firebase-admin");
var FCM = require('fcm-node');
var async = require('async');
var serverKey = 'AAAA8HdkNFQ:APA91bFYeDtX4eo0UOkZpqX3xuj7j7figjBAOQGAT8HkgEvLFBjP2HKOYgCbI8GU1PxcKHHCi_8iU1N1SJyIiPFrO7K5hXLF6K716L3x9YsQ2YhtNI70eldNMtNI8CkF-4jQHIQcit62';
var serviceAccount = require("./chimchakae-1eb6bc4fce0a.json");
var drive_conn = new Map();
//var msg_data = require('./module/fcm');

var Client = [];
var Followers = new Set();
var ROS_conn = "";
var cam_conn = "";

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://chimchakae.firebaseio.com"
});

var db = admin.database();
var ref = db.ref("users");

var f_ref = db.ref("followers");//follow 추가시
f_ref.on("child_added", function (snapshot, prevChildKey) {
    var newPost = snapshot.val();
    f_ref.once("value").then(function (Dsnapshot) {
        Dsnapshot.forEach(function (childSnapshot) {
            console.log("추가된것" + childSnapshot.key);
            if (newPost.userID == childSnapshot.child("userID").val()) {
                if (snapshot.key != childSnapshot.key) {
                    var d_ref = db.ref("followers/" + childSnapshot.key);
                    d_ref.set(null);
                }
            }

        });
    });
    //console.log("carNum: " + newPost.carNum);
    //console.log("userID: " + newPost.userID);
});

ref.on("value", function (snapshot) {
    console.log("----------전체 회원----------");
    console.log("전체 회원수 : " + snapshot.numChildren());
    //console.log("snapshot key : "+snapshot.val());
    snapshot.forEach(function (childSnapshot) {
        console.log("key: " + childSnapshot.key);
        console.log("userID : " + childSnapshot.child("userId").val());
        console.log("deviceToken : " + childSnapshot.child("deviceToken").val());
        console.log("carNum : " + childSnapshot.child("carNum").val());
        //console.lof("user Id : "+snapshot.child(childSnapshot.key+"/userID").val());
        //val = db.ref("users/"+childSnapshot.key).val();
        //console.log("ref: "+ );
    });


}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});



function MsgData(_token, _title, _body, _click_action) {
    this._title = _title;
    this._body = _body;

    this.getData = function () {

        var push_data = {
            to: _token,

            notification: {
                title: this._title,
                body: this._body,
                sound: "default",
                click_action: _click_action,
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
function send_fcm(info, type, _title, _body, _click_action,_dir) {
    var query = db.ref(_dir);
    var msg_data = "";
    query.once("value").then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            console.log("타입 " + type);
            if (type == "userId") {
                //console.log("체크 userId "+childSnapshot.child("userId").val());
                console.log(info + "=====" + childSnapshot.child("userId").val())
                if (info == "all" || info == childSnapshot.child("userId").val()) {
                    console.log("userID 버전 전송");
                    msgdata = new MsgData(childSnapshot.child("deviceToken").val(), _title, _body, _click_action);
                }
            }
            else {
                console.log(info + "=====" + childSnapshot.child("carNum").val())
                console.log("체크 carNum" + childSnapshot.child("userId").val());
                if (info == "all" || info == childSnapshot.child("carNum").val()) {
                    console.log("carNum 버전 전송");
                    msgdata = new MsgData(childSnapshot.child("deviceToken").val(), _title, _body, _click_action);
                }
            }
            //console.log("체크 "+childSnapshot.child("userId").val());
            fcm.send(msgdata.getData(), function (err, response) {
                //console.log("체크");
                if (err) {
                    //console.log(client_token);
                    console.error('Push메시지 발송에 실패했습니다.');
                    console.error(err);
                    return;
                }

                console.log('Push메시지가 발송되었습니다.');
                console.log(response);
            });

        });
    });

    console.log(_title);
}
function check_firebase(userID, carNum) {
    return [userID, carNum];
}

function firebase_update(userID, carNum) {


    var followersRef = db.ref("followers").push();
    followersRef.set({
        userID: userID,
        carNum: carNum
    });

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
            var received_msg = message.utf8Data;
            console.log('Received Message: ' + received_msg + "address : " + connection.remoteAddress);
            var parsed_msg = received_msg.split(': ');
            console.log(parsed_msg);
            //console.log(parsed_msg[1]);
            if (parsed_msg[0] == "level_alert") {
                var msgdata = "";
                if (parsed_msg[1] == 1) {//수위 높을때

                    send_fcm("all", "carNum", "침수위험 경보", "알람을 눌러 대피가능 경로를 확인해주세요", ".AlertActivity","users");
                }
                else {//수위 낮을때
                    send_fcm("all", "carNum", "안전 알림", "현재지역은 침수위험으로부터 안전합니다.", ".AlertActivity","users");
                    // if (ROS_conn != "") {
                    //     //send_fcm("all", "carNum", "차연결", "차연결해제", ".AlertActivity","users");
                    //     ROS_conn.sendUTF("0");
                    //     console.log("메시지 전송 : 0");
                    // }
                }
                //console.log(msgdata);
            }
            else if (parsed_msg[0] == "car_num") {
                car_num = parsed_msg[1];
                console.log("차번호 : " + car_num);
                send_fcm(car_num, "carNum", "차연결", "차연결성공", ".AlertActivity","users");
                if (ROS_conn != "") {
                    ROS_conn.sendUTF("1");
                    console.log("메시지 전송 : 1");
                }

            }
            else if (parsed_msg[0] == "ros") {
                ROS_conn = connection;
                console.log("ros 서버 연결");
            }
            else if (parsed_msg[0] == "android") {
                //parsed_msg[1] : userID
                if (parsed_msg[3] == "F") {
                    console.log(parsed_msg[1] + " Follow 등록");

                    firebase_update(parsed_msg[1], parsed_msg[2]);

                }
                else if (parsed_msg[3] == "C") {
                    console.log(parsed_msg[1] + " Carrier 등록");
                }
            }
            else if (parsed_msg[0] == "carrier") {//cariier : carrier차번호 : follower차번호 
                drive_conn.set(parsed_msg[2], parsed_msg[1]);
                //카메라 서버에 전송요청보내고
                console.log(drive_conn);
                if (cam_conn != "") {
                    cam_conn.sendUTF("capture");
                    console.log("camera 에게 촬영 명령 내림");
                }
                //카메라에서 값 받아오기.
            }
            else if (parsed_msg[0] == "follower_num") {//카메라가 보내주는거
                if (drive_conn.has(parsed_msg[1])) {
                    console.log(parsed_msg[1]);
                    console.log(drive_conn.get(parsed_msg[1]));
                    send_fcm(parsed_msg[1], "carNum", "차량이 연결되었습니다.", drive_conn.get(parsed_msg[1]) + " 차량이 운행중입니다.", ".AlertActivity","users");
                    send_fcm(drive_conn.get(parsed_msg[1]), "carNum", "차량이 연결되었습니다.", parsed_msg[1] + " 차량을 운행중입니다.", ".AlertActivity","users");
                    if (ROS_conn != "") {
                        ROS_conn.sendUTF("1");
                        console.log("메시지 전송 : 1");
                    }
                }
                else {
                    //send_fcm(key,"carNum","연결에 실패하였습니다.", value+" 차량이 운행중입니다.");
                    send_fcm(drive_conn.get(parsed_msg[1]), "carNum", "연결에 실패하였습니다.", parsed_msg[2] + " 일치하지 않는 차번호 입니다.", ".AlertActivity","users");
                }

            }
            else if (parsed_msg[0] == "carrier_num") {
                cam_conn = connection;
                console.log("carrier car(camera) 연결");
            }
            else if (parsed_msg[0] == "carry"){
                send_fcm("all", "carNum", "운행종료", "안전구역에 차량이 도착했습니다.", ".AlertActivity","followers");
                ROS_conn.sendUTF("0");
                console.log("메시지 전송 : 0");
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
