import React, { useMemo, useState } from 'react';
import { useApp } from '../AppContext.jsx';
import { normalizePrescriptionMeds } from '../utils/prescriptionUtils.js';

export default function Prescription() {
  const { navigate, savePrescription, patients, consultationPatientId, userName, medicines, procedures } = useApp();
  const patient = useMemo(() => {
    if (consultationPatientId) return patients.find((p) => p._id === consultationPatientId) || patients[0] || null;
    return patients[0] || null;
  }, [consultationPatientId, patients]);

  const availableMedicines = useMemo(
    () => (Array.isArray(medicines) ? medicines.filter((m) => String(m?.status || 'Active') === 'Active') : []),
    [medicines],
  );
  const availableProcedures = useMemo(
    () => (Array.isArray(procedures) ? procedures.filter((p) => String(p?.status || 'Active') === 'Active') : []),
    [procedures],
  );

  const [meds, setMeds] = useState([{ name: '', dosage: '' }]);
  const [procedureRows, setProcedureRows] = useState([{ name: '', instructions: '' }]);
  const [notes, setNotes] = useState('');

  const addMedicineRow = () => setMeds((m) => [...m, { name: '', dosage: '' }]);
  const updateMedicineRow = (i, field, value) => setMeds((m) => m.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));
  const addProcedureRow = () => setProcedureRows((p) => [...p, { name: '', instructions: '' }]);
  const updateProcedureRow = (i, field, value) => setProcedureRows((p) => p.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));

  if (!patient) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
        Select a patient before prescribing medicines or procedures.
      </div>
    );
  }

  const save = async () => {
    const result = await savePrescription({ medicines: meds, procedures: procedureRows, notes, doctorName: userName || 'Doctor' });
    if (result) {
      setMeds([{ name: '', dosage: '' }]);
      setProcedureRows([{ name: '', instructions: '' }]);
      setNotes('');
    }
  };

  const normalizedMeds = normalizePrescriptionMeds(meds);

  return (
    <>
      <div className="page-head">
        <div><h1>Add prescription</h1><div className="desc">Patient: {patient.name} &nbsp;•&nbsp; Age {patient.age} &nbsp;•&nbsp; Type {patient.type}</div></div>
      </div>
      <div className="grid-2">
        <div className="card">
          <h3>Medicines</h3>
          {meds.map((row, i) => (
            <div className="form-grid" style={{ marginBottom: 8 }} key={i}>
              <div className="field" style={{ marginBottom: 0 }}>
                <select value={row.name} onChange={(e) => updateMedicineRow(i, 'name', e.target.value)}>
                  <option value="">Select medicine</option>
                  {availableMedicines.map((medicine) => (
                    <option key={medicine._id || medicine.id} value={medicine.name}>
                      {medicine.name}{medicine.scientificName ? ` — ${medicine.scientificName}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <input type="text" value={row.dosage} placeholder="Dosage e.g. 1-0-1" onChange={(e) => updateMedicineRow(i, 'dosage', e.target.value)} />
              </div>
            </div>
          ))}
          <button className="btn btn-sm" style={{ marginTop: 6 }} onClick={addMedicineRow}>+ Add medicine</button>

          <h3 style={{ marginTop: 22 }}>Procedures</h3>
          {procedureRows.map((row, i) => (
            <div className="form-grid" style={{ marginBottom: 8 }} key={i}>
              <div className="field" style={{ marginBottom: 0 }}>
                <select value={row.name} onChange={(e) => updateProcedureRow(i, 'name', e.target.value)}>
                  <option value="">Select procedure</option>
                  {availableProcedures.map((procedure) => (
                    <option key={procedure._id || procedure.id} value={procedure.name}>
                      {procedure.name}{procedure.description ? ` — ${procedure.description}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <input type="text" value={row.instructions} placeholder="Instructions" onChange={(e) => updateProcedureRow(i, 'instructions', e.target.value)} />
              </div>
            </div>
          ))}
          <button className="btn btn-sm" style={{ marginTop: 6 }} onClick={addProcedureRow}>+ Add procedure</button>
        </div>
        <div className="card">
          <h3>Notes for pharmacist</h3>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special instructions..." style={{ marginBottom: 16 }} />

          {(patient.prescriptions || []).length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ margin: '0 0 8px' }}>Previously prescribed</h3>
              {(patient.prescriptions || []).slice(0, 3).map((entry, idx) => (
                <div key={idx} style={{ marginBottom: 12, border: '1px solid var(--line)', borderRadius: 10, padding: 10 }}>
                  <div style={{ fontWeight: 700 }}>{entry.doctorName}</div>
                  <div>{(entry.medicines || []).map((m) => `${m.name} (${m.dosage})`).join(', ') || '—'}</div>
                  {entry.notes && <div style={{ color: 'var(--muted)', marginTop: 4 }}>{entry.notes}</div>}
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn" onClick={() => navigate('dashboard')}>Cancel</button>
            <button className="btn btn-accent" onClick={save} disabled={normalizedMeds.length === 0 && !notes && procedureRows.every((row) => !row.name && !row.instructions)}>
              Save prescription
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
