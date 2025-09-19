import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import "./Register.css";

const GovernmentLogin: React.FC = () => {
  const [identifier, setIdentifier] = useState(""); // email or phone
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "governments"));
      let ok: any = null;
      snap.forEach(d => {
        const v = d.data();
        if ((v.email === identifier || v.phone === identifier) && v.password === password) ok = v;
      });
      if (!ok) {
        setError("Invalid credentials");
        setLoading(false);
        return;
      }
      sessionStorage.setItem("gov_id", ok.email || ok.phone);
      sessionStorage.setItem("gov_name", ok.dept_name || "Government");
      nav("/government-dashboard");
    } catch (e: any) {
      setError(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h2>Government Login</h2>
      <form onSubmit={submit}>
        <input placeholder="Email or Phone" value={identifier} onChange={e => setIdentifier(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};

export default GovernmentLogin;
