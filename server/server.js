var admin = require("firebase-admin");

var serviceAccount = require("./chimchakae-1eb6bc4fce0a.json");

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