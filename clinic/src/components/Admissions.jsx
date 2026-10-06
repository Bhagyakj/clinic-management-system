import React, { useState } from 'react';
import { useApp } from '../AppContext.jsx';
import { patientPayStatus } from '../data.js';
import { NameLink, PayBadge } from './Shared.jsx';

const today = () => new Date().toISOString().slice(0, 10);

export default function Admissions() {
  const { patients, bills, admissions, dataLoading, navigate, openPatient, dischargePatient, showToast } = useApp();
  const admitted = patients.filter((p) => p.admitted);
  const [dischargingId, setDischargingId] = useState(null); // patient._id currently showing the discharge date picker
  const [toDate, setToDate] = useState(today());

  // The PatientRoom document for this patient that hasn't been discharged yet
  // — that record's _id is what POST /admissions/:id/discharge needs.
  const findOpenAdmission = (patientId) => admissions.find((a) => {
    const pid = typeof a.patientId === 'object' ? a.patientId?._id : a.patientId;
    return pid === patientId && !a.toDate;
  });

  const confirmDischarge = async (patient) => {
    const admission = findOpenAdmission(patient._id);
    if (!admission) { showToast("Couldn't find this patient's admission record — try reloading."); return; }
    await dischargePatient(admission._id, { toDate, patientIdCustom: patient.id });
    setDischargingId(null);
  };

  return (
    <>
      <div className="page-head">
        <div><h1>Admissions</h1><div className="desc">{admitted.length} patient(s) currently admitted</div></div>
        <button className="btn btn-accent" onClick={() => navigate('billing')}>+ New admission</button>
      </div>
      <div className="card">
        <h3>Currently admitted</h3>
        {dataLoading && admissions.length === 0 ? (
          <div className="popup-empty">Loading…</div>
        ) : admitted.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 30, color: 'var(--muted)', fontSize: 13 }}>No patients are currently admitted.</div>
        ) : (
          <table>
            <tbody>
              <tr><th>Patient</th><th>Room</th><th>Payment</th><th></th></tr>
              {admitted.map((p) => (
                <tr key={p._id}>
                  <td><NameLink id={p._id}>{p.name}</NameLink></td>
                  <td>{p.room || '—'}</td>
                  <td><PayBadge status={patientPayStatus(bills, p._id)} /></td>
                  <td style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                    <button className="btn btn-sm" onClick={() => openPatient(p._id)}>View</button>
                    {dischargingId === p._id ? (
                      <>
                        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={{ padding: '5px 8px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 12.5 }} />
                        <button className="btn btn-sm btn-accent" onClick={() => confirmDischarge(p)}>Confirm discharge</button>
                        <button className="btn btn-sm" onClick={() => setDischargingId(null)}>Cancel</button>
                      </>
                    ) : (
                      <button className="btn btn-sm" onClick={() => { setDischargingId(p._id); setToDate(today()); }}>Discharge</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
