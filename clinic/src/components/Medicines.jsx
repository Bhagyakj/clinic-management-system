import React, { useState } from 'react';
import { useApp } from '../AppContext.jsx';

export default function Medicines() {
  const { role, medicines, addMedicine, updateMedicine, toggleMedicineStatus, showToast } = useApp();
  const canEdit = role === 'manager';
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', scientificName: '', unitCost: '', quantity: '' });

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const submit = (e) => {
    e.preventDefault();
    if (!form.name) return;
    addMedicine(form);
    setForm({ name: '', scientificName: '', unitCost: '', quantity: '' });
    setShowForm(false);
  };

  return (
    <>
      <div className="page-head">
        <div><h1>Medicines</h1><div className="desc">{canEdit ? 'Add, edit rates/quantities, or archive medicines' : 'Current medicine stock and rates'}</div></div>
        {canEdit && <button className="btn btn-accent" onClick={() => setShowForm((s) => !s)}>{showForm ? 'Cancel' : '+ Add medicine'}</button>}
      </div>

      {canEdit && showForm && (
        <form className="card" style={{ marginBottom: 16 }} onSubmit={submit}>
          <h3>Add medicine</h3>
          <div className="form-grid cols-3">
            <div className="field"><label>Name</label><input type="text" value={form.name} onChange={set('name')} placeholder="e.g. Ibuprofen 400mg" /></div>
            <div className="field"><label>Scientific name</label><input type="text" value={form.scientificName} onChange={set('scientificName')} placeholder="e.g. Ibuprofen" /></div>
            <div className="field"><label>Unit cost (₹)</label><input type="number" value={form.unitCost} onChange={set('unitCost')} placeholder="e.g. 5" /></div>
            <div className="field"><label>Available quantity</label><input type="number" value={form.quantity} onChange={set('quantity')} placeholder="e.g. 100" /></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="btn btn-accent">Add medicine</button>
          </div>
        </form>
      )}

      <div className="card">
        <table>
          <tbody>
            <tr><th>ID</th><th>Name</th><th>Scientific name</th><th>Unit cost</th><th>Quantity</th><th>Status</th>{canEdit && <th></th>}</tr>
            {medicines.map((m) => (
              <tr key={m.id}>
                <td>{m.id}</td>
                <td style={{ fontWeight: 600 }}>{m.name}</td>
                <td>{m.scientificName}</td>
                <td>
                  {canEdit
                    ? <input type="number" defaultValue={m.unitCost} style={{ width: 80, padding: '5px 8px' }} onBlur={(e) => updateMedicine(m.id, { unitCost: Number(e.target.value) })} />
                    : `₹${m.unitCost}`}
                </td>
                <td>
                  {canEdit
                    ? <input type="number" defaultValue={m.quantity} style={{ width: 90, padding: '5px 8px' }} onBlur={(e) => updateMedicine(m.id, { quantity: Number(e.target.value) })} />
                    : m.quantity}
                </td>
                <td><span className={`badge ${m.status === 'Active' ? 'stable' : 'pending'}`}>{m.status}</span></td>
                {canEdit && (
                  <td><button className="btn btn-sm" onClick={() => toggleMedicineStatus(m.id)}>{m.status === 'Active' ? 'Archive' : 'Reactivate'}</button></td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
