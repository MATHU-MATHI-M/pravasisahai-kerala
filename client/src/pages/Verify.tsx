import React, { useState } from 'react'
import { apiVerify } from '../api'
import { QRCodeCanvas } from 'qrcode.react'
import { useNavigate } from 'react-router-dom'

export default function Verify() {
  const nav = useNavigate()
  const [form, setForm] = useState({ aadhaar_number: '', phone: '', kms_id: '', barcode_id: '', health_id: '', dob: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = await apiVerify({ ...form })
      setResult(data)
      setTimeout(() => nav('/login'), 800)
    } catch (err: any) {
      setError(err.message || 'Verify failed')
    } finally { setLoading(false) }
  }

  return (
    <div>
      <h3>Verify</h3>
      <form onSubmit={submit} style={{ display: 'grid', gap: 8, maxWidth: 520 }}>
        <input name="aadhaar_number" placeholder="Aadhaar (12-digit)" onChange={onChange} />
        <input name="phone" placeholder="Mobile (10-digit)" onChange={onChange} />
        <input name="kms_id" placeholder="KMS ID" onChange={onChange} />
        <input name="barcode_id" placeholder="Barcode / QR content" onChange={onChange} />
        <input name="health_id" placeholder="Health ID" onChange={onChange} />
        <label>Date of Birth (optional)</label>
        <input type="date" name="dob" onChange={onChange} />
        <button type="submit" disabled={loading}>{loading ? 'Verifying...' : 'Verify'}</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {result && (
        <div style={{ marginTop: 16 }}>
          <p>Verified: <strong>{String(result.verified)}</strong></p>
          <p>Health ID: <strong>{result.health_id}</strong></p>
          <div style={{ background: '#fff', padding: 8, display: 'inline-block' }}>
            <QRCodeCanvas value={result.barcode_id} size={160} />
          </div>
        </div>
      )}
    </div>
  )
}