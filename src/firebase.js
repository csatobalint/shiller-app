import * as firebase from "firebase";
import "firebase/database";

const config = {
    apiKey: "AIzaSyDtVBjk1uECnGEjnvBE_vIpJDvgrkSpqN4",
    authDomain: "cacstestapp.firebaseapp.com",
    databaseURL: "https://cacstestapp-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "cacstestapp",
    storageBucket: "cacstestapp.appspot.com",
    messagingSenderId: "491883331961",
    appId: "1:491883331961:web:9699d64a75deb8e3ed6fa8",
    measurementId: "G-YWG3452C85"
  };

firebase.initializeApp(config);

export default firebase.database();