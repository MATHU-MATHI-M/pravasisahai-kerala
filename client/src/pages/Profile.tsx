// src/pages/Profile.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import QRCode from "react-qr-code";

interface Migrant {
  name: string;
  aadhaar_number: string;
  phone: string;
  dob: string;
  employer: string;
  health_id: string;
}

const Profile: React.FC = () => {
  const { health_id } = useParams<{ health_id: string }>();
  const [user, setUser] = useState<Migrant | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const snapshot = await getDocs(collection(db, "migrants"));
      const users = snapshot.docs.map(doc => doc.data() as Migrant);
      const found = users.find(u => u.health_id === health_id);
      setUser(found || null);
    };
    fetchUser();
  }, [health_id]);

  return user ? (
    <div>
      <h2>{user.name}'s Profile</h2>
      <p>Aadhaar: {user.aadhaar_number}</p>
      <p>Phone: {user.phone}</p>
      <p>DOB: {user.dob}</p>
      <p>Employer: {user.employer}</p>
      <QRCode value={user.health_id} />
    </div>
  ) : (
    <p>Loading...</p>
  );
};

export default Profile;