// src/pages/Dashboard.tsx
import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { readSession } from "../api";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import "./Dashboard.css";

interface DiseaseCase {
  admission_date: string;
  disease_name: string;
  disease_category: string;
  outcome: string;
  severity: "Mild" | "Moderate" | "Severe";
  district?: string;
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

const Dashboard: React.FC = () => {
  const { health_id } = readSession();
  const [cases, setCases] = useState<DiseaseCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Global data for aggregates
  const [allCases, setAllCases] = useState<DiseaseCase[]>([]);
  const [camps, setCamps] = useState<CampRecord[]>([]);

  useEffect(() => {
    if (!health_id) return;
    setLoading(true);
    fetch(`http://localhost:3001/api/diseases/${health_id}`)
      .then(res => res.json())
      .then(data => {
        setCases(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch disease cases");
        setLoading(false);
      });
  }, [health_id]);

  // Load global aggregates (affected areas, disease types)
  useEffect(() => {
    const loadAll = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/diseases");
        const data = await res.json();
        setAllCases(Array.isArray(data) ? data : []);
      } catch (_) {
        setAllCases([]);
      }
    };
    const loadCamps = async () => {
      try {
        const snap = await getDocs(collection(db, "camps"));
        setCamps(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
      } catch (_) {}
    };
    loadAll();
    loadCamps();
  }, []);

  const getNextCheckup = (admission: string, severity: string) => {
    const date = new Date(admission);
    if (severity === "Severe") date.setDate(date.getDate() + 1);
    else if (severity === "Moderate") date.setDate(date.getDate() + 3);
    else date.setDate(date.getDate() + 7);
    return date.toISOString().split("T")[0];
  };

  const hasSevere = cases.some(c => c.severity === "Severe");

  const diseaseTypeCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of allCases) map[c.disease_category] = (map[c.disease_category] || 0) + 1;
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [allCases]);

  const affectedAreas = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of allCases) {
      const d = (c.district || "").trim();
      if (!d) continue;
      map[d] = (map[d] || 0) + 1;
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [allCases]);

  const severeAreas = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of allCases) if ((c.severity || "").toLowerCase() === "severe") {
      const d = (c.district || "").trim();
      if (!d) continue;
      map[d] = (map[d] || 0) + 1;
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [allCases]);

  const ngoCamps = camps.filter(c => (c.created_by || '').toUpperCase() === 'NGO');
  const govCamps = camps.filter(c => (c.created_by || '').toUpperCase() === 'GOV' || (c.created_by || '').toUpperCase() === 'GOVERNMENT');

  return (
    <div className="dashboard-container business-ui">
      <h2>Your Health Dashboard</h2>
      <p>Health ID: <strong>{health_id}</strong></p>
      {hasSevere && (
        <div className="alert-severe">⚠️ You have a severe case! Please check in with your doctor immediately.</div>
      )}
      {loading ? (
        <p>Loading health records...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <section className="dashboard-section">
          <h3>Your Disease Cases</h3>
          {cases.length === 0 ? (
            <p>No disease cases found.</p>
          ) : (
            <table className="records-table">
              <thead>
                <tr>
                  <th>Admission Date</th>
                  <th>Disease Name</th>
                  <th>Category</th>
                  <th>Severity</th>
                  <th>Outcome</th>
                  <th>Next Checkup</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c, idx) => (
                  <tr key={idx} className={c.severity === "Severe" ? "severe-row" : ""}>
                    <td>{new Date(c.admission_date).toLocaleDateString()}</td>
                    <td>{c.disease_name}</td>
                    <td>{c.disease_category}</td>
                    <td>{c.severity}</td>
                    <td>{c.outcome}</td>
                    <td>{getNextCheckup(c.admission_date, c.severity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      <section className="dashboard-section">
        <h3>Highly Affected Areas</h3>
        {affectedAreas.length === 0 ? <p>No data</p> : (
          <table className="records-table">
            <thead><tr><th>District</th><th>Cases</th></tr></thead>
            <tbody>
              {affectedAreas.map(([d, n]) => (
                <tr key={d}><td>{d}</td><td>{n}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="dashboard-section">
        <h3>Severely Affected Districts</h3>
        {severeAreas.length === 0 ? <p>No data</p> : (
          <table className="records-table">
            <thead><tr><th>District</th><th>Severe Cases</th></tr></thead>
            <tbody>
              {severeAreas.map(([d, n]) => (
                <tr key={d} className="severe-row"><td>{d}</td><td>{n}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="dashboard-section">
        <h3>Disease Types</h3>
        {diseaseTypeCounts.length === 0 ? <p>No data</p> : (
          <table className="records-table">
            <thead><tr><th>Type</th><th>Count</th></tr></thead>
            <tbody>
              {diseaseTypeCounts.map(([t, n]) => (
                <tr key={t}><td>{t}</td><td>{n}</td></tr>
              ))}
            </tbody>
          </table>
        )}
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

      <div style={{ marginTop: "16px" }}>
        <Link to={`/profile/${health_id}`}>View Profile</Link>
      </div>
    </div>
  );
};

export default Dashboard;
