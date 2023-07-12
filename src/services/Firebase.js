
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyCHBBGMSJaipc0vLX9v-LBhG0ILeRjzdc0",

  authDomain: "provider-users.firebaseapp.com",

  projectId: "provider-users",

  storageBucket: "provider-users.appspot.com",

  messagingSenderId: "333640660530",

  appId: "1:333640660530:web:b89228e4530a70819a6e2b",

  measurementId: "G-0H4G5EZLXJ"

  };
  
  const firebaseApp = initializeApp(firebaseConfig);

  const db = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp)
  export { db, auth };