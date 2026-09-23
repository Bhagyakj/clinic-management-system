import React, { useState } from 'react';
import { useApp } from '../AppContext.jsx';

const TABS = ['Vitals', 'Complaints', 'Observations', 'Diagnosis Notes'];

export default function Consultation() {
  const { role, navigate, saveConsultation } = useApp();
  const [tab, setTab] = useState('Vitals');
  const isSenior = role === 'sdoc';

  return (
    <>
      <div className="page-head">
        <div><h1>New consultation</h1><div className="desc">Patient: Anita Sharma &nbsp;•&nbsp; Age 34 &nbsp;•&nbsp; Type OP</div></div>
        <span className="badge waiting">In progress</span>
      </div>
      <div className="card">
        <div className="tabs">
          {TABS.map((t) => (
            <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>

        <div className="form-grid cols-3">
          <div className="field"><label>Temperature (°C)</label><input type="text" defaultValue="37.5" /></div>
          <div className="field"><label>BP (mmHg)</label><input type="text" defaultValue="120/80" /></div>
          <div className="field"><label>Pulse (bpm)</label><input type="text" defaultValue="76" /></div>
          <div className="field"><label>Respiration (per min)</label><input type="text" defaultValue="16" /></div>
          <div className="field"><label>Weight (kg)</label><input type="text" placeholder="e.g. 62" /></div>
          <div className="field"><label>Height (cm)</label><input type="text" placeholder="e.g. 160" /></div>
        </div>

        <div className="field full" style={{ marginTop: 6 }}>
          <label>Complaints</label>
          <textarea defaultValue="Mild fever since 2 days, occasional headache, low appetite." placeholder="Describe the patient's presenting complaints..." />
        </div>
        <div className="field full">
          <label>Observations</label>
          <textarea defaultValue="Throat mildly inflamed, no rashes, chest clear on auscultation." placeholder="Clinical observations on examination..." />
        </div>
        <div className="field full">
          <label>Diagnosis notes {!isSenior && <span style={{ color: 'var(--muted)', fontWeight: 500 }}>(visible to senior doctor)</span>}</label>
          <textarea placeholder="Diagnosis and treatment plan..." />
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
          <button className="btn" onClick={() => navigate('dashboard')}>Cancel</button>
          <button className="btn btn-accent" onClick={saveConsultation}>Save consultation</button>
        </div>
      </div>
    </>
  );
}
