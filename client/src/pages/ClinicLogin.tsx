// src/pages/ClinicLogin.tsx
import React, { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { Scanner } from "@yudiel/react-qr-scanner";
import type { IDetectedBarcode } from "@yudiel/react-qr-scanner";
import "./Register.css";

const ClinicLogin: React.FC = () => {
  const navigate = useNavigate();
  const [govtId, setGovtId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScan, setLastScan] = useState(0);
  const [scanOpen, setScanOpen] = useState(false);

  const handleLogin = async (e?: React.FormEvent, scannedId?: string) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    const idToCheck = scannedId || govtId;

    try {
      const snap = await getDocs(collection(db, "clinicsHospital"));
      const hospitals = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));

      const found = hospitals.find(
        h => h.hospital_id === idToCheck && h.password === password
      );

      if (!found) {
        setError("❌ Invalid Hospital ID or Password!");
        return;
      }

      alert("✅ Login successful!");
      navigate(`/clinic-dashboard/${found.hospital_id}`);
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed!");
    } finally {
      setLoading(false);
    }
  };

  const handleScan = useCallback((codes: IDetectedBarcode[]) => {
    if (!codes.length || loading) return;

    const now = Date.now();
    if (now - lastScan < 1000) return; // debounce multiple scans
    setLastScan(now);

    const scannedId = codes[0].rawValue;
    handleLogin(undefined, scannedId);
    setScanOpen(false);
  }, [loading, lastScan]);

  const handleError = (err: unknown) => {
    console.error("QR Scan Error:", err);
  };

  return (
    <div className="register-container">
      <h2>Clinic / Hospital Login</h2>
      <form onSubmit={handleLogin} className="register-form">
        <input
          placeholder="Hospital ID"
          value={govtId}
          onChange={e => setGovtId(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div style={{ marginTop: "16px" }}>
        <button onClick={() => setScanOpen(prev => !prev)}>
          {scanOpen ? "Close QR Scanner" : "Open QR Scanner"}
        </button>
        {scanOpen && (
          <div style={{ maxWidth: "360px", marginTop: "12px" }}>
            <Scanner
              onScan={handleScan}
              onError={handleError}
              styles={{ container: { width: "100%" }, video: { width: "100%" } }}
            />
            <p>Scanning... point camera at QR code.</p>
          </div>
        )}
      </div>

      <p style={{ marginTop: "10px", textAlign: "center" }}>
        Don't have an account? <Link to="/clinic-register">Register here</Link>
      </p>

      {error && <p style={{ color: "red", marginTop: "12px" }}>{error}</p>}
    </div>
  );
};

export default ClinicLogin;
