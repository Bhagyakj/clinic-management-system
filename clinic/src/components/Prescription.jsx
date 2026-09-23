import React, { useState } from 'react';
import { useApp } from '../AppContext.jsx';

export default function Prescription() {
  const { navigate, savePrescription } = useApp();
  const [meds, setMeds] = useState([
    { name: 'Paracetamol', dosage: '1-0-1' },
    { name: 'Amoxicillin', dosage: '1-1-1' },
  ]);

  const addRow = () => setMeds((m) => [...m, { name: '', dosage: '' }]);
  const updateRow = (i, field, val) => setMeds((m) => m.map((row, idx) => (idx === i ? { ...row, [field]: val } : row)));

  return (
    <>
      <div className="page-head">
        <div><h1>Add prescription</h1><div className="desc">Patient: Rajesh Kumar &nbsp;•&nbsp; Age 45 &nbsp;•&nbsp; Type OP</div></div>
      </div>
      <div className="grid-2">
        <div className="card">
          <h3>Medicines</h3>
          {meds.map((row, i) => (
            <div className="form-grid" style={{ marginBottom: 8 }} key={i}>
              <div className="field" style={{ marginBottom: 0 }}>
                <input type="text" value={row.name} placeholder="Medicine name" onChange={(e) => updateRow(i, 'name', e.target.value)} />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <input type="text" value={row.dosage} placeholder="Dosage e.g. 1-0-1" onChange={(e) => updateRow(i, 'dosage', e.target.value)} />
              </div>
            </div>
          ))}
          <button className="btn btn-sm" style={{ marginTop: 6 }} onClick={addRow}>+ Add medicine</button>

          <h3 style={{ marginTop: 22 }}>Procedures</h3>
          <div className="form-grid">
            <div className="field"><label>Procedure</label><input type="text" placeholder="e.g. Blood test — Fasting" /></div>
            <div className="field"><label>Instructions</label><input type="text" placeholder="e.g. Fasting required" /></div>
          </div>
        </div>
        <div className="card">
          <h3>Notes for pharmacist</h3>
          <textarea placeholder="Any special instructions..." style={{ marginBottom: 16 }} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn" onClick={() => navigate('dashboard')}>Cancel</button>
            <button className="btn btn-accent" onClick={savePrescription}>Save prescription</button>
          </div>
        </div>
      </div>
    </>
  );
}
