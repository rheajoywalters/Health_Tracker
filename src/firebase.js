import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

const config = {
  apiKey: "AIzaSyDnT749pto7K9C5N6VvS0aTVvFMJq6QSzI",
  authDomain: "authentication-d0e33.firebaseapp.com",
  databaseURL: "https://authentication-d0e33.firebaseio.com",
  projectId: "authentication-d0e33",
  storageBucket: "",
  messagingSenderId: "310675757578",
  appId: "1:310675757578:web:9e17f766afbce2075bddf3"
};

firebase.initializeApp(config);

export const auth = firebase.auth();

export const db = firebase.firestore();
