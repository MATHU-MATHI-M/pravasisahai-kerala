import React, { useEffect, useMemo, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

interface EmployeeRow {
  health_id: string;
  latest_severity?: string;
  latest_disease?: string;
  last_checkup?: string;
  next_checkup?: string;
}

interface NotificationItem {
  id: string;
  title?: string;
  message?: string;
  createdAt?: string;
}

const EmployerDashboard: React.FC = () => {
  const employerId = sessionStorage.getItem("employer_id") || "";
  const employerName = sessionStorage.getItem("employer_name") || "";

  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [newHealthId, setNewHealthId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const loadNotifs = async () => {
      try {
        const snap = await getDocs(collection(db, "notifications"));
        const items: NotificationItem[] = snap.docs
          .map(d => ({ id: d.id, ...(d.data() as any) }))
          .filter(n => (n as any).employer_id === employerId)
          .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
          .slice(0, 10);
        setNotifications(items);
      } catch (_) {
        setNotifications([]);
      }
    };
    if (employerId) loadNotifs();
  }, [employerId]);

  useEffect(() => {
    const run = async () => {
      if (!employerId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:3001/api/employer/${encodeURIComponent(employerId)}/employees`);
        const list = await res.json();
        const rows: EmployeeRow[] = (list || []).map((e: any) => ({ health_id: e.health_id }));
        setEmployees(rows);
      } catch (e) {
        setError("Failed to load employees");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [employerId]);

  useEffect(() => {
    const fetchStatuses = async () => {
      const updated = await Promise.all(employees.map(async (e) => {
        try {
          const res = await fetch(`http://localhost:3001/api/diseases/${e.health_id}`);
          const cases = await res.json();
          if (Array.isArray(cases) && cases.length) {
            cases.sort((a: any, b: any) => new Date(b.admission_date).getTime() - new Date(a.admission_date).getTime());
            const latest = cases[0];
            const sev = latest.severity || "";
            const disease = latest.disease_name || "";
            const last = new Date(latest.admission_date);
            const next = new Date(latest.admission_date);
            if (sev === "Severe") next.setDate(next.getDate() + 1);
            else if (sev === "Moderate") next.setDate(next.getDate() + 3);
            else next.setDate(next.getDate() + 7);
            return {
              ...e,
              latest_severity: sev,
              latest_disease: disease,
              last_checkup: last.toISOString().split("T")[0],
              next_checkup: next.toISOString().split("T")[0],
            };
          }
        } catch (_) {}
        return e;
      }));
      setEmployees(updated);
    };
    if (employees.length) fetchStatuses();
  }, [employees.length]);

  const addEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    const hid = newHealthId.trim().toUpperCase();
    if (!hid || !employerId) return;
    await fetch(`http://localhost:3001/api/employer/${encodeURIComponent(employerId)}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ health_id: hid })
    });
    setEmployees(prev => [...prev, { health_id: hid }]);
    setNewHealthId("");
  };

  const removeEmployee = async (hid: string) => {
    if (!employerId) return;
    await fetch(`http://localhost:3001/api/employer/${encodeURIComponent(employerId)}/employees/${encodeURIComponent(hid)}`, {
      method: 'DELETE'
    });
    setEmployees(prev => prev.filter(e => e.health_id !== hid));
  };

  if (!employerId) return <div className="register-container"><h2>Employer Dashboard</h2><p>Please login as an employer.</p></div>;
  if (loading) return <div className="register-container"><p>Loading...</p></div>;

  return (
    <div className="register-container" style={{ maxWidth: 1000 }}>
      <h2>Employer Dashboard</h2>
      <div style={{ marginBottom: 16 }}>
        <strong>Employer:</strong> {employerName || employerId}
      </div>

      {notifications.length > 0 && (
        <div className="dashboard-section" style={{ marginBottom: 16 }}>
          <h3>Notifications</h3>
          <ul>
            {notifications.map(n => (
              <li key={n.id}><strong>{n.title || 'Alert'}:</strong> {n.message}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={addEmployee} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input value={newHealthId} onChange={(e) => setNewHealthId(e.target.value)} placeholder="Add Employee Health ID" />
        <button type="submit">Add</button>
      </form>

      {error && <p className="error">{error}</p>}

      <div className="dashboard-section">
        <h3>Employees</h3>
        {employees.length === 0 ? (
          <p>No employees added yet.</p>
        ) : (
          <table className="records-table">
            <thead>
              <tr>
                <th>Health ID</th>
                <th>Latest Disease</th>
                <th>Severity</th>
                <th>Last Checkup</th>
                <th>Next Checkup</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((em) => (
                <tr key={em.health_id} className={em.latest_severity === 'Severe' ? 'severe-row' : ''}>
                  <td>{em.health_id}</td>
                  <td>{em.latest_disease || '-'}</td>
                  <td>{em.latest_severity || '-'}</td>
                  <td>{em.last_checkup || '-'}</td>
                  <td>{em.next_checkup || '-'}</td>
                  <td>
                    <button onClick={() => removeEmployee(em.health_id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default EmployerDashboard;
