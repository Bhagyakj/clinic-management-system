import React from 'react';
import { useApp } from '../AppContext.jsx';
import { APPTS } from '../data.js';
import { NameLink, Badge } from './Shared.jsx';

export default function Appointments() {
  const { showToast, navigate } = useApp();
  const rows = [...APPTS, { time: '11:30 AM', patient: 'Anita Sharma', patientId: 'P-001', doctor: 'Dr. Mehta', status: 'completed' }];
  return (
    <>
      <div className="page-head">
        <div><h1>Appointments</h1><div className="desc">All doctors • All statuses</div></div>
        <button className="btn btn-accent" onClick={() => showToast('Opens booking form')}>+ Book appointment</button>
      </div>
      <div className="card">
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <select style={{ padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 8, fontSize: 13 }}><option>All doctors</option></select>
          <select style={{ padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 8, fontSize: 13 }}><option>All statuses</option></select>
        </div>
        <table>
          <tbody>
            <tr><th>Time</th><th>Patient</th><th>Doctor</th><th>Status</th><th>Actions</th></tr>
            {rows.map((a, i) => (
              <tr key={i}>
                <td>{a.time}</td>
                <td><NameLink id={a.patientId}>{a.patient}</NameLink></td>
                <td>{a.doctor}</td>
                <td><Badge status={a.status} /></td>
                <td><button className="btn btn-sm" onClick={() => navigate('consultation')}>View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
