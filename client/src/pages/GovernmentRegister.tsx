import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import "./Register.css";

const GovernmentRegister: React.FC = () => {
  const [form, setForm] = useState({
    dept_name: "",
    officer_name: "",
    email: "",
    phone: "",
    district: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const nav = useNavigate();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!form.dept_name || !form.email || !form.password) {
        setError("Please fill all required fields");
        setLoading(false);
        return;
      }
      await setDoc(doc(db, "governments", form.email), {
        ...form,
        createdAt: new Date().toISOString(),
      });
      alert("Government account created. Please login.");
      nav("/government-login");
    } catch (e: any) {
      setError(e.message || "Failed to register government account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h2>Government Register</h2>
      <form onSubmit={onSubmit}>
        <input name="dept_name" placeholder="Department Name" value={form.dept_name} onChange={onChange} required />
        <input name="officer_name" placeholder="Officer Name" value={form.officer_name} onChange={onChange} />
        <input name="email" placeholder="Email" value={form.email} onChange={onChange} required />
        <input name="phone" placeholder="Phone" value={form.phone} onChange={onChange} />
        <input name="district" placeholder="District" value={form.district} onChange={onChange} />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={onChange} required />
        <button type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};

export default GovernmentRegister;
