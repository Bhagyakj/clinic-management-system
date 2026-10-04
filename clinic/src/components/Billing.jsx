import React, { useState } from 'react';
import { useApp } from '../AppContext.jsx';

export default function Billing() {
  const { patients, rooms, navigate, issueBill } = useApp();
  const availableRooms = rooms.filter((r) => r.status === 'Available');
  const [patientId, setPatientId] = useState(patients[0]?.id);
  const [admissionYes, setAdmissionYes] = useState(false); // default: No
  const [admissionDays, setAdmissionDays] = useState(1);
  const defaultRoom = availableRooms[0]?.name || rooms.find((r) => r.status === 'Occupied')?.name || '';
  const [room, setRoom] = useState(defaultRoom);

  const selectedRoom = rooms.find((r) => r.name === room) || null;
  const roomRate = selectedRoom ? Number(selectedRoom.perNightCost || 0) : 0;
  const roomCharge = admissionYes && selectedRoom ? roomRate * Math.max(1, Number(admissionDays || 1)) : 0;
  const roomOptions = rooms.map((r) => ({
    ...r,
    label: r.status === 'Available'
      ? `${r.name} — ₹${r.perNightCost}/night`
      : `${r.name} — Allocated`,
    disabled: r.status !== 'Available' && r.name !== room,
  }));

  const handleIssue = () => {
    const finalRoom = admissionYes ? room : null;
    const finalAmount = admissionYes && finalRoom ? roomCharge : 890;
    issueBill({
      patientId,
      admissionYes,
      admissionDays: admissionYes ? Number(admissionDays) : null,
      room: finalRoom,
      amount: finalAmount,
    });
    navigate('payments');
  };

  return (
    <>
      <div className="page-head">
        <div><h1>Issue bill</h1><div className="desc">Create and issue a bill for a patient visit</div></div>
      </div>
      <div className="grid-2">
        <div className="card">
          <h3>Bill details</h3>
          <div className="form-grid">
            <div className="field">
              <label>Patient</label>
              <select value={patientId} onChange={(e) => setPatientId(e.target.value)}>
                {patients.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.id}</option>)}
              </select>
            </div>
            <div className="field"><label>Doctor</label><select><option>Dr. Mehta</option><option>Dr. Patel</option></select></div>
          </div>
          <table className="bill-table">
            <tbody>
              <tr><th>Item</th><th>Qty</th><th>Price</th><th>Amount</th></tr>
              <tr><td>Consultation fee</td><td>1</td><td>₹500</td><td>₹500</td></tr>
              <tr><td>Blood test — CBC</td><td>1</td><td>₹350</td><td>₹350</td></tr>
              <tr><td>Paracetamol 500mg (10)</td><td>1</td><td>₹40</td><td>₹40</td></tr>
              <tr className="bill-total-row"><td colSpan={3}>Total</td><td>₹890</td></tr>
            </tbody>
          </table>
        </div>
        <div className="card">
          <h3>Admission</h3>
          <div className="field">
            <label>Admission required?</label>
            <div className="seg">
              <button className={!admissionYes ? 'on' : ''} onClick={() => setAdmissionYes(false)}>No</button>
              <button className={admissionYes ? 'on' : ''} onClick={() => setAdmissionYes(true)}>Yes</button>
            </div>
          </div>
          {admissionYes && (
            <div className="field">
              <label>Admission days</label>
              <input type="number" min={1} value={admissionDays} onChange={(e) => setAdmissionDays(e.target.value)} />
            </div>
          )}
          <div className="field">
            <label>Room (if admitted)</label>
            <select disabled={!admissionYes} value={room} onChange={(e) => setRoom(e.target.value)}>
              {!admissionYes && <option>— Not applicable —</option>}
              {!admissionYes && <option value="">— Not applicable —</option>}
              {admissionYes && roomOptions.length === 0 && <option>No rooms available</option>}
              {admissionYes && roomOptions.map((r) => (
                <option key={r.id} value={r.name} disabled={r.disabled}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          {admissionYes && selectedRoom && (
            <div className="card" style={{ marginTop: 12, padding: '12px 14px', background: 'var(--surface)' }}>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>Room charge</div>
              <div style={{ fontWeight: 700 }}>
                {selectedRoom.status === 'Available'
                  ? `${selectedRoom.name} • ₹${selectedRoom.perNightCost} × ${admissionDays} day(s) = ₹${roomCharge}`
                  : `${selectedRoom.name} • Allocated • ₹${selectedRoom.perNightCost} × ${admissionDays} day(s) = ₹${roomCharge}`}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button className="btn" onClick={() => navigate('dashboard')}>Cancel</button>
            <button className="btn btn-accent" onClick={handleIssue}>Issue bill</button>
          </div>
        </div>
      </div>
    </>
  );
}
