import React, { useState, useEffect } from 'react';
import { auth, db } from '../services/Firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Navigate } from 'react-router-dom';
import "alertifyjs/build/css/alertify.min.css";
import { collection, getDocs } from 'firebase/firestore';

export default function Private({ children }) {
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState([]);
  const [signout, setSignout] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userData = {
          uid: user.uid,
          email: user.email,
          name: user.name
        }
  
        const storedData = JSON.parse(localStorage.getItem("detailUser"));

        if (storedData && storedData.name) {
          // nome já foi preenchido, mantem no localStorage
          userData.name = storedData.name;
        } else {
          // salva o nome no localStorage
          localStorage.setItem("detailUser", JSON.stringify(userData));
        }

        setLoading(false);
        setSignout(true);

        const adminRef = collection(db, 'admin');
        const adminSnapshot = await getDocs(adminRef);
        const adminData = [];
        adminSnapshot.forEach((doc) => {
          const adminItem = {
            id: doc.id,
            email: doc.data().email,
            name: doc.data().name
          };
          adminData.push(adminItem);
        });
        setAdminData(adminData);
      } else {
        setLoading(false);
        setSignout(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div></div>;
  }

  if (!signout) {
    return <Navigate to="/" />;
  }

  return children;
}
