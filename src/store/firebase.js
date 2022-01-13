import store from '.'
import firebase from "firebase/app"
import 'firebase/firestore'

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

firebase.auth().onAuthStateChanged(user => {
    if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        store.dispatch("auth/fetchUser", user);
        // ...
      } else {
        // User is signed out
        // ...
      }
});


export const db = firebase.firestore();

const { Timestamp, GeoPoint } = firebase.firestore
export { Timestamp, GeoPoint }

console.log('firebase.js')