import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import "./Register.css";

const NGOLogin: React.FC = () => {
  const [identifier, setIdentifier] = useState(""); // phone or email
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "ngos"));
      let ok: any = null;
      snap.forEach(d => {
        const v = d.data();
        if ((v.phone === identifier || v.email === identifier) && v.password === password) ok = v;
      });
      if (!ok) {
        setError("Invalid credentials");
        setLoading(false);
        return;
      }
      sessionStorage.setItem("ngo_id", ok.phone);
      sessionStorage.setItem("ngo_name", ok.org_name || "NGO");
      nav("/government-dashboard"); // or a dedicated NGO dashboard when available
    } catch (e: any) {
      setError(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h2>NGO Login</h2>
      <form onSubmit={submit}>
        <input placeholder="Phone or Email" value={identifier} onChange={e => setIdentifier(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};

export default NGOLogin;
