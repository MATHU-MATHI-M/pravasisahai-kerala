import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, setDoc, doc, getDocs, query, where } from "firebase/firestore";
import "./Register.css";

const EmployerRegister: React.FC = () => {
  const [form, setForm] = useState({
    name: "",
    aadhar_number: "",
    phone: "",
    workplace: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Check if employer already exists (by aadhar or phone)
      const q = query(
        collection(db, "employers"),
        where("$or", "array-contains-any", [form.aadhar_number, form.phone])
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setError("Employer with this Aadhar or Phone already exists.");
        setLoading(false);
        return;
      }
      // Use aadhar_number as doc ID for uniqueness
      await setDoc(doc(db, "employers", form.aadhar_number), {
        ...form,
        createdAt: new Date().toISOString(),
      });
      alert("Registration successful! Please login.");
      navigate("/employer-login");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h2>Employer Registration</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <input name="aadhar_number" placeholder="Aadhar Number" value={form.aadhar_number} onChange={handleChange} required />
        <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} required />
        <input name="workplace" placeholder="Workplace/Company" value={form.workplace} onChange={handleChange} required />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <button type="submit" disabled={loading}>{loading ? "Registering..." : "Register"}</button>
        {error && <p className="error">{error}</p>}
      </form>
      <p style={{ marginTop: 10 }}>
        Already registered? <a href="/employer-login">Login here</a>
      </p>
    </div>
  );
};

export default EmployerRegister;
