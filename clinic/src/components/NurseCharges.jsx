import React, { useMemo, useState } from 'react';
import { useApp } from '../AppContext.jsx';

export default function NurseCharges() {
  const { patients, role, addNurseCharge, convertPendingNurseCharges, showToast } = useApp();
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [category, setCategory] = useState('Medicine');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const patient = useMemo(
    () => (patients || []).find((p) => String(p._id) === String(selectedPatientId)) || null,
    [patients, selectedPatientId],
  );

  const pendingCharges = useMemo(() => {
    if (!patient) return [];
    return Array.isArray(patient.nurseCharges) ? patient.nurseCharges : [];
  }, [patient]);

  const submitCharge = async () => {
    if (!patient || !description.trim() || !amount || Number(amount) <= 0) {
      showToast('Select a patient, add a charge description, and enter a valid amount.');
      return;
    }

    try {
      const res = await addNurseCharge(patient.id, {
        category,
        description: description.trim(),
        amount: Number(amount),
        note: note.trim(),
      });
      if (res) {
        setDescription('');
        setAmount('');
        setNote('');
        setCategory('Medicine');
        showToast('Charge added to patient account.');
      }
    } catch (err) {
      showToast(err?.message || 'Could not add charge.');
    }
  };

  const convertCharges = async () => {
    if (!patient || pendingCharges.length === 0) {
      showToast('There are no pending nurse charges for this patient.');
      return;
    }

    try {
      const res = await convertPendingNurseCharges(patient.id);
      if (res) {
        showToast(`Converted ${res.clearedChargeCount} nurse charges into a pending bill.`);
        setSelectedPatientId('');
      }
    } catch (err) {
      showToast(err?.message || 'Could not convert charges into a bill.');
    }
  };

  if (role !== 'nurse') {
    return null;
  }

  return (
    <>
      <div className="page-head">
        <div><h1>IP Nurse Charges</h1><div className="desc">Add medicine/procedure charges for patients under your room assignment</div></div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>Choose patient</h3>
          <div className="field">
            <label>Patient</label>
            <select value={selectedPatientId} onChange={(e) => setSelectedPatientId(e.target.value)}>
              <option value="">Select admitted patient</option>
              {(patients || []).filter((p) => p.admitted).map((p) => (
                <option key={p._id} value={p._id}>{p.name} ({p.id}) — Room {p.room || '—'}</option>
              ))}
            </select>
          </div>

          {patient && (
            <>
              <div className="form-grid cols-2" style={{ marginTop: 16 }}>
                <div className="field">
                  <label>Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option>Medicine</option>
                    <option>Procedure</option>
                    <option>Consumable</option>
                    <option>Room Add-on</option>
                  </select>
                </div>
                <div className="field">
                  <label>Amount</label>
                  <input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="₹ amount" />
                </div>
              </div>

              <div className="field">
                <label>Charge description</label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. IV Antibiotic / Dressing / Nebulizer" />
              </div>

              <div className="field">
                <label>Note</label>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Short note for the billing record" />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="btn btn-accent" onClick={submitCharge}>Add charge</button>
              </div>
            </>
          )}
        </div>

        <div className="card">
          <h3>Pending charges</h3>
          {!patient ? (
            <div className="popup-empty">Select a patient to view or convert pending charges.</div>
          ) : pendingCharges.length === 0 ? (
            <div className="popup-empty">No pending nurse charges for this patient.</div>
          ) : (
            <>
              <table>
                <tbody>
                  <tr><th>Type</th><th>Item</th><th>Amount</th><th>Note</th></tr>
                  {pendingCharges.map((charge, index) => (
                    <tr key={`${charge.createdAt || index}`}>
                      <td>{charge.category}</td>
                      <td>{charge.description}</td>
                      <td>₹{Number(charge.amount || 0)}</td>
                      <td>{charge.note || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-accent" onClick={convertCharges}>Convert to bill</button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
