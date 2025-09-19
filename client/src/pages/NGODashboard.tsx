import React, { useEffect, useMemo, useState } from "react";
import { db } from "../firebase";
import { addDoc, collection, getDocs, serverTimestamp } from "firebase/firestore";

interface CaseRecord {
  district: string;
  severity: string;
  disease_name: string;
  admission_date: string;
}

interface CampRecord {
  id: string;
  name: string;
  district: string;
  location?: string;
  date?: string;
  attendees?: number | string;
  created_by?: string;
}

const NGODashboard: React.FC = () => {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [camp, setCamp] = useState({ name: "", district: "", location: "", date: "", attendees: "" });
  const [scan, setScan] = useState({ health_id: "", note: "" });
  const [camps, setCamps] = useState<CampRecord[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/diseases");
        const data = await res.json();
        setCases(Array.isArray(data) ? data : []);
      } catch (_) {
        setCases([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const loadCamps = async () => {
      try {
        const snap = await getDocs(collection(db, "camps"));
        const items: CampRecord[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        setCamps(items);
      } catch (_) {}
    };
    loadCamps();
  }, []);

  const byDistrict = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of cases) map[c.district] = (map[c.district] || 0) + 1;
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [cases]);

  const severeAreas = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of cases) if ((c.severity || '').toLowerCase() === 'severe') map[c.district] = (map[c.district] || 0) + 1;
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [cases]);

  const addScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scan.health_id) return;
    await addDoc(collection(db, "ngo_scans"), { ...scan, createdAt: serverTimestamp() });
    setScan({ health_id: "", note: "" });
    alert("Scan saved");
  };

  const addCamp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!camp.name || !camp.district) return;
    await addDoc(collection(db, "camps"), { ...camp, attendees: Number(camp.attendees) || 0, created_by: "NGO", createdAt: serverTimestamp() });
    setCamp({ name: "", district: "", location: "", date: "", attendees: "" });
    alert("Camp added");
  };

  const ngoCamps = camps.filter(c => (c.created_by || '').toUpperCase() === 'NGO');
  const govCamps = camps.filter(c => (c.created_by || '').toUpperCase() === 'GOV' || (c.created_by || '').toUpperCase() === 'GOVERNMENT');

  return (
    <div className="dashboard-container">
      <h2>NGO Dashboard</h2>

      <div className="dashboard-sections">
        <section className="dashboard-section">
          <h3>Affected Areas (by District)</h3>
          {loading ? <p>Loading...</p> : (
            <table className="records-table">
              <thead>
                <tr><th>District</th><th>Cases</th></tr>
              </thead>
              <tbody>
                {byDistrict.map(([d, n]) => (
                  <tr key={d}><td>{d}</td><td>{n}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="dashboard-section">
          <h3>Density Mapping (Counts)</h3>
          <p>Total Cases: <strong>{cases.length}</strong></p>
          <p>Districts Affected: <strong>{byDistrict.length}</strong></p>
        </section>

        <section className="dashboard-section">
          <h3>Severely Affected Areas</h3>
          <table className="records-table">
            <thead>
              <tr><th>District</th><th>Severe Cases</th></tr>
            </thead>
            <tbody>
              {severeAreas.map(([d, n]) => (
                <tr key={d} className="severe-row"><td>{d}</td><td>{n}</td></tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="dashboard-section">
          <h3>Add Camp</h3>
          <form onSubmit={addCamp} style={{ display:'grid', gap: 10 }}>
            <input placeholder="Camp Name" value={camp.name} onChange={e => setCamp({ ...camp, name: e.target.value })} />
            <input placeholder="District" value={camp.district} onChange={e => setCamp({ ...camp, district: e.target.value })} />
            <input placeholder="Location" value={camp.location} onChange={e => setCamp({ ...camp, location: e.target.value })} />
            <input type="date" value={camp.date} onChange={e => setCamp({ ...camp, date: e.target.value })} />
            <input type="number" placeholder="Attendees" value={camp.attendees} onChange={e => setCamp({ ...camp, attendees: e.target.value })} />
            <button type="submit">Add Camp</button>
          </form>
          <div style={{ marginTop: 10 }}>
            <a className="cta-link" href="/patient-entry/${patient_id}">Open Scanner</a>
          </div>
        </section>

        <section className="dashboard-section">
          <h3>NGO Camps</h3>
          {ngoCamps.length === 0 ? <p>No NGO camps yet.</p> : (
            <table className="records-table">
              <thead><tr><th>Name</th><th>District</th><th>Location</th><th>Date</th><th>Attendees</th></tr></thead>
              <tbody>
                {ngoCamps.map(c => (
                  <tr key={c.id}><td>{c.name}</td><td>{c.district}</td><td>{c.location || '-'}</td><td>{c.date || '-'}</td><td>{String(c.attendees || '-') }</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="dashboard-section">
          <h3>Government Camps</h3>
          {govCamps.length === 0 ? <p>No Government camps yet.</p> : (
            <table className="records-table">
              <thead><tr><th>Name</th><th>District</th><th>Location</th><th>Date</th><th>Attendees</th></tr></thead>
              <tbody>
                {govCamps.map(c => (
                  <tr key={c.id}><td>{c.name}</td><td>{c.district}</td><td>{c.location || '-'}</td><td>{c.date || '-'}</td><td>{String(c.attendees || '-') }</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
};

export default NGODashboard;
