
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyCsBnjN3KALt-Qj7JWVQ-Hto3t2xnvonhE",
  authDomain: "users-bf926.firebaseapp.com",
  projectId: "users-bf926",
  storageBucket: "users-bf926.appspot.com",
  messagingSenderId: "725037030979",
  appId: "1:725037030979:web:ec8afbd540be36ac793ef6",
  measurementId: "G-W9MSLK9SVZ"
  };
  
  const firebaseApp = initializeApp(firebaseConfig);

  const db = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp)
  export { db, auth };