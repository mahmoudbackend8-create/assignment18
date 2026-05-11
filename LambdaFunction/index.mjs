import { MongoClient, ObjectId } from "mongodb";
async function DBConnection() {
  try {
    const client = new MongoClient("mongodb://localhost:27017");
    await client.connect();
    console.log("DB CONNECTED SUCCESSFULLY");
    return client;
  } catch (error) {
    console.log("DB CONNECTED fAILED");
  }
}
export const handler = async (event) => {
  try {
    const client = await DBConnection();
    const dbName = client.db("Social_Online");

    const UserCollection = dbName.collection("users");
    for (const Record of event.Records) {
      const Key = decodeURIComponent(Record.s3.object.Key); //remove spaces from url --%20
      console.log({ Key });
      //  Key  - social/User/69f8f5c4dc60adb0108aa884/ProfilePics/ab2f1189-dd43-4665-b08b-57ef13715de1_non.png
      const UserId = Key.split("/")[2];
      console.log(UserId);

      const result = await UserCollection.updateOne(
        { _id: ObjectId.createFromHexString(UserId) }, // trsnsfere string to objectId
        { $set: { ProfilePic: Key } },
      );
      console.log(result);
    }
  } catch (error) {
    console.log(error);
  }
};

//for test
/*
handler({
  Records: [
    {
      s3: {
        object: {
          Key: "social/User/69f8f5c4dc60adb0108aa884/ProfilePics/738a4d18-39db-4429-a0b2-ad8d9f0a8d54_non.png",
        },
      },
    },
  ],
});
*/

/*
{
Records:[
  {
s3:{
object:{key}
    }
    }
      ]
}

*/

//firbase FR config
/*
const firebaseConfig = {
  apiKey: "AIzaSyAGgFOik4Ym5r0hZuV2zIG60y0J0E26PKo",
  authDomain: "social-53e4d.firebaseapp.com",
  projectId: "social-53e4d",
  storageBucket: "social-53e4d.firebasestorage.app",
  messagingSenderId: "899508978885",
  appId: "1:899508978885:web:65f798162b475c99f39cac",
  measurementId: "G-TJXTLG8901"
}; */

//key - BHLJV-lLIV8kNtof1Lac26OIj5esR8adsHAf-0t-oc0KSIW8SQlLhOFSVs_XPJtGZtQxaDGmzTSOAui-hTnoLZI

//BE config firebase
/*

var admin = require("firebase-admin");

var serviceAccount = require("path/to/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
*/
