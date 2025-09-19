// src/pages/GovDashboard.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";
import { db } from "../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import "./GovDashboard.css";

// Public GeoJSON (India states) → filter Kerala
const INDIA_TOPO_JSON =
  "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";

interface CaseRecord {
  district: string;
  severity: string;
  disease_name: string;
  admission_date: string;
}

const GovDashboard: React.FC = () => {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [camp, setCamp] = useState({ name: "", district: "", location: "", date: "", attendees: "" });

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

  const addCamp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!camp.name || !camp.district) return;
    await addDoc(collection(db, "camps"), { ...camp, attendees: Number(camp.attendees) || 0, created_by: "GOV", createdAt: serverTimestamp() });
    setCamp({ name: "", district: "", location: "", date: "", attendees: "" });
    alert("Camp added");
  };

  return (
    <div className="gov-dashboard">
      <h2>Kerala Government Health Dashboard</h2>

      {/* Density Map */}
      <section className="dashboard-card">
        <h3>Disease Density Map (Kerala)</h3>
        <ComposableMap projection="geoMercator" projectionConfig={{ scale: 1200, center: [76.5, 10] }} width={600} height={400}>
          <Geographies geography={INDIA_TOPO_JSON}>
            {({ geographies }) =>
              geographies
                .filter((geo) => geo.properties.name === "India")
                .map((geo, idx) => (
                  <Geography
                    key={idx}
                    geography={geo}
                    fill="#eee"
                    stroke="#333"
                  />
                ))
            }
          </Geographies>
          {/* Placeholder highlight */}
          <circle cx="520" cy="260" r={40} fill="rgba(231,76,60,0.6)" />
          <text x="500" y="240" fill="#333" fontSize={12}>
            Kerala - High Density
          </text>
        </ComposableMap>
        <div>
          <p>Total Cases: <strong>{cases.length}</strong> | Districts Affected: <strong>{byDistrict.length}</strong></p>
        </div>
      </section>

      {/* Severely Affected Districts */}
      <section className="dashboard-card">
        <h3>Severely Affected Districts</h3>
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

      {/* Add Camp */}
      <section className="dashboard-card">
        <h3>Add Camp</h3>
        <form onSubmit={addCamp} className="camp-form" style={{ display:'grid', gap: 10 }}>
          <input placeholder="Camp Name" value={camp.name} onChange={e => setCamp({ ...camp, name: e.target.value })} />
          <input placeholder="District" value={camp.district} onChange={e => setCamp({ ...camp, district: e.target.value })} />
          <input placeholder="Location" value={camp.location} onChange={e => setCamp({ ...camp, location: e.target.value })} />
          <input type="date" value={camp.date} onChange={e => setCamp({ ...camp, date: e.target.value })} />
          <input type="number" placeholder="Attendees" value={camp.attendees} onChange={e => setCamp({ ...camp, attendees: e.target.value })} />
          <button type="submit">Add Camp</button>
        </form>
        <div style={{ marginTop: 10 }}>
          <a className="cta-link" href="/government-scanner">Open Scanner</a>
        </div>
      </section>
    </div>
  );
};

export default GovDashboard;
