import React from 'react';
import { useApp } from '../AppContext.jsx';
import { patientPayStatus } from '../data.js';
import { NameLink, PayBadge } from './Shared.jsx';

export default function Admissions() {
  const { patients, bills, navigate, openPatient } = useApp();
  const admitted = patients.filter((p) => p.admitted);

  return (
    <>
      <div className="page-head">
        <div><h1>Admissions</h1><div className="desc">{admitted.length} patient(s) currently admitted</div></div>
        <button className="btn btn-accent" onClick={() => navigate('billing')}>+ New admission</button>
      </div>
      <div className="card">
        <h3>Currently admitted</h3>
        {admitted.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 30, color: 'var(--muted)', fontSize: 13 }}>No patients are currently admitted.</div>
        ) : (
          <table>
            <tbody>
              <tr><th>Patient</th><th>Room</th><th>Admission days</th><th>Payment</th><th></th></tr>
              {admitted.map((p) => (
                <tr key={p.id}>
                  <td><NameLink id={p.id}>{p.name}</NameLink></td>
                  <td>{p.room || '—'}</td>
                  <td>{p.admissionDays != null ? `${p.admissionDays} day(s)` : '—'}</td>
                  <td><PayBadge status={patientPayStatus(bills, p.id)} /></td>
                  <td><button className="btn btn-sm" onClick={() => openPatient(p.id)}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
