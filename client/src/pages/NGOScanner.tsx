import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Scanner } from "@yudiel/react-qr-scanner";
import type { IDetectedBarcode } from "@yudiel/react-qr-scanner";
import { db } from "../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import "./Login.css";

const NGOScanner: React.FC = () => {
  const nav = useNavigate();
  const [healthId, setHealthId] = useState("");
  const [note, setNote] = useState("");
  const [scanOpen, setScanOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [lastScan, setLastScan] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!healthId) return;
    setLoading(true);
    setError(null);
    try {
      await addDoc(collection(db, "ngo_scans"), { health_id: healthId.trim().toUpperCase(), note, createdAt: serverTimestamp() });
      nav("/ngo-dashboard");
    } catch (e: any) {
      setError(e.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const onScan = useCallback(async (codes: IDetectedBarcode[]) => {
    if (!codes.length || loading) return;
    const now = Date.now();
    if (now - lastScan < 1000) return;
    setLastScan(now);
    setHealthId(String(codes[0].rawValue || "").toUpperCase());
    setScanOpen(false);
  }, [loading, lastScan]);

  const onError = (err: unknown) => {
    console.warn("QR error", err);
  };

  return (
    <div className="login-container">
      <h3>NGO Scanner</h3>
      <div className="scanner-wrap">
        <button className="scanner-toggle" onClick={() => setScanOpen(s => !s)}>{scanOpen ? "Close Scanner" : "Open Scanner"}</button>
        {scanOpen && (
          <div className="scanner-box">
            <Scanner onScan={onScan} onError={onError} styles={{ container: { width: '100%' }, video: { width: '100%' } }} />
            <p className="scanner-hint">Point your camera at the QR to fill Health ID.</p>
          </div>
        )}
      </div>
      <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
        <input placeholder="Health ID" value={healthId} onChange={e => setHealthId(e.target.value.toUpperCase())} />
        <input placeholder="Note (optional)" value={note} onChange={e => setNote(e.target.value)} />
        <button onClick={save} disabled={loading || !healthId}>{loading ? "Saving..." : "Save & Return"}</button>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
};

export default NGOScanner;
