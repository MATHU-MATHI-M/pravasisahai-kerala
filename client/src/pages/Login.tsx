import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scanner } from '@yudiel/react-qr-scanner';
import type { IDetectedBarcode } from '@yudiel/react-qr-scanner';
import { apiLogin, saveSession } from '../api';
import { Link } from 'react-router-dom';
import './Login.css'
const Login: React.FC = () => {
  const nav = useNavigate();
  const [form, setForm] = useState({
    aadhaar_number: '',
    kms_id: '',
    phone: '',
    health_id: '',
    dob: ''
  });
  const [scanOpen, setScanOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [healthId, setHealthId] = useState<string | null>(null);
  const [lastScan, setLastScan] = useState(0);

  const normalize = (str: string) => str.trim().toUpperCase();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Decide which dashboard route to go to
  const getDashboardRoute = (health_id: string) => {
    // Example logic: redirect based on first character or number
    if (health_id.startsWith('HID1')) return '/dashboard/admin';
    if (health_id.startsWith('HID2')) return '/dashboard/user';
    return '/dashboard/general';
  };

  const submit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      aadhaar_number: normalize(form.aadhaar_number),
      kms_id: normalize(form.kms_id),
      phone: normalize(form.phone),
      health_id: normalize(form.health_id),
      dob: form.dob
    };

    try {
      const data = await apiLogin(payload);
      saveSession(data.token, data.health_id);
      setHealthId(data.health_id);

      // Redirect based on health_id
      const route = getDashboardRoute(data.health_id);
      nav(route);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = useCallback(async (codes: IDetectedBarcode[]) => {
    if (!codes.length || loading) return;

    const now = Date.now();
    if (now - lastScan < 1000) return; // skip multiple scans
    setLastScan(now);

    const scannedHealthId = normalize(codes[0].rawValue);
    setScanOpen(false);
    setLoading(true);
    setError(null);

    try {
      const data = await apiLogin({ health_id: scannedHealthId });
      saveSession(data.token, data.health_id);
      setHealthId(data.health_id);

      // Redirect based on health_id
      const route = getDashboardRoute(data.health_id);
      nav(route);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [loading, nav, lastScan]);

  const handleError = (error: unknown) => {
    console.error('QR Error:', error instanceof Error ? error.message : error);
  };

  return (
    <div className='login-container'>
      <h3>Login</h3>
      <p>Login using Aadhaar+Phone, KMS+Phone, HealthID+Phone, or scan your QR code.</p>

      <form onSubmit={submit} className="login-form-grid">
        <input name="aadhaar_number" placeholder="Aadhaar" value={form.aadhaar_number} onChange={onChange} />
        <input name="kms_id" placeholder="KMS ID" value={form.kms_id} onChange={onChange} />
        <input name="health_id" placeholder="Health ID" value={form.health_id} onChange={onChange} />
        <input name="phone" placeholder="Mobile" value={form.phone} onChange={onChange} />
        <label>Date of Birth (optional)</label>
        <input type="date" name="dob" value={form.dob} onChange={onChange} />
        <button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
      </form>

      <div className="scanner-wrap">
        <button className="scanner-toggle" onClick={() => setScanOpen(prev => !prev)}>
          {scanOpen ? 'Close QR Scanner' : 'Open QR Scanner'}
        </button>
        {scanOpen && (
          <div className="scanner-box">
            <Scanner
              onScan={handleScan}
              onError={handleError}
              styles={{ container: { width: '100%' }, video: { width: '100%' } }}
            />
            <p className="scanner-hint">Point your camera at the QR to auto-fill Health ID.</p>
          </div>
        )}
      </div>
      <p style={{ marginTop: '10px', textAlign: 'center' }}>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>

      {error && <p style={{ color: 'red', marginTop: '12px' }}>{error}</p>}
      {healthId && <p>Health ID: <strong>{healthId}</strong></p>}
    </div>
  );
};

export default Login;