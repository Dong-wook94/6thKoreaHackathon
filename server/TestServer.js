var admin = require("firebase-admin");
var FCM = require('fcm-node');
var serverKey = 'AAAA8HdkNFQ:APA91bFYeDtX4eo0UOkZpqX3xuj7j7figjBAOQGAT8HkgEvLFBjP2HKOYgCbI8GU1PxcKHHCi_8iU1N1SJyIiPFrO7K5hXLF6K716L3x9YsQ2YhtNI70eldNMtNI8CkF-4jQHIQcit62';

var serviceAccount = require("./chimchakae-1eb6bc4fce0a.json");
var client_token="c22xzlG7Gf4:APA91bGICoKporconuZGb2oJCQiImL50IrpxH7eoeKLmQWAgPQxZYIsnarQQTAW25SX5Rnysm19oZzQuJrkqJ8GW38Z_N-E07Kg2u30j65WNXnGeWMYs_rOZbbnQMmP2XRGvsn7yFkso";


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://chimchakae.firebaseio.com"
});

var db = admin.database();
var ref = db.ref("User/info")

// Attach an asynchronous callback to read the data at our posts reference
ref.on("value", function(snapshot) {
    console.log(snapshot.val());
  }, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
  });

  var push_data={
      to: client_token,

      notification: {
        title: "hong a",
        body: "Node로 발송하는 Push 메시지 입니다.",
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

  var fcm = new FCM(serverKey);
 
  fcm.send(push_data, function(err, response) {
      if (err) {
          console.log(client_token);
          console.error('Push메시지 발송에 실패했습니다.');
          console.error(err);
          return;
      }
   
      console.log('Push메시지가 발송되었습니다.');
      console.log(response);
  });


