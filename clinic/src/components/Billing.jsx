import React, { useState } from 'react';
import { useApp } from '../AppContext.jsx';

const today = () => new Date().toISOString().slice(0, 10);

export default function Billing() {
  const { patients, navigate } = useApp();
  const [patientId, setPatientId] = useState(patients[0]?._id || '');
  const patient = patients.find((p) => p._id === patientId);

  return (
    <>
      <div className="page-head">
        <div><h1>Billing</h1><div className="desc">Issue a bill, or admit a patient to an IP room</div></div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="field" style={{ maxWidth: 360 }}>
          <label>Patient</label>
          <select value={patientId} onChange={(e) => setPatientId(e.target.value)}>
            {patients.map((p) => <option key={p._id} value={p._id}>{p.name} — {p.id}</option>)}
          </select>
        </div>
      </div>

      <div className="grid-2">
        <IssueBillCard patient={patient} onDone={() => navigate('payments')} />
        <AdmissionCard patient={patient} onDone={() => navigate('admissions')} />
      </div>
    </>
  );
}

function IssueBillCard({ patient, onDone }) {
  const { createBill, showToast } = useApp();
  const [items, setItems] = useState([{ desc: 'Consultation fee', amount: 500 }]);
  const [submitting, setSubmitting] = useState(false);

  const updateItem = (i, field, val) => setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, [field]: val } : it)));
  const addItem = () => setItems((prev) => [...prev, { desc: '', amount: 0 }]);
  const removeItem = (i) => setItems((prev) => prev.filter((_, idx) => idx !== i));
  const total = items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);

  const submit = async () => {
    if (!patient) return;
    const valid = items.filter((it) => it.desc && Number(it.amount) > 0);
    if (valid.length === 0) { showToast('Add at least one charge with a description and amount'); return; }
    setSubmitting(true);
    await createBill(patient._id, valid.map((it) => ({ desc: it.desc, amount: Number(it.amount) })));
    setSubmitting(false);
    onDone();
  };

  return (
    <div className="card">
      <h3>Issue bill</h3>
      <table className="bill-table">
        <tbody>
          <tr><th>Item</th><th>Amount</th><th></th></tr>
          {items.map((it, i) => (
            <tr key={i}>
              <td><input type="text" value={it.desc} onChange={(e) => updateItem(i, 'desc', e.target.value)} placeholder="e.g. Blood test — CBC" /></td>
              <td style={{ width: 110 }}><input type="number" value={it.amount} onChange={(e) => updateItem(i, 'amount', e.target.value)} /></td>
              <td>{items.length > 1 && <button className="btn btn-sm" onClick={() => removeItem(i)}>✕</button>}</td>
            </tr>
          ))}
          <tr className="bill-total-row"><td colSpan={2}>Total</td><td>₹{total}</td></tr>
        </tbody>
      </table>
      <button className="btn btn-sm" style={{ marginTop: 10 }} onClick={addItem}>+ Add item</button>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
        <button className="btn btn-accent" disabled={!patient || submitting} onClick={submit}>
          {submitting ? 'Issuing…' : 'Issue bill'}
        </button>
      </div>
    </div>
  );
}

function AdmissionCard({ patient, onDone }) {
  const { rooms, admitPatient, showToast } = useApp();
  const availableRooms = rooms.filter((r) => r.status === 'available');
  const [roomId, setRoomId] = useState(availableRooms[0]?._id || '');
  const [fromDate, setFromDate] = useState(today());
  const [submitting, setSubmitting] = useState(false);
  const room = rooms.find((r) => r._id === roomId);

  const submit = async () => {
    if (!patient || !roomId) return;
    if (patient.admitted) { showToast(`${patient.name} is already admitted`); return; }
    setSubmitting(true);
    await admitPatient({ patientId: patient._id, patientIdCustom: patient.id, roomId, roomNumber: room?.roomNumber, fromDate });
    setSubmitting(false);
    onDone();
  };

  return (
    <div className="card">
      <h3>Admission</h3>
      {patient?.admitted ? (
        <div className="login-info">
          {patient.name} is already admitted — Room {patient.room}. Discharge them from the Admissions page before
          starting a new admission.
        </div>
      ) : (
        <>
          <div className="field">
            <label>Room</label>
            <select value={roomId} onChange={(e) => setRoomId(e.target.value)} disabled={availableRooms.length === 0}>
              {availableRooms.length === 0 && <option>No rooms currently available</option>}
              {availableRooms.map((r) => <option key={r._id} value={r._id}>{r.roomNumber} — ₹{r.perNightCost}/night</option>)}
            </select>
          </div>
          <div className="field">
            <label>From date</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <p className="split-note">
            Room rent isn't billed now — it's calculated automatically (nights × per-night cost) and billed when
            the patient is discharged, from the Admissions page.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
            <button className="btn btn-accent" disabled={!patient || !roomId || submitting} onClick={submit}>
              {submitting ? 'Admitting…' : 'Admit patient'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
