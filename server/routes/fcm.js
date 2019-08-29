var client_token="c22xzlG7Gf4:APA91bGICoKporconuZGb2oJCQiImL50IrpxH7eoeKLmQWAgPQxZYIsnarQQTAW25SX5Rnysm19oZzQuJrkqJ8GW38Z_N-E07Kg2u30j65WNXnGeWMYs_rOZbbnQMmP2XRGvsn7yFkso";

function print_push_data1(){
    var push_data1={
        to: client_token,
    
        notification: {
          title: "수위높음",
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
    return push_data1;
}

function print_push_data2(){
    var push_data2={
        to: client_token,
    
        notification: {
          title: "수위낮음",
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
    return push_data2;
}


module.exports.push_data1 = print_push_data1;

module.exports.push_data2 = print_push_data2;