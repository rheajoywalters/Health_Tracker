import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

const config = {
  apiKey: "AIzaSyAfTipjF-RP0bEC-Q_Bm6OBZmp8CSERV54",
  authDomain: "health-tracker-db037.firebaseapp.com",
  databaseURL: "https://health-tracker-db037.firebaseio.com",
  projectId: "health-tracker-db037",
  storageBucket: "health-tracker-db037.appspot.com",
  messagingSenderId: "230863849227",
  appId: "1:230863849227:web:f185af34f5b99487fe840e"
};

firebase.initializeApp(config);

export const auth = firebase.auth();

export const db = firebase.firestore();
