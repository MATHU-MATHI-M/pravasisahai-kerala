import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

const EmployerLogin: React.FC = () => {
  const [form, setForm] = useState({
    identifier: "", // aadhar, phone or email
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
      const res = await fetch("http://localhost:3001/api/employer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: form.identifier.trim(), password: form.password })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({} as any));
        throw new Error(data?.message || "Invalid credentials");
      }
      const data = await res.json();
      sessionStorage.setItem("employer_id", data.employer_id);
      sessionStorage.setItem("employer_name", data.name || "Employer");
      navigate("/employer-dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h2>Employer Login</h2>
      <form onSubmit={handleSubmit}>
        <input name="identifier" placeholder="Aadhar / Phone / Email" value={form.identifier} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <button type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
        {error && <p className="error">{error}</p>}
      </form>
      <p style={{ marginTop: 10 }}>
        New employer? <a href="/employer-register">Register here</a>
      </p>
    </div>
  );
};

export default EmployerLogin;
