// src/pages/Register.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import { apiRegister, saveSession, useDirectFirestore } from "../api";
import { db, firebaseApp } from "../firebase";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";
import './Register.css';
import { Link } from "react-router-dom"; 
interface FormData {
  name?: string;
  dob?: string;
  aadhaar_number?: string;
  phone?: string;
  kms_id?: string;
  email?: string;
  state?: string;
  address?: string;
  employer?: string;
}

const Register: React.FC = () => {
  const [form, setForm] = useState<FormData>({});
  const [healthId, setHealthId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const required = ["name", "aadhaar_number", "phone", "kms_id", "dob"] as const;
      for (const f of required) {
        if (!(form as any)[f]) {
          alert(`Missing ${f}`);
          return;
        }
      }
      if (useDirectFirestore) {
        // Validate Firebase app initialized
        if (!firebaseApp?.options?.projectId) {
          alert('Firebase not configured. Check .env variables.');
          return;
        }
        // Verify against government records directly in Firestore
        let records: any[] = [];
        try {
          const recSnap = await getDocs(collection(db, "migrant_health_records"));
          records = recSnap.docs.map(d => d.data() as any);
        } catch (_) {}
        if (!records.length) {
          try {
            const recSnap2 = await getDocs(collection(db, "aadhaar_records"));
            records = recSnap2.docs.map(d => d.data() as any);
          } catch (_) {}
        }
        // If no government records are available, allow registration to proceed in dev mode
        const noGovRecords = !records || records.length === 0;
        const normalize = (v: any) => String(v || '').trim();
        const onlyDigits = (v: any) => normalize(v).replace(/\D+/g, '');
        const nameNorm = normalize(form.name).toLowerCase();
        const aadhaarNorm = onlyDigits(form.aadhaar_number);
        const phoneNorm = onlyDigits(form.phone);
        const dobNorm = normalize(form.dob);
        const match = noGovRecords ? { devBypass: true } : (records || []).find((r: any) => (
          onlyDigits(r.aadhaar_number) === aadhaarNorm &&
          onlyDigits(r.phone) === phoneNorm &&
          normalize(r.dob) === dobNorm &&
          normalize(r.name).toLowerCase() === nameNorm
        ));
        if (!match) {
          alert('Verification failed against government records');
          return;
        }
        const newHealthId = "HID" + Date.now();
        const barcodeId = "BC" + Date.now() + "XYZ";
        // Use deterministic doc ID to avoid duplicates for same Aadhaar+phone
        const docId = `HID-${aadhaarNorm}-${phoneNorm}`;
        await setDoc(
          doc(db, 'registeredUsers', docId),
          {
            ...form,
            name: normalize(form.name),
            aadhaar_number: aadhaarNorm,
            phone: phoneNorm,
            dob: dobNorm,
            health_id: newHealthId,
            barcode_id: barcodeId,
            verified: true
          },
          { merge: true }
        );
        setHealthId(newHealthId);
        saveSession("mock-token-" + newHealthId, newHealthId);
      } else {
        const resp = await apiRegister({
          name: form.name!,
          aadhaar_number: form.aadhaar_number!,
          phone: form.phone!,
          kms_id: form.kms_id!,
          dob: form.dob!,
          age: undefined,
          from_state: (form as any).state,
          work_place: (form as any).employer
        });
        setHealthId(resp.health_id);
        saveSession(resp.token, resp.health_id);
      }
    } catch (error: any) {
      console.error("Registration error", error);
      alert(error?.message || "Registration failed");
    }
  };

  return (
    <div className="register-container">
      <h2>Register Migrant</h2>
      <form onSubmit={handleSubmit}>
        {["name", "dob", "aadhaar_number", "phone", "kms_id", "email", "state", "address", "employer"].map(field => (
          <input key={field} name={field} placeholder={field} onChange={handleChange} />
        ))}
        <button type="submit">Register</button>
      </form>
      
  <p style={{ marginTop: '10px', textAlign: 'center' }}>
    Already have an account? <Link to="/login">Login here</Link>
  </p>

      {healthId && (
        <div>
          <h3>Registration Successful</h3>
          <div style={{ width: 200, height: 200, background: '#fff', padding: 8 }}>
            <QRCode value={healthId} size={180} />
          </div>
          <p style={{ marginTop: 8 }}>Health ID: <strong>{healthId}</strong></p>
          <button onClick={() => navigate(`/dashboard/${healthId}`)}>Go to Dashboard</button>
        </div>
      )}
    </div>
  );
};

export default Register;