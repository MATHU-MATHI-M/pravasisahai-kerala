import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import "./Register.css";

const NGORegister: React.FC = () => {
  const [form, setForm] = useState({
    org_name: "",
    contact_person: "",
    phone: "",
    email: "",
    district: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const nav = useNavigate();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!form.org_name || !form.phone || !form.password) {
        setError("Please fill all required fields");
        setLoading(false);
        return;
      }
      await setDoc(doc(db, "ngos", form.phone), {
        ...form,
        createdAt: new Date().toISOString(),
      });
      alert("NGO registered. Please login.");
      nav("/ngo-login");
    } catch (e: any) {
      setError(e.message || "Failed to register NGO");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h2>NGO Register</h2>
      <form onSubmit={onSubmit}>
        <input name="org_name" placeholder="Organization Name" value={form.org_name} onChange={onChange} required />
        <input name="contact_person" placeholder="Contact Person" value={form.contact_person} onChange={onChange} />
        <input name="phone" placeholder="Phone" value={form.phone} onChange={onChange} required />
        <input name="email" placeholder="Email" value={form.email} onChange={onChange} />
        <input name="district" placeholder="District" value={form.district} onChange={onChange} />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={onChange} required />
        <button type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};

export default NGORegister;
